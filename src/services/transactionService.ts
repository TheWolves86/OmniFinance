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
    const account = await getAccountById(data.accountId);

    if (!account) {
        throw new Error("Account not found")
    }

    let newBalance = account.balance

    if (data.type === "income"){
        newBalance += data.amount;
    } else {
        newBalance -= data.amount;
    }

    await createTransaction(data);

    await updateBalance(
        account.id,
        newBalance
    );
}

export async function deleteTransactionService(
  transactionId: string
) {
  const transaction =
    await getTransactionById(transactionId);

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const account = await getAccountById(
    transaction.accountId
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

  await deleteTransaction(transactionId);

  await updateBalance(
    account.id,
    newBalance
  );
}

export async function editTransactionService(
  transactionId: string,
  data: AddTransactionData
) {
  const oldTransaction =
    await getTransactionById(transactionId);

  if (!oldTransaction) {
    throw new Error("Transaction not found");
  }

  const account = await getAccountById(
    oldTransaction.accountId
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
    data
  );

  await updateBalance(
    account.id,
    balance
  );
}