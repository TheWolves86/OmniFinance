import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { Transaction } from "@/src/types/models";

export type TransactionSheetMode = "create" | "edit";

//data passed whenever the transaction sheet opens
export type TransactionSheetPayload = {
  mode: TransactionSheetMode;
  transaction?: Transaction;
};

//stores a reference to the transaction bottom sheet
let sheetRef: BottomSheetModal | null = null;
let currentPayload: TransactionSheetPayload = { mode: "create" };
//components listening for sheet data changes
const payloadListeners = new Set<(payload: TransactionSheetPayload) => void>();
//components listening for transaction updates
const refreshListeners = new Set<() => void>();

//save the bottom sheet reference
export function registerTransactionSheet(ref: BottomSheetModal | null) {
  sheetRef = ref;
}

//listen for new data whenever the sheet is opened
export function subscribeTransactionSheet(listener: (payload: TransactionSheetPayload) => void) {
  payloadListeners.add(listener);
  return () => {
    payloadListeners.delete(listener);
  };
}

//update the sheet data
export function presentTransactionSheet(payload: TransactionSheetPayload = { mode: "create" }) {
  currentPayload = payload;
  payloadListeners.forEach((listener) => listener(currentPayload));
  sheetRef?.present();
}

//close the transaction bottom sheet
export function dismissTransactionSheet() {
  sheetRef?.dismiss();
}

//listen for transaction changes so screen can refresh
export function subscribeTransactionRefresh(listener: () => void) {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

//notify ever listener that transaction data has changed
export function emitTransactionChanged() {
  refreshListeners.forEach((listener) => listener());
}
