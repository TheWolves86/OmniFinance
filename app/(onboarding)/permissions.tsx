import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Camera } from "expo-camera";

export default function PermissionsPage() {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const router = useRouter();
  const toggleCamera = async (value: boolean) => {
    if (!value) { setCameraEnabled(false); return; }
    try { const result = await Camera.requestCameraPermissionsAsync(); setCameraEnabled(result.status === "granted"); }
    catch { setCameraEnabled(false); Alert.alert("Error", "Could not request camera permissions."); }
  };
  return <SafeAreaView style={styles.safeArea}><View style={styles.screen}><View style={styles.header}><Text style={styles.headerTitle}>A few permissions needed</Text><Text style={styles.headerDescription}>OmniFinance works fully offline. Permissions stay on your device.</Text></View><View style={styles.middleView}><View style={styles.permissionCard}><View style={styles.leftSection}><View style={styles.iconCircle}><Text>Camera</Text></View><View style={styles.textWrapper}><Text style={styles.permissionTitle}>Camera Access</Text><Text style={styles.permissionDescription}>To scan receipts and extract amounts automatically.</Text></View></View><Switch value={cameraEnabled} onValueChange={toggleCamera} /></View><View style={styles.permissionCard}><View style={styles.textWrapper}><Text style={styles.permissionTitle}>Automatic capture</Text><Text style={styles.permissionDescription}>Payment notifications are never read through SMS. Configure supported Android notification access or iOS Shortcuts later from Activity.</Text></View></View><Text style={styles.infoText}>You can change these anytime in Settings.</Text><View style={styles.footer}><TouchableOpacity style={styles.button} onPress={() => router.push("/gemini")}><Text style={styles.buttonText}>Continue</Text></TouchableOpacity></View></View></View></SafeAreaView>;
}
const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:"white"},screen:{flex:1},header:{marginTop:24,paddingHorizontal:20},headerTitle:{fontWeight:"bold",fontSize:24},headerDescription:{marginTop:8,fontSize:15,color:"#666",lineHeight:22},middleView:{paddingHorizontal:20},permissionCard:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:18,borderRadius:18,backgroundColor:"#F8F8F8",marginTop:18},leftSection:{flexDirection:"row",alignItems:"center",flex:1},iconCircle:{width:46,height:46,borderRadius:23,backgroundColor:"#FFD54F",justifyContent:"center",alignItems:"center",marginRight:14},permissionTitle:{fontWeight:"700",fontSize:16},permissionDescription:{marginTop:3,color:"#666",fontSize:13,lineHeight:18},textWrapper:{flexShrink:1,paddingRight:8},infoText:{marginTop:30,textAlign:"center",color:"#888",fontSize:12},footer:{marginTop:"85%",flex:1,justifyContent:"flex-end",paddingBottom:24},button:{backgroundColor:"#0A1628",paddingVertical:16,paddingHorizontal:20,borderRadius:14,alignItems:"center",justifyContent:"center",minHeight:52,width:"100%"},buttonText:{color:"white",fontWeight:"bold",fontSize:16}});
