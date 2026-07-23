import { db } from "@/src/db";
import { createGoal, getAllGoals, getGoalById, updateGoal } from "@/src/db/repository/goal";
type CreateGoalData = Parameters<typeof createGoal>[0];
export async function createGoalService(data:CreateGoalData){return createGoal(data);}
export async function addMoneyToGoal(goalId:string,amount:number){await db.withTransactionAsync(async()=>{const goal=await getGoalById(goalId);if(!goal)throw new Error("Goal not found");const savedAmount=goal.savedAmount+amount;await updateGoal(goalId,{title:goal.title,description:goal.description??undefined,targetAmount:goal.targetAmount,savedAmount,targetDate:goal.targetDate??undefined,isCompleted:savedAmount>=goal.targetAmount});});}
export async function withdrawMoneyFromGoal(goalId:string,amount:number){await db.withTransactionAsync(async()=>{const goal=await getGoalById(goalId);if(!goal)throw new Error("Goal not found");const savedAmount=Math.max(0,goal.savedAmount-amount);await updateGoal(goalId,{title:goal.title,description:goal.description??undefined,targetAmount:goal.targetAmount,savedAmount,targetDate:goal.targetDate??undefined,isCompleted:false});});}
export async function getGoalProgress(goalId:string){const goal=await getGoalById(goalId);if(!goal)throw new Error("Goal not found");return goal.targetAmount===0?0:(goal.savedAmount/goal.targetAmount)*100;}
export async function getCompletedGoals(){return (await getAllGoals()).filter((goal:any)=>Boolean(goal.isCompleted));}
export async function getActiveGoals(){return (await getAllGoals()).filter((goal:any)=>!goal.isCompleted);}
export async function getTotalGoalSavings(){return (await getAllGoals()).reduce((sum:number,goal:any)=>sum+goal.savedAmount,0);}
