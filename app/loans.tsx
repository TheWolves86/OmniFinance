import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllLoans, type Loan } from "@/src/db/repository/loan";
import { presentLoanSheet, subscribeLoanRefresh } from "@/src/components/loanSheetController";
import AddLoanSheet from "@/src/components/addLoanSheet";

const money = (amount: number) => `₹${Math.max(0, amount).toLocaleString("en-IN")}`;

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const loadLoans = useCallback(async () => {
    try { setLoans(await getAllLoans()); } catch (error) { console.error("Error loading loans", error); }
  }, []);

  useEffect(() => {
    void loadLoans();
    const unsubscribe = subscribeLoanRefresh(() => { void loadLoans(); });
    return () => { unsubscribe(); };
  }, [loadLoans]);

  return <SafeAreaView style={styles.container}>
    <FlatList
      data={loans}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<Text style={styles.heading}>Loans</Text>}
      ListEmptyComponent={<View style={styles.empty}><Ionicons name="card-outline" size={46} color="#C5CAD3" /><Text style={styles.emptyTitle}>No Loans Yet</Text><Text style={styles.emptyText}>Tap + to add your first loan.</Text></View>}
      renderItem={({ item }) => {
        const paidAmount = Math.max(0, item.totalAmount - item.remainingAmount);
        const progress = item.totalAmount > 0 ? Math.min(1, paidAmount / item.totalAmount) : 0;
        const monthsLeft = Math.max(0, item.totalMonths - item.paidMonths);
        return <Pressable style={styles.card} onPress={() => presentLoanSheet({ mode: "edit", loan: item })}>
          <View style={styles.cardTop}><View style={styles.nameBlock}><View style={styles.icon}><Ionicons name="home-outline" size={18} color="#0B1D3A" /></View><View><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={styles.lender}>{item.lender}</Text></View></View><View style={styles.remainingBlock}><Text style={styles.remainingAmount}>{money(item.remainingAmount)}</Text><Text style={styles.remainingLabel}>Remaining</Text></View></View>
          <View style={styles.details}><Text style={styles.paid}>{money(paidAmount)} <Text style={styles.muted}>Paid</Text></Text><Text style={styles.muted}>{monthsLeft} months left</Text></View>
          <View style={styles.progressBackground}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
        </Pressable>;
      }}
    />
    <Pressable style={styles.fab} onPress={() => presentLoanSheet({ mode: "create" })}><Ionicons name="add" size={30} color="#FFFFFF" /></Pressable>
    <AddLoanSheet />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" }, list: { paddingHorizontal: 16, paddingBottom: 100 }, heading: { fontSize: 30, fontWeight: "800", color: "#0B1D3A", paddingTop: 8, paddingBottom: 18 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#ECEEF2" }, cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, nameBlock: { flexDirection: "row", alignItems: "center", flex: 1 }, icon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F1F3F6", alignItems: "center", justifyContent: "center", marginRight: 10 }, name: { fontSize: 15, fontWeight: "700", color: "#0B1D3A", maxWidth: 150 }, lender: { marginTop: 2, fontSize: 11, color: "#7B8190" }, remainingBlock: { alignItems: "flex-end" }, remainingAmount: { fontSize: 16, fontWeight: "800", color: "#0B1D3A" }, remainingLabel: { marginTop: 2, fontSize: 9, color: "#7B8190" }, details: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 6 }, paid: { fontSize: 11, fontWeight: "700", color: "#0B1D3A" }, muted: { fontSize: 10, color: "#7B8190", fontWeight: "400" }, progressBackground: { height: 4, borderRadius: 99, backgroundColor: "#E8ECF2", overflow: "hidden" }, progressFill: { height: "100%", backgroundColor: "#0B1D3A" }, empty: { alignItems: "center", paddingTop: 80 }, emptyTitle: { marginTop: 14, fontSize: 19, fontWeight: "700", color: "#0B1D3A" }, emptyText: { marginTop: 6, color: "#7B8190" }, fab: { position: "absolute", right: 22, bottom: 16, width: 58, height: 58, borderRadius: 29, backgroundColor: "#0B1D3A", alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
});
