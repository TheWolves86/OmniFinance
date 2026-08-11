import React, {useCallback, useEffect, useMemo, useState} from "react"
import { FlatList, Pressable, StyleSheet, Text, TextInput, View} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import { BottomSheetModal} from "@gorhom/bottom-sheet"
import { getAllGoals } from "@/src/db/repository/goal"
import { presentGoalSheet, subscribeGoalRefresh } from "@/src/components/goalSheetController"
import AddGoalSheet from "@/src/components/addGoalSheet"

//types 
type Goal = {
    id: string,
    title: string,
    description?: string | null,
    targetAmount: number,
    savedAmount: number,
    targetDate?: number | null,
    isCompleted: boolean,
    createdAt?: number,
    updatedAt?: number
}

export default function GoalsPage() {
  //all the states
  const [goals, setGoals] = useState<Goal[]>([])
  const [search, setSearch] = useState("")

  //load all the goals from the database
  const loadGoals = useCallback(async () => {
    try {
      const data = await getAllGoals()
      setGoals((data ?? []) as Goal[])
    } catch (error) {
      console.error("Error loading goals", error)
    }
  }, [])

  //load the goal and refreshes
  useEffect(() => {
    loadGoals()

    const unsubscribe = subscribeGoalRefresh(() => {
      loadGoals()
    })

    return unsubscribe
  }, [loadGoals])

  //filter goals using search bar
  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query){
      return goals
    }

    return goals.filter((goals) => 
      goals.title.toLowerCase().includes(query)
    )
  }, [goals, search])

  //format the amount
  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`
  }

  //calculate how much of the goal is completed
  const getProgress = (goal: Goal) => {
    if (!goal.targetAmount) return 0

    return Math.min(
      Math.max(goal.savedAmount / goal.targetAmount, 0),
      1
    )
  }

  //calculate how much money is still needed
  const getRemaining = (goal: Goal) => {
    return Math.max(goal.targetAmount - goal.savedAmount, 0)
  }

  //format the goal target date
  const formatTargetDate = (date?: number | null) => {
    if (!date) return "No target date"

    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric"
    })
  }

  //render each goal card
  const renderGoal = ({ item}: { item: Goal}) => {
    const progress = getProgress(item)
    const progressPercent = Math.round(progress * 100)

    //open the goal sheet in edit mode
    return (
      <Pressable style={styles.goalCard}
        onPress={() => presentGoalSheet({ mode: "edit", goal: item})
      }>
        <View style={styles.cardTop}>
          <View style={[styles.goalIcon, item.isCompleted && styles.completedIcon]}>
            <Ionicons name={item.isCompleted ? "checkmark" : "flag-outline"} size={18} color={item.isCompleted ? "#3B8C4A" : "#0B1D3A"} />
          </View>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={11} color="#7B8190"/>
            <Text style={styles.dateText}>
              {formatTargetDate(item.targetDate)}
            </Text>
          </View>
        </View>
        <Text style={styles.goalTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.amountRow}>
          <Text style={styles.savedAmount}>
            {formatAmount(item.savedAmount)}
          </Text>
          <Text style={styles.targetAmount}>
            / {formatAmount(item.targetAmount)}
          </Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressPercent}>
            {progressPercent}%
          </Text>
          <Text style={styles.remainingText}>
            {item.isCompleted ? "Completed" : `${formatAmount(getRemaining(item))}`}
          </Text>
        </View>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: item.isCompleted ? "#D4A72C" : "#0B1D3A"}]}></View>
        </View>
      </Pressable>
    )
  }
  //goals screen
  return (
    <SafeAreaView style={styles.container}>
      {/* shows all the goals in list */}
      <FlatList 
        data={filteredGoals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoal}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.heading}>Goals</Text>
                <Text style={styles.subtitle}>
                  Track and achieve your financial goals
                </Text>
              </View>
              <Pressable style={styles.filterButton}>
                <Ionicons name="options-outline" size={20} color="#0B1D3A" />
              </Pressable>
            </View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#9CA3AF"/>
              <TextInput 
                value={search}
                onChangeText={setSearch}
                placeholder="Search Goals"
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
              />
            </View>
          </View>
        }
        //show this when there are no goals
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons 
                name="flag-outline"
                size={30}
                color="#9CA3AF"
              />
            </View>
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first financial goal to get start saving
            </Text>
          </View>
        }
      />
      {/* open the goal sheet in create mode */}
      <Pressable style={styles.fab} onPress={() => presentGoalSheet({ mode: "create"})}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
      <AddGoalSheet />
    </SafeAreaView>
  )
}

//styles for the goals screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B1D3A"
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#7B8190"
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    alignItems: "center",
    justifyContent: "center"
  },
  searchBar: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0B1D3A"
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECEEF2"
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  goalIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center"
  },
  completedIcon: {
    backgroundColor: "#FFF5D8"
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3
  },
  dateText: {
    fontSize: 9,
    color: "#7B8190"
  },
  goalTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 3
  },
  savedAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0B1D3A"
  },
  targetAmount: {
    marginLeft: 5,
    fontSize: 11,
    color: "#8A93A6"
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 5
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7B8190"
  },
  remainingText: {
    fontSize: 10,
    color: "#7B8190"
  },
  progressBackground: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "#E8ECF2",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%"
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EEF1F6",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#0B1D3A"
  },
  emptySubtitle: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#7B8190"
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 16,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0B1D3A",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  }
})
//
