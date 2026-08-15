import React, {
  forwardRef,
  useCallback,
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

import {
  getExpenseCategories,
} from "@/src/db/repository/category";

import {
  createBudget,
  updateBudget,
} from "@/src/db/repository/budget";

import {
  dismissBudgetsSheet,
  emitBudgetChanged,
  registerBudgetsSheet,
  subscribeBudgetsSheet,
  budgetSheetPayload,
} from "./budgetSheetController";

type Category = {
  id: string;
  name: string;
  icon?: string;
};

const BudgetsBottomSheet = forwardRef<BottomSheetModal>(
  (props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);

    const snapPoints = useMemo(() => ["70%"], []);

    const [payload, setPayload] =
      useState<budgetSheetPayload>({
        mode: "create",
      });

    const [categories, setCategories] =
      useState<Category[]>([]);

    const [selectedCategory, setSelectedCategory] =
      useState("");

    const [amount, setAmount] = useState("");

    const getCurrentMonth = () => {
      const date = new Date();

      return `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    };

    const resetForm = () => {
      setPayload({ mode: "create" });
      setSelectedCategory("");
      setAmount("");
    };

    useEffect(() => {
      registerBudgetsSheet(modalRef.current);

      return () => {
        registerBudgetsSheet(null);
      };
    }, []);

    useEffect(() => {
      const unsubscribe = subscribeBudgetsSheet(
        async (nextPayload) => {
          setPayload(nextPayload);

          try {
            const data = await getExpenseCategories();
            setCategories(data ?? []);
          } catch (error) {
            console.error(
              "Error loading budget categories:",
              error
            );
          }

          if (
            nextPayload.mode === "edit" &&
            nextPayload.budget
          ) {
            setSelectedCategory(
              nextPayload.budget.categoryId ?? ""
            );

            setAmount(
              String(nextPayload.budget.amount ?? "")
            );
          } else {
            resetForm();
          }
        }
      );

      return unsubscribe;
    }, []);

    const renderBackdrop = useCallback(
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

    async function handleSave() {
      const numericAmount = Number(amount);

      if (!selectedCategory) {
        Alert.alert("Select a category");
        return;
      }

      if (
        !amount ||
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
      ) {
        Alert.alert("Enter a valid budget amount");
        return;
      }

      try {
        const currentMonth = getCurrentMonth();

        if (
          payload.mode === "edit" &&
          payload.budget?.id
        ) {
          await updateBudget(payload.budget.id, {
            categoryId: selectedCategory,
            amount: numericAmount,
            month:
              payload.budget.month ?? currentMonth,
          });
        } else {
          await createBudget({
            categoryId: selectedCategory,
            amount: numericAmount,
            month: currentMonth,
          });
        }

        emitBudgetChanged();
        resetForm();
        dismissBudgetsSheet();
      } catch (error) {
        console.error("Error saving budget:", error);

        Alert.alert(
          "Could not save budget",
          "A budget for this category may already exist this month."
        );
      }
    }

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
            <Pressable onPress={dismissBudgetsSheet}>
              <Text style={styles.cancel}>
                Cancel
              </Text>
            </Pressable>

            <Text style={styles.title}>
              {payload.mode === "edit"
                ? "Edit Budget"
                : "New Budget"}
            </Text>

            <Pressable onPress={handleSave}>
              <Text style={styles.save}>
                {payload.mode === "edit"
                  ? "Update"
                  : "Save"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            CATEGORY
          </Text>

          <View style={styles.categoryContainer}>
            {categories.map((category) => {
              const selected =
                selectedCategory === category.id;

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    setSelectedCategory(category.id)
                  }
                  style={[
                    styles.categoryChip,
                    selected &&
                      styles.selectedCategoryChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              MONTHLY LIMIT
            </Text>

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

          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {payload.mode === "edit"
                ? "Update Budget"
                : "Save Budget"}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

BudgetsBottomSheet.displayName =
  "BudgetsBottomSheet";

export default BudgetsBottomSheet;

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
    fontWeight: "500",
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
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A93A6",
    letterSpacing: 1,
    marginBottom: 10,
  },

  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    marginRight: 10,
    marginBottom: 10,
  },

  selectedCategoryChip: {
    backgroundColor: "#0B1D3A",
    borderColor: "#0B1D3A",
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },

  amountInput: {
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1D3A",
  },

  saveButton: {
    marginTop: 32,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#0B1D3A",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
