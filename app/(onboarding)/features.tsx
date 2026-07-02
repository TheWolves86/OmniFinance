import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const Features = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>What OmniFinance does</Text>
          <Text style={styles.headerDescription}>Everything your wallet needs. Nothing it doesn't.</Text>
        </View>
        {/* FeatureCards */}
        <View style={styles.featureContainer}>
          {/* Track Ruppee card */}
          <View style={styles.featureCard}>
            <View style={styles.leftSection}>
              <View style={styles.iconCircle}>
                <Text>📊</Text>
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.CardTitle}>Track Every Rupee</Text>
                <Text style={styles.CardDescription}>Log expenses, income,Emi(with interest) and recurring payments. See where your money goes.</Text>
              </View>
            </View>
          </View>
          {/* Ai budget coach card */}
          <View style={styles.featureCard}>
            <View style={styles.leftSection}>
              <View style={styles.iconCircle}>
                <Text>🤖</Text>
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.CardTitle}>AI Budget Coach</Text>
                <Text style={styles.CardDescription}>Powered by Gemini AI. Get budget suggestions,how to save money and chat with your finances</Text>
              </View>
            </View>
          </View>
          {/* Receipt and SMS scanner card */}
          <View style={styles.featureCard}>
            <View style={styles.leftSection}>
              <View style={styles.iconCircle}>
                <Text>🧾</Text>
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.CardTitle}>Scan Receipts & SMS</Text>
                <Text style={styles.CardDescription}>Auto-capture transactions from receipts and SMS UPI notifications and get SMS alerts from banks</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Footer and button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={() => router.push("/permissions")}>
            <Text style={styles.footerButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Features

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  screen: {
    paddingHorizontal: 15,
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerDescription: {
    color: "#666",

  },
  featureContainer: {
    marginTop: 20,
    gap: 15,
    paddingHorizontal: 5
  },
  featureCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 0.1,
    borderColor: "#666"
  },
  leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1
  },
  iconCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: "#f3f0f0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14
  },
  CardTitle: {
      fontWeight: "700",
      fontSize: 16
  },
  CardDescription: {
      marginTop: 3,
      color: "#666",
      fontSize: 13,
      lineHeight: 18,
      flexWrap: 'wrap'
  },
  textWrapper: {
      flexShrink: 1,
      paddingRight: 8
  },
  footer: {
    marginTop: "35%",
    
  },
  footerButton: {
    backgroundColor: "#0A1628",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  footerButtonText: {
    color: "#F4C430",
    fontSize: 16,
    fontWeight: "700",
  }
})