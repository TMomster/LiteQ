/* Step 3: 输出配置 & 服务器打印 */
;(function(){
const StepOutput = {
  init() {
    this.outputContainer = document.getElementById('output-result');
    this.viewToggles = document.querySelectorAll('.view-toggle-item');

    this.viewToggles.forEach(el => {
      el.addEventListener('click', () => { el.classList.toggle('selected'); this.renderOutput(); });
    });

    document.getElementById('per-page').addEventListener('input', () => {
      const v = parseInt(document.getElementById('per-page').value, 10) || 0;
      LiteQOutput.setPerPage(v); this.renderOutput();
    });

    document.getElementById('btn-print').addEventListener('click', () => window.print());

    document.getElementById('btn-copy-markdown').addEventListener('click', () => {
      App.copyAsMarkdown();
    });

    // 报告设置开关
    ['show-header','show-footer','show-watermark'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => { this._applyConfig(); this.renderOutput(); });
    });
    // 水印行数列数滑块
    ['watermark-rows','watermark-cols','watermark-opacity'].forEach(id => {
      const slider=document.getElementById(id);
      const valEl=document.getElementById(id+'-val');
      slider.addEventListener('input', () => {
        if(id==='watermark-opacity') valEl.textContent=slider.value+'%';
        else valEl.textContent=slider.value;
        this._applyConfig(); this.renderOutput();
      });
    });

    document.getElementById('btn-back-to-2').addEventListener('click', () => App.goToStep(2));
    document.getElementById('btn-back-to-1').addEventListener('click', () => App.goToStep(1));
  },

  loadData(surveyData, resultData, total) {
    this.surveyData = surveyData;
    LiteQOutput.setData(surveyData, resultData, total);
    this.renderOutput();
  },



  _applyConfig() {
    LiteQOutput.setConfig({
      showReportHeader: document.getElementById('show-header').checked,
      showReportFooter: document.getElementById('show-footer').checked,
      showWatermark: document.getElementById('show-watermark').checked,
      watermarkRows: parseInt(document.getElementById('watermark-rows').value,10),
      watermarkCols: parseInt(document.getElementById('watermark-cols').value,10),
      watermarkOpacity: parseInt(document.getElementById('watermark-opacity').value,10)/100,
    });
  },

  getEnabledViews() {
    const e = [];
    this.viewToggles.forEach(el => { if (el.classList.contains('selected')) e.push(el.dataset.view); });
    return e.length > 0 ? e : ['questionnaire'];
  },

  renderOutput() {
    this._applyConfig();
    const enabled = this.getEnabledViews();
    LiteQOutput.render(enabled, this.outputContainer);
  },


};
window.StepOutput = StepOutput;
})();
