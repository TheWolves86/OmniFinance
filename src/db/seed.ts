import { createCategory, getCategoryCount } from "./repository/category";
import { createAccount, getAccountCount } from "./repository/account";

const defaultExpenseCategories = [
    {
        name: "Food & Drinks",
        icon: "fast-food-outline",
    },
    {
        name: "Transportation",
        icon: "car-outline",
    },
    {
        name: "Croceries",
        icon: "basket-outline"
    },
    {
        name: "Utilities",
        icon: "flash-outline"
    },
    {
        name: "Housing",
        icon: "home-outline"
    },
    {
        name: "Personal Care",
        icon: "heart-outline"
    },
    {
        name: "Savings",
        icon: "wallet-outline"
    },
    {
        name: "Entertainment",
        icon: "film-outlinel"
    },
    {
        name: "Miscellaneous",
        icon: "cube-outline"
    },
    {
        name: "Others",
        icon: "ellipsis-horizontal-circle-outline"
    }
];

const defaultIncomeCategories = [
    {
        name: "Salary",
        icon: "cash-outline"
    },
    {
        name: "Freelance",
        icon: "laptop-outline"
    },
    {
        name: "Business",
        icon: "briefcase-outline"
    },
    {
        name: "Investment",
        icon: "trending-up-outline"
    },
    {
        name: "Interest",
        icon: "stats-chart-outline"
    },
    {
        name: "Refund",
        icon: "refresh-outline"
    },
    {
        name: "Other",
        icon: "ellipsis-horizontal-circle-outline"
    }
];

export async function seedDatabase() {
    const CategoryCount = await getCategoryCount();
    if (CategoryCount === 0) {
        console.log("🌱 Seeding default categories...");

    for (const category of defaultExpenseCategories) {
      await createCategory({
        ...category,
        type: "expense",
        isDefault: true,
        color: "#4caf50",
      });
    }

    for (const category of defaultIncomeCategories) {
        await createCategory ({
            ...category,
            type: "income",
            isDefault: true,
            color: "#2196f3",
        })
    }
    console.log("🌱 Default categories seeded successfully!");
}
    const accountCount = await getAccountCount();
    if (accountCount === 0) {
        console.log("🌱 Seeding Cash accounts...");

        await createAccount({
            name: "Cash",
            type: "cash",
            balance: 0,
            currency: "INR",
            icon: "wallet-outline",
            color: "#34C759",
            isDefault: true,
        })

        console.log("✅ Default account created");
    }
}