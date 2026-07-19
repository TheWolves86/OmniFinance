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
export async function createGoal(data: CreateGoal, tx: any = db) {
    const now = Date.now()

    await tx.insert(Goals).values({
        id: randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a goal by id
export async function getGoalById(id: string, tx: any = db) {
    const result = await tx
        .select()
        .from(Goals)
        .where(eq(Goals.id, id));
    return result[0] ?? null;
}

//function to get all goals
export async function getAllGoals(tx: any = db) {
    return await tx.select().from(Goals);
}

//function to update a goal
export async function updateGoal(id: string, data: UpdateGoal, tx: any = db) {
    await tx
        .update(Goals)
        .set({
            ...data,
            updatedAt: Date.now()
        })
        .where(eq(Goals.id, id));
}

//function to delete a goal
export async function deleteGoal(id: string, tx: any = db) {
    await tx
        .delete(Goals)
        .where(eq(Goals.id, id));
}

//function to add savings to complete the goal
export async function addSavings(id: string, newAmount: number, tx: any = db) {
    const goal = await getGoalById(id, tx);
    if (!goal) return;
    const totalSaved = goal.savedAmount + newAmount;
    await tx
        .update(Goals)
        .set({
        savedAmount: totalSaved,
        isCompleted:
            totalSaved >= goal.targetAmount,
        updatedAt: Date.now(),
        })
        .where(eq(Goals.id, id));
}