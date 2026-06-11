/* Step 1: 问卷结构输入 - 支持源代码/可视化双模式 */
;(function(){
const StepInput = {
  activeMode: 'source', // 'source' | 'visual'

  init() {
    this.editor = document.getElementById('input-editor');
    this.preview = document.getElementById('input-preview');
    this.visEditor = document.getElementById('vis-editor');

    // 加载默认示例（根据当前语言）
    this.editor.value = I18n.t('step1.defaultExample');
    this._usingDefault = true;

    this._initModeToggle();
    this._initVisEventDelegation();
    document.getElementById('btn-preview').addEventListener('click', () => this.previewSurvey());
    document.getElementById('btn-parse').addEventListener('click', () => this.nextStep());
    document.getElementById('btn-clear').addEventListener('click', () => this.clearEditor());
    let dt;
    this.editor.addEventListener('input', () => {
      this._usingDefault = false;
      clearTimeout(dt); dt = setTimeout(() => this.previewSurvey(), 500);
    });
    // 初始预览
    this.previewSurvey();
  },

  _initModeToggle() {
    document.querySelectorAll('.mode-toggle-group[data-for="step1"] .mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-toggle-group[data-for="step1"] .mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.activeMode = mode;
        if (mode === 'visual') {
          this._switchToVisual();
        } else {
          this._switchToSource();
        }
        // 同步到编辑器内容后触发预览
        clearTimeout(this._previewTimer);
        this._previewTimer = setTimeout(() => this.previewSurvey(), 100);
      });
    });
  },

  _switchToVisual() {
    // 从源代码解析并生成可视化表单
    document.getElementById('input-editor').classList.remove('active');
    this.visEditor.classList.add('active');
    const data = this.getData();
    if (data && data.questions.length > 0) {
      this._renderVisualEditor(data);
    } else {
      this.visEditor.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;padding:12px 0;">'+I18n.t('step1.vis.placeholder')+'</div>';
    }
  },

  _switchToSource() {
    // 从可视化表单序列化回源代码
    this.visEditor.classList.remove('active');
    document.getElementById('input-editor').classList.add('active');
    const text = this._serializeVisual();
    if (text !== null) {
      this.editor.value = text;
    }
  },

  _renderVisualEditor(data) {
    let html = '<div class="vis-field"><label>'+I18n.t('step1.label.title')+'</label><input type="text" id="vis-title" value="' + this._escHtml(data.title || '') + '"></div>';
    html += '<div class="vis-field"><label>'+I18n.t('step1.label.desc')+'</label><input type="text" id="vis-desc" value="' + this._escHtml(data.desc || '') + '"></div>';
    html += '<div id="vis-questions">';
    data.questions.forEach((q, idx) => {
      html += this._renderQuestionItem(q, idx);
    });
    html += '</div>';
    html += '<button class="vis-q-add" id="vis-add-question">'+I18n.t('step1.add.question')+'</button>';
    this.visEditor.innerHTML = html;
  },

  _renderQuestionItem(q, idx) {
    let html = '<div class="vis-question-item" data-qindex="' + idx + '">';
    html += '<div class="vis-q-header">';
    html += '<span style="font-size:11px;color:var(--text-secondary);">' + (idx + 1) + '.</span>';
    html += '<select class="vis-q-type" data-qindex="' + idx + '">';
    html += '<option value="sc"' + (q.type === 'sc' ? ' selected' : '') + '>'+I18n.t('step1.type.sc')+'</option>';
    html += '<option value="mc"' + (q.type === 'mc' ? ' selected' : '') + '>'+I18n.t('step1.type.mc')+'</option>';
    html += '<option value="a"' + (q.type === 'a' ? ' selected' : '') + '>'+I18n.t('step1.type.a')+'</option>';
    html += '</select>';
    html += '<input type="text" class="vis-q-text" data-qindex="' + idx + '" value="' + this._escHtml(q.text) + '" placeholder="'+I18n.t('step1.card.title')+'">';
    html += '<button class="vis-q-remove" data-qindex="' + idx + '">'+I18n.t('step1.remove')+'</button>';
    html += '</div>';
    if (q.type !== 'a') {
      html += '<div class="vis-options" data-qindex="' + idx + '">';
      q.options.forEach((opt, oi) => {
        html += this._renderOptionItem(idx, oi, opt);
      });
      html += '<button class="vis-option-add" data-qindex="' + idx + '">'+I18n.t('step1.add.option')+'</button>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  },

  _renderOptionItem(qidx, oi, text) {
    const label = String.fromCharCode(65 + oi);
    return '<div class="vis-option-row" data-qindex="' + qidx + '" data-oindex="' + oi + '">'
      + '<span>' + label + '.</span>'
      + '<input type="text" class="vis-opt-text" data-qindex="' + qidx + '" data-oindex="' + oi + '" value="' + this._escHtml(text) + '" placeholder="'+I18n.t('step1.add.option')+'">'
      + '<button class="vis-option-remove" data-qindex="' + qidx + '" data-oindex="' + oi + '">×</button>'
      + '</div>';
  },

  _initVisEventDelegation() {
    const that = this;
    this.visEditor.addEventListener('input', (e) => {
      // 标题/描述/题目文本/选项文本变化
      const target = e.target;
      if (target.id === 'vis-title' || target.id === 'vis-desc' ||
          target.classList.contains('vis-q-text') || target.classList.contains('vis-opt-text')) {
        that._onVisualChange();
      }
    });
    this.visEditor.addEventListener('change', (e) => {
      if (e.target.classList.contains('vis-q-type')) {
        const idx = parseInt(e.target.dataset.qindex, 10);
        const newType = e.target.value;
        that._changeQuestionType(idx, newType);
      }
    });
    this.visEditor.addEventListener('click', (e) => {
      // 删除题目
      if (e.target.classList.contains('vis-q-remove')) {
        const idx = parseInt(e.target.dataset.qindex, 10);
        that._removeQuestion(idx);
        return;
      }
      // 删除选项
      if (e.target.classList.contains('vis-option-remove')) {
        const qidx = parseInt(e.target.dataset.qindex, 10);
        const oi = parseInt(e.target.dataset.oindex, 10);
        that._removeOption(qidx, oi);
        return;
      }
      // 添加选项
      if (e.target.classList.contains('vis-option-add')) {
        const qidx = parseInt(e.target.dataset.qindex, 10);
        that._addOption(qidx);
        return;
      }
      // 添加题目
      if (e.target.id === 'vis-add-question') {
        that._addQuestion();
        return;
      }
    });
  },

  _onVisualChange() {
    // 标记需要更新预览
    clearTimeout(this._previewTimer);
    this._previewTimer = setTimeout(() => this.previewSurvey(), 200);
  },

  _changeQuestionType(idx, newType) {
    const qEl = document.querySelector('.vis-question-item[data-qindex="' + idx + '"]');
    const optContainer = qEl.querySelector('.vis-options');
    if (newType === 'a') {
      if (optContainer) optContainer.remove();
    } else {
      if (!optContainer) {
        const opts = document.createElement('div');
        opts.className = 'vis-options';
        opts.dataset.qindex = idx;
        const firstRow = document.createElement('div');
        firstRow.className = 'vis-option-row';
        firstRow.dataset.qindex = idx;
        firstRow.dataset.oindex = 0;
        firstRow.innerHTML = '<span>A.</span><input type="text" class="vis-opt-text" data-qindex="' + idx + '" data-oindex="0" placeholder="选项内容"><button class="vis-option-remove" data-qindex="' + idx + '" data-oindex="0">×</button>';
        opts.appendChild(firstRow);
        const addBtn = document.createElement('button');
        addBtn.className = 'vis-option-add';
        addBtn.dataset.qindex = idx;
        addBtn.textContent = I18n.t('step1.add.option');
        opts.appendChild(addBtn);
        qEl.appendChild(opts);
      }
    }
    this._onVisualChange();
  },

  _removeQuestion(idx) {
    const qEl = document.querySelector('.vis-question-item[data-qindex="' + idx + '"]');
    if (qEl) {
      qEl.remove();
      this._renumberQuestions();
      this._onVisualChange();
    }
  },

  _removeOption(qidx, oi) {
    const row = document.querySelector('.vis-option-row[data-qindex="' + qidx + '"][data-oindex="' + oi + '"]');
    const container = document.querySelector('.vis-options[data-qindex="' + qidx + '"]');
    if (row && container && container.querySelectorAll('.vis-option-row').length > 1) {
      row.remove();
      this._renumberOptions(qidx);
      this._onVisualChange();
    }
  },

  _addOption(qidx) {
    const container = document.querySelector('.vis-options[data-qindex="' + qidx + '"]');
    const rows = container.querySelectorAll('.vis-option-row');
    const addBtn = container.querySelector('.vis-option-add');
    const newOi = rows.length;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this._renderOptionItem(qidx, newOi, '');
    const newRow = tempDiv.firstElementChild;
    container.insertBefore(newRow, addBtn);
    this._onVisualChange();
  },

  _addQuestion() {
    const container = document.getElementById('vis-questions');
    const addBtn = document.getElementById('vis-add-question');
    const idx = container.querySelectorAll('.vis-question-item').length;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this._renderQuestionItem({ type: 'sc', text: '', options: [''] }, idx);
    const newQ = tempDiv.firstElementChild;
    container.insertBefore(newQ, addBtn);
    this._onVisualChange();
  },

  _renumberQuestions() {
    const items = document.querySelectorAll('.vis-question-item');
    items.forEach((el, idx) => {
      el.dataset.qindex = idx;
      const numSpan = el.querySelector('.vis-q-header > span:first-child');
      if (numSpan) numSpan.textContent = (idx + 1) + '.';
      el.querySelectorAll('[data-qindex]').forEach(sub => {
        if (sub.dataset.qindex) sub.dataset.qindex = idx;
      });
    });
  },

  _renumberOptions(qidx) {
    const rows = document.querySelectorAll('.vis-option-row[data-qindex="' + qidx + '"]');
    rows.forEach((row, oi) => {
      row.dataset.oindex = oi;
      const label = row.querySelector('span');
      if (label) label.textContent = String.fromCharCode(65 + oi) + '.';
      row.querySelectorAll('[data-oindex]').forEach(sub => {
        if (sub.dataset.oindex) sub.dataset.oindex = oi;
      });
    });
  },

  _serializeVisual() {
    const title = document.getElementById('vis-title');
    const desc = document.getElementById('vis-desc');
    const questionItems = document.querySelectorAll('.vis-question-item');
    if (!title) return null;

    let text = 'title ' + (title.value.trim() || '未命名问卷');
    if (desc && desc.value.trim()) {
      text += '\ndes ' + desc.value.trim();
    }
    questionItems.forEach(qEl => {
      const qtype = qEl.querySelector('.vis-q-type').value;
      const qtext = qEl.querySelector('.vis-q-text').value.trim();
      if (!qtext) return;
      text += '\n\n' + qtype + ' ' + qtext;
      if (qtype !== 'a') {
        qEl.querySelectorAll('.vis-option-row').forEach(optRow => {
          const optText = optRow.querySelector('.vis-opt-text').value.trim();
          if (optText) text += '\n  ' + optText;
        });
      }
    });
    return text;
  },

  getData() {
    const t = this.editor.value.trim();
    return t ? LiteQParser.parse(t) : null;
  },

  previewSurvey() {
    // 同步可视化模式到 textarea
    if (this.activeMode === 'visual') {
      const synced = this._serializeVisual();
      if (synced) this.editor.value = synced;
    }
    const p = this.getData();
    if (!p || p.questions.length === 0) {
      this.preview.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;">'+I18n.t('step1.preview.nodata')+'</div>';
      return;
    }
    let h = '';
    if (p.title) h += '<div style="font-size:16px;margin-bottom:8px;"><strong>' + this._escHtml(p.title) + '</strong></div>';
    if (p.desc) h += '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;">' + this._escHtml(p.desc) + '</div>';
    h += '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">'+I18n.t('step1.count',{n:p.questions.length})+'</div>';
    const m = { sc: I18n.t('step1.type.sc'), mc: I18n.t('step1.type.mc'), a: I18n.t('step1.type.a') };
    p.questions.forEach((q, idx) => {
      h += '<div class="q-item"><div class="q-title">' + (idx + 1) + '. ' + this._escHtml(q.text) + ' <span class="q-type">' + m[q.type] + '</span></div>';
      if (q.options.length > 0) h += '<div class="q-options">' + q.options.map(o => '<div>- ' + this._escHtml(o) + '</div>').join('') + '</div>';
      h += '</div>';
    });
    if (p.errors && p.errors.length > 0) {
      h += '<div style="margin-top:12px;padding:8px;border:1px solid var(--error);color:var(--error);font-size:12px;">' + p.errors.map(e => '<div>' + this._escHtml(e) + '</div>').join('') + '</div>';
    }
    this.preview.innerHTML = h;
  },

  refreshDefaultExample() {
    if (!this._usingDefault) return;
    this.editor.value = I18n.t('step1.defaultExample');
    this._usingDefault = true;
  },

  clearEditor() {
    this.editor.value = '';
    this.visEditor.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;padding:12px 0;">'+I18n.t('step1.vis.placeholder')+'</div>';
    this.preview.innerHTML = '<div style="color:var(--text-secondary);font-size:13px;">'+I18n.t('step1.clear.empty')+'</div>';
    // 切换到源代码模式
    document.querySelectorAll('.mode-toggle-group[data-for="step1"] .mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.mode-toggle-group[data-for="step1"] .mode-btn[data-mode="source"]').classList.add('active');
    this.activeMode = 'source';
    document.getElementById('input-editor').classList.add('active');
    this.visEditor.classList.remove('active');
  },

  nextStep() {
    // 确保可视化数据已同步
    if (this.activeMode === 'visual') {
      const synced = this._serializeVisual();
      if (synced) this.editor.value = synced;
    }
    const p = this.getData();
    if (!p || p.questions.length === 0) { alert(I18n.t('step1.input.empty')); return; }
    if (p.errors && p.errors.length > 0) {
      if (!confirm(I18n.t('step1.parse.error',{errors:p.errors.join('\n')}))) return;
    }
    App.setState({ surveyData: p });
    App.goToStep(2);
  },

  _escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
window.StepInput = StepInput;
})();
