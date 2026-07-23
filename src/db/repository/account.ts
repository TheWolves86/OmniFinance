import { db } from "../index";
import { Accounts } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq, count } from "drizzle-orm";

//type for creating an account
type CreateAccount = {
    name: string;
    type: string;
    balance: number;
    currency: string;
    icon?: string;
    color?: string;
    isDefault: boolean;
};

//function to create an account
export async function createAccount(data: CreateAccount, tx: any = db) {
  try {
    const now = Date.now();

    await tx.insert(Accounts).values({
        id: randomUUID(),
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        icon: data.icon,
        color: data.color,
        isDefault: data.isDefault,
        createdAt: now,
        updatedAt: now,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

//function to get an account by id
export async function getAccountById(id: string, tx: any = db) {
  try {
    const result = await tx
        .select()
        .from(Accounts)
        .where(eq(Accounts.id, id));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching account by id:", error);
    throw error;
  }
};

//function to get all accounts
export async function getAllAccounts(tx: any = db) {
  try {
    return await tx.select().from(Accounts);
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    throw error;
  }
}

//type for updating an account
type UpdateAccount = {
    name: string;
    type: string;
    balance: number;
    currency: string;
    icon?: string;
    color?: string;
    isDefault: boolean;
}

//function to update account details
export async function updateAccount(
  id: string,
  data: UpdateAccount,
  tx: any = db
) {
  try {
    await tx
      .update(Accounts)
      .set({
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        icon: data.icon,
        color: data.color,
        isDefault: data.isDefault,
        updatedAt: Date.now(),
      })
      .where(eq(Accounts.id, id));
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

//function to delete an account
export async function deleteAccount(id: string, tx: any = db){
  try {
    await tx
        .delete(Accounts)
        .where(eq(Accounts.id, id));
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

//function to update the account's balance
export async function updateBalance(id: string,balance: number, tx: any = db) {
  try {
    await tx
      .update(Accounts)
      .set({
        balance,
        updatedAt: Date.now(),
      })
      .where(eq(Accounts.id, id));
  } catch (error) {
    console.error("Error updating account balance:", error);
    throw error;
  }
};

//function to get total account count
export async function getAccountCount(){
  try {
    const result = await db
      .select({
        count: count()
      })
      .from(Accounts)

    return result[0]?.count ?? 0;
  } catch (error) {
    console.error("Error fetching account count:", error);
    throw error;
  }
}
