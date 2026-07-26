import { BottomSheetModal } from "@gorhom/bottom-sheet";

export type TransactionSheetMode = "create" | "edit";

export type TransactionSheetPayload = {
  mode: TransactionSheetMode;
  transaction?: any;
};

let sheetRef: BottomSheetModal | null = null;
let currentPayload: TransactionSheetPayload = { mode: "create" };
const payloadListeners = new Set<(payload: TransactionSheetPayload) => void>();
const refreshListeners = new Set<() => void>();

export function registerTransactionSheet(ref: BottomSheetModal | null) {
  sheetRef = ref;
}

export function subscribeTransactionSheet(listener: (payload: TransactionSheetPayload) => void) {
  payloadListeners.add(listener);
  return () => {
    payloadListeners.delete(listener);
  };
}

export function presentTransactionSheet(payload: TransactionSheetPayload = { mode: "create" }) {
  currentPayload = payload;
  payloadListeners.forEach((listener) => listener(currentPayload));
  sheetRef?.present();
}

export function dismissTransactionSheet() {
  sheetRef?.dismiss();
}

export function subscribeTransactionRefresh(listener: () => void) {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

export function emitTransactionChanged() {
  refreshListeners.forEach((listener) => listener());
}
