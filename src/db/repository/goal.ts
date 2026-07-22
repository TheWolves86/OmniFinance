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
    try {
        const now = Date.now()

        await tx.insert(Goals).values({
            id: randomUUID(),
            ...data,
            createdAt: now,
            updatedAt: now,
        });
    } catch (error) {
        console.error("Error in createGoal:", error);
        throw error;
    }
}

//function to get a goal by id
export async function getGoalById(id: string, tx: any = db) {
    try {
        const result = await tx
            .select()
            .from(Goals)
            .where(eq(Goals.id, id));
        return result[0] ?? null;
    } catch (error) {
        console.error("Error in getGoalById:", error);
        throw error;
    }
}

//function to get all goals
export async function getAllGoals(tx: any = db) {
    try {
        return await tx.select().from(Goals);
    } catch (error) {
        console.error("Error in getAllGoals:", error);
        throw error;
    }
}

//function to update a goal
export async function updateGoal(id: string, data: UpdateGoal, tx: any = db) {
    try {
        await tx
            .update(Goals)
            .set({
                ...data,
                updatedAt: Date.now()
            })
            .where(eq(Goals.id, id));
    } catch (error) {
        console.error("Error in updateGoal:", error);
        throw error;
    }
}

//function to delete a goal
export async function deleteGoal(id: string, tx: any = db) {
    try {
        await tx
            .delete(Goals)
            .where(eq(Goals.id, id));
    } catch (error) {
        console.error("Error in deleteGoal:", error);
        throw error;
    }
}

//function to add savings to complete the goal
export async function addSavings(id: string, newAmount: number, tx: any = db) {
    try {
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
    } catch (error) {
        console.error("Error in addSavings:", error);
        throw error;
    }
}