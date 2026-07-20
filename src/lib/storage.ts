import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

export async function saveItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
}

export async function getItem(key: string) {
    return await AsyncStorage.getItem(key);
}

export async function removeItem(key: string) {
    await AsyncStorage.removeItem(key);
}
