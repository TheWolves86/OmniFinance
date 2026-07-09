import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getItem } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/constants/storageKeys";

export default function Index() {
  const [ loading, setLoading] = useState(true)
  const [ onboardingDone, setOnboardingDone] = useState(false)
  useEffect(() => {
    async function checkOnboarding() {
      const value = await getItem(STORAGE_KEYS.ONBOARDING);

      if (value === "true") {
        setOnboardingDone(true);
      }

      setLoading(false);
    }

    checkOnboarding();
  }, []);

  // Wait until we check AsyncStorage
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Go to tabs if onboarding is already done
  if (onboardingDone) {
    return <Redirect href="/(tabs)" />;
  }

  
  return <Redirect href="/(onboarding)/welcome" />;
};