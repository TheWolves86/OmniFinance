import { BottomSheetModal } from "@gorhom/bottom-sheet";

type Goal = Record<string, unknown>;

export type GoalSheetMode = "create" | "edit";

export type GoalSheetPayload = {
  mode: GoalSheetMode;
  goal?: Goal;
};

// keep track of the goal bottom sheet
let sheetRef: BottomSheetModal | null = null;

// store the latest data passed to the sheet
let currentPayload: GoalSheetPayload = { mode: "create" };

// screens listening for create/edit requests
const payloadListeners = new Set<(payload: GoalSheetPayload) => void>();

// screens listening for goal updates
const refreshListeners = new Set<() => void>();

// register the bottom sheet so it can be opened from anywhere
export function registerGoalSheet(ref: BottomSheetModal | null) {
  sheetRef = ref;
}

// listen for data sent to the bottom sheet
export function subscribeGoalSheet(
  listener: (payload: GoalSheetPayload) => void
) {
  payloadListeners.add(listener);

  return () => {
    payloadListeners.delete(listener);
  };
}

// open the sheet with create or edit data
export function presentGoalSheet(
  payload: GoalSheetPayload = { mode: "create" }
) {
  currentPayload = payload;
  payloadListeners.forEach((listener) => listener(currentPayload));
  sheetRef?.present();
}

// close the goal bottom sheet
export function dismissGoalSheet() {
  sheetRef?.dismiss();
}

// listen for changes after a goal is saved
export function subscribeGoalRefresh(listener: () => void) {
  refreshListeners.add(listener);

  return () => {
    refreshListeners.delete(listener);
  };
}

// tell all screens to refresh their goal list
export function emitGoalChanged() {
  refreshListeners.forEach((listener) => listener());
}
//