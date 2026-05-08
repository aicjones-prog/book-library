// ── State ──────────────────────────────────────────────────
let currentUser = null;
let db = null;
let auth = null;
let borrowStatus = {}; // { bookId: { borrowedBy, borrowerName, borrowedAt } }
let activeFilter = "all";
let unsubscribeBorrows = null;

// ── Firebase Init ───────────────────────────────────────────
function initFirebase() {
  if (!FIREBASE_CONFIGURED) {
    showSetupBanner();
    renderBooks();
    return;
  }
  firebase.initializeApp(FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();

  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) {
      subscribeToBorows();
    } else {
      if (unsubscribeBorrows) { unsubscribeBorrows(); unsubscribeBorrows = null; }
      borrowStatus = {};
      renderBooks();
    }
  });

  subscribeToBorows();
}

function subscribeToBorows() {
  if (!db) return;
  if (unsubscribeBorrows) unsubscribeBorrows();
  unsubscribeBorrows = db.collection("borrows").onSnapshot(snap => {
    borrowStatus = {};
    snap.forEach(doc => {
      borrowStatus[doc.id] = doc.data();
    });
    renderBooks();
    updateBorrowCount();
  });
}

// ── Auth ────────────────────────────────────────────────────
function signIn() {
  if (!FIREBASE_CONFIGURED) { showToast("請先完成 Firebase 設定（見 README）", "warn"); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => showToast("登入失敗：" + err.message, "error"));
}

function signOut() {
  auth.signOut().then(() => showToast("已登出"));
}

function updateAuthUI() {
  const signinBtn = document.getElementById("signinBtn");
  const userStatusBar = document.getElementById("userStatusBar");
  const welcomeMsg = document.getElementById("welcomeMsg");

  if (currentUser) {
    signinBtn.style.display = "none";
    userStatusBar.style.display = "flex";
    welcomeMsg.innerHTML = `<img src="${currentUser.photoURL || ''}" class="avatar" onerror="this.style.display='none'"> 歡迎，${currentUser.displayName || currentUser.email}`;
  } else {
    signinBtn.style.display = "flex";
    userStatusBar.style.display = "none";
  }
}

function updateBorrowCount() {
  if (!currentUser) return;
  const count = Object.values(borrowStatus).filter(b => b.borrowedBy === currentUser.uid).length;
  document.getElementById("borrowCount").textContent = `目前借閱：${count} 本`;
}

