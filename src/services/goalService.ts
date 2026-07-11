import { createGoal, getAllGoals, getGoalById, updateGoal } from "@/src/db/repository/goal";

type CreateGoalData = Parameters<typeof createGoal>[0];

export async function createGoalService(
  data: CreateGoalData
) {
  await createGoal(data);
}

export async function addMoneyToGoal(
    goalId: string,
    amount: number
) {
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
}

export async function withdrawMoneyFromGoal(
    goalId: string,
    amount: number
) {
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
}

export async function getGoalProgress(
    goalId: string
) {
    const goal = await getGoalById(goalId);

    if (!goal) {
        throw new Error("Goal not found");
    }

    return (
        (goal.savedAmount /
            goal.targetAmount) *
        100
    );
}

export async function getCompletedGoals() {
    const goals = await getAllGoals();

    return goals.filter(
        (goal) => goal.isCompleted
    );
}

export async function getActiveGoals() {
    const goals = await getAllGoals();

    return goals.filter(
        (goal) => !goal.isCompleted
    );
}

export async function getTotalGoalSavings() {
    const goals = await getAllGoals();

    return goals.reduce(
        (sum, goal) =>
            sum + goal.savedAmount,
        0
    );
}
//