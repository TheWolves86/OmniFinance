import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Images } from "@/src/lib/image";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.middle}>
          <Image
            source={Images.logo}
            style={styles.logo}
          />

          <Text style={styles.description}>
            Your money. Your rules.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push("/permissions")}
            activeOpacity={0.8}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Get Started →
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Open source. No account needed.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginLeft: 60
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: "#0A1628",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#F4C430",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    alignSelf: "center",
    fontSize: 12,
    color: "#8B8B8B",
  },
});
//