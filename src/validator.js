/**
 * LiteQ - 结果数据校验器 (Node.js 模块)
 */

function validate(questions, total, data) {
  const errors = [];
  if (!total || total <= 0) {
    errors.push({ questionIndex: -1, optionIndex: null, message: '总人数必须大于 0', type: 'global' });
    return errors;
  }

  questions.forEach((q, qi) => {
    if (q.type === 'a') {
      if (data[qi] && data[qi].length > 0) {
        errors.push({ questionIndex: qi, optionIndex: null, message: `"${q.text}" 为问答题，不应有数据行`, type: 'question' });
      }
      return;
    }

    const row = data[qi];
    if (!row || row.length === 0) {
      errors.push({ questionIndex: qi, optionIndex: null, message: `"${q.text}" 缺少数据`, type: 'question' });
      return;
    }

    if (row.length !== q.options.length) {
      errors.push({ questionIndex: qi, optionIndex: null, message: `"${q.text}" 需要 ${q.options.length} 个数据，实际 ${row.length} 个`, type: 'question' });
      return;
    }

    let sum = 0;
    row.forEach((val, oi) => {
      if (typeof val !== 'number' || val < 0 || !Number.isInteger(val)) {
        errors.push({ questionIndex: qi, optionIndex: oi, message: `"${q.text}" 选项 "${q.options[oi]}" : 人数必须为非负整数`, type: 'option' });
      }
      sum += val;
    });

    if (q.type === 'sc' && sum > total) {
      errors.push({ questionIndex: qi, optionIndex: null, message: `"${q.text}" : 单选题总和 (${sum}) 超过总人数 (${total})`, type: 'question' });
    }
  });

  return errors;
}

function parseDataText(rawText) {
  const errors = [];
  const lines = rawText.split('\n').filter(l => l.trim());
  let total = 0;
  const data = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.toLowerCase().startsWith('total:')) {
      const val = parseInt(line.slice(6).trim(), 10);
      if (isNaN(val) || val <= 0) errors.push(`第 ${i + 1} 行：总人数格式错误`);
      else total = val;
      continue;
    }

    const numbers = line.split(/\s+/).map(s => parseInt(s, 10));
    if (numbers.some(n => isNaN(n))) {
      errors.push(`第 ${i + 1} 行：数据格式错误，应为空格分隔的数字`);
      data.push([]);
    } else {
      data.push(numbers);
    }
  }

  if (total <= 0) errors.push('缺少有效的 total 数据');
  return { total, data, errors: errors.length > 0 ? errors : [] };
}

function getScRemaining(total, row) {
  if (!row || row.length === 0) return total;
  const sum = row.reduce((a, b) => a + b, 0);
  return Math.max(0, total - sum);
}

function getMcOptionRemaining(total, value) {
  return Math.max(0, total - value);
}

function isComplete(questions, data) {
  return questions.every((q, qi) => {
    if (q.type === 'a') return true;
    return data[qi] && data[qi].length === q.options.length;
  });
}

module.exports = { validate, parseDataText, getScRemaining, getMcOptionRemaining, isComplete };
