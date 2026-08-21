import { db } from "@/src/db";
import { createDetectedTransaction, findDetectedDuplicate, getDetectedById, updateDetectedTransaction } from "@/src/db/repository/detectedTransaction";
import { addTransactionInTransaction } from "@/src/services/transactionService";
import { createTransfer } from "@/src/db/repository/transfer";
import { getAccountById, updateBalance } from "@/src/db/repository/account";
import { getCategoryById } from "@/src/db/repository/category";
import { emitTransactionChanged } from "@/src/components/transactionSheetController";
import { emitAccountChanged } from "@/src/components/accountSheetController";
import { publishNotification } from "@/src/services/notificationService";
import type { DetectedTransaction } from "@/src/types/models";

export async function ingestDetectedTransaction(data: Omit<DetectedTransaction, "id" | "createdAt" | "updatedAt" | "categoryName" | "status">) {
  const duplicate = await findDetectedDuplicate(data);
  if (duplicate && duplicate.confidence >= 0.95) return { duplicate: true, id: duplicate.id };
  const id = await createDetectedTransaction({ ...data, duplicateOf: duplicate?.id ?? data.duplicateOf, status: duplicate ? "duplicate" : "pending" });
  if (!duplicate) void publishNotification({ category: "transactions", title: "New transaction detected", description: (data.merchant || "Payment") + " · ₹" + Number(data.amount).toLocaleString("en-IN"), actionRoute: "/(tabs)/activity", dedupeKey: "detected:" + id }, { notify: true }).catch(() => undefined);
  return { id, duplicate: Boolean(duplicate) };
}

export async function approveDetectedTransaction(id: string) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const detected = await getDetectedById(id, tx) as DetectedTransaction | null;
    if (!detected) throw new Error("Detected transaction not found");
    if (detected.status !== "pending" && detected.status !== "paused" && detected.status !== "duplicate") throw new Error("This detected transaction is no longer reviewable");
    if (!Number.isFinite(detected.amount) || detected.amount <= 0) throw new Error("Amount must be greater than zero");
    if (detected.type === "transfer") {
      if (!detected.accountId || !detected.transferToAccountId || detected.accountId === detected.transferToAccountId) throw new Error("Select different source and destination accounts before approving");
      const duplicate = await findDetectedDuplicate(detected, tx);
      if (duplicate && duplicate.id !== id && duplicate.confidence >= 0.85) throw new Error("This transaction already exists in the ledger or review queue");
      const from = await getAccountById(detected.accountId, tx);
      const to = await getAccountById(detected.transferToAccountId, tx);
      if (!from || !to) throw new Error("Transfer account not found");
      await createTransfer({ fromAccountId: from.id, toAccountId: to.id, amount: detected.amount, note: detected.note || `Captured from ${detected.source}`, transferDate: detected.transactionDate }, tx);
      await updateBalance(from.id, from.balance - detected.amount, tx);
      await updateBalance(to.id, to.balance + detected.amount, tx);
      await updateDetectedTransaction(id, { status: "approved" }, tx);
      return;
    }
    if (detected.type !== "income" && detected.type !== "expense") throw new Error("Invalid transaction type");
    if (!detected.accountId || !detected.categoryId) throw new Error("Select an account and category before approving");
    const category = await getCategoryById(detected.categoryId, tx) as { type?: string } | null;
    if (!category || category.type !== detected.type) throw new Error("Select a valid category for this transaction type");
    const duplicate = await findDetectedDuplicate({ ...detected, excludeId: id }, tx);
    if (duplicate && duplicate.id !== id && duplicate.confidence >= 0.85) throw new Error("This transaction already exists in the ledger or review queue");
    await addTransactionInTransaction({ title: detected.merchant || "Detected payment", amount: detected.amount, type: detected.type, categoryId: detected.categoryId, accountId: detected.accountId, note: detected.note || `Captured from ${detected.source}`, paymentMethod: detected.source, captureSource: detected.source, captureReferenceId: detected.referenceId || undefined, detectedTransactionId: id, transactionDate: detected.transactionDate }, tx);
    await updateDetectedTransaction(id, { status: "approved" }, tx);
  });
  emitTransactionChanged();
  emitAccountChanged();
}

export async function setDetectedStatus(id: string, status: "paused" | "deleted" | "pending") { await updateDetectedTransaction(id, { status }); emitTransactionChanged(); }
export async function editDetectedTransaction(id: string, data: Partial<DetectedTransaction>) { await updateDetectedTransaction(id, data); emitTransactionChanged(); }
