/* Step 2: 结果数据输入 - 支持可视化/源代码双模式，移除全局统计，逐题校验 */
;(function(){
const StepResult = {
  init() {
    this.container = document.getElementById('result-inputs');
    this.totalInput = document.getElementById('total-input');
    this.errorList = document.getElementById('result-errors');
    this.batchTextarea = document.getElementById('batch-data');
    this.sourceEditor = document.getElementById('result-source-editor');
    document.getElementById('btn-batch-parse').addEventListener('click', () => this.parseBatch());
    document.getElementById('btn-result-next').addEventListener('click', () => this.nextStep());
    document.getElementById('btn-result-back').addEventListener('click', () => App.goToStep(1));
    this.totalInput.addEventListener('input', () => this.validateAll());

    // 模式切换
    document.querySelectorAll('.mode-toggle-group[data-for="step2"] .mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-toggle-group[data-for="step2"] .mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this._setMode(mode);
      });
    });
  },

  _setMode(mode) {
    if (mode === 'source') {
      this.container.classList.remove('active');
      this.sourceEditor.classList.add('active');
    } else {
      this.sourceEditor.classList.remove('active');
      this.container.classList.add('active');
    }
  },

  loadSurvey(data) {
    this.surveyData = data;
    this.resultData = [];
    // 切换到可视化模式
    document.querySelectorAll('.mode-toggle-group[data-for="step2"] .mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.mode-toggle-group[data-for="step2"] .mode-btn[data-mode="visual"]').classList.add('active');
    this._setMode('visual');
    this._renderInputs();
  },

  _renderInputs() {
    this.container.innerHTML = '';
    this.resultData = [];
    this.surveyData.questions.forEach((q, qi) => {
      const w = document.createElement('div');
      w.className = 'result-input-area error-scroll-anchor';
      w.dataset.qindex = qi;
      w.style.cssText = 'margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--table-border);';
      const m = { sc: I18n.t('step1.type.sc'), mc: I18n.t('step1.type.mc'), a: I18n.t('step1.type.a') };
      const t = document.createElement('div');
      t.style.cssText = 'font-size:13px;margin-bottom:8px;';
      t.innerHTML = '<strong>' + (qi + 1) + '. ' + this._escHtml(q.text) + '</strong> <span style="font-size:11px;color:var(--text-secondary);letter-spacing:0.5px;">' + m[q.type] + '</span>';
      // 仅单选题显示题级剩余
      if (q.type === 'sc') {
        const r = document.createElement('span');
        r.className = 'remaining-per-question';
        r.style.cssText = 'font-size:11px;margin-left:10px;color:var(--text-secondary);';
        r.textContent = I18n.t('step2.remaining',{n:'—'});
        t.appendChild(r);
      }
      w.appendChild(t);
      if (q.type === 'a') {
        const n = document.createElement('div');
        n.style.cssText = 'font-size:12px;color:var(--text-secondary);padding:8px;border:1px solid var(--border);';
        n.textContent = I18n.t('step2.a.empty');
        w.appendChild(n);
      } else {
        this.resultData[qi] = [];
        q.options.forEach((opt, oi) => {
          const row = document.createElement('div');
          row.className = 'result-input-row';
          const lb = document.createElement('label');
          lb.textContent = opt;
          const inp = document.createElement('input');
          inp.type = 'number';
          inp.min = 0;
          inp.step = 1;
          inp.dataset.qindex = qi;
          inp.dataset.oindex = oi;
          inp.placeholder = '0';
          inp.value = '';
          inp.addEventListener('input', () => {
            const v = parseInt(inp.value, 10);
            this.resultData[qi][oi] = isNaN(v) ? 0 : v;
            inp.classList.toggle('error-field', isNaN(v) || v < 0 || v.toString() !== inp.value);
            this.validateAll();
          });
          row.appendChild(lb);
          row.appendChild(inp);
          if (q.type === 'mc') {
            const rm = document.createElement('span');
            rm.className = 'remaining-per-option';
            rm.style.cssText = 'font-size:11px;margin-left:8px;color:var(--text-secondary);white-space:nowrap;';
            rm.textContent = I18n.t('step2.mc.remaining',{n:'—'});
            row.appendChild(rm);
          }
          w.appendChild(row);
        });
      }
      this.container.appendChild(w);
    });
    this.validateAll();
  },

  validateAll() {
    const total = parseInt(this.totalInput.value, 10) || 0;
    const data = [];
    if (!this.surveyData) return;
    this.surveyData.questions.forEach((q, qi) => {
      data[qi] = (q.type === 'a') ? [] : (this.resultData[qi] || []);
    });

    // 清空之前的高亮
    document.querySelectorAll('.result-input-area.has-error').forEach(el => el.classList.remove('has-error'));
    document.querySelectorAll('.result-input-row .error-field').forEach(el => el.classList.remove('error-field'));

    // 逐题校验
    this.surveyData.questions.forEach((q, qi) => {
      if (q.type === 'a') return;

      // 更新单选题题级剩余
      if (q.type === 'sc') {
        const rowData = data[qi] || [];
        const sum = rowData.reduce((a, b) => (a || 0) + (b || 0), 0);
        const rem = total - sum;
        const sp = this.container.querySelector('.result-input-area[data-qindex="' + qi + '"] .remaining-per-question');
        if (sp) {
          if (rem < 0) {
            sp.textContent = I18n.t('step2.remaining',{n:rem});
            sp.style.color = 'var(--error)';
            sp.style.fontWeight = 'bold';
          } else {
            sp.textContent = I18n.t('step2.remaining',{n:rem});
            sp.style.color = 'var(--text-secondary)';
            sp.style.fontWeight = 'normal';
          }
        }
        // 单项超出总和报红
        let hasError = false;
        rowData.forEach((v, oi) => {
          if (v > total) {
            const inp = this.container.querySelector('input[data-qindex="' + qi + '"][data-oindex="' + oi + '"]');
            if (inp) inp.classList.add('error-field');
            hasError = true;
          }
        });
        if (sum > total || hasError) {
          const area = this.container.querySelector('.result-input-area[data-qindex="' + qi + '"]');
          if (area) area.classList.add('has-error');
        }
      }

      // 多选题每个选项单独校验
      if (q.type === 'mc') {
        const rowData = data[qi] || [];
        let hasError = false;
        rowData.forEach((v, oi) => {
          const inp = this.container.querySelector('input[data-qindex="' + qi + '"][data-oindex="' + oi + '"]');
          const remSpan = this.container.querySelector('.result-input-row input[data-qindex="' + qi + '"][data-oindex="' + oi + '"]')
            ?.closest('.result-input-row')?.querySelector('.remaining-per-option');
          if (v > total) {
            if (inp) inp.classList.add('error-field');
            hasError = true;
          }
          if (remSpan) {
            const rem = total - v;
            if (rem < 0) {
              remSpan.textContent = I18n.t('step2.mc.over',{n:rem});
              remSpan.style.color = 'var(--error)';
              remSpan.style.fontWeight = 'bold';
            } else {
              remSpan.textContent = I18n.t('step2.mc.remaining',{n:rem});
              remSpan.style.color = 'var(--text-secondary)';
              remSpan.style.fontWeight = 'normal';
            }
          }
        });
        if (hasError) {
          const area = this.container.querySelector('.result-input-area[data-qindex="' + qi + '"]');
          if (area) area.classList.add('has-error');
        }
      }
    });

    // 收集错误信息
    const errors = [];
    this.surveyData.questions.forEach((q, qi) => {
      if (q.type === 'a') return;
      const rowData = data[qi] || [];
      if (q.type === 'sc') {
        const sum = rowData.reduce((a, b) => (a || 0) + (b || 0), 0);
        if (sum > total) {
          errors.push({ questionIndex: qi, optionIndex: null, message: I18n.t('step2.error.scSumOverDiff',{q:q.text,s:sum,t:total,diff:sum-total}) });
        }
        rowData.forEach((v, oi) => {
          if (v > total) {
            errors.push({ questionIndex: qi, optionIndex: oi, message: I18n.t('step2.error.optionOver',{q:q.text,opt:q.options[oi],v:v,t:total}) });
          }
        });
      }
      if (q.type === 'mc') {
        rowData.forEach((v, oi) => {
          if (v > total) {
            errors.push({ questionIndex: qi, optionIndex: oi, message: I18n.t('step2.error.optionOver',{q:q.text,opt:q.options[oi],v:v,t:total}) });
          }
        });
      }
    });

    if (errors.length > 0) {
      this.errorList.innerHTML = errors.map(e => {
        return '<div style="padding:4px 0;font-size:12px;color:var(--error);cursor:pointer;" data-qi="' + e.questionIndex + '">- ' + this._escHtml(e.message) + '</div>';
      }).join('');
      this.errorList.classList.remove('hidden');
      // 点击错误跳转到对应题目区域
      this.errorList.querySelectorAll('[data-qi]').forEach(el => {
        el.addEventListener('click', () => {
          const qi = parseInt(el.dataset.qi, 10);
          const area = this.container.querySelector('.result-input-area[data-qindex="' + qi + '"]');
          if (area) area.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    } else {
      this.errorList.classList.add('hidden');
    }
  },

  parseBatch() {
    const text = this.batchTextarea.value.trim();
    if (!text) { alert(I18n.t('step2.error.batchEmpty')); return; }
    const { total, data, errors } = LiteQValidator.parseDataText(text);
    if (errors.length > 0) { alert(I18n.t('step2.error.batchParse',{errors:errors.join('\n')})); return; }
    this.totalInput.value = total;
    this.surveyData.questions.forEach((q, qi) => {
      if (q.type === 'a') return;
      const rowData = data[qi] || [];
      rowData.forEach((val, oi) => {
        const inp = document.querySelector('input[data-qindex="' + qi + '"][data-oindex="' + oi + '"]');
        if (inp) {
          inp.value = val;
          this.resultData[qi] = this.resultData[qi] || [];
          this.resultData[qi][oi] = val;
        }
      });
    });
    // 解析后自动切换回可视化模式
    document.querySelectorAll('.mode-toggle-group[data-for="step2"] .mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.mode-toggle-group[data-for="step2"] .mode-btn[data-mode="visual"]').classList.add('active');
    this._setMode('visual');
    this.validateAll();
  },

  getResultData() {
    const total = parseInt(this.totalInput.value, 10) || 0;
    const data = [];
    this.surveyData.questions.forEach((q, qi) => {
      data[qi] = (q.type === 'a') ? [] : ((this.resultData[qi] || []).map(v => parseInt(v, 10) || 0));
    });
    return { total, data };
  },

  nextStep() {
    // 如果在源代码模式，先自动解析填充
    if (this.sourceEditor.classList.contains('active')) {
      const text = this.batchTextarea.value.trim();
      if (!text) { alert(I18n.t('step2.error.sourceEmpty')); return; }
      const { total, data, errors } = LiteQValidator.parseDataText(text);
      if (errors.length > 0) { alert(I18n.t('step2.error.sourceParse',{errors:errors.join('\n')})); return; }
      // 填充可视化输入框
      this.totalInput.value = total;
      this.surveyData.questions.forEach((q, qi) => {
        if (q.type === 'a') return;
        const rowData = data[qi] || [];
        rowData.forEach((val, oi) => {
          const inp = document.querySelector('input[data-qindex="' + qi + '"][data-oindex="' + oi + '"]');
          if (inp) {
            inp.value = val;
            this.resultData[qi] = this.resultData[qi] || [];
            this.resultData[qi][oi] = val;
          }
        });
      });
      this.validateAll();
    }

    const { total, data } = this.getResultData();
    if (total <= 0) { alert(I18n.t('step2.error.total')); return; }

    // 校验错误
    const errors = [];
    this.surveyData.questions.forEach((q, qi) => {
      if (q.type === 'a') return;
      const rowData = data[qi] || [];
      if (q.type === 'sc') {
        const sum = rowData.reduce((a, b) => (a || 0) + (b || 0), 0);
        if (sum > total) {
          errors.push({ questionIndex: qi, message: I18n.t('step2.error.scSumOver',{q:q.text,s:sum,t:total}) });
        }
        rowData.forEach((v, oi) => {
          if (v > total) {
            errors.push({ questionIndex: qi, message: I18n.t('step2.error.optionOver',{q:q.text,opt:q.options[oi],v:v,t:total}) });
          }
        });
      }
      if (q.type === 'mc') {
        rowData.forEach((v, oi) => {
          if (v > total) {
            errors.push({ questionIndex: qi, message: I18n.t('step2.error.optionOver',{q:q.text,opt:q.options[oi],v:v,t:total}) });
          }
        });
      }
    });

    if (errors.length > 0) {
      // 跳转到第一个错误题目
      const firstQi = errors[0].questionIndex;
      const firstArea = this.container.querySelector('.result-input-area[data-qindex="' + firstQi + '"]');
      if (firstArea) {
        // 先确保可视化模式
        document.querySelectorAll('.mode-toggle-group[data-for="step2"] .mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.mode-toggle-group[data-for="step2"] .mode-btn[data-mode="visual"]').classList.add('active');
        this._setMode('visual');
        setTimeout(() => firstArea.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
      alert(I18n.t('step2.error.dataIssue',{errors:errors.map(e=>e.message).join('\n')}));
      return;
    }

    const missing = [];
    this.surveyData.questions.forEach((q, qi) => {
      if (q.type === 'a') return;
      if (!data[qi] || data[qi].length !== q.options.length || data[qi].some(v => isNaN(v))) missing.push(q.text);
    });
    if (missing.length > 0) {
      if (!confirm(I18n.t('step2.warning.missing',{missing:missing.join('\n')}))) return;
    }
    App.setState({ resultData: data, total });
    App.goToStep(3);
  },

  _escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
window.StepResult = StepResult;
})();
