import { Stack } from "expo-router";
import { useEffect } from "react";
import { initializeDatabase } from "@/src/db/init";

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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}