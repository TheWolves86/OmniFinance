import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core"

export const Loans = sqliteTable("loans", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    principal: real("principal").notNull(),
    interestRate: real("interest_rate").notNull(),
    monthlyAmount: real("monthly_amount").notNull(),
    remainingAmount: real("remaining_amount").notNull(),
    totalMonths: integer("total_months").notNull(),
    paidMonths: integer("paid_months").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});