import { StyleSheet, Text, View, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { getDashboardData, DashboardData } from '@/src/services/dashboardService'
import { subscribeTransactionRefresh } from '@/src/components/transactionSheetController'
import { subscribeAccountRefresh } from '@/src/components/accountSheetController'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from "expo-router"

const Dashboard = () => {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    loadDashboard()

    const unsubscribe = subscribeTransactionRefresh(() => {
      loadDashboard()
    })
    const unsubscribeAccounts = subscribeAccountRefresh(() => {
      loadDashboard()
    })

    return () => {
      unsubscribe()
      unsubscribeAccounts()
    }
  }, [])

  async function loadDashboard() {
    try {
      const data = await getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error("Error: " + String(error))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={20} color="#0B1D3A" />
            </View>
            <Text style={styles.brandText}>OmniFinance</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#0B1D3A" />
          </Pressable>
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Welcome Back 👋</Text>
          <Text style={styles.greetingSubtitle}>Here's your financial overview</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Pressable style={styles.eyeButton} onPress={() => setShowBalance(!showBalance)}>
            <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.balanceAmount}>
          {showBalance
            ? `₹${(dashboardData?.totalBalance ?? 0).toLocaleString('en-IN')}`
            : '₹ ••••••'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.incomeCard]}>
          <View style={styles.statCardHeader}>
            <Ionicons name="arrow-down-circle" size={18} color="#2ECC71" />
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <Text style={styles.statAmount}>
            {showBalance
              ? `₹${(dashboardData?.monthlyIncome ?? 0).toLocaleString('en-IN')}`
              : '₹ ••••••'}
          </Text>
          <Text style={styles.statSubtext}>This Month</Text>
        </View>

        <View style={[styles.statCard, styles.expenseCard]}>
          <View style={styles.statCardHeader}>
            <Ionicons name="arrow-up-circle" size={18} color="#FF5A5F" />
            <Text style={styles.statLabel}>Expense</Text>
          </View>
          <Text style={styles.statAmount}>
            {showBalance
              ? `₹${(dashboardData?.monthlyExpense ?? 0).toLocaleString('en-IN')}`
              : '₹ ••••••'}
          </Text>
          <Text style={styles.statSubtext}>This Month</Text>
        </View>
      </View>
      <Pressable onPress={() => router.push('/accounts')}>
        <Text>Go to accounts</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/loans')}>
        <Text>Go to loans</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/bills')}>
        <Text>Go to bills</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/budgets')}>
        <Text>Go to budgets</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/insurance')}>
        <Text>Go to Insurance</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1D3A',
  },
  notificationButton: {
    padding: 4,
  },
  greetingContainer: {
    marginTop: 18,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0B1D3A',
  },
  greetingSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#7B8190',
  },
  balanceCard: {
    backgroundColor: '#0B1D3A',
    borderRadius: 28,
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#E4DDE3',
    fontSize: 15,
    fontWeight: '600',
  },
  balanceAmount: {
    marginTop: 10,
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#F8FAFF',
  },
  incomeCard: {
    marginRight: 12,
  },
  expenseCard: {
    marginLeft: 12,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    marginLeft: 8,
    color: '#1C2340',
    fontSize: 14,
    fontWeight: '600',
  },
  statAmount: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1D3A',
  },
  statSubtext: {
    marginTop: 6,
    fontSize: 13,
    color: '#7B8190',
  },
})
//