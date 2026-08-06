import { StyleSheet, Text, View, Pressable, TextInput, FlatList, Alert } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllAccounts } from "@/src/db/repository/account"
import { useRouter } from "expo-router";
import { presentAccountSheet, subscribeAccountRefresh} from "@/src/components/accountSheetController"
import AccountDetailsBottomSheet from '@/src/components/accountDetailsBottomSheet'
import { deleteAccount } from '@/src/db/repository/account'

//shape of one account object from the database
type Account = {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  icon?: string | null
  color?: string | null
  isDefault: boolean
  createdAt?: number
  updatedAt?: number
}
//Main accounts screen
const Accounts = () => {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [search, setSearch] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  //load accounts and refresh whenever account data changes
  useEffect(() => {
    loadAccounts()

    const unsubscribe = subscribeAccountRefresh(() => {
      loadAccounts()
    })

    return () => {
      unsubscribe()
    }
  }, [])
  //fetch all accounts from the database
  async function loadAccounts() {
    try {
      const data = await getAllAccounts()
      setAccounts(data)
    } catch (error) {
      console.error(error)
    }
  }

  //filter accounts based on the search text
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()))
  }, [accounts, search])

  //open the account details sheet
  function openAccountDetails(account: Account) {
    setSelectedAccount(account)
  }

  //close the account details sheet
  function closeAccountDetails() {
    setSelectedAccount(null)
  }

  //open the edit account bottom sheet
  async function handleEditAccount() {
    if (!selectedAccount) {
      return
    }

    closeAccountDetails()
    presentAccountSheet({
      mode: "edit",
      account: selectedAccount,
    })
  }

  //ask for confirmation before deleting an account
  async function handleDeleteAccount() {
    if (!selectedAccount) {
      return
    }

    Alert.alert(
      "Delete account?",
      `This will permanently remove ${selectedAccount.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount(selectedAccount.id)
              closeAccountDetails()
              loadAccounts()
            } catch (error) {
              console.error(error)
            }
          },
        },
      ]
    )
  }

  //header with total balance and search for
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

  //accounts screen ui starts here
  return (
    <SafeAreaView style={styles.container}>
    {/* displays all available accounts */}
      <FlatList
        data={filteredAccounts}
        keyExtractor={(item: Account) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="wallet-outline"
              size={64}
              color="#D1D5DB"
            />

            <Text style={styles.emptyTitle}>
              No Accounts Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first account.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        getItemLayout={(data: ArrayLike<Account> | null | undefined, index: number) => ({
          length: 73, 
          offset: 73 * index,
          index,
        })}
        renderItem={({item}: { item: Account }) => (
          <Pressable style={styles.accountCard} onPress={() => openAccountDetails(item)}>
            <View style={styles.accountIcon}>
              <Ionicons name="wallet-outline" size={18} color="#0B1D3A"/>
            </View>
            <View style={styles.accountDetails}>
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
      <AccountDetailsBottomSheet
        account={selectedAccount}
        onClose={closeAccountDetails}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
      />
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
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    color: "#0B1D3A",
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#7B8190",
  },
  accountDetails: {
    flex: 1,
    marginLeft: 12
  }
})
