import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useEffect } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/src/db"
import migrations from "@/src/db/migrations/migrations"
import { seedDatabase } from "@/src/db/seed"

export default function RootLayout(){
  const { success, error } = useMigrations(db, migrations)

  useEffect(() => {
    if (!success) return;

    async function initializeDatabase() {
      try {
        await seedDatabase()
        console.log("Database seeded successfully")
      } catch (error) {
        console.error("Error seeding database:", error)
      }
    }

    initializeDatabase()
  }, [success]);

  if (error) {
    console.error("Error migrating database:", error)
    return null
  }

  if (!success) {
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
