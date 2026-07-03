import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import SafeAreaView from 'react-native-safe-area-view'
import * as Linking from 'expo-linking'

const Gemini = () => {
  const [ apiKey, setApiKey ] = useState("")
  const [ hideKey, setHideKey ] = useState(true)
  const router = useRouter()

  const opneAiStudio = async () => {
    await Linking.openURL("https://aistudio.google.com/app/apikey")
  }

  const handleSave = () => {
    console.log(`API key: ${apiKey}`)

    router.replace("/(tabs)")
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 24 }}>✨</Text>
          </View>

          <Text style={styles.title}>Connect your AI</Text>

          <Text style={styles.description}>
            OmniFinance is open source. Bring your own free api key to unlock AI features
          </Text>
        </View>

        <View style={styles.inputCard}>
          <TextInput
              style={styles.input}
              placeholder="AIza..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={hideKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
        </View>

      </View>
    </SafeAreaView>
  )
};
export default Gemini

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white"
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    alignItems: "center",
    marginTop: 20
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFD54F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12
  },
  inputCard: {
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 18
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    color: "#222"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111"
  },
  eyeButton: {
    paddingLeft: 10
  },
  privacyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14
  },
  privacyText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#27AE60",
    fontWeight: "600"
  },
  aiStudioLink: {
    marginTop: 18
  },
  linkText: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600"
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 24
  },
  saveButton: {
    backgroundColor: "#0A1628",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 14
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  skipButton: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 18
  },
  skipButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#999"
  }
});
//