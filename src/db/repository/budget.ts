import { randomUUID } from "expo-crypto";
import { db } from "../index";

type BudgetInput = {
  categoryId: string;
  amount: number;
  month: string;
};

async function ensureBudgetsTable(tx: any = db) {
  await tx.runAsync(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(category_id, month)
    )
  `);
}

export async function createBudget(
  data: BudgetInput,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  const now = Date.now();

  await tx.runAsync(
    `INSERT INTO budgets
      (id, category_id, amount, month, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    randomUUID(),
    data.categoryId,
    data.amount,
    data.month,
    now,
    now
  );
}

export async function getBudgetById(
  id: string,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  return await tx.getFirstAsync(
    `SELECT
      id,
      category_id AS categoryId,
      amount,
      month,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM budgets
     WHERE id = ?`,
    id
  );
}

export async function getBudgetsForMonth(
  month: string,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  return await tx.getAllAsync(
    `SELECT
      b.id,
      b.category_id AS categoryId,
      b.amount,
      b.month,
      b.created_at AS createdAt,
      b.updated_at AS updatedAt,
      c.name AS categoryName,
      c.icon AS categoryIcon
     FROM budgets b
     LEFT JOIN categories c
       ON c.id = b.category_id
     WHERE b.month = ?
     ORDER BY b.created_at DESC`,
    month
  );
}

export async function updateBudget(
  id: string,
  data: BudgetInput,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  await tx.runAsync(
    `UPDATE budgets
     SET category_id = ?,
         amount = ?,
         month = ?,
         updated_at = ?
     WHERE id = ?`,
    data.categoryId,
    data.amount,
    data.month,
    Date.now(),
    id
  );
}

export async function deleteBudget(
  id: string,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  await tx.runAsync(
    `DELETE FROM budgets
     WHERE id = ?`,
    id
  );
}

export async function getBudgetSpent(
  categoryId: string,
  month: string,
  tx: any = db
) {
  const result = (await tx.getFirstAsync(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE category_id = ?
       AND type = 'expense'
       AND strftime('%Y-%m', transaction_date / 1000, 'unixepoch', 'localtime') = ?`,
    categoryId,
    month
  )) as { total: number | null } | null;

  return Number(result?.total ?? 0);
}