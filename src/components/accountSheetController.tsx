import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { Account } from "@/src/types/models";

export type AccountSheetMode = "create" | "edit";

export type AccountSheetPayload = {
  mode: AccountSheetMode;
  account?: Account;
};

//keep track of the account bottom sheet
let sheetRef: BottomSheetModal | null = null;
//store the latest data passed to the sheet
let currentPayload: AccountSheetPayload = { mode: "create" };
//screens listening for create/edit requests
const payloadListeners = new Set<(payload: AccountSheetPayload) => void>();
//screens listening for account updates
const refreshListeners = new Set<() => void>();

//register the bottom sheet so it can be opened from anywhere
export function registerAccountSheet(ref: BottomSheetModal | null) {
  sheetRef = ref;
}

//listen for data sent to the bottom sheet
export function subscribeAccountSheet(listener: (payload: AccountSheetPayload) => void) {
  payloadListeners.add(listener);

  return () => {
    payloadListeners.delete(listener);
  };
}

//open the sheet with create or edit data
export function presentAccountSheet(payload: AccountSheetPayload = { mode: "create" }) {
  currentPayload = payload;
  payloadListeners.forEach((listener) => listener(currentPayload));
  sheetRef?.present();
}

//close the account bottom sheet
export function dismissAccountSheet() {
  sheetRef?.dismiss();
}

//listen for changes after an account is saved
export function subscribeAccountRefresh(listener: () => void) {
  refreshListeners.add(listener);

  return () => {
    refreshListeners.delete(listener);
  };
}

//tell all screen to refresh their account list
export function emitAccountChanged() {
  refreshListeners.forEach((listener) => listener());
}
