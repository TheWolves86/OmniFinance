const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withNotificationListener(config) {
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;
    application.service = application.service || [];
    if (!application.service.some((service) => service.$?.["android:name"] === ".capture.OmniFinanceNotificationListener")) {
      application.service.push({ $: { "android:name": ".capture.OmniFinanceNotificationListener", "android:label": "OmniFinance capture", "android:exported": "false", "android:permission": "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE" }, "intent-filter": [{ action: [{ $: { "android:name": "android.service.notification.NotificationListenerService" } }] }] });
    }
    return config;
  });
  return withDangerousMod(config, ["android", async (config) => {
    const dir = path.join(config.modRequest.platformProjectRoot, "app/src/main/java/com/omnifinance/app/capture");
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(config.modRequest.projectRoot, "plugins/OmniFinanceNotificationListener.kt"), path.join(dir, "OmniFinanceNotificationListener.kt"));
    fs.copyFileSync(path.join(config.modRequest.projectRoot, "plugins/OmniFinanceCaptureModule.java"), path.join(dir, "OmniFinanceCaptureModule.java"));
    fs.copyFileSync(path.join(config.modRequest.projectRoot, "plugins/OmniFinanceCapturePackage.java"), path.join(dir, "OmniFinanceCapturePackage.java"));
    const main = path.join(config.modRequest.platformProjectRoot, "app/src/main/java/com/omnifinance/app/MainApplication.kt");
    if (fs.existsSync(main)) {
      let contents = fs.readFileSync(main, "utf8");
      if (!contents.includes("OmniFinanceCapturePackage")) {
        contents = contents.replace(/(package [^\n]+\n)/, "$1\nimport com.omnifinance.app.capture.OmniFinanceCapturePackage\n");
        contents = contents.replace(/(PackageList\(this\)\.packages)/, "$1.apply { add(OmniFinanceCapturePackage()) }");
        fs.writeFileSync(main, contents);
      }
    }
    return config;
  }]);
};
