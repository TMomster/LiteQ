/**
 * LiteQ - 国际化支持 (i18n)
 * 中英文切换，所有用户可见文本统一管理
 */
const I18n = {
  currentLang: localStorage.getItem('liteq-lang') || 'en',

  strings: {
    zh: {
      /* ── 通用 ── */
      'lang.toggle': 'EN',
      'app.title': 'LiteQ - MomsterTech',
      'btn.help.title': '语法帮助',
      'btn.theme.title': '切换主题',

      /* ── 步骤导航 ── */
      'step1.label': '问卷结构',
      'step2.label': '结果数据',
      'step3.label': '输出',

      /* ── Step 1 ── */
      'step1.card.title': '编辑问卷结构',
      'step1.source': '源代码',
      'step1.visual': '可视化',
      'step1.editor.placeholder': '在此输入问卷结构...\ntitle 问卷标题\ndes 问卷描述\n\nsc 单选题\n  选项1\n  选项2',
      'step1.preview.btn': '预览',
      'step1.clear.btn': '清空',
      'step1.confirm.btn': '确认',
      'step1.preview.card': '预览',
      'step1.preview.empty': '输入问卷结构后点击"预览"查看',
      'step1.preview.nodata': '请在编辑区输入问卷结构，点击"预览"查看',
      'step1.clear.empty': '已清空编辑器',
      'step1.vis.placeholder': '请在源代码模式输入有效的问卷结构后切换到可视化编辑',
      'step1.label.title': '问卷标题',
      'step1.label.desc': '问卷描述',
      'step1.add.question': '+ 添加题目',
      'step1.add.option': '+ 添加选项',
      'step1.remove': '删除',
      'step1.type.sc': '单选',
      'step1.type.mc': '多选',
      'step1.type.a': '问答',
      'step1.count': '共 {n} 题',
      'step1.input.empty': '请先输入有效的问卷结构',
      'step1.parse.error': '存在解析错误，是否继续？\n{errors}',
      'step1.defaultExample': 'title 用户满意度调查\ndes 本次调查旨在了解用户对我司产品的满意度\n\nsc 您的性别是\n  男\n  女\n\nsc 您的年龄段\n  18-25岁\n  26-35岁\n  36-45岁\n  45岁以上\n\nmc 您使用过我司哪些产品\n  产品A\n  产品B\n  产品C\n  产品D\n\na 您对我们的产品有何建议',

      /* ── Step 2 ── */
      'step2.total.card': '总人数',
      'step2.total.placeholder': '输入总人数...',
      'step2.data.card': '各题数据',
      'step2.visual': '可视化',
      'step2.source': '源代码',
      'step2.batch.placeholder': 'total: 总人数\n选项1人数 选项2人数 ...\n(每行对应一道题，按顺序)',
      'step2.batch.parse': '解析并填充',
      'step2.back': '返回',
      'step2.next': '生成结果',
      'step2.a.empty': '问答题无需数据输入',
      'step2.remaining': '剩余: {n}',
      'step2.mc.remaining': '可剩: {n}',
      'step2.mc.over': '超限: {n}',
      'step2.error.emptyStep1': '请先在第 1 步输入问卷结构',
      'step2.error.emptyData': '请先在第 2 步输入数据',
      'step2.error.total': '请输入有效的总人数',
      'step2.error.batchEmpty': '请先输入批量数据',
      'step2.error.batchParse': '批量解析错误：\n{errors}',
      'step2.error.sourceEmpty': '请在源代码编辑器中输入数据',
      'step2.warning.missing': '以下题目缺少完整数据，是否继续？\n{missing}',
      'step2.error.dataIssue': '数据存在错误，请修正：\n{errors}',
      'step2.error.scSumOver': '"{q}" 单选题总和 ({s}) 超过总人数 ({t})',
      'step2.error.scSumOverDiff': '"{q}" 单选题选择人数总和 ({s}) 超过总人数 ({t})，超出 {diff}',
      'step2.error.optionOver': '"{q}" 选项 "{opt}" 人数 ({v}) 超过总人数 ({t})',
      'step2.error.sourceParse': '源代码解析错误：\n{errors}',

      /* ── Step 3 ── */
      'step3.config.card': '输出配置',
      'step3.view.label': '显示视图',
      'step3.view.q': '问卷形式',
      'step3.view.table': '统计表格',
      'step3.view.pie': '饼图',
      'step3.view.bar': '条图',
      'step3.perPage.label': '每页题数',
      'step3.perPage.hint': '(0 表示不分页)',
      'step3.report.label': '报告设置',
      'step3.report.header': '显示报告头',
      'step3.report.footer': '显示报告尾',
      'step3.report.watermark': '水印',
      'step3.watermark.rows': '行数:',
      'step3.watermark.cols': '列数:',
      'step3.watermark.opacity': '透明度:',
      'step3.btn.backData': '← 返回数据',
      'step3.btn.backStruct': '← 返回结构',
      'step3.btn.markdown': '复制 Markdown',
      'step3.btn.print': '打印',

      /* ── 报告 ── */
      'report.header': '{title} 问卷调查结果导出',
      'report.title': '问卷结果',
      'report.meta.time': '生成时间:',
      'report.meta.total': '参与人数:',
      'report.footer': '- LiteQ 提供技术支持 -',
      'report.page': 'Page {cur} / {total}',
      'report.type.sc': '单选',
      'report.type.mc': '多选',
      'report.type.a': '问答',
      'report.type.unknown': '未知',
      'report.a.empty': '暂不支持统计开放性论述的数据',
      'report.table.option': '选项',
      'report.table.count': '人数',
      'report.table.percent': '占比',
      'report.table.type': '类型',
      'report.section.q': '问卷形式',
      'report.section.table': '统计表格',
      'report.section.pie': '饼图',
      'report.section.bar': '条形图',
      'report.generated': '由 LiteQ 生成 · {date}',
      'report.label': '人',

      /* ── 水印 ── */
      'watermark.text': 'LiteQ 提供技术支持',

      /* ── Parser 错误 ── */
      'parser.error.missingTitle': '缺少问卷标题 (title)',
      'parser.error.noQuestions': '未解析到任何题目',
      'parser.error.emptyText': '第 {n} 行：题目文本不能为空',
      'parser.error.duplicateOption': '第 {n} 行：重复选项 "{opt}"',
      'parser.error.notEnoughOptions': '题目 "{q}"：{type}至少需要 2 个选项',
      'parser.error.unrecognizedLine': '第 {n} 行：无法识别的行 "{line}"',
      'parser.error.invalidTotal': '第 {n} 行：总人数格式错误',
      'parser.error.invalidData': '第 {n} 行：数据格式错误',
      'parser.error.missingTotal': '缺少有效的 total 数据',

      /* ── Validator 错误 ── */
      'validator.error.total': '总人数必须大于 0',
      'validator.error.aHasData': '"{q}" 为问答题，不应有数据行',
      'validator.error.missingData': '"{q}" 缺少数据',
      'validator.error.dataLength': '"{q}" 需要 {n} 个数据，实际 {m} 个',
      'validator.error.invalidValue': '"{q}" 选项 "{opt}": 人数必须为非负整数',
      'validator.error.sumOverTotal': '"{q}": 单选题总和 ({s}) 超过总人数 ({t})',

      /* ── App ── */
      'app.copy.markdownTitle': '已复制为 Markdown 格式到剪贴板\n\n该格式可直接粘贴给 AI 助手理解问卷数据。',
      'app.copy.missingData': '请先完成问卷结构和数据输入',
      'app.copy.aiTitle': '问卷数据',
      'app.copy.noTitle': '（无标题）',
      'app.copy.desc': '描述',
      'app.copy.total': '总人数',
      'app.copy.openAnswer': '（开放式回答，无统计数据）',

      /* ── 帮助页面 ── */
      'help.short': '语法帮助',
      'help.question.title': '问题格式指南 - LiteQ',
      'help.question.subtitle': '本指南说明如何编写问卷调查的问题结构',
      'help.answer.title': '答案数据格式指南 - LiteQ',
      'help.answer.subtitle': '本指南说明如何按照实际调研结果填写问卷答案数据',
      'help.btn.copy': '复制全文 (AI 提示词)',
      'help.back': '← 返回 LiteQ',
      'help.next': '查看答案格式指南 →',
      'help.prev': '查看问题格式指南 →',
      'help.ai.prompt1': '已复制完整语法指南到剪贴板！\n\n粘贴到 AI 大模型后，在"我的要求："后面写上你的问卷主题即可。',
      'help.ai.prompt2': '已复制完整答案格式指南到剪贴板！\n\n粘贴到 AI 大模型后，在"我的要求："后面写上你的问卷结构和总人数即可。',
      'help.ai.prompt1.en': '',
      'help.ai.prompt2.en': '',
    },

    en: {
      /* ── General ── */
      'lang.toggle': '中',
      'app.title': 'LiteQ - MomsterTech',
      'btn.help.title': 'Syntax Help',
      'btn.theme.title': 'Toggle Theme',

      /* ── Step Nav ── */
      'step1.label': 'Survey',
      'step2.label': 'Data',
      'step3.label': 'Export',

      /* ── Step 1 ── */
      'step1.card.title': 'Edit Survey Structure',
      'step1.source': 'Source',
      'step1.visual': 'Visual',
      'step1.editor.placeholder': 'Enter survey structure...\ntitle Survey Title\ndes Survey Description\n\nsc Single Choice\n  Option 1\n  Option 2',
      'step1.preview.btn': 'Preview',
      'step1.clear.btn': 'Clear',
      'step1.confirm.btn': 'Confirm',
      'step1.preview.card': 'Preview',
      'step1.preview.empty': 'Enter survey structure and click "Preview" to view',
      'step1.preview.nodata': 'Enter survey structure in the editor, then click "Preview"',
      'step1.clear.empty': 'Editor cleared',
      'step1.vis.placeholder': 'Enter a valid survey structure in Source mode first, then switch to Visual',
      'step1.label.title': 'Survey Title',
      'step1.label.desc': 'Survey Description',
      'step1.add.question': '+ Add Question',
      'step1.add.option': '+ Add Option',
      'step1.remove': 'Remove',
      'step1.type.sc': 'Single',
      'step1.type.mc': 'Multiple',
      'step1.type.a': 'Open',
      'step1.count': '{n} questions total',
      'step1.input.empty': 'Please enter a valid survey structure first',
      'step1.parse.error': 'Parse errors found. Continue?\n{errors}',
      'step1.defaultExample': 'title Customer Satisfaction Survey\ndes This survey aims to understand customer satisfaction with our products\n\nsc Your Gender\n  Male\n  Female\n\nsc Your Age Group\n  18-25\n  26-35\n  36-45\n  45+\n\nmc Which of our products have you used\n  Product A\n  Product B\n  Product C\n  Product D\n\na Do you have any suggestions for our products',

      /* ── Step 2 ── */
      'step2.total.card': 'Total Participants',
      'step2.total.placeholder': 'Enter total...',
      'step2.data.card': 'Question Data',
      'step2.visual': 'Visual',
      'step2.source': 'Source',
      'step2.batch.placeholder': 'total: total_count\nopt1_count opt2_count ...\n(one line per question, in order)',
      'step2.batch.parse': 'Parse & Fill',
      'step2.back': 'Back',
      'step2.next': 'Generate',
      'step2.a.empty': 'Open-ended questions need no data',
      'step2.remaining': 'Remaining: {n}',
      'step2.mc.remaining': 'Available: {n}',
      'step2.mc.over': 'Exceed: {n}',
      'step2.error.emptyStep1': 'Please complete Step 1 first',
      'step2.error.emptyData': 'Please complete Step 2 first',
      'step2.error.total': 'Please enter a valid total number',
      'step2.error.batchEmpty': 'Please enter batch data first',
      'step2.error.batchParse': 'Batch parse error:\n{errors}',
      'step2.error.sourceEmpty': 'Please enter data in source editor',
      'step2.warning.missing': 'Some questions have missing data. Continue?\n{missing}',
      'step2.error.dataIssue': 'Data has errors, please fix:\n{errors}',
      'step2.error.scSumOver': '"{q}" single-choice sum ({s}) exceeds total ({t})',
      'step2.error.scSumOverDiff': '"{q}" single-choice sum ({s}) exceeds total ({t}), over by {diff}',
      'step2.error.optionOver': '"{q}" option "{opt}" value ({v}) exceeds total ({t})',
      'step2.error.sourceParse': 'Source parse error:\n{errors}',

      /* ── Step 3 ── */
      'step3.config.card': 'Output Settings',
      'step3.view.label': 'Display Views',
      'step3.view.q': 'Questionnaire',
      'step3.view.table': 'Statistics',
      'step3.view.pie': 'Pie Chart',
      'step3.view.bar': 'Bar Chart',
      'step3.perPage.label': 'Questions/Page',
      'step3.perPage.hint': '(0 = no pagination)',
      'step3.report.label': 'Report Settings',
      'step3.report.header': 'Show Header',
      'step3.report.footer': 'Show Footer',
      'step3.report.watermark': 'Watermark',
      'step3.watermark.rows': 'Rows:',
      'step3.watermark.cols': 'Cols:',
      'step3.watermark.opacity': 'Opacity:',
      'step3.btn.backData': '← Data',
      'step3.btn.backStruct': '← Survey',
      'step3.btn.markdown': 'Copy Markdown',
      'step3.btn.print': 'Print',

      /* ── Report ── */
      'report.header': '{title} — Survey Results',
      'report.title': 'Survey Results',
      'report.meta.time': 'Generated:',
      'report.meta.total': 'Participants:',
      'report.footer': '- Powered by LiteQ -',
      'report.page': 'Page {cur} / {total}',
      'report.type.sc': 'Single',
      'report.type.mc': 'Multiple',
      'report.type.a': 'Open',
      'report.type.unknown': 'Unknown',
      'report.a.empty': 'Statistical data for open-ended questions is not supported',
      'report.table.option': 'Option',
      'report.table.count': 'Count',
      'report.table.percent': 'Percentage',
      'report.table.type': 'Type',
      'report.section.q': 'Questionnaire',
      'report.section.table': 'Statistics',
      'report.section.pie': 'Pie Charts',
      'report.section.bar': 'Bar Charts',
      'report.generated': 'Generated by LiteQ · {date}',
      'report.label': 'people',

      /* ── Watermark ── */
      'watermark.text': 'Powered by LiteQ',

      /* ── Parser Errors ── */
      'parser.error.missingTitle': 'Missing survey title (title)',
      'parser.error.noQuestions': 'No questions found',
      'parser.error.emptyText': 'Line {n}: Question text cannot be empty',
      'parser.error.duplicateOption': 'Line {n}: Duplicate option "{opt}"',
      'parser.error.notEnoughOptions': 'Question "{q}": {type} needs at least 2 options',
      'parser.error.unrecognizedLine': 'Line {n}: Unrecognized line "{line}"',
      'parser.error.invalidTotal': 'Line {n}: Invalid total format',
      'parser.error.invalidData': 'Line {n}: Invalid data format',
      'parser.error.missingTotal': 'Missing valid total data',

      /* ── Validator Errors ── */
      'validator.error.total': 'Total must be greater than 0',
      'validator.error.aHasData': '"{q}" is open-ended, should have no data',
      'validator.error.missingData': '"{q}" is missing data',
      'validator.error.dataLength': '"{q}" needs {n} values, got {m}',
      'validator.error.invalidValue': '"{q}" option "{opt}": value must be non-negative integer',
      'validator.error.sumOverTotal': '"{q}": single-choice sum ({s}) exceeds total ({t})',

      /* ── App ── */
      'app.copy.markdownTitle': 'Copied as Markdown to clipboard\n\nPaste directly to AI assistants to analyze survey data.',
      'app.copy.missingData': 'Please complete survey structure and data input first',
      'app.copy.aiTitle': 'Survey Data',
      'app.copy.noTitle': '(No Title)',
      'app.copy.desc': 'Description',
      'app.copy.total': 'Total',
      'app.copy.openAnswer': '(Open-ended, no statistical data)',

      /* ── Help Pages ── */
      'help.short': 'Help',
      'help.question.title': 'Question Format Guide - LiteQ',
      'help.question.subtitle': 'Guide on how to write survey question structures',
      'help.answer.title': 'Answer Data Format Guide - LiteQ',
      'help.answer.subtitle': 'Guide on how to fill survey answer data',
      'help.btn.copy': 'Copy Full Text (AI Prompt)',
      'help.back': '← Back to LiteQ',
      'help.next': 'View Answer Format Guide →',
      'help.prev': 'View Question Format Guide →',
      'help.ai.prompt1': 'Copied full syntax guide to clipboard!\n\nPaste into AI model, then write your survey topic after "My requirement:".',
      'help.ai.prompt2': 'Copied full answer format guide to clipboard!\n\nPaste into AI model, then write your survey structure after "My requirement:".',
    }
  },

  getLang() {
    return this.currentLang;
  },

  isEN() {
    return this.currentLang === 'en';
  },

  t(key, ...args) {
    let str = (this.strings[this.currentLang] && this.strings[this.currentLang][key])
           || (this.strings.zh && this.strings.zh[key])
           || key;
    if (args.length > 0 && typeof args[0] === 'object') {
      for (const [k, v] of Object.entries(args[0])) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return str;
  },

  applyDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = this.t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      el.value = this.t(el.getAttribute('data-i18n-value'));
    });
  },

  toggle() {
    this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('liteq-lang', this.currentLang);
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    this.applyDOM();
    if (this._onChange) this._onChange();
  },

  _onChange: null,

  onChange(fn) {
    this._onChange = fn;
  },

  init() {
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    this.applyDOM();
  }
};

window.I18n = I18n;
