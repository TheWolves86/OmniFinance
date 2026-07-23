import { db } from "@/src/db";
import { createGoal, getAllGoals, getGoalById, updateGoal } from "@/src/db/repository/goal";
type CreateGoalData = Parameters<typeof createGoal>[0];
export async function createGoalService(data:CreateGoalData){
    try {
        return await createGoal(data);
    } catch (error) {
        console.error("Error creating goal:", error);
        throw error;
    }
}
export async function addMoneyToGoal(goalId:string,amount:number){
    try {
        await db.withTransactionAsync(async()=>{
            const goal=await getGoalById(goalId);
            if(!goal)throw new Error("Goal not found");
            const savedAmount=goal.savedAmount+amount;
            await updateGoal(goalId,{title:goal.title,description:goal.description??undefined,targetAmount:goal.targetAmount,savedAmount,targetDate:goal.targetDate??undefined,isCompleted:savedAmount>=goal.targetAmount});
        });
    } catch (error) {
        console.error("Error adding money to goal:", error);
        throw error;
    }
}
export async function withdrawMoneyFromGoal(goalId:string,amount:number){
    try {
        await db.withTransactionAsync(async()=>{
            const goal=await getGoalById(goalId);
            if(!goal)throw new Error("Goal not found");
            const savedAmount=Math.max(0,goal.savedAmount-amount);
            await updateGoal(goalId,{title:goal.title,description:goal.description??undefined,targetAmount:goal.targetAmount,savedAmount,targetDate:goal.targetDate??undefined,isCompleted:false});
        });
    } catch (error) {
        console.error("Error withdrawing money from goal:", error);
        throw error;
    }
}
export async function getGoalProgress(goalId:string){
    try {
        const goal=await getGoalById(goalId);
        if(!goal)throw new Error("Goal not found");
        return goal.targetAmount===0?0:(goal.savedAmount/goal.targetAmount)*100;
    } catch (error) {
        console.error("Error getting goal progress:", error);
        throw error;
    }
}
export async function getCompletedGoals(){
    try {
        return (await getAllGoals()).filter((goal:any)=>Boolean(goal.isCompleted));
    } catch (error) {
        console.error("Error getting completed goals:", error);
        throw error;
    }
}
export async function getActiveGoals(){
    try {
        return (await getAllGoals()).filter((goal:any)=>!goal.isCompleted);
    } catch (error) {
        console.error("Error getting active goals:", error);
        throw error;
    }
}
export async function getTotalGoalSavings(){
    try {
        return (await getAllGoals()).reduce((sum:number,goal:any)=>sum+goal.savedAmount,0);
    } catch (error) {
        console.error("Error getting total goal savings:", error);
        throw error;
    }
}
