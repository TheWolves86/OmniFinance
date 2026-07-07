import { db } from "../index";
import { Transactions } from "../schema";
import { randomUUID } from 'expo-crypto';
import { eq, desc} from "drizzle-orm"

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

export async function createTransaction(data: CreateTransaction){
    const now = Date.now();
    await db.insert(Transactions).values({
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

export async function getTransactionById(id: string){
    const result = await db
        .select()
        .from(Transactions)
        .where(eq(Transactions.id, id));
    return result[0] ?? null;
}

export async function getAllTransaction(){
    const result = await db
        .select()
        .from(Transactions)
        .orderBy(desc(Transactions.transactionDate));
    return result;
}

export async function updateTransaction(id: string, data: UpdateTransaction){
    await db
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
