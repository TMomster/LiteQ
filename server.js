/**
 * LiteQ - Node.js 服务器
 * 问卷调查结果生成器
 */
const express = require('express');
const path = require('path');
const { parse } = require('./src/parser');
const { validate } = require('./src/validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── API: 解析问卷结构 ───
app.post('/api/parse', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '请输入问卷结构文本' });
    const result = parse(text);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API: 校验结果数据 ───
app.post('/api/validate', (req, res) => {
  try {
    const { questions, total, data } = req.body;
    const errors = validate(questions, total, data);
    res.json({ errors });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── 帮助文档路由 ───
app.get('/help/question-format', (req, res) => {
  res.sendFile(path.join(__dirname, 'help', 'question-format.html'));
});

app.get('/help/answer-format', (req, res) => {
  res.sendFile(path.join(__dirname, 'help', 'answer-format.html'));
});

// ─── 英文帮助文档路由 ───
app.get('/help/question-format.en', (req, res) => {
  res.sendFile(path.join(__dirname, 'help', 'question-format.en.html'));
});

app.get('/help/answer-format.en', (req, res) => {
  res.sendFile(path.join(__dirname, 'help', 'answer-format.en.html'));
});

app.listen(PORT, () => {
  console.log(`LiteQ 服务器已启动: http://localhost:${PORT}`);
});
