import { db } from "../index"

export async function getTotalBalance() {
    try {
        const row = await db.getFirstAsync<{ total: number}>(
            `
            SELECT
                COALESCE(SUM(balance), 0) AS total
            FROM accounts
            `
        );

        return row?.total ?? 0;
    } catch (error) {
        throw new Error(`Unable to get total balance: ${String(error)}`);
    }
}

export async function getMonthlyIncome(){
    try {
        const now = new Date();

        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

        const row = await db.getFirstAsync<{ total: number}>(
            `
            SELECT
                COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE type= 'income'
            AND transaction_date >= ?
            AND transaction_date < ?
            `,
            start,
            end
        );
        return row?.total ?? 0;
    } catch (error) {
        throw new Error(`Unable to calculate monthly income ${String(error)}`)
    }
}

export async function getMonthlyExpense(){
    try {
        const now = new Date()

        const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

        const row = await db.getFirstAsync<{ total: number}>(
            `
            SELECT
                COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE type= 'expense'
            AND transaction_date >= ?
            AND transaction_date < ?
            `,
            start,
            end
        );

        return row?.total ?? 0;
    } catch (error) {
        throw new Error(`Unable to calculate monthly expense ${String(error)}`)
    }
}

export async function getDashboardData(){
    try {
        const [
            totalBalance,
            monthlyIncome,
            monthlyExpense
        ] = await Promise.all([
            getTotalBalance(),
            getMonthlyIncome(),
            getMonthlyExpense()
        ]);
        return {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            monthlySavings: monthlyIncome - monthlyExpense
        };
    } catch (error) {
        throw new Error(`Unable to get dashboard data: ${String(error)}`);
    }
}