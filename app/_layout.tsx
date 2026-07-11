import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "@/src/db/init";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        await initializeDatabase();
        console.log("Database initialized");
      } catch (error) {
        console.log("Database error:", error);
      }
    };

    loadDatabase();
  }, []);

  return (
    <BottomSheetModalProvider>
      <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
    </BottomSheetModalProvider>
    
  );
}//