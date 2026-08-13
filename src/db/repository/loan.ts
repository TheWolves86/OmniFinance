import { randomUUID } from "expo-crypto";
import { db } from "../index";

export type Loan = {
  id: string; name: string; lender: string; totalAmount: number; remainingAmount: number;
  monthlyEMI: number; totalMonths: number; paidMonths: number; status: string;
  createdAt?: number; updatedAt?: number;
};
export type LoanInput = Omit<Loan, "id" | "createdAt" | "updatedAt" | "status"> & { status?: string };
const columns = `id, title AS name, lender, principal AS totalAmount,
  remaining_amount AS remainingAmount, monthly_amount AS monthlyEMI,
  total_months AS totalMonths, paid_months AS paidMonths, status,
  created_at AS createdAt, updated_at AS updatedAt`;

export async function createLoan(data: LoanInput, tx: any = db) {
  try {
    const now = Date.now();
    await tx.runAsync(
      `INSERT INTO loans (id,title,lender,principal,interest_rate,monthly_amount,remaining_amount,total_months,paid_months,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      randomUUID(), data.name, data.lender, data.totalAmount, 0, data.monthlyEMI,
      data.remainingAmount, data.totalMonths, data.paidMonths, data.status ?? "active", now, now
    );
  } catch (error) { throw new Error(`Unable to create loan: ${String(error)}`); }
}
export async function getLoanById(id: string, tx: any = db) {
  try { return await tx.getFirstAsync(`SELECT ${columns} FROM loans WHERE id=?`, id) as Loan | null; }
  catch (error) { throw new Error(`Unable to fetch loan: ${String(error)}`); }
}
export async function getAllLoans(tx: any = db) {
  try { return await tx.getAllAsync(`SELECT ${columns} FROM loans ORDER BY created_at DESC`) as Loan[]; }
  catch (error) { throw new Error(`Unable to fetch loans: ${String(error)}`); }
}
export async function updateLoan(id: string, data: LoanInput, tx: any = db) {
  try {
    await tx.runAsync(
      `UPDATE loans SET title=?,lender=?,principal=?,monthly_amount=?,remaining_amount=?,total_months=?,paid_months=?,status=?,updated_at=? WHERE id=?`,
      data.name, data.lender, data.totalAmount, data.monthlyEMI, data.remainingAmount,
      data.totalMonths, data.paidMonths, data.status ?? "active", Date.now(), id
    );
  } catch (error) { throw new Error(`Unable to update loan: ${String(error)}`); }
}
export async function deleteLoan(id: string, tx: any = db) {
  try { await tx.runAsync("DELETE FROM loans WHERE id=?", id); }
  catch (error) { throw new Error(`Unable to delete loan: ${String(error)}`); }
}
export async function makeLoanPayment(loanId: string, accountId: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment must be greater than 0");
  try {
    await db.withExclusiveTransactionAsync(async () => {
      const loan = await getLoanById(loanId);
      if (!loan) throw new Error("Loan not found");
      if (!Number.isFinite(loan.monthlyEMI) || loan.monthlyEMI <= 0) throw new Error("This loan has an invalid monthly EMI");
      if (amount > loan.remainingAmount) throw new Error("Payment cannot exceed the remaining loan amount");
      const account = await db.getFirstAsync("SELECT balance FROM accounts WHERE id=?", accountId) as { balance: number } | null;
      if (!account) throw new Error("Account not found");
      if (amount > account.balance) throw new Error("Insufficient account balance");
      const remainingAmount = Math.max(0, loan.remainingAmount - amount);
      const paidMonths = Math.min(loan.totalMonths, loan.paidMonths + Math.max(1, Math.round(amount / loan.monthlyEMI)));
      const now = Date.now();
      await db.runAsync("UPDATE accounts SET balance=balance-?,updated_at=? WHERE id=? AND balance>=?", amount, now, accountId, amount);
      await db.runAsync("UPDATE loans SET remaining_amount=?,paid_months=?,status=?,updated_at=? WHERE id=?", remainingAmount, paidMonths, remainingAmount === 0 ? "completed" : "active", now, loanId);
    });
  } catch (error) {
    throw new Error(`Unable to make loan payment: ${String(error)}`);
  }
}
