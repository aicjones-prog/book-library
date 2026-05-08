// ── State ──────────────────────────────────────────────────
let currentUser = null;
let db = null;
let auth = null;
let borrowStatus = {};
let activeFilter = "all";
let currentPage = 1;
const BOOKS_PER_PAGE = 20;
let unsubscribeBorrows = null;
const coverCache = JSON.parse(localStorage.getItem("bookCovers") || "{}");

// ── Firebase Init ───────────────────────────────────────────
function initFirebase() {
  if (!FIREBASE_CONFIGURED) { showSetupBanner(); renderBooks(); loadAllCovers(); return; }
  firebase.initializeApp(FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();
  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) subscribeToBorows();
    else {
      if (unsubscribeBorrows) { unsubscribeBorrows(); unsubscribeBorrows = null; }
      borrowStatus = {};
      renderBooks();
    }
  });
  // Handle redirect result for mobile sign-in
  auth.getRedirectResult().catch(err => {
    if (err.code && err.code !== 'auth/no-auth-event') {
      showToast("登入失敗：" + err.message, "error");
    }
  });
  subscribeToBorows();
}

function subscribeToBorows() {
  if (!db) return;
  if (unsubscribeBorrows) unsubscribeBorrows();
  unsubscribeBorrows = db.collection("borrows").onSnapshot(snap => {
    borrowStatus = {};
    snap.forEach(doc => { borrowStatus[doc.id] = doc.data(); });
    renderBooks();
    updateBorrowCount();
  });
}

