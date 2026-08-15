import { BottomSheetModal } from '@gorhom/bottom-sheet';

export type BudgetSheetMode = "create" | "edit"

export type budgetSheetPayload = {
    mode: BudgetSheetMode,
    budget?: any
}

let sheetRef: BottomSheetModal | null = null;

const payloadListeners = new Set<
    (payload: budgetSheetPayload) => void
>();

const refreshListeners = new Set<() => void>()

export function registerBudgetsSheet(
    ref: BottomSheetModal | null
) {
    sheetRef = ref
}

export function subscribeBudgetsSheet(
    listener: (payload: budgetSheetPayload) => void
){
    payloadListeners.add(listener)

    return () => {
        payloadListeners.delete(listener)
    }
}

export function presentBudgetsSheet(
    payload: budgetSheetPayload = { mode: "create" }
) {
    payloadListeners.forEach((listener) => listener(payload))
    sheetRef?.present()
}

export function dismissBudgetsSheet(){
    sheetRef?.dismiss()
}

export function subscribeBudgetRefresh(
    listener: () => void
){
    refreshListeners.add(listener)

    return () => {
        refreshListeners.delete(listener)
    }
}

export function emitBudgetChanged(){
    refreshListeners.forEach((listener) => listener())
}