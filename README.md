# 📚 私人書庫借閱系統

以 Google 帳號登入的個人書庫借閱網站，使用 Firebase 做為後端服務。

## 功能

- 瀏覽 9 本藏書及內容摘要
- 以 **Google 帳號**登入借閱
- 即時顯示借閱狀態（可借 / 已借出 / 我借閱中）
- 一鍵歸還
- 分類篩選

---

## Firebase 設定步驟

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 點「新增專案」→ 輸入名稱（如 `my-book-library`）→ 建立
3. 在專案主頁點「網頁」圖示 (`</>`) 新增網頁應用程式
4. 複製 `firebaseConfig` 物件內的值

### 2. 填入設定

編輯 `js/firebase-config.js`，將佔位符替換為你的真實值：

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

### 3. 啟用 Google 登入

1. Firebase Console → 「Authentication」→「Sign-in method」
2. 啟用 **Google**，儲存

### 4. 建立 Firestore 資料庫

1. Firebase Console → 「Firestore Database」→「建立資料庫」
2. 選「正式版模式」
3. 選擇地區（如 `asia-east1`）→ 完成

### 5. 設定 Firestore 安全規則

在 Firestore Console 的「規則」頁籤貼上：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /borrows/{bookId} {
      allow read: if true;
      allow create: if request.auth != null
        && !exists(/databases/$(database)/documents/borrows/$(bookId));
      allow delete: if request.auth != null
        && resource.data.borrowedBy == request.auth.uid;
    }
  }
}
```

### 6. 加入授權網域

Firebase Console → Authentication → Settings → 授權網域  
加入你的 GitHub Pages 網址：`aicjones-prog.github.io`

---

## 部署到 GitHub Pages

1. Commit 並 push 所有檔案到 `main` 分支
2. GitHub repo → Settings → Pages → Branch: `main` / `/ (root)` → Save
3. 等待約 1 分鐘，即可用 `https://aicjones-prog.github.io/book-library/` 開啟

---

## 技術架構

| 項目 | 技術 |
|------|------|
| 前端 | 純 HTML / CSS / JavaScript |
| 認證 | Firebase Authentication（Google） |
| 資料庫 | Firebase Firestore |
| 託管 | GitHub Pages |
