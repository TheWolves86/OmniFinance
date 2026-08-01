import { StyleSheet, Text, View, Pressable, TextInput, ScrollView} from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllAccounts } from "@/src/db/repository/account"
import { useRouter } from "expo-router";
import { presentAccountSheet } from "@/src/components/accountSheetController"

const Accounts = () => {
  const router = useRouter()
  const [accounts, setAccounts] = useState<any[]>([])
  const [search, setSearch] = useState("")
  useEffect(() => {
    loadAccounts()
  }, [])
  async function loadAccounts() {
    try {
      const data = await getAllAccounts()
      setAccounts(data)
    } catch (error) {
      console.error(error)
    }
  }

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()))
  }, [accounts, search])

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0B1D3A" />
        </Pressable>
        <Text style={styles.heading}>Accounts</Text>
      </View>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          TOTAL BALANCE
        </Text>
        <Text style={styles.balanceAmount}>
          ₹{accounts.reduce((sum, account) => sum + account.balance, 0).toLocaleString("en-IN")}
        </Text>
        <Text style={styles.activeAccounts}>
          • {accounts.length} Active Accounts
        </Text>
        <View style={styles.chartPlaceholder}>
          {[32, 18, 24, 20, 38, 30, 42, 48].map((height, index) => (
            <View
              key={index}
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor:
                    index === 7 ? "#0B1D3A" : "#D8DCE5",
                },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput placeholder="Search Accounts..." value={search} onChangeText={setSearch} style={styles.searchInput} placeholderTextColor="#9CA3AF"/>
      </View>
    </>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              marginTop: 60,
              paddingHorizontal: 40,
            }}
          >
            <Ionicons
              name="wallet-outline"
              size={64}
              color="#D1D5DB"
            />

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginTop: 18,
                color: "#0B1D3A",
              }}
            >
              No Accounts Yet
            </Text>

            <Text
              style={{
                marginTop: 8,
                textAlign: "center",
                color: "#7B8190",
              }}
            >
              Tap the + button to create your first account.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        getItemLayout={(data, index) => ({
          length: 73, // Height of account card based on styling (approx)
          offset: 73 * index,
          index,
        })}
        renderItem={({item}) => (
          <Pressable style={styles.accountCard} onPress={() => router.push(`/account-details/${item.id}`)}>
            <View style={styles.accountIcon}>
              <Ionicons name="wallet-outline" size={18} color="#0B1D3A"/>
            </View>
            <View style={{ flex: 1, marginLeft: 12}}>
              <Text style={styles.accountName}>
                {item.name}
              </Text>
              <Text style={styles.accountType}>
                {item.type}
              </Text>
            </View>
            <Text style={styles.accountBalance}>
              ₹{item.balance.toLocaleString("en-IN")}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#B0B6C3" />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => presentAccountSheet({ mode: "create"})}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  )
}

export default Accounts

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  header: {
    flexDirection: 'row',
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1D3A",
    marginLeft: 12
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECEEF2"
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1
  },
  balanceAmount: {
    marginTop: 8,
    fontSize: 38,
    fontWeight: "800",
    color: "#0B1D3A"
  },
  activeAccounts: {
    marginTop: 4,
    color: "#7B8190",
    fontSize: 13
  },
  chartPlaceholder: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 18,
    height: 50
  },
  chartBar: {
    width: 22,
    marginRight: 4,
    borderRadius: 2
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15
  },
  listContent: {
    paddingBottom: 96
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2"
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F6F8",
    justifyContent: "center",
    alignItems: "center"
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B1D3A",
  },
  accountType: {
    marginTop: 2,
    color: "#7B8190",
    fontSize: 13
  },
  accountBalance: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1D3A",
    marginRight: 8
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#FFF5D8",
    margin: 20,
    borderRadius: 16,
    padding: 16
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    color: "#7A5A00",
    fontSize: 14
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 60,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B1D3A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  }
})
//hi my name is 