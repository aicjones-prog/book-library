// booksTwId = 博客來產品編號，用於載入封面圖
// isbn      = 國際書號，作為 Google Books API 備援搜尋
const BOOKS = [
  {
    id: "book-01",
    title: "給我40歲的女兒",
    author: "韓星姬",
    translator: "Lou 譯",
    publisher: "商業周刊",
    category: "心理",
    tags: ["心理", "親子", "女性"],
    booksTwId: "0010998401",
    summary: "韓國資深心理諮詢師以母親的身份，寫給正值40歲人生關鍵期的女兒。書中涵蓋婚姻、職場、友誼與自我認同等議題，以溫柔而睿智的筆觸引導讀者在中年的人生岔路口找到方向與勇氣。作者根據多年諮詢經驗整理出38個提醒，幫助走過中年之路的女性重新認識自己、珍視自身的價值。",
    highlight: "38個給中年女性的人生智慧提醒",
    color: "#3B6EA5"
  },
  {
    id: "book-02",
    title: "陪伴心理學",
    author: "黃士鈞（哈克）",
    publisher: "天下文化",
    category: "心理",
    tags: ["心理", "人際", "助人"],
    booksTwId: "0010941911",
    summary: "深入探討人與人之間「陪伴」的藝術，以心理學的角度分析如何真正理解他人的需求，建立深刻而有意義的關係。黃士鈞（哈克）以其豐富的心理諮詢經驗，揭示陪伴不只是在場，而是一種深刻的心靈連結。適合助人工作者及想改善人際關係的所有讀者。",
    highlight: "學習真正「在場」的陪伴藝術",
    color: "#7B3F2E"
  },
  {
    id: "book-03",
    title: "帥過頭傳奇：不想平凡",
    author: "劉豪竑",
    publisher: "水靈文創",
    category: "勵志",
    tags: ["勵志", "傳記", "創業"],
    isbn: "9789869969185",
    summary: "記錄一位不甘平凡的創業者如何突破自我限制，在充滿挑戰的環境中找到成功之道。作者透過親身採訪劉豪竑，呈現他從默默無名到闖出一片天的心路歷程，充滿激勵人心的故事與實用的人生智慧。適合正在尋找人生突破口的讀者。",
    highlight: "從平凡到非凡的真實蛻變故事",
    color: "#2E6B3E"
  },
  {
    id: "book-04",
    title: "自慢（康建全部生命系列 09）",
    author: "楊定一",
    publisher: "天下雜誌",
    category: "心靈",
    tags: ["心靈", "自信", "生命哲學"],
    googleQuery: "自慢 楊定一",
    summary: "楊定一博士帶領讀者重新思考「自信」的本質，探索真正的自我認知如何成為人生的力量。結合東西方哲學與現代科學，揭示生命的深層智慧。書中引導讀者放下外在評價，回歸內心真實的自我，找到屬於自己的定靜之道，在紛亂的世界中安住當下。",
    highlight: "回歸內心，找到真正的自我定靜",
    color: "#4A5568"
  },
  {
    id: "book-05",
    title: "不生病的藏傳煉心術",
    author: "洛桑加參",
    publisher: "天下生活",
    category: "健康",
    tags: ["健康", "藏醫", "身心靈"],
    booksTwId: "0010939508",
    summary: "藏醫師洛桑加參結合傳統藏醫學與現代醫學，分享如何透過心靈修練達到身心健康。書中提供具體的冥想、飲食與生活習慣建議，幫助讀者建立健康的內在醫學觀。護你身心均安的內在醫學，讓身體自癒力覺醒，從根本解決文明病困擾。",
    highlight: "藏傳醫學智慧：啟動身體的自癒能力",
    color: "#2D6A4F"
  },
  {
    id: "book-06",
    title: "心轉，病自癒",
    author: "蔡松彥 醫師",
    publisher: "原水文化",
    category: "健康",
    tags: ["健康", "身心", "自癒"],
    booksTwId: "0010932369",
    summary: "記錄蔡維心的健康逆齡奇蹟，探討正面心態如何影響身體健康。從醫學角度分析身心連結的科學原理，提供真實案例說明意念與情緒對疾病預防和康復的重要性。神經科醫師蔡松彥以五維一心理論揭示身體自癒的深層機制。",
    highlight: "真實案例：心念如何逆轉疾病",
    color: "#2563EB"
  },
  {
    id: "book-07",
    title: "金剛經白話講述",
    author: "王思迅",
    publisher: "橡實文化",
    category: "宗教",
    tags: ["佛學", "宗教", "禪修"],
    googleQuery: "金剛經白話 王思迅",
    summary: "以現代白話文深入淺出地詮釋佛教重要經典《金剛經》，引導讀者理解「放下」的智慧。透過生活化的例子，將古老的佛法智慧轉化為現代人可實踐的人生修行之道。適合對佛學有興趣但不熟悉文言文的讀者，是入門金剛經的絕佳選擇。",
    highlight: "白話解讀金剛經，讓放下成為日常修行",
    color: "#1E40AF"
  },
  {
    id: "book-08",
    title: "The Joys of Compounding",
    author: "Gautam Baid",
    publisher: "Columbia Business School Publishing",
    category: "投資",
    tags: ["投資", "財務", "英文"],
    booksTwId: "F015677746",
    isbn: "9780231197328",
    summary: "A profound exploration of how the principle of compounding applies not just to investments, but to knowledge, relationships, and character. Drawing wisdom from investing legends like Warren Buffett and Charlie Munger, this book offers timeless principles for living a fulfilling and prosperous life. It bridges the gap between investment philosophy and personal development.",
    highlight: "Compounding wisdom: from investing to life philosophy",
    color: "#1D4ED8"
  },
  {
    id: "book-09",
    title: "複利的喜悅",
    author: "Gautam Baid 著 / 高塔姆・白德",
    publisher: "天下雜誌",
    category: "投資",
    tags: ["投資", "財務", "複利"],
    booksTwId: "0010989861",
    summary: "從價值投資到人生決策，啟發巴菲特、蒙格等投資典範的穩健致富金律。探討複利思維如何應用於生活的各個層面，幫助讀者建立長遠眼光，在投資與人生中都能持續成長。本書將投資智慧延伸至自我修練、知識積累與品格養成，是一本難得的身心財富指南。",
    highlight: "複利不只用於理財，更是人生成長的核心法則",
    color: "#374151"
  },

  // ── 第二批書籍 ──────────────────────────────────────────
  {
    id: "book-10",
    title: "一生衣事：訂製未來的自己",
    author: "李卿",
    publisher: "木馬文化（靚點 04）",
    category: "時尚",
    tags: ["時尚", "生活風格", "自我成長"],
    googleQuery: "一生衣事 李卿",
    summary: "時尚不只是穿衣服，更是一種生命態度的展現。作者李卿以多年造型美學經驗出發，引導讀者透過服裝風格的選擇，逐步找到屬於自己的人生定位。書中結合心理學與美學觀點，說明外在形象如何影響內在自信，並提供實用的穿搭哲學，幫助讀者「訂製未來的自己」。",
    highlight: "穿出風格，就是在訂製你的人生劇本",
    color: "#7C9BAE"
  },
  {
    id: "book-11",
    title: "全息人生：富能量",
    author: "大俠武林",
    publisher: "韓情文化（Rich 058）",
    category: "投資",
    tags: ["投資", "財務自由", "存股"],
    booksTwId: "0010953131",
    summary: "投資達人大俠武林分享他如何專注本業、用閒錢投資，以「COVER你一生」為目標的全息理財思維。書中涵蓋股票、存股、被動收入等核心概念，強調用正確的心態和系統化方法，讓普通上班族也能透過投資逐步累積財富，打造股市印鈔機。",
    highlight: "專注本業＋閒錢投資，讓股息 COVER 你一輩子",
    color: "#1E3A5F"
  },
  {
    id: "book-12",
    title: "巴菲特的長勝價值",
    author: "Robert G. Hagstrom 著 / 朱崇旻 譯",
    publisher: "遠流（Yulb 實戰智慧 531）",
    category: "投資",
    tags: ["投資", "巴菲特", "價值投資"],
    booksTwId: "0011000957",
    isbn: "9786263619265",
    summary: "深入剖析「股神」華倫・巴菲特的投資思維與決策哲學。作者 Hagstrom 彙整巴菲特數十年的投資歷程，整理出洞悉最偉大投資人金頭腦的七個核心哲學，包含如何選股、評估企業內在價值、長期持有的耐心等。是想深入了解價值投資者不可錯過的經典之作。",
    highlight: "洞悉巴菲特的7個投資哲學，勝券在握",
    color: "#3D1F0A"
  },
  {
    id: "book-13",
    title: "麥吉爾腰背脊修復手冊",
    author: "Stuart McGill 著",
    publisher: "旗標（Strength and Conditioning 02）",
    category: "健康",
    tags: ["健康", "運動", "復健", "英文"],
    googleQuery: "Back Mechanic Stuart McGill",
    summary: "加拿大脊椎生物力學權威 Stuart McGill 博士的重要著作中文版。書中以科學實證為基礎，教導讀者如何正確評估背痛原因，透過精準的核心訓練動作與生活習慣調整，從根本消除腰背疼痛。內容涵蓋脊椎解剖學基礎、常見錯誤動作解析，以及循序漸進的復健計畫。",
    highlight: "脊椎權威的科學方法，永久告別腰背痛",
    color: "#4A5568"
  },
  {
    id: "book-14",
    title: "剛剛好的優雅：志玲姊姊修養之道",
    author: "林志玲（ChiLing）",
    publisher: "Smart 智富",
    category: "生活",
    tags: ["生活風格", "自我修養", "勵志"],
    booksTwId: "0010924763",
    summary: "林志玲以「剛剛好」為核心理念，分享她在演藝生涯與生活中淬煉出的修養哲學。書中涵蓋如何維持優雅的心態面對壓力、與人相處的溫柔之道，以及在忙碌生活中保持身心平衡的實踐方法。文字真誠溫暖，傳遞一種不過度、不將就的生活美學。",
    highlight: "不過度也不將就——「剛剛好」才是真優雅",
    color: "#C4A0A0"
  },
  {
    id: "book-15",
    title: "超簡單買低賣高投資術",
    author: "孫慶龍",
    publisher: "Smart 智富",
    category: "投資",
    tags: ["投資", "股票", "ETF", "存股"],
    booksTwId: "0010967906",
    summary: "專為投資新手設計的實戰入門書。作者孫慶龍以淺顯易懂的方式，系統化說明如何判斷買低賣高的時機，並整合飆股選股、長期存股與 ETF 被動投資三種策略，讓讀者一次掌握不同市場環境下的應對方法，建立屬於自己的投資系統。",
    highlight: "飆股、存股、ETF 三策略一次學會",
    color: "#B91C1C"
  },
  {
    id: "book-16",
    title: "艾蜜莉教你自動化存股",
    author: "艾蜜莉（陳思聖）",
    publisher: "Smart 智富",
    category: "投資",
    tags: ["投資", "存股", "小資族", "自動化"],
    booksTwId: "0010728435",
    summary: "人氣財經部落客艾蜜莉以自身小資族存股經驗，教導讀者如何建立一套「自動化存股」系統。書中說明如何篩選體質健全的好公司、設定合理買進價格，以及透過紀律執行讓複利自動滾雪球，目標讓小資族也能年化報酬達 15%，逐步邁向財務自由。",
    highlight: "小資族也能靠自動化存股年賺 15%",
    color: "#1E3A5F"
  },
  {
    id: "book-17",
    title: "股息 Cover 我每一天",
    author: "大俠武林",
    publisher: "Smart 智富",
    category: "投資",
    tags: ["投資", "股息", "存股", "財務自由"],
    booksTwId: "0010898998",
    summary: "投資達人大俠武林分享如何透過長期存股累積股息，讓被動收入逐漸覆蓋日常生活開銷，實現「股息 Cover 每一天」的財務自由目標。書中揭示他的選股邏輯、持股心態與面對市場波動的應對策略，是存股族最實用的操作指南。",
    highlight: "用股息覆蓋生活費，讓錢替你工作每一天",
    color: "#D97706"
  },
  {
    id: "book-18",
    title: "清淨的信心",
    author: "聖嚴法師",
    publisher: "法鼓文化（花語文說心 2）",
    category: "宗教",
    tags: ["佛學", "宗教", "心靈", "禪修"],
    googleQuery: "清淨的信心 聖嚴",
    summary: "聖嚴法師以簡明溫潤的語言，引導讀者認識「信心」在佛法修行中的核心地位。書中探討如何在日常生活中培養清淨的信念，放下執著與雜念，讓心回歸平靜與清明。適合對佛法感興趣或尋求內心安定的讀者，文字清淺易懂，充滿實踐智慧。",
    highlight: "以清淨信心為基，讓日常即是修行道場",
    color: "#6B7280"
  }
];

// 根據博客來產品 ID 建構封面 URL
function buildBooksTwCover(id) {
  if (!id) return null;
  const p1 = id.slice(0, 3);
  const p2 = id.slice(3, 6);
  const p3 = id.slice(6, 8);
  return `https://im2.book.com.tw/image/getImage?i=https://www.books.com.tw/img/${p1}/${p2}/${p3}/${id}.jpg&v=1&w=300&h=300`;
}
