import { randomUUID } from "expo-crypto";
import { db } from "../index";
type GoalInput={title:string;description?:string;targetAmount:number;savedAmount:number;targetDate?:number;isCompleted:boolean};
const columns="id,title,description,target_amount AS targetAmount,saved_amount AS savedAmount,target_date AS targetDate,is_completed AS isCompleted,created_at AS createdAt,updated_at AS updatedAt";
export async function createGoal(data:GoalInput,tx:any=db){try{const now=Date.now();await tx.runAsync("INSERT INTO goals (id,title,description,target_amount,saved_amount,target_date,is_completed,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",randomUUID(),data.title,data.description??null,data.targetAmount,data.savedAmount,data.targetDate??null,data.isCompleted?1:0,now,now);}catch(error){throw new Error(`Unable to create goal: ${String(error)}`);}}
export async function getGoalById(id:string,tx:any=db){try{return await tx.getFirstAsync(`SELECT ${columns} FROM goals WHERE id=?`,id);}catch(error){throw new Error(`Unable to fetch goal: ${String(error)}`);}}
export async function getAllGoals(tx:any=db){try{return await tx.getAllAsync(`SELECT ${columns} FROM goals ORDER BY created_at DESC`);}catch(error){throw new Error(`Unable to fetch goals: ${String(error)}`);}}
export async function updateGoal(id:string,data:GoalInput,tx:any=db){try{await tx.runAsync("UPDATE goals SET title=?,description=?,target_amount=?,saved_amount=?,target_date=?,is_completed=?,updated_at=? WHERE id=?",data.title,data.description??null,data.targetAmount,data.savedAmount,data.targetDate??null,data.isCompleted?1:0,Date.now(),id);}catch(error){throw new Error(`Unable to update goal: ${String(error)}`);}}
export async function deleteGoal(id:string,tx:any=db){try{await tx.runAsync("DELETE FROM goals WHERE id=?",id);}catch(error){throw new Error(`Unable to delete goal: ${String(error)}`);}}
export async function addSavings(id:string,newAmount:number,tx:any=db){try{const goal=await getGoalById(id,tx);if(!goal)return;const savedAmount=goal.savedAmount+newAmount;await tx.runAsync("UPDATE goals SET saved_amount=?,is_completed=?,updated_at=? WHERE id=?",savedAmount,savedAmount>=goal.targetAmount?1:0,Date.now(),id);}catch(error){throw new Error(`Unable to add savings: ${String(error)}`);}}
export async function allocateMoneyToGoal(
    goalId: string,
    accountId: string,
    amount: number,
    tx: any = db
){
    try {
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const goal = await getGoalById(goalId, tx);

        if (!goal) {
            throw new Error("Goal not found");
        }

        const account = await tx.getFirstAsync(
            "SELECT id, balance FROM accounts WHERE id = ?",
            accountId
        );

        if (!account) {
            throw new Error("Account not found");
        }

        if (account.balance < amount) {
            throw new Error("Insufficient account balance");
        }

        const newSavedAmount = goal.savedAmount + amount;
        const isCompleted = newSavedAmount >= goal.targetAmount ? 1 : 0;

        await tx.runAsync(
            "UPDATE accounts SET balance = balance - ?, updated_at = ? WHERE id = ?",
            amount,
            Date.now(),
            accountId
        );

        await tx.runAsync(
            "UPDATE goals SET saved_amount = ?, is_completed = ?, updated_at = ? WHERE id = ?",
            newSavedAmount,
            isCompleted,
            Date.now(),
            goalId
        );
    } catch (error) {
        console.error("Error allocating money to goal: " + String(error));
    }
}