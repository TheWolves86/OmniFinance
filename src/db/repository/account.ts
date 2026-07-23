import { randomUUID } from "expo-crypto";
import { db } from "../index";

type AccountInput = { name: string; type: string; balance: number; currency: string; icon?: string; color?: string; isDefault: boolean };
const columns = "id, name, type, balance, curreny AS currency, icon, color, is_default AS isDefault, created_at AS createdAt, updated_at AS updatedAt";

export async function createAccount(data: AccountInput, tx: any = db) {
  try { const now = Date.now(); await tx.runAsync("INSERT INTO accounts (id,name,type,balance,curreny,icon,color,is_default,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)", randomUUID(), data.name, data.type, data.balance, data.currency, data.icon ?? null, data.color ?? null, data.isDefault ? 1 : 0, now, now); }
  catch (error) { throw new Error(`Unable to create account: ${String(error)}`); }
}
export async function getAccountById(id: string, tx: any = db) { try { return await tx.getFirstAsync(`SELECT ${columns} FROM accounts WHERE id = ?`, id); } catch (error) { throw new Error(`Unable to fetch account: ${String(error)}`); } }
export async function getAllAccounts(tx: any = db) { try { return await tx.getAllAsync(`SELECT ${columns} FROM accounts ORDER BY name`); } catch (error) { throw new Error(`Unable to fetch accounts: ${String(error)}`); } }
export async function updateAccount(id: string, data: AccountInput, tx: any = db) { try { await tx.runAsync("UPDATE accounts SET name=?, type=?, balance=?, curreny=?, icon=?, color=?, is_default=?, updated_at=? WHERE id=?", data.name, data.type, data.balance, data.currency, data.icon ?? null, data.color ?? null, data.isDefault ? 1 : 0, Date.now(), id); } catch (error) { throw new Error(`Unable to update account: ${String(error)}`); } }
export async function deleteAccount(id: string, tx: any = db) { try { await tx.runAsync("DELETE FROM accounts WHERE id = ?", id); } catch (error) { throw new Error(`Unable to delete account: ${String(error)}`); } }
export async function updateBalance(id: string, balance: number, tx: any = db) { try { await tx.runAsync("UPDATE accounts SET balance=?, updated_at=? WHERE id=?", balance, Date.now(), id); } catch (error) { throw new Error(`Unable to update account balance: ${String(error)}`); } }
export async function getAccountCount() { try { const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM accounts"); return row?.count ?? 0; } catch (error) { throw new Error(`Unable to count accounts: ${String(error)}`); } }
