import { db } from "../db";
import { createTransaction, getTransactionById, updateTransaction, deleteTransaction, type TransactionInput } from "../db/repository/transaction";
import { getAccountById, updateBalance } from "../db/repository/account";

export type AddTransactionData = TransactionInput;
const balanceAfter = (balance:number, type:string, amount:number) => balance + (type === "income" ? amount : -amount);
const reverseBalance = (balance:number, type:string, amount:number) => balance + (type === "income" ? -amount : amount);

export async function addTransactionInTransaction(data:AddTransactionData, tx:any) {
  const account = await getAccountById(data.accountId, tx);
  if (!account) throw new Error("Account not found");
  await createTransaction(data, tx);
  await updateBalance(account.id, balanceAfter(account.balance, data.type, data.amount), tx);
}
export async function addTransaction(data:AddTransactionData) {
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      await addTransactionInTransaction(data, tx);
    });
  } catch (error) {
    throw new Error(`Unable to add transaction: ${String(error)}`);
  }
}
export async function deleteTransactionService(transactionId:string) {
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const transaction = await getTransactionById(transactionId, tx);
      if (!transaction) throw new Error("Transaction not found");
      const account = await getAccountById(transaction.accountId, tx);
      if (!account) throw new Error("Account not found");
      await deleteTransaction(transactionId, tx);
      await updateBalance(account.id, reverseBalance(account.balance, transaction.type, transaction.amount), tx);
    });
  } catch (error) {
    throw new Error(`Unable to delete transaction: ${String(error)}`);
  }
}
export async function editTransactionService(transactionId:string,data:AddTransactionData) {
  try {
    await db.withExclusiveTransactionAsync(async (tx) => {
      const oldTransaction = await getTransactionById(transactionId, tx);
      if (!oldTransaction) throw new Error("Transaction not found");
      const oldAccount = await getAccountById(oldTransaction.accountId, tx);
      if (!oldAccount) throw new Error("Old account not found");
      const newAccount = await getAccountById(data.accountId, tx);
      if (!newAccount) throw new Error("New account not found");
      await updateTransaction(transactionId, data, tx);
      if (oldAccount.id === newAccount.id) {
        const restored = reverseBalance(oldAccount.balance, oldTransaction.type, oldTransaction.amount);
        await updateBalance(oldAccount.id, balanceAfter(restored, data.type, data.amount), tx);
      } else {
        await updateBalance(oldAccount.id, reverseBalance(oldAccount.balance, oldTransaction.type, oldTransaction.amount), tx);
        await updateBalance(newAccount.id, balanceAfter(newAccount.balance, data.type, data.amount), tx);
      }
    });
  } catch (error) {
    throw new Error(`Unable to edit transaction: ${String(error)}`);
  }
}
