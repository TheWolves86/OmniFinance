import { db } from "../index";
import { Categories } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq, and } from "drizzle-orm";

//the type for creating a category
type CreateCategory = {
    name: string,
    icon: string,
    color: string,
    type: string,
    isDefault: boolean
}

//the function to create a category
export async function createCategory(data: CreateCategory){
    const now = Date.now();

    await db.insert(Categories).values({
        id: randomUUID(),
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        isDefault: data.isDefault,
        createdAt: now
    });
};

//the function to get a category bt id
export async function getCategoryById(id: string){
    const result = await db
        .select()
        .from(Categories)
        .where(eq(Categories.id, id));
    return result[0] ?? null;
};

//the function to get all categories
export async function getAllCategory(){
    return await db.select().from(Categories);
};

//the type for updating a category
type updateCategory = {
    name: string;
    icon: string;
    color: string;
    type: string;
    isDefault: boolean;
};

//the function to update a category
export async function updateCategory(id: string, data: updateCategory){
    await db
        .update(Categories)
        .set({
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
        isDefault: data.isDefault,
        })
        .where(eq(Categories.id, id));
}

//the function to delete a category by id
export async function deleteCategory(id: string){
    await db
        .delete(Categories)
        .where(eq(Categories.id, id));
};

//the function to get all the income categories
export async function getIncomeCategory(){
    return await db
        .select()
        .from(Categories)
        .where(eq(Categories.type, "income"));
};

//the function to get all the expense categories
export async function getExpenseCategories() {
  return await db
    .select()
    .from(Categories)
    .where(eq(Categories.type, "expense"));
};
