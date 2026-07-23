import { getAllAccounts } from "@/src/db/repository/account";
import { getAllTransaction } from "@/src/db/repository/transaction";
import { getAllGoals } from "@/src/db/repository/goal";
import { getAllBudgets } from "@/src/db/repository/budget";

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
        const accounts = await getAllAccounts();
        const transactions = await getAllTransaction();
        const goals = await getAllGoals();
        const budgets = await getAllBudgets();

        const totalBalance = accounts.reduce(
            (sum: number, account: any) => sum + account.balance,
            0
        );
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const monthlyTransactions = transactions.filter(
            (transaction: any) => {
                const date = new Date(
                transaction.transactionDate
                );

                return (
                date.getMonth() === month &&
                date.getFullYear() === year
                );
            }
        );

        const monthlyIncome =
            monthlyTransactions
                .filter((t: any) => t.type === "income")
                .reduce(
                (sum: number, t: any) => sum + t.amount,
                0
            );

        const monthlyExpense =
            monthlyTransactions
                .filter((t: any) => t.type === "expense")
                .reduce(
                    (sum: number, t: any) => sum + t.amount,
                    0
                );

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

        const recentTransactions = [...transactions]
            .sort(
                (a: any, b: any) => b.transactionDate - a.transactionDate
            )
            .slice(0, 5);

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
