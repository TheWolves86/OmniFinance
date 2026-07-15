import { db } from "../db/index"
import { createTransaction, getTransactionById, deleteTransaction, updateTransaction} from "@/src/db/repository/transaction"
import { getAccountById, updateBalance } from "../db/repository/account"

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
            const account = await getAccountById(data.accountId, tx);

            if (!account) {
                throw new Error("Account not found")
            }

            let newBalance = account.balance

            if (data.type === "income"){
                newBalance += data.amount;
            } else {
                newBalance -= data.amount;
            }

            await createTransaction(data, tx);

            await updateBalance(
                account.id,
                newBalance,
                tx
            );
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
            const transaction =
                await getTransactionById(transactionId, tx);

            if (!transaction) {
                throw new Error("Transaction not found");
            }

            const account = await getAccountById(
                transaction.accountId,
                tx
            );

            if (!account) {
                throw new Error("Account not found");
            }

            let newBalance = account.balance;

            if (transaction.type === "income") {
                newBalance -= transaction.amount;
            } else {
                newBalance += transaction.amount;
            }

            await deleteTransaction(transactionId, tx);

            await updateBalance(
                account.id,
                newBalance,
                tx
            );
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
            const oldTransaction =
                await getTransactionById(transactionId, tx);

            if (!oldTransaction) {
                throw new Error("Transaction not found");
            }

            const account = await getAccountById(
                oldTransaction.accountId,
                tx
            );

            if (!account) {
                throw new Error("Account not found");
            }

            let balance = account.balance;

            if (oldTransaction.type === "income") {
                balance -= oldTransaction.amount;
            } else {
                balance += oldTransaction.amount;
            }

            if (data.type === "income") {
                balance += data.amount;
            } else {
                balance -= data.amount;
            }

            await updateTransaction(
                transactionId,
                data,
                tx
            );

            await updateBalance(
                account.id,
                balance,
                tx
            );
        });
    } catch (error) {
        console.error("Error editing transaction:", error);
        throw error;
    }
}
