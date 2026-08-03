import React, { forwardRef, useMemo, useCallback, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { deleteTransactionService } from "@/src/services/transactionService";
import { emitTransactionChanged } from "@/src/components/transactionSheetController";

type TransactionDetailsSheetProps = {
  transaction: any;
  onEdit?: (transaction: any) => void;
  onDelete?: (transaction: any) => void;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export const TransactionDetailsSheet = forwardRef<BottomSheetModal, TransactionDetailsSheetProps>(({ transaction, onEdit, onDelete }, ref) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const snapPoints = useMemo(() => ["80%"], []);

  const renderBackDrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!transaction?.id) return;
            setIsDeleting(true);
            try {
              await deleteTransactionService(transaction.id);
              emitTransactionChanged();
              if (onDelete) {
                onDelete(transaction);
              }
            } catch (error) {
              console.error("Error deleting transaction:", error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formattedDate = transaction?.transactionDate
    ? new Date(transaction.transactionDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  const amountText = Number(transaction?.amount ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackDrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.amount}>₹{amountText}</Text>
          <Text style={styles.transactionTitle}>{transaction?.title || "Untitled Transaction"}</Text>
          <Text style={styles.type}>{transaction?.type === "income" ? "Income" : "Expense"}</Text>
        </View>

        <View style={styles.card}>
          <DetailRow label="Category" value={transaction?.categoryName || "Uncategorized"} />
          <DetailRow label="Account" value={transaction?.accountName || "Unknown account"} />
          <DetailRow label="Date" value={formattedDate} />
          <DetailRow label="Notes" value={transaction?.note?.trim() ? transaction.note : "No notes"} />
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => {
            if (onEdit && transaction) {
              onEdit(transaction);
            }
          }}
        >
          <Text style={styles.editButtonText}>Edit Transaction</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
          <Text style={styles.deleteButtonText}>{isDeleting ? "Deleting..." : "Delete Transaction"}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default TransactionDetailsSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F7F8FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  amount: {
    fontSize: 38,
    fontWeight: "800",
    color: "#0B1D3A",
  },
  transactionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1D3A",
    marginTop: 8,
  },
  type: {
    marginTop: 8,
    fontSize: 15,
    color: "#8A93A6",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#8A93A6",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#0B1D3A",
    flex: 1,
    textAlign: "right",
  },
  editButton: {
    backgroundColor: "#0B1D3A",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
  },
});