// ── Auth ────────────────────────────────────────────────────
function isEmbeddedBrowser() {
  return /Line|FBAN|FBAV|Instagram|MicroMessenger|WeChat/i.test(navigator.userAgent);
}
function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function signIn() {
  if (!FIREBASE_CONFIGURED) { showToast("請先完成 Firebase 設定（見 README）", "warn"); return; }
  if (isEmbeddedBrowser()) {
    showToast("請用 Safari 或 Chrome 開啟本頁後再登入", "warn");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  if (isMobileBrowser()) {
    auth.signInWithRedirect(provider)
      .catch(err => showToast("登入失敗：" + err.message, "error"));
  } else {
    auth.signInWithPopup(provider)
      .catch(err => showToast("登入失敗：" + err.message, "error"));
  }
}

function signOut() {
  auth.signOut().then(() => showToast("已登出"));
}

function updateAuthUI() {
  const signinBtn = document.getElementById("signinBtn");
  const bar = document.getElementById("userStatusBar");
  if (currentUser) {
    signinBtn.style.display = "none";
    bar.style.display = "flex";
    document.getElementById("welcomeMsg").innerHTML =
      `<img src="${currentUser.photoURL || ""}" class="avatar" onerror="this.style.display='none'"> 歡迎，${currentUser.displayName || currentUser.email}`;
  } else {
    signinBtn.style.display = "flex";
    bar.style.display = "none";
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
    closeDetailModal();
  } catch (err) { showToast("借閱失敗：" + err.message, "error"); }
}

async function returnBook(bookId) {
  if (!currentUser) return;
  const status = borrowStatus[bookId];
  if (!status || status.borrowedBy !== currentUser.uid) {
    showToast("只能歸還自己借閱的書", "warn"); return;
  }
  try {
    await db.collection("borrow_history").add({
      bookId,
      borrowedBy: status.borrowedBy,
      borrowerName: status.borrowerName || "",
      borrowerPhoto: status.borrowerPhoto || "",
      borrowedAt: status.borrowedAt || null,
      returnedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("borrows").doc(bookId).delete();
    const book = BOOKS.find(b => b.id === bookId);
    showToast(`✓ 已歸還《${book.title}》`);
    closeDetailModal();
  } catch (err) { showToast("歸還失敗：" + err.message, "error"); }
}

// ── Cover Images ────────────────────────────────────────────
async function fetchGoogleCover(book) {
  const q = book.isbn
    ? `isbn:${book.isbn}`
    : encodeURIComponent(book.googleQuery || `${book.title} ${book.author}`);
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const data = await res.json();
    const thumb = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
    if (thumb) return thumb.replace("http:", "https:").replace("zoom=1", "zoom=2");
  } catch (_) {}
  return null;
}

async function loadAllCovers() {
  const tasks = BOOKS.map(async book => {
    if (coverCache[book.id]) {
      applyBookCover(book.id, coverCache[book.id]);
      return;
    }
    // Priority 1: books.com.tw CDN
    if (book.booksTwId) {
      const url = buildBooksTwCover(book.booksTwId);
      coverCache[book.id] = url;
      applyBookCover(book.id, url);
      return;
    }
    // Priority 2: Google Books API
    const url = await fetchGoogleCover(book);
    if (url) {
      coverCache[book.id] = url;
      applyBookCover(book.id, url);
    }
  });
  await Promise.all(tasks);
  localStorage.setItem("bookCovers", JSON.stringify(coverCache));
}

function applyBookCover(bookId, url) {
  document.querySelectorAll(`[data-cover="${bookId}"]`).forEach(img => {
    img.src = url;
    img.style.display = "block";
    const placeholder = img.previousElementSibling;
    if (placeholder && placeholder.classList.contains("cover-placeholder")) {
      placeholder.style.display = "none";
    }
  });
}

// ── Filter ──────────────────────────────────────────────────
function filterBooks(genre) {
  activeFilter = genre;
  currentPage = 1;
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  renderBooks();
  setTimeout(loadAllCovers, 50);
}

// ── Pagination ──────────────────────────────────────────────
function goPage(n) {
  currentPage = n;
  renderBooks();
  setTimeout(loadAllCovers, 50);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPagination(total) {
  const pag = document.getElementById("pagination");
  if (!pag) return;
  const totalPages = Math.ceil(total / BOOKS_PER_PAGE);
  if (totalPages <= 1) { pag.innerHTML = ""; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>← 上一頁</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>下一頁 →</button>`;
  html += `<span class="page-info">第 ${currentPage} / ${totalPages} 頁，共 ${total} 本</span>`;
  pag.innerHTML = html;
}

// ── Render List ─────────────────────────────────────────────
function renderBooks() {
  const list = document.getElementById("booksList");
  const filtered = activeFilter === "all"
    ? BOOKS
    : BOOKS.filter(b => b.tags.includes(activeFilter) || b.category === activeFilter);

  const start = (currentPage - 1) * BOOKS_PER_PAGE;
  const page = filtered.slice(start, start + BOOKS_PER_PAGE);
  list.innerHTML = page.map(book => buildRow(book)).join("");
  renderPagination(filtered.length);
}

function buildRow(book) {
  const status = borrowStatus[book.id];
  const isBorrowed = status && status.borrowedBy;
  const isMyBook = isBorrowed && currentUser && status.borrowedBy === currentUser.uid;

  const badge = isMyBook
    ? `<span class="badge badge-mine">我借閱中</span>`
    : isBorrowed
    ? `<span class="badge badge-out">已借出</span>`
    : `<span class="badge badge-avail">可借閱</span>`;

  const cached = coverCache[book.id];
  const imgHtml = `
    <div class="cover-placeholder" style="background:${book.color}">${book.title.slice(0, 2)}</div>
    <img class="cover-img" data-cover="${book.id}"
         src="${cached || ""}"
         style="display:${cached ? "block" : "none"}"
         onerror="this.style.display='none';this.previousElementSibling.style.display='flex'"
         alt="${book.title} 封面">
  `;

  return `
    <div class="book-row ${isBorrowed && !isMyBook ? "row-unavail" : ""}"
         onclick="showBookDetail('${book.id}')">
      <div class="cover-wrap">${imgHtml}</div>
      <div class="row-info">
        <div class="row-main">
          <h3 class="row-title">${book.title}</h3>
          <p class="row-author">${book.author}</p>
          <div class="row-tags">
            ${book.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join("")}
          </div>
        </div>
        <div class="row-side">
          ${badge}
          <span class="row-cat">${book.category}</span>
        </div>
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
  const borrowedAt = status?.borrowedAt
    ? new Date(status.borrowedAt.seconds * 1000).toLocaleDateString("zh-TW")
    : "";

  let actionBtn = "";
  if (!FIREBASE_CONFIGURED) {
    actionBtn = `<button class="btn-borrow disabled btn-large" disabled>需設定 Firebase</button>`;
  } else if (isMyBook) {
    actionBtn = `<button class="btn-return btn-large" onclick="returnBook('${bookId}')">歸還此書</button>`;
  } else if (isBorrowed) {
    actionBtn = `<button class="btn-borrow disabled btn-large" disabled>目前已被借出（${status.borrowerName || "匿名"}）</button>`;
  } else {
    actionBtn = `<button class="btn-borrow btn-large" onclick="${currentUser ? `borrowBook('${bookId}')` : "signIn()"}">
      ${currentUser ? "立即借閱" : "以 Google 帳號登入借閱"}
    </button>`;
  }

  const coverUrl = coverCache[bookId] || "";

  document.getElementById("modalBookTitle").textContent = book.title;
  document.getElementById("modalBookContent").innerHTML = `
    <div class="detail-top" style="background:${book.color}">
      <div class="detail-cover-wrap">
        <div class="detail-cover-placeholder" style="display:${coverUrl ? "none" : "flex"}">${book.title.slice(0, 2)}</div>
        <img class="detail-cover-img" data-cover="${book.id}"
             src="${coverUrl}"
             style="display:${coverUrl ? "block" : "none"}"
             onerror="this.style.display='none';this.previousElementSibling.style.display='flex'"
             alt="${book.title} 封面">
      </div>
      <div class="detail-meta">
        <p class="detail-author">✍ ${book.author}</p>
        ${book.translator ? `<p class="detail-pub">${book.translator}</p>` : ""}
        <p class="detail-pub">出版：${book.publisher || "—"}</p>
        <div class="row-tags" style="margin-top:8px">
          ${book.tags.map(t => `<span class="tag tag-light">${t}</span>`).join("")}
        </div>
        ${isMyBook && borrowedAt ? `<p class="detail-borrow-date">借閱日期：${borrowedAt}</p>` : ""}
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-highlight">💡 ${book.highlight}</div>
      <h4>內容簡介</h4>
      <p class="detail-summary">${book.summary}</p>
      <div class="detail-action">${actionBtn}</div>
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
          <button class="btn-return btn-sm" onclick="returnBook('${book.id}'); setTimeout(showMyBooks, 600)">歸還</button>
        </div>
      `;
    }).join("");
  }
  document.getElementById("myBooksModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("myBooksModal").style.display = "none";
}

// ── Setup Banner ────────────────────────────────────────────
function showSetupBanner() {
  const banner = document.createElement("div");
  banner.className = "setup-banner";
  banner.innerHTML = `⚙️ <strong>需要設定 Firebase</strong>　請參閱 <a href="README.md" target="_blank">README.md</a> 完成設定，即可啟用 Google 登入與借閱功能。`;
  document.querySelector("main").prepend(banner);
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
  loadAllCovers();
  initFirebase();
});
