import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core"

export const recurringTransaction = sqliteTable("recurring_transactions", {
    id: text("id").primaryKey(),
    transactionId: text("transaction_id").notNull(),
    frequency: text("frequency").notNull(),
    nextRun: integer("next_run").notNull(),
    lastRun: integer("last_run"),
    isActive: integer("is_active", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});