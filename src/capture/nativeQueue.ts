import { NativeModules, Platform } from "react-native";
import { captureNotification } from "./pipeline";
import { isCaptureEnabled } from "./settings";

export async function drainNativeCaptureQueue() {
  if (Platform.OS !== "android" || !NativeModules.OmniFinanceCapture?.drainPending) return;
  if (!(await isCaptureEnabled())) return;
  const items = await NativeModules.OmniFinanceCapture.drainPending();
  for (const item of items ?? []) await captureNotification(item);
  if (NativeModules.OmniFinanceCapture.clearPending) await NativeModules.OmniFinanceCapture.clearPending();
}
