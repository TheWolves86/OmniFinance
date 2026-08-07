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
            console.error(error)
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

        </BottomSheetModal>
    )
})

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
    
})