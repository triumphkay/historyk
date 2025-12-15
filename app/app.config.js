const { readFileSync } = require("fs");
const path = require("path");

const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, "package.json"), "utf8")
);
const version = packageJson.version;

// 버전 번호를 기반으로 Android versionCode와 iOS buildNumber 생성
// 예: 1.0.0 -> 1000000
const [major, minor, patch] = version.split(".").map(Number);
const versionCode = major * 1000000 + minor * 1000 + patch;

module.exports = {
  expo: {
    name: "history-keyword-quiz",
    slug: "history-keyword-quiz",
    version: version,
    sdkVersion: "54.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#d5d0c8",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.triumphkay.historyk",
      buildNumber: String(versionCode),
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#d5d0c8",
      },
      versionCode: versionCode,
    },
    web: {
      bundler: "metro",
      favicon: "./assets/icon.png",
    },
    extra: {
      eas: {
        projectId: "d0ddfbbf-9d04-427d-850c-98567f6e6cf3",
      },
    },
  },
};
