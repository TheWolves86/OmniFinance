import { db } from "./index";

let initialized = false;

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL,
      currency TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_default INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL,
      is_default INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      note TEXT,
      payment_method TEXT,
      receipt_image TEXT,
      tags TEXT,
      capture_source TEXT,
      capture_reference_id TEXT,
      detected_transaction_id TEXT,
      transaction_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      target_amount REAL NOT NULL,
      saved_amount REAL NOT NULL,
      target_date INTEGER,
      is_completed INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(category_id, month)
    );
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      lender TEXT NOT NULL DEFAULT '',
      principal REAL NOT NULL,
      interest_rate REAL NOT NULL,
      monthly_amount REAL NOT NULL,
      remaining_amount REAL NOT NULL,
      total_months INTEGER NOT NULL,
      paid_months INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      transaction_id TEXT NOT NULL,
      frequency TEXT NOT NULL,
      next_run INTEGER NOT NULL,
      last_run INTEGER,
      is_active INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS insurance (
      id TEXT PRIMARY KEY NOT NULL,
      provider TEXT NOT NULL,
      policy_name TEXT NOT NULL,
      policy_type TEXT NOT NULL,
      policy_number TEXT,
      premium INTEGER NOT NULL,
      renewal_date INTEGER NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_active INTEGER
    );
    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY NOT NULL,
      symbol TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      average_price REAL NOT NULL,
      current_price REAL NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY NOT NULL,
      from_account_id TEXT NOT NULL,
      to_account_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT,
      transfer_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      amount INTEGER NOT NULL,
      dueDate INTEGER NOT NULL,
      frequency TEXT,
      is_paid INTEGER NOT NULL DEFAULT 0,
      is_subscription INTEGER NOT NULL DEFAULT 0,
      category_id TEXT,
      account_id TEXT,
      notes TEXT,
      paid_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      currency TEXT NOT NULL,
      theme TEXT NOT NULL,
      language TEXT NOT NULL,
      ai_provider TEXT,
      api TEXT,
      biometric_enabled INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS detected_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      source TEXT NOT NULL,
      source_package TEXT,
      source_app TEXT,
      raw_text TEXT NOT NULL,
      merchant TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      transaction_date INTEGER NOT NULL,
      account_id TEXT,
      transfer_to_account_id TEXT,
      category_id TEXT,
      reference_id TEXT,
      account_hint TEXT,
      upi_handle TEXT,
      parser TEXT,
      parser_version TEXT,
      confidence REAL NOT NULL,
      status TEXT NOT NULL,
      duplicate_of TEXT,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_notifications (
      id TEXT PRIMARY KEY NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      action_route TEXT,
      action_params TEXT,
      dedupe_key TEXT UNIQUE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(name);
    CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(is_completed);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
    CREATE INDEX IF NOT EXISTS idx_recurring_next_run ON recurring_transactions(next_run);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    CREATE INDEX IF NOT EXISTS idx_detected_status ON detected_transactions(status);
    CREATE INDEX IF NOT EXISTS idx_detected_reference ON detected_transactions(reference_id);
    CREATE INDEX IF NOT EXISTS idx_detected_fingerprint ON detected_transactions(amount, type, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_created ON app_notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON app_notifications(is_read);
  `);

  const transactionColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(transactions)");
  for (const column of ["capture_source", "capture_reference_id", "detected_transaction_id"]) {
    if (!transactionColumns.some((item) => item.name === column)) await db.execAsync(`ALTER TABLE transactions ADD COLUMN ${column} TEXT`);
  }
  const detectedColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(detected_transactions)");
  if (!detectedColumns.some((item) => item.name === "transfer_to_account_id")) await db.execAsync("ALTER TABLE detected_transactions ADD COLUMN transfer_to_account_id TEXT");
  // Older development builds called the reviewable state `detected`. Keep
  // existing records, but normalize them to the public `pending` state.
  await db.runAsync("UPDATE detected_transactions SET status='pending' WHERE status='detected'");

  const budgetColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(budgets)");
  const hasBudgetAmount = budgetColumns.some((column) => column.name === "amount");
  const hasBudgetMonth = budgetColumns.some((column) => column.name === "month");
  const hasLegacyBudgetLimit = budgetColumns.some((column) => column.name === "limit");

  // Rebuild legacy tables even when they already have amount/month: older
  // schemas can retain a NOT NULL `limit` column that current inserts omit.
  if (budgetColumns.length > 0 && (!hasBudgetAmount || !hasBudgetMonth || hasLegacyBudgetLimit)) {
    const tempTableName = `budgets_migration_${Date.now()}`;

    await db.execAsync(`ALTER TABLE budgets RENAME TO ${tempTableName}`);
    await db.execAsync(`
      CREATE TABLE budgets (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        amount REAL NOT NULL,
        month TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(category_id, month)
      )
    `);

    const legacyColumns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tempTableName})`);
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

    await db.execAsync(`
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
    await db.execAsync(`DROP TABLE ${tempTableName}`);
  }

  const loanColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(loans)");
  if (!loanColumns.some((column) => column.name === "lender")) {
    await db.execAsync("ALTER TABLE loans ADD COLUMN lender TEXT NOT NULL DEFAULT ''");
  }

  const billColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(bills)");
  if (!billColumns.some((column) => column.name === "paid_at")) {
    await db.execAsync("ALTER TABLE bills ADD COLUMN paid_at INTEGER");
  }

  const insuranceColumns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(insurance)");
  if (!insuranceColumns.some((column) => column.name === "policy_type")) {
    await db.execAsync("ALTER TABLE insurance ADD COLUMN policy_type TEXT NOT NULL DEFAULT ''");
  }

  initialized = true;
}

