// ── State ───────────────────────────────────────────────────
let db = null;
let auth = null;
let currentUser = null;
let allHistory = [];
let unsubBorrows = null;
let unsubHistory = null;

// ── Firebase Init ───────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);
auth = firebase.auth();
db = firebase.firestore();

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    document.getElementById("signinBtn").style.display = "none";
    document.getElementById("userInfo").style.display = "flex";
    document.getElementById("userName").textContent = user.displayName || user.email;
    const photo = document.getElementById("userPhoto");
    if (user.photoURL) photo.src = user.photoURL;
    subscribeAll();
  } else {
    document.getElementById("signinBtn").style.display = "flex";
    document.getElementById("userInfo").style.display = "none";
    if (unsubBorrows) unsubBorrows();
    if (unsubHistory) unsubHistory();
    renderCurrentBorrows({});
    renderHistory([]);
  }
});

function adminSignIn() {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(err => alert("登入失敗：" + err.message));
}
function adminSignOut() {
  auth.signOut();
}

// ── Subscribe ───────────────────────────────────────────────
function subscribeAll() {
  // Current borrows
  unsubBorrows = db.collection("borrows").onSnapshot(snap => {
    const map = {};
    snap.forEach(doc => { map[doc.id] = doc.data(); });
    renderCurrentBorrows(map);
    updateStats(map);
  });

  // History
  unsubHistory = db.collection("borrow_history")
    .orderBy("returnedAt", "desc")
    .onSnapshot(snap => {
      allHistory = [];
      snap.forEach(doc => { allHistory.push({ id: doc.id, ...doc.data() }); });
      renderHistory(allHistory);
      updateHistoryCount(allHistory);
    });
}

// ── Stats ───────────────────────────────────────────────────
function updateStats(borrowMap) {
  const borrowed = Object.keys(borrowMap).length;
  const total = typeof BOOKS !== "undefined" ? BOOKS.length : 18;
  document.getElementById("statBorrowed").textContent = borrowed;
  document.getElementById("statAvail").textContent = total - borrowed;
}
function updateHistoryCount(history) {
  document.getElementById("statHistory").textContent = history.length;
  const uids = new Set(history.map(h => h.borrowedBy));
  document.getElementById("statBorrowers").textContent = uids.size;
}

// ── Render Current Borrows ──────────────────────────────────
function renderCurrentBorrows(borrowMap) {
  const el = document.getElementById("currentBorrows");
  const entries = Object.entries(borrowMap);
  if (entries.length === 0) {
    el.innerHTML = `<p class="empty-state">目前沒有書籍被借出 🎉</p>`;
    return;
  }
  const rows = entries.map(([bookId, data]) => {
    const book = typeof BOOKS !== "undefined" ? BOOKS.find(b => b.id === bookId) : null;
    const title = book ? book.title : bookId;
    const borrowedAt = data.borrowedAt
      ? new Date(data.borrowedAt.seconds * 1000).toLocaleString("zh-TW")
      : "—";
    const avatar = data.borrowerPhoto
      ? `<img src="${data.borrowerPhoto}" class="avatar" onerror="this.style.display='none'" alt="">`
      : `<span class="avatar-placeholder">👤</span>`;
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${book ? `<div class="book-dot" style="background:${book.color}"></div>` : ""}
            <strong>${title}</strong>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${avatar}
            <span>${data.borrowerName || "匿名"}</span>
          </div>
        </td>
        <td class="date-cell">${borrowedAt}</td>
        <td><span class="badge badge-out">借閱中</span></td>
      </tr>`;
  }).join("");
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>書名</th><th>借閱人</th><th>借出時間</th><th>狀態</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Render History ──────────────────────────────────────────
function renderHistory(list) {
  const el = document.getElementById("historyList");
  if (list.length === 0) {
    el.innerHTML = `<p class="empty-state">尚無歷史記錄</p>`;
    return;
  }
  const rows = list.map(h => {
    const book = typeof BOOKS !== "undefined" ? BOOKS.find(b => b.id === h.bookId) : null;
    const title = book ? book.title : h.bookId;
    const borrowedAt = h.borrowedAt
      ? new Date(h.borrowedAt.seconds * 1000).toLocaleString("zh-TW")
      : "—";
    const returnedAt = h.returnedAt
      ? new Date(h.returnedAt.seconds * 1000).toLocaleString("zh-TW")
      : "—";
    const duration = (h.borrowedAt && h.returnedAt)
      ? formatDuration(h.borrowedAt.seconds, h.returnedAt.seconds)
      : "—";
    const avatar = h.borrowerPhoto
      ? `<img src="${h.borrowerPhoto}" class="avatar" onerror="this.style.display='none'" alt="">`
      : `<span class="avatar-placeholder">👤</span>`;
    return `
      <tr data-search="${title} ${h.borrowerName || ""}">
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${book ? `<div class="book-dot" style="background:${book.color}"></div>` : ""}
            <strong>${title}</strong>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            ${avatar}
            <span>${h.borrowerName || "匿名"}</span>
          </div>
        </td>
        <td class="date-cell">${borrowedAt}</td>
        <td class="date-cell">${returnedAt}</td>
        <td class="date-cell">${duration}</td>
        <td><span class="badge badge-avail">已歸還</span></td>
      </tr>`;
  }).join("");
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>書名</th><th>借閱人</th><th>借出時間</th><th>還書時間</th><th>借閱天數</th><th>狀態</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function filterHistory() {
  const q = document.getElementById("historySearch").value.toLowerCase();
  document.querySelectorAll("#historyList tbody tr").forEach(row => {
    row.style.display = row.dataset.search.toLowerCase().includes(q) ? "" : "none";
  });
}

function formatDuration(startSec, endSec) {
  const diff = endSec - startSec;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days} 天 ${hours} 小時`;
  if (hours > 0) return `${hours} 小時`;
  const mins = Math.floor(diff / 60);
  return `${mins} 分鐘`;
}
