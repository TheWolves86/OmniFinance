import { db } from "../index";
import { Transactions } from "../schema";
import { randomUUID } from 'expo-crypto';
import { eq, desc} from "drizzle-orm"

//types for creating a transaction
type CreateTransaction = {
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

//the function to create a transaction
export async function createTransaction(data: CreateTransaction, tx: any = db){
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
    })
};

//the type for updating a transaction
type UpdateTransaction = {
    title: string;
    amount: number;
    type: string;
    categoryId: string;
    accountId: string;
    note?: string;
    paymentMethod?: string;
    receiptImage?: string;
    tags?: string;
    transactionDate: number
}

//function to get a transaction data by id
export async function getTransactionById(id: string, tx: any = db){
    const result = await tx
        .select()
        .from(Transactions)
        .where(eq(Transactions.id, id));
    return result[0] ?? null;
}

//the function to get all transactions
export async function getAllTransaction(tx: any = db){
    const result = await tx
        .select()
        .from(Transactions)
        .orderBy(desc(Transactions.transactionDate));
    return result;
}

//the function to update a transaction
export async function updateTransaction(id: string, data: UpdateTransaction, tx: any = db){
    await tx
        .update(Transactions)
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
        .where(eq(Transactions.id, id));
};

//the function to delete a transaction
export async function deleteTransaction(id: string, tx: any = db){
    await tx
        .delete(Transactions)
        .where(eq(Transactions.id, id));
};
//