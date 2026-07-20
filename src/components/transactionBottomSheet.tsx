import React, { forwardRef, useMemo, useCallback, useState} from "react"
import {BottomSheetBackdrop,BottomSheetModal,BottomSheetScrollView,} from "@gorhom/bottom-sheet";
import { View, Text, Pressable, StyleSheet, TextInput} from "react-native"
import SwitchSelector from "react-native-switch-selector"

const COLORS = {
  background: "#F7F8FA",
  white: "#FFFFFF",
  navy: "#0B1D3A",
  gray: "#6B7280",
  border: "#E8ECF2"
}

const AddTransactionSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const snapPoints = useMemo(() => ["95%"], [])

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

  const [ transactionType, setTransactionType ] = useState<"income" | "expense">("expense")
  const [ title, setTitle ] = useState("")
  const [ amount, setAmount ] = useState("4500")

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
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>

          <Text style={styles.title}>
            New Transaction
          </Text>

          <Pressable>
            <Text style={styles.save}>Save</Text>
          </Pressable>
        </View>
        <View style={styles.switchContainer}>
          <SwitchSelector
            initial={1}
            valuePadding={2}
            borderRadius={12}
            height={38}
            animationDuration={250}
            textColor="#7A8090"
            selectedColor="#0B1D3A"
            buttonColor="#ffffff"
            backgroundColor="#F1F3F6"
            hasPadding
            onPress={(value: any) => setTransactionType(value as "expense" | "income")}
            options={[
              {
                label: "Income",
                value: "income"
              },
              {
                label: "Expense",
                value: "expense"
              }
            ]}
          />
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            AMOUNT
          </Text>
          <View style={styles.amountRow}>
            <Text style={styles.rupee}>
              ₹
            </Text>
            <Text style={styles.amount}>
              {Number(amount).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

export default AddTransactionSheet

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  handle: {
    backgroundColor: COLORS.white,
    width: 44,
    height: 5
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 28
  },
  cancel: {
    fontSize: 17,
    color: COLORS.gray,
    fontWeight: "500"
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.navy
  },
  save: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.navy
  },
  switchContainer: {
    marginBottom: 28,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 28
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 1,
    marginBottom: 10
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  rupee: {
    fontSize: 34,
    color: "#7A8090",
    marginRight: 8,
    fontWeight: "600"
  },
  amount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0B1D3A"
  }
})