import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from "../constants/storageKeys";

export async function saveItem(key: string, value: string) {
    if (key === STORAGE_KEYS.API_KEY) {
        await SecureStore.setItemAsync(key, value);
    } else {
        await AsyncStorage.setItem(key, value);
    }
}

export async function getItem(key: string) {
    if (key === STORAGE_KEYS.API_KEY) {
        return await SecureStore.getItemAsync(key);
    }
    return await AsyncStorage.getItem(key);
}

export async function removeItem(key: string) {
    if (key === STORAGE_KEYS.API_KEY) {
        await SecureStore.deleteItemAsync(key);
    } else {
        await AsyncStorage.removeItem(key);
    }
}
