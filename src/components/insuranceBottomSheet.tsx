import React, {forwardRef,useCallback,useEffect,useMemo,useRef,useState,} from "react";
import {Alert,Platform,Pressable,StyleSheet,Text,View,} from "react-native";
import {BottomSheetBackdrop,BottomSheetModal,BottomSheetScrollView,BottomSheetTextInput,} from "@gorhom/bottom-sheet";
import DateTimePicker, {DateTimePickerEvent,} from "@react-native-community/datetimepicker";
import {createInsurance,updateInsurance,} from "@/src/db/repository/insurance";
import {dismissInsuranceSheet,emitInsuranceChanged,registerInsuranceSheet,subscribeInsuranceSheet,InsuranceSheetPayload,} from "./insuranceSheetController";

const COLORS = {
  background: "#F7F8FA",
  white: "#FFFFFF",
  navy: "#0B1D3A",
  gray: "#6B7280",
  muted: "#8A93A6",
  border: "#E8ECF2",
};

const InsuranceBottomSheet = forwardRef<BottomSheetModal>(
  (props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["80%"], []);
    const [payload, setPayload] =
      useState<InsuranceSheetPayload>({
        mode: "create",
      });

    const [providerName, setProviderName] = useState("");
    const [policyName, setPolicyName] = useState("");
    const [policyType, setPolicyType] = useState("");
    const [premiumAmount, setPremiumAmount] = useState("");
    const [renewalDate, setRenewalDate] =
      useState<Date>(new Date());
    const [description, setDescription] = useState("");
    const [isDatePickerOpen, setIsDatePickerOpen] =
      useState(false);
    const [editingInsuranceId, setEditingInsuranceId] =
      useState<string | null>(null);

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

    useEffect(() => {
      registerInsuranceSheet(modalRef.current);

      const unsubscribe = subscribeInsuranceSheet(
        (nextPayload) => {
          setPayload(nextPayload);

          if (
            nextPayload.mode === "edit" &&
            nextPayload.insurance
          ) {
            const insurance = nextPayload.insurance;

            setEditingInsuranceId(insurance.id);
            setProviderName(
              insurance.providerName ?? ""
            );
            setPolicyName(
              insurance.policyName ?? ""
            );
            setPolicyType(
              insurance.policyType ?? ""
            );
            setPremiumAmount(
              String(insurance.premiumAmount ?? "")
            );
            setRenewalDate(
              insurance.renewalDate
                ? new Date(insurance.renewalDate)
                : new Date()
            );
            setDescription(
              insurance.description ?? ""
            );
            setIsDatePickerOpen(false);
          } else {
            resetForm();
          }
        }
      );

      return () => {
        unsubscribe();
        registerInsuranceSheet(null);
      };
    }, []);

    function resetForm() {
      setPayload({ mode: "create" });
      setEditingInsuranceId(null);
      setProviderName("");
      setPolicyName("");
      setPolicyType("");
      setPremiumAmount("");
      setRenewalDate(new Date());
      setDescription("");
      setIsDatePickerOpen(false);
    }

    const handleDateChange = (
      event: DateTimePickerEvent,
      selectedDate?: Date
    ) => {
      if (
        event.type === "set" &&
        selectedDate
      ) {
        setRenewalDate(selectedDate);
      }

      if (Platform.OS === "android") {
        setIsDatePickerOpen(false);
      }
    };

    async function handleSave() {
      const trimmedProvider = providerName.trim();
      const trimmedPolicy = policyName.trim();
      const trimmedType = policyType.trim();
      const numericPremium = Number(
        premiumAmount
      );

      if (!trimmedProvider) {
        Alert.alert("Enter provider name");
        return;
      }

      if (!trimmedPolicy) {
        Alert.alert("Enter policy name");
        return;
      }

      if (!trimmedType) {
        Alert.alert("Enter policy type");
        return;
      }

      if (
        !premiumAmount ||
        Number.isNaN(numericPremium) ||
        numericPremium <= 0
      ) {
        Alert.alert("Enter a valid premium amount");
        return;
      }

      try {
        const data = {
          providerName: trimmedProvider,
          policyName: trimmedPolicy,
          policyType: trimmedType,
          premiumAmount: numericPremium,
          renewalDate: renewalDate.getTime(),
          description:
            description.trim() || null,
        };

        if (
          payload.mode === "edit" &&
          editingInsuranceId
        ) {
          await updateInsurance(
            editingInsuranceId,
            data
          );
        } else {
          await createInsurance(data);
        }

        emitInsuranceChanged();
        resetForm();
        dismissInsuranceSheet();
      } catch (error) {
        console.error(
          "Error saving insurance:",
          error
        );

        Alert.alert(
          "Something went wrong",
          "Could not save the policy."
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
            <Pressable
              onPress={dismissInsuranceSheet}
            >
              <Text style={styles.cancel}>
                Cancel
              </Text>
            </Pressable>

            <Text style={styles.title}>
              {payload.mode === "edit"
                ? "Edit Policy"
                : "New Policy"}
            </Text>

            <Pressable onPress={handleSave}>
              <Text style={styles.save}>
                {payload.mode === "edit"
                  ? "Update"
                  : "Save"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              PROVIDER
            </Text>

            <BottomSheetTextInput
              value={providerName}
              onChangeText={setProviderName}
              placeholder="e.g. HDFC Life"
              placeholderTextColor="#A1A8B5"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              POLICY NAME
            </Text>

            <BottomSheetTextInput
              value={policyName}
              onChangeText={setPolicyName}
              placeholder="e.g. Life Insurance"
              placeholderTextColor="#A1A8B5"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              POLICY TYPE
            </Text>

            <View style={styles.typeRow}>
              {[
                "Life",
                "Health",
                "Car",
                "Bike",
                "Home",
                "Other",
              ].map((type) => {
                const selected =
                  policyType === type;

                return (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeChip,
                      selected &&
                        styles.selectedTypeChip,
                    ]}
                    onPress={() =>
                      setPolicyType(type)
                    }
                  >
                    <Text
                      style={[
                        styles.typeText,
                        selected &&
                          styles.selectedTypeText,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              PREMIUM
            </Text>

            <BottomSheetTextInput
              value={premiumAmount}
              onChangeText={(text) =>
                setPremiumAmount(
                  text.replace(/\D/g, "")
                )
              }
              keyboardType="numeric"
              placeholder="₹ 0"
              placeholderTextColor="#C5CAD3"
              style={styles.amountInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              RENEWAL DATE
            </Text>

            <Pressable
              style={styles.dateButton}
              onPress={() =>
                setIsDatePickerOpen(true)
              }
            >
              <Text style={styles.dateText}>
                {renewalDate.toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </Text>
            </Pressable>

            {isDatePickerOpen && (
              <DateTimePicker
                value={renewalDate}
                mode="date"
                display={
                  Platform.OS === "ios"
                    ? "spinner"
                    : "default"
                }
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              NOTES
            </Text>

            <BottomSheetTextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional notes"
              placeholderTextColor="#A1A8B5"
              multiline
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {payload.mode === "edit"
                ? "Update Policy"
                : "Save Policy"}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

InsuranceBottomSheet.displayName =
  "InsuranceBottomSheet";

export default InsuranceBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  handle: {
    backgroundColor: COLORS.white,
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
    marginBottom: 28,
  },

  cancel: {
    fontSize: 17,
    color: COLORS.gray,
    fontWeight: "500",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.navy,
  },

  save: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.navy,
  },

  section: {
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 10,
  },

  input: {
    height: 52,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.navy,
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 9,
    marginBottom: 9,
  },

  selectedTypeChip: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },

  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },

  selectedTypeText: {
    color: COLORS.white,
  },

  amountInput: {
    height: 58,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.navy,
  },

  dateButton: {
    height: 52,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  dateText: {
    fontSize: 15,
    color: COLORS.navy,
  },

  notesInput: {
    minHeight: 90,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.navy,
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
});
//