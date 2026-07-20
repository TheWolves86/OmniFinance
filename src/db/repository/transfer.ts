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

export async function createTransfer(data: CreateTransfer, tx: any = db) {
  const now = Date.now();

  await tx.insert(Transfers).values({
    id: randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getTransferById(id: string, tx: any = db) {
  const result = await tx
    .select()
    .from(Transfers)
    .where(eq(Transfers.id, id));

  return result[0] ?? null;
}

export async function getAllTransfers(tx: any = db) {
  return await tx.select().from(Transfers);
}

export async function updateTransfer(
  id: string,
  data: UpdateTransfer,
  tx: any = db
) {
  await tx
    .update(Transfers)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(Transfers.id, id));
}

export async function deleteTransfer(id: string, tx: any = db) {
  await tx
    .delete(Transfers)
    .where(eq(Transfers.id, id));
}
