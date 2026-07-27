import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, {useState, useEffect} from 'react'
import { getDashboardData, DashboardData } from '@/src/services/dashboardService'
import {  SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
    marginBottom: 24,
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
  }
})
