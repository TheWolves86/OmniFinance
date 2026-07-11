import React from "react";
import { View, Text, Pressable, Platform, StyleSheet} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0B1D3A";
const NAVY_MUTED = "#8A93A6"
const WHITE = "#FFFFFF"

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    dashboard: "grid-outline",
    acitivity: "receipt-outline",
    budgets: "wallet-outline",
    goals: "flag-outline",
    reports: "bar-chart-outline"
};

const ICONS_FOCUSED: Record<string, keyof typeof Ionicons.glyphMap> = {
    dashboard: "grid",
    activity: "receipt",
    budgets: "wallet",
    goals: "flag",
    reports: "bar-chart"
};

export default function CustomTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const FAB_INDEX = 2;

    const handleAddPress = () => {
        router.push("")
    }

    return (
        <View style={[styles.wrapper, { paddingBottom: insets.bottom || 8}]}>

        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "relative"
    },
    barBackground: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: WHITE,
        height: 58,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#E5E7EB"
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 2
    },
    label: {
        fontSize: 10,
        fontWeight: "500"
    },
    fabSpacer: {
        width: 56
    },
    fab: {
        position: "absolute",
        alignSelf: "center",
        top: -22,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: NAVY,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 8
            },
            android: {
                elevation: 4
            }
        })
    }
})