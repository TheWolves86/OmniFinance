import { getAllAccounts, getAccountById, updateAccount } from "@/src/db/repository/account";
import { getAllTransaction, getTransactionById, createTransaction, updateTransaction, deleteTransaction } from "@/src/db/repository/transaction";
import { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal, addSavings } from "@/src/db/repository/goal";
import { getAllBills, getBillById, createBill, updateBill, deleteBill } from "@/src/db/repository/bills";
import { getAllBudgets, getBudgetById, updateBudget, deleteBudget, createBudget, getBudgetsForMonth, getBudgetSpent } from "@/src/db/repository/budget";
import { getAllLoans, getLoanById } from "@/src/db/repository/loan";
import { getAllInsurance, getInsuranceById } from "@/src/db/repository/insurance";
import { getAllCategory } from "@/src/db/repository/category";
import { getPendingDetectedTransactions, getPausedDetectedTransactions, getDetectedTransactionById } from "@/src/db/repository/detectedTransaction";
import { getDashboardData } from "@/src/services/dashboardService";
import { addTransaction, deleteTransactionService, editTransactionService } from "@/src/services/transactionService";
import { addMoneyToGoal } from "@/src/services/goalService";
import { payBill } from "@/src/services/billService";
import { approveDetectedTransaction, setDetectedStatus, editDetectedTransaction } from "@/src/services/detectedTransactionService";
import { emitTransactionChanged } from "@/src/components/transactionSheetController";
import { emitAccountChanged } from "@/src/components/accountSheetController";
import { emitGoalChanged } from "@/src/components/goalSheetController";
import { emitBillChanged } from "@/src/components/billsSheetController";
import { emitBudgetChanged } from "@/src/components/budgetSheetController";
import { createGoalService } from "@/src/services/goalService";
import { createInsurance, updateInsurance, deleteInsurance } from "@/src/db/repository/insurance";
import { emitInsuranceChanged } from "@/src/components/insuranceSheetController";

