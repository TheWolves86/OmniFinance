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

export async function createRecurring(data: CreateRecurring) {
    const now = Date.now()

    await db.insert(recurringTransaction).values({
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
export async function getRecurringById(id: string) {
  const result = await db
    .select()
    .from(recurringTransaction)
    .where(eq(recurringTransaction.id, id));

  return result[0] ?? null;
}

//function to get all recurring transactions
export async function getAllRecurring() {
  return await db.select().from(recurringTransaction);
}


//function to update a recurring transaction
export async function updateRecurring(
  id: string,
  data: UpdateRecurring
) {
  await db
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
export async function deleteRecurring(id: string) {
  await db
    .delete(recurringTransaction)
    .where(eq(recurringTransaction.id, id));
}

//function to get due recurring transactions
export async function getDueRecurringTransactions() {
  const now = Date.now();

  return await db
    .select()
    .from(recurringTransaction)
    .where(
      eq(
        recurringTransaction.isActive,
        true
      )
    );
}
