import { db } from "../index";
import { Accounts } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq, count } from "drizzle-orm";

//type for creating an account
type createAccount = {
    name: string;
    type: string;
    balance: number;
    currency: string;
    icon?: string;
    color?: string;
    isDefault: boolean;
};

//function to create an account
export async function createAccount(data: createAccount, tx: any = db) {
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
}

//function to get an account by id
export async function getAccountById(id: string, tx: any = db) {
    const result = await tx
        .select()
        .from(Accounts)
        .where(eq(Accounts.id, id));

    return result[0] ?? null;
};

//function to get all accounts
export async function getAllAccounts(tx: any = db) {
  return await tx.select().from(Accounts);
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
};

//function to delete an account
export async function deleteAccount(id: string, tx: any = db){
    await tx
        .delete(Accounts)
        .where(eq(Accounts.id, id));
}

//function to update the account's balance
export async function updateBalance(id: string,balance: number, tx: any = db) {
  await tx
    .update(Accounts)
    .set({
      balance,
      updatedAt: Date.now(),
    })
    .where(eq(Accounts.id, id));
};

//function to get total account count
export async function getAccountCount(){
  const result = await db
    .select({
      count: count()
    })
    .from(Accounts)

  return result[0].count;
}

