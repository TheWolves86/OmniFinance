import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core"

export const Goals = sqliteTable("goals", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    targetAmount: real("target_amount").notNull(),
    savedAmount: real("saved_amount").notNull(),
    targetDate: integer("target_date"),
    isCompleted: integer("is_completed", {
        mode: "boolean",
    }).notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});