// ── Borrow / Return ─────────────────────────────────────────
async function borrowBook(bookId) {
  if (!currentUser) { showToast("請先以 Google 帳號登入", "warn"); return; }
  const status = borrowStatus[bookId];
  if (status && status.borrowedBy) { showToast("此書目前已被借出", "warn"); return; }

  try {
    await db.collection("borrows").doc(bookId).set({
      borrowedBy: currentUser.uid,
      borrowerName: currentUser.displayName || currentUser.email,
      borrowerPhoto: currentUser.photoURL || "",
      borrowedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const book = BOOKS.find(b => b.id === bookId);
    showToast(`✓ 成功借閱《${book.title}》`);
  } catch (err) {
    showToast("借閱失敗：" + err.message, "error");
  }
}

async function returnBook(bookId) {
  if (!currentUser) return;
  const status = borrowStatus[bookId];
  if (!status || status.borrowedBy !== currentUser.uid) {
    showToast("只能歸還自己借閱的書", "warn"); return;
  }
  try {
    await db.collection("borrows").doc(bookId).delete();
    const book = BOOKS.find(b => b.id === bookId);
    showToast(`✓ 已歸還《${book.title}》`);
  } catch (err) {
    showToast("歸還失敗：" + err.message, "error");
  }
}

// ── Render ──────────────────────────────────────────────────
function filterBooks(genre) {
  activeFilter = genre;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderBooks();
}

function renderBooks() {
  const grid = document.getElementById("booksGrid");
  const filtered = activeFilter === "all"
    ? BOOKS
    : BOOKS.filter(b => b.tags.includes(activeFilter));

  grid.innerHTML = filtered.map(book => buildCard(book)).join("");
}

function buildCard(book) {
  const status = borrowStatus[book.id];
  const isBorrowed = status && status.borrowedBy;
  const isMyBook = isBorrowed && currentUser && status.borrowedBy === currentUser.uid;
  const borrowedAt = status && status.borrowedAt
    ? new Date(status.borrowedAt.seconds * 1000).toLocaleDateString("zh-TW")
    : "";

  let btnHtml = "";
  if (!FIREBASE_CONFIGURED) {
    btnHtml = `<button class="btn-borrow disabled" disabled>需設定 Firebase</button>`;
  } else if (isMyBook) {
    btnHtml = `<button class="btn-return" onclick="returnBook('${book.id}')">歸還此書</button>`;
  } else if (isBorrowed) {
    btnHtml = `<button class="btn-borrow disabled" disabled>已被借出</button>`;
  } else {
    btnHtml = `<button class="btn-borrow" onclick="${currentUser ? `borrowBook('${book.id}')` : 'signIn()'}">
      ${currentUser ? "立即借閱" : "登入後借閱"}
    </button>`;
  }

  const statusBadge = isMyBook
    ? `<span class="badge badge-mine">我借閱中</span>`
    : isBorrowed
    ? `<span class="badge badge-out">已借出</span>`
    : `<span class="badge badge-avail">可借閱</span>`;

  return `
    <div class="book-card ${isBorrowed && !isMyBook ? 'card-unavailable' : ''}" onclick="showBookDetail('${book.id}')">
      <div class="card-header" style="background:${book.color}">
        <div class="card-title-area">
          <h3 class="card-title">${book.title}</h3>
          <p class="card-author">${book.author}</p>
        </div>
        ${statusBadge}
      </div>
      <div class="card-body">
        <div class="card-tags">
          ${book.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
        <p class="card-highlight">💡 ${book.highlight}</p>
        <p class="card-summary">${book.summary.slice(0, 80)}…</p>
        ${isMyBook && borrowedAt ? `<p class="borrow-date">借閱日期：${borrowedAt}</p>` : ""}
        ${isBorrowed && !isMyBook ? `<p class="borrowed-by">借閱者：${status.borrowerName || "匿名"}</p>` : ""}
      </div>
      <div class="card-footer" onclick="event.stopPropagation()">
        ${btnHtml}
      </div>
    </div>
  `;
}

// ── Book Detail Modal ───────────────────────────────────────
function showBookDetail(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;
  const status = borrowStatus[bookId];
  const isBorrowed = status && status.borrowedBy;
  const isMyBook = isBorrowed && currentUser && status.borrowedBy === currentUser.uid;

  document.getElementById("modalBookTitle").textContent = book.title;
  document.getElementById("modalBookContent").innerHTML = `
    <div class="detail-header" style="background:${book.color}">
      <p class="detail-author">✍ ${book.author}</p>
      <p class="detail-publisher">出版：${book.publisher || "—"}</p>
      <div class="card-tags">${book.tags.map(t => `<span class="tag tag-light">${t}</span>`).join("")}</div>
    </div>
    <div class="detail-body">
      <h4>內容簡介</h4>
      <p>${book.summary}</p>
      <div class="detail-highlight">💡 ${book.highlight}</div>
      <div class="detail-action">
        ${isMyBook
          ? `<button class="btn-return btn-large" onclick="returnBook('${book.id}'); closeDetailModal()">歸還此書</button>`
          : isBorrowed
          ? `<button class="btn-borrow disabled btn-large" disabled>目前已被借出（${status.borrowerName || "匿名"}）</button>`
          : `<button class="btn-borrow btn-large" onclick="${currentUser ? `borrowBook('${book.id}'); closeDetailModal()` : 'signIn()'}">
              ${currentUser ? "立即借閱" : "以 Google 帳號登入借閱"}
            </button>`
        }
      </div>
    </div>
  `;
  document.getElementById("bookDetailModal").style.display = "flex";
}

function closeDetailModal() {
  document.getElementById("bookDetailModal").style.display = "none";
}

// ── My Books Modal ──────────────────────────────────────────
function showMyBooks() {
  if (!currentUser) { showToast("請先登入", "warn"); return; }
  const myBooks = BOOKS.filter(b => {
    const s = borrowStatus[b.id];
    return s && s.borrowedBy === currentUser.uid;
  });

  const listEl = document.getElementById("myBooksList");
  if (myBooks.length === 0) {
    listEl.innerHTML = `<p class="empty-state">目前沒有借閱中的書籍</p>`;
  } else {
    listEl.innerHTML = myBooks.map(book => {
      const s = borrowStatus[book.id];
      const date = s.borrowedAt
        ? new Date(s.borrowedAt.seconds * 1000).toLocaleDateString("zh-TW")
        : "—";
      return `
        <div class="my-book-item">
          <div class="my-book-dot" style="background:${book.color}"></div>
          <div class="my-book-info">
            <strong>${book.title}</strong>
            <span>${book.author} · 借閱日期：${date}</span>
          </div>
          <button class="btn-return btn-sm" onclick="returnBook('${book.id}'); updateMyBooksModal()">歸還</button>
        </div>
      `;
    }).join("");
  }
  document.getElementById("myBooksModal").style.display = "flex";
}

function updateMyBooksModal() {
  setTimeout(showMyBooks, 500);
}

function closeModal() {
  document.getElementById("myBooksModal").style.display = "none";
}

// ── Setup Banner ────────────────────────────────────────────
function showSetupBanner() {
  const banner = document.createElement("div");
  banner.className = "setup-banner";
  banner.innerHTML = `
    <strong>⚙️ 需要設定 Firebase</strong>
    請參閱 <a href="README.md" target="_blank">README.md</a> 完成 Firebase 設定後，此網站即可啟用 Google 登入與借閱功能。
  `;
  document.body.insertBefore(banner, document.querySelector("main"));
}

// ── Toast ───────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderBooks();
  initFirebase();
});
