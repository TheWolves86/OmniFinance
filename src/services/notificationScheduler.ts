import { getAllBills } from "@/src/db/repository/bills";
import { getAllGoals } from "@/src/db/repository/goal";
import { getAllInsurance } from "@/src/db/repository/insurance";
import { getAllBudgets, getBudgetSpent } from "@/src/db/repository/budget";
import { publishNotification } from "./notificationService";
import * as Notifications from "expo-notifications";

const day = 86400000;
export async function refreshScheduledFinancialNotifications() {
  const now = Date.now();
  // Rebuild this app's future schedule from current local data so edits,
  // deletions, completed goals, and disabled preferences do not leave stale reminders.
  await Notifications.cancelAllScheduledNotificationsAsync();
  const [bills, goals, insurance, budgets] = await Promise.all([getAllBills(), getAllGoals(), getAllInsurance(), getAllBudgets()]);
  for (const bill of bills as any[]) {
    const days = Math.ceil((Number(bill.dueDate) - now) / day);
    if (!bill.isPaid && days >= 0 && days <= 7) await publishNotification({ category: "bills", title: String(bill.title) + " bill due in " + days + " day" + (days === 1 ? "" : "s"), description: "₹" + Number(bill.amount).toLocaleString("en-IN"), actionRoute: "/(quick_name)/bills", actionParams: JSON.stringify({ billId: bill.id }), dedupeKey: "bill:" + bill.id + ":" + new Date(bill.dueDate).toISOString().slice(0, 10) }, { notify: true });
  }
  for (const goal of goals as any[]) {
    if (!goal.isCompleted && Number(goal.targetAmount) > 0) {
      const percent = Math.round((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100);
      if (percent >= 50) await publishNotification({ category: "goals", title: String(goal.title) + " is " + percent + "% complete", description: "Keep building toward your goal.", actionRoute: "/(tabs)/goals", dedupeKey: "goal:" + goal.id + ":" + percent }, { notify: false });
    }
  }
  for (const policy of insurance as any[]) {
    const days = Math.ceil((Number(policy.renewalDate) - now) / day);
    if (days >= 0 && days <= 30) await publishNotification({ category: "insurance", title: String(policy.policyName) + " renews in " + days + " days", description: String(policy.providerName) + " · ₹" + Number(policy.premiumAmount).toLocaleString("en-IN"), actionRoute: "/(quick_name)/insurance", dedupeKey: "insurance:" + policy.id + ":" + new Date(policy.renewalDate).toISOString().slice(0, 10) }, { notify: true });
  }
  const month = new Date().toISOString().slice(0, 7);
  for (const budget of budgets as any[]) {
    if (budget.month !== month) continue;
    const spent = await getBudgetSpent(budget.categoryId, month);
    const used = budget.amount ? Math.round((spent / budget.amount) * 100) : 0;
    if (used >= 80) await publishNotification({ category: "budgets", title: "Budget is " + used + "% used", description: "Review your spending before the month ends.", actionRoute: "/(quick_name)/budgets", dedupeKey: "budget:" + budget.id + ":" + month + ":" + used }, { notify: false });
  }
}
