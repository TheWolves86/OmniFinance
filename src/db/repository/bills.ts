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
export async function createBill(data: CreateBill, tx: any = db) {
  try {
    const now = Date.now();

    await tx.insert(Bills).values({
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
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
}

//function to get a bill info by id
export async function getBillById(id: string, tx: any = db) {
  try {
    const result = await tx
        .select()
        .from(Bills)
        .where(eq(Bills.id, id));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching bill by id:", error);
    throw error;
  }
}

//functio to get all bills
export async function getAllBills(tx: any = db){
  try {
    return await tx.select().from(Bills);
  } catch (error) {
    console.error("Error fetching all bills:", error);
    throw error;
  }
}

//function to update bill details/info
export async function updateBill(
  id: string,
  data: UpdateBill,
  tx: any = db
) {
  try {
    await tx
      .update(Bills)
      .set({
        ...data,
        updatedAt: Date.now(),
      })
      .where(eq(Bills.id, id));
  } catch (error) {
    console.error("Error updating bill:", error);
    throw error;
  }
};

//function to delete a bill
export async function deleteBill(id: string, tx: any = db){
  try {
    await tx
        .delete(Bills)
        .where(eq(Bills.id, id));
  } catch (error) {
    console.error("Error deleting bill:", error);
    throw error;
  }
}

//function to mark a bill as paid
export async function markBillAsPaid(id: string, tx: any = db) {
  try {
    await tx
      .update(Bills)
      .set({
        isPaid: true,
        updatedAt: Date.now(),
      })
      .where(eq(Bills.id, id));
  } catch (error) {
    console.error("Error marking bill as paid:", error);
    throw error;
  }
}
