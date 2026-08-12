import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { randomUUID } from "expo-crypto";

import { db } from "@/src/db";
import {
  dismissBillsSheet,
  emitBillChanged,
  registerBillsSheet,
  subscribeBillsSheet,
  BillsSheetPayload,
} from "./billsSheetController";

const BillsBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);

  const [payload, setPayload] = useState<BillsSheetPayload>({
    mode: "create",
  });

  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  const snapPoints = useMemo(() => ["70%"], []);

  useEffect(() => {
    registerBillsSheet(modalRef.current);

    const unsubscribe = subscribeBillsSheet((nextPayload) => {
      setPayload(nextPayload);

      if (nextPayload.mode === "edit" && nextPayload.bill) {
        setEditingBillId(nextPayload.bill.id);
        setBillName(nextPayload.bill.name ?? "");
        setAmount(String(nextPayload.bill.amount ?? ""));
        setCategory(nextPayload.bill.category ?? "");

        setDueDate(
          nextPayload.bill.dueDate
            ? new Date(nextPayload.bill.dueDate)
            : new Date()
        );
      } else {
        resetForm();
      }
    });

    return () => {
      unsubscribe();
      registerBillsSheet(null);
    };
  }, []);

  function resetForm() {
    setEditingBillId(null);
    setBillName("");
    setAmount("");
    setCategory("");
    setDueDate(new Date());
    setIsDatePickerOpen(false);
    setPayload({ mode: "create" });
  }

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "set" && selectedDate) {
      setDueDate(selectedDate);
    }

    setIsDatePickerOpen(false);
  };

  async function handleSave() {
    const trimmedName = billName.trim();
    const numericAmount = Number(amount);

    if (!trimmedName) {
      Alert.alert("Enter bill name");
      return;
    }

    if (
      !amount ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert("Enter a valid amount");
      return;
    }

    try {
      const now = Date.now();

      if (payload.mode === "edit" && editingBillId) {
        await db.runAsync(
          `UPDATE bills
           SET name = ?,
               amount = ?,
               category = ?,
               due_date = ?,
               updated_at = ?
           WHERE id = ?`,
          trimmedName,
          numericAmount,
          category.trim() || null,
          dueDate.getTime(),
          now,
          editingBillId
        );
      } else {
        const id = randomUUID();

        await db.runAsync(
          `INSERT INTO bills
           (id, name, amount, category, due_date, is_paid, paid_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          id,
          trimmedName,
          numericAmount,
          category.trim() || null,
          dueDate.getTime(),
          0,
          null,
          now,
          now
        );
      }

      emitBillChanged();
      resetForm();
      dismissBillsSheet();
    } catch (error) {
      console.error("Error saving bill:", error);
      Alert.alert("Something went wrong", "Could not save the bill.");
    }
  }

  const renderBackdrop = useMemo(
    () => (backdropProps: any) => (
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

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onDismiss={resetForm}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={dismissBillsSheet}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>

          <Text style={styles.title}>
            {payload.mode === "edit" ? "Edit Bill" : "New Bill"}
          </Text>

          <Pressable onPress={handleSave}>
            <Text style={styles.save}>
              {payload.mode === "edit" ? "Update" : "Save"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>BILL NAME</Text>

          <BottomSheetTextInput
            value={billName}
            onChangeText={setBillName}
            placeholder="e.g. Internet"
            placeholderTextColor="#A1A8B5"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>AMOUNT</Text>

          <BottomSheetTextInput
            value={amount}
            onChangeText={(text) =>
              setAmount(text.replace(/\D/g, ""))
            }
            keyboardType="numeric"
            placeholder="₹ 0"
            placeholderTextColor="#C5CAD3"
            style={styles.amountInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>CATEGORY</Text>

          <BottomSheetTextInput
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Utilities"
            placeholderTextColor="#A1A8B5"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DUE DATE</Text>

          <Pressable
            style={styles.dateButton}
            onPress={() => setIsDatePickerOpen(true)}
          >
            <Text style={styles.dateText}>
              {dueDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </Pressable>

          {isDatePickerOpen && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {payload.mode === "edit"
              ? "Update Bill"
              : "Save Bill"}
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

BillsBottomSheet.displayName = "BillsBottomSheet";

export default BillsBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F7F8FA",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  handle: {
    backgroundColor: "#FFFFFF",
    width: 44,
    height: 5,
  },

  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 30,
  },

  cancel: {
    fontSize: 17,
    color: "#6B7280",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  save: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B1D3A",
  },

  section: {
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 1,
    marginBottom: 10,
  },

  input: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0B1D3A",
  },

  amountInput: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  dateButton: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  dateText: {
    fontSize: 15,
    color: "#0B1D3A",
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#0B1D3A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});