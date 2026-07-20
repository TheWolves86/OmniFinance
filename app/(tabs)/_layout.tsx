import { Tabs } from "expo-router";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import CustomTabBar from "@/src/components/customTabBar";
import AddTransactionSheet from "@/src/components/transactionBottomSheet";

export default function TabsLayout() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onAddPress={() => bottomSheetRef.current?.present()}
          />
        )}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Tabs.Screen name="activity" options={{ title: "Activity" }} />
        <Tabs.Screen name="goals" options={{ title: "Goals" }} />
        <Tabs.Screen name="reports" options={{ title: "Reports" }} />
      </Tabs>

      <AddTransactionSheet ref={bottomSheetRef} />
    </>
  );
}