import { StyleSheet, Text, View, TouchableOpacity, Switch} from 'react-native'
import React, { useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Camera } from 'expo-camera'

const PermissionsPage = () => {
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const router = useRouter();
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>A few permissions needed</Text>
                    <Text style={styles.headerDescription}>OmniFinance works fully offline. Permissions stay on your device.</Text>
                </View>
                <View style={styles.middleView}>
                    <View style={styles.permissionContainer}>
                        <View style={styles.permissionCard}>
                            <View style={styles.leftSection}>
                                <View style={styles.iconCircle}>
                                    <Text>📷</Text>
                                </View>
                                <View style={styles.textWrapper}>
                                    <Text style={styles.permissionTitle}>Camera Access</Text>
                                    <Text style={styles.permissionDescription}>To scan receipts and extract amounts automatically.</Text>
                                </View>
                            </View>
                            <Switch
                                value={cameraEnabled}
                                onValueChange={async (value) => {
                                    if (!value) {
                                        setCameraEnabled(false);
                                        return;
                                    }
                                    const { status } = await Camera.requestCameraPermissionsAsync();
                                    setCameraEnabled(status === 'granted');
                                }}
                            />
                        </View>
                        <View style={styles.permissionCard}>
                            <View style={styles.leftSection}>
                                <View style={styles.iconcircleDark}>
                                    <Text>💬</Text>
                                </View>
                                <View style={styles.textWrapper}>
                                    <Text style={styles.permissionTitle}>
                                        SMS Access (Android)
                                    </Text>
                                    <Text style={styles.permissionDescription}>
                                        To read bank alerts and auto-log transactions
                                    </Text>
                                </View>
                            </View>
                            <Switch
                            value={smsEnabled}
                            onValueChange={setSmsEnabled}/>
                        </View>
                    </View>
                    <Text style={styles.infoText}>
                        You can change these anytime in Settings.
                    </Text>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.button} onPress={() => router.push("/gemini")}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
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
    middleView: {
        paddingHorizontal: 20,
    },
    permissionContainer: {
        marginTop: 40,
        gap: 18
    },
    permissionCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#F8F8F8",
        
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    iconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#FFD54F",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14
    },
    iconcircleDark: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#0A1628",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14
    },
    permissionTitle: {
        fontWeight: "700",
        fontSize: 16
    },
    permissionDescription: {
        marginTop: 3,
        color: "#666",
        fontSize: 13,
        lineHeight: 18,
        flexWrap: 'wrap'
    },
    textWrapper: {
        flexShrink: 1,
        paddingRight: 8
    },
    infoText: {
        marginTop: 30,
        textAlign: "center",
        color: "#888",
        fontSize: 12,
    },
    footer: {
        marginTop: "85%",
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 24
    },
    button: {
        backgroundColor: "#0A1628",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        width: '100%',
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16
    }
});
//
//
