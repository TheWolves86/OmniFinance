import { db } from "../index"
import { Loans } from "../schema"
import { randomUUID } from "expo-crypto"
import { eq } from "drizzle-orm"

type CreateLoan = {
    title: string;
    principal: number;
    interestRate: number;
    monthlyAmount: number;
    remainingAmount: number;
    totalMonths: number;
    paidMonths: number;
    status: string;
};

type UpdateLoan = CreateLoan

//function to create a loan
export async function createLoan(data: CreateLoan, tx: any = db) {
    const now = Date.now()

    await tx.insert(Loans).values({
        id: randomUUID(),
        title: data.title,
        principal: data.principal,
        interestRate: data.interestRate,
        monthlyAmount: data.monthlyAmount,
        remainingAmount: data.remainingAmount,
        totalMonths: data.totalMonths,
        paidMonths: data.paidMonths,
        status: data.status,
        createdAt: now,
        updatedAt: now,
    });
}

//function to get a loan by id
export async function getLoanById(id: string, tx: any = db) {
  const result = await tx
    .select()
    .from(Loans)
    .where(eq(Loans.id, id));

  return result[0] ?? null;
}

//function to get all loans
export async function getAllLoans(tx: any = db) {
  return await tx.select().from(Loans);
}


//function to update a loan
export async function updateLoans(
  id: string,
  data: UpdateLoan,
  tx: any = db
) {
  await tx
    .update(Loans)
    .set({
        title: data.title,
        principal: data.principal,
        interestRate: data.interestRate,
        monthlyAmount: data.monthlyAmount,
        remainingAmount: data.remainingAmount,
        totalMonths: data.totalMonths,
        paidMonths: data.paidMonths,
        status: data.status,
      updatedAt: Date.now(),
    })
    .where(eq(Loans.id, id));
}

//function to delete a loan
export async function deleteLoans(id: string, tx: any = db) {
  await tx
    .delete(Loans)
    .where(eq(Loans.id, id));
}

//function to pay emi
export async function payEmi(id: string, tx: any = db) {
  const loan = await getLoanById(id, tx);

  if (!loan) return;

  const remaining =
    loan.remainingAmount -
    loan.monthlyAmount;

  const paidMonths =
    loan.paidMonths + 1;

  await tx
    .update(Loans)
    .set({
      remainingAmount: Math.max(
        0,
        remaining
      ),
      paidMonths,
      status:
        remaining <= 0
          ? "completed"
          : "active",
      updatedAt: Date.now(),
    })
    .where(eq(Loans.id, id));
}
