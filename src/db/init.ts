import { createCategory } from "./repository/category";
import { createAccount } from "./repository/account";
import { getSettings, saveSettings } from "./repository/settings";
import { getAllCategory } from "./repository/category";
import { getAllAccounts } from "./repository/account";

const DefaultCategories = [
    {
        name: "Food",
        icon: "🍔",
        color: "#FF6B6B",
        type: "expense",
        isDefault: true,
    },
    {
        name: "Transport",
        icon: "🚕",
        color: "#4ECDC4",
        type: "expense",
        isDefault: true,
    },
    {
        name: "Shopping",
        icon: "🛒",
        color: "#A78BFA",
        type: "expense",
        isDefault: true,
    },
    {
        name: "Health",
        icon: "💊",
        color: "#22C55E",
        type: "expense",
        isDefault: true,
    },
    {
        name: "Entertainment",
        icon: "🎮",
        color: "#F59E0B",
        type: "expense",
        isDefault: true,
    },
    {
        name: "Salary",
        icon: "💰",
        color: "#10B981",
        type: "income",
        isDefault: true,
    },
    {
        name: "Gift",
        icon: "🎁",
        color: "#EC4899",
        type: "income",
        isDefault: true,
    },
];

async function seedCategories() {
  const categories = await getAllCategory();

  if (categories.length > 0) {
    return;
  }

  for (const category of DefaultCategories) {
    await createCategory(category);
  }
}

async function seedAccounts() {
  const accounts = await getAllAccounts();

  if (accounts.length > 0) {
    return;
  }

  await createAccount({
    name: "Cash",
    type: "cash",
    balance: 0,
    currency: "INR",
    icon: "💵",
    color: "#1ec05a",
    isDefault: true,
  });
}

async function seedSettings() {
  const settings = await getSettings();

  if (settings) {
    return;
  }

  await saveSettings({
    id: 1,
    currency: "INR",
    theme: "system",
    language: "en",
    biometricEnabled: false,
    updatedAt: Date.now(),
  });
}

export async function initializeDatabase() {
  await seedCategories();
  await seedAccounts();
  await seedSettings();
}