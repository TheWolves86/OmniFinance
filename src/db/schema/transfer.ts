import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const Transfers = sqliteTable("transfers", {
    id: text("id").primaryKey(),
    fromAccountId: text("from_account_id").notNull(),
    toAccountId: text("to_account_id").notNull(),
    amount: integer("amount").notNull(),
    note: text("note"),
    transferDate: integer("transfer_date").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});