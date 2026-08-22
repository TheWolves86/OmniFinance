import { Slot } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/src/db/initialize";
import { seedDatabase } from "@/src/db/seed";
import AccountBottomSheet from "@/src/components/accountBottomSheet";
import { drainNativeCaptureQueue } from "@/src/capture/nativeQueue";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { captureShortcutPayload } from "@/src/capture/pipeline";
import { configureNotifications } from "@/src/services/notificationService";
import { refreshScheduledFinancialNotifications } from "@/src/services/notificationScheduler";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    let mounted = true;
    setReady(false);
    setError(null);
    (async () => {
      try {
        await initializeDatabase();
        await seedDatabase();
        await drainNativeCaptureQueue();
        try {
          await configureNotifications();
          await refreshScheduledFinancialNotifications();
        } catch (notificationError) {
          console.warn("Notifications unavailable; continuing without them.", String(notificationError));
        }
        if (mounted) setReady(true);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause : new Error(String(cause)));
      }
    })();
    return () => { mounted = false; };
  }, [retryCount]);
  useEffect(() => {
    if (!ready) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void drainNativeCaptureQueue();
      }
    });
    return () => subscription.remove();
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as { route?: string; params?: string };
      if (data.route) {
        let params: Record<string, string> | undefined;
        try { params = data.params ? JSON.parse(data.params) : undefined; } catch { params = undefined; }
        router.push({ pathname: data.route as any, params });
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    void Notifications.getLastNotificationResponseAsync().then((response) => { if (response) handleNotificationResponse(response); });
    return () => subscription.remove();
  }, [ready, router]);
  useEffect(() => {
    if (!ready) return;
    const handleUrl = async (url: string) => {
      const parsed = Linking.parse(url);
      if (parsed.path !== "capture") return;
      const query = parsed.queryParams ?? {};
      const value = (key: string) => { const item = query[key]; return Array.isArray(item) ? item[0] : item; };
      await captureShortcutPayload({ source: value("source") || "ios_shortcut", rawText: value("rawText") || "", merchant: value("merchant") || undefined, amount: Number(value("amount")), type: value("type"), transactionDate: Number(value("transactionDate")) || Date.now(), referenceId: value("referenceId") || undefined, note: value("note") || undefined });
    };
    const subscription = Linking.addEventListener("url", ({ url }) => { void handleUrl(url); });
    void Linking.getInitialURL().then((url) => { if (url) return handleUrl(url); });
    return () => subscription.remove();
  }, [ready]);
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>OmniFinance could not start</Text>
      <Text style={styles.errorMessage}>Your local database could not be opened. Please try again.</Text>
      <Pressable style={styles.retryButton} onPress={() => setRetryCount((count) => count + 1)}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
  if (!ready) return <View style={styles.container} />;
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <Slot />
          <AccountBottomSheet />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
const styles=StyleSheet.create({
  container:{flex:1},
  errorContainer:{flex:1,alignItems:"center",justifyContent:"center",padding:24},
  errorTitle:{fontSize:20,fontWeight:"700",color:"#0B1D3A",textAlign:"center"},
  errorMessage:{marginTop:10,color:"#6B7280",textAlign:"center"},
  retryButton:{marginTop:20,backgroundColor:"#0B1D3A",borderRadius:12,paddingHorizontal:24,paddingVertical:12},
  retryText:{color:"#FFFFFF",fontWeight:"700"},
});

