import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { getItem } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/constants/storageKeys";

export default function Index() {
  const [ loading, setLoading] = useState(true)
  const [ onboardingDone, setOnboardingDone] = useState(false)

  useEffect(() => {
    let isMounted = true;

    async function checkOnboarding() {
      try {
        const value = await getItem(STORAGE_KEYS.ONBOARDING);

        if (isMounted) {
          if (value === "true") {
            setOnboardingDone(true);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (onboardingDone) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
