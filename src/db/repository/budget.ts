import { randomUUID } from "expo-crypto";
import { db } from "../index";

type BudgetInput = {
  categoryId: string;
  amount: number;
  month: string;
};

async function ensureBudgetsTable(tx: any = db) {
  const columns = (await tx.getAllAsync("PRAGMA table_info(budgets)")) as Array<{ name: string }>;

  if (columns.length === 0) {
    await tx.runAsync(`
      CREATE TABLE budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(category_id, month)
      )
    `);
    return;
  }

  const hasAmount = columns.some((column: { name: string }) => column.name === "amount");
  const hasMonth = columns.some((column: { name: string }) => column.name === "month");
  const hasLegacyLimit = columns.some((column: { name: string }) => column.name === "limit");

  // Older installs may have amount/month plus the old NOT NULL `limit`
  // column. Rebuild those tables before writing current budget rows.
  if (!hasAmount || !hasMonth || hasLegacyLimit) {
    const tempTableName = `budgets_migration_${Date.now()}`;

    await tx.execAsync(`ALTER TABLE budgets RENAME TO ${tempTableName}`);

    await tx.runAsync(`
      CREATE TABLE budgets (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(category_id, month)
      )
    `);

    const legacyColumns = (await tx.getAllAsync(`PRAGMA table_info(${tempTableName})`)) as Array<{ name: string }>;
    const hasLegacyAmount = legacyColumns.some((column) => column.name === "amount");
    const hasLegacyLimit = legacyColumns.some((column) => column.name === "limit");
    const hasLegacyMonth = legacyColumns.some((column) => column.name === "month");
    const hasLegacyYear = legacyColumns.some((column) => column.name === "year");

    const amountExpression = hasLegacyAmount
      ? (hasLegacyLimit ? 'COALESCE(amount, "limit", 0)' : "COALESCE(amount, 0)")
      : hasLegacyLimit ? 'COALESCE("limit", 0)' : "0";
    const monthExpression = hasLegacyMonth && hasLegacyYear
      ? "CASE WHEN month IS NOT NULL AND year IS NOT NULL THEN (CAST(year AS TEXT) || '-' || printf('%02d', month)) WHEN month IS NOT NULL THEN CAST(month AS TEXT) ELSE strftime('%Y-%m', created_at / 1000, 'unixepoch', 'localtime') END"
      : hasLegacyMonth
        ? "CASE WHEN month IS NOT NULL THEN CAST(month AS TEXT) ELSE strftime('%Y-%m', created_at / 1000, 'unixepoch', 'localtime') END"
        : "strftime('%Y-%m', created_at / 1000, 'unixepoch', 'localtime')";

    await tx.runAsync(`
      INSERT INTO budgets (id, category_id, amount, month, created_at, updated_at)
      SELECT
        id,
        category_id,
        ${amountExpression},
        ${monthExpression},
        created_at,
        updated_at
      FROM ${tempTableName}
    `);

    await tx.runAsync(`DROP TABLE ${tempTableName}`);
  }
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

export async function getAllBudgets(tx: any = db) {
  await ensureBudgetsTable(tx);

  return await tx.getAllAsync(
    `SELECT
      id,
      category_id AS categoryId,
      amount,
      month,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM budgets
     ORDER BY created_at DESC`
  );
}

export async function getBudgetByCategoryAndMonth(
  categoryId: string,
  month: string,
  excludeId?: string,
  tx: any = db
) {
  await ensureBudgetsTable(tx);

  const query = `
    SELECT
      id,
      category_id AS categoryId,
      amount,
      month,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM budgets
    WHERE category_id = ?
      AND month = ?
      ${excludeId ? "AND id != ?" : ""}
    LIMIT 1
  `;

  const params = excludeId ? [categoryId, month, excludeId] : [categoryId, month];

  return await tx.getFirstAsync(query, ...params);
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
