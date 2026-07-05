import { sqliteTable, text, real, integer} from "drizzle-orm/sqlite-core"

export const transactions = sqliteTable("transactions", {
    id: text("id").primaryKey(),

    title: text("title").notNull(),

    amount: real("amount").notNull(),

    type: text("type").notNull(),

    category: text("category").notNull(),

    note: text("note"),

    createdAt: integer("created_at").notNull()
});