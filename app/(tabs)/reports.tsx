import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db } from "@/src/db";
import { subscribeTransactionRefresh } from "@/src/components/transactionSheetController";

type ReportRange = "today" | "month" | "year" | "3m";

type Transaction = {
  id: string;
  title?: string | null;
  amount: number;
  type: "income" | "expense";
  categoryId?: string | null;
  categoryName?: string | null;
  transactionDate: number;
};

type CategoryExpense = {
  categoryId: string;
  categoryName: string;
  amount: number;
};

type MonthlyTrend = {
  label: string;
  income: number;
  expense: number;
  net: number;
};

type ReportData = {
  netWorth: number;
  income: number;
  expenses: number;
  netCashFlow: number;
  transactionCount: number;

  categoryExpenses: CategoryExpense[];
  monthlyTrend: MonthlyTrend[];

  budgetLimit: number;
  budgetSpent: number;

  goalsSaved: number;
  goalsTarget: number;
  activeGoals: number;
  completedGoals: number;

  unpaidBills: number;
  unpaidBillsCount: number;
  paidBillsThisMonth: number;
  paidBillsCount: number;

  insuranceCount: number;
  nextInsuranceRenewal: number | null;

  loanRemaining: number;
  loanCount: number;

  recentTransactions: Transaction[];
};

const RANGE_OPTIONS: {
  key: ReportRange;
  label: string;
}[] = [
  { key: "today", label: "Today" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "3m", label: "3M" },
];

const EMPTY_REPORT: ReportData = {
  netWorth: 0,
  income: 0,
  expenses: 0,
  netCashFlow: 0,
  transactionCount: 0,
  categoryExpenses: [],
  monthlyTrend: [],
  budgetLimit: 0,
  budgetSpent: 0,
  goalsSaved: 0,
  goalsTarget: 0,
  activeGoals: 0,
  completedGoals: 0,
  unpaidBills: 0,
  unpaidBillsCount: 0,
  paidBillsThisMonth: 0,
  paidBillsCount: 0,
  insuranceCount: 0,
  nextInsuranceRenewal: null,
  loanRemaining: 0,
  loanCount: 0,
  recentTransactions: [],
};

