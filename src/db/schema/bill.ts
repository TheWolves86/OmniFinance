import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const Bills = sqliteTable("bills", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    amount: integer("amount").notNull(),
    dueDate: integer("dueDate").notNull(),
    frequency: text("frequency"),
    isPaid: integer("is_paid", {
        mode: "boolean"
    })
        .notNull()
        .default(false),
    isSubscription: integer("is_subscription", {
        mode: "boolean"
    })
        .notNull()
        .default(false),
    categoryId: text("category_id"),
    accountId: text("account_id"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});