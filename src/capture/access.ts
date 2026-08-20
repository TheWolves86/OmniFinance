import { NativeModules, Platform } from "react-native";

export async function isAndroidNotificationAccessEnabled() {
  if (Platform.OS !== "android" || !NativeModules.OmniFinanceCapture?.isNotificationAccessEnabled) return false;
  return Boolean(await NativeModules.OmniFinanceCapture.isNotificationAccessEnabled());
}
