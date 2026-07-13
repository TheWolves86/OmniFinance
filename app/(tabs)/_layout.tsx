import { Tabs } from "expo-router";
import CustomTabBar from "@/src/components/customTabBar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => (
      <CustomTabBar {...(props as any)} />
    )} 
    screenOptions={{
      headerShown: false
    }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboad"}}/>
      <Tabs.Screen name="activity" options={{ title: "Activity"}}/>
      <Tabs.Screen name="goals" options={{ title: "Goals"}}/>
      <Tabs.Screen name="reports" options={{ title: "Reports"}}/>
    </Tabs>
  )
}