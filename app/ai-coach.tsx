import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { runCoachTurn, confirmCoachAction } from "@/src/ai/coachService";
import type { ChatMessage } from "@/src/ai/providers";
import type { PendingAction } from "@/src/ai/tools";

type Message = ChatMessage & { id: string; pendingAction?: PendingAction };
const quickPrompts = ["How can I save more?", "Summarize this month", "Where did my money go?", "Upcoming bills", "My goals"];

export default function AICoachScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", content: "Hi! I’m your OmniFinance Coach. Ask me about your spending, balances, goals, bills, or budgets." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const send = async (value = input) => {
    const text = value.trim();
    if (!text || loading) return;
    const user: Message = { id: Date.now().toString(), role: "user", content: text };
    setInput(""); setError(null); setLoading(true); setMessages((current) => [...current, user]);
    try {
      const result = await runCoachTurn([...messages, user].map(({ role, content }) => ({ role, content })));
      setMessages((current) => [...current, { id: Date.now().toString() + "-assistant", role: "assistant", content: result.text, pendingAction: result.pendingAction }]);
      setPending(result.pendingAction ?? null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The AI Coach could not respond."); }
    finally { setLoading(false); setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50); }
  };
  const confirm = async () => {
    if (!pending) return;
    setLoading(true);
    try { await confirmCoachAction(pending); setPending(null); setMessages((current) => [...current, { id: Date.now().toString(), role: "assistant", content: "Done — the change succeeded and OmniFinance has been refreshed." }]); }
    catch (cause) { Alert.alert("Action failed", cause instanceof Error ? cause.message : "The change could not be completed."); }
    finally { setLoading(false); }
  };
  const data = useMemo(() => messages, [messages]);
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
      <View style={styles.header}><Pressable style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={18} color="#0B1D3A" /></Pressable><Text style={styles.brand}>OmniFinance</Text><View style={styles.headerActions}><Pressable style={styles.iconButton} onPress={() => router.push("/notifications")}><Ionicons name="notifications-outline" size={19} color="#0B1D3A" /></Pressable><Pressable style={styles.iconButton} onPress={() => router.push("/ai-settings")}><Ionicons name="settings-outline" size={19} color="#0B1D3A" /></Pressable></View></View>
      <FlatList ref={listRef} data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })} renderItem={({ item }) => <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}><Text style={item.role === "user" ? styles.userText : styles.aiText}>{item.content}</Text></View>} ListFooterComponent={loading ? <View style={styles.typing}><ActivityIndicator size="small" color="#0B1D3A" /><Text style={styles.typingText}>Coach is checking your data…</Text></View> : null} />
      {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={() => void send()}><Text style={styles.retry}>Retry</Text></Pressable></View>}
      {pending && <View style={styles.confirmCard}><Text style={styles.confirmTitle}>{pending.summary}</Text><View style={styles.confirmRow}><Pressable style={styles.cancelButton} onPress={() => setPending(null)}><Text>Cancel</Text></Pressable><Pressable style={styles.confirmButton} onPress={() => void confirm()}><Text style={styles.confirmText}>Confirm</Text></Pressable></View></View>}
      {!pending && <FlatList horizontal data={quickPrompts} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={() => void send(item)}><Text style={styles.chipText}>{item}</Text></Pressable>} />}
      <View style={styles.inputRow}><TextInput value={input} onChangeText={setInput} placeholder="Ask your AI Coach…" placeholderTextColor="#9CA3AF" style={styles.input} multiline maxLength={2000} editable={!loading} /><Pressable disabled={!input.trim() || loading} style={[styles.send, (!input.trim() || loading) && styles.sendDisabled]} onPress={() => void send()}><Ionicons name="arrow-up" size={20} color="#FFFFFF" /></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  backButton: { width: 52, paddingVertical: 8 }, headerActions: { width: 52, flexDirection: "row", justifyContent: "flex-end" },
  safe: { flex: 1, backgroundColor: "#F8F9FB" }, screen: { flex: 1, paddingHorizontal: 20 }, header: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, paddingBottom: 14 }, brand: { fontSize: 18, fontWeight: "700", color: "#0B1D3A" }, title: { marginTop: 18, fontSize: 34, fontWeight: "800", color: "#0B1D3A" }, subtitle: { marginTop: 4, color: "#7B8190" }, iconButton: { padding: 8 }, messages: { paddingVertical: 10, gap: 12 }, bubble: { maxWidth: "86%", borderRadius: 18, padding: 14 }, aiBubble: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderBottomLeftRadius: 5 }, userBubble: { alignSelf: "flex-end", backgroundColor: "#0B1D3A", borderBottomRightRadius: 5 }, aiText: { color: "#0B1D3A", lineHeight: 21 }, userText: { color: "#FFFFFF", lineHeight: 21 }, typing: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }, typingText: { color: "#7B8190", fontSize: 12 }, chips: { gap: 8, paddingVertical: 8 }, chip: { backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 }, pressed: { opacity: 0.65 }, chipText: { color: "#0B1D3A", fontSize: 12, fontWeight: "600" }, inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingTop: 8, paddingBottom: 8 }, input: { flex: 1, maxHeight: 110, minHeight: 48, backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12, color: "#0B1D3A" }, send: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#0B1D3A", alignItems: "center", justifyContent: "center" }, sendDisabled: { opacity: 0.35 }, error: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#FDECEC", borderRadius: 10 }, errorText: { flex: 1, color: "#B42318", fontSize: 12 }, retry: { color: "#0B1D3A", fontWeight: "700" }, confirmCard: { backgroundColor: "#FFF8E1", borderRadius: 14, padding: 13 }, confirmTitle: { color: "#6B4E00", fontWeight: "700" }, confirmRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 }, cancelButton: { padding: 9 }, confirmButton: { backgroundColor: "#0B1D3A", paddingHorizontal: 15, paddingVertical: 9, borderRadius: 9 }, confirmText: { color: "#FFFFFF", fontWeight: "700" },
});
