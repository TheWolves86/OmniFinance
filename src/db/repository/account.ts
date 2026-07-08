import { db } from "../index";
import { Accounts } from "../schema";
import { randomUUID } from "expo-crypto";
import { eq } from "drizzle-orm";

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
export async function createAccount(data: createAccount) {
    const now = Date.now();

    await db.insert(Accounts).values({
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
export async function getAccountById(id: string) {
    const result = await db
        .select()
        .from(Accounts)
        .where(eq(Accounts.id, id));

    return result[0] ?? null;
};

//function to get all accounts
export async function getAllAccounts() {
  return await db.select().from(Accounts);
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
  data: UpdateAccount
) {
  await db
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
export async function deleteAccount(id: string){
    await db
        .delete(Accounts)
        .where(eq(Accounts.id, id));
}

//function to update the account's balance
export async function updateBalance(id: string,balance: number) {
  await db
    .update(Accounts)
    .set({
      balance,
      updatedAt: Date.now(),
    })
    .where(eq(Accounts.id, id));
};
