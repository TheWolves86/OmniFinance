import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core"

export const Budgets = sqliteTable("budgets", {
    id: text("id").primaryKey(),
    categoryId: text("category_id").notNull(),
    limit: real("limit").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
})