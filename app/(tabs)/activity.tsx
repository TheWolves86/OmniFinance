import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, TextInput, SectionList } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllTransaction } from "@/src/db/repository/transaction";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      const data = await getAllTransaction();
      setTransactions(data ?? []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTransactions = transactions.filter((item) => {
    const displayTitle = item?.title?.trim() ? item.title : item?.categoryName || "";
    return displayTitle.toLowerCase().includes(normalizedSearch);
  });

  const grouped = filteredTransactions.reduce((acc: any[], item: any) => {
    const date = new Date(item?.transactionDate ?? Date.now());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const transactionDay = new Date(date);
    transactionDay.setHours(0, 0, 0, 0);

    let sectionTitle = transactionDay.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    let sectionOrder = 2;

    if (transactionDay.getTime() === today.getTime()) {
      sectionTitle = "TODAY";
      sectionOrder = 0;
    } else if (transactionDay.getTime() === yesterday.getTime()) {
      sectionTitle = "YESTERDAY";
      sectionOrder = 1;
    }

    const existing = acc.find((section: any) => section.title === sectionTitle);
    if (existing) {
      existing.data.push(item);
    } else {
      acc.push({
        title: sectionTitle,
        data: [item],
        order: sectionOrder,
      });
    }

    return acc;
  }, []);

  const sortedGroups = grouped.sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sortedGroups}
        keyExtractor={(item) => String(item?.id ?? Math.random())}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.brand}>
                <View style={styles.logoCircle}>
                  <Ionicons name="wallet" size={16} color="#0B1D3A" />
                </View>
                <Text style={styles.brandText}>OmniFinance</Text>
              </View>
              <Pressable style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={20} color="#0B1D3A" />
              </Pressable>
            </View>

            <Text style={styles.heading}>Transactions</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search Transactions"
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>

              <Pressable style={styles.filterButton}>
                <Ionicons name="options-outline" size={18} color="#0B1D3A" />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const displayTitle = item?.title?.trim() ? item.title : item?.categoryName || "Transaction";
          const displayAmount = Number(item?.amount ?? 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          });
          const typeColor = item?.type === "income" ? "#0F9D58" : "#EF4444";

          return (
            <Pressable style={styles.transactionCard}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{displayTitle}</Text>
                  <Text style={styles.transactionMeta}>{item?.categoryName || "Uncategorized"}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: typeColor }]}>
                  {item?.type === "income" ? "+" : "-"}₹{displayAmount}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  header: {
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "#ffffff"
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  brandText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  notificationButton: {
    padding: 4
  },
  heading: {
    fontSize: 35,
    fontWeight: "800",
    color: "#0B1D3A",
    marginTop: 18
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ECEEF2 "
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0B1D3A"
  },
  filterButton: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ECEEF2",
    justifyContent: "center",
    alignItems: "center"
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 1
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ECEEF2"
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  transactionMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "700"
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center"
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14
  }
});