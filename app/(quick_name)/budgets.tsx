import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import {
  deleteBudget,
  getBudgetsForMonth,
  getBudgetSpent,
} from "@/src/db/repository/budget";

import {
  presentBudgetsSheet,
  subscribeBudgetRefresh,
} from "@/src/components/budgetSheetController";

import BudgetsBottomSheet from "@/src/components/budgetBottomSheet";

type Budget = {
  id: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  amount: number;
  month: string;
  spent?: number;
};

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] =
    useState<Budget[]>([]);

  const currentMonth = useMemo(() => {
    const date = new Date();

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      const data =
        await getBudgetsForMonth(currentMonth);

      const budgetsWithSpent = await Promise.all(
        (data ?? []).map(async (budget: any) => {
          const spent = await getBudgetSpent(
            budget.categoryId,
            currentMonth
          );

          return {
            ...budget,
            spent,
          };
        })
      );

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error(
        "Error loading budgets: " + String(error)
      );
    }
  }, [currentMonth]);

  useEffect(() => {
    loadBudgets();

    const unsubscribe =
      subscribeBudgetRefresh(() => {
        loadBudgets();
      });

    return unsubscribe;
  }, [loadBudgets]);

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getProgress = (budget: Budget) => {
    if (!budget.amount) return 0;

    return Math.min(
      Math.max((budget.spent ?? 0) / budget.amount, 0),
      1
    );
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      "Delete Budget?",
      `Remove the ${budget.categoryName ?? "budget"} budget?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              await loadBudgets();
            } catch (error) {
              console.error(String(error));
            }
          },
        },
      ]
    );
  };

  const renderBudget = ({
    item,
  }: {
    item: Budget;
  }) => {
    const spent = item.spent ?? 0;
    const remaining = Math.max(
      item.amount - spent,
      0
    );

    const progress = getProgress(item);
    const percent = Math.round(progress * 100);

    const exceeded = spent > item.amount;

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          presentBudgetsSheet({
            mode: "edit",
            budget: item,
          })
        }
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.categoryIcon}>
            <Ionicons
              name={
                (item.categoryIcon as any) ??
                "wallet-outline"
              }
              size={19}
              color="#0B1D3A"
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.categoryName}>
              {item.categoryName ??
                "Category"}
            </Text>

            <Text style={styles.limitText}>
              {formatAmount(spent)} /{" "}
              {formatAmount(item.amount)}
            </Text>
          </View>

          <Text
            style={[
              styles.percent,
              exceeded && styles.exceededPercent,
            ]}
          >
            {exceeded
              ? "OVER"
              : `${percent}%`}
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  (spent / item.amount) * 100,
                  100
                )}%`,
                backgroundColor: exceeded
                  ? "#EF4444"
                  : "#0B1D3A",
              },
            ]}
          />
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.remaining,
              exceeded && styles.exceededText,
            ]}
          >
            {exceeded
              ? `${formatAmount(
                  spent - item.amount
                )} over budget`
              : `${formatAmount(
                  remaining
                )} remaining`}
          </Text>

          <Text style={styles.month}>
            {currentMonth}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudget}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color="#0B1D3A"
                />
              </Pressable>

              <Text style={styles.heading}>
                Budgets
              </Text>
            </View>

            <Text style={styles.subtitle}>
              Keep your spending on track.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                THIS MONTH
              </Text>

              <Text style={styles.summaryAmount}>
                {formatAmount(
                  budgets.reduce(
                    (sum, budget) =>
                      sum + (budget.spent ?? 0),
                    0
                  )
                )}
              </Text>

              <Text style={styles.summarySubtext}>
                spent across {budgets.length}{" "}
                budgets
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="pie-chart-outline"
                size={30}
                color="#9CA3AF"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Budgets Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Set spending limits for your
              categories this month.
            </Text>
          </View>
        }
      />

      {/* Add Budget button */}
      <Pressable
        style={styles.fab}
        onPress={() =>
          presentBudgetsSheet({
            mode: "create",
          })
        }
      >
        <Ionicons
          name="add"
          size={29}
          color="#FFFFFF"
        />
      </Pressable>

      <BudgetsBottomSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  header: {
    paddingTop: 8,
    paddingBottom: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    marginRight: 10,
    paddingVertical: 2,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#7B8190",
  },

  summaryCard: {
    marginTop: 18,
    backgroundColor: "#0B1D3A",
    borderRadius: 20,
    padding: 18,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#AAB2C1",
  },

  summaryAmount: {
    marginTop: 7,
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  summarySubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#C2C8D2",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#ECEEF2",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  cardInfo: {
    flex: 1,
    marginLeft: 11,
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  limitText: {
    marginTop: 3,
    fontSize: 11,
    color: "#7B8190",
  },

  percent: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  exceededPercent: {
    color: "#EF4444",
  },

  progressBackground: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E8ECF2",
    overflow: "hidden",
    marginTop: 14,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  remaining: {
    fontSize: 11,
    color: "#7B8190",
  },

  exceededText: {
    color: "#EF4444",
    fontWeight: "700",
  },

  month: {
    fontSize: 10,
    color: "#9CA3AF",
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EEF1F6",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  emptySubtitle: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#7B8190",
  },

  fab: {
    position: "absolute",
    right: 22,
    bottom: 56,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B1D3A",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
//