import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Account, Category, DetectedTransaction, DetectedTransactionType } from "@/src/types/models";
import { getAllAccounts } from "@/src/db/repository/account";
import { getAllCategory } from "@/src/db/repository/category";
import { approveDetectedTransaction, editDetectedTransaction } from "@/src/services/detectedTransactionService";

type Props = { transaction: DetectedTransaction | null; onClose: () => void; onChanged: () => void };

export default function DetectedTransactionReview({ transaction, onClose, onChanged }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [dateText, setDateText] = useState("");
  const [type, setType] = useState<DetectedTransactionType>("expense");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [transferToAccountId, setTransferToAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!transaction) return;
    setMerchant(transaction.merchant || "");
    setAmount(String(transaction.amount));
    setDateText(new Date(transaction.transactionDate).toISOString().slice(0, 10));
    setType(transaction.type);
    setAccountId(transaction.accountId || null);
    setTransferToAccountId(transaction.transferToAccountId || null);
    setCategoryId(transaction.categoryId || null);
    setNote(transaction.note || "");
    void Promise.all([getAllAccounts(), getAllCategory()]).then(([accountsResult, categoriesResult]) => {
      setAccounts(accountsResult as Account[]);
      setCategories(categoriesResult as Category[]);
    });
  }, [transaction]);

  if (!transaction) return null;
  const filteredCategories = type === "transfer" ? [] : categories.filter((item) => item.type === type);
  const save = async (approve: boolean) => {
    const parsedAmount = Number(amount.replace(/,/g, ""));
    const parsedDate = new Date(`${dateText}T12:00:00`).getTime();
    if (!merchant.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(parsedDate)) return;
    setSaving(true);
    try {
      await editDetectedTransaction(transaction.id, { merchant: merchant.trim(), amount: parsedAmount, type, accountId, transferToAccountId, categoryId: type === "transfer" ? null : categoryId, transactionDate: parsedDate, note: note.trim() || null });
      if (approve) await approveDetectedTransaction(transaction.id);
      onChanged();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return <Modal visible animationType="slide" onRequestClose={onClose}><SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Text style={styles.title}>Review payment</Text><Pressable onPress={onClose}><Text style={styles.close}>Close</Text></Pressable></View><Text style={styles.raw}>{transaction.rawText}</Text><Text style={styles.label}>Merchant / title</Text><TextInput value={merchant} onChangeText={setMerchant} style={styles.input} placeholder="Merchant"/><Text style={styles.label}>Amount</Text><TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="decimal-pad"/><Text style={styles.label}>Date (YYYY-MM-DD)</Text><TextInput value={dateText} onChangeText={setDateText} style={styles.input} placeholder="2026-08-20"/><Text style={styles.label}>Type</Text><View style={styles.row}>{(["expense", "income", "transfer"] as const).map((value) => <Pressable key={value} onPress={() => setType(value)} style={[styles.choice, type === value && styles.selected]}><Text style={type === value ? styles.selectedText : styles.choiceText}>{value}</Text></Pressable>)}</View><Text style={styles.label}>{type === "transfer" ? "Source account" : "Account"}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{accounts.map((item) => <Pressable key={item.id} onPress={() => setAccountId(item.id)} style={[styles.choice, accountId === item.id && styles.selected]}><Text style={accountId === item.id ? styles.selectedText : styles.choiceText}>{item.name}</Text></Pressable>)}</ScrollView>{type === "transfer" && <><Text style={styles.label}>Destination account</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{accounts.filter((item) => item.id !== accountId).map((item) => <Pressable key={item.id} onPress={() => setTransferToAccountId(item.id)} style={[styles.choice, transferToAccountId === item.id && styles.selected]}><Text style={transferToAccountId === item.id ? styles.selectedText : styles.choiceText}>{item.name}</Text></Pressable>)}</ScrollView></>}<Text style={styles.label}>Category</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{filteredCategories.map((item) => <Pressable key={item.id} onPress={() => setCategoryId(item.id)} style={[styles.choice, categoryId === item.id && styles.selected]}><Text style={categoryId === item.id ? styles.selectedText : styles.choiceText}>{item.name}</Text></Pressable>)}</ScrollView><Text style={styles.label}>Note</Text><TextInput value={note} onChangeText={setNote} style={[styles.input, styles.note]} multiline placeholder="Optional note"/><View style={styles.actions}><Pressable disabled={saving} onPress={() => void save(false)} style={styles.secondary}><Text style={styles.secondaryText}>Save changes</Text></Pressable><Pressable disabled={saving} onPress={() => void save(true)} style={styles.primary}><Text style={styles.primaryText}>{saving ? "Saving..." : type === "transfer" ? "Approve transfer" : "Approve"}</Text></Pressable></View></ScrollView></SafeAreaView></Modal>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F8F9FB" }, content: { padding: 20, paddingBottom: 40 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { fontSize: 24, fontWeight: "800", color: "#0B1D3A" }, close: { fontWeight: "700", color: "#6B7280" }, raw: { marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: "#FFF8E1", color: "#6B7280", fontSize: 12 }, label: { marginTop: 18, marginBottom: 7, fontSize: 11, fontWeight: "700", color: "#8A93A6", textTransform: "uppercase" }, input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, color: "#0B1D3A" }, note: { minHeight: 70, textAlignVertical: "top" }, row: { flexDirection: "row", gap: 8 }, choice: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB", marginRight: 8 }, selected: { backgroundColor: "#0B1D3A", borderColor: "#0B1D3A" }, choiceText: { fontSize: 12, color: "#4B5563" }, selectedText: { fontSize: 12, fontWeight: "700", color: "#FFF" }, actions: { flexDirection: "row", gap: 10, marginTop: 28 }, secondary: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#E5E7EB" }, primary: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#0B1D3A" }, secondaryText: { fontWeight: "700", color: "#0B1D3A" }, primaryText: { fontWeight: "700", color: "#FFF" } });
