import { StyleSheet, Text, View, TouchableOpacity, Switch} from 'react-native'
import React, { useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const PermissionsPage = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>A few permissions needed</Text>
                    <Text style={styles.headerDescription}>OmniFinance works fully offline. Permissions stay on your device.</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default PermissionsPage

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "white",
    },
    screen: {
        flex: 1
    },
    header: {
        marginTop: 24,
        paddingHorizontal: 20
    },
    headerTitle: {
        fontWeight: "bold",
        fontSize: 24
    },
    headerDescription: {
        marginTop: 8,
        fontSize: 15,
        color: "#666",
        lineHeight: 22
    },
    permissionContainer: {

    },
    permissionCard: {

    },
    leftSection: {

    },
    iconCircle: {

    },
    iconcircleDark: {

    },
    permissionTitle: {

    },
    permissionDescription: {

    },
    
})