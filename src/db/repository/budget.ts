import { randomUUID } from "expo-crypto";
import { db } from "../index";
type BudgetInput={categoryId:string;limit:number;month:number;year:number};
const columns="id,category_id AS categoryId,\"limit\",month,year,created_at AS createdAt,updated_at AS updatedAt";
export async function createBudget(data:BudgetInput,tx:any=db){try{const now=Date.now();await tx.runAsync("INSERT INTO budgets (id,category_id,\"limit\",month,year,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",randomUUID(),data.categoryId,data.limit,data.month,data.year,now,now);}catch(error){throw new Error(`Unable to create budget: ${String(error)}`);}}
export async function getBudgetById(id:string,tx:any=db){try{return await tx.getFirstAsync(`SELECT ${columns} FROM budgets WHERE id=?`,id);}catch(error){throw new Error(`Unable to fetch budget: ${String(error)}`);}}
export async function getAllBudgets(tx:any=db){try{return await tx.getAllAsync(`SELECT ${columns} FROM budgets ORDER BY year DESC,month DESC`);}catch(error){throw new Error(`Unable to fetch budgets: ${String(error)}`);}}
export async function updateBudget(id:string,data:BudgetInput,tx:any=db){try{await tx.runAsync("UPDATE budgets SET category_id=?,\"limit\"=?,month=?,year=?,updated_at=? WHERE id=?",data.categoryId,data.limit,data.month,data.year,Date.now(),id);}catch(error){throw new Error(`Unable to update budget: ${String(error)}`);}}
export async function deleteBudget(id:string,tx:any=db){try{await tx.runAsync("DELETE FROM budgets WHERE id=?",id);}catch(error){throw new Error(`Unable to delete budget: ${String(error)}`);}}
export async function getBudgetByMonth(month:number,year:number,tx:any=db){try{return await tx.getAllAsync(`SELECT ${columns} FROM budgets WHERE month=? AND year=?`,month,year);}catch(error){throw new Error(`Unable to fetch monthly budget: ${String(error)}`);}}
