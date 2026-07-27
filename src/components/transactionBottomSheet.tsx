import React, { forwardRef, useMemo, useCallback, useState, useRef, useEffect} from "react";
import {BottomSheetBackdrop,BottomSheetModal,BottomSheetScrollView, BottomSheetTextInput} from "@gorhom/bottom-sheet";
import { LayoutAnimation, Platform, UIManager, View, Text, Pressable, StyleSheet, FlatList } from "react-native"
import SwitchSelector from "react-native-switch-selector"
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addTransaction, editTransactionService } from "@/src/services/transactionService";
import { getAllAccounts } from "@/src/db/repository/account";
import { getExpenseCategories, getIncomeCategory } from "@/src/db/repository/category";
import { subscribeTransactionSheet, dismissTransactionSheet, emitTransactionChanged, registerTransactionSheet, TransactionSheetPayload } from "@/src/components/transactionSheetController";

type Account = {
  id: string;
  name: string
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

const COLORS = {
  background: "#F7F8FA",
  white: "#FFFFFF",
  navy: "#0B1D3A",
  gray: "#6B7280",
  border: "#E8ECF2"
};

const AddTransactionSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const snapPoints = useMemo(() => ["95%"], [])
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

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
  const [ amount, setAmount ] = useState("")
  const titleInputRef = useRef<React.ElementRef<typeof BottomSheetTextInput>>(null)
  const amountInputRef = useRef<React.ElementRef<typeof BottomSheetTextInput>>(null)
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const modalRef = useRef<BottomSheetModal>(null);
  

  useEffect(() => {
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  useEffect(() => {
    registerTransactionSheet(modalRef.current);
    return () => registerTransactionSheet(null);
  }, []);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [transactionType]);

  useEffect(() => {
    const unsubscribe = subscribeTransactionSheet((payload: TransactionSheetPayload) => {
      if (payload.mode === "edit" && payload.transaction) {
        const transactionTypeValue = payload.transaction.type === "income" ? "income" : "expense";
        setSheetMode("edit");
        setEditingTransactionId(payload.transaction.id);
        setTitle(payload.transaction.title || "");
        setAmount(String(payload.transaction.amount ?? ""));
        setTransactionType(transactionTypeValue);
        setSelectedCategory("");
        setSelectedAccount("");
        setNotes(payload.transaction.note || "");
        setTransactionDate(new Date(payload.transaction.transactionDate ?? Date.now()));
        setIsDatePickerOpen(false);
        setIsNotesExpanded(Boolean(payload.transaction.note));
        void loadAccounts(payload.transaction.accountId);
        void loadCategories(false, transactionTypeValue, payload.transaction.categoryId);
      } else {
        setSheetMode("create");
        setEditingTransactionId(null);
        resetForm();
      }
    });

    return unsubscribe;
  }, []);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setIsDatePickerOpen(false);
    }

    if (event.type === "set" && selectedDate) {
      setTransactionDate(selectedDate);
    }
  };

  const toggleNotes = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsNotesExpanded((current) => !current);
  };

  async function loadAccounts(preselectedId?: string){
    const data = await getAllAccounts();
    setAccounts(data);
    const matchedAccount = preselectedId && data.some((account: any) => account.id === preselectedId)
      ? preselectedId
      : data.length > 0 ? data[0].id : "";
    setSelectedAccount(matchedAccount);
  }

  async function loadCategories(selectFirst = true, type: "income" | "expense" = transactionType, preselectedId?: string){
    const data = type === "income" ? await getIncomeCategory() : await getExpenseCategories();
    setCategories(data);
    const matchedCategory = preselectedId && data.some((category: any) => category.id === preselectedId)
      ? preselectedId
      : data.length > 0 ? data[0].id : "";

    if (selectFirst || preselectedId) {
      setSelectedCategory(matchedCategory);
    } else {
      setSelectedCategory("");
    }
  }

  const resetForm = () => {
    setSheetMode("create");
    setEditingTransactionId(null);
    setTransactionType("expense");
    setTitle("");
    setAmount("");
    setSelectedCategory("");
    setSelectedAccount("");
    setTransactionDate(new Date());
    setNotes("");
    setIsDatePickerOpen(false);
    setIsNotesExpanded(false);
    void loadAccounts();
    void loadCategories(false, "expense");
  };

  const handleTypeChange = (value: "income" | "expense") => {
    setTransactionType(value);
    setSelectedCategory("");
    void loadCategories(false, value);
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle) {
      alert("Please enter a transaction title")
      return;
    }
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount")
      return;
    }
    if (!selectedAccount){
      alert("Select an account")
      return;
    }
    if (!selectedCategory){
      alert("Select a category")
      return;
    }

    try {
      if (sheetMode === "edit" && editingTransactionId) {
        await editTransactionService(editingTransactionId, {
          title: trimmedTitle,
          amount: numericAmount,
          type: transactionType,
          categoryId: selectedCategory,
          accountId: selectedAccount,
          note: notes,
          transactionDate: transactionDate.getTime()
        });
      } else {
        await addTransaction({
          title: trimmedTitle,
          amount: numericAmount,
          type: transactionType,
          categoryId: selectedCategory,
          accountId: selectedAccount,
          note: notes,
          transactionDate: transactionDate.getTime()
        });
      }

      emitTransactionChanged();
      resetForm();
      dismissTransactionSheet();
    } catch (error) {
      console.error(error)
    }
  }
  const formattedDate = transactionDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackDrop}
      enablePanDownToClose
      onDismiss={resetForm}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => (ref as React.RefObject<BottomSheetModal>).current?.dismiss()}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>

          <Text style={styles.title}>
            {sheetMode === "edit" ? "Edit Transaction" : "New Transaction"}
          </Text>

          <Pressable onPress={handleSave}>
            <Text style={styles.save}>{sheetMode === "edit" ? "Update" : "Save"}</Text>
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
            onPress={(value: any) => handleTypeChange(value as "expense" | "income")}
            options={[
              {
                label: "Income",
                value: "income"
              },
              {
                label: "Expense",
                value: "expense"
              }
            ]}/>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.amountLabel}>
            TITLE
          </Text>
          <BottomSheetTextInput
            ref={titleInputRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Transaction title"
            placeholderTextColor="#A1A8B5"
            cursorColor="#0B1D3A"
            style={styles.titleInput}
          />
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            AMOUNT
          </Text>
          <Pressable style={styles.amountRow} onPress={() => amountInputRef.current?.focus()}>
            <Text style={styles.rupee}>
              ₹
            </Text>
            <BottomSheetTextInput
              ref={amountInputRef}
              value={
                amount === "" ? "" : Number(amount).toLocaleString("en-IN")
              }
              onChangeText={(text) => {
                const clean = text.replace(/\D/g, "");
                setAmount(clean);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#C5CAD3"
              cursorColor="#0B1D3A"
              style={styles.amountInput}
            ></BottomSheetTextInput>
          </Pressable>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Category
          </Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => {
              const selected = selectedCategory === item.id;
              return (
                <Pressable onPress={() => setSelectedCategory(item.id)} style={[styles.categoryCard, selected && styles.selectedCtaegoryCard]}>
                  <View style={[styles.iconContainer, selected && styles.selectedIconContainer]}>
                    <Ionicons name={item.icon as any} size={20} color={selected ? "#FFFFFF" : "#606A7B"}/>
                  </View>
                  <Text numberOfLines={1} style={[styles.categoryText, selected && styles.selectedCategoryText]}>
                    {item.name}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Accounts
          </Text>
          <FlatList
            data={accounts}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountContainer}
            keyExtractor={(item) => item.id}
            renderItem={({ item: account }) => {
              const selected = selectedAccount === account.id;
              return (
                <Pressable onPress={() => setSelectedAccount(account.id)} style={[styles.accountChip, selected && styles.selectedAccountChip]}>
                  <Text style={[styles.accountText, selected && styles.selectedAccountText]}>
                    {account.name}
                  </Text>
                </Pressable>
              )
            }}
          />
        </View>
        <View style={styles.section}>
          <Pressable style={styles.detailRow} onPress={() => setIsDatePickerOpen(true)}>
            <View style={styles.leftSection}>
              <Ionicons name="calendar-outline" size={18} color="#6B7280"/>
              <Text style={styles.detailTitle}>
                Date
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.detailValue}>
                {formattedDate}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF"/>
            </View>
          </Pressable>
          {isDatePickerOpen && (
            <DateTimePicker
              value={transactionDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
          <View style={styles.divider}/>
          <Pressable style={styles.detailRow} onPress={toggleNotes}>
            <View style={styles.leftSection}>
              <Ionicons name="document-text-outline" size={18} color="#6b7280"/>
              <Text style={styles.detailTitle}>
                Notes
              </Text>
            </View>
            {!isNotesExpanded && (
              <View style={styles.rightSection}>
                <Text numberOfLines={1} style={[styles.detailValue, notes === "" && styles.placeholder]}>{notes || "Optional"}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF"/>
              </View>
            )}
          </Pressable>
          {isNotesExpanded && (
            <View style={styles.notesInputContainer}>
              <BottomSheetTextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Write a note..."
                placeholderTextColor="#A1A8B5"
                multiline
                textAlignVertical="top"
                blurOnSubmit={false}
                returnKeyType="default"
                style={styles.notesInput}
              />
            </View>
          )}
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
  titleContainer: {
    marginBottom: 24,
    width: "100%"
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
  titleInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.navy
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
  amountInput: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0B1D3A",
    padding: 0,
    margin: 0,
    minWidth: 150,
  },
  categoryCard: {
    width: 74,
    alignItems: "center",
    marginRight: 14,
  },
  selectedCtaegoryCard: {
    
  },
  categoryText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500"
  },
  selectedCategoryText: {
    color: "#0B1D3A",
    fontWeight: "600"
  },
  section: {
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#8A93A6",
    marginBottom: 12
  },
  categoryContainer: {
    paddingRight: 18
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#eef0f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF2",
  },
  selectedIconContainer: {
    backgroundColor: "#0B1D3A",
    borderColor: "#0B1D3A",
    borderRadius: 14
  },
  accountContainer:{
    paddingRight: 20
  },
  accountChip: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    backgroundColor: "#eef0f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    marginRight: 10
  },
  selectedAccountChip: {
    backgroundColor: "#0B1D3A",
    borderColor: "#0B1D3A"
  },
  accountText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  selectedAccountText: {
    color: "#FFFFFF"
  },
  detailRow: {
    height: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center"
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center"
  },
  detailTitle: {
    marginLeft: 12,
    fontSize: 16,
    color: "#0B1D3A",
  },
  detailValue: {
    fontSize: 15,
    color: "#4B5563",
    marginRight: 8,
  },
  placeholder: {
    color: "#A1A8B5",
  },
  notesInputContainer: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  notesInput: {
    minHeight: 90,
    fontSize: 15,
    color: "#0B1D3A",
    padding: 0,
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEF2",
  },
});
//
