import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, TextInput, SectionList } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAllTransaction } from "@/src/db/repository/transaction";
import React, { useState, useEffect } from "react";

export default function ActivityPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions(){
    try {
      const data = await getAllTransaction();
      setTransactions(data);
    } catch (error) {
        console.error(error)
    }
  }

  const filteredTransactions = transactions.filter((item) => item.categoryId.toLowerCase().includes(search.toLowerCase()));
  
  const grouped = filteredTransactions.reduce((acc: any,item: any) => {
    const date = new Date(item.transactionDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let title = date.toLocaleDateString("en-IN")

    if (date.toDateString() === today.toDateString()) {
      title="TODAY"
    } else if (date.toDateString() === yesterday.toDateString()) {
      title="YESTERDAY"
    }

    const section = acc.find((s: any) => s.title === title);

    if (section) {
      section.data.push(item);
    } else {
      acc.push({
        title,
        data: [item]
      })
    }

    return acc;
  }, [])
  return (
    <SafeAreaView style={{ flex: 1}}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={16} color="#0B1D3A" />
            </View>
            <Text style={styles.brandText}>OmniFinance</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={20} color="#0B1D3A" />
          </Pressable>
        </View>
        <Text style={styles.heading}>Transactions</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput value={search} onChangeText={setSearch} placeholder="Search Transactions" placeholderTextColor="#9CA3AF" style={styles.searchInput}/>
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options-outline" size={18} color="#OB1D3A"/>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
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
  brandText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  notificationButton: {
    padding: 4
  },
  heading: {
    fontSize: 40,
    fontWeight: "800",
    color: "#0B1D3A",
    marginTop: 18
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ECEEF2 "
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0B1D3A"
  },
  filterButton: {
    width: 46,
    height: 46,
    marginLeft: 10,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ECEEF2",
    justifyContent: "center",
    alignItems: "center"
  }
})