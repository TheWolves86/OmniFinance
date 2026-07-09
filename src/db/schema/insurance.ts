import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const insurance = sqliteTable("insurance", {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    policyName: text("policy_name").notNull(),
    policyNumber: text("policy_number"),
    premium: integer("premium").notNull(),
    renewalDate: integer("renewal_date").notNull(),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    isActive: integer("is_active", {
        mode: "boolean"
    })
});