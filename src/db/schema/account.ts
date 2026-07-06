import { sqliteTable, text, integer, real} from "drizzle-orm/sqlite-core";

export const Accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    balance: real("balance").notNull(),
    currency: text("curreny").notNull(),
    icon: text("icon"),
    color: text("color"),
    isDefault: integer("is_default", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
})