function getRangeStart(range: ReportRange) {
  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  if (range === "month") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
  }

  if (range === "year") {
    return new Date(
      now.getFullYear(),
      0,
      1
    ).getTime();
  }

  const start = new Date(now);
  start.setMonth(start.getMonth() - 3);

  return start.getTime();
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatAmount(amount: number) {
  return `₹${Number(amount || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

function formatCompactAmount(amount: number) {
  const value = Math.abs(amount);

  if (value >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`;
  }

  return `₹${Math.round(amount)}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
  });
}

function getProgressPercentage(
  current: number,
  total: number
) {
  if (!total) return 0;

  return Math.min(
    Math.max((current / total) * 100, 0),
    100
  );
}

export default function ReportsPage() {
  const [range, setRange] =
    useState<ReportRange>("month");

  const [report, setReport] =
    useState<ReportData>(EMPTY_REPORT);

  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const rangeStart = getRangeStart(range);
      const now = Date.now();

      // Total money currently held in accounts.
      const accountResult =
        await db.getFirstAsync<{
          total: number | null;
        }>(
          `SELECT COALESCE(SUM(balance), 0) AS total
           FROM accounts`
        );

      // Transactions inside the selected period.
      const transactions =
        await db.getAllAsync<Transaction>(
          `SELECT
            t.id,
            t.title,
            t.amount,
            t.type,
            t.category_id AS categoryId,
            t.transaction_date AS transactionDate,
            c.name AS categoryName
           FROM transactions t
           LEFT JOIN categories c
             ON c.id = t.category_id
           WHERE t.transaction_date >= ?
             AND t.transaction_date <= ?
           ORDER BY t.transaction_date DESC`,
          rangeStart,
          now
        );

      const income = transactions
        .filter(
          (transaction) =>
            transaction.type === "income"
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount || 0),
          0
        );

      const expenses = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount || 0),
          0
        );

      // Group expenses by category.
      const categoryMap = new Map<
        string,
        CategoryExpense
      >();

      transactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .forEach((transaction) => {
          const categoryId =
            transaction.categoryId ?? "other";

          const categoryName =
            transaction.categoryName ||
            "Other";

          const existing =
            categoryMap.get(categoryId);

          if (existing) {
            existing.amount += Number(
              transaction.amount || 0
            );
          } else {
            categoryMap.set(categoryId, {
              categoryId,
              categoryName,
              amount: Number(
                transaction.amount || 0
              ),
            });
          }
        });

      const categoryExpenses = Array.from(
        categoryMap.values()
      ).sort((a, b) => b.amount - a.amount);

      // Keep the chart aligned with the selected report period.
      const monthlyTrend: MonthlyTrend[] = [];

      const today = new Date();
      const trendDates = range === "today"
        ? [today]
        : Array.from({ length: range === "year" ? 12 : 3 }, (_, index) =>
            new Date(today.getFullYear(), today.getMonth() - (range === "year" ? 11 - index : 2 - index), 1)
          );

      trendDates.forEach((date) => {
        const startOfBucket = range === "today"
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
          : new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        const endOfBucket = range === "today"
          ? startOfBucket + 24 * 60 * 60 * 1000
          : new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
        const bucketTransactions = transactions.filter((transaction) =>
          transaction.transactionDate >= startOfBucket && transaction.transactionDate < endOfBucket
        );
        const bucketIncome = bucketTransactions.filter((transaction) => transaction.type === "income")
          .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
        const bucketExpense = bucketTransactions.filter((transaction) => transaction.type === "expense")
          .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

        monthlyTrend.push({
          label: range === "today" ? "Today" : monthLabel(date),
          income: bucketIncome,
          expense: bucketExpense,
          net: bucketIncome - bucketExpense,
        });
      });

      // Current month's budgets.
      const currentMonth =
        `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}`;

      const budgets =
        await db.getAllAsync<{
          categoryId: string;
          amount: number;
        }>(
          `SELECT
            category_id AS categoryId,
            amount
           FROM budgets
           WHERE month = ?`,
          currentMonth
        );

      let budgetLimit = 0;
      let budgetSpent = 0;

      for (const budget of budgets) {
        budgetLimit += Number(
          budget.amount || 0
        );

        const spent =
          await db.getFirstAsync<{
            total: number | null;
          }>(
            `SELECT COALESCE(SUM(amount), 0) AS total
             FROM transactions
             WHERE category_id = ?
               AND type = 'expense'
               AND strftime(
                 '%Y-%m',
                 transaction_date / 1000,
                 'unixepoch',
                 'localtime'
               ) = ?`,
            budget.categoryId,
            currentMonth
          );

        budgetSpent += Number(
          spent?.total || 0
        );
      }

      // Goals.
      const goals =
        await db.getFirstAsync<{
          saved: number | null;
          target: number | null;
          active: number | null;
          completed: number | null;
        }>(
          `SELECT
            COALESCE(SUM(saved_amount), 0) AS saved,
            COALESCE(SUM(target_amount), 0) AS target,
            COALESCE(
              SUM(
                CASE
                  WHEN is_completed = 0 THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS active,
            COALESCE(
              SUM(
                CASE
                  WHEN is_completed = 1 THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS completed
           FROM goals`
        );

      // Bills.
      const bills =
        await db.getFirstAsync<{
          unpaid: number | null;
          unpaidCount: number | null;
        }>(
          `SELECT
            COALESCE(
              SUM(
                CASE
                  WHEN is_paid = 0
                  THEN amount
                  ELSE 0
                END
              ),
              0
            ) AS unpaid,
            COALESCE(
              SUM(
                CASE
                  WHEN is_paid = 0
                  THEN 1
                  ELSE 0
                END
              ),
              0
            ) AS unpaidCount
           FROM bills`
        );

      const paidBills =
        await db.getFirstAsync<{
          total: number | null;
          count: number | null;
        }>(
          `SELECT
            COALESCE(SUM(amount), 0) AS total,
            COUNT(*) AS count
           FROM bills
           WHERE is_paid = 1
             AND paid_at >= ?
             AND paid_at <= ?`,
          new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          ).getTime(),
          now
        );

      // Insurance.
      const insurance =
        await db.getFirstAsync<{
          count: number | null;
          nextRenewal: number | null;
        }>(
          `SELECT
            COUNT(*) AS count,
            MIN(renewal_date) AS nextRenewal
           FROM insurance
           WHERE renewal_date >= ?`,
          now
        );

      // Loans are optional because the exact loan schema
      // can vary between project versions.
      let loanRemaining = 0;
      let loanCount = 0;

      const loanTable =
        await db.getFirstAsync<{
          name: string | null;
        }>(
          `SELECT name
           FROM sqlite_master
           WHERE type = 'table'
             AND name = 'loans'`
        );

      if (loanTable?.name) {
        const loanColumns =
          await db.getAllAsync<{
            name: string;
          }>(`PRAGMA table_info(loans)`);

        const columnNames =
          loanColumns.map(
            (column) => column.name
          );

        const remainingColumn =
          [
            "remaining_amount",
            "remainingAmount",
            "outstanding_amount",
            "outstandingAmount",
            "remaining",
            "outstanding",
          ].find((column) =>
            columnNames.includes(column)
          );

        if (remainingColumn) {
          const loanResult =
            await db.getFirstAsync<{
              total: number | null;
              count: number | null;
            }>(
              `SELECT
                COALESCE(SUM(${remainingColumn}), 0) AS total,
                COUNT(*) AS count
               FROM loans`
            );

          loanRemaining = Number(
            loanResult?.total || 0
          );

          loanCount = Number(
            loanResult?.count || 0
          );
        }
      }

      setReport({
        netWorth: Number(
          accountResult?.total || 0
        ),
        income,
        expenses,
        netCashFlow: income - expenses,
        transactionCount: transactions.length,

        categoryExpenses,
        monthlyTrend,

        budgetLimit,
        budgetSpent,

        goalsSaved: Number(
          goals?.saved || 0
        ),
        goalsTarget: Number(
          goals?.target || 0
        ),
        activeGoals: Number(
          goals?.active || 0
        ),
        completedGoals: Number(
          goals?.completed || 0
        ),

        unpaidBills: Number(
          bills?.unpaid || 0
        ),
        unpaidBillsCount: Number(
          bills?.unpaidCount || 0
        ),
        paidBillsThisMonth: Number(
          paidBills?.total || 0
        ),
        paidBillsCount: Number(
          paidBills?.count || 0
        ),

        insuranceCount: Number(
          insurance?.count || 0
        ),
        nextInsuranceRenewal:
          insurance?.nextRenewal
            ? Number(insurance.nextRenewal)
            : null,

        loanRemaining,
        loanCount,

        recentTransactions:
          transactions.slice(0, 6),
      });
    } catch (error) {
      console.error(
        "Error loading reports:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => subscribeTransactionRefresh(() => { void loadReports(); }), [loadReports]);

  useEffect(() => {
    const refresh = () => {
      loadReports();
    };

    const interval = setInterval(
      refresh,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [loadReports]);

  const expenseTotal =
    report.categoryExpenses.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );

  const budgetProgress =
    getProgressPercentage(
      report.budgetSpent,
      report.budgetLimit
    );

  const goalProgress =
    getProgressPercentage(
      report.goalsSaved,
      report.goalsTarget
    );

  const maxTrendValue = Math.max(
    1,
    ...report.monthlyTrend.flatMap(
      (item) => [
        item.income,
        item.expense,
      ]
    )
  );

  const trendHeight = 110;

  const renderCategory = ({
    item,
    index,
  }: {
    item: CategoryExpense;
    index: number;
  }) => {
    const percentage = expenseTotal
      ? (item.amount / expenseTotal) * 100
      : 0;

    return (
      <View style={styles.categoryRow}>
        <View style={styles.categoryLeft}>
          <View
            style={[
              styles.categoryDot,
              {
                backgroundColor:
                  REPORT_COLORS[
                    index %
                      REPORT_COLORS.length
                  ],
              },
            ]}
          />

          <Text style={styles.categoryName}>
            {item.categoryName}
          </Text>
        </View>

        <Text style={styles.categoryAmount}>
          {formatCompactAmount(
            item.amount
          )}{" "}
          ({Math.round(percentage)}%)
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} tintColor="#0B1D3A" />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="wallet"
                size={15}
                color="#0B1D3A"
              />
            </View>

            <Text style={styles.brandText}>
              OmniFinance
            </Text>

            <Ionicons
              name="notifications-outline"
              size={17}
              color="#0B1D3A"
              style={styles.notificationIcon}
            />
          </View>

          <Text style={styles.heading}>
            Reports
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.rangeContainer
            }
          >
            {RANGE_OPTIONS.map(
              (option) => {
                const selected =
                  range === option.key;

                return (
                  <Pressable
                    key={option.key}
                    onPress={() =>
                      setRange(
                        option.key
                      )
                    }
                    style={[
                      styles.rangeChip,
                      selected &&
                        styles.selectedRangeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rangeText,
                        selected &&
                          styles.selectedRangeText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        </View>

        <View style={styles.netWorthCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardEyebrow}>
                NET WORTH
              </Text>

              <Text style={styles.netWorthValue}>
                {formatAmount(
                  report.netWorth
                )}
              </Text>
            </View>

            <View style={styles.netChangeBadge}>
              <Text style={styles.netChangeText}>
                {report.netCashFlow >= 0
                  ? "+"
                  : "-"}
                {Math.abs(
                  report.netCashFlow
                ) > 0
                  ? `${Math.min(
                      Math.round(
                        Math.abs(
                          report.netCashFlow
                        ) /
                          Math.max(
                            report.netWorth ||
                              1,
                            1
                          ) *
                          100
                      ),
                      999
                    )}%`
                  : "0%"}
              </Text>
            </View>
          </View>

          <View style={styles.sparkline}>
            {report.monthlyTrend.map(
              (item, index) => {
                const height =
                  Math.max(
                    4,
                    (Math.abs(
                      item.net
                    ) /
                      maxTrendValue) *
                      trendHeight
                  );

                return (
                  <View
                    key={`${item.label}-${index}`}
                    style={
                      styles.sparklineColumn
                    }
                  >
                    <View
                      style={[
                        styles.sparklineBar,
                        {
                          height,
                          backgroundColor:
                            item.net >= 0
                              ? "#0B1D3A"
                              : "#D4A72C",
                        },
                      ]}
                    />

                    <Text
                      style={
                        styles.sparklineLabel
                      }
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              }
            )}
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              INCOME
            </Text>

            <Text
              style={[
                styles.statValue,
                styles.incomeValue,
              ]}
            >
              {formatCompactAmount(
                report.income
              )}
            </Text>

            <Text style={styles.statHint}>
              {report.transactionCount}{" "}
              transactions
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              EXPENSES
            </Text>

            <Text
              style={[
                styles.statValue,
                styles.expenseValue,
              ]}
            >
              {formatCompactAmount(
                report.expenses
              )}
            </Text>

            <Text style={styles.statHint}>
              {report.categoryExpenses.length}{" "}
              categories
            </Text>
          </View>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                EXPENSES BY CATEGORY
              </Text>

              <Text style={styles.cardSubtitle}>
                Based on actual transactions
              </Text>
            </View>

            <Text style={styles.cardTotal}>
              {formatCompactAmount(
                report.expenses
              )}
            </Text>
          </View>

          <View style={styles.categoryBars}>
            {report.categoryExpenses
              .slice(0, 6)
              .map((category, index) => {
                const percentage =
                  expenseTotal
                    ? (category.amount /
                        expenseTotal) *
                      100
                    : 0;

                return (
                  <View
                    key={category.categoryId}
                    style={
                      styles.categoryBarRow
                    }
                  >
                    <View
                      style={
                        styles.categoryBarLabel
                      }
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              REPORT_COLORS[
                                index %
                                  REPORT_COLORS.length
                              ],
                          },
                        ]}
                      />

                      <Text
                        style={
                          styles.categoryName
                        }
                        numberOfLines={1}
                      >
                        {category.categoryName}
                      </Text>

                      <Text
                        style={
                          styles.categoryPercentage
                        }
                      >
                        {Math.round(
                          percentage
                        )}
                        %
                      </Text>
                    </View>

                    <View
                      style={
                        styles.categoryTrack
                      }
                    >
                      <View
                        style={[
                          styles.categoryFill,
                          {
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                            backgroundColor:
                              REPORT_COLORS[
                                index %
                                  REPORT_COLORS.length
                              ],
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}

            {report.categoryExpenses.length ===
              0 && (
              <Text style={styles.noDataText}>
                No expense data for this period.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                CASH FLOW
              </Text>

              <Text style={styles.cardSubtitle}>
                Income vs expenses
              </Text>
            </View>

            <Text
              style={[
                styles.cashFlowValue,
                {
                  color:
                    report.netCashFlow >=
                    0
                      ? "#0B1D3A"
                      : "#EF4444",
                },
              ]}
            >
              {report.netCashFlow >=
              0
                ? "+"
                : "-"}
              {formatCompactAmount(
                Math.abs(
                  report.netCashFlow
                )
              )}
            </Text>
          </View>

          <View style={styles.cashFlowChart}>
            {report.monthlyTrend.map(
              (item) => {
                const incomeHeight =
                  Math.max(
                    4,
                    (item.income /
                      maxTrendValue) *
                      100
                  );

                const expenseHeight =
                  Math.max(
                    4,
                    (item.expense /
                      maxTrendValue) *
                      100
                  );

                return (
                  <View
                    key={item.label}
                    style={styles.cashFlowMonth}
                  >
                    <View
                      style={
                        styles.cashFlowBars
                      }
                    >
                      <View
                        style={[
                          styles.cashBar,
                          {
                            height:
                              incomeHeight,
                          },
                        ]}
                      />

                      <View
                        style={[
                          styles.expenseBar,
                          {
                            height:
                              expenseHeight,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.cashFlowLabel
                      }
                    >
                      {item.label}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      "#0B1D3A",
                  },
                ]}
              />

              <Text
                style={styles.legendText}
              >
                Income
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor:
                      "#D4A72C",
                  },
                ]}
              />

              <Text
                style={styles.legendText}
              >
                Expenses
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              BUDGETS
            </Text>

            <Text
              style={styles.statValue}
            >
              {formatCompactAmount(
                report.budgetSpent
              )}
            </Text>

            <Text style={styles.statHint}>
              of{" "}
              {formatCompactAmount(
                report.budgetLimit
              )}
            </Text>

            <View
              style={
                styles.miniProgressTrack
              }
            >
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    width: `${budgetProgress}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              GOALS
            </Text>

            <Text
              style={styles.statValue}
            >
              {formatCompactAmount(
                report.goalsSaved
              )}
            </Text>

            <Text style={styles.statHint}>
              of{" "}
              {formatCompactAmount(
                report.goalsTarget
              )}
            </Text>

            <View
              style={
                styles.miniProgressTrack
              }
            >
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    width: `${goalProgress}%`,
                    backgroundColor:
                      "#D4A72C",
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.cardTitle}>
            BILLS & INSURANCE
          </Text>

          <View style={styles.metricRow}>
            <View style={styles.metricIcon}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color="#0B1D3A"
              />
            </View>

            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>
                Unpaid Bills
              </Text>

              <Text style={styles.metricSubtitle}>
                {report.unpaidBillsCount}{" "}
                pending
              </Text>
            </View>

            <Text style={styles.metricValue}>
              {formatCompactAmount(
                report.unpaidBills
              )}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#0B1D3A"
              />
            </View>

            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>
                Paid This Month
              </Text>

              <Text style={styles.metricSubtitle}>
                {report.paidBillsCount}{" "}
                bills
              </Text>
            </View>

            <Text style={styles.metricValue}>
              {formatCompactAmount(
                report.paidBillsThisMonth
              )}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricRow}>
            <View style={styles.metricIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#0B1D3A"
              />
            </View>

            <View style={styles.metricInfo}>
              <Text style={styles.metricTitle}>
                Insurance
              </Text>

              <Text style={styles.metricSubtitle}>
                {report.insuranceCount}{" "}
                policies
              </Text>
            </View>

            <Text style={styles.metricValue}>
              {report.nextInsuranceRenewal
                ? new Date(
                    report.nextInsuranceRenewal
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )
                : "No renewal"}
            </Text>
          </View>
        </View>

        {report.loanCount > 0 && (
          <View style={styles.reportCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text
                  style={styles.cardTitle}
                >
                  LOANS
                </Text>

                <Text
                  style={styles.cardSubtitle}
                >
                  Outstanding balance
                </Text>
              </View>

              <Text
                style={styles.loanValue}
              >
                {formatCompactAmount(
                  report.loanRemaining
                )}
              </Text>
            </View>

            <Text style={styles.loanCount}>
              {report.loanCount} active loan
              {report.loanCount === 1
                ? ""
                : "s"}
            </Text>
          </View>
        )}

        <View style={styles.reportCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>
                RECENT ACTIVITY
              </Text>

              <Text style={styles.cardSubtitle}>
                Latest transactions
              </Text>
            </View>

            <Text
              style={styles.activityCount}
            >
              {report.transactionCount}
            </Text>
          </View>

          {report.recentTransactions.map(
            (transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.activityRow,
                  index !==
                    report.recentTransactions
                      .length -
                      1 &&
                    styles.activityBorder,
                ]}
              >
                <View
                  style={styles.activityIcon}
                >
                  <Ionicons
                    name={
                      transaction.type ===
                      "income"
                        ? "arrow-down-outline"
                        : "arrow-up-outline"
                    }
                    size={16}
                    color={
                      transaction.type ===
                      "income"
                        ? "#0B1D3A"
                        : "#7B8190"
                    }
                  />
                </View>

                <View
                  style={styles.activityInfo}
                >
                  <Text
                    style={styles.activityTitle}
                    numberOfLines={1}
                  >
                    {transaction.title ||
                      transaction.categoryName ||
                      "Transaction"}
                  </Text>

                  <Text
                    style={styles.activityCategory}
                  >
                    {transaction.categoryName ||
                      "Uncategorized"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color:
                        transaction.type ===
                        "income"
                          ? "#0B1D3A"
                          : "#EF4444",
                    },
                  ]}
                >
                  {transaction.type ===
                  "income"
                    ? "+"
                    : "-"}
                  {formatCompactAmount(
                    transaction.amount
                  )}
                </Text>
              </View>
            )
          )}

          {report.recentTransactions.length ===
            0 && (
            <Text style={styles.noDataText}>
              No transactions yet.
            </Text>
          )}
        </View>

        <View style={styles.bottomNote}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#9CA3AF"
          />

          <Text style={styles.bottomNoteText}>
            Reports are calculated from your
            current accounts, transactions,
            budgets, goals, bills and insurance
            data.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const REPORT_COLORS = [
  "#0B1D3A",
  "#D4A72C",
  "#7B8190",
  "#9CA3AF",
  "#C9D0DA",
  "#4B5563",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  header: {
    paddingTop: 6,
    paddingBottom: 14,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEEF2",
    justifyContent: "center",
    alignItems: "center",
  },

  brandText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  notificationIcon: {
    marginLeft: "auto",
  },

  heading: {
    marginTop: 13,
    fontSize: 30,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  rangeContainer: {
    marginTop: 13,
    backgroundColor: "#E7E8EC",
    borderRadius: 9,
    padding: 2,
  },

  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 7,
    marginRight: 1,
  },

  selectedRangeChip: {
    backgroundColor: "#FFFFFF",
  },

  rangeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#7B8190",
  },

  selectedRangeText: {
    color: "#0B1D3A",
  },

  netWorthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEEF2",
    padding: 16,
    marginBottom: 12,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardEyebrow: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 0.8,
  },

  netWorthValue: {
    marginTop: 3,
    fontSize: 21,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  netChangeBadge: {
    backgroundColor: "#FFF3C7",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  netChangeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8C6A00",
  },

  sparkline: {
    height: 105,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
  },

  sparklineColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  sparklineBar: {
    width: 4,
    borderRadius: 999,
    marginBottom: 5,
  },

  sparklineLabel: {
    fontSize: 8,
    color: "#8A93A6",
    marginBottom: 4,
  },

  statGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#ECEEF2",
    padding: 14,
  },

  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 0.8,
  },

  statValue: {
    marginTop: 5,
    fontSize: 21,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  incomeValue: {
    color: "#0B1D3A",
  },

  expenseValue: {
    color: "#EF4444",
  },

  statHint: {
    marginTop: 3,
    fontSize: 9,
    color: "#8A93A6",
  },

  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEEF2",
    padding: 15,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 0.9,
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#9CA3AF",
  },

  cardTotal: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  categoryBars: {
    marginTop: 14,
  },

  categoryBarRow: {
    marginBottom: 11,
  },

  categoryBarLabel: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  categoryAmount: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },

  categoryName: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    color: "#4B5563",
  },

  categoryPercentage: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7B8190",
  },

  categoryTrack: {
    marginTop: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#EEF0F3",
    overflow: "hidden",
  },

  categoryFill: {
    height: "100%",
    borderRadius: 999,
  },

  cashFlowValue: {
    fontSize: 17,
    fontWeight: "800",
  },

  cashFlowChart: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
  },

  cashFlowMonth: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  cashFlowBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 100,
  },

  cashBar: {
    width: 7,
    borderRadius: 5,
    backgroundColor: "#0B1D3A",
  },

  expenseBar: {
    width: 7,
    borderRadius: 5,
    backgroundColor: "#D4A72C",
  },

  cashFlowLabel: {
    marginTop: 5,
    fontSize: 8,
    color: "#8A93A6",
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 9,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  legendText: {
    fontSize: 10,
    color: "#7B8190",
  },

  miniProgressTrack: {
    height: 5,
    backgroundColor: "#E8ECF2",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },

  miniProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0B1D3A",
  },

  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  metricInfo: {
    flex: 1,
    marginLeft: 10,
  },

  metricTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  metricSubtitle: {
    marginTop: 2,
    fontSize: 9,
    color: "#8A93A6",
  },

  metricValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF0F3",
  },

  loanValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  loanCount: {
    marginTop: 8,
    fontSize: 10,
    color: "#8A93A6",
  },

  activityCount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },

  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F3",
  },

  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  activityInfo: {
    flex: 1,
    marginLeft: 9,
  },

  activityTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  activityCategory: {
    marginTop: 2,
    fontSize: 9,
    color: "#8A93A6",
  },

  activityAmount: {
    fontSize: 12,
    fontWeight: "800",
  },

  noDataText: {
    marginTop: 14,
    fontSize: 11,
    color: "#8A93A6",
    textAlign: "center",
  },

  bottomNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    paddingHorizontal: 4,
  },

  bottomNoteText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 9,
    lineHeight: 14,
    color: "#9CA3AF",
  },
});
// 