export type PendingAction = { name: string; arguments: Record<string, unknown>; summary: string };
export const AI_TOOLS = [
  { name: "getAccounts", description: "Read all account balances.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getTransactions", description: "Read recent confirmed ledger transactions. Use limit and optional date range.", parameters: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100 }, from: { type: "integer" }, to: { type: "integer" } }, additionalProperties: false } },
  { name: "getGoals", description: "Read savings goals and progress.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getBills", description: "Read bills and payment status.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getBudgets", description: "Read budgets for a YYYY-MM month.", parameters: { type: "object", properties: { month: { type: "string" } }, additionalProperties: false } },
  { name: "getLoans", description: "Read loans and remaining balances.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getInsurance", description: "Read insurance policies and renewal dates.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getCategories", description: "Read available categories.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getDetectedTransactions", description: "Read pending, paused, or duplicate detected transactions; these are not confirmed ledger entries.", parameters: { type: "object", properties: { status: { type: "string", enum: ["pending", "paused"] } }, additionalProperties: false } },
  { name: "getFinancialSummary", description: "Read current balance, monthly income, expenses, savings, and budget usage.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "createTransaction", description: "Create a confirmed ledger transaction only after user confirmation.", parameters: { type: "object", required: ["title", "amount", "type", "categoryId", "accountId", "transactionDate"], properties: { title: { type: "string" }, amount: { type: "number", minimum: 0.01 }, type: { type: "string", enum: ["income", "expense"] }, categoryId: { type: "string" }, accountId: { type: "string" }, note: { type: "string" }, transactionDate: { type: "integer" } }, additionalProperties: false } },
  { name: "deleteTransaction", description: "Delete a confirmed transaction after user confirmation.", parameters: { type: "object", required: ["transactionId"], properties: { transactionId: { type: "string" } }, additionalProperties: false } },
  { name: "addGoalSavings", description: "Add savings to a goal after user confirmation.", parameters: { type: "object", required: ["goalId", "amount"], properties: { goalId: { type: "string" }, amount: { type: "number", minimum: 0.01 } }, additionalProperties: false } },
  { name: "markBillPaid", description: "Mark a bill paid and create its expense after user confirmation.", parameters: { type: "object", required: ["billId", "accountId", "categoryId"], properties: { billId: { type: "string" }, accountId: { type: "string" }, categoryId: { type: "string" } }, additionalProperties: false } },
  { name: "updateBudget", description: "Update a budget after user confirmation.", parameters: { type: "object", required: ["budgetId", "categoryId", "amount", "month"], properties: { budgetId: { type: "string" }, categoryId: { type: "string" }, amount: { type: "number", minimum: 0 }, month: { type: "string" } }, additionalProperties: false } },
  { name: "approveDetectedTransaction", description: "Approve a detected transaction only after user confirmation; this is the only path that posts it to the ledger.", parameters: { type: "object", required: ["id"], properties: { id: { type: "string" } }, additionalProperties: false } },
  { name: "pauseDetectedTransaction", description: "Pause a detected transaction after user confirmation.", parameters: { type: "object", required: ["id"], properties: { id: { type: "string" } }, additionalProperties: false } },
  { name: "deleteDetectedTransaction", description: "Delete a detected transaction after user confirmation.", parameters: { type: "object", required: ["id"], properties: { id: { type: "string" } }, additionalProperties: false } },
  { name: "updateTransaction", description: "Edit a confirmed transaction after user confirmation.", parameters: { type: "object", required: ["transactionId", "title", "amount", "type", "categoryId", "accountId", "transactionDate"], properties: { transactionId: { type: "string" }, title: { type: "string" }, amount: { type: "number", minimum: 0.01 }, type: { type: "string", enum: ["income", "expense"] }, categoryId: { type: "string" }, accountId: { type: "string" }, transactionDate: { type: "integer" } }, additionalProperties: false } },
  { name: "createGoal", description: "Create a savings goal after confirmation.", parameters: { type: "object", required: ["title", "targetAmount"], properties: { title: { type: "string" }, targetAmount: { type: "number", minimum: 0.01 }, description: { type: "string" }, targetDate: { type: "integer" } }, additionalProperties: false } },
  { name: "deleteGoal", description: "Delete a savings goal after confirmation.", parameters: { type: "object", required: ["goalId"], properties: { goalId: { type: "string" } }, additionalProperties: false } },
  { name: "deleteBill", description: "Delete a bill after confirmation.", parameters: { type: "object", required: ["billId"], properties: { billId: { type: "string" } }, additionalProperties: false } },
  { name: "deleteInsurance", description: "Delete an insurance policy after confirmation.", parameters: { type: "object", required: ["insuranceId"], properties: { insuranceId: { type: "string" } }, additionalProperties: false } },
  { name: "updateGoal", description: "Update a savings goal after confirmation.", parameters: { type: "object", required: ["goalId", "title", "targetAmount"], properties: { goalId: { type: "string" }, title: { type: "string" }, targetAmount: { type: "number", minimum: 0.01 }, savedAmount: { type: "number", minimum: 0 }, targetDate: { type: "integer" } }, additionalProperties: false } },
  { name: "createBill", description: "Create a bill reminder after confirmation.", parameters: { type: "object", required: ["title", "amount", "dueDate"], properties: { title: { type: "string" }, amount: { type: "number", minimum: 0.01 }, dueDate: { type: "integer" }, categoryId: { type: "string" }, accountId: { type: "string" }, notes: { type: "string" } }, additionalProperties: false } },
  { name: "updateBill", description: "Update a bill after confirmation.", parameters: { type: "object", required: ["billId", "title", "amount", "dueDate"], properties: { billId: { type: "string" }, title: { type: "string" }, amount: { type: "number", minimum: 0.01 }, dueDate: { type: "integer" }, categoryId: { type: "string" }, accountId: { type: "string" }, notes: { type: "string" } }, additionalProperties: false } },
  { name: "createInsurance", description: "Create an insurance policy after confirmation.", parameters: { type: "object", required: ["providerName", "policyName", "policyType", "premiumAmount", "renewalDate"], properties: { providerName: { type: "string" }, policyName: { type: "string" }, policyType: { type: "string" }, premiumAmount: { type: "number", minimum: 0 }, renewalDate: { type: "integer" }, description: { type: "string" } }, additionalProperties: false } },
  { name: "updateInsurance", description: "Update an insurance policy after confirmation.", parameters: { type: "object", required: ["insuranceId", "providerName", "policyName", "policyType", "premiumAmount", "renewalDate"], properties: { insuranceId: { type: "string" }, providerName: { type: "string" }, policyName: { type: "string" }, policyType: { type: "string" }, premiumAmount: { type: "number", minimum: 0 }, renewalDate: { type: "integer" }, description: { type: "string" } }, additionalProperties: false } },
] as const;

