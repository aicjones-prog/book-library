const BOOKS = [
  {
    id: "book-01",
    title: "給我40歲的女兒",
    author: "韓星姬",
    translator: "Lou 譯",
    publisher: "商業周刊",
    category: "心理",
    tags: ["心理", "親子", "女性"],
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
    summary: "藏醫師洛桑加參結合傳統藏醫學與現代醫學，分享如何透過心靈修練達到身心健康。書中提供具體的冥想、飲食與生活習慣建議，幫助讀者建立健康的內在醫學觀。護你身心均安的內在醫學，讓身體自癒力覺醒，從根本解決文明病困擾。",
    highlight: "藏傳醫學智慧：啟動身體的自癒能力",
    color: "#2D6A4F"
  },
  {
    id: "book-06",
    title: "心轉病自癒",
    author: "蔡松彥 醫師",
    publisher: "原水文化",
    category: "健康",
    tags: ["健康", "身心", "自癒"],
    summary: "記錄蔡維心的健康逆齡奇蹟，探討正面心態如何影響身體健康。從醫學角度分析身心連結的科學原理，提供真實案例說明意念與情緒對疾病預防和康復的重要性。讓讀者了解維心心理的健康逆齡奇蹟背後的科學與實踐方法。",
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
    summary: "從價值投資到人生決策，啟發巴菲特、蒙格等投資典範的穩健致富金律。探討複利思維如何應用於生活的各個層面，幫助讀者建立長遠眼光，在投資與人生中都能持續成長。本書將投資智慧延伸至自我修練、知識積累與品格養成，是一本難得的身心財富指南。",
    highlight: "複利不只用於理財，更是人生成長的核心法則",
    color: "#374151"
  }
];
