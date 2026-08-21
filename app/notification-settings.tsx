import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getItem, saveItem } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/constants/storageKeys";
const categories = ["bills", "budgets", "goals", "loans", "insurance", "transactions", "ai_insights"];
export default function NotificationSettingsScreen() {
  const router = useRouter(); const [values, setValues] = useState<Record<string, boolean>>({});
  useEffect(() => { void getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES).then((raw) => { try { setValues({ ...Object.fromEntries(categories.map((item) => [item, true])), ...JSON.parse(raw || "{}") }); } catch { setValues(Object.fromEntries(categories.map((item) => [item, true]))); } }); }, []);
  const toggle = async (category: string) => { const next = { ...values, [category]: values[category] === false }; setValues(next); await saveItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(next)); };
  return <SafeAreaView style={styles.safe}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable><Text style={styles.title}>Notification settings</Text><Text style={styles.subtitle}>Choose which OmniFinance reminders are enabled.</Text>{categories.map((category) => <View key={category} style={styles.row}><Text style={styles.label}>{category.replace("_", " ")}</Text><Switch value={values[category] !== false} onValueChange={() => void toggle(category)} trackColor={{ false: "#D1D5DB", true: "#B9C7E5" }} thumbColor="#0B1D3A" /></View>)}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#F8F9FB", padding: 22 }, back: { color: "#0B1D3A", fontWeight: "700" }, title: { marginTop: 24, fontSize: 30, fontWeight: "800", color: "#0B1D3A" }, subtitle: { marginTop: 8, color: "#6B7280" }, row: { marginTop: 18, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, label: { color: "#0B1D3A", fontWeight: "700", textTransform: "capitalize" } });
