import { db } from "../index";
import { Bills } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq } from "drizzle-orm";

//type to create a bill
type CreateBill = {
    title: string;
    amount: number;
    dueDate: number;
    Frequency?: string;
    isSubscription?: boolean;
    categoryId?: string;
    accountId?: string;
    notes?: string;
};

type UpdateBill = CreateBill;

//function to create a bill
export async function createBill(data: CreateBill) {
    const now = Date.now();

    await db.insert(Bills).values({
        id: randomUUID(),
        title: data.title,
        amount: data.amount,
        dueDate: data.dueDate,
        frequency: data.Frequency,
        isSubscription: data.isSubscription ?? false,
        categoryId: data.categoryId,
        accountId: data.accountId,
        notes: data.notes,
        isPaid: false,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a bill info by id
export async function getBillById(id: string) {
    const result = await db
        .select()
        .from(Bills)
        .where(eq(Bills.id, id));

    return result[0] ?? null;
}

//functio to get all bills
export async function getAllBills(){
    return await db.select().from(Bills);
}

//function to update bill details/info
export async function updateBill(
  id: string,
  data: UpdateBill
) {
  await db
    .update(Bills)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(Bills.id, id));
};

//function to delete a bill
export async function deleteBill(id: string){
    await db
        .delete(Bills)
        .where(eq(Bills.id, id));
}

//function to mark a bill as paid
export async function markBillAsPaid(id: string) {
  await db
    .update(Bills)
    .set({
      isPaid: true,
      updatedAt: Date.now(),
    })
    .where(eq(Bills.id, id));
}