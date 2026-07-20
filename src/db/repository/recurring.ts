import { db } from "../index";
import { recurringTransaction } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq } from "drizzle-orm";

type CreateRecurring = {
    transactionId: string;
    frequency: string;
    nextRun: number;
    lastRun?: number;
    isActive: boolean;
}

type UpdateRecurring = CreateRecurring

export async function createRecurring(data: CreateRecurring, tx: any = db) {
    const now = Date.now()

    await tx.insert(recurringTransaction).values({
        id: randomUUID(),
        transactionId: data.transactionId,
        frequency: data.frequency,
        nextRun: data.nextRun,
        lastRun: data.lastRun,
        isActive: data.isActive,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a recurring transaction by id
export async function getRecurringById(id: string, tx: any = db) {
  const result = await tx
    .select()
    .from(recurringTransaction)
    .where(eq(recurringTransaction.id, id));

  return result[0] ?? null;
}

//function to get all recurring transactions
export async function getAllRecurring(tx: any = db) {
  return await tx.select().from(recurringTransaction);
}


//function to update a recurring transaction
export async function updateRecurring(
  id: string,
  data: UpdateRecurring,
  tx: any = db
) {
  await tx
    .update(recurringTransaction)
    .set({
      transactionId: data.transactionId,
      frequency: data.frequency,
      nextRun: data.nextRun,
      lastRun: data.lastRun,
      isActive: data.isActive,
      updatedAt: Date.now(),
    })
    .where(eq(recurringTransaction.id, id));
}

//function to delete a recurring transaction
export async function deleteRecurring(id: string, tx: any = db) {
  await tx
    .delete(recurringTransaction)
    .where(eq(recurringTransaction.id, id));
}

//function to get due recurring transactions
export async function getDueRecurringTransactions(tx: any = db) {
  const now = Date.now();

  return await tx
    .select()
    .from(recurringTransaction)
    .where(
      eq(
        recurringTransaction.isActive,
        true
      )
    );
}
