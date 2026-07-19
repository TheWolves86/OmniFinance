import { db } from "../db/index"
import { Transactions, Accounts } from "../db/schema"
import { randomUUID } from "expo-crypto"
import { eq } from "drizzle-orm"

type AddTransactionData = {
    title: string;
    amount: number;
    type: string;
    categoryId: string;
    accountId: string;
    note?: string;
    paymentMethod?: string;
    receiptImage?: string;
    tags?: string;
    transactionDate: number;
}


export async function addTransaction(
    data: AddTransactionData
){
    try {
        await db.transaction(async (tx) => {
            const result = await tx.select().from(Accounts).where(eq(Accounts.id, data.accountId));
            const account = result[0] ?? null;

            if (!account) {
                throw new Error("Account not found")
            }

            let newBalance = account.balance

            if (data.type === "income"){
                newBalance += data.amount;
            } else {
                newBalance -= data.amount;
            }

            const now = Date.now();
            await tx.insert(Transactions).values({
                id: randomUUID(),
                title: data.title,
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                accountId: data.accountId,
                note: data.note,
                paymentMethod: data.paymentMethod,
                receiptImage: data.receiptImage,
                tags: data.tags,
                transactionDate: data.transactionDate,
                createdAt: now,
                updatedAt: now
            });

            await tx.update(Accounts)
                .set({
                    balance: newBalance,
                    updatedAt: Date.now(),
                })
                .where(eq(Accounts.id, account.id));
        });
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
}

export async function deleteTransactionService(
  transactionId: string
) {
  try {
      await db.transaction(async (tx) => {
          const transactionResult = await tx.select().from(Transactions).where(eq(Transactions.id, transactionId));
          const transaction = transactionResult[0] ?? null;

          if (!transaction) {
            throw new Error("Transaction not found");
          }

          const accountResult = await tx.select().from(Accounts).where(eq(Accounts.id, transaction.accountId));
          const account = accountResult[0] ?? null;

          if (!account) {
            throw new Error("Account not found");
          }

          let newBalance = account.balance;

          if (transaction.type === "income") {
            newBalance -= transaction.amount;
          } else {
            newBalance += transaction.amount;
          }

          await tx.delete(Transactions).where(eq(Transactions.id, transactionId));

          await tx.update(Accounts)
            .set({
                balance: newBalance,
                updatedAt: Date.now(),
            })
            .where(eq(Accounts.id, account.id));
      });
  } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
  }
}

export async function editTransactionService(
  transactionId: string,
  data: AddTransactionData
) {
  try {
      await db.transaction(async (tx) => {
          const transactionResult = await tx.select().from(Transactions).where(eq(Transactions.id, transactionId));
          const oldTransaction = transactionResult[0] ?? null;

          if (!oldTransaction) {
            throw new Error("Transaction not found");
          }

          const oldAccountResult = await tx.select().from(Accounts).where(eq(Accounts.id, oldTransaction.accountId));
          const oldAccount = oldAccountResult[0] ?? null;

          if (!oldAccount) {
            throw new Error("Old account not found");
          }

          let oldBalance = oldAccount.balance;
          if (oldTransaction.type === "income") {
            oldBalance -= oldTransaction.amount;
          } else {
            oldBalance += oldTransaction.amount;
          }

          let newBalance = 0;
          let newAccount = null;
          if (oldTransaction.accountId === data.accountId) {
              newBalance = oldBalance;
              if (data.type === "income") {
                newBalance += data.amount;
              } else {
                newBalance -= data.amount;
              }
              oldBalance = newBalance;
          } else {
              const newAccountResult = await tx.select().from(Accounts).where(eq(Accounts.id, data.accountId));
              newAccount = newAccountResult[0] ?? null;
              if (!newAccount) {
                  throw new Error("New account not found");
              }
              newBalance = newAccount.balance;
              if (data.type === "income") {
                newBalance += data.amount;
              } else {
                newBalance -= data.amount;
              }
          }

          await tx.update(Transactions)
            .set({
                title: data.title,
                amount: data.amount,
                type: data.type,
                categoryId: data.categoryId,
                accountId: data.accountId,
                note: data.note,
                paymentMethod: data.paymentMethod,
                receiptImage: data.receiptImage,
                tags: data.tags,
                transactionDate: data.transactionDate,
                updatedAt: Date.now(),
            })
            .where(eq(Transactions.id, transactionId));

          if (oldTransaction.accountId === data.accountId) {
              await tx.update(Accounts)
                .set({
                    balance: oldBalance,
                    updatedAt: Date.now(),
                })
                .where(eq(Accounts.id, oldAccount.id));
          } else {
              await tx.update(Accounts)
                .set({
                    balance: oldBalance,
                    updatedAt: Date.now(),
                })
                .where(eq(Accounts.id, oldAccount.id));

              if (newAccount) {
                  await tx.update(Accounts)
                    .set({
                        balance: newBalance,
                        updatedAt: Date.now(),
                    })
                    .where(eq(Accounts.id, newAccount.id));
              }
          }
      });
  } catch (error) {
      console.error("Error editing transaction:", error);
      throw error;
  }
}
