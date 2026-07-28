import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, {useState, useEffect} from 'react'
import { getDashboardData, DashboardData } from '@/src/services/dashboardService'
import {  SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={25} color="#0B1D3A"/>
            </View>
            <Text style={styles.brandText}>OmniFinance</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#0B1D3A"/>
          </Pressable>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Welcome Back 👋</Text>
          <Text style={styles.greetingSubtitle}>Here's your financial overview</Text>
        </View>
      </View>
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>
            Total Balance
          </Text>
          <Pressable style={styles.eyeButton} onPress={() => setShowBalance(!showBalance)}>
            <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="#FFFFFF"/>
          </Pressable>
        </View>
        <Text style={styles.balanceAmount}>
         {showBalance ? `₹${(dashboardData?.totalBalance ?? 0).toLocaleString("en-IN")}` : "₹ ••••••"}
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20
  },
  header: {
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "#ffffff"
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  brandText:{
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  notificationButton: {
    padding: 4
  },
  greetingContainer: {
    marginTop: 18,
    marginBottom: 5,
  },
  greeting:{
    fontSize: 30,
    fontWeight: "800",
    color: "#0B1D3A"
  },
  greetingSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#7B8190"
  },
  balanceCard: {
    backgroundColor: "#0B1D3A",
    borderRadius: 28,
    padding: 24
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  balanceLabel: {
    color: "#e4dde3",
    fontSize: 15,
    fontWeight: "600"
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 10
  },
  statsRow: {

  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    color: "#ffffff"
  },
})
//