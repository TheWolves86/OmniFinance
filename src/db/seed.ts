import { db } from "./index";
import { createAccount } from "./repository/account";
import { createCategory } from "./repository/category";

const expenseCategories = [
  ["Food & Drinks", "fast-food-outline"], ["Transportation", "car-outline"],
  ["Groceries", "basket-outline"], ["Utilities", "flash-outline"],
  ["Housing", "home-outline"], ["Personal Care", "heart-outline"],
  ["Savings", "wallet-outline"], ["Entertainment", "film-outline"],
  ["Miscellaneous", "cube-outline"], ["Other", "ellipsis-horizontal-circle-outline"],
] as const;
const incomeCategories = [
  ["Salary", "cash-outline"], ["Freelance", "laptop-outline"],
  ["Business", "briefcase-outline"], ["Investment", "trending-up-outline"],
  ["Interest", "stats-chart-outline"], ["Gift", "gift-outline"],
  ["Refund", "refresh-outline"], ["Other", "ellipsis-horizontal-circle-outline"],
] as const;

export async function seedDatabase(): Promise<void> {
  await db.withTransactionAsync(async () => {
    const categoryCount = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM categories");
    if (!categoryCount?.count) {
      for (const [name, icon] of expenseCategories) {
        await createCategory({ name, icon, color: "#4caf50", type: "expense", isDefault: true });
      }
      for (const [name, icon] of incomeCategories) {
        await createCategory({ name, icon, color: "#2196f3", type: "income", isDefault: true });
      }
    }
    const accountCount = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM accounts");
    if (!accountCount?.count) {
      await createAccount({ name: "Cash", type: "cash", balance: 0, currency: "INR", icon: "wallet-outline", color: "#34C759", isDefault: true });
    }
  });
}
