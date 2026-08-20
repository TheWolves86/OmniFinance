package com.omnifinance.app.capture

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.ComponentName
import android.os.Bundle
import org.json.JSONObject
import org.json.JSONArray

class OmniFinanceNotificationListener : NotificationListenerService() {
  private val supported = setOf("com.google.android.apps.walletnfcrel", "com.google.android.apps.nbu.paisa.user", "com.phonepe.app", "net.one97.paytm", "com.samsung.android.spay")
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    if (!getSharedPreferences("omnifinance_capture", MODE_PRIVATE).getBoolean("capture_enabled", true)) return
    if (!supported.contains(sbn.packageName)) return
    val extras: Bundle = sbn.notification.extras
    val text = extras.getCharSequence("android.text")?.toString() ?: extras.getCharSequence("android.bigText")?.toString() ?: ""
    val appName = try { packageManager.getApplicationLabel(packageManager.getApplicationInfo(sbn.packageName, 0)).toString() } catch (_: Exception) { sbn.packageName }
    val event = JSONObject().apply {
      put("packageName", sbn.packageName)
      put("appName", appName)
      put("title", extras.getCharSequence("android.title")?.toString() ?: "")
      put("text", text)
      put("timestamp", sbn.postTime)
      put("key", sbn.key)
    }
    val prefs = getSharedPreferences("omnifinance_capture", MODE_PRIVATE)
    val pending = JSONArray(prefs.getString("pending", "[]"))
    for (index in 0 until pending.length()) if (pending.optJSONObject(index)?.optString("key") == sbn.key) return
    while (pending.length() >= 100) pending.remove(0)
    pending.put(event)
    prefs.edit().putString("pending", pending.toString()).apply()
  }
  override fun onListenerDisconnected() { requestRebind(ComponentName(this, OmniFinanceNotificationListener::class.java)) }
}
