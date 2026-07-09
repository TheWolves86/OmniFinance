import { db } from "../index";
import { Transfers  } from "../schema";
import { randomUUID } from "expo-crypto"
import { eq } from "drizzle-orm";

type CreateTransfer = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    note?: string;
    transferDate: number;
};

type UpdateTransfer = CreateTransfer;

export async function createTransfer(data: CreateTransfer) {
  const now = Date.now();

  await db.insert(Transfers).values({
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getTransferById(id: string) {
  const result = await db
    .select()
    .from(Transfers)
    .where(eq(Transfers.id, id));

  return result[0] ?? null;
}

export async function getAllTransfers() {
  return await db.select().from(Transfers);
}

export async function updateTransfer(
  id: string,
  data: UpdateTransfer
) {
  await db
    .update(Transfers)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(Transfers.id, id));
}

export async function deleteTransfer(id: string) {
  await db
    .delete(Transfers)
    .where(eq(Transfers.id, id));
}