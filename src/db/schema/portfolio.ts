import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const Portfolio = sqliteTable("portfolio", {
    id: text("id").primaryKey(),
    symbol: text("symbol").notNull(),
    name: text("name").notNull(),
    quantity: real("quantity").notNull(),
    averagePrice: real("average_price").notNull(),
    currentPrice: real("current_price").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
});