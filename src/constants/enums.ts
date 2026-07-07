export const transactionType = {
    INCOME: "income",
    EXPENSE: "expense"
} as const;

export const accountType = {
    CASH: "cash",
    BANK: "bank",
    WALLET: "wallet",
    CREDIT: "credit",
} as const;

export const loanStatus = {
    ACTIVE: "active",
    COMPLETED: "completed",
} as const;

export const recurringFrequency = {
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
    YEARLY: "yearly",
} as const;

export const Theme = {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
} as const;

