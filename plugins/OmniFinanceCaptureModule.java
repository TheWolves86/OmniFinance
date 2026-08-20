package com.omnifinance.app.capture;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableArray;
import org.json.JSONArray;
import android.provider.Settings;
import android.content.ComponentName;

public class OmniFinanceCaptureModule extends ReactContextBaseJavaModule {
  public OmniFinanceCaptureModule(ReactApplicationContext context) { super(context); }
  @Override public String getName() { return "OmniFinanceCapture"; }
  @com.facebook.react.bridge.ReactMethod public void isNotificationAccessEnabled(Promise promise) { String enabled = Settings.Secure.getString(getReactApplicationContext().getContentResolver(), "enabled_notification_listeners"); String component = new ComponentName(getReactApplicationContext(), OmniFinanceNotificationListener.class).flattenToString(); promise.resolve(enabled != null && enabled.contains(component)); }
  @com.facebook.react.bridge.ReactMethod public void setCaptureEnabled(boolean enabled, Promise promise) { getReactApplicationContext().getSharedPreferences("omnifinance_capture", 0).edit().putBoolean("capture_enabled", enabled).apply(); promise.resolve(null); }
  @com.facebook.react.bridge.ReactMethod public void drainPending(Promise promise) {
    try {
      String raw = getReactApplicationContext().getSharedPreferences("omnifinance_capture", 0).getString("pending", "[]");
      JSONArray values = new JSONArray(raw);
      WritableArray result = Arguments.createArray();
      for (int i = 0; i < values.length(); i++) {
        org.json.JSONObject item = values.getJSONObject(i);
        com.facebook.react.bridge.WritableMap map = Arguments.createMap();
        java.util.Iterator<String> keys = item.keys();
        while (keys.hasNext()) { String key = keys.next(); Object value = item.get(key); if (value instanceof Number) map.putDouble(key, ((Number)value).doubleValue()); else map.putString(key, String.valueOf(value)); }
        result.pushMap(map);
      }
      promise.resolve(result);
    } catch (Exception error) { promise.reject("CAPTURE_QUEUE_ERROR", error); }
  }
  @com.facebook.react.bridge.ReactMethod public void clearPending(Promise promise) {
    getReactApplicationContext().getSharedPreferences("omnifinance_capture", 0).edit().putString("pending", "[]").apply();
    promise.resolve(null);
  }
}
