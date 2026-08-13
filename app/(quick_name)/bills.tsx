import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { getAllAccounts } from "@/src/db/repository/account";
import { getExpenseCategories } from "@/src/db/repository/category";
import { deleteBill, getAllBills, type BillRecord } from "@/src/db/repository/bills";
import { payBill } from "@/src/services/billService";
import { emitAccountChanged } from "@/src/components/accountSheetController";
import { emitTransactionChanged } from "@/src/components/transactionSheetController";
import { emitBillChanged, presentBillsSheet, subscribeBillsRefresh } from "@/src/components/billsSheetController";
import BillsBottomSheet from "@/src/components/billsBottomSheet";

const money = (amount: number) => `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function BillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);

  const loadBills = useCallback(async () => {
    try { setBills(await getAllBills()); }
    catch (error) { Alert.alert("Could not load bills", error instanceof Error ? error.message : String(error)); }
  }, []);

  useEffect(() => { void loadBills(); return subscribeBillsRefresh(() => { void loadBills(); }); }, [loadBills]);

  const dueBills = useMemo(() => bills.filter((bill) => !Boolean(bill.isPaid)), [bills]);
  const paidBills = useMemo(() => bills.filter((bill) => {
    if (!Boolean(bill.isPaid)) return false;
    const date = new Date(bill.paidAt ?? 0), now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }), [bills]);

  const dueText = (timestamp?: number) => {
    if (!timestamp) return "No due date";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(timestamp); due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    return days < 0 ? `Overdue by ${Math.abs(days)} days` : days === 0 ? "Due today" : `Due in ${days} days`;
  };

  const pay = async (bill: BillRecord, accountId: string, categoryId: string) => {
    setPayingBillId(bill.id);
    try {
      await payBill(bill.id, accountId, categoryId);
      emitBillChanged(); emitAccountChanged(); emitTransactionChanged();
    } catch (error) { Alert.alert("Could not pay bill", error instanceof Error ? error.message : String(error)); }
    finally { setPayingBillId(null); }
  };

  const markPaid = async (bill: BillRecord) => {
    if (Boolean(bill.isPaid) || payingBillId) return;
    try {
      const [accounts, categories] = await Promise.all([getAllAccounts(), getExpenseCategories()]);
      if (!accounts.length) return Alert.alert("No account available", "Create an account before paying a bill.");
      if (!categories.length) return Alert.alert("No expense category available", "Create an expense category before paying a bill.");
      const category = categories.find((item: any) => item.name === "Utilities") ?? categories[0];
      Alert.alert("Pay bill from account", `${bill.title} • ${money(bill.amount)}`, [
        ...accounts.map((account: any) => ({ text: account.name, onPress: () => void pay(bill, account.id, category.id) })),
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (error) { Alert.alert("Could not prepare payment", error instanceof Error ? error.message : String(error)); }
  };

  const remove = (bill: BillRecord) => Alert.alert("Delete bill?", `This will permanently remove ${bill.title}.`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => {
      try { await deleteBill(bill.id); emitBillChanged(); }
      catch (error) { Alert.alert("Could not delete bill", error instanceof Error ? error.message : String(error)); }
    } },
  ]);

  const renderBill = ({ item }: { item: BillRecord }) => (
    <Pressable style={styles.card} onPress={() => presentBillsSheet({ mode: "edit", bill: item })} onLongPress={() => remove(item)}>
      <View style={styles.icon}><Ionicons name="receipt-outline" size={18} color="#0B1D3A" /></View>
      <View style={styles.info}><Text style={styles.name}>{item.title}</Text><Text style={[styles.subtitle, !Boolean(item.isPaid) && styles.unpaid]}>{Boolean(item.isPaid) ? "Paid" : dueText(item.dueDate)}</Text></View>
      <View style={styles.right}><Text style={styles.amount}>{money(item.amount)}</Text>{!Boolean(item.isPaid) ? <Pressable style={styles.payButton} onPress={() => void markPaid(item)}><Text style={styles.payText}>{payingBillId === item.id ? "Paying..." : "Mark Paid"}</Text></Pressable> : <Ionicons name="checkmark-circle" size={20} color="#D4A72C" />}</View>
    </Pressable>
  );

  return <SafeAreaView style={styles.container}><FlatList data={dueBills} keyExtractor={(item) => item.id} renderItem={renderBill} contentContainerStyle={styles.content} ListHeaderComponent={<View><View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={22} color="#0B1D3A" /></Pressable><Text style={styles.heading}>Bills</Text><View style={{ width: 22 }} /></View><Text style={styles.title}>Bills</Text><Text style={styles.description}>Manage your upcoming and paid bills.</Text><Text style={styles.group}>DUE SOON</Text></View>} ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={48} color="#C7CDD7" /><Text style={styles.emptyTitle}>{paidBills.length ? "No Upcoming Bills" : "No Bills Yet"}</Text><Text style={styles.description}>{paidBills.length ? "Your upcoming bills will appear here." : "Add your first bill to start tracking payments."}</Text></View>} ListFooterComponent={paidBills.length ? <View><Text style={styles.group}>PAID THIS MONTH</Text>{paidBills.map((bill) => <View key={bill.id}>{renderBill({ item: bill })}</View>)}</View> : null} /><Pressable style={styles.fab} onPress={() => presentBillsSheet({ mode: "create" })}><Ionicons name="add" size={28} color="#FFF" /></Pressable><BillsBottomSheet /></SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" }, content: { paddingHorizontal: 16, paddingBottom: 110 },
  header: { paddingTop: 4, paddingBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, heading: { fontSize: 18, fontWeight: "700", color: "#0B1D3A" }, title: { marginTop: 14, fontSize: 28, fontWeight: "800", color: "#0B1D3A" }, description: { marginTop: 4, fontSize: 12, color: "#7B8190" }, group: { marginTop: 18, marginBottom: 9, fontSize: 10, fontWeight: "700", color: "#8A93A6", letterSpacing: 0.8 }, card: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#ECEEF2", flexDirection: "row", alignItems: "center" }, icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F1F3F6", alignItems: "center", justifyContent: "center" }, info: { flex: 1, marginLeft: 10, marginRight: 8 }, name: { fontSize: 15, fontWeight: "700", color: "#0B1D3A" }, subtitle: { marginTop: 3, fontSize: 11, color: "#7B8190" }, unpaid: { color: "#EF4444" }, right: { alignItems: "flex-end" }, amount: { fontSize: 15, fontWeight: "700", color: "#0B1D3A" }, payButton: { marginTop: 5, backgroundColor: "#0B1D3A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }, payText: { color: "#FFF", fontSize: 9, fontWeight: "700" }, empty: { alignItems: "center", paddingTop: 70 }, emptyTitle: { marginTop: 14, fontSize: 20, fontWeight: "700", color: "#0B1D3A" }, fab: { position: "absolute", right: 22, bottom: 56, width: 58, height: 58, borderRadius: 29, backgroundColor: "#0B1D3A", alignItems: "center", justifyContent: "center", elevation: 8 },
});
