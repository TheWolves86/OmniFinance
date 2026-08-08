import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { dismissGoalSheet, emitGoalChanged, registerGoalSheet, subscribeGoalSheet, GoalSheetPayload } from "@/src/components/goalSheetController"
import { createGoal, updateGoal } from "@/src/db/repository/goal"

const COLORS = {
    background: "#ffffff",
    white: "#ffffff",
    navy: "#0B1D3A",
    gray: "#6B7280",
    muted: "#9A93A6",
    border: "#E8ECF2"
}

const addGoalSheet = forwardRef<BottomSheetModal>((props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null)

    const snapPoints = useMemo(() => ["%80"], [])

    const [sheetMode, setSheetMode] = useState<"create" | "edit">("create")
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [targetAmount, setTargetAmount] = useState("") 
    const [targetDate, setTargetDate] = useState<Date | null>(null)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

    const renderBackdrop = useCallback(
        (backdropProps: any) => (
            <BottomSheetBackdrop 
                {...backdropProps}
                appearsOnIndex={0}
                disappearOnIndex={1}
                opacity={0.35}
                pressBehavior="close"
            />
        ),
        []
    );

    useEffect(() => {
        registerGoalSheet(modalRef.current)

        return () => {
            registerGoalSheet(null)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = subscribeGoalSheet(
            (payload: GoalSheetPayload) => {
                if (payload.mode === "edit" && payload.goal){
                    const goal = payload.goal as any

                    setSheetMode("edit")
                    setEditingGoalId(String(goal.id))

                    setTitle(goal.title ?? "")
                    setDescription(goal.description ?? "")
                    setTargetAmount(String(goal.targetAmount ?? ""))

                    setTargetDate(
                        goal.targetDate ? new Date(goal.targetDate) : null
                    )
                    setIsDatePickerOpen(false)
                } else {
                    resetForm()
                }
            }
        )
        return unsubscribe
    }, [])

    const resetForm = () => {
        setSheetMode("create")
        setEditingGoalId(null)
        setTitle("")
        setDescription("")
        setTargetAmount("")
        setTargetDate(null)
        setIsDatePickerOpen(false)
    };

    const handleDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        if (Platform.OS === "android") {
            setIsDatePickerOpen(false)
        }
        if (event.type === "set" && selectedDate) {
            setTargetDate(selectedDate)
        }
    }

    const handleSave = async () => {
        const trimmedTitle = title.trim()
        const numericTarget = Number(targetAmount)

        if (!trimmedTitle){
            Alert.alert("Please enter a goal name")
            return
        }
        if (!targetAmount || Number.isNaN(numericTarget) || numericTarget <= 0){
            Alert.alert("Please enter a valid target amount")
        }

        try {
            if ( sheetMode === "edit" && editingGoalId) {
                const existingGoal = await import("@/src/db/repository/goal").then(
                    (module) => module.getGoalById(editingGoalId)
                );

                if (!existingGoal){
                    Alert.alert("Goal not found")
                    return
                }

                await updateGoal(editingGoalId, {
                    title: trimmedTitle,
                    description: description.trim() || undefined,
                    targetAmount: numericTarget,
                    savedAmount: existingGoal.savedAmount,
                    targetDate: targetDate?.getTime(),
                    isCompleted: existingGoal.isCompleted
                });
            } else {
                await createGoal({
                    title: trimmedTitle,
                    description: description.trim() || undefined,
                    targetAmount: numericTarget,
                    savedAmount: 0,
                    targetDate: targetDate?.getTime(),
                    isCompleted: false
                })
            }

            emitGoalChanged()
            resetForm()
            dismissGoalSheet()
        } catch (error) {
            console.error("Error saving goal:", error)
            Alert.alert("Something went wrong", "Could not save the goal")
        }
    };

    const formattedDate = targetDate ? targetDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }) : "Optional";

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
            <BottomSheetScrollView>
                <View style={styles.header}>
                    <Pressable onPress={() => modalRef.current?.dismiss()}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>
                        {sheetMode === "edit" ? "Edit Goal": "New Goal"}
                    </Text>
                    <Pressable onPress={handleSave}>
                        <Text style={styles.save}>
                            {sheetMode === "edit" ? "Update": "Save"}
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Goal Name</Text>
                    <BottomSheetTextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. New Laptop"
                        placeholderTextColor="#A1A8B5"
                        cursorColor={COLORS.navy}
                        style={styles.input}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Target Amount</Text>
                    <View style={styles.amountRow}>
                        <Text style={styles.rupee}>₹</Text>
                        <BottomSheetTextInput 
                            value={targetAmount === "" ? "" : Number(targetAmount).toLocaleString("en-IN")}
                            onChangeText={(text) => {
                                const clean = text.replace(/\D/g, "")
                                setTargetAmount(clean)
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#C5CAD3"
                            cursorColor={COLORS.navy}
                            style={styles.amountInput}
                        />
                    </View>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Description</Text>
                    <BottomSheetTextInput 
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What are you saving for?"
                        placeholderTextColor="#A1A8A5"
                        cursorColor={COLORS.navy}
                        multiline={true}
                        textAlignVertical="top"
                        style={styles.descriptionInput}
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Target Date</Text>
                    <Pressable style={styles.dateRow} onPress={() => setIsDatePickerOpen(true)}>
                        <View style={styles.dateLeft}>
                            <View style={styles.iconBox}>
                                <Text style={styles.calenderIcon}>📅</Text>
                            </View>
                            <View>
                                <Text style={styles.dateTitle}>Target Date</Text>
                                <Text style={styles.dateValue}>{formattedDate}</Text>
                            </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    {isDatePickerOpen && (
                        <DateTimePicker 
                            value={targetDate ?? new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleDateChange}
                        />
                    )}
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    )
})

addGoalSheet.displayName = "AddGoalSheet"

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
        marginBottom: 30
    },
    cancel: {
        fontSize: 17,
        color: COLORS.gray,
        fontWeight: "500"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.navy
    },
    save: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.navy
    },
    field: {
        marginBottom: 26
    },
    label: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.muted,
        letterSpacing: 1,
        marginBottom: 10
    },
    input: {
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
        alignItems: "center",
        justifyContent: "center"
    },
    rupee: {
        fontSize: 34,
        color: "#7A8090",
        marginRight: 8,
        fontWeight: "600"
    },
    amountInput: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.navy,
        padding: 0,
        margin: 0,
        minWidth: 150
    },
    descriptionInput: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 90,
        fontSize: 15,
        color: COLORS.navy
    },
    section: {
        marginTop: 2
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.muted,
        letterSpacing: 1,
        marginBottom: 10
    },
    dateRow: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    dateLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#F1F3F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12
    },
    calenderIcon: {
        fontSize: 19
    },
    dateTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.navy
    },
    dateValue: {
        marginTop: 3,
        fontSize: 13,
        color: COLORS.gray
    },
    chevron: {
        fontSize: 28,
        color: "#9CA3AF",
        fontWeight: "300"
    }
})