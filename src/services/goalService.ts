import { createGoal, getAllGoals, getGoalById, updateGoal } from "@/src/db/repository/goal";

type CreateGoalData = Parameters<typeof createGoal>[0];

export async function createGoalService(
  data: CreateGoalData
) {
    try {
        await createGoal(data);
    } catch (error) {
        console.error("Error creating goal:", error);
        throw error;
    }
}

export async function addMoneyToGoal(
    goalId: string,
    amount: number
) {
    try {
        const goal = await getGoalById(goalId);

        if (!goal) {
            throw new Error("Goal not found")
        }

        const newSavedAmount = goal.savedAmount + amount;

        const isCompleted = newSavedAmount >= goal.targetAmount;

        await updateGoal(goalId, {
            title: goal.title,
            description: goal.description ?? undefined,
            targetAmount: goal.targetAmount,
            savedAmount: newSavedAmount,
            targetDate: goal.targetDate ?? undefined,
            isCompleted
        });
    } catch (error) {
        console.error("Error adding money to goal:", error);
        throw error;
    }
}

export async function withdrawMoneyFromGoal(
    goalId: string,
    amount: number
) {
    try {
        const goal = await getGoalById(goalId);

        if (!goal) {
            throw new Error("Goal not found");
        }

        const newSavedAmount = Math.max(
            0,
            goal.savedAmount - amount
        );

        await updateGoal(goalId, {
            title: goal.title,
            description: goal.description ?? undefined,
            targetAmount: goal.targetAmount,
            savedAmount: newSavedAmount,
            targetDate: goal.targetDate ?? undefined,
            isCompleted: false,
        });
    } catch (error) {
        console.error("Error withdrawing money from goal:", error);
        throw error;
    }
}

export async function getGoalProgress(
    goalId: string
) {
    try {
        const goal = await getGoalById(goalId);

        if (!goal) {
            throw new Error("Goal not found");
        }

        return (
            (goal.savedAmount /
                goal.targetAmount) *
            100
        );
    } catch (error) {
        console.error("Error getting goal progress:", error);
        throw error;
    }
}

export async function getCompletedGoals() {
    try {
        const goals = await getAllGoals();

        return goals.filter(
            (goal: any) => goal.isCompleted
        );
    } catch (error) {
        console.error("Error getting completed goals:", error);
        throw error;
    }
}

export async function getActiveGoals() {
    try {
        const goals = await getAllGoals();

        return goals.filter(
            (goal: any) => !goal.isCompleted
        );
    } catch (error) {
        console.error("Error getting active goals:", error);
        throw error;
    }
}

export async function getTotalGoalSavings() {
    try {
        const goals = await getAllGoals();

        return goals.reduce(
            (sum: number, goal: any) =>
                sum + goal.savedAmount,
            0
        );
    } catch (error) {
        console.error("Error getting total goal savings:", error);
        throw error;
    }
}
//