import { randomUUID } from "expo-crypto";
import { db } from "../index";

export type NotificationCategory = "bills" | "budgets" | "goals" | "loans" | "insurance" | "transactions" | "ai_insights" | "system";
export type AppNotification = { id: string; category: NotificationCategory; title: string; description: string; createdAt: number; isRead: boolean | number; actionRoute?: string | null; actionParams?: string | null };
const columns = "id,category,title,description,created_at AS createdAt,is_read AS isRead,action_route AS actionRoute,action_params AS actionParams";

export async function createNotification(data: Omit<AppNotification, "id" | "createdAt" | "isRead"> & { dedupeKey?: string }, tx: any = db) {
  const id = randomUUID();
  await tx.runAsync("INSERT OR IGNORE INTO app_notifications (id,category,title,description,created_at,is_read,action_route,action_params,dedupe_key) VALUES (?,?,?,?,?,?,?,?,?)", id, data.category, data.title, data.description, Date.now(), 0, data.actionRoute ?? null, data.actionParams ?? null, data.dedupeKey ?? null);
  return id;
}
export async function hasNotificationDedupe(key: string, tx: any = db) { const row = await tx.getFirstAsync("SELECT id FROM app_notifications WHERE dedupe_key=?", key); return Boolean(row); }
export async function getNotifications(limit = 100, tx: any = db) { return tx.getAllAsync("SELECT " + columns + " FROM app_notifications ORDER BY created_at DESC LIMIT ?", limit) as Promise<AppNotification[]>; }
export async function getUnreadNotificationCount(tx: any = db) { const row = await tx.getFirstAsync("SELECT COUNT(*) AS count FROM app_notifications WHERE is_read=0") as { count: number } | null; return row?.count ?? 0; }
export async function markNotificationRead(id: string, tx: any = db) { await tx.runAsync("UPDATE app_notifications SET is_read=1 WHERE id=?", id); }
export async function markAllNotificationsRead(tx: any = db) { await tx.runAsync("UPDATE app_notifications SET is_read=1 WHERE is_read=0"); }
export async function deleteNotification(id: string, tx: any = db) { await tx.runAsync("DELETE FROM app_notifications WHERE id=?", id); }
