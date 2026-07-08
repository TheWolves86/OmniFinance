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
export async function createBudget(data: CreateBudget) {
    const now = Date.now()

    await db.insert(Budgets).values({
        id: randomUUID(),
        categoryId: data.categoryId,
        limit: data.limit,
        month: data.month,
        year: data.year,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a budget by id
export async function getBudgetById(id: string) {
  const result = await db
    .select()
    .from(Budgets)
    .where(eq(Budgets.id, id));

  return result[0] ?? null;
}

//function to get all budgets
export async function getAllBudgets() {
  return await db.select().from(Budgets);
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
  data: UpdateBudget
) {
  await db
    .update(Budgets)
    .set({
      categoryId: data.categoryId,
      limit: data.limit,
      month: data.month,
      year: data.year,
      updatedAt: Date.now(),
    })
    .where(eq(Budgets.id, id));
}

//function to delete a budget
export async function deleteBudget(id: string) {
  await db
    .delete(Budgets)
    .where(eq(Budgets.id, id));
}

//fuction to get a budget by month 
export async function getBudgetByMonth(
  month: number,
  year: number
) {
  return await db
    .select()
    .from(Budgets)
    .where(
      and(
        eq(Budgets.month, month),
        eq(Budgets.year, year)
      )
    );
}


