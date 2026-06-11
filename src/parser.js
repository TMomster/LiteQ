/**
 * LiteQ - 问卷语法解析器 (Node.js 模块)
 * 解析 title/des/sc/mc/a 格式的文本为结构化问卷数据
 */

function parse(rawText) {
  const errors = [];
  const result = { title: '', desc: '', questions: [] };
  const lines = rawText.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    i++;
    if (!line) continue;

    const titleMatch = line.match(/^title(?:\s|:)\s*(.*)/i);
    if (titleMatch) { result.title = titleMatch[1].trim(); continue; }

    const descMatch = line.match(/^des(?:\s|:)\s*(.*)/i);
    if (descMatch) { result.desc = descMatch[1].trim(); continue; }

    const typeMatch = line.match(/^(sc|mc|a|ae)(?:\s|:)\s*(.*)/i);
    if (typeMatch) {
      const type = typeMatch[1].toLowerCase() === 'ae' ? 'a' : typeMatch[1].toLowerCase();
      const questionText = typeMatch[2].trim();
      if (!questionText) { errors.push(`第 ${i} 行：题目文本不能为空`); continue; }

      const question = { type, text: questionText, options: [], index: result.questions.length };

      while (i < lines.length) {
        const nextLine = lines[i];
        const trimmed = nextLine.trim();
        if (!trimmed || /^(sc|mc|a|ae|title|des)(\s|:)/i.test(trimmed)) break;
        if (nextLine.startsWith('  ') || nextLine.startsWith('\t') || trimmed.startsWith('-')) {
          const optionText = trimmed.replace(/^[-*\s]+/, '').trim();
          if (optionText) {
            if (question.options.includes(optionText)) {
              errors.push(`第 ${i + 1} 行：重复选项 "${optionText}"`);
            } else {
              question.options.push(optionText);
            }
          }
        }
        i++;
      }

      if ((type === 'sc' || type === 'mc') && question.options.length < 2) {
        errors.push(`题目 "${questionText}"：${type === 'sc' ? '单选题' : '多选题'}至少需要 2 个选项`);
      }
      result.questions.push(question);
      continue;
    }

    errors.push(`第 ${i} 行：无法识别的行 "${line}"`);
  }

  if (!result.title) errors.push('缺少问卷标题 (title)');
  if (result.questions.length === 0) errors.push('未解析到任何题目');

  return { ...result, errors };
}

function toPreview(data) {
  let text = data.title ? `[${data.title}]` : '[未命名问卷]';
  if (data.desc) text += `\n${data.desc}`;
  text += `\n共 ${data.questions.length} 题\n`;
  const typeMap = { sc: '单选', mc: '多选', a: '问答' };
  data.questions.forEach((q, idx) => {
    text += `\n${idx + 1}. ${q.text} [${typeMap[q.type] || q.type}]`;
    if (q.options.length > 0) q.options.forEach(opt => { text += `\n   - ${opt}`; });
  });
  return text;
}

function serialize(data) {
  let text = '';
  if (data.title) text += `title: ${data.title}\n`;
  if (data.desc) text += `des: ${data.desc}\n`;
  data.questions.forEach(q => {
    text += `\n${q.type}: ${q.text}\n`;
    q.options.forEach(opt => { text += `  ${opt}\n`; });
  });
  return text.trim();
}

module.exports = { parse, toPreview, serialize };
