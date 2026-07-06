import {
  sqliteTable,
  text,
  real,
  integer,
} from "drizzle-orm/sqlite-core";

export const Transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  categoryId: text("category_id").notNull(),
  accountId: text("account_id").notNull(),
  note: text("note"),
  paymentMethod: text("payment_method"),
  receiptImage: text("receipt_image"),
  tags: text("tags"),
  transactionDate: integer("transaction_date").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});