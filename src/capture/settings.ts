import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

const KEY = "omnifinance.capture.enabled";
export async function isCaptureEnabled() { return (await AsyncStorage.getItem(KEY)) !== "false"; }
export async function setCaptureEnabled(enabled: boolean) { await AsyncStorage.setItem(KEY, String(enabled)); if (Platform.OS === "android" && NativeModules.OmniFinanceCapture?.setCaptureEnabled) await NativeModules.OmniFinanceCapture.setCaptureEnabled(enabled); }
