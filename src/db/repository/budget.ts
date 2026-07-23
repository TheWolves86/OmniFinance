import { db } from "../index";
import { Budgets } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq, and } from "drizzle-orm";

//type for creating a budget
type CreateBudget = {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
};

//function to createa budget
export async function createBudget(data: CreateBudget, tx: any = db) {
  try {
    const now = Date.now()

    await tx.insert(Budgets).values({
        id: randomUUID(),
        categoryId: data.categoryId,
        limit: data.limit,
        month: data.month,
        year: data.year,
        createdAt: now,
        updatedAt: now,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    throw error;
  }
}

//function to get a budget by id
export async function getBudgetById(id: string, tx: any = db) {
  try {
    const result = await tx
      .select()
      .from(Budgets)
      .where(eq(Budgets.id, id));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching budget by id:", error);
    throw error;
  }
}

//function to get all budgets
export async function getAllBudgets(tx: any = db) {
  try {
    return await tx.select().from(Budgets);
  } catch (error) {
    console.error("Error fetching all budgets:", error);
    throw error;
  }
}

//type for updating a budget
type UpdateBudget = {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
};

//function to update a budget
export async function updateBudget(
  id: string,
  data: UpdateBudget,
  tx: any = db
) {
  try {
    await tx
      .update(Budgets)
      .set({
        categoryId: data.categoryId,
        limit: data.limit,
        month: data.month,
        year: data.year,
        updatedAt: Date.now(),
      })
      .where(eq(Budgets.id, id));
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

//function to delete a budget
export async function deleteBudget(id: string, tx: any = db) {
  try {
    await tx
      .delete(Budgets)
      .where(eq(Budgets.id, id));
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error;
  }
}

//fuction to get a budget by month 
export async function getBudgetByMonth(
  month: number,
  year: number,
  tx: any = db
) {
  try {
    return await tx
      .select()
      .from(Budgets)
      .where(
        and(
          eq(Budgets.month, month),
          eq(Budgets.year, year)
        )
      );
  } catch (error) {
    console.error("Error fetching budget by month:", error);
    throw error;
  }
}
