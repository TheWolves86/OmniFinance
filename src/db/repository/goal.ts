import { db } from "../index"
import { Goals } from "../schema"
import { randomUUID } from "expo-crypto"
import { eq } from "drizzle-orm"

//type for creating a goal
type CreateGoal = {
    title: string;
    description?: string;
    targetAmount: number;
    savedAmount: number;
    targetDate?: number;
    isCompleted: boolean;
};

//just copying the creategsol type
type UpdateGoal = CreateGoal

//function to create a goal
export async function createGoal(data: CreateGoal) {
    const now = Date.now()

    await db.insert(Goals).values({
        id: randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a goal by id
export async function getGoalById(id: string) {
    const result = await db
        .select()
        .from(Goals)
        .where(eq(Goals.id, id));
    return result[0] ?? null;
}

//function to get all goals
export async function getAllGoals() {
    return await db.select().from(Goals);
}

//function to update a goal
export async function updateGoal(id: string, data: UpdateGoal) {
    await db
        .update(Goals)
        .set({
            ...data,
            updatedAt: Date.now()
        })
        .where(eq(Goals.id, id));
}

//function to delete a goal
export async function deleteGoal(id: string) {
    await db
        .delete(Goals)
        .where(eq(Goals.id, id));
}

//function to add savings to complete the goal
export async function addSavings(id: string, newAmount: number) {
    const goal = await getGoalById(id);
    if (!goal) return;
    const totalSaved = goal.savedAmount + newAmount;
    await db
        .update(Goals)
        .set({
        savedAmount: totalSaved,
        isCompleted:
            totalSaved >= goal.targetAmount,
        updatedAt: Date.now(),
        })
        .where(eq(Goals.id, id));
}