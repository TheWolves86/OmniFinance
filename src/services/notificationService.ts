import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { createNotification, hasNotificationDedupe } from "@/src/db/repository/notification";
import { getItem, saveItem } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/constants/storageKeys";

let configured = false;
export async function configureNotifications() {
  if (configured) return;
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("omnifinance", { name: "OmniFinance", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 250, 250, 250] });
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: true }) });
  configured = true;
}
export async function requestNotificationPermission() {
  await configureNotifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  if (await getItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_ASKED) === "true") return false;
  if (!current.canAskAgain) return false;
  await saveItem(STORAGE_KEYS.NOTIFICATION_PERMISSION_ASKED, "true");
  return (await Notifications.requestPermissionsAsync()).status === "granted";
}
export async function publishNotification(data: Parameters<typeof createNotification>[0], options?: { notify?: boolean; date?: Date }) {
  const preferenceText = await getItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
  try { if (preferenceText && JSON.parse(preferenceText)[data.category] === false) return; } catch { /* malformed preferences use defaults */ }
  if (data.dedupeKey && await hasNotificationDedupe(data.dedupeKey)) return;
  await createNotification(data);
  if (!options?.notify || !(await requestNotificationPermission())) return;
  await Notifications.scheduleNotificationAsync({ content: { title: data.title, body: data.description, data: { route: data.actionRoute, params: data.actionParams }, ...(Platform.OS === "android" ? { channelId: "omnifinance" } : {}) }, trigger: options.date ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: options.date } : null });
}
