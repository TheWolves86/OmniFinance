import { StyleSheet, Text, View, Pressable, TextInput, FlatList, ScrollView, Animated } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getDashboardData, DashboardData } from '@/src/services/dashboardService'
import { getContextualSuggestions } from '@/src/services/aiSuggestionsService'
import { subscribeTransactionRefresh } from '@/src/components/transactionSheetController'
import { subscribeAccountRefresh } from '@/src/components/accountSheetController'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from "expo-router"

type Suggestion = { text: string; question: string };

const Dashboard = () => {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [showBalance, setShowBalance] = useState(true)
  const [aiInput, setAiInput] = useState('')
  const [aiSending, setAiSending] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const sendScale = useRef(new Animated.Value(1)).current
  const cardOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    loadDashboard()
    const unsubscribe = subscribeTransactionRefresh(() => { loadDashboard() })
    const unsubscribeAccounts = subscribeAccountRefresh(() => { loadDashboard() })
    return () => { unsubscribe(); unsubscribeAccounts() }
  }, [])

  async function loadDashboard() {
    try {
      const data = await getDashboardData()
      setDashboardData(data)
      // Load contextual suggestions (non-blocking)
      getContextualSuggestions().then(setSuggestions).catch(() => {})
    } catch (error) {
      console.error("Error: " + String(error))
    }
  }

  const navigateWithQuestion = useCallback((question: string) => {
    if (aiSending) return
    setAiSending(true)

    // Animate send button press
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.85, useNativeDriver: true, speed: 50 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start()

    // Subtle card feedback
    Animated.sequence([
      Animated.timing(cardOpacity, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()

    // Navigate after brief animation
    setTimeout(() => {
      setAiInput('')
      setAiSending(false)
      router.push({ pathname: '/ai-coach', params: { initialQuestion: question } })
    }, 280)
  }, [aiSending, router, sendScale, cardOpacity])

  const handleSend = useCallback(() => {
    const trimmed = aiInput.trim()
    if (!trimmed || aiSending) return
    navigateWithQuestion(trimmed)
  }, [aiInput, aiSending, navigateWithQuestion])

  const handleChipPress = useCallback((suggestion: Suggestion) => {
    if (aiSending) return
    navigateWithQuestion(suggestion.question)
  }, [aiSending, navigateWithQuestion])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoCircle}>
                <Ionicons name="wallet" size={20} color="#0B1D3A" />
              </View>
              <Text style={styles.brandText}>OmniFinance</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Pressable style={styles.notificationButton} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={20} color="#0B1D3A" />
              </Pressable>
              <Pressable style={styles.notificationButton} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={20} color="#0B1D3A" />
              </Pressable>
            </View>
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

        {/* ──── Ask OmniFinance AI Card ──── */}
        <Animated.View style={[styles.aiCard, { opacity: cardOpacity }]}>
          <View style={styles.aiCardHeader}>
            <View style={styles.aiCardTitleRow}>
              <Ionicons name="sparkles" size={16} color="#0B1D3A" />
              <Text style={styles.aiCardTitle}>Ask OmniFinance</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => router.push('/ai-settings')}>
              <Ionicons name="settings-outline" size={16} color="#9CA3AF" />
            </Pressable>
          </View>
          <Text style={styles.aiCardSubtitle}>Ask anything about your money</Text>

          <View style={styles.aiInputRow}>
            <TextInput
              value={aiInput}
              onChangeText={setAiInput}
              placeholder="Ask about your money..."
              placeholderTextColor="#9CA3AF"
              style={styles.aiInput}
              multiline
              maxLength={2000}
              editable={!aiSending}
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={handleSend}
            />
            <Animated.View style={{ transform: [{ scale: sendScale }] }}>
              <Pressable
                disabled={!aiInput.trim() || aiSending}
                style={[styles.aiSendButton, (!aiInput.trim() || aiSending) && styles.aiSendDisabled]}
                onPress={handleSend}
              >
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              </Pressable>
            </Animated.View>
          </View>

          {suggestions.length > 0 && (
            <FlatList
              horizontal
              data={suggestions}
              keyExtractor={(item) => item.text}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiChips}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.aiChip, pressed && styles.aiChipPressed]}
                  onPress={() => handleChipPress(item)}
                  disabled={aiSending}
                >
                  <Text style={styles.aiChipText}>{item.text}</Text>
                </Pressable>
              )}
            />
          )}
        </Animated.View>

        {/* ──── Quick Access ──── */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/accounts')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#EEF6FF' }]}>
                <Ionicons name="wallet-outline" size={20} color="#0B1D3A" />
              </View>
              <Text style={styles.quickAccessLabel}>Accounts</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/budgets')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="pie-chart-outline" size={20} color="#2ECC71" />
              </View>
              <Text style={styles.quickAccessLabel}>Budgets</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/bills')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#FFF8F0' }]}>
                <Ionicons name="receipt-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.quickAccessLabel}>Bills</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/loans')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="cash-outline" size={20} color="#FF5A5F" />
              </View>
              <Text style={styles.quickAccessLabel}>Loans</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/insurance')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F5F0FF' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#7C3AED" />
              </View>
              <Text style={styles.quickAccessLabel}>Insurance</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.quickAccessItem, pressed && styles.quickAccessPressed]} onPress={() => router.push('/ai-coach')}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#F0F7FF' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0B1D3A" />
              </View>
              <Text style={styles.quickAccessLabel}>AI Coach</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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

  // ── Ask OmniFinance AI Card ──
  aiCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F1F4',
    shadowColor: '#0B1D3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1D3A',
  },
  aiCardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#7B8190',
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  aiInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 80,
    backgroundColor: '#F7F8FA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0B1D3A',
  },
  aiSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0B1D3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSendDisabled: {
    opacity: 0.3,
  },
  aiChips: {
    gap: 8,
    paddingTop: 12,
  },
  aiChip: {
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  aiChipPressed: {
    opacity: 0.6,
    backgroundColor: '#EEF2F8',
  },
  aiChipText: {
    color: '#0B1D3A',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Quick Access ──
  quickAccessSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B1D3A',
    marginBottom: 14,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F0F1F4',
  },
  quickAccessPressed: {
    opacity: 0.7,
    backgroundColor: '#F8FAFF',
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B1D3A',
  },
})
