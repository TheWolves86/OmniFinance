import { getAllGoals } from "@/src/db/repository/goal";
import { getAllBudgets } from "@/src/db/repository/budget";
import { getRecentTransactions } from "@/src/db/repository/transaction";
import { getTotalBalance, getMonthlyIncome, getMonthlyExpense } from "@/src/db/repository/dashboard";

export type DashboardData = {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    totalSaved: number;
    budgetUsed: number;
    recentTransactions: any[];
}

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const [
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            goals,
            budgets,
            recentTransactions
        ] = await Promise.all([
            getTotalBalance(),
            getMonthlyIncome(),
            getMonthlyExpense(),
            getAllGoals(),
            getAllBudgets(),
            getRecentTransactions(5)
        ]);

        const totalSaved = goals.reduce(
            (sum: number, goal: any) => sum + goal.savedAmount,
            0
        );

        const totalBudget = budgets.reduce(
            (sum: number, budget: any) => sum + budget.limit,
            0
        )

        const budgetUsed =
            totalBudget === 0
                ? 0
                : (monthlyExpense / totalBudget) * 100;

        return {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            totalSaved,
            budgetUsed,
            recentTransactions,
        };
    } catch (error) {
        console.error("Error getting dashboard data:", error);
        throw error;
    }
}
