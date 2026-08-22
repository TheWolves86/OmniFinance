import { getItem } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/constants/storageKeys";

export type AIProviderName = "gemini" | "anthropic" | "openai" | "xai";
export type ChatMessage = { role: "system" | "user" | "assistant" | "tool"; content: string; name?: string; toolCallId?: string };
export type ToolCall = { id: string; name: string; arguments: Record<string, unknown> };
export type ProviderResponse = { text: string; toolCalls: ToolCall[] };
export type ProviderRequest = { messages: ChatMessage[]; tools: unknown[]; model?: string };

const keyByProvider: Record<AIProviderName, string> = { gemini: STORAGE_KEYS.AI_API_KEY_GEMINI, anthropic: STORAGE_KEYS.AI_API_KEY_ANTHROPIC, openai: STORAGE_KEYS.AI_API_KEY_OPENAI, xai: STORAGE_KEYS.AI_API_KEY_XAI };
const defaultModels: Record<AIProviderName, string> = { gemini: "gemini-2.5-flash", anthropic: "claude-sonnet-4-6", openai: "gpt-5-mini", xai: "grok-4.5" };

async function request(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const body = await response.text();
    let parsed: any = null;
    try { parsed = body ? JSON.parse(body) : null; } catch { /* provider returned non-JSON */ }
    if (!response.ok) throw new Error(parsed?.error?.message || parsed?.message || "Provider request failed (" + response.status + ")");
    return parsed;
  } finally { clearTimeout(timer); }
}
function toolList(tools: any[]) { return tools.map((tool) => ({ type: "function", function: tool })); }
function parseOpenAI(data: any): ProviderResponse {
  const message = data?.choices?.[0]?.message ?? {};
  return { text: message.content || "", toolCalls: (message.tool_calls || []).map((call: any) => ({ id: call.id || call.function.name, name: call.function.name, arguments: JSON.parse(call.function.arguments || "{}") })) };
}
async function openAICompatible(provider: "openai" | "xai", input: ProviderRequest, key: string): Promise<ProviderResponse> {
  const base = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
  const formattedMessages = input.messages.map((item) => {
    if (item.role === "tool") {
      return { role: "tool", content: item.content, tool_call_id: item.toolCallId || item.name || "call_default" };
    }
    return { role: item.role, content: item.content };
  });
  const data = await request(base, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify({ model: input.model || defaultModels[provider], messages: formattedMessages, tools: toolList(input.tools), tool_choice: "auto", temperature: 0.2 }) });
  return parseOpenAI(data);
}
async function anthropic(input: ProviderRequest, key: string): Promise<ProviderResponse> {
  const system = input.messages.find((item) => item.role === "system")?.content;
  const messages = input.messages.filter((item) => item.role !== "system").map((item) => {
    if (item.role === "tool") {
      return { role: "user", content: [{ type: "tool_result", tool_use_id: item.toolCallId || "tool_default", content: item.content }] };
    }
    return { role: item.role, content: item.content };
  });
  const data = await request("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: input.model || defaultModels.anthropic, max_tokens: 1200, system, messages, tools: input.tools.map((tool: any) => ({ name: tool.name, description: tool.description, input_schema: tool.parameters, strict: true })) }) });
  return { text: (data?.content || []).filter((part: any) => part.type === "text").map((part: any) => part.text).join(""), toolCalls: (data?.content || []).filter((part: any) => part.type === "tool_use").map((part: any) => ({ id: part.id, name: part.name, arguments: part.input || {} })) };
}
async function gemini(input: ProviderRequest, key: string): Promise<ProviderResponse> {
  const system = input.messages.find((item) => item.role === "system")?.content;
  const contents = input.messages.filter((item) => item.role !== "system").map((item) => {
    if (item.role === "tool") {
      let responseObj = { content: item.content };
      try { responseObj = JSON.parse(item.content); } catch { /* text fallback */ }
      return { role: "user", parts: [{ functionResponse: { name: item.name || "tool", response: responseObj } }] };
    }
    return { role: item.role === "assistant" ? "model" : "user", parts: [{ text: item.content }] };
  });
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + (input.model || defaultModels.gemini) + ":generateContent";
  const data = await request(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ systemInstruction: system ? { parts: [{ text: system }] } : undefined, contents, tools: [{ functionDeclarations: input.tools.map((tool: any) => ({ name: tool.name, description: tool.description, parameters: tool.parameters })) }] }) });
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return { text: parts.filter((part: any) => part.text).map((part: any) => part.text).join(""), toolCalls: parts.filter((part: any) => part.functionCall).map((part: any, index: number) => ({ id: "gemini-" + index, name: part.functionCall.name, arguments: part.functionCall.args || {} })) };
}
export async function getProvider(name: AIProviderName) {
  const key = await getItem(keyByProvider[name]) || (name === "gemini" ? await getItem(STORAGE_KEYS.API_KEY) : null);
  if (!key) throw new Error("No API key configured for " + name + ". Add one in AI settings.");
  return { name, key };
}
export async function sendToProvider(name: AIProviderName, input: ProviderRequest) {
  const configured = await getProvider(name);
  if (name === "gemini") return gemini(input, configured.key);
  if (name === "anthropic") return anthropic(input, configured.key);
  return openAICompatible(name, input, configured.key);
}
