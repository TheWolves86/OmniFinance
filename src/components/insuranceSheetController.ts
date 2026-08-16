import { BottomSheetModal } from "@gorhom/bottom-sheet";

export type InsuranceSheetMode = "create" | "edit";

export type InsuranceSheetPayload = {
    mode: InsuranceSheetMode;
    insurance?: any
}

let sheetRef: BottomSheetModal | null = null;

const payloadListeners = new Set<
    (payload: InsuranceSheetPayload) => void
>()

const refreshListeners = new Set<() => void>()


export function registerInsuranceSheet(
    ref: BottomSheetModal | null
){
    sheetRef = ref
}

export function subscribeInsuranceSheet(
    listener: (payload: InsuranceSheetPayload) => void
){
    payloadListeners.add(listener)

    return () => {
        payloadListeners.delete(listener)
    }
}

export function presentInsuranceSheet(
    payload: InsuranceSheetPayload = { mode: "create" }
){
    payloadListeners.forEach((listener) => {
        listener(payload)
    })

    sheetRef?.present()
}

export function dismissInsuranceSheet(){
    sheetRef?.dismiss()
}

export function subscribeInsuranceRefresh(
    listener: () => void
) {
    refreshListeners.add(listener)

    return () => {
        refreshListeners.delete(listener)
    }
}

export function emitInsuranceChanged(){
    refreshListeners.forEach((listener) => {
        listener()
    })
}