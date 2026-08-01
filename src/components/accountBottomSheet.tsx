import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, Text, View, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  registerAccountSheet,
  subscribeAccountSheet,
  dismissAccountSheet,
  AccountSheetPayload,
} from "./accountSheetController";
import Ionicons from "@expo/vector-icons/Ionicons";

const AccountBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<AccountSheetPayload>({ mode: "create" });
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [accountType, setAccountType] = useState("Cash");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [selectedIcon, setSelectedIcon] = useState("wallet-outline");
  const [isDefault, setIsDefault] = useState(false);

  useImperativeHandle(ref, () => modalRef.current as BottomSheetModal, [modalRef]);

  useEffect(() => {
    registerAccountSheet(modalRef.current);

    const unsubscribe = subscribeAccountSheet((nextPayload) => {
      setPayload(nextPayload);
    });

    return () => {
      unsubscribe();
      registerAccountSheet(null);
    };
  }, []);

  const accountTypes = ["Cash", "Bank", "UPI", "Credit Card", "Wallet", "Investment"];
  const colors = ["#3B82F6", "#22C55E", "#8B5CF6", "#F97316", "#EF4444", "#111827"];
  const icons = ["wallet-outline", "card-outline", "cash-outline", "business-outline", "card", "logo-bitcoin"];

  const renderBackdrop = useMemo(
    () =>
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

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={["70%"]}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      bottomInset={insets.bottom}
      topInset={insets.top}
      keyboardBehavior="extend"
      onDismiss={() => setPayload({ mode: "create" })}
    >
      <BottomSheetScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{payload.mode === "edit" ? "Edit Account" : "Add Account"}</Text>
          <Pressable onPress={() => dismissAccountSheet()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Name</Text>
          <BottomSheetTextInput
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Enter Account Name..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Opening Balance</Text>
          <BottomSheetTextInput
            value={openingBalance}
            onChangeText={setOpeningBalance}
            placeholder="₹ 0.00"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.typeContainer}>
            {accountTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.typeChip, accountType === type && styles.selectedTypeChip]}
                onPress={() => setAccountType(type)}
              >
                <Text style={[styles.typeText, accountType === type && styles.selectedTypeText]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Color</Text>
          <View style={styles.colorContainer}>
            {colors.map((color) => (
              <Pressable
                key={color}
                style={[styles.colorCircle, { backgroundColor: color }, selectedColor === color && styles.selectedColorCircle]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Account Icon</Text>
          <View style={styles.iconContainer}>
            {icons.map((icon) => (
              <Pressable
                key={icon}
                style={[styles.iconButton, selectedIcon === icon && styles.selectedIconButton]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? "#FFFFFF" : "#0B1D3A"} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Make Default Account</Text>
              <Text style={styles.switchSubtitle}>New transactions will use this account automatically</Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#D1D5DB", true: "#0B1D3A" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={() => dismissAccountSheet()}>
          <Text style={styles.saveButtonText}>Save Account</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

AccountBottomSheet.displayName = "AccountBottomSheet";

export default AccountBottomSheet;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0B1D3A",
  },
  cancel: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0B1D3A",
    backgroundColor: "#FFFFFF",
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedTypeChip: {
    backgroundColor: "#0B1D3A",
    borderColor: "#0B1D3A",
  },
  typeText: {
    color: "#374151",
    fontWeight: "600",
  },
  selectedTypeText: {
    color: "#FFFFFF",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 14,
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: "#0B1D3A",
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    marginRight: 12,
    marginBottom: 12,
  },
  selectedIconButton: {
    backgroundColor: "#0B1D3A",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchSubtitle: {
    marginTop: 4,
    color: "#7B8190",
    fontSize: 13,
    maxWidth: 250,
  },
  saveButton: {
    marginTop: 32,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#0B1D3A",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
//