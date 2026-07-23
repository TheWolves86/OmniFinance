import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/src/db/initialize";
import { seedDatabase } from "@/src/db/seed";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => { (async () => { try { await initializeDatabase(); await seedDatabase(); setReady(true); } catch (cause) { setError(cause instanceof Error ? cause : new Error(String(cause))); } })(); }, []);
  if (error) { console.error("Database initialization failed", error); return <View style={styles.container} />; }
  if (!ready) return <View style={styles.container} />;
  return <SafeAreaProvider><GestureHandlerRootView style={styles.container}><BottomSheetModalProvider><Stack screenOptions={{ headerShown:false }} /></BottomSheetModalProvider></GestureHandlerRootView></SafeAreaProvider>;
}
const styles=StyleSheet.create({container:{flex:1}});

