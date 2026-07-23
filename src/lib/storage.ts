import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from "../constants/storageKeys";

export async function saveItem(key: string, value: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.setItemAsync(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    } catch (error) {
        console.error("Error saving item to storage:", error);
        throw error;
    }
}

export async function getItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            return await SecureStore.getItemAsync(key);
        }
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error("Error getting item from storage:", error);
        throw error;
    }
}

export async function removeItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    } catch (error) {
        console.error("Error removing item from storage:", error);
        throw error;
    }
}
