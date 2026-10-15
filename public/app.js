// ===== ตัวช่วยเรียก API =====
async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
  return data;
}

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = 'toast', 2200);
}

// ===== สลับแท็บ =====
const loaders = { home: loadHome, words: loadWords, grammar: loadGrammar, flash: loadFlash, quiz: () => {} };
$('#sideTabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('#view-' + btn.dataset.view).classList.add('active');
  loaders[btn.dataset.view]();
});

// แท็บด้านล่าง: เปลี่ยนลายกระดาษ
$('#bottomTabs').addEventListener('click', e => {
  const btn = e.target.closest('.btab');
  if (!btn) return;
  document.querySelectorAll('.btab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const page = $('.page-right');
  page.classList.remove('dotted', 'grid', 'blank');
  page.classList.add(btn.dataset.paper);
});

// ===== HOME =====
async function loadHome() {
  try {
    const [stats, [word], quizzes] = await Promise.all([
      api('/api/stats'), api('/api/words/random?count=1'), api('/api/quiz-results'),
    ]);
    if (word) {
      $('#wotd .wotd-word').textContent = word.word;
      $('#wotd .wotd-mean').textContent = `(${word.part_of_speech}) ${word.meaning}`;
      $('#wotdExample').textContent = word.example || 'LOVE WHAT U LEARN';
    }
    $('#goalNum').textContent = Math.max(1, Math.min(10, stats.words - stats.learned)) || 5;
    $('#statList').innerHTML = `
      <li>มีคำศัพท์ทั้งหมด ${stats.words} คำ</li>
      <li>จำได้แล้ว ${stats.learned} คำ (${stats.words ? Math.round(stats.learned / stats.words * 100) : 0}%)</li>
      <li>บทไวยากรณ์ ${stats.grammar} หัวข้อ</li>
      <li>ทำควิซไปแล้ว ${stats.quizzes} ครั้ง</li>`;
    $('#quizHistory').innerHTML = quizzes.length
      ? quizzes.slice(0, 5).map(q => `<li>${q.score}/${q.total} คะแนน</li>`).join('')
      : '<li>ยังไม่มีผลควิซ</li>';
  } catch (err) { toast(err.message, true); }
}

// ===== WORDS =====
let wordLevel = '';
async function loadWords() {
  const search = encodeURIComponent($('#wordSearch').value);
  try {
    const words = await api(`/api/words?search=${search}&level=${wordLevel}`);
    $('#wordList').innerHTML = words.length ? words.map(w => `
      <div class="word-card ${w.learned ? 'learned' : ''}">
        <span class="badge ${w.level}">${w.level}</span>
        <h4>${esc(w.word)}</h4>
        <div class="pos">${esc(w.part_of_speech)}</div>
        <div class="mean">${esc(w.meaning)}</div>
        ${w.example ? `<div class="ex">"${esc(w.example)}"</div>` : ''}
        <div class="card-actions">
          <button data-act="learn" data-id="${w.id}" data-val="${w.learned ? 0 : 1}">${w.learned ? '↺ undo' : '✔ learned'}</button>
          <button data-act="edit" data-id="${w.id}">✎ edit</button>
          <button class="del" data-act="del" data-id="${w.id}">🗑</button>
        </div>
      </div>`).join('') : '<div class="empty">ไม่พบคำศัพท์ ลองเพิ่มคำใหม่ทางซ้ายได้เลย ✏️</div>';
  } catch (err) { toast(err.message, true); }
}

$('#wordSearch').addEventListener('input', debounce(loadWords, 250));
$('#levelChips').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  document.querySelectorAll('#levelChips .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  wordLevel = c.dataset.level;
  loadWords();
});

$('#wordForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const body = Object.fromEntries(new FormData(f));
  const id = body.id; delete body.id;
  try {
    if (id) { await api(`/api/words/${id}`, { method: 'PUT', body }); toast('แก้ไขคำศัพท์แล้ว'); }
    else { await api('/api/words', { method: 'POST', body }); toast('เพิ่มคำศัพท์แล้ว 🎉'); }
    resetWordForm();
    loadWords();
  } catch (err) { toast(err.message, true); }
});

function resetWordForm() {
  $('#wordForm').reset();
  $('#wordForm').id.value = '';
  $('#wordFormTitle').textContent = 'New Word';
}
$('#wordCancel').addEventListener('click', resetWordForm);

$('#wordList').addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const id = b.dataset.id;
  try {
    if (b.dataset.act === 'del') {
      if (!confirm('ลบคำศัพท์นี้?')) return;
      await api(`/api/words/${id}`, { method: 'DELETE' });
      toast('ลบแล้ว');
    } else if (b.dataset.act === 'learn') {
      await api(`/api/words/${id}`, { method: 'PUT', body: { learned: Number(b.dataset.val) } });
    } else if (b.dataset.act === 'edit') {
      const w = await api(`/api/words/${id}`);
      const f = $('#wordForm');
      ['id', 'word', 'meaning', 'part_of_speech', 'example'].forEach(k => f[k].value = w[k]);
      f.querySelector(`input[name=level][value=${w.level}]`).checked = true;
      $('#wordFormTitle').textContent = 'Edit Word';
      f.word.focus();
      return;
    }
    loadWords();
  } catch (err) { toast(err.message, true); }
});

// ===== GRAMMAR =====
async function loadGrammar() {
  const search = encodeURIComponent($('#grammarSearch').value);
  try {
    const list = await api(`/api/grammar?search=${search}`);
    $('#grammarList').innerHTML = list.length ? list.map(g => `
      <div class="grammar-card">
        <span class="badge ${g.level}">${g.level}</span>
        <h4>${esc(g.title)}</h4>
        <div class="structure">${esc(g.structure)}</div>
        <p>${esc(g.explanation)}</p>
        ${g.example ? `<div class="ex">e.g. ${esc(g.example)}</div>` : ''}
        <div class="card-actions">
          <button data-act="edit" data-id="${g.id}">✎ edit</button>
          <button class="del" data-act="del" data-id="${g.id}">🗑</button>
        </div>
      </div>`).join('') : '<div class="empty">ไม่พบหัวข้อไวยากรณ์</div>';
  } catch (err) { toast(err.message, true); }
}

$('#grammarSearch').addEventListener('input', debounce(loadGrammar, 250));

$('#grammarForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  const id = body.id; delete body.id;
  try {
    if (id) { await api(`/api/grammar/${id}`, { method: 'PUT', body }); toast('แก้ไขแล้ว'); }
    else { await api('/api/grammar', { method: 'POST', body }); toast('เพิ่มหัวข้อไวยากรณ์แล้ว 📘'); }
    resetGrammarForm();
    loadGrammar();
  } catch (err) { toast(err.message, true); }
});

function resetGrammarForm() {
  $('#grammarForm').reset();
  $('#grammarForm').id.value = '';
  $('#grammarFormTitle').textContent = 'New Grammar';
}
$('#grammarCancel').addEventListener('click', resetGrammarForm);

$('#grammarList').addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const id = b.dataset.id;
  try {
    if (b.dataset.act === 'del') {
      if (!confirm('ลบหัวข้อนี้?')) return;
      await api(`/api/grammar/${id}`, { method: 'DELETE' });
      toast('ลบแล้ว');
      loadGrammar();
    } else {
      const g = await api(`/api/grammar/${id}`);
      const f = $('#grammarForm');
      ['id', 'title', 'structure', 'explanation', 'example'].forEach(k => f[k].value = g[k]);
      f.querySelector(`input[name=level][value=${g.level}]`).checked = true;
      $('#grammarFormTitle').textContent = 'Edit Grammar';
      f.title.focus();
    }
  } catch (err) { toast(err.message, true); }
});

// ===== FLASHCARDS =====
let deck = [], fcIndex = 0;
async function loadFlash() {
  try {
    deck = await api('/api/words/random?count=50');
    fcIndex = 0;
    showCard();
  } catch (err) { toast(err.message, true); }
}
function showCard() {
  $('#flashcard').classList.remove('flipped');
  if (!deck.length) { $('#fcWord').textContent = 'no words yet'; $('#fcCounter').textContent = ''; return; }
  const w = deck[fcIndex];
  $('#fcWord').textContent = w.word;
  $('#fcPos').textContent = w.part_of_speech;
  $('#fcMean').textContent = w.meaning;
  $('#fcEx').textContent = w.example ? `"${w.example}"` : '';
  $('#fcCounter').textContent = `${fcIndex + 1} / ${deck.length}${w.learned ? '  ·  ✔ learned' : ''}`;
}
$('#flashcard').addEventListener('click', () => $('#flashcard').classList.toggle('flipped'));
$('#fcNext').addEventListener('click', () => { if (deck.length) { fcIndex = (fcIndex + 1) % deck.length; showCard(); } });
$('#fcPrev').addEventListener('click', () => { if (deck.length) { fcIndex = (fcIndex - 1 + deck.length) % deck.length; showCard(); } });
$('#fcLearned').addEventListener('click', async () => {
  if (!deck.length) return;
  const w = deck[fcIndex];
  try {
    await api(`/api/words/${w.id}`, { method: 'PUT', body: { learned: 1 } });
    w.learned = 1;
    toast(`จำ "${w.word}" ได้แล้ว ✔`);
    showCard();
  } catch (err) { toast(err.message, true); }
});

// ===== QUIZ =====
let quiz = [], qi = 0, score = 0;
$('#quizCard').addEventListener('click', async e => {
  if (e.target.id === 'quizStart') return startQuiz();
  const opt = e.target.closest('.opt');
  if (opt && !opt.disabled) answer(opt);
  if (e.target.id === 'quizNext') nextQuestion();
});

async function startQuiz() {
  try {
    const words = await api('/api/words/random?count=50');
    if (words.length < 4) return toast('ต้องมีคำศัพท์อย่างน้อย 4 คำถึงจะทำควิซได้', true);
    quiz = words.slice(0, Math.min(5, words.length)).map(w => {
      const wrong = words.filter(x => x.id !== w.id).sort(() => Math.random() - .5).slice(0, 3);
      return { word: w, options: [w, ...wrong].sort(() => Math.random() - .5) };
    });
    qi = 0; score = 0;
    $('#qTotal').textContent = quiz.length;
    renderQuestion();
  } catch (err) { toast(err.message, true); }
}

function renderQuestion() {
  const q = quiz[qi];
  $('#qNum').textContent = qi + 1;
  $('#qScore').textContent = score;
  $('#quizCard').innerHTML = `
    <p class="hand">คำนี้แปลว่าอะไร?</p>
    <div class="q-word">${esc(q.word.word)}</div>
    <div class="options">${q.options.map(o => `<button class="opt" data-id="${o.id}">${esc(o.meaning)}</button>`).join('')}</div>
    <div id="quizFeedback" style="margin-top:18px"></div>`;
}

function answer(opt) {
  const q = quiz[qi];
  const correct = Number(opt.dataset.id) === q.word.id;
  if (correct) score++;
  document.querySelectorAll('.opt').forEach(b => {
    b.disabled = true;
    if (Number(b.dataset.id) === q.word.id) b.classList.add('correct');
  });
  if (!correct) opt.classList.add('wrong');
  $('#qScore').textContent = score;
  $('#quizFeedback').innerHTML = `
    <p class="hand">${correct ? 'Nice! 🎉' : 'Almost! คำตอบคือ “' + esc(q.word.meaning) + '”'}</p>
    <button class="btn navy" id="quizNext">${qi + 1 < quiz.length ? 'Next ▶' : 'See result'}</button>`;
}

async function nextQuestion() {
  qi++;
  if (qi < quiz.length) return renderQuestion();
  try { await api('/api/quiz-results', { method: 'POST', body: { score, total: quiz.length } }); }
  catch (err) { toast(err.message, true); }
  $('#quizCard').innerHTML = `
    <p class="hand">your score</p>
    <div class="q-word">${score} / ${quiz.length}</div>
    <p class="hand">${score === quiz.length ? 'Perfect! I GOT THIS. 💪' : 'Keep going — you are on the right path.'}</p>
    <button class="btn navy" id="quizStart">Try again</button>`;
}

// ===== utils =====
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

loadHome();
