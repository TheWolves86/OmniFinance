import React, { useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { isAndroidNotificationAccessEnabled } from "@/src/capture/access";
import { isCaptureEnabled, setCaptureEnabled } from "@/src/capture/settings";

export default function CaptureSetup() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    void isCaptureEnabled().then(setEnabled);
    if (Platform.OS === "android") void isAndroidNotificationAccessEnabled().then(setAccessGranted);
  }, []);

  const openAndroidSettings = () => Platform.OS === "android"
    ? Linking.sendIntent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS").catch(() => Linking.openSettings())
    : Linking.openSettings();

  const toggle = (value: boolean) => {
    setEnabled(value);
    void setCaptureEnabled(value);
  };

  return <SafeAreaView style={styles.container}><ScrollView contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color="#0B1D3A" /></Pressable>
    <View style={styles.titleRow}><View><Text style={styles.title}>Automatic Capture</Text><Text style={styles.status}>{enabled ? "ON" : "OFF"}</Text></View><Switch value={enabled} onValueChange={toggle} /></View>
    <Text style={styles.subtitle}>Supported payment notifications are kept locally for your review. They never become ledger transactions until you approve them.</Text>
    {Platform.OS === "android" ? <><View style={styles.card}><Text style={styles.cardTitle}>Android notification access</Text><Text style={styles.cardText}>{accessGranted ? "Notification access is enabled." : "Notification access is not enabled."} Supported sources currently include Google Pay, PhonePe, Paytm and Samsung Wallet.</Text><Pressable style={styles.button} onPress={openAndroidSettings}><Text style={styles.buttonText}>{accessGranted ? "Review notification access" : "Open notification access"}</Text></Pressable></View><Text style={styles.note}>Android may disconnect listeners after process or system events; the listener requests a reconnect and the app reviews captured items when it is opened.</Text></> : <View style={styles.card}><Text style={styles.cardTitle}>iPhone setup</Text><Text style={styles.cardText}>iOS does not provide arbitrary Google Pay, PhonePe, Paytm or bank notification contents to third-party apps. Use a supported Wallet Transaction automation or a user-created Shortcut that sends normalized fields to this app URL:</Text><Text style={styles.code}>omnifinance://capture?amount=250&type=expense&merchant=Uber</Text><Text style={styles.steps}>1. Open Shortcuts and create the supported automation.{"\n"}2. Add an Open URL action using the OmniFinance URL scheme.{"\n"}3. Pass only normalized fields such as amount, type, merchant and referenceId.{"\n"}4. Disable Ask Before Running only if you accept automatic execution.</Text></View>}
    <Text style={styles.privacy}>Privacy: parsing is local. Raw notification text is stored only in the local SQLite review record and is not sent to an AI service.</Text>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F8F9FB" }, content: { padding: 20, paddingBottom: 40 }, back: { marginBottom: 18 }, titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, title: { fontSize: 32, fontWeight: "800", color: "#0B1D3A" }, status: { marginTop: 3, fontSize: 11, fontWeight: "700", color: "#0F9D58" }, subtitle: { marginTop: 10, fontSize: 14, lineHeight: 21, color: "#6B7280" }, card: { marginTop: 22, padding: 18, borderRadius: 18, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#ECEEF2" }, cardTitle: { fontSize: 16, fontWeight: "800", color: "#0B1D3A" }, cardText: { marginTop: 10, fontSize: 13, lineHeight: 20, color: "#6B7280" }, code: { marginTop: 12, padding: 10, backgroundColor: "#F1F3F6", borderRadius: 8, fontSize: 11, color: "#0B1D3A" }, button: { marginTop: 16, backgroundColor: "#0B1D3A", padding: 14, borderRadius: 12, alignItems: "center" }, buttonText: { color: "#FFF", fontWeight: "700" }, steps: { marginTop: 14, fontSize: 13, lineHeight: 23, color: "#4B5563" }, note: { marginTop: 14, fontSize: 12, lineHeight: 18, color: "#8A93A6" }, privacy: { marginTop: 22, fontSize: 12, lineHeight: 18, color: "#8A93A6" } });
