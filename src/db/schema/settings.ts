import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const Settings = sqliteTable("settigs", {
    id: integer("id").primaryKey(),
    currency: text("currency").notNull(),
    theme: text("theme").notNull(),
    language: text("language").notNull(),
    ai_provider: text("ai_provider"),
    api: text("api"),
    biometricEnabled: integer("biometric_enabled", {
        mode: "boolean",
    }).notNull(),
    updatedAt: integer("updated_at").notNull()
});