import { randomUUID } from "expo-crypto";
import { db } from "../index";

export type Insurance = {
  id: string;
  providerName: string;
  policyName: string;
  policyType: string;
  premiumAmount: number;
  renewalDate: number;
  description?: string | null;
  createdAt?: number;
  updatedAt?: number;
};

export type InsuranceInput = Omit<Insurance, "id" | "createdAt" | "updatedAt">;

const columns = `
  id,
  provider AS providerName,
  policy_name AS policyName,
  policy_type AS policyType,
  premium AS premiumAmount,
  renewal_date AS renewalDate,
  notes AS description,
  created_at AS createdAt,
  updated_at AS updatedAt`;

export async function createInsurance(data: InsuranceInput, tx: any = db) {
  try {
    const now = Date.now();
    await tx.runAsync(
      `INSERT INTO insurance
        (id, provider, policy_name, policy_type, premium, renewal_date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      data.providerName,
      data.policyName,
      data.policyType,
      data.premiumAmount,
      data.renewalDate,
      data.description ?? null,
      now,
      now
    );
  } catch (error) {
    throw new Error(`Unable to create insurance: ${String(error)}`);
  }
}

export async function getInsuranceById(id: string, tx: any = db) {
  try {
    return await tx.getFirstAsync(`SELECT ${columns} FROM insurance WHERE id = ?`, id) as Insurance | null;
  } catch (error) {
    throw new Error(`Unable to fetch insurance: ${String(error)}`);
  }
}

export async function getAllInsurance(tx: any = db) {
  try {
    return await tx.getAllAsync(`SELECT ${columns} FROM insurance ORDER BY renewal_date ASC`) as Insurance[];
  } catch (error) {
    throw new Error(`Unable to fetch insurance: ${String(error)}`);
  }
}

export async function updateInsurance(id: string, data: InsuranceInput, tx: any = db) {
  try {
    await tx.runAsync(
      `UPDATE insurance
       SET provider = ?, policy_name = ?, policy_type = ?, premium = ?,
           renewal_date = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      data.providerName,
      data.policyName,
      data.policyType,
      data.premiumAmount,
      data.renewalDate,
      data.description ?? null,
      Date.now(),
      id
    );
  } catch (error) {
    throw new Error(`Unable to update insurance: ${String(error)}`);
  }
}

export async function deleteInsurance(id: string, tx: any = db) {
  try {
    await tx.runAsync("DELETE FROM insurance WHERE id = ?", id);
  } catch (error) {
    throw new Error(`Unable to delete insurance: ${String(error)}`);
  }
}
