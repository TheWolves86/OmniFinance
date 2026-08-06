import { Slot } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/src/db/initialize";
import { seedDatabase } from "@/src/db/seed";
import AccountBottomSheet from "@/src/components/accountBottomSheet";

export default function RootLayout() {
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
        if (mounted) setReady(true);
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause : new Error(String(cause)));
      }
    })();
    return () => { mounted = false; };
  }, [retryCount]);
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

