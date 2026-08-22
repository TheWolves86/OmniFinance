import { db } from "../db";
import { getDueRecurringTransactions, updateRecurring } from "../db/repository/recurring";
import { getTransactionById, createTransaction } from "../db/repository/transaction";
import { getAccountById, updateBalance } from "../db/repository/account";

function calculateNextRun(frequency: string, currentRun: number) {
  const date = new Date(currentRun);
  if (frequency === "daily") date.setDate(date.getDate() + 1);
  else if (frequency === "weekly") date.setDate(date.getDate() + 7);
  else if (frequency === "monthly") date.setMonth(date.getMonth() + 1);
  else if (frequency === "yearly") date.setFullYear(date.getFullYear() + 1);
  return date.getTime();
}

export async function processDueRecurringTransactions() {
  try {
    const dueRecurring = await getDueRecurringTransactions() as any[];
    if (!dueRecurring.length) return;

    for (const recurring of dueRecurring) {
      await db.withExclusiveTransactionAsync(async () => {
        const originalTx = await getTransactionById(recurring.transactionId);
        if (!originalTx) return;

        const account = await getAccountById(originalTx.accountId);
        if (!account) return;

        // Create new transaction instance
        await createTransaction({
          title: originalTx.title,
          amount: originalTx.amount,
          type: originalTx.type,
          categoryId: originalTx.categoryId,
          accountId: originalTx.accountId,
          note: `Recurring: ${originalTx.note || originalTx.title}`,
          paymentMethod: originalTx.paymentMethod || undefined,
          captureSource: "system",
          transactionDate: recurring.nextRun,
        });

        // Update Balance
        const diff = originalTx.type === "income" ? originalTx.amount : -originalTx.amount;
        await updateBalance(account.id, account.balance + diff);

        // Update recurring entry
        const nextRun = calculateNextRun(recurring.frequency, recurring.nextRun);
        await updateRecurring(recurring.id, {
          transactionId: recurring.transactionId,
          frequency: recurring.frequency,
          nextRun,
          lastRun: recurring.nextRun,
          isActive: true
        });

        await import("./notificationService").then(m => m.publishNotification({
          category: "transactions",
          title: "Recurring Transaction Processed",
          description: `₹${originalTx.amount} for ${originalTx.title}`,
          actionRoute: "/(tabs)/activity",
          dedupeKey: `recurring-proc:${recurring.id}:${recurring.nextRun}`
        }, { notify: true }));
      });
    }
  } catch (error) {
    console.error("Failed to process recurring transactions: " + String(error));
  }
}
