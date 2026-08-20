import { getAllCategory } from "@/src/db/repository/category";
import { ingestDetectedTransaction } from "@/src/services/detectedTransactionService";
import { categoryCandidate } from "./categoryRules";
import { parsePaymentNotification, type NotificationInput } from "./parser";

export async function captureNotification(input: NotificationInput) {
  const candidate = parsePaymentNotification(input);
  if (!candidate) return null;
  const suggested = categoryCandidate(candidate.merchant, candidate.type);
  const categories = suggested ? await getAllCategory() : [];
  const category = candidate.type === "transfer" ? null : categories.find((item: any) => item.name === suggested?.name && item.type === candidate.type);
  return ingestDetectedTransaction({ ...candidate, categoryId: suggested && suggested.confidence >= 0.85 ? category?.id ?? null : null, accountId: null, duplicateOf: null, note: null });
}

export async function captureShortcutPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  const amount = Number(value.amount);
  const transactionType = value.type === "income" || value.type === "expense" ? value.type : null;
  if (!Number.isFinite(amount) || amount <= 0 || !transactionType) return null;
  return ingestDetectedTransaction({ source: String(value.source || "ios_shortcut"), sourceApp: "Shortcuts", sourcePackage: null, rawText: String(value.rawText || ""), merchant: value.merchant ? String(value.merchant) : null, amount, type: transactionType, transactionDate: Number(value.transactionDate) || Date.now(), accountId: value.accountId ? String(value.accountId) : null, categoryId: value.categoryId ? String(value.categoryId) : null, referenceId: value.referenceId ? String(value.referenceId) : null, accountHint: null, upiHandle: null, parser: "shortcutPayload", parserVersion: "1.0", confidence: 0.75, duplicateOf: null, note: value.note ? String(value.note) : null });
}
