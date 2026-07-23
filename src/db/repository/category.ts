import { randomUUID } from "expo-crypto";
import { db } from "../index";
type CategoryInput = { name: string; icon: string; color: string; type: string; isDefault: boolean };
const columns = "id,name,icon,color,type,is_default AS isDefault,created_at AS createdAt";
export async function createCategory(data: CategoryInput, tx: any = db) { try { await tx.runAsync("INSERT INTO categories (id,name,icon,color,type,is_default,created_at) VALUES (?,?,?,?,?,?,?)", randomUUID(), data.name, data.icon, data.color, data.type, data.isDefault ? 1 : 0, Date.now()); } catch (error) { throw new Error(`Unable to create category: ${String(error)}`); } }
export async function getCategoryById(id: string, tx: any = db) { try { return await tx.getFirstAsync(`SELECT ${columns} FROM categories WHERE id=?`, id); } catch (error) { throw new Error(`Unable to fetch category: ${String(error)}`); } }
export async function getAllCategory(tx: any = db) { try { return await tx.getAllAsync(`SELECT ${columns} FROM categories ORDER BY name`); } catch (error) { throw new Error(`Unable to fetch categories: ${String(error)}`); } }
export async function updateCategory(id: string, data: CategoryInput, tx: any = db) { try { await tx.runAsync("UPDATE categories SET name=?,icon=?,color=?,type=?,is_default=? WHERE id=?", data.name, data.icon, data.color, data.type, data.isDefault ? 1 : 0, id); } catch (error) { throw new Error(`Unable to update category: ${String(error)}`); } }
export async function deleteCategory(id: string, tx: any = db) { try { await tx.runAsync("DELETE FROM categories WHERE id=?", id); } catch (error) { throw new Error(`Unable to delete category: ${String(error)}`); } }
export async function getIncomeCategory(tx: any = db) { return tx.getAllAsync(`SELECT ${columns} FROM categories WHERE type='income' ORDER BY name`); }
export async function getExpenseCategories(tx: any = db) { return tx.getAllAsync(`SELECT ${columns} FROM categories WHERE type='expense' ORDER BY name`); }
export async function getCategoryCount() { try { const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM categories"); return row?.count ?? 0; } catch (error) { throw new Error(`Unable to count categories: ${String(error)}`); } }
