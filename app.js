/* 同一張鈔票 互動學習站 — 前端程式（中文／English）
   - 有 SCRIPT_URL：資料經 Google Apps Script 寫入 Google Sheet
   - 沒有 SCRIPT_URL：示範模式，資料存在本機瀏覽器
   - 學生的選擇一律以中文存入 Google Sheet，英文版只翻譯畫面 */
(() => {
  'use strict';
  const CFG = window.FQ_CONFIG || {};
  const ZH = window.FQ, EN = window.FQ_EN || {}, VAL = window.FQ_VAL || {};
  const LIVE = !!String(CFG.SCRIPT_URL || '').trim();
  const WS_METHODS = { 1: [3, 4], 2: [7], 3: [6], 4: [1, 2, 5] };
  const app = document.getElementById('app');
  let timer = null;

  // ---------- 小工具 ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 部分瀏覽器不允許 */ } }
  };
  // 圖片位置：圖片放在網站最外層（如放在 art 資料夾，改為 `art/${k}.jpg`）
  const art = k => `${k}.jpg`;
  const icon = (k, cls = '') => `<img class="ic ${cls}" src="${art(k)}" alt="">`;
  const user = () => store.get('fq_user', null);
  const done = () => store.get('fq_done', {});

  // ---------- 語言 ----------
  let LANG = store.get('fq_lang', 'zh') === 'en' ? 'en' : 'zh';
  const isEN = () => LANG === 'en';
  // 畫面用的內容：英文版把 FQ_EN 的文字蓋在中文結構上
  function content() {
    if (!isEN()) return ZH;
    const c = Object.assign({}, ZH, { title: EN.title, mainline: EN.mainline, motto: EN.motto, methods: EN.methods, path: EN.path, parents: EN.parents,
      contact: Object.assign({}, ZH.contact, EN.contact), feedback: Object.assign({}, ZH.feedback, EN.feedback) });
    c.lessons = {}; Object.keys(ZH.lessons).forEach(n => { c.lessons[n] = Object.assign({}, ZH.lessons[n], (EN.lessons || {})[n]); });
    c.polls = {}; Object.keys(ZH.polls).forEach(k => { c.polls[k] = Object.assign({}, ZH.polls[k], (EN.polls || {})[k]); });
    c.walls = {}; Object.keys(ZH.walls).forEach(k => { c.walls[k] = Object.assign({}, ZH.walls[k], (EN.walls || {})[k]); });
    return c;
  }
  let C = content();
  const v = x => (isEN() && VAL[x]) ? VAL[x] : x; // 顯示中文選項的英文
  const T = {
    zh: {
      brand: '同一張鈔票', demo: '示範模式：資料只存在這部裝置。連接 Google Sheet 後會自動轉為正式模式。',
      home: '首頁', footprint: '我的足跡', parents: '家長角落', group: n => `第${n}組`, groupOpt: n => `第 ${n} 組`,
      before: '👋 開始之前', onlyNick: '只需要組別和暱稱，不用填真實姓名。', myGroup: '我的組別', choose: '請選擇', myNick: '我的暱稱',
      nickPh: '例如：小松鼠', loginErr: '請選擇組別並輸入暱稱。', enter: '進入學習站',
      badges: n => `🌱 我的七法徽章（${n}／7）`, badgeTip: '完成每一堂的工作紙，就會解鎖該堂的綠色理財法徽章。',
      done: '✓ 完成', go: '進入 ›', lessonNo: n => `第 ${n} 堂`, nodes: '今堂四個概念', methods: '今堂綠色理財法',
      myNote: '📌 我在第 1 堂寫的 $100 便利貼', loading: '載入中…', noNote: '找不到第 1 堂的便利貼（可能用了另一個暱稱）。',
      poll: '🗳 投票', phaseVote: ph => `${v(ph)}投票`, afterVote: '投票後可以看到全班結果。', votes: n => `全班 ${n} 票`, nVotes: n => `${n} 票`, nPeople: n => `${n} 人`,
      wall: '🗒 留言牆', wallPh: '寫下你的想法', post: '貼上', refresh: '↻ 更新', emptyWall: '還沒有留言，做第一個吧！', needText: '請先寫下內容。',
      postFail: '貼上失敗', voteFail: '投票失敗，請再試。', fill: ws => `📝 填寫 ${ws}`,
      wsNote: '所有金額均為課堂模擬。填寫中的內容會自動儲存在這部裝置。', submit: '提交到 Google Sheet ➜', sending: '提交中…',
      resubmit: '再次提交（會更新之前的答案）', subFail: '提交失敗，請再試。', subOk: '已提交！你解鎖了徽章：', net: '連線失敗，請檢查網絡後再試。',
      // W1
      w1cards: '6 張用途卡', card: '用途卡', price: '價格（模擬）', why: '為甚麼值得？', useful: '有用', important: '重要',
      w1rank: '排出最值得的次序', has100: '有 $100 時', has50: '只得 $50 時', cutFirst: '只得 $50 時，我最先刪去', because: '因為',
      bottle: '壞了的水樽：修，還是換？', reason: '理由', mySentence: '我的一句', priceIs: '價格是…', valueIs: '價值是…',
      up: '上移', down: '下移', errFix: '請選擇水樽要「修」還是「換」。', errSentence: '請完成「我的一句」。',
      // W2
      shop: '小店收支表', round: '輪次', r1: '第一輪', r2: '第二輪', income: '任務收入', cost: '技能卡支出', netInc: '淨收入',
      diff: '兩輪相差：', tokens: '代幣', whyMore: '第二輪賺得更多／更少，是因為', effort: '我們付出了甚麼才賺到？',
      jobQ: '這份工作為別人解決了甚麼問題？', job: '工作', jobTime: '要付出的時間', jobSkill: '需要的技能', jobSolve: '解決的問題',
      plan: '我的技能成長計劃', mySkill: '我想提升的技能', firstStep: '我的第一步', otherSkill: '另一組介紹的「最值得學的技能」',
      errIncome: '請填寫兩輪的任務收入。', errSkill: '請填寫想提升的技能和第一步。',
      // W3
      goal: '我的 SMART 目標', inW: '在', weeksSave: '星期內儲 $', useFor: '，用來', partner: '儲蓄夥伴互查：每符合一項就打 ✓',
      smart: [['S', '具體'], ['M', '可量度'], ['A', '做得到'], ['R', '相關'], ['T', '有期限']],
      record: '八星期收支記錄（每週收入 $20）', wk: '週', save: '儲蓄', spend: '消費', emerg: '緊急儲備', bal: '結餘', event: '事件卡', decision: '我的決定',
      totals: (a, b, c, r) => `累積儲蓄 <b>$${a}</b>｜消費 <b>$${b}</b>｜緊急儲備 <b>$${c}</b>｜達標率 <b>${r}%</b>`,
      hold: '一次「忍住不買」的理由', errGoal: '請寫好 SMART 目標的金額和用途。', errNeg: w => `第 ${w} 週的結餘是負數，請再檢查。`,
      // W4
      compare: '貨比三家表', needWant: '需要？想要？', canBorrow: '可否借或共用？', shopX: k => `店 ${k}`, myDecision: '我的決定',
      cheapest: (k, p) => `最便宜：店 ${k}（$${p}）。但最便宜就最值得嗎？`, changed: '條件改變時，我的答案在甚麼時候改變了？',
      threeQ: '我的購買前三問', qN: i => `第 ${i} 問`, rule: '四堂足跡：我的一個生活原則', rulePh: '我的生活原則',
      errDec: s => `請為「${s}」作出決定。`, errQ: '請寫好購買前三問。', errRule: '請寫下你的一個生活原則。',
      // footprint / parents
      fpTitle: '我的四堂足跡', fpHope: '最終，我們希望學生…', notYet: ws => `還沒有提交 ${ws}。`,
      fp1: r => `價格是 ${r['價格是']}，價值是 ${r['價值是']}。`, fp2: r => `我想提升：${r['想提升的技能']}｜第一步：${r['第一步']}`,
      fp3: r => `目標：$${r['目標金額']} ${r['目標用途']}｜達標率 ${r['達標率']}%`, fp4: r => `生活原則：${r['生活原則']}`,
      pTitle: '家長角落', pSub: '給父母的話', pLook: '看看孩子寫了甚麼', childNick: '孩子的暱稱', view: '查看', needChild: '請輸入孩子的暱稱。',
      pGoal: '儲蓄目標：', pRate: r => `（達標率 ${r}%）`, pQ: '購買前三問：', pRule: '生活原則：', pNone: '暫時未有紀錄，請確認組別和暱稱。', books: '延伸讀物',
      // teacher
      tLesson: i => `第 ${i} 堂`, qr: 'QR 碼', tConsole: t => `導師控制台｜${t}`, every: s => `每 ${s} 秒自動更新`, updated: t => `最後更新 ${t}`,
      submitted: ws => `📝 ${ws} 提交`, copies: n => `${n} 份`, rank100: '💰 $100 平均排序（越長＝越被重視）', rank50: '💵 只得 $50 時的平均排序', rankN: m => `第 ${m}`,
      fixQ: '🔧 壞了的水樽：修還是換？', shopNet: '🏪 各組小店淨收入（第一輪／第二輪）', skills: '💡 想提升的技能', rates: '🐷 各組平均達標率',
      events: '📩 事件卡決定統計', times: n => `${n} 次`, decisions: '🛍 買／不買／等等看', rules: '🌱 生活原則（匿名）', noWall: '未有留言',
      wa: 'WhatsApp 課程查詢', waCard: '💬 課程查詢', waText: '想了解課程詳情、上課時間或報名，歡迎 WhatsApp 查詢。', waBtn: 'WhatsApp 查詢',
      fbTitle: '📝 課後家長評估表', fbIntro: '上完四堂課後，請花約 2 分鐘告訴我們孩子有沒有改變。你的意見會用來改善課程。',
      fbChild: '孩子的暱稱（可不填）', fbScale: '每項請分別評「上課前」和「現在」：1＝從不，3＝有時，5＝經常。',
      fbBefore: '上課前', fbAfter: '現在', fbSat: '整體來說，你對課程的滿意度？（1＝很不滿意，5＝很滿意）', fbRec: '你會推薦這個課程給其他家長嗎？',
      fbChange: '孩子最明顯的一個改變（可舉一個生活例子）', fbSuggest: '課程可以改善的地方', fbConsent: '我同意課程以匿名方式引用我的意見',
      fbSend: '提交評估表', fbErr: '請為每一項選擇「上課前」和「現在」的分數，並回答滿意度及推薦。', fbOk: '謝謝你的意見！我們會用來改善課程。',
      fbTab: '家長回饋', fbDash: '導師控制台｜家長回饋', fbCount: '📝 評估表份數', fbChangeT: '📈 孩子的改變（平均分：上課前 → 現在）',
      fbSatT: '⭐ 整體滿意度（平均）', fbRecT: '👍 會推薦給其他家長嗎？', fbChgT: '🌱 孩子最明顯的改變', fbSugT: '🔧 改善建議', fbNone: '未有家長提交評估表'
    },
    en: {
      brand: 'One Banknote', demo: 'Demo mode: data is saved on this device only. It switches to live mode once Google Sheet is connected.',
      home: 'Home', footprint: 'My journey', parents: 'For parents', group: n => `Group ${n}`, groupOpt: n => `Group ${n}`,
      before: '👋 Before you start', onlyNick: 'Just your group and a nickname. No real names needed.', myGroup: 'My group', choose: 'Choose', myNick: 'My nickname',
      nickPh: 'Squirrel', loginErr: 'Choose your group and enter a nickname.', enter: 'Enter',
      badges: n => `🌱 My green money badges (${n}/7)`, badgeTip: 'Finish each lesson’s worksheet to unlock that lesson’s green money badges.',
      done: '✓ Done', go: 'Open ›', lessonNo: n => `Lesson ${n}`, nodes: 'Four ideas in this lesson', methods: 'Green money methods',
      myNote: '📌 My $100 sticky note from Lesson 1', loading: 'Loading…', noNote: 'No Lesson 1 sticky note found. You may have used another nickname.',
      poll: '🗳 Vote', phaseVote: ph => `${v(ph)} vote`, afterVote: 'Vote to see the class results.', votes: n => `${n} vote${n === 1 ? '' : 's'} from the class`, nVotes: n => `${n} vote${n === 1 ? '' : 's'}`, nPeople: n => `${n}`,
      wall: '🗒 Sticky-note wall', wallPh: 'Write your idea', post: 'Post', refresh: '↻ Refresh', emptyWall: 'No notes yet. Be the first!', needText: 'Write something first.',
      postFail: 'Couldn’t post. Try again.', voteFail: 'Couldn’t vote. Try again.', fill: ws => `📝 Fill in ${ws}`,
      wsNote: 'All amounts are pretend money for class. Your answers are saved on this device as you type.', submit: 'Submit to Google Sheet ➜', sending: 'Submitting…',
      resubmit: 'Submit again (updates your answers)', subFail: 'Couldn’t submit. Try again.', subOk: 'Submitted! You unlocked:', net: 'Couldn’t connect. Check your internet and try again.',
      w1cards: 'Six spending cards', card: 'Card', price: 'Price (pretend)', why: 'Why is it worth it?', useful: 'Useful', important: 'Important',
      w1rank: 'Rank them from most to least worth it', has100: 'With $100', has50: 'With only $50', cutFirst: 'With only $50, I’d drop this first', because: 'Because',
      bottle: 'A broken water bottle: repair or replace?', reason: 'Reason', mySentence: 'My sentence', priceIs: 'Price is…', valueIs: 'Value is…',
      up: 'Move up', down: 'Move down', errFix: 'Choose whether to repair or replace the bottle.', errSentence: 'Finish “My sentence”.',
      shop: 'Shop income and costs', round: 'Round', r1: 'Round 1', r2: 'Round 2', income: 'Task income', cost: 'Skill card cost', netInc: 'Net income',
      diff: 'Difference between rounds: ', tokens: 'tokens', whyMore: 'We earned more or less in Round 2 because', effort: 'What did we put in to earn it?',
      jobQ: 'What problem does this job solve for others?', job: 'Job', jobTime: 'Time it takes', jobSkill: 'Skills needed', jobSolve: 'Problem it solves',
      plan: 'My skill growth plan', mySkill: 'A skill I want to build', firstStep: 'My first step', otherSkill: 'The “most worth learning” skill another group shared',
      errIncome: 'Fill in the task income for both rounds.', errSkill: 'Fill in your skill and first step.',
      goal: 'My SMART goal', inW: 'In', weeksSave: 'weeks, save $', useFor: 'for', partner: 'Savings partner check: tick each one it meets.',
      smart: [['S', 'Specific'], ['M', 'Measurable'], ['A', 'Achievable'], ['R', 'Relevant'], ['T', 'Time-bound']],
      record: 'Eight-week money record ($20 income a week)', wk: 'Wk', save: 'Save', spend: 'Spend', emerg: 'Emergency', bal: 'Left', event: 'Event card', decision: 'My choice',
      totals: (a, b, c, r) => `Saved <b>$${a}</b> · Spent <b>$${b}</b> · Emergency <b>$${c}</b> · Goal reached <b>${r}%</b>`,
      hold: 'One time I held back from buying, and why', errGoal: 'Fill in the amount and purpose of your SMART goal.', errNeg: w => `Week ${w} has a negative balance. Check it again.`,
      compare: 'Compare three shops', needWant: 'Need or want?', canBorrow: 'Could I borrow or share it?', shopX: k => `Shop ${k}`, myDecision: 'My choice',
      cheapest: (k, p) => `Cheapest: Shop ${k} ($${p}). But is the cheapest always the best value?`, changed: 'When the situation changed, when did my answer change?',
      threeQ: 'My three questions before buying', qN: i => `Question ${i}`, rule: 'My four-lesson journey: one rule I’ll live by', rulePh: 'My rule',
      errDec: s => `Make a choice for “${s}”.`, errQ: 'Write all three questions.', errRule: 'Write one rule you’ll live by.',
      fpTitle: 'My four-lesson journey', fpHope: 'In the end, we hope you can…', notYet: ws => `${ws} not submitted yet.`,
      fp1: r => `Price is ${r['價格是']}; value is ${r['價值是']}.`, fp2: r => `Skill to build: ${r['想提升的技能']} · First step: ${r['第一步']}`,
      fp3: r => `Goal: $${r['目標金額']} for ${r['目標用途']} · ${r['達標率']}% reached`, fp4: r => `My rule: ${r['生活原則']}`,
      pTitle: 'For parents', pSub: 'A note for parents', pLook: 'See what your child wrote', childNick: 'Your child’s nickname', view: 'View', needChild: 'Enter your child’s nickname.',
      pGoal: 'Savings goal: ', pRate: r => ` (${r}% reached)`, pQ: 'Three questions before buying:', pRule: 'Rule to live by: ', pNone: 'No records yet. Check the group and nickname.', books: 'Further reading',
      tLesson: i => `Lesson ${i}`, qr: 'QR code', tConsole: t => `Teacher console · ${t}`, every: s => `Refreshes every ${s} seconds`, updated: t => `Last updated ${t}`,
      submitted: ws => `📝 ${ws} submitted`, copies: n => `${n}`, rank100: '💰 Average $100 ranking (longer = valued more)', rank50: '💵 Average ranking with only $50', rankN: m => `#${m}`,
      fixQ: '🔧 Broken water bottle: repair or replace?', shopNet: '🏪 Shop net income by group (Round 1 / Round 2)', skills: '💡 Skills students want to build', rates: '🐷 Average goal reached by group',
      events: '📩 Event card choices', times: n => `${n}`, decisions: '🛍 Buy, don’t buy or wait', rules: '🌱 Rules to live by (anonymous)', noWall: 'No notes yet',
      wa: 'Ask on WhatsApp', waCard: '💬 Course enquiries', waText: 'For course details, class times or sign-up, message us on WhatsApp.', waBtn: 'Ask on WhatsApp',
      fbTitle: '📝 Parent feedback form', fbIntro: 'After the four lessons, take about 2 minutes to tell us whether your child has changed. We use your answers to improve the course.',
      fbChild: 'Your child’s nickname (optional)', fbScale: 'Rate each item twice, for before the course and now: 1 = never, 3 = sometimes, 5 = often.',
      fbBefore: 'Before', fbAfter: 'Now', fbSat: 'Overall, how satisfied are you with the course? (1 = very unsatisfied, 5 = very satisfied)', fbRec: 'Would you recommend this course to other parents?',
      fbChange: 'The clearest change in your child (an everyday example helps)', fbSuggest: 'What could the course do better?', fbConsent: 'You may quote my comments anonymously',
      fbSend: 'Send feedback', fbErr: 'Choose a before and now score for every item, and answer the satisfaction and recommend questions.', fbOk: 'Thank you. Your feedback will help us improve the course.',
      fbTab: 'Parent feedback', fbDash: 'Teacher console · Parent feedback', fbCount: '📝 Forms received', fbChangeT: '📈 Change in children (average: before → now)',
      fbSatT: '⭐ Overall satisfaction (average)', fbRecT: '👍 Would recommend to other parents?', fbChgT: '🌱 Clearest changes', fbSugT: '🔧 Suggestions', fbNone: 'No parent feedback yet'
    }
  };
  const t = k => T[LANG][k];
  const SEP = () => isEN() ? ' · ' : '｜';
  const COL = () => isEN() ? ': ' : '：';
  function applyLang() {
    document.documentElement.lang = isEN() ? 'en' : 'zh-Hant';
    document.title = C.title;
  }
  function setLang(l) { LANG = l; store.set('fq_lang', l); C = content(); applyLang(); route(); }

  // ---------- 示範模式後端（邏輯與 Code.gs 相同）----------
  const Demo = {
    db() { return store.get('fq_demo', { W1: [], W2: [], W3: [], W4: [], votes: [], walls: [], open: { 1: true, 2: true, 3: true, 4: true } }); },
    save(d) { store.set('fq_demo', d); },
    strip(r) { const o = Object.assign({}, r); delete o['暱稱']; return o; },
    handle(q) {
      const d = this.db(); const now = new Date().toISOString();
      const mine = r => String(r['組別']) === String(q.group) && r['暱稱'] === q.nick;
      switch (q.action) {
        case 'config': return { ok: true, open: d.open };
        case 'submit': {
          const tb = d[q.sheet]; const row = Object.assign({ '時間': now, '組別': q.group, '暱稱': q.nick }, q.data);
          const i = tb.findIndex(mine); if (i >= 0) tb[i] = row; else tb.push(row);
          this.save(d); return { ok: true };
        }
        case 'vote': {
          const row = { '時間': now, '堂': q.lesson, '投票': q.poll, '階段': q.phase, '組別': q.group, '暱稱': q.nick, '選擇': q.choice };
          const i = d.votes.findIndex(x => mine(x) && x['投票'] === q.poll && x['階段'] === q.phase);
          if (i >= 0) d.votes[i] = row; else d.votes.push(row);
          this.save(d); return { ok: true };
        }
        case 'wall':
          d.walls.push({ '時間': now, '堂': q.lesson, '牆': q.wall, '組別': q.group, '暱稱': q.nick, '內容': String(q.text).slice(0, 200) });
          this.save(d); return { ok: true };
        case 'summary': {
          const L = String(q.lesson);
          return { ok: true, rows: d['W' + L].map(this.strip), votes: d.votes.filter(x => String(x['堂']) === L).map(this.strip), walls: d.walls.filter(w => String(w['堂']) === L).map(this.strip) };
        }
        case 'feedback': {
          d.fb = d.fb || [];
          d.fb.push(Object.assign({ '時間': now, '孩子組別': q.group || '', '孩子暱稱': q.nick || '' }, q.data));
          this.save(d); return { ok: true };
        }
        case 'feedbackList': return { ok: true, rows: (d.fb || []).map(r => { const o = Object.assign({}, r); delete o['孩子暱稱']; return o; }) };
        case 'mine': {
          const out = { ok: true, walls: d.walls.filter(mine), votes: d.votes.filter(mine) };
          ['W1', 'W2', 'W3', 'W4'].forEach(k => { out[k] = d[k].find(mine) || null; });
          return out;
        }
      }
      return { ok: false, error: 'unknown action' };
    }
  };

  // ---------- 連接 Google Apps Script ----------
  async function api(q) {
    if (!LIVE) return Demo.handle(q);
    try {
      let r;
      if (['config', 'summary', 'mine', 'feedbackList'].includes(q.action)) {
        const u = new URL(CFG.SCRIPT_URL);
        Object.keys(q).forEach(k => u.searchParams.set(k, q[k]));
        r = await fetch(u.toString());
      } else {
        // 用 text/plain 送出，避免瀏覽器的 CORS 預檢
        r = await fetch(CFG.SCRIPT_URL, { method: 'POST', body: JSON.stringify(q) });
      }
      const j = await r.json();
      if (!j.ok && isEN()) j.error = t('net');
      return j;
    } catch (e) {
      return { ok: false, error: t('net') };
    }
  }
  const withUser = q => { const u = user(); return Object.assign({ group: u.group, nick: u.nick }, q); };

  // ---------- 版面 ----------
  function shell(body, opts = {}) {
    const u = user();
    // 每一頁有自己的顏色世界：首頁黃、各堂用該堂顏色、足跡綠、家長粉紅
    document.body.className = 'th ' + (opts.theme || 'th-home');
    const nav = opts.noNav ? '' : `<nav class="nav">
      ${[['home', '🏠'], ['footprint', '👣'], ['parents', '👪']].map(([h, i]) =>
        `<a href="#/${h}" class="${opts.on === h ? 'on' : ''}"><i>${i}</i>${t(h)}</a>`).join('')}</nav>`;
    app.innerHTML = `
      <header class="top"><a href="#/home">${esc(t('brand'))}</a><span class="sp"></span>
        <button class="chip" id="lang" aria-label="Language">${isEN() ? '中文' : 'EN'}</button>
        ${u && !opts.noUser ? `<button class="chip" id="who">${esc(t('group')(u.group))}${SEP()}${esc(u.nick)}</button>` : ''}</header>
      ${LIVE ? '' : `<div class="demo">${esc(t('demo'))}</div>`}
      <main class="wrap ${opts.wide ? 'wide' : ''}">${body}</main>${nav}${opts.wa ? `<a class="wa" href="${waLink()}" target="_blank" rel="noopener">${WA_ICON}<span>${esc(t('wa'))}</span></a>` : ''}`;
    $('#lang').onclick = () => setLang(isEN() ? 'zh' : 'en');
    const who = $('#who');
    if (who) who.onclick = () => { store.set('fq_user', null); location.hash = '#/login'; route(); };
    window.scrollTo(0, 0);
  }
  // WhatsApp 課程查詢
  const WA_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z"/></svg>';
  const waLink = () => `https://wa.me/${(C.contact || {}).whatsapp || ''}?text=${encodeURIComponent((C.contact || {}).msg || '')}`;
  const hero = (title, sub) => `<section class="hero"><div class="t"><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><img src="${art('kids')}" alt=""></section>`;

  // ---------- 登入 ----------
  function pageLogin() {
    const groups = Array.from({ length: CFG.GROUPS || 4 }, (_, i) => i + 1);
    shell(`${hero(C.title, C.mainline)}
      <section class="card"><h2>${t('before')}</h2>
        <p class="muted">${esc(t('onlyNick'))}</p>
        <div class="field"><label>${t('myGroup')}</label><select id="g"><option value="">${t('choose')}</option>${groups.map(g => `<option value="${g}">${t('groupOpt')(g)}</option>`).join('')}</select></div>
        <div class="field"><label>${t('myNick')}</label><input class="in" id="nk" maxlength="12" placeholder="${esc(t('nickPh'))}"></div>
        <div class="err" id="er"></div>
        <button class="btn full" id="go">${t('enter')}</button>
      </section>`, { noNav: true, noUser: true, wa: true });
    $('#nk').oninput = () => { $('#er').textContent = ''; };
    $('#go').onclick = () => {
      const g = $('#g').value, n = $('#nk').value.replace(/^[=+\-@]+/, '').trim();
      if (!g || !n) { $('#er').textContent = t('loginErr'); return; }
      store.set('fq_user', { group: g, nick: n });
      if (location.hash === '#/home') route(); else location.hash = '#/home';
    };
  }

  // ---------- 首頁 ----------
  function badgesHtml(d) {
    const got = new Set(); Object.keys(d).forEach(w => (WS_METHODS[w] || []).forEach(m => got.add(m)));
    return { n: got.size, html: `<div class="badges">${[1, 2, 3, 4, 5, 6, 7].map(m => `<span title="${esc(C.methods[m].name)}">${icon('g' + m, got.has(m) ? '' : 'off')}</span>`).join('')}</div>` };
  }
  async function pageHome() {
    const d = done(); const b = badgesHtml(d);
    shell(`${hero(C.title, C.mainline)}
      <section class="card" style="--c:var(--g);--cb:var(--gb)"><h2>${t('badges')(b.n)}</h2>${b.html}
        <p class="muted" style="margin-top:6px">${esc(t('badgeTip'))}</p></section>
      <div id="lessons">${[1, 2, 3, 4].map(n => lessonCard(n, d, true)).join('')}</div>
      <div class="gold">${quote(C.motto)}</div>`, { on: 'home', wa: true });
    const cfg = await api({ action: 'config' });
    if (cfg.ok && $('#lessons')) $('#lessons').innerHTML = [1, 2, 3, 4].map(n => lessonCard(n, d, !!cfg.open[n])).join('');
    // 同步已提交紀錄（換裝置也能看到徽章）
    const m = await api(withUser({ action: 'mine' }));
    if (m.ok) {
      const nd = {}; [1, 2, 3, 4].forEach(n => { if (m['W' + n]) nd[n] = true; });
      store.set('fq_done', Object.assign(d, nd));
    }
  }
  const quote = s => isEN() ? `“${esc(s)}”` : `「${esc(s)}」`;
  function lessonCard(n, d, open) {
    const L = C.lessons[n];
    const tag = d[n] ? t('done') : open ? t('go') : '🔒';
    return `<a class="lesson-card ${L.cls} ${open ? '' : 'locked'}" href="#/lesson/${n}"><img src="${art('m' + n)}" alt="">
      <div class="tx"><b>${n}. ${esc(L.title)}</b><small>${esc(L.domain)}${SEP()}${esc(L.ws)}</small></div><span class="tag">${tag}</span></a>`;
  }

  // ---------- 單元頁 ----------
  function banner(n, sub) {
    const L = C.lessons[n];
    return `<section class="ban"><div class="t"><span class="no">${t('lessonNo')(n)}${SEP()}${esc(L.domain)}</span><h1>${esc(sub || L.title)}</h1><p>${esc(L.en)}</p></div><img src="${art('m' + n)}" alt=""></section>`;
  }
  async function pageLesson(n) {
    const L = C.lessons[n]; if (!L) return pageHome();
    const polls = Object.entries(C.polls).filter(([, p]) => p.lesson === n);
    const walls = Object.entries(C.walls).filter(([, w]) => w.lesson === n);
    shell(`<div class="${L.cls}">
      ${banner(n)}
      <section class="card"><h2><span class="n">1</span>${t('nodes')}</h2>
        <div class="grid2">${L.nodes.map(([a, b]) => `<div class="node"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div></section>
      <section class="card"><h2><span class="n">2</span>${t('methods')}</h2>
        ${L.methods.map(m => `<div class="method">${icon('g' + m)}<div><b>${esc(C.methods[m].name)}</b><br><span>${esc(C.methods[m].q)}</span></div></div>`).join('')}</section>
      ${n === 4 ? `<section class="card"><h2>${t('myNote')}</h2><div id="mynote" class="muted">${t('loading')}</div></section>` : ''}
      ${polls.map(([id, p]) => pollBlock(id, p)).join('')}
      ${walls.map(([id, w]) => wallBlock(id, w)).join('')}
      <a class="btn c full" style="display:block;text-align:center;text-decoration:none" href="#/ws/${n}">${esc(t('fill')(L.ws))}</a>
      <div class="gold">${quote(L.gold)}</div></div>`, { theme: L.cls });
    bindLesson(n);
  }
  function pollBlock(id, p) {
    return `<section class="card" data-poll="${id}"><h2>${t('poll')}</h2><p style="font-weight:700">${esc(p.q)}</p>
      ${p.phases.map(ph => `<div class="field"><div class="muted">${p.phases.length > 1 ? esc(t('phaseVote')(ph)) : ''}</div>
        ${p.options.map(o => `<button class="opt" data-ph="${esc(ph)}" data-o="${esc(o)}">${esc(v(o))}</button>`).join('')}</div>`).join('')}
      <div class="pres" style="margin-top:10px"></div></section>`;
  }
  function wallBlock(id, w) {
    return `<section class="card" data-wall="${id}"><h2>${t('wall')}</h2><p style="font-weight:700">${esc(w.q)}</p>
      <div class="row field"><input class="in" style="flex:1" maxlength="80" placeholder="${esc(t('wallPh'))}"><button class="btn sm c">${t('post')}</button></div>
      <div class="err"></div><div class="wall"></div><button class="btn sm ghost refresh" style="margin-top:10px">${t('refresh')}</button></section>`;
  }
  const noteHtml = w => `<div class="note">${esc(w['內容'])}${w['組別'] ? `<small>${esc(t('group')(w['組別']))}</small>` : ''}</div>`;
  async function bindLesson(n) {
    const myVotes = store.get('fq_votes', {});
    const load = async () => {
      const s = await api({ action: 'summary', lesson: n });
      if (!s.ok) return;
      $$('[data-wall]').forEach(el => {
        const items = s.walls.filter(w => w['牆'] === el.dataset.wall).slice(-60).reverse();
        $('.wall', el).innerHTML = items.length ? items.map(noteHtml).join('') : `<span class="muted">${t('emptyWall')}</span>`;
      });
      $$('[data-poll]').forEach(el => {
        const p = C.polls[el.dataset.poll];
        const voted = p.phases.some(ph => myVotes[el.dataset.poll + '|' + ph]);
        if (!voted) { $('.pres', el).innerHTML = `<span class="muted">${t('afterVote')}</span>`; return; }
        $('.pres', el).innerHTML = p.phases.map(ph => {
          const vs = s.votes.filter(x => x['投票'] === el.dataset.poll && x['階段'] === ph);
          if (!vs.length) return '';
          return `<div class="muted" style="margin-top:6px">${p.phases.length > 1 ? esc(v(ph)) + ' · ' : ''}${t('votes')(vs.length)}</div>` +
            p.options.map(o => { const c = vs.filter(x => x['選擇'] === o).length; return `<div class="brow"><span>${esc(v(o))}</span><div class="bar"><i style="width:${Math.round(c / vs.length * 100)}%"></i></div><span>${t('nVotes')(c)}</span></div>`; }).join('');
        }).join('');
      });
    };
    $$('[data-poll]').forEach(el => {
      const id = el.dataset.poll;
      $$('.opt', el).forEach(b => {
        if (myVotes[id + '|' + b.dataset.ph] === b.dataset.o) b.classList.add('on');
        b.onclick = async () => {
          const r = await api(withUser({ action: 'vote', lesson: n, poll: id, phase: b.dataset.ph, choice: b.dataset.o }));
          if (!r.ok) { $('.pres', el).innerHTML = `<p class="err">${esc(r.error || t('voteFail'))}</p>`; return; }
          $$('.opt', el).filter(x => x.dataset.ph === b.dataset.ph).forEach(x => x.classList.remove('on')); b.classList.add('on');
          myVotes[id + '|' + b.dataset.ph] = b.dataset.o; store.set('fq_votes', myVotes); load();
        };
      });
    });
    $$('[data-wall]').forEach(el => {
      const inp = $('input', el), er = $('.err', el);
      $('.btn.c', el).onclick = async () => {
        const text = inp.value.trim();
        if (!text) { er.textContent = t('needText'); return; }
        er.textContent = '';
        const r = await api(withUser({ action: 'wall', lesson: n, wall: el.dataset.wall, text }));
        if (!r.ok) { er.textContent = r.error || t('postFail'); return; }
        inp.value = ''; load();
      };
      inp.oninput = () => { er.textContent = ''; };
      $('.refresh', el).onclick = load;
    });
    if (n === 4) {
      const m = await api(withUser({ action: 'mine' }));
      const notes = m.ok ? m.walls.filter(w => w['牆'] === 'L1_100') : [];
      if ($('#mynote')) $('#mynote').innerHTML = notes.length ? `<div class="wall">${notes.map(w => `<div class="note">${esc(w['內容'])}</div>`).join('')}</div>` : esc(t('noNote'));
    }
    load();
  }

  // ---------- 工作紙 ----------
  const draftKey = n => `fq_draft_${n}_${user().group}_${user().nick}`;
  function saveDraft(n, extra) {
    const f = {}; $$('#ws [name]').forEach(el => { f[el.name] = el.type === 'checkbox' ? el.checked : el.type === 'radio' ? (el.checked ? el.value : f[el.name]) : el.value; });
    store.set(draftKey(n), Object.assign(f, extra || {}));
  }
  function loadDraft(n) {
    const f = store.get(draftKey(n), {});
    $$('#ws [name]').forEach(el => {
      if (!(el.name in f)) return;
      if (el.type === 'checkbox') el.checked = !!f[el.name];
      else if (el.type === 'radio') el.checked = f[el.name] === el.value;
      else el.value = f[el.name];
    });
    return f;
  }
  // 選項的 value 用中文（存入 Sheet），畫面文字按語言顯示
  const radio = (name, opts) => opts.map(o => `<label class="pill"><input type="radio" name="${name}" value="${esc(o)}">${esc(v(o))}</label>`).join('');
  const sel = (name, opts, ph) => `<select name="${name}"><option value="">${esc(ph || t('choose'))}</option>${opts.map(o => `<option value="${esc(o)}">${esc(v(o))}</option>`).join('')}</select>`;
  const val = n => ($(`#ws [name="${n}"]`) || {}).value || '';

  function pageWS(n) {
    const L = C.lessons[n]; if (!L) return pageHome();
    const forms = { 1: W1, 2: W2, 3: W3, 4: W4 };
    const F = forms[n];
    shell(`<div class="${L.cls}">${banner(n, L.ws)}
      <p class="muted" style="margin-top:8px">${esc(t('wsNote'))}</p>
      <form id="ws" onsubmit="return false">${F.html()}</form>
      <div class="err" id="wserr"></div>
      <button class="btn c full" id="send">${t('submit')}</button>
      <div id="wsok"></div>
      <div class="gold">${quote(L.gold)}</div></div>`, { theme: L.cls });
    const f = loadDraft(n);
    F.bind && F.bind(f);
    const changed = () => { $('#wserr').textContent = ''; F.calc && F.calc(); saveDraft(n, F.extra && F.extra()); };
    $('#ws').addEventListener('input', changed);
    $('#ws').addEventListener('change', changed);
    F.calc && F.calc();
    $('#send').onclick = async () => {
      const res = F.collect();
      if (res.error) { $('#wserr').textContent = res.error; return; }
      $('#send').disabled = true; $('#send').textContent = t('sending');
      const r = await api(withUser({ action: 'submit', sheet: 'W' + n, data: res.data }));
      $('#send').disabled = false; $('#send').textContent = t('resubmit');
      if (!r.ok) { $('#wserr').textContent = r.error || t('subFail'); return; }
      const d = done(); d[n] = true; store.set('fq_done', d);
      $('#wsok').innerHTML = `<div class="okmsg">${t('subOk')}</div><div class="badges" style="margin-top:8px">${WS_METHODS[n].map(m => icon('g' + m)).join('')}</div>`;
      $('#wsok').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // W1《我的 $100》
  const W1 = (() => {
    let r100 = ZH.useCards.slice(), r50 = ZH.useCards.slice();
    const list = (id, arr) => `<ol class="rank" id="${id}">${arr.map((c, i) => `<li><b>${i + 1}</b><span>${esc(v(c))}</span><button type="button" data-l="${id}" data-i="${i}" data-d="-1" aria-label="${t('up')}">▲</button><button type="button" data-l="${id}" data-i="${i}" data-d="1" aria-label="${t('down')}">▼</button></li>`).join('')}</ol>`;
    return {
      html: () => `
        <section class="card"><h2><span class="n">1</span>${t('w1cards')}</h2>
          <div class="scroll"><table class="tbl"><tr><th>${t('card')}</th><th>${t('price')}</th><th>${t('why')}</th></tr>
          ${ZH.useCards.map((c, i) => `<tr><td class="l">${esc(v(c))}</td><td><input class="in" type="number" min="0" name="p${i}" placeholder="$"></td>
            <td><label class="pill"><input type="checkbox" name="u${i}">${t('useful')}</label><label class="pill"><input type="checkbox" name="m${i}">${t('important')}</label></td></tr>`).join('')}</table></div></section>
        <section class="card"><h2><span class="n">2</span>${t('w1rank')}</h2>
          <div class="grid2"><div><label>${t('has100')}</label><div id="w100"></div></div><div><label>${t('has50')}</label><div id="w50"></div></div></div>
          <div class="field"><label>${t('cutFirst')}</label>${sel('cut', ZH.useCards)}</div>
          <div class="field"><label>${t('because')}</label><input class="in" name="cutWhy"></div></section>
        <section class="card"><h2><span class="n">3</span>${t('bottle')}</h2>
          ${radio('fix', ['修', '換'])}
          <div class="field"><label>${t('reason')}</label><textarea name="fixWhy"></textarea></div>
          <div class="method">${icon('g3')}${icon('g4')}<div><b>${esc(C.methods[3].name)}${COL()}</b>${esc(C.methods[3].q)}<br><b>${esc(C.methods[4].name)}${COL()}</b>${esc(C.methods[4].q)}</div></div></section>
        <section class="card"><h2><span class="n">4</span>${t('mySentence')}</h2>
          <div class="field"><label>${t('priceIs')}</label><input class="in" name="price"></div>
          <div class="field"><label>${t('valueIs')}</label><input class="in" name="value"></div></section>`,
      bind(f) {
        r100 = Array.isArray(f.r100) ? f.r100 : ZH.useCards.slice(); r50 = Array.isArray(f.r50) ? f.r50 : ZH.useCards.slice();
        const draw = () => { $('#w100').innerHTML = list('r100', r100); $('#w50').innerHTML = list('r50', r50); };
        draw();
        $('#ws').addEventListener('click', e => {
          const b = e.target.closest('button[data-l]'); if (!b) return;
          const arr = b.dataset.l === 'r100' ? r100 : r50, i = +b.dataset.i, j = i + (+b.dataset.d);
          if (j < 0 || j >= arr.length) return;
          [arr[i], arr[j]] = [arr[j], arr[i]]; draw(); saveDraft(1, { r100, r50 });
        });
      },
      extra: () => ({ r100, r50 }),
      collect() {
        const fix = ($('#ws [name="fix"]:checked') || {}).value;
        if (!fix) return { error: t('errFix') };
        if (!val('price').trim() || !val('value').trim()) return { error: t('errSentence') };
        return { data: {
          '$100排序': r100.join(' > '), '$50排序': r50.join(' > '),
          '價格': ZH.useCards.map((c, i) => `${c}:${val('p' + i) || '-'}`).join('；'),
          '值得理由': ZH.useCards.map((c, i) => `${c}:${[$(`#ws [name="u${i}"]`).checked ? '有用' : '', $(`#ws [name="m${i}"]`).checked ? '重要' : ''].filter(Boolean).join('+') || '-'}`).join('；'),
          '最先刪去': val('cut'), '刪去原因': val('cutWhy'), '修或換': fix, '修換理由': val('fixWhy'), '價格是': val('price'), '價值是': val('value')
        } };
      }
    };
  })();

  // W2《我的技能成長》
  const W2 = {
    html: () => `
      <section class="card"><h2><span class="n">1</span>${t('shop')}</h2>
        <div class="scroll"><table class="tbl"><tr><th>${t('round')}</th><th>${t('income')}</th><th>${t('cost')}</th><th>${t('netInc')}</th></tr>
        ${[1, 2].map(r => `<tr><td class="l">${t('r' + r)}</td><td><input class="in" type="number" min="0" name="in${r}"></td>
          <td><input class="in" type="number" min="0" name="out${r}" value="0"></td><td id="net${r}">0</td></tr>`).join('')}</table></div>
        <p style="margin-top:8px">${t('diff')}<b id="diff">0</b> ${t('tokens')}</p>
        <div class="field"><label>${t('whyMore')}</label><textarea name="why"></textarea></div>
        <div class="field"><label>${t('effort')}</label><input class="in" name="effort"></div></section>
      <section class="card"><h2><span class="n">2</span>${t('jobQ')}</h2>
        ${[1, 2].map(i => `<div class="grid2" style="margin-top:8px"><input class="in" name="job${i}" placeholder="${esc(t('job'))}"><input class="in" name="time${i}" placeholder="${esc(t('jobTime'))}">
          <input class="in" name="skill${i}" placeholder="${esc(t('jobSkill'))}"><input class="in" name="solve${i}" placeholder="${esc(t('jobSolve'))}"></div>`).join('<hr style="border:0;border-top:1.5px dashed #c9d1de;margin-top:10px">')}</section>
      <section class="card"><h2><span class="n">3</span>${t('plan')}</h2>
        <div class="field"><label>${t('mySkill')}</label><input class="in" name="myskill"></div>
        <div class="field"><label>${t('firstStep')}</label><input class="in" name="step"></div>
        <div class="field"><label>${t('otherSkill')}</label><input class="in" name="other"></div>
        <div class="method">${icon('g7')}<div><b>${esc(C.methods[7].name)}${COL()}</b>${esc(C.methods[7].q)}</div></div></section>`,
    calc() {
      const n1 = num(val('in1')) - num(val('out1')), n2 = num(val('in2')) - num(val('out2'));
      $('#net1').textContent = n1; $('#net2').textContent = n2; $('#diff').textContent = n2 - n1;
      $('#net1').className = n1 < 0 ? 'neg' : ''; $('#net2').className = n2 < 0 ? 'neg' : '';
    },
    collect() {
      if (val('in1') === '' || val('in2') === '') return { error: t('errIncome') };
      if (!val('myskill').trim() || !val('step').trim()) return { error: t('errSkill') };
      const n1 = num(val('in1')) - num(val('out1')), n2 = num(val('in2')) - num(val('out2'));
      return { data: {
        '第一輪收入': num(val('in1')), '第一輪支出': num(val('out1')), '第一輪淨收入': n1,
        '第二輪收入': num(val('in2')), '第二輪支出': num(val('out2')), '第二輪淨收入': n2, '收入差額': n2 - n1,
        '原因': val('why'), '付出': val('effort'),
        '工作分析': [1, 2].map(i => val('job' + i) ? `${val('job' + i)}（時間:${val('time' + i)}｜技能:${val('skill' + i)}｜解決:${val('solve' + i)}）` : '').filter(Boolean).join('；'),
        '想提升的技能': val('myskill'), '第一步': val('step'), '另一組技能': val('other')
      } };
    }
  };

  // W3《SMART 儲蓄表》
  const W3 = {
    html: () => `
      <section class="card"><h2><span class="n">1</span>${t('goal')}</h2>
        <div class="row"><span>${t('inW')}</span><input class="in" style="width:70px" type="number" min="1" name="weeks" value="8"><span>${t('weeksSave')}</span>
          <input class="in" style="width:90px" type="number" min="1" name="goal"><span>${t('useFor')}</span><input class="in" style="flex:1;min-width:160px" name="use"></div>
        <div class="field">${t('smart').map(([a, b]) => `<label class="pill"><input type="checkbox" name="s${a}"><b>${a}</b> ${esc(b)}</label>`).join('')}</div>
        <p class="muted">${esc(t('partner'))}</p></section>
      <section class="card"><h2><span class="n">2</span>${t('record')}</h2>
        <div class="scroll"><table class="tbl" style="min-width:620px"><tr><th>${t('wk')}</th><th>${t('save')}</th><th>${t('spend')}</th><th>${t('emerg')}</th><th>${t('bal')}</th><th>${t('event')}</th><th>${t('decision')}</th></tr>
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(w => `<tr><td>${w}</td>${['sv', 'sp', 'em'].map(k => `<td><input class="in" type="number" min="0" name="${k}${w}"></td>`).join('')}
          <td id="bal${w}">20</td><td><input class="in" style="min-width:110px" name="ev${w}"></td><td>${sel('dc' + w, ['儲', '花', '用緊急儲備'], '—')}</td></tr>`).join('')}</table></div>
        <p style="margin-top:10px" id="totals"></p>
        <div class="bar" style="margin-top:6px"><i id="rbar" style="width:0"></i></div></section>
      <section class="card"><h2><span class="n">3</span>${t('hold')}</h2><textarea name="hold"></textarea>
        <div class="method">${icon('g6')}<div><b>${esc(C.methods[6].name)}${COL()}</b>${esc(C.methods[6].q)}</div></div></section>`,
    sums() {
      let sv = 0, sp = 0, em = 0; const bal = {};
      for (let w = 1; w <= 8; w++) { sv += num(val('sv' + w)); sp += num(val('sp' + w)); em += num(val('em' + w)); bal[w] = 20 - num(val('sv' + w)) - num(val('sp' + w)) - num(val('em' + w)); }
      const goal = num(val('goal')); const rate = goal > 0 ? Math.round(sv / goal * 100) : 0;
      return { sv, sp, em, bal, goal, rate };
    },
    calc() {
      const s = W3.sums();
      for (let w = 1; w <= 8; w++) { const el = $('#bal' + w); el.textContent = s.bal[w]; el.className = s.bal[w] < 0 ? 'neg' : ''; }
      $('#totals').innerHTML = t('totals')(s.sv, s.sp, s.em, s.rate);
      $('#rbar').style.width = Math.min(100, s.rate) + '%';
    },
    collect() {
      const s = W3.sums();
      if (!(s.goal > 0) || !val('use').trim()) return { error: t('errGoal') };
      const neg = Object.keys(s.bal).filter(w => s.bal[w] < 0);
      if (neg.length) return { error: t('errNeg')(neg.join(isEN() ? ', ' : '、')) };
      const dc = [1, 2, 3, 4, 5, 6, 7, 8].map(w => val('dc' + w));
      return { data: {
        '目標週數': num(val('weeks')), '目標金額': s.goal, '目標用途': val('use'),
        'SMART': ['S', 'M', 'A', 'R', 'T'].filter(a => $(`#ws [name="s${a}"]`).checked).join(''),
        '每週紀錄': [1, 2, 3, 4, 5, 6, 7, 8].map(w => `第${w}週 儲${num(val('sv' + w))} 花${num(val('sp' + w))} 急${num(val('em' + w))}${val('ev' + w) ? ' 事件:' + val('ev' + w) : ''}${val('dc' + w) ? ' 決定:' + val('dc' + w) : ''}`).join('；'),
        '累積儲蓄': s.sv, '消費合計': s.sp, '緊急合計': s.em, '達標率': s.rate,
        '儲次數': dc.filter(x => x === '儲').length, '花次數': dc.filter(x => x === '花').length, '緊急次數': dc.filter(x => x === '用緊急儲備').length,
        '忍住不買理由': val('hold')
      } };
    }
  };

  // W4《買／不買／等等看》
  const W4 = {
    html: () => `
      <section class="card"><h2><span class="n">1</span>${t('compare')}</h2>
        ${ZH.scenarios.map((s, i) => `<div class="node" style="margin-top:10px"><b>${esc(v(s))}</b>
          <div class="grid2" style="margin-top:6px"><div><label>${t('needWant')}</label>${sel('cat' + i, ['需要', '想要', '可以等等'])}</div>
          <div><label>${t('canBorrow')}</label>${sel('borrow' + i, ['可以', '不可以'])}</div></div>
          <div class="row field">${['A', 'B', 'C'].map(k => `<div style="flex:1;min-width:80px"><label>${t('shopX')(k)}</label><input class="in" type="number" min="0" name="${k}${i}" placeholder="$"></div>`).join('')}</div>
          <p class="muted" id="low${i}"></p>
          <div class="field"><label>${t('myDecision')}</label><div>${radio('dec' + i, ['買', '不買', '等等看'])}</div></div></div>`).join('')}
        <div class="field"><label>${t('changed')}</label>${sel('change', ['已有一個', '朋友不在場', '24 小時後', '沒有改變'])}</div>
        <div class="method">${icon('g1')}${icon('g2')}${icon('g5')}<div>${[1, 2, 5].map(m => `<b>${esc(C.methods[m].name)}${COL()}</b>${esc(C.methods[m].q)}`).join('<br>')}</div></div></section>
      <section class="card"><h2><span class="n">2</span>${t('threeQ')}</h2>
        ${[1, 2, 3].map(i => `<div class="field"><input class="in" name="q${i}" placeholder="${esc(t('qN')(i))}"></div>`).join('')}</section>
      <section class="card"><h2><span class="n">3</span>${t('rule')}</h2>
        <div class="path">${C.path.map((x, i) => `<div>${icon('p' + (i + 1))}${esc(x)}</div>`).join('')}</div>
        <textarea name="rule" style="margin-top:10px" placeholder="${esc(t('rulePh'))}"></textarea></section>`,
    calc() {
      ZH.scenarios.forEach((s, i) => {
        const ps = ['A', 'B', 'C'].map(k => ({ k, p: val(k + i) })).filter(x => x.p !== '');
        if (!ps.length) { $('#low' + i).textContent = ''; return; }
        const m = ps.reduce((a, b) => num(b.p) < num(a.p) ? b : a);
        $('#low' + i).textContent = t('cheapest')(m.k, num(m.p));
      });
    },
    collect() {
      const data = {};
      for (let i = 0; i < ZH.scenarios.length; i++) {
        const s = ZH.scenarios[i]; const dec = ($(`#ws [name="dec${i}"]:checked`) || {}).value;
        if (!dec) return { error: t('errDec')(v(s)) };
        const ps = ['A', 'B', 'C'].map(k => val(k + i)).filter(x => x !== '').map(num);
        Object.assign(data, { [`${s}_分類`]: val('cat' + i), [`${s}_最低價`]: ps.length ? Math.min(...ps) : '', [`${s}_借用`]: val('borrow' + i), [`${s}_決定`]: dec });
      }
      if (![1, 2, 3].every(i => val('q' + i).trim())) return { error: t('errQ') };
      if (!val('rule').trim()) return { error: t('errRule') };
      return { data: Object.assign(data, { '答案改變於': val('change'), '購買前三問1': val('q1'), '購買前三問2': val('q2'), '購買前三問3': val('q3'), '生活原則': val('rule') }) };
    }
  };

  // ---------- 我的足跡 ----------
  async function pageFootprint() {
    shell(`${hero(t('fpTitle'), C.motto)}
      <section class="card"><h2>${t('fpHope')}</h2><div class="path">${C.path.map((x, i) => `<div>${icon('p' + (i + 1))}${esc(x)}</div>`).join('')}</div></section>
      <div id="fp"><p class="muted" style="margin-top:14px">${t('loading')}</p></div>`, { on: 'footprint', theme: 'th-fp' });
    const m = await api(withUser({ action: 'mine' }));
    if (!$('#fp')) return;
    if (!m.ok) { $('#fp').innerHTML = `<p class="err">${esc(m.error)}</p>`; return; }
    $('#fp').innerHTML = [1, 2, 3, 4].map(n => {
      const L = C.lessons[n], r = m['W' + n];
      return `<section class="card ${L.cls}"><h2><span class="n">${n}</span>${esc(L.title)}</h2>${r ? `<p>${esc(t('fp' + n)(r))}</p>` : `<p class="muted">${esc(t('notYet')(L.ws))}</p>`}</section>`;
    }).join('');
  }

  // ---------- 家長角落 ----------
  function pageParents() {
    const P = C.parents; const groups = Array.from({ length: CFG.GROUPS || 4 }, (_, i) => i + 1);
    shell(`${hero(t('pTitle'), t('pSub'))}
      <section class="card"><h2>${t('pSub')}</h2><p>${esc(P.intro)}</p>
        ${P.tips.map(([a, b]) => `<div class="node" style="margin-top:8px;--cl:#FFF5D6;--c:#B5651D"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}
        <p style="margin-top:10px">${esc(P.end)}</p></section>
      <section class="card"><h2>${t('pLook')}</h2>
        <div class="row"><select id="pg" style="width:auto">${groups.map(g => `<option value="${g}">${t('groupOpt')(g)}</option>`).join('')}</select>
          <input class="in" id="pn" style="flex:1" placeholder="${esc(t('childNick'))}"><button class="btn sm" id="pgo">${t('view')}</button></div><div id="pres"></div></section>
      <section class="card"><h2>${t('waCard')}</h2><p>${esc(t('waText'))}</p>
        <a class="btn full wa-btn" href="${waLink()}" target="_blank" rel="noopener">${WA_ICON}${esc(t('waBtn'))}</a></section>
      ${fbForm(groups)}
      <section class="card"><h2>${t('books')}</h2>${P.books.map(([a, b]) => `<p style="margin-top:6px"><b>${esc(a)}</b>${COL()}${esc(b)}</p>`).join('')}</section>
      <div class="gold">${quote(C.motto)}</div>`, { on: 'parents', theme: 'th-par', wa: true });
    $('#pgo').onclick = async () => {
      const nick = $('#pn').value.trim(); if (!nick) { $('#pres').innerHTML = `<p class="err">${t('needChild')}</p>`; return; }
      const m = await api({ action: 'mine', group: $('#pg').value, nick });
      const w4 = m.ok && m.W4, w3 = m.ok && m.W3;
      $('#pres').innerHTML = (w3 || w4) ? `${w3 ? `<p style="margin-top:10px"><b>${t('pGoal')}</b>$${esc(w3['目標金額'])} ${esc(w3['目標用途'])}${esc(t('pRate')(w3['達標率']))}</p>` : ''}
        ${w4 ? `<p><b>${t('pQ')}</b></p><ol style="margin-left:20px">${[1, 2, 3].map(i => `<li>${esc(w4['購買前三問' + i])}</li>`).join('')}</ol><p><b>${t('pRule')}</b>${esc(w4['生活原則'])}</p>` : ''}`
        : `<p class="muted" style="margin-top:10px">${t('pNone')}</p>`;
    };
    bindFb();
  }

  // ---------- 家長課後評估表 ----------
  function fbForm(groups) {
    const seg = name => `<div class="seg">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="${name}" value="${n}"><span>${n}</span></label>`).join('')}</div>`;
    return `<section class="card" id="fbcard"><h2>${t('fbTitle')}</h2><p class="muted">${esc(t('fbIntro'))}</p>
      <div class="row field"><select id="fg" style="width:auto"><option value="">${t('choose')}</option>${groups.map(g => `<option value="${g}">${t('groupOpt')(g)}</option>`).join('')}</select>
        <input class="in" id="fn" style="flex:1" maxlength="20" placeholder="${esc(t('fbChild'))}"></div>
      <p class="muted" style="margin-top:10px">${esc(t('fbScale'))}</p>
      ${C.feedback.items.map((it, i) => `<div class="fbq"><b>${i + 1}. ${esc(it)}</b>
        <div class="fbrow"><span>${t('fbBefore')}</span>${seg('b' + i)}</div><div class="fbrow"><span>${t('fbAfter')}</span>${seg('a' + i)}</div></div>`).join('')}
      <div class="fbq"><b>${esc(t('fbSat'))}</b><div class="fbrow"><span></span>${seg('sat')}</div></div>
      <div class="field"><label>${esc(t('fbRec'))}</label><div>${['會', '可能會', '不會'].map(o => `<label class="pill"><input type="radio" name="rec" value="${o}">${esc(v(o))}</label>`).join('')}</div></div>
      <div class="field"><label>${esc(t('fbChange'))}</label><textarea id="fchg" maxlength="300"></textarea></div>
      <div class="field"><label>${esc(t('fbSuggest'))}</label><textarea id="fsug" maxlength="300"></textarea></div>
      <label class="pill" style="margin-top:10px"><input type="checkbox" id="fok">${esc(t('fbConsent'))}</label>
      <div class="err" id="ferr"></div><button class="btn full" id="fsend">${t('fbSend')}</button><div id="fdone"></div></section>`;
  }
  function bindFb() {
    const card = $('#fbcard'); if (!card) return;
    const pick = n => (card.querySelector(`input[name="${n}"]:checked`) || {}).value;
    card.addEventListener('change', () => { $('#ferr').textContent = ''; });
    $('#fsend').onclick = async () => {
      const keys = ZH.feedback.keys, data = {};
      for (let i = 0; i < keys.length; i++) {
        const b = pick('b' + i), a = pick('a' + i);
        if (!b || !a) { $('#ferr').textContent = t('fbErr'); return; }
        data[keys[i] + '_課前'] = +b; data[keys[i] + '_現在'] = +a; data[keys[i] + '_改變'] = a - b;
      }
      if (!pick('sat') || !pick('rec')) { $('#ferr').textContent = t('fbErr'); return; }
      Object.assign(data, { '滿意度': +pick('sat'), '會推薦': pick('rec'), '最明顯改變': $('#fchg').value.trim(), '改善建議': $('#fsug').value.trim(), '同意匿名引用': $('#fok').checked ? '同意' : '不同意' });
      $('#fsend').disabled = true;
      const r = await api({ action: 'feedback', group: $('#fg').value, nick: $('#fn').value.trim(), data });
      $('#fsend').disabled = false;
      if (!r.ok) { $('#ferr').textContent = r.error || t('subFail'); return; }
      $('#fsend').hidden = true;
      $('#fdone').innerHTML = `<div class="okmsg">${esc(t('fbOk'))}</div>`;
    };
  }

  // ---------- 導師大屏：家長回饋 ----------
  function pageFeedbackDash() {
    shell(`<div style="--c:#C2477A;--cl:#FDE8F0;--cb:#F4A6C3;--cm:#F9CADB">
      <div class="tabs">${[1, 2, 3, 4].map(i => `<button data-tab="${i}">${t('tLesson')(i)}</button>`).join('')}<button class="on" data-tab="fb">${t('fbTab')}</button></div>
      ${hero(t('fbDash'), t('fbTab'))}
      <p class="muted" style="margin-top:6px">${t('every')(CFG.REFRESH_SECONDS || 10)}${SEP()}<span id="ts"></span></p>
      <div class="tgrid" id="tg"></div></div>`, { noNav: true, noUser: true, wide: true, theme: 'th-par', noWa: true });
    $$('[data-tab]').forEach(b => { b.onclick = () => { location.hash = '#/teacher/' + b.dataset.tab; }; });
    const tick = async () => {
      const s = await api({ action: 'feedbackList' });
      if (!$('#tg')) return;
      if (!s.ok) { $('#tg').innerHTML = `<p class="err">${esc(s.error)}</p>`; return; }
      $('#ts').textContent = t('updated')(new Date().toLocaleTimeString());
      $('#tg').innerHTML = fbPanels(s.rows);
    };
    tick(); timer = setInterval(tick, (CFG.REFRESH_SECONDS || 10) * 1000);
  }
  function fbPanels(rows) {
    if (!rows.length) return box(t('fbCount'), `<div class="big">0</div><p class="muted">${t('fbNone')}</p>`);
    const out = [];
    out.push(box(t('fbCount'), `<div class="big">${rows.length}</div>`));
    out.push(box(t('fbChangeT'), ZH.feedback.keys.map((k, i) => {
      const b = avg(rows.map(r => num(r[k + '_課前']))), a = avg(rows.map(r => num(r[k + '_現在'])));
      const d = a - b;
      return `<p style="margin-top:8px;font-weight:700">${i + 1}. ${esc(C.feedback.items[i])}</p>` +
        bars([[t('fbBefore'), b, b.toFixed(1)], [t('fbAfter'), a, a.toFixed(1)]], 5) +
        `<p class="muted">${d >= 0 ? '+' : ''}${d.toFixed(1)}</p>`;
    }).join('')));
    const sat = avg(rows.map(r => num(r['滿意度'])));
    out.push(box(t('fbSatT'), `<div class="big">${sat.toFixed(1)}<span class="muted" style="font-size:18px"> / 5</span></div>`));
    out.push(box(t('fbRecT'), bars(['會', '可能會', '不會'].map(o => { const c = rows.filter(r => r['會推薦'] === o).length; return [v(o), c, t('nPeople')(c)]; }), Math.max(1, rows.length))));
    out.push(box(t('fbChgT'), notes(rows.filter(r => r['最明顯改變']).map(r => ({ '內容': r['最明顯改變'], '組別': r['孩子組別'] })))));
    out.push(box(t('fbSugT'), notes(rows.filter(r => r['改善建議']).map(r => ({ '內容': r['改善建議'], '組別': r['孩子組別'] })))));
    return out.join('');
  }

  // ---------- 導師大屏 ----------
  function pageTeacher(n) {
    n = C.lessons[n] ? +n : 1;
    const L = C.lessons[n];
    shell(`<div class="${L.cls}">
      <div class="tabs">${[1, 2, 3, 4].map(i => `<button class="${i === n ? 'on' : ''}" data-tab="${i}">${t('tLesson')(i)}</button>`).join('')}
        <button data-tab="fb">${t('fbTab')}</button><button id="qrbtn">${t('qr')}</button></div>
      <div id="qrbox" hidden><div id="qr"></div><p class="muted">${esc(location.href.split('#')[0])}</p></div>
      ${banner(n, t('tConsole')(L.title))}
      <p class="muted" style="margin-top:6px">${t('every')(CFG.REFRESH_SECONDS || 10)}${SEP()}<span id="ts"></span></p>
      <div class="tgrid" id="tg"></div></div>`, { noNav: true, noUser: true, wide: true, theme: L.cls, noWa: true });
    $$('[data-tab]').forEach(b => { b.onclick = () => { location.hash = '#/teacher/' + b.dataset.tab; }; });
    $('#qrbtn').onclick = () => { $('#qrbox').hidden = !$('#qrbox').hidden; };
    loadQR();
    const tick = async () => {
      const s = await api({ action: 'summary', lesson: n });
      if (!$('#tg')) return;
      if (!s.ok) { $('#tg').innerHTML = `<p class="err">${esc(s.error)}</p>`; return; }
      $('#ts').textContent = t('updated')(new Date().toLocaleTimeString());
      $('#tg').innerHTML = teacherPanels(n, s);
    };
    tick(); timer = setInterval(tick, (CFG.REFRESH_SECONDS || 10) * 1000);
  }
  function loadQR() {
    const draw = () => { try { $('#qr').innerHTML = ''; new window.QRCode($('#qr'), { text: location.href.split('#')[0], width: 220, height: 220 }); } catch (e) { /* 沒有網絡時略過 */ } };
    if (window.QRCode) return draw();
    const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; sc.onload = draw; document.head.appendChild(sc);
  }
  const bars = (items, max) => items.map(([label, x, shown]) => `<div class="brow"><span>${esc(label)}</span><div class="bar"><i style="width:${max > 0 ? Math.max(0, Math.min(100, Math.round(x / max * 100))) : 0}%"></i></div><span>${esc(shown != null ? shown : x)}</span></div>`).join('');
  const box = (title, inner) => `<section class="card" style="margin-top:0">${title ? `<h2>${title}</h2>` : ''}${inner}</section>`;
  const byGroup = rows => { const g = {}; rows.forEach(r => { (g[r['組別']] = g[r['組別']] || []).push(r); }); return g; };
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const notes = items => `<div class="wall">${items.map(noteHtml).join('') || `<span class="muted">${t('noWall')}</span>`}</div>`;

  function teacherPanels(n, s) {
    const out = []; const G = CFG.GROUPS || 4; const groups = Array.from({ length: G }, (_, i) => String(i + 1));
    const bg = byGroup(s.rows); const gl = g => t('group')(g);
    out.push(box(esc(t('submitted')(C.lessons[n].ws)), `<div class="big">${s.rows.length}</div>${bars(groups.map(g => [gl(g), (bg[g] || []).length, t('copies')((bg[g] || []).length)]), Math.max(1, ...groups.map(g => (bg[g] || []).length)))}`));
    Object.entries(C.polls).filter(([, p]) => p.lesson === n).forEach(([id, p]) => {
      out.push(box('🗳 ' + esc(p.q), p.phases.map(ph => {
        const vs = s.votes.filter(x => x['投票'] === id && x['階段'] === ph);
        return `<p class="muted">${p.phases.length > 1 ? esc(v(ph)) + ' · ' : ''}${t('nVotes')(vs.length)}</p>` + bars(p.options.map(o => { const c = vs.filter(x => x['選擇'] === o).length; return [v(o), c, t('nPeople')(c)]; }), Math.max(1, vs.length));
      }).join('')));
    });
    if (n === 1) {
      const rk = key => ZH.useCards.map(c => { const a = s.rows.map(r => String(r[key] || '').split(' > ').indexOf(c) + 1).filter(x => x > 0); const m = avg(a); return [v(c), a.length ? 7 - m : 0, a.length ? t('rankN')(m.toFixed(1)) : '—']; }).sort((a, b) => b[1] - a[1]);
      out.push(box(t('rank100'), bars(rk('$100排序'), 6)));
      out.push(box(t('rank50'), bars(rk('$50排序'), 6)));
      out.push(box(t('fixQ'), bars(['修', '換'].map(o => { const c = s.rows.filter(r => r['修或換'] === o).length; return [v(o), c, t('nPeople')(c)]; }), Math.max(1, s.rows.length))));
    }
    if (n === 2) {
      const it = groups.map(g => { const r = bg[g] || []; return [g, avg(r.map(x => num(x['第一輪淨收入']))), avg(r.map(x => num(x['第二輪淨收入'])))]; });
      const mx = Math.max(1, ...it.map(x => Math.max(x[1], x[2])));
      out.push(box(t('shopNet'), it.map(([g, a, b]) => `<p class="muted" style="margin-top:6px">${esc(gl(g))}</p>` + bars([[t('r1'), a, a.toFixed(0)], [t('r2'), b, b.toFixed(0)]], mx)).join('')));
      out.push(box(t('skills'), notes(s.rows.map(r => ({ '內容': r['想提升的技能'], '組別': r['組別'] })))));
    }
    if (n === 3) {
      out.push(box(t('rates'), bars(groups.map(g => { const a = avg((bg[g] || []).map(r => num(r['達標率']))); return [gl(g), a, Math.round(a) + '%']; }), 100)));
      const sum = k => s.rows.reduce((x, r) => x + num(r[k]), 0); const tot = sum('儲次數') + sum('花次數') + sum('緊急次數');
      out.push(box(t('events'), bars([['儲', sum('儲次數')], ['花', sum('花次數')], ['用緊急儲備', sum('緊急次數')]].map(([a, b]) => [v(a), b, t('times')(b)]), Math.max(1, tot))));
    }
    if (n === 4) {
      out.push(box(t('decisions'), ZH.scenarios.map(sc => `<p class="muted" style="margin-top:6px">${esc(v(sc))}</p>` + bars(['買', '不買', '等等看'].map(o => { const c = s.rows.filter(r => r[sc + '_決定'] === o).length; return [v(o), c, t('nPeople')(c)]; }), Math.max(1, s.rows.length))).join('')));
      out.push(box(t('rules'), notes(s.rows.map(r => ({ '內容': r['生活原則'], '組別': r['組別'] })))));
    }
    Object.entries(C.walls).filter(([, w]) => w.lesson === n).forEach(([id, w]) => {
      let items = s.walls.filter(x => x['牆'] === id).slice(-60).reverse();
      if (id === 'L3_hold') items = items.concat(s.rows.filter(r => r['忍住不買理由']).map(r => ({ '內容': r['忍住不買理由'], '組別': r['組別'] })));
      out.push(box('🗒 ' + esc(w.q), notes(items)));
    });
    return out.join('');
  }

  // ---------- 路由 ----------
  function route() {
    if (timer) { clearInterval(timer); timer = null; }
    const [page, arg] = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
    if (page === 'teacher') return arg === 'fb' ? pageFeedbackDash() : pageTeacher(arg);
    if (page === 'parents') return pageParents();
    if (!user()) return pageLogin();
    if (page === 'lesson') return pageLesson(+arg);
    if (page === 'ws') return pageWS(+arg);
    if (page === 'footprint') return pageFootprint();
    if (page === 'login') { location.hash = '#/home'; return; }
    return pageHome();
  }
  window.addEventListener('hashchange', route);
  applyLang();
  route();
})();
