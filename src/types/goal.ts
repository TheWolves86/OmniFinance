export type Goal = {
    id: string,
    title: string,
    targetAmount: number,
    savedAmount: number,
    targetDate?: number | null,
    icon?: string | null,
    color?: string | null,
    createdAt?: number
};