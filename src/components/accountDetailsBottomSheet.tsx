import React, { forwardRef } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"

type AccountDetails = {
  id: string
  name: string
  type: string
  balance: number
  currency: string
  icon?: string | null
  color?: string | null
  isDefault?: boolean
  createdAt?: number
}

type Props = {
  account: AccountDetails | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

const AccountDetailsBottomSheet = forwardRef<any, Props>((props, _ref) => {
  const insets = useSafeAreaInsets()
  const balanceText = props.account?.balance != null ? `₹${props.account.balance.toLocaleString("en-IN")}` : "-"
  const createdText = props.account?.createdAt != null ? new Date(props.account.createdAt).toLocaleString("en-IN") : "Not Available"

  return (
    <Modal visible={Boolean(props.account)} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={props.onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}> 
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Account Details</Text>
                <Text style={styles.subtitle}>Read only</Text>
              </View>
              <Pressable onPress={props.onClose}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.iconCircle, { backgroundColor: props.account?.color ?? "#3B82F6" }] }>
                <Ionicons name={(props.account?.icon as any) ?? "wallet-outline"} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.accountName}>{props.account?.name ?? "Account"}</Text>
                <Text style={styles.accountType}>{props.account?.type ?? "Account"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Current Balance</Text>
              <Text style={styles.value}>{balanceText}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Account Type</Text>
              <Text style={styles.value}>{props.account?.type ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>{props.account?.currency ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Default Account</Text>
              <Text style={styles.value}>{props.account?.isDefault ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Account Color</Text>
              <Text style={styles.value}>{props.account?.color ?? "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Created Date</Text>
              <Text style={styles.value}>{createdText}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.editButton} onPress={props.onEdit}>
                <Text style={styles.editButtonText}>✏ Edit Account</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={props.onDelete}>
                <Text style={styles.deleteButtonText}>🗑 Delete Account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
})

AccountDetailsBottomSheet.displayName = "AccountDetailsBottomSheet"

export default AccountDetailsBottomSheet

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 8, 23, 0.35)",
    paddingTop: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    minHeight: "70%",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0B1D3A",
  },
  subtitle: {
    marginTop: 4,
    color: "#7B8190",
    fontSize: 13,
  },
  closeText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryText: {
    marginLeft: 12,
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0B1D3A",
  },
  accountType: {
    marginTop: 4,
    color: "#7B8190",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEEF2",
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1D3A",
  },
  actions: {
    marginTop: 28,
  },
  editButton: {
    backgroundColor: "#0B1D3A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
  },
})
//