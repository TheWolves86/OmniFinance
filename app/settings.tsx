import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleAction = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0B1D3A" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>General</Text>
        <Pressable style={styles.row} onPress={() => handleAction('Profile', 'Profile settings coming soon.')}>
          <Ionicons name="person-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Profile</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => handleAction('Appearance', 'Appearance settings coming soon.')}>
          <Ionicons name="color-palette-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Appearance</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Pressable style={styles.row} onPress={() => router.push('/ai-settings')}>
          <Ionicons name="sparkles-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>AI Settings</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push('/notification-settings')}>
          <Ionicons name="notifications-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Notifications</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => handleAction('Automatic Capture', 'Capture preferences coming soon.')}>
          <Ionicons name="scan-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Automatic Capture</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        <Pressable style={styles.row} onPress={() => handleAction('Privacy', 'Privacy settings coming soon.')}>
          <Ionicons name="lock-closed-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Privacy</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => handleAction('Export Data', 'Exporting CSV/JSON is not fully implemented yet.')}>
          <Ionicons name="download-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Export Data (CSV/JSON)</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => handleAction('Backup', 'Database backup coming soon.')}>
          <Ionicons name="cloud-upload-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Backup</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => handleAction('Restore', 'Database restore coming soon.')}>
          <Ionicons name="cloud-download-outline" size={20} color="#0B1D3A" />
          <Text style={styles.rowText}>Restore</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => Alert.alert('Reset Database', 'Are you sure you want to delete all data?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete All', style: 'destructive' }])}>
          <Ionicons name="trash-outline" size={20} color="#B42318" />
          <Text style={[styles.rowText, { color: '#B42318' }]}>Reset Database</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0B1D3A' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { marginTop: 24, marginBottom: 8, fontSize: 13, fontWeight: '700', color: '#8A93A6', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#F0F1F4' },
  rowText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#0B1D3A' },
});
