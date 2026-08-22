import { randomUUID } from "expo-crypto";
import { db } from "../index";

export type BillInput = {
  title: string;
  amount: number;
  dueDate: number;
  categoryId?: string | null;
  accountId?: string | null;
  notes?: string | null;
};

export type BillRecord = BillInput & {
  id: string;
  isPaid: boolean | number;
  paidAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
  categoryName?: string | null;
};

const columns = `b.id, b.title, b.amount, b.dueDate, b.category_id AS categoryId,
  b.account_id AS accountId, b.notes, b.is_paid AS isPaid, b.paid_at AS paidAt,
  b.created_at AS createdAt, b.updated_at AS updatedAt, c.name AS categoryName`;

function nextMonthlyDueDate(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.getTime();
}

export async function createBill(data: BillInput, tx: any = db) {
  const now = Date.now();
  await tx.runAsync(
    `INSERT INTO bills
      (id, title, amount, dueDate, is_paid, is_subscription, category_id,
       account_id, notes, paid_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, NULL, ?, ?)`,
    randomUUID(), data.title, data.amount, data.dueDate,
    data.categoryId ?? null, data.accountId ?? null, data.notes ?? null, now, now
  );
}

export async function getBillById(id: string, tx: any = db) {
  return tx.getFirstAsync(`SELECT ${columns} FROM bills b LEFT JOIN categories c ON c.id = b.category_id WHERE b.id = ?`, id) as Promise<BillRecord | null>;
}

export async function getAllBills(tx: any = db) {
  return tx.getAllAsync(`SELECT ${columns} FROM bills b LEFT JOIN categories c ON c.id = b.category_id ORDER BY b.is_paid ASC, b.dueDate ASC`) as Promise<BillRecord[]>;
}

export async function resetBillsDueSoon(tx: any = db) {
  const now = Date.now();
  await tx.runAsync(
    "UPDATE bills SET is_paid = 0, paid_at = NULL, updated_at = ? WHERE is_paid = 1 AND (is_subscription = 1 OR frequency IS NOT NULL) AND (dueDate - ?) <= ?",
    now, now, 10 * 86400000
  );
}

export async function updateBill(id: string, data: BillInput, tx: any = db) {
  await tx.runAsync(
    `UPDATE bills SET title = ?, amount = ?, dueDate = ?, category_id = ?,
      account_id = ?, notes = ?, updated_at = ? WHERE id = ?`,
    data.title, data.amount, data.dueDate, data.categoryId ?? null,
    data.accountId ?? null, data.notes ?? null, Date.now(), id
  );
}

export async function deleteBill(id: string, tx: any = db) {
  const result = await tx.runAsync("DELETE FROM bills WHERE id = ?", id);
  if (!result.changes) throw new Error("Bill not found");
}

export async function setBillPaid(id: string, paidAt: number, tx: any = db) {
  const bill = (await tx.getFirstAsync("SELECT dueDate, is_subscription, frequency FROM bills WHERE id = ?", id)) as { dueDate: number, is_subscription: number, frequency: string | null } | null;
  if (!bill) throw new Error("Bill not found");
  
  if (bill.is_subscription || bill.frequency) {
    const nextDueDate = nextMonthlyDueDate(bill.dueDate);
    const result = await tx.runAsync(
      `UPDATE bills SET is_paid = 1, paid_at = ?, dueDate = ?, updated_at = ?
       WHERE id = ? AND is_paid = 0`,
      paidAt, nextDueDate, Date.now(), id
    );
    return Boolean(result.changes);
  } else {
    const result = await tx.runAsync(
      `UPDATE bills SET is_paid = 1, paid_at = ?, updated_at = ?
       WHERE id = ? AND is_paid = 0`,
      paidAt, Date.now(), id
    );
    return Boolean(result.changes);
  }
}
