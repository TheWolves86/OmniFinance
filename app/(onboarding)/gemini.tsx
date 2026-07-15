import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import { saveItem } from '../../src/lib/storage'
import { STORAGE_KEYS } from '../../src/constants/storageKeys'

const Gemini = () => {
  const [apiKey, setApiKey] = useState("")
  const [hideKey, setHideKey] = useState(true)
  const router = useRouter()

  const openAiStudio = async () => {
    try {
      await Linking.openURL("https://aistudio.google.com/app/apikey")
    } catch (error) {
      console.error("Error opening link:", error);
      Alert.alert("Error", "Could not open the link.");
    }
  }

  const handleSave = async () => {
    if (apiKey.trim().length === 0) {
      Alert.alert("Error", "Please enter your API key.");
    } else {
      try {
        await saveItem(STORAGE_KEYS.API_KEY, apiKey.trim());
        await saveItem(STORAGE_KEYS.AI_PROVIDER, "gemini");
        await saveItem(STORAGE_KEYS.ONBOARDING, "true");

        router.replace("/(tabs)")
      } catch (error) {
        console.error("Error saving API key:", error);
        Alert.alert("Error", "Could not save the API key.");
      }
    }
  }

  const handleSkip = async () => {
    try {
      await saveItem(STORAGE_KEYS.ONBOARDING, "true");
      router.replace("/(tabs)")
    } catch (error) {
      console.error("Error skipping:", error);
      Alert.alert("Error", "Could not proceed.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>✨</Text>
          </View>
          <Text style={styles.title}>Connect your AI</Text>
          <Text style={styles.description}>
            OmniFinance is open source. Bring your own AI API key to unlock AI features.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>API Key</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={hideKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setHideKey(!hideKey)}>
              <Text>{hideKey ? "👁️" : "🙈"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacyInfo}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Stored locally. Never leaves your device.
            </Text>
          </View>

          <TouchableOpacity style={styles.aiStudioLink} onPress={openAiStudio}>
            <Text style={styles.linkText}>
              Get a free key at aistudio.google.com →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            AI features will be unavailable until a key is added.
          </Text>
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
  iconText: {
    fontSize: 24
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
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    height: 50, 
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111",
    height: "100%", 
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 10, 
  },
  privacyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16
  },
  privacyIcon: {
    fontSize: 12
  },
  privacyText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#27AE60",
    fontWeight: "600"
  },
  aiStudioLink: {
    marginTop: 18,
    borderBottomWidth: 1, 
    borderBottomColor: "#FFD54F", 
    alignSelf: "flex-start",
    paddingBottom: 2
  },
  linkText: {
    fontSize: 13,
    color: "#222",
    fontWeight: "700"
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
