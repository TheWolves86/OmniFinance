import type { DetectedTransactionType } from "@/src/types/models";

export type NotificationInput = { packageName?: string; appName?: string; title?: string; text?: string; timestamp?: number; key?: string };
export type ParsedCandidate = { source: string; sourcePackage?: string; sourceApp?: string; rawText: string; merchant?: string; amount: number; type: DetectedTransactionType; transactionDate: number; referenceId?: string; accountHint?: string; upiHandle?: string; parser: string; parserVersion: string; confidence: number };

const sourceMap: Record<string, string> = { "com.google.android.apps.walletnfcrel": "google_pay", "com.google.android.apps.nbu.paisa.user": "google_pay", "com.phonepe.app": "phonepe", "net.one97.paytm": "paytm", "com.samsung.android.spay": "samsung_wallet" };
const money = (s: string) => { const m = s.match(new RegExp("(?:\\u20b9|rs\\.?|inr\\s*)\\s*([\\d,]+(?:\\.\\d{1,2})?)", "i")); return m ? Number(m[1].replace(/,/g, "")) : null; };
const cleanMerchant = (s: string) => s.replace(/\b(using|via|with|from|to|on|for)\b.*$/i, "").replace(/[^\w &'&.-]/g, "").trim() || undefined;

export function parsePaymentNotification(input: NotificationInput): ParsedCandidate | null {
  const source = sourceMap[input.packageName ?? ""];
  if (!source) return null;
  const rawText = [input.title, input.text].filter(Boolean).join(" - ").trim();
  const amount = money(rawText);
  if (!rawText || amount === null || amount <= 0) return null;
  const lower = rawText.toLowerCase();
  const isTransfer = /transferred|transfer to|transfer from/.test(lower);
  const isIncome = /received|credited|refund|cashback/.test(lower);
  const type: DetectedTransactionType = isTransfer ? "transfer" : isIncome ? "income" : "expense";
  const direction = isIncome ? /(?:from|by)\s+(.+?)(?:\s+(?:on|via|using)\b|$)/i : /(?:to|at)\s+(.+?)(?:\s+(?:using|via|on)\b|$)/i;
  const directionMatch = direction.exec(rawText);
  const merchant = directionMatch?.[1] ? cleanMerchant(directionMatch[1]) : undefined;
  const referenceId = rawText.match(/(?:upi|ref(?:erence)?|txn(?:\s*id)?)\s*[:#-]?\s*([A-Z0-9]{6,})/i)?.[1];
  const upiHandle = rawText.match(/[\w.-]+@[\w.-]+/)?.[0];
  return { source: isTransfer ? `${source}_transfer` : source, sourcePackage: input.packageName, sourceApp: input.appName, rawText, merchant, amount, type, transactionDate: input.timestamp ?? Date.now(), referenceId, upiHandle, parser: `${source}NotificationParser`, parserVersion: "1.0", confidence: referenceId ? 0.96 : merchant ? 0.82 : 0.65 };
}
