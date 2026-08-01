import { BottomSheetModal } from "@gorhom/bottom-sheet";

export type AccountSheetMode = "create" | "edit";

export type AccountSheetPayload = {
  mode: AccountSheetMode;
  account?: any;
};

let sheetRef: BottomSheetModal | null = null;
let currentPayload: AccountSheetPayload = { mode: "create" };
const payloadListeners = new Set<(payload: AccountSheetPayload) => void>();
const refreshListeners = new Set<() => void>();

export function registerAccountSheet(ref: BottomSheetModal | null) {
  sheetRef = ref;
}

export function subscribeAccountSheet(listener: (payload: AccountSheetPayload) => void) {
  payloadListeners.add(listener);

  return () => {
    payloadListeners.delete(listener);
  };
}

export function presentAccountSheet(payload: AccountSheetPayload = { mode: "create" }) {
  currentPayload = payload;
  payloadListeners.forEach((listener) => listener(currentPayload));
  sheetRef?.present();
}

export function dismissAccountSheet() {
  sheetRef?.dismiss();
}

export function subscribeAccountRefresh(listener: () => void) {
  refreshListeners.add(listener);

  return () => {
    refreshListeners.delete(listener);
  };
}

export function emitAccountChanged() {
  refreshListeners.forEach((listener) => listener());
}
