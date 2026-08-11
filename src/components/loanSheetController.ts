import { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { Loan } from "@/src/db/repository/loan";

export type LoanSheetPayload = { mode: "create" | "edit"; loan?: Loan };
let sheetRef: BottomSheetModal | null = null;
const payloadListeners = new Set<(payload: LoanSheetPayload) => void>();
const refreshListeners = new Set<() => void>();
export function registerLoanSheet(ref: BottomSheetModal | null) { sheetRef = ref; }
export function subscribeLoanSheet(listener: (payload: LoanSheetPayload) => void) { payloadListeners.add(listener); return () => { payloadListeners.delete(listener); }; }
export function presentLoanSheet(payload: LoanSheetPayload = { mode: "create" }) { payloadListeners.forEach((listener) => listener(payload)); sheetRef?.present(); }
export function dismissLoanSheet() { sheetRef?.dismiss(); }
export function subscribeLoanRefresh(listener: () => void) { refreshListeners.add(listener); return () => { refreshListeners.delete(listener); }; }
export function emitLoanChanged() { refreshListeners.forEach((listener) => listener()); }
