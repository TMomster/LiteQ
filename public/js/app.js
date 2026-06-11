/**
 * LiteQ - 应用状态管理 & 核心逻辑
 * 包含: LiteQParser, LiteQValidator, LiteQChart, LiteQOutput, App
 */

/* ─── 解析器 ─── */
const LiteQParser = {
  parse(rawText) {
    const errors = [];
    const result = { title: '', desc: '', questions: [] };
    const lines = rawText.split('\n');
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim(); i++;
      if (!line) continue;
      const tM = line.match(/^title(?:\s|:)\s*(.*)/i);
      if (tM) { result.title = tM[1].trim(); continue; }
      const dM = line.match(/^des(?:\s|:)\s*(.*)/i);
      if (dM) { result.desc = dM[1].trim(); continue; }
      const typeM = line.match(/^(sc|mc|a|ae)(?:\s|:)\s*(.*)/i);
      if (typeM) {
        const type = typeM[1].toLowerCase() === 'ae' ? 'a' : typeM[1].toLowerCase();
        const qt = typeM[2].trim();
        if (!qt) { errors.push(I18n.t('parser.error.emptyText',{n:i})); continue; }
        const q = { type, text: qt, options: [], index: result.questions.length };
        while (i < lines.length) {
          const nl = lines[i], tr = nl.trim();
          if (!tr || /^(sc|mc|a|ae|title|des)(\s|:)/i.test(tr)) break;
          if (nl.startsWith('  ') || nl.startsWith('\t') || tr.startsWith('-')) {
            const ot = tr.replace(/^[-*\s]+/, '').trim();
            if (ot) {
              if (q.options.includes(ot)) errors.push(I18n.t('parser.error.duplicateOption',{n:i+1,opt:ot}));
              else q.options.push(ot);
            }
          }
          i++;
        }
        if ((type==='sc'||type==='mc') && q.options.length < 2) errors.push(I18n.t('parser.error.notEnoughOptions',{q:qt,type:type==='sc'?I18n.t('report.type.sc'):I18n.t('report.type.mc')}));
        result.questions.push(q);
        continue;
      }
      errors.push(I18n.t('parser.error.unrecognizedLine',{n:i,line:line}));
    }
    if (!result.title) errors.push(I18n.t('parser.error.missingTitle'));
    if (result.questions.length === 0) errors.push(I18n.t('parser.error.noQuestions'));
    return { ...result, errors };
  }
};

/* ─── 校验器 ─── */
const LiteQValidator = {
  validate(questions, total, data) {
    const errors = [];
    if (!total||total<=0) { errors.push({questionIndex:-1,optionIndex:null,message:I18n.t('validator.error.total'),type:'global'}); return errors; }
    questions.forEach((q,qi)=>{
      if (q.type==='a') {
        if (data[qi]&&data[qi].length>0) errors.push({questionIndex:qi,optionIndex:null,message:I18n.t('validator.error.aHasData',{q:q.text}),type:'question'});
        return;
      }
      const r=data[qi];
      if (!r||r.length===0) { errors.push({questionIndex:qi,optionIndex:null,message:I18n.t('validator.error.missingData',{q:q.text}),type:'question'}); return; }
      if (r.length!==q.options.length) { errors.push({questionIndex:qi,optionIndex:null,message:I18n.t('validator.error.dataLength',{q:q.text,n:q.options.length,m:r.length}),type:'question'}); return; }
      let s=0; r.forEach((v,oi)=>{ if (typeof v!=='number'||v<0||!Number.isInteger(v)) errors.push({questionIndex:qi,optionIndex:oi,message:I18n.t('validator.error.invalidValue',{q:q.text,opt:q.options[oi]}),type:'option'}); s+=v; });
      if (q.type==='sc'&&s>total) errors.push({questionIndex:qi,optionIndex:null,message:I18n.t('validator.error.sumOverTotal',{q:q.text,s:s,t:total}),type:'question'});
    });
    return errors;
  },
  parseDataText(rawText) {
    const e=[]; const l=rawText.split('\n').filter(l=>l.trim()); let t=0; const d=[];
    for(let i=0;i<l.length;i++){const ln=l[i].trim();if(!ln)continue;
      if(ln.toLowerCase().startsWith('total:')){const v=parseInt(ln.slice(6).trim(),10);if(isNaN(v)||v<=0)e.push(I18n.t('parser.error.invalidTotal',{n:i+1}));else t=v;continue;}
      const n=ln.split(/\s+/).map(s=>parseInt(s,10));if(n.some(n=>isNaN(n))){e.push(I18n.t('parser.error.invalidData',{n:i+1}));d.push([]);}else d.push(n);}
    if(t<=0)e.push(I18n.t('parser.error.missingTotal'));return{total:t,data:d,errors:e.length>0?e:[]};
  },
  getScRemaining(total,row){if(!row||row.length===0)return total;return Math.max(0,total-row.reduce((a,b)=>a+b,0));},
  getMcOptionRemaining(total,value){return Math.max(0,total-value);}
};

