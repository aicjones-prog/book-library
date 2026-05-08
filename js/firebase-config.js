// ============================================================
//  Firebase 設定
//  請至 https://console.firebase.google.com 建立專案後
//  將下方設定值替換為你的 Firebase 專案設定
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 偵測是否已完成設定
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";
