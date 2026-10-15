// /api/words — CRUD คำศัพท์
const express = require('express');
const db = require('../db');
const router = express.Router();

const LEVELS = ['easy', 'medium', 'hard'];

function validate(body) {
  if (!body.word || !body.word.trim()) return 'กรุณากรอกคำศัพท์ (word)';
  if (!body.meaning || !body.meaning.trim()) return 'กรุณากรอกความหมาย (meaning)';
  if (body.level && !LEVELS.includes(body.level)) return 'level ต้องเป็น easy, medium หรือ hard';
  return null;
}

// GET /api/words?search=&level=
router.get('/', (req, res) => {
  const { search = '', level = '' } = req.query;
  let sql = 'SELECT * FROM words WHERE (word LIKE ? OR meaning LIKE ?)';
  const params = [`%${search}%`, `%${search}%`];
  if (level) { sql += ' AND level = ?'; params.push(level); }
  sql += ' ORDER BY id DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/words/random?count=5  (ต้องอยู่ก่อน /:id)
router.get('/random', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 1, 50);
  res.json(db.prepare('SELECT * FROM words ORDER BY RANDOM() LIMIT ?').all(count));
});

// GET /api/words/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM words WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'ไม่พบคำศัพท์นี้' });
  res.json(row);
});

// POST /api/words
router.post('/', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const { word, meaning, part_of_speech = 'noun', example = '', level = 'easy' } = req.body;
  const info = db.prepare(
    'INSERT INTO words (word, meaning, part_of_speech, example, level) VALUES (?,?,?,?,?)'
  ).run(word.trim(), meaning.trim(), part_of_speech, example, level);
  res.status(201).json(db.prepare('SELECT * FROM words WHERE id = ?').get(info.lastInsertRowid));
});

// PUT /api/words/:id
router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM words WHERE id = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'ไม่พบคำศัพท์นี้' });
  const merged = { ...old, ...req.body };
  const err = validate(merged);
  if (err) return res.status(400).json({ error: err });
  db.prepare(
    'UPDATE words SET word=?, meaning=?, part_of_speech=?, example=?, level=?, learned=? WHERE id=?'
  ).run(merged.word, merged.meaning, merged.part_of_speech, merged.example, merged.level,
        merged.learned ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM words WHERE id = ?').get(req.params.id));
});

// DELETE /api/words/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM words WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'ไม่พบคำศัพท์นี้' });
  res.json({ message: 'ลบเรียบร้อย', id: Number(req.params.id) });
});

module.exports = router;