/* ─── Chart ─── */
const LiteQChart = {
  _maxLabelLen(labels){return Math.max(...labels.map(function(l){return l.length;}));},
  renderPie(id,labels,data,title){(function(){
    var c=document.getElementById(id);if(!c)return;
    var dk=document.documentElement.getAttribute('data-theme')==='dark',tc=dk?'#e0e0e0':'#2c2c2c';
    var ml=LiteQChart._maxLabelLen(labels);
    var ls=12,lp=16,bw=16;
    if(ml>14){ls=9;lp=8;bw=10;}else if(ml>10){ls=10;lp=10;bw=12;}else if(ml>6){ls=11;lp=12;bw=14;}
    var pos=ml>12?'right':'bottom';
    new Chart(c,{type:'pie',data:{labels:labels,datasets:[{data:data,backgroundColor:['rgba(44,44,44,0.8)','rgba(100,100,100,0.8)','rgba(160,120,80,0.8)','rgba(80,130,160,0.8)','rgba(130,80,140,0.8)','rgba(60,140,100,0.8)','rgba(170,90,70,0.8)','rgba(90,110,140,0.8)','rgba(150,100,110,0.8)','rgba(70,120,120,0.8)'],borderColor:dk?'#111115':'#f8f6f0',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{position:pos,labels:{font:{family:'DengXian Light, DengXian, sans-serif',size:ls},color:tc,padding:lp,boxWidth:bw}},title:{display:!!title,text:title||'',font:{family:'DengXian Light, DengXian, sans-serif',size:14},color:tc,padding:{bottom:12}}}}});
  })();},
  renderBar(id,labels,data,title){(function(){
    var c=document.getElementById(id);if(!c)return;
    var dk=document.documentElement.getAttribute('data-theme')==='dark',tc=dk?'#e0e0e0':'#2c2c2c',gc=dk?'#333340':'#d0cec6';
    var ml=LiteQChart._maxLabelLen(labels);
    var ts=11,rot=0;
    if(ml>14){ts=9;rot=35;}else if(ml>10){ts=10;rot=25;}else if(ml>6){ts=10;rot=10;}
    var p=c.parentElement;
    if(p&&ml>10){p.style.minHeight=ml>14?'360px':'300px';}
    new Chart(c,{type:'bar',data:{labels:labels,datasets:[{label:'人数',data:data,backgroundColor:['rgba(44,44,44,0.7)','rgba(100,100,100,0.7)','rgba(160,120,80,0.7)','rgba(80,130,160,0.7)','rgba(130,80,140,0.7)','rgba(60,140,100,0.7)','rgba(170,90,70,0.7)','rgba(90,110,140,0.7)','rgba(150,100,110,0.7)','rgba(70,120,120,0.7)'],borderColor:['rgba(44,44,44,1)','rgba(100,100,100,1)','rgba(160,120,80,1)','rgba(80,130,160,1)','rgba(130,80,140,1)','rgba(60,140,100,1)','rgba(170,90,70,1)','rgba(90,110,140,1)','rgba(150,100,110,1)','rgba(70,120,120,1)'],borderWidth:1,borderRadius:0,barPercentage:0.7}]},options:{responsive:true,maintainAspectRatio:true,scales:{x:{ticks:{font:{family:'DengXian Light, DengXian, sans-serif',size:ts},color:tc,maxRotation:rot,minRotation:rot,autoSkip:ml>6,autoSkipPadding:ml>14?6:10},grid:{color:gc}},y:{beginAtZero:true,ticks:{font:{family:'DengXian Light, DengXian, sans-serif',size:11},color:tc,stepSize:1},grid:{color:gc}}},plugins:{legend:{display:false},title:{display:!!title,text:title||'',font:{family:'DengXian Light, DengXian, sans-serif',size:14},color:tc,padding:{bottom:12}}}}});
  })();}
};

/* ─── 输出 ─── */
const LiteQOutput = {
  currentData:null,renderOrder:['questionnaire','table','pie','bar'],perPage:0,
  config:{showWatermark:false,watermarkRows:5,watermarkCols:6,watermarkOpacity:0.12,showReportHeader:true,showReportFooter:true},
  setData(s,r,t){this.currentData={surveyData:s,resultData:r,total:t};},
  setOrder(o){this.renderOrder=o;},
  setPerPage(n){this.perPage=Math.max(0,parseInt(n,10)||0);},
  setConfig(o){Object.assign(this.config,o);},
  _createWatermark(title){
    const wm=document.createElement('div');wm.className='report-watermark-layer';
    const nr=parseInt(this.config.watermarkRows,10)||5;
    const nc=parseInt(this.config.watermarkCols,10)||6;
    const txt=I18n.t('watermark.text');
    const op=this.config.watermarkOpacity;
    for(let ri=0;ri<nr;ri++){
      for(let ci=0;ci<nc;ci++){
        const el=document.createElement('div');el.className='report-watermark-text';
        el.textContent=txt;
        el.style.opacity=op;
        el.style.left=((ci+0.5)/nc*100)+'%';el.style.top=((ri+0.5)/nr*100)+'%';
        el.style.transform='translate(-20px,-8px) rotate(-30deg)';
        wm.appendChild(el);
      }
    }
    return wm;
  },
  render(ev,c){
    if(!this.currentData)return;
    const{surveyData:s,resultData:r,total:t}=this.currentData;c.innerHTML='';

    const wrapper=document.createElement('div');
    wrapper.className='report-wrapper';

    // 水印层
    if(this.config.showWatermark)wrapper.appendChild(this._createWatermark(s.title));

    // 专业报告头部
    const dhdr=document.createElement('div');
    dhdr.className='report-header';
    if(this.config.showReportHeader){
      const ht=document.createElement('div');
      ht.className='report-header-text';
      ht.textContent=I18n.t('report.header',{title:s.title||''});
      dhdr.appendChild(ht);
    }
    const dTitle=document.createElement('div');
    dTitle.className='report-title';
    dTitle.textContent=s.title||I18n.t('report.title');
    dhdr.appendChild(dTitle);
    if(s.desc){
      const dDesc=document.createElement('div');
      dDesc.className='report-desc';
      dDesc.textContent=s.desc;
      dhdr.appendChild(dDesc);
    }
    // 元信息：生成时间 + 参与人数
    const meta=document.createElement('div');
    meta.className='report-meta';
    const now=new Date();
    const ds=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    meta.innerHTML='<span class="report-meta-item">'+I18n.t('report.meta.time')+' <strong>'+ds+'</strong></span><span class="report-meta-item">'+I18n.t('report.meta.total')+' <strong>'+t+'</strong></span>';
    dhdr.appendChild(meta);
    wrapper.appendChild(dhdr);

    const hr=document.createElement('hr');
    hr.className='report-divider';
    wrapper.appendChild(hr);

    const v=this.renderOrder.filter(x=>ev.includes(x));
    if(this.perPage>0)this._renderPaginated(v,s,r,t,wrapper);
    else v.forEach((vt,vi)=>{const f=this._renderViewType(vt,s,r,t);if(f){if(vi>0){const sep=document.createElement('hr');sep.className='report-divider';wrapper.appendChild(sep);}wrapper.appendChild(f);}});

    // 报告尾
    if(this.config.showReportFooter){
      const ft=document.createElement('div');
      ft.className='report-footer';
      ft.textContent=I18n.t('report.footer');
      wrapper.appendChild(ft);
    }

    c.appendChild(wrapper);
  },
  _renderPaginated(v,s,r,t,c){
    const items=[];
    v.forEach(vt=>{if(vt==='questionnaire'||vt==='table')s.questions.forEach((q,qi)=>items.push({vt,qi}));else s.questions.forEach((q,qi)=>{if(q.type==='sc'||q.type==='mc')items.push({vt,qi});});});
    const pages=[];for(let i=0;i<items.length;i+=this.perPage)pages.push(items.slice(i,i+this.perPage));
    if(pages.length===0)return;
    pages.forEach((pi,idx)=>{const pd=document.createElement('div');pd.className='report-page-card';
      const ph=document.createElement('div');ph.className='report-page-indicator';
      ph.textContent=`Page ${idx+1} / ${pages.length}`;pd.appendChild(ph);
      pi.forEach((item,ix)=>{const el=this._renderQuestionItem(item.vt,s,r,item.qi);if(el){pd.appendChild(el);if(ix<pi.length-1){const sep=document.createElement('hr');sep.className='report-divider';pd.appendChild(sep);}}});
      c.appendChild(pd);});
  },
  _renderViewType(vt,s,r,t){
    const w=document.createElement('div');
    if(vt==='questionnaire'){s.questions.forEach((q,qi,arr)=>{const el=this._renderQuestionnaireItem(q,r[qi]||[],qi);if(el){w.appendChild(el);if(qi<arr.length-1){const sep=document.createElement('hr');sep.style.cssText='border:none;border-top:1px solid var(--table-border);margin:20px 0;';w.appendChild(sep);}}});return w;}
    if(vt==='table'){const tb=this._renderFullTable(s,r);if(tb)w.appendChild(tb);return w;}
    if(vt==='pie'||vt==='bar'){s.questions.forEach((q,qi,arr)=>{if(q.type!=='sc'&&q.type!=='mc')return;const d=r[qi];if(!d)return;
      const id=`chart-${vt}-${qi}-${Date.now()}`;const cw=document.createElement('div');cw.className='chart-wrapper';
      const cv=document.createElement('canvas');cv.id=id;cw.appendChild(cv);w.appendChild(cw);
      if(qi<arr.length-1){const sep=document.createElement('hr');sep.style.cssText='border:none;border-top:1px solid var(--table-border);margin:20px 0;';w.appendChild(sep);}
      setTimeout(()=>{if(vt==='pie')LiteQChart.renderPie(id,q.options,d,q.text);else LiteQChart.renderBar(id,q.options,d,q.text);},50);});return w;}
    return null;
  },
  _renderQuestionItem(vt,s,r,qi){const q=s.questions[qi];if(!q)return null;const d=r[qi]||[];
    if(vt==='questionnaire')return this._renderQuestionnaireItem(q,d,qi);
    if(vt==='table')return this._renderTableItem(q,d);
    if(vt==='pie'||vt==='bar'){if(q.type!=='sc'&&q.type!=='mc')return null;if(!d||d.length===0)return null;
      const id=`chart-${vt}-${qi}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;const cw=document.createElement('div');cw.className='chart-wrapper';
      const cv=document.createElement('canvas');cv.id=id;cw.appendChild(cv);
      setTimeout(()=>{if(vt==='pie')LiteQChart.renderPie(id,q.options,d,q.text);else LiteQChart.renderBar(id,q.options,d,q.text);},50);return cw;}
    return null;
  },
  _renderQuestionnaireItem(q,d,qi){const item=document.createElement('div');item.className='report-question';
    const hdr=document.createElement('div');hdr.className='report-q-header';
    const num=document.createElement('span');num.className='report-q-num';num.textContent=qi+1;hdr.appendChild(num);
    const txt=document.createElement('span');txt.className='report-q-text';txt.textContent=q.text;hdr.appendChild(txt);
    const badge=document.createElement('span');badge.className='report-q-type';badge.textContent=I18n.t('report.type.'+q.type)||I18n.t('report.type.unknown');hdr.appendChild(badge);
    item.appendChild(hdr);
    if(q.type==='a'){const ab=document.createElement('div');ab.className='report-empty';ab.textContent=I18n.t('report.a.empty');item.appendChild(ab);}
    else{const ts=d.reduce((a,b)=>a+b,0);
      q.options.forEach((opt,oi)=>{const c=d[oi]||0;const p=ts>0?((c/ts)*100).toFixed(1):0;const row=document.createElement('div');row.className='report-option-row';
        row.innerHTML='<span class="report-opt-label">'+opt+'</span><span class="report-opt-val">'+c+' '+I18n.t('report.label')+' ('+p+'%)</span>';
        const bw=document.createElement('div');bw.className='report-bar-wrap';
        const bar=document.createElement('div');bar.className='report-bar';bar.style.width=p+'%';bw.appendChild(bar);
        row.appendChild(bw);item.appendChild(row);});}
    return item;
  },
  _renderFullTable(s,r){
    const w=document.createElement('div');
    s.questions.forEach((q,qi,arr)=>{
      if(qi>0){const sep=document.createElement('hr');sep.className='report-divider';w.appendChild(sep);}
      const d=r[qi]||[];const block=document.createElement('div');
      block.className='report-question';
      const hdr=document.createElement('div');hdr.className='report-section-title';
      hdr.textContent=`${qi+1}. ${q.text}`;
      block.appendChild(hdr);
      if(q.type==='a'){
        const empty=document.createElement('div');empty.className='report-empty';empty.textContent=I18n.t('report.a.empty');block.appendChild(empty);
      }else{
        const t=document.createElement('table');t.className='report-table';
        const thead=document.createElement('thead');const thr=document.createElement('tr');
        [I18n.t('report.table.option'),I18n.t('report.table.count'),I18n.t('report.table.percent')].forEach(txt=>{const th=document.createElement('th');th.textContent=txt;thr.appendChild(th);});
        thead.appendChild(thr);t.appendChild(thead);
        const tb=document.createElement('tbody');
        const ts=d.reduce((a,b)=>a+b,0);
        q.options.forEach((opt,oi)=>{
          const c=d[oi]||0;const p=ts>0?((c/ts)*100).toFixed(1)+'%':'0%';
          const tr=document.createElement('tr');
          tr.innerHTML=`<td>${opt}</td><td>${c}</td><td>${p}</td>`;
          tb.appendChild(tr);
        });
        t.appendChild(tb);block.appendChild(t);
      }
      w.appendChild(block);
    });
    return w;
  },
  _renderTableItem(q,d){if(q.type==='a'){const dd=document.createElement('div');dd.className='report-empty';dd.style.margin='8px 0';dd.textContent=q.text+' - '+I18n.t('report.a.empty');return dd;}
    const wrapper=document.createElement('div');wrapper.className='report-question';wrapper.style.padding='16px 20px';
    const tt=document.createElement('div');tt.className='report-q-text';tt.style.marginBottom='8px';tt.textContent=q.text;wrapper.appendChild(tt);
    const st=document.createElement('table');st.className='report-table';
    const thead=document.createElement('thead');const thr=document.createElement('tr');[I18n.t('report.table.option'),I18n.t('report.table.count'),I18n.t('report.table.percent')].forEach(t=>{const th=document.createElement('th');th.textContent=t;thr.appendChild(th);});thead.appendChild(thr);st.appendChild(thead);
    const tb=document.createElement('tbody');const ts=d.reduce((a,b)=>a+b,0);
    q.options.forEach((opt,oi)=>{const c=d[oi]||0;const p=ts>0?((c/ts)*100).toFixed(1)+'%':'0%';const tr=document.createElement('tr');tr.innerHTML=`<td>${opt}</td><td>${c}</td><td>${p}</td>`;tb.appendChild(tr);});
    st.appendChild(tb);wrapper.appendChild(st);return wrapper;
  }
};

/* ─── 应用主控 ─── */
const App = {
  state: { surveyData: null, resultData: null, total: 0, currentStep: 1, theme: 'light' },

  init() {
    this.state.theme = localStorage.getItem('liteq-theme') || 'light';
    if (this.state.theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    I18n.init();
    document.getElementById('btn-lang-toggle').addEventListener('click', () => I18n.toggle());
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('btn-help-header').addEventListener('click', () => {
      window.open('/help/question-format'+(I18n.isEN()?'.en':''), '_blank');
    });

    // 语言切换时重新渲染当前步骤
    I18n.onChange(() => {
      const step = App.state.currentStep;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = I18n.t(el.getAttribute('data-i18n'));
      });
      if (step === 1) {
        StepInput.refreshDefaultExample();
        StepInput.previewSurvey();
      }
      if (step === 2) StepResult.loadSurvey(App.state.surveyData);
      if (step === 3) StepOutput.renderOutput();
    });

    StepInput.init();
    StepResult.init();
    StepOutput.init();

    // 顶部步骤指示器点击跳转
    this._initStepNavClick();
    this.goToStep(1);
  },

  setState(p) { Object.assign(this.state, p); },

  _copyText(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
      alert(msg);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert(msg);
    });
  },

  /**
   * 将当前问卷数据 + 结果生成 AI 友好的 Markdown 并复制到剪贴板
   */
  copyAsMarkdown() {
    const { surveyData, resultData, total } = this.state;
    if (!surveyData || !resultData) {
      alert(I18n.t('app.copy.missingData'));
      return;
    }

    const lines = [];
    lines.push('# '+I18n.t('app.copy.aiTitle'));
    lines.push('');
    lines.push('**'+I18n.t('app.copy.desc')+'**：'+(surveyData.title||I18n.t('app.copy.noTitle')));
    if (surveyData.desc) lines.push('**'+I18n.t('app.copy.desc')+'**：'+surveyData.desc);
    lines.push('**'+I18n.t('app.copy.total')+'**：'+total);
    lines.push('');

    surveyData.questions.forEach((q, qi) => {
      const typeMap = { sc: I18n.t('report.type.sc'), mc: I18n.t('report.type.mc'), a: I18n.t('report.type.a') };
      const d = resultData[qi] || [];
      const ts = q.type === 'a' ? 0 : d.reduce((a, b) => a + b, 0);

      lines.push(`## ${qi + 1}. [${typeMap[q.type]}] ${q.text}`);
      lines.push('');

      if (q.type === 'a') {
        lines.push(I18n.t('app.copy.openAnswer'));
      } else {
        lines.push('| '+I18n.t('report.table.option')+' | '+I18n.t('report.table.count')+' | '+I18n.t('report.table.percent')+' |');
        lines.push('|------|------|------|');
        q.options.forEach((opt, oi) => {
          const c = d[oi] || 0;
          const p = ts > 0 ? ((c / ts) * 100).toFixed(1) + '%' : '0%';
          lines.push(`| ${opt} | ${c} | ${p} |`);
        });
      }
      lines.push('');
    });

    this._copyText(lines.join('\n'), I18n.t('app.copy.markdownTitle'));
  },

  toggleTheme() {
    const nt = this.state.theme === 'light' ? 'dark' : 'light';
    this.state.theme = nt;
    document.documentElement.setAttribute('data-theme', nt);
    localStorage.setItem('liteq-theme', nt);
  },

  _initStepNavClick() {
    const hasEditorContent = () => document.getElementById('input-editor').value.trim().length > 0;
    const hasResultContent = () => App.state.resultData && App.state.resultData.length > 0;
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById('step-indicator-' + i);
      if (!el) continue;
      el.addEventListener('click', () => {
        if (i === 1) { App.goToStep(1); return; }
        if (i === 2) {
          if (hasEditorContent()) { StepInput.nextStep(); return; }
          alert(I18n.t('step2.error.emptyStep1'));
          return;
        }
        if (i === 3) {
          if (this.state.surveyData && hasResultContent()) { App.goToStep(3); return; }
          if (hasEditorContent()) { StepInput.nextStep(); return; }
          if (!hasEditorContent()) alert(I18n.t('step2.error.emptyStep1'));
          else alert(I18n.t('step2.error.emptyData'));
        }
      });
    }
  },

  goToStep(step) {
    this.state.currentStep = step;
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.add('active');
    document.querySelectorAll('.step-item').forEach((el, idx) => {
      const n = idx + 1;
      el.classList.remove('active', 'done');
      if (n === step) el.classList.add('active');
      else if (n < step) el.classList.add('done');
    });
    if (step === 2 && this.state.surveyData) StepResult.loadSurvey(this.state.surveyData);
    if (step === 3 && this.state.surveyData && this.state.resultData) StepOutput.loadData(this.state.surveyData, this.state.resultData, this.state.total);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