const writeTools: Set<string> = new Set(AI_TOOLS.slice(10).map((tool) => tool.name));
function number(value: unknown, name: string, min = 0) { const result = Number(value); if (!Number.isFinite(result) || result < min) throw new Error("Invalid " + name); return result; }
function id(value: unknown, name: string) { if (typeof value !== "string" || !value.trim()) throw new Error("Missing " + name); return value; }

export async function executeAITool(name: string, args: Record<string, unknown>, confirm = false): Promise<{ result?: unknown; pendingAction?: PendingAction }> {
  if (!AI_TOOLS.some((tool) => tool.name === name as any)) throw new Error("Unsupported AI tool");
  if (writeTools.has(name) && !confirm) {
    const summaries: Record<string, string> = { createTransaction: "Create this transaction", updateTransaction: "Edit this confirmed transaction", deleteTransaction: "Delete this confirmed transaction", createGoal: "Create this goal", updateGoal: "Update this goal", deleteGoal: "Delete this goal", addGoalSavings: "Add savings to this goal", markBillPaid: "Mark this bill paid", createBill: "Create this bill", updateBill: "Update this bill", deleteBill: "Delete this bill", updateBudget: "Update this budget", createInsurance: "Create this insurance policy", updateInsurance: "Update this insurance policy", deleteInsurance: "Delete this insurance policy", approveDetectedTransaction: "Approve this detected transaction and add it to the ledger", pauseDetectedTransaction: "Pause this detected transaction", deleteDetectedTransaction: "Delete this detected transaction" };
    const amountPreview = args.amount !== undefined ? " · ₹" + Number(args.amount).toLocaleString("en-IN") : "";
    return { pendingAction: { name, arguments: args, summary: summaries[name] + amountPreview } };
  }
  if (name === "getAccounts") return { result: await getAllAccounts() };
  if (name === "getTransactions") {
    const rows: any[] = await getAllTransaction();
    const from = args.from ? number(args.from, "from date") : 0, to = args.to ? number(args.to, "to date") : Date.now();
    return { result: rows.filter((row) => row.transactionDate >= from && row.transactionDate <= to).slice(0, Math.min(number(args.limit ?? 50, "limit", 1), 100)) };
  }
  if (name === "getGoals") return { result: await getAllGoals() };
  if (name === "getBills") return { result: await getAllBills() };
  if (name === "getBudgets") return { result: await getBudgetsForMonth(typeof args.month === "string" ? args.month : new Date().toISOString().slice(0, 7)) };
  if (name === "getLoans") return { result: await getAllLoans() };
  if (name === "getInsurance") return { result: await getAllInsurance() };
  if (name === "getCategories") return { result: await getAllCategory() };
  if (name === "getDetectedTransactions") return { result: args.status === "paused" ? await getPausedDetectedTransactions() : await getPendingDetectedTransactions() };
  if (name === "getFinancialSummary") return { result: await getDashboardData() };
  if (name === "createTransaction") { await addTransaction({ title: id(args.title, "title"), amount: number(args.amount, "amount", 0.01), type: id(args.type, "type"), categoryId: id(args.categoryId, "category"), accountId: id(args.accountId, "account"), note: typeof args.note === "string" ? args.note : undefined, transactionDate: number(args.transactionDate, "transaction date", 1) }); emitTransactionChanged(); emitAccountChanged(); return { result: { success: true } }; }
  if (name === "updateTransaction") { const transaction = await getTransactionById(id(args.transactionId, "transaction")); if (!transaction) throw new Error("Transaction not found"); await editTransactionService(transaction.id, { title: id(args.title, "title"), amount: number(args.amount, "amount", 0.01), type: id(args.type, "type"), categoryId: id(args.categoryId, "category"), accountId: id(args.accountId, "account"), note: typeof args.note === "string" ? args.note : undefined, transactionDate: number(args.transactionDate, "transaction date", 1) }); emitTransactionChanged(); emitAccountChanged(); return { result: { success: true } }; }
  if (name === "deleteTransaction") { await deleteTransactionService(id(args.transactionId, "transaction")); emitTransactionChanged(); emitAccountChanged(); return { result: { success: true } }; }
  if (name === "createGoal") { await createGoalService({ title: id(args.title, "title"), description: typeof args.description === "string" ? args.description : undefined, targetAmount: number(args.targetAmount, "target amount", 0.01), savedAmount: 0, targetDate: args.targetDate ? number(args.targetDate, "target date", 1) : undefined, isCompleted: false }); emitGoalChanged(); return { result: { success: true } }; }
  if (name === "deleteGoal") { await deleteGoal(id(args.goalId, "goal")); emitGoalChanged(); return { result: { success: true } }; }
  if (name === "updateGoal") { const goal = await getGoalById(id(args.goalId, "goal")); if (!goal) throw new Error("Goal not found"); await updateGoal(goal.id, { title: id(args.title, "title"), description: goal.description ?? undefined, targetAmount: number(args.targetAmount, "target amount", 0.01), savedAmount: args.savedAmount === undefined ? goal.savedAmount : number(args.savedAmount, "saved amount"), targetDate: args.targetDate ? number(args.targetDate, "target date", 1) : goal.targetDate ?? undefined, isCompleted: Boolean(goal.isCompleted) }); emitGoalChanged(); return { result: { success: true } }; }
  if (name === "addGoalSavings") { await addMoneyToGoal(id(args.goalId, "goal"), number(args.amount, "amount", 0.01)); emitGoalChanged(); return { result: { success: true } }; }
  if (name === "markBillPaid") { await payBill(id(args.billId, "bill"), id(args.accountId, "account"), id(args.categoryId, "category")); emitBillChanged(); emitTransactionChanged(); emitAccountChanged(); return { result: { success: true } }; }
  if (name === "deleteBill") { await deleteBill(id(args.billId, "bill")); emitBillChanged(); return { result: { success: true } }; }
  if (name === "createBill") { await createBill({ title: id(args.title, "title"), amount: number(args.amount, "amount", 0.01), dueDate: number(args.dueDate, "due date", 1), categoryId: typeof args.categoryId === "string" ? args.categoryId : null, accountId: typeof args.accountId === "string" ? args.accountId : null, notes: typeof args.notes === "string" ? args.notes : null }); emitBillChanged(); return { result: { success: true } }; }
  if (name === "updateBill") { await updateBill(id(args.billId, "bill"), { title: id(args.title, "title"), amount: number(args.amount, "amount", 0.01), dueDate: number(args.dueDate, "due date", 1), categoryId: typeof args.categoryId === "string" ? args.categoryId : null, accountId: typeof args.accountId === "string" ? args.accountId : null, notes: typeof args.notes === "string" ? args.notes : null }); emitBillChanged(); return { result: { success: true } }; }
  if (name === "updateBudget") { await updateBudget(id(args.budgetId, "budget"), { categoryId: id(args.categoryId, "category"), amount: number(args.amount, "amount"), month: id(args.month, "month") }); emitBudgetChanged(); emitTransactionChanged(); return { result: { success: true } }; }
  if (name === "createInsurance") { await createInsurance({ providerName: id(args.providerName, "provider"), policyName: id(args.policyName, "policy"), policyType: id(args.policyType, "policy type"), premiumAmount: number(args.premiumAmount, "premium", 0), renewalDate: number(args.renewalDate, "renewal date", 1), description: typeof args.description === "string" ? args.description : null }); emitInsuranceChanged(); return { result: { success: true } }; }
  if (name === "updateInsurance") { await updateInsurance(id(args.insuranceId, "insurance"), { providerName: id(args.providerName, "provider"), policyName: id(args.policyName, "policy"), policyType: id(args.policyType, "policy type"), premiumAmount: number(args.premiumAmount, "premium", 0), renewalDate: number(args.renewalDate, "renewal date", 1), description: typeof args.description === "string" ? args.description : null }); emitInsuranceChanged(); return { result: { success: true } }; }
  if (name === "deleteInsurance") { await deleteInsurance(id(args.insuranceId, "insurance")); emitInsuranceChanged(); return { result: { success: true } }; }
  if (name === "approveDetectedTransaction") { await approveDetectedTransaction(id(args.id, "detected transaction")); return { result: { success: true } }; }
  if (name === "pauseDetectedTransaction") { await setDetectedStatus(id(args.id, "detected transaction"), "paused"); return { result: { success: true } }; }
  if (name === "deleteDetectedTransaction") { await setDetectedStatus(id(args.id, "detected transaction"), "deleted"); return { result: { success: true } }; }
  return { result: null };
}
