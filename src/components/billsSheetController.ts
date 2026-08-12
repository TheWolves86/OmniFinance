import { BottomSheetModal } from "@gorhom/bottom-sheet"

export type BillsSheetMode = "create" | "edit"

export type BillsSheetPayload = {
    mode: BillsSheetMode;
    bill?: any
}

let sheetRef: BottomSheetModal | null = null

const payloadListeners = new Set<
    (payload: BillsSheetPayload) => void
>()

const refreshListeners = new Set<() => void>()

export function registerBillsSheet(ref: BottomSheetModal | null){
    sheetRef = ref
}

export function subscribeBillsSheet(
    listener: (payload: BillsSheetPayload) => void
){
    payloadListeners.add(listener)

    return () => {
        payloadListeners.delete(listener)
    }
}

export function presentBillsSheet(
    payload: BillsSheetPayload = { mode: "create" }
){
    payloadListeners.forEach(listener => listener(payload));
    sheetRef?.present();
}

export function dismissBillsSheet(){
    sheetRef?.dismiss()
}

export function subscribeBillsRefresh(listener: () => void){
    refreshListeners.add(listener)

    return () => {
        refreshListeners.delete(listener)
    }
}

export function emitBillChanged(){
    refreshListeners.forEach
}