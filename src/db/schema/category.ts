import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const Categories = sqliteTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    type: text("type").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at").notNull(),
})