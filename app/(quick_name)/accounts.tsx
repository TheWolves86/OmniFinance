import { StyleSheet, Text, View, Pressable} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllAccounts } from "@/src/db/repository/account"
import { useRouter } from "expo-router";

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
  const filteredAccounts = accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0B1D3A" />
        </Pressable>
        <Text style={styles.heading}>Accounts</Text>
      </View>
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
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B1D3A",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  }
})
//