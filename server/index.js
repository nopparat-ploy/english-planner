// จุดเริ่มต้นของเซิร์ฟเวอร์ Express
const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// log ทุก request (ช่วยตอนดีบัก)
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.url}`);
  next();
});

// เสิร์ฟไฟล์หน้าเว็บจาก /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api/words', require('./routes/words'));
app.use('/api/grammar', require('./routes/grammar'));

// ผลควิซ
app.get('/api/quiz-results', (req, res) => {
  res.json(db.prepare('SELECT * FROM quiz_results ORDER BY id DESC LIMIT 10').all());
});
app.post('/api/quiz-results', (req, res) => {
  const { score, total } = req.body;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total)
    return res.status(400).json({ error: 'score และ total ต้องเป็นจำนวนเต็ม และ 0 ≤ score ≤ total' });
  const info = db.prepare('INSERT INTO quiz_results (score, total) VALUES (?,?)').run(score, total);
  res.status(201).json(db.prepare('SELECT * FROM quiz_results WHERE id = ?').get(info.lastInsertRowid));
});

// สถิติรวมสำหรับหน้าแรก
app.get('/api/stats', (req, res) => {
  res.json({
    words: db.prepare('SELECT COUNT(*) c FROM words').get().c,
    learned: db.prepare('SELECT COUNT(*) c FROM words WHERE learned = 1').get().c,
    grammar: db.prepare('SELECT COUNT(*) c FROM grammar').get().c,
    quizzes: db.prepare('SELECT COUNT(*) c FROM quiz_results').get().c,
  });
});

// API ที่ไม่มีอยู่
app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบ endpoint นี้' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
});

app.listen(PORT, () => console.log(`✏️  English Planner running at http://localhost:${PORT}`));
