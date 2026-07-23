import { db } from "../db";
import { createTransaction, getTransactionById, updateTransaction, deleteTransaction } from "../db/repository/transaction";
import { getAccountById, updateBalance } from "../db/repository/account";

type AddTransactionData = { title:string; amount:number; type:string; categoryId:string; accountId:string; note?:string; paymentMethod?:string; receiptImage?:string; tags?:string; transactionDate:number };
const balanceAfter = (balance:number, type:string, amount:number) => balance + (type === "income" ? amount : -amount);
const reverseBalance = (balance:number, type:string, amount:number) => balance + (type === "income" ? -amount : amount);

export async function addTransaction(data:AddTransactionData) {
  await db.withTransactionAsync(async () => {
    const account = await getAccountById(data.accountId);
    if (!account) throw new Error("Account not found");
    await createTransaction(data);
    await updateBalance(account.id, balanceAfter(account.balance, data.type, data.amount));
  });
}
export async function deleteTransactionService(transactionId:string) {
  await db.withTransactionAsync(async () => {
    const transaction = await getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");
    const account = await getAccountById(transaction.accountId);
    if (!account) throw new Error("Account not found");
    await deleteTransaction(transactionId);
    await updateBalance(account.id, reverseBalance(account.balance, transaction.type, transaction.amount));
  });
}
export async function editTransactionService(transactionId:string,data:AddTransactionData) {
  await db.withTransactionAsync(async () => {
    const oldTransaction = await getTransactionById(transactionId);
    if (!oldTransaction) throw new Error("Transaction not found");
    const oldAccount = await getAccountById(oldTransaction.accountId);
    if (!oldAccount) throw new Error("Old account not found");
    const newAccount = await getAccountById(data.accountId);
    if (!newAccount) throw new Error("New account not found");
    await updateTransaction(transactionId, data);
    if (oldAccount.id === newAccount.id) {
      const restored = reverseBalance(oldAccount.balance, oldTransaction.type, oldTransaction.amount);
      await updateBalance(oldAccount.id, balanceAfter(restored, data.type, data.amount));
    } else {
      await updateBalance(oldAccount.id, reverseBalance(oldAccount.balance, oldTransaction.type, oldTransaction.amount));
      await updateBalance(newAccount.id, balanceAfter(newAccount.balance, data.type, data.amount));
    }
  });
}
