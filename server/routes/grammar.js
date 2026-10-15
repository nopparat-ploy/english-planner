// /api/grammar — CRUD บทเรียนไวยากรณ์
const express = require('express');
const db = require('../db');
const router = express.Router();

function validate(b) {
  if (!b.title || !b.title.trim()) return 'กรุณากรอกชื่อหัวข้อ (title)';
  if (!b.structure || !b.structure.trim()) return 'กรุณากรอกโครงสร้าง (structure)';
  if (!b.explanation || !b.explanation.trim()) return 'กรุณากรอกคำอธิบาย (explanation)';
  return null;
}

router.get('/', (req, res) => {
  const { search = '' } = req.query;
  res.json(db.prepare(
    'SELECT * FROM grammar WHERE title LIKE ? OR explanation LIKE ? ORDER BY id'
  ).all(`%${search}%`, `%${search}%`));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM grammar WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'ไม่พบหัวข้อไวยากรณ์นี้' });
  res.json(row);
});

router.post('/', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ error: err });
  const { title, structure, explanation, example = '', level = 'easy' } = req.body;
  const info = db.prepare(
    'INSERT INTO grammar (title, structure, explanation, example, level) VALUES (?,?,?,?,?)'
  ).run(title.trim(), structure.trim(), explanation.trim(), example, level);
  res.status(201).json(db.prepare('SELECT * FROM grammar WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const old = db.prepare('SELECT * FROM grammar WHERE id = ?').get(req.params.id);
  if (!old) return res.status(404).json({ error: 'ไม่พบหัวข้อไวยากรณ์นี้' });
  const m = { ...old, ...req.body };
  const err = validate(m);
  if (err) return res.status(400).json({ error: err });
  db.prepare('UPDATE grammar SET title=?, structure=?, explanation=?, example=?, level=? WHERE id=?')
    .run(m.title, m.structure, m.explanation, m.example, m.level, req.params.id);
  res.json(db.prepare('SELECT * FROM grammar WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM grammar WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'ไม่พบหัวข้อไวยากรณ์นี้' });
  res.json({ message: 'ลบเรียบร้อย', id: Number(req.params.id) });
});

module.exports = router;
