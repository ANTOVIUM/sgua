const API='https://hmdjcxpogdrveddznedx.supabase.co/rest/v1/rpc/civilist_exam_api';
const KEY='sb_publishable_6mDpQ-hKERSZngTl8Ki5LQ_JkHGbOd4';
const STORE='civilist.principles.v1';
const BLOCKS=['Карта принципов','Юридический конфликт','Пределы свободы','Досье: добросовестность','Решение цивилиста'];
const ROMAN=['I','II','III','IV','V'];
const COMP=['Понимание принципов','Пределы осуществления гражданских прав','Договорная квалификация','Системное юридическое мышление'];
const DIAG=['Основные потери баллов связаны с содержанием и разграничением принципов гражданского права.','Основная трудность возникла при определении пределов осуществления субъективного гражданского права и юридического значения недобросовестного поведения.','Следует обратить внимание на пределы свободы договора и системную связь договорных условий с обязательными нормами законодательства.','Итоговый результат снижен из-за неполной квалификационной цепочки от фактических обстоятельств к норме и правовому последствию.'];
const ERR={exam_closed:'Прием новых работ закрыт преподавателем.',invalid_identity:'Проверьте ФИО и учебную группу.',attempt_not_found:'Попытка не найдена. Проверьте код или обратитесь к преподавателю.',review_closed:'Разбор пока закрыт преподавателем.',question_locked:'Материал еще не открыт. Обновите состояние работы.',decision_locked:'Решение зафиксировано перед раскрытием следующего материала.',answer_required:'Ответьте на все вопросы этого экрана перед переходом.',try_later:'Сервер занят. Повторите попытку через минуту.',invalid_answer:'Ответ не удалось принять. Обновите состояние работы.',server_unavailable:'Контрольная временно недоступна.'};
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cache={token:'',state:null,pending:{},screen:0,visibility:0,starting:null};
try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&typeof x==='object')cache={...cache,...x};}catch{}
let state=cache.state,screen=cache.screen||0,materialIndex=null,anchor=null,connected=navigator.onLine,busy=false,flushPromise=null,refreshBusy=false,expiredRequest=false,lastWarning=0,info=null,storageOK=true;
function persist(){cache.state=state;cache.screen=screen;try{localStorage.setItem(STORE,JSON.stringify(cache));}catch{storageOK=false;}}
function announce(t){$('#announcer').textContent=t;}
function footer(){return '<footer class="footer"><div><strong>Разработчик: Антонов М.А.</strong><br>Кафедра гражданского права</div><div>Цивилист / Принципы гражданского права<br>Контрольная работа</div></footer>';}
function brand(){return '<span class="wordmark">Цивилист<span class="brand-dot">.</span></span>';}
function header(){return `<header class="start-header">${brand()}<span class="edition">ГРАЖДАНСКОЕ ПРАВО<br>Учебное досье / 2026</span></header>`;}
function syncTime(r){if(r.server_now&&r.expires_at)anchor={remaining:Date.parse(r.expires_at)-Date.parse(r.server_now),perf:performance.now()};}
function remaining(){return anchor?Math.max(0,anchor.remaining-(performance.now()-anchor.perf)):null;}
function format(sec){sec=Math.max(0,Math.ceil(sec));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
async function api(action,data={}){
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),12000);
 try{
  const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY},body:JSON.stringify({action,token:cache.token||'',data}),signal:ctrl.signal});
  if(!res.ok)throw new Error('network');const r=await res.json();connected=true;syncTime(r);
  if(r.error){const e=new Error(r.error);e.code=r.error;throw e;}return r;
 }catch(e){if(!e.code)connected=false;throw e;}finally{clearTimeout(timeout);updateStatus();}
}
function accept(r){if(r.status){state=r;cache.starting=null;cache.visibility=Math.max(cache.visibility||0,r.visibility_count||0);if(r.status!=='active'){cache.pending={};screen=0;}else screen=Math.min(screen,r.screens.length-1);persist();}}
function failText(e){return ERR[e.code]||'Не удалось связаться с сервером. Введенные ответы сохранены на этом устройстве. Повторите после восстановления связи.';}
function showError(text){let el=$('#error');if(el){el.textContent=text;el.hidden=false;el.setAttribute('role','alert');}announce(text);}
function clearError(){const el=$('#error');if(el){el.hidden=true;el.textContent='';}}
function renderHome(){
 $('#app').innerHTML=header()+`<main class="home"><section class="intro"><div class="eyebrow">Контрольная работа / Общая часть</div><h1>Принципы<br>гражданского<br><em>права</em></h1><p class="intro-text">От обстоятельств спора к правовой позиции. Исследуйте материалы, определите границы права и обоснуйте решение.</p><div class="specs" aria-label="20 минут, 100 баллов, 5 этапов"><div><strong>20</strong><span>минут</span></div><div><strong>100</strong><span>баллов</span></div><div><strong>5</strong><span>этапов</span></div></div><div class="route">${BLOCKS.map((t,i)=>`<div><b>${ROMAN[i]}</b>${t}</div>`).join('')}</div></section><section class="registration"><div class="eyebrow">Индивидуальная попытка</div><h2>Приступить к работе</h2><p class="instruction">После начала остановить таймер невозможно. Ответы сохраняются автоматически. При истечении времени работа будет завершена.</p><form id="start-form"><label class="field"><span>ФИО</span><input id="name" name="name" type="text" autocomplete="name" required minlength="5" maxlength="160" placeholder="Иванов Иван Иванович"></label><label class="field"><span>Учебная группа</span><input id="group" name="group" type="text" required maxlength="40" placeholder="Например, 201"></label><label class="check"><input id="ack" type="checkbox" required><span>Я понимаю, что после начала будет запущен таймер 20 минут.</span></label><div id="error" class="error" hidden></div><button class="primary" type="submit" ${info?.is_open===false?'disabled':''}>${info?.is_open===false?'Прием работ закрыт':'Начать контрольную'}</button></form><p class="privacy">ФИО, группа и ответы сохраняются для проверки преподавателем. Переходы из окна учитываются без снижения оценки. Используйте одно окно и сохраняйте код результата.</p><details class="privacy"><summary>Как оценивается работа</summary><p>90-100 баллов - 5; 75-89 - 4; 60-74 - 3; до 60 - 2. В сложном задании оцениваются отдельные звенья анализа. При множественном выборе ошибочные отметки уменьшают балл. Пропущенный ответ - 0. В досье решение фиксируется перед раскрытием следующего материала. Правильные решения доступны только после открытия разбора преподавателем.</p></details></section></main><details class="review-entry"><summary>Открыть разбор завершенной работы по коду</summary><form id="review-form" class="review-form"><label class="sr-only" for="review-code">Код попытки</label><input id="review-code" type="text" required placeholder="GP-…" maxlength="40" autocomplete="off"><button class="secondary">Открыть разбор</button></form><p id="review-error" class="privacy"></p></details>`+footer();
 $('#start-form').addEventListener('submit',start);$('#review-form').addEventListener('submit',async e=>{e.preventDefault();await loadReview($('#review-code').value);});
}
async function start(e){e.preventDefault();if(busy)return;busy=true;clearError();const b=$('#start-form button');b.disabled=true;b.textContent='Открываем попытку…';
 const identity={name:$('#name').value.trim(),group:$('#group').value.trim()};
 if(!cache.token){cache.token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');}
 cache.starting=identity;persist();
 if(!storageOK){showError('Браузер запрещает локальное сохранение. Разрешите хранение данных сайта перед началом, чтобы восстановить попытку после перезагрузки.');busy=false;b.disabled=false;b.textContent='Начать контрольную';return;}
 try{accept(await api('start',identity));screen=0;render();}catch(e){showError(failText(e));b.disabled=false;b.textContent='Повторить запуск';}finally{busy=false;}
}
function render(){if(!state)return renderHome();if(state.status!=='active')return renderResult();renderWork();}
function currentAnswer(id){return cache.pending[id]?.answer||state.answers?.[id]||[];}
function renderWork(){
 const s=state.screens[screen];if(!s)return;const locked=s.block===4&&screen<state.unlocked-1;const left=remaining();
 const openedMaterials=state.screens.map((x,i)=>({...x,index:i})).filter(x=>x.block===4&&x.index<=screen);
 if(materialIndex===null||!openedMaterials.some(x=>x.index===materialIndex))materialIndex=screen;
 const material=openedMaterials.find(x=>x.index===materialIndex)||openedMaterials.at(-1);
 $('#app').innerHTML=`<header class="topbar">${brand()}<span class="top-stage">Этап ${ROMAN[s.block-1]} / <b>${BLOCKS[s.block-1]}</b></span><div class="top-progress">${screen+1} из 14<div class="progress-track"><div class="progress-fill" data-width="${(screen+1)/14*100}"></div></div></div><div id="timer" class="timer" role="timer" aria-label="Оставшееся время"><small>Осталось</small><strong>${left===null?'--:--':format(left/1000)}</strong></div></header><div id="offline" class="offline-bar" hidden></div><div class="workspace"><aside class="sidebar"><div class="sidebar-inner"><div class="case-id">${esc(state.group)} / Вариант ${state.variant}<strong>${esc(state.variant_name)}</strong><br>${esc(state.code)}</div><nav class="stage-list" aria-label="Этапы работы">${BLOCKS.map((t,i)=>{const ix=state.screens.findIndex(x=>x.block===i+1);return `<button class="stage-button ${s.block===i+1?'active':''}" data-stage="${ix}" ${ix<0?'disabled':''} aria-label="Этап ${i+1}: ${t}"><span>${ROMAN[i]}</span><span>${t}</span></button>`;}).join('')}</nav><p class="side-note">Выберите юридически<br>наиболее точную позицию.<br><br>Сначала факты.<br>Затем норма.<br>После - правовой вывод.</p></div></aside><main class="work-content"><div class="status-wrap"><span id="save-status" class="save-status" role="status"></span><button class="text-button" id="refresh">Обновить связь</button></div><div id="time-notice" class="time-notice" hidden></div><div class="eyebrow">${ROMAN[s.block-1]} / ${BLOCKS[s.block-1]} · ${[15,20,20,25,20][s.block-1]} баллов</div><h2 id="task-title" tabindex="-1">${esc(s.title)}</h2>${s.block!==4?`<p class="case-fact">${esc(s.fact)}</p>`:`<p class="privacy">Материалы раскрываются последовательно. После перехода к следующему материалу решение этого шага изменить нельзя.</p><nav class="dossier-tabs" aria-label="Материалы досье">${openedMaterials.map((x,i)=>`<button data-material="${x.index}" class="${x.index===materialIndex?'active':''}">${i+1}. ${esc(x.material.label)}</button>`).join('')}</nav><article class="evidence"><div class="eyebrow">Материал ${openedMaterials.findIndex(x=>x.index===material.index)+1} / ${esc(material.material.label)}</div><p>${esc(material.material.text)}</p></article>`}${s.block===5?'<p class="chain-title">Факт → норма → принцип → последствие</p>':''}${locked?'<p class="locked-label">Решение зафиксировано. Материалы доступны для повторного чтения.</p>':''}<div id="questions">${s.items.map((it,i)=>renderItem(it,i,s,locked||left===0)).join('')}</div><div id="error" class="error" hidden></div><div class="work-actions"><button class="secondary" id="back" ${screen===0?'disabled':''}>Назад</button><div class="action-right">${screen<13?'<button class="primary" id="next">'+(s.block===4?'Сохранить и открыть материал':'Сохранить и продолжить')+'</button>':'<button class="primary" id="finish-main">Завершить контрольную</button>'}</div></div><button class="text-button" id="early-submit">Сдать работу досрочно</button><p class="privacy">${esc(state.name)} · ${esc(state.group)}<br>Код: ${esc(state.code)}</p></main></div>`+footer();
 document.querySelectorAll('[data-width]').forEach(x=>x.style.width=x.dataset.width+'%');
 document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>go(Number(b.dataset.stage)));
 document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{materialIndex=Number(b.dataset.material);renderWork();});
 $('#back').onclick=()=>go(screen-1);if($('#next'))$('#next').onclick=advance;
 $('#early-submit').onclick=confirmSubmit;if($('#finish-main'))$('#finish-main').onclick=confirmSubmit;
 $('#refresh').onclick=()=>refresh(true);
 document.querySelectorAll('input[data-question]').forEach(el=>el.addEventListener('change',()=>{const id=el.dataset.question;const it=s.items.find(x=>x.id===id);const vals=it.kind==='multi'?[...document.querySelectorAll(`input[data-question="${id}"]:checked`)].map(x=>x.value):[el.value];answer(id,vals);document.querySelectorAll(`input[data-question="${id}"]`).forEach(x=>x.closest('label').classList.toggle('selected',x.checked));}));
 document.querySelectorAll('select[data-question]').forEach(el=>el.addEventListener('change',()=>answer(el.dataset.question,el.value?[el.value]:[])));
 updateStatus();tick();
}
function renderItem(it,i,s,disabled){
 const ans=currentAnswer(it.id);
 if(s.block===1&&s.items.length===3)return `<label class="matching"><span>${esc(it.prompt)}</span><select data-question="${it.id}" ${disabled?'disabled':''}><option value="">Выберите категорию</option>${it.options.map(o=>`<option value="${o.id}" ${ans.includes(o.id)?'selected':''}>${esc(o.text)}</option>`).join('')}</select></label>`;
 return `<section class="question"><fieldset ${disabled?'disabled':''}><legend><span class="question-num">${s.block===5?'Звено':'Решение'} ${i+1}${it.kind==='multi'?' · Можно выбрать несколько ответов':' · Один наиболее точный ответ'}</span>${esc(it.prompt)}</legend><div class="choice-grid">${it.options.map(o=>`<label class="option ${it.kind==='multi'?'multi':''} ${ans.includes(o.id)?'selected':''} ${disabled?'disabled':''}"><input type="${it.kind==='multi'?'checkbox':'radio'}" data-question="${it.id}" name="${it.id}" value="${o.id}" ${ans.includes(o.id)?'checked':''}><span class="mark" aria-hidden="true"></span><span>${esc(o.text)}</span></label>`).join('')}</div></fieldset></section>`;
}
function answer(id,vals){if(state?.status!=='active'||remaining()===0)return;cache.pending[id]={answer:vals,nonce:crypto.randomUUID()};persist();updateStatus();flush();}
async function flush(){if(flushPromise)return flushPromise;
 flushPromise=(async()=>{while(state?.status==='active'&&Object.keys(cache.pending).length){
  const [id,entry]=Object.entries(cache.pending)[0];
  try{
   const r=await api('save',{question_id:id,answer:entry.answer,revision:state.revisions?.[id]||0});
   if(r.status){accept(r);render();return;}
   state.answers[id]=entry.answer;state.revisions[id]=r.revision;
   if(cache.pending[id]?.nonce===entry.nonce)delete cache.pending[id];persist();
  }catch(e){
   if(e.code==='revision_conflict'){
    try{const fresh=await api('resume');accept(fresh);if(state.status!=='active'){render();return;}
     if(JSON.stringify(state.answers[id])===JSON.stringify(entry.answer)){if(cache.pending[id]?.nonce===entry.nonce)delete cache.pending[id];persist();}
     continue;
    }catch{return;}
   }
   if(e.code==='decision_locked'){delete cache.pending[id];persist();showError(ERR.decision_locked);}
   else if(e.code)showError(failText(e));
   break;
  }
 }} )().finally(()=>{flushPromise=null;updateStatus();});return flushPromise;
}
function go(n){if(n<0||n>=state.screens.length)return;screen=n;materialIndex=null;persist();renderWork();window.scrollTo({top:0,behavior:'instant'});$('#task-title')?.focus({preventScroll:true});}
async function advance(){if(busy)return;busy=true;clearError();const b=$('#next');b.disabled=true;b.textContent='Сохраняем…';try{
 await flush();if(state.status!=='active')return;
 if(Object.keys(cache.pending).length)throw new Error('network');
 const s=state.screens[screen];if(s.items.some(i=>!state.answers[i.id]?.length)){showError(ERR.answer_required);return;}
 if(screen<state.unlocked-1){go(screen+1);return;}
 const r=await api('advance',{screen:screen+1});accept(r);if(state.status==='active')go(Math.min(screen+1,state.screens.length-1));else render();
 }catch(e){showError(failText(e));}finally{busy=false;if($('#next')){$('#next').disabled=false;$('#next').textContent=state.screens?.[screen]?.block===4?'Сохранить и открыть материал':'Сохранить и продолжить';}}
}
async function refresh(manual=false){if(refreshBusy||!cache.token)return;refreshBusy=true;try{
 const prev=state?.status,unlocked=state?.unlocked;const r=await api('resume');accept(r);
 if(r.status!==prev||r.unlocked!==unlocked){render();}if(r.status==='active'){await flush();tick();}if(manual){clearError();announce('Связь восстановлена. Серверное время обновлено.');}
 }catch(e){if(manual)showError(failText(e));}finally{refreshBusy=false;updateStatus();}}
function updateStatus(){
 const pending=Object.keys(cache.pending||{}).length;const e=$('#save-status');if(e){e.textContent=!connected?'Нет соединения · ответ хранится на устройстве':pending?'Сохранение ответа…':storageOK?'Все ответы сохранены сервером':'Сохранено сервером · локальный резерв недоступен';e.classList.toggle('bad',!connected||!storageOK);}
 const bar=$('#offline');if(bar){bar.hidden=connected;bar.textContent='Нет соединения с сервером. Ответ сохранен локально и будет отправлен после восстановления связи. После истечения срока новые ответы не принимаются.';}
}
function tick(){if(state?.status!=='active')return;const ms=remaining();if(ms===null)return;const t=$('#timer');if(t){t.querySelector('strong').textContent=format(ms/1000);t.classList.toggle('warning',ms<=300000);t.classList.toggle('urgent',ms<=60000);t.classList.toggle('last',ms<=10000);}
 const level=ms<=10000?3:ms<=60000?2:ms<=300000?1:0;
 if(level>lastWarning){lastWarning=level;announce(level===3?'Последние 10 секунд.':level===2?'Осталась одна минута.':'Осталось пять минут.');}
 const note=$('#time-notice');if(note){note.hidden=level===0;note.textContent=ms===0?'Время истекло. Ввод закрыт. Получаем итог с сервера…':level===3?'Последние '+Math.ceil(ms/1000)+' секунд.':level===2?'Осталась одна минута. Завершите правовую позицию.':'Осталось пять минут. Проверьте, какие этапы еще не завершены.';}
 if(ms===0){document.querySelectorAll('#questions input,#questions select,#questions fieldset,#next').forEach(x=>x.disabled=true);if(!expiredRequest){expiredRequest=true;refresh().finally(()=>{setTimeout(()=>expiredRequest=false,3000);});}}
}
function confirmSubmit(){if($('#submit-dialog'))return;const known=Object.values(state.answers||{}).filter(a=>a.length).length;const backdrop=document.createElement('div');backdrop.id='submit-dialog';backdrop.className='dialog-backdrop';backdrop.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">Завершить работу?</h2><p>После сдачи изменить ответы нельзя. ${screen<13?'Неоткрытые и пропущенные задания получат 0 баллов. ':''}Будут учтены ответы, принятые сервером до истечения 20 минут.</p><div class="dialog-actions"><button class="secondary" id="cancel-submit">Продолжить работу</button><button class="primary" id="do-submit">Сдать контрольную</button></div></section>`;document.body.append(backdrop);$('#cancel-submit').onclick=()=>{backdrop.remove();$('#early-submit')?.focus();};$('#do-submit').onclick=submit;$('#cancel-submit').focus();backdrop.addEventListener('keydown',e=>{if(e.key==='Escape')$('#cancel-submit').click();if(e.key==='Tab'){const buttons=[...backdrop.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}});}
async function submit(){if(busy)return;busy=true;const b=$('#do-submit');if(b){b.disabled=true;b.textContent='Сдаем…';}try{await flush();if(state.status==='active'){if(Object.keys(cache.pending).length&&remaining()>0)throw new Error('network');accept(await api('submit'));}$('#submit-dialog')?.remove();render();announce('Работа завершена. Результат сохранен.');}catch(e){$('#submit-dialog')?.remove();showError(failText(e));}finally{busy=false;}}
function renderResult(){
 $('#submit-dialog')?.remove();const r=state,gradeNames={2:'неудовлетворительно',3:'удовлетворительно',4:'хорошо',5:'отлично'};const diagnostics=r.competencies.every(x=>x>=85)?['Работа демонстрирует системное понимание основных начал гражданского законодательства и способность применять их при разрешении конкретных частноправовых конфликтов.']:DIAG.filter((_,i)=>r.competencies[i]<50);
 $('#app').innerHTML=header()+`<main class="result-page"><div class="result-head"><div><div class="eyebrow">Контрольная работа / Итог</div><h1>Правовая позиция принята</h1></div><div class="result-state">${r.status==='expired'?'Время истекло · работа закрыта':'Работа сдана'}<br>Результат сохранен на сервере</div></div><div class="result-body"><div><div class="big-score">${r.score}<small> / 100</small></div><div class="grade">${r.grade} - ${gradeNames[r.grade]}</div><dl class="identity"><dt>ФИО</dt><dd>${esc(r.name)}</dd><dt>Группа</dt><dd>${esc(r.group)}</dd><dt>Код попытки</dt><dd>${esc(r.code)}</dd><dt>Вариант</dt><dd>${r.variant} / ${esc(r.variant_name)}</dd><dt>Время</dt><dd>${format(r.seconds)}</dd></dl></div><div><div class="eyebrow">Компетентностный профиль</div>${COMP.map((t,i)=>`<div class="competency"><div><span>${t}</span><b>${r.competencies[i]}%</b></div><div class="progress-track"><div class="progress-fill" data-width="${r.competencies[i]}"></div></div></div>`).join('')}<p class="privacy">Каждая компетенция - 25% максимального балла.</p></div></div>${diagnostics.length?`<div class="diagnostics">${diagnostics.map(t=>`<p>${t}</p>`).join('')}</div>`:''}<div class="result-actions"><button class="primary" id="copy-result">Скопировать результат</button><button class="secondary" id="result-refresh">Проверить доступность разбора</button>${r.show_review?'<button class="secondary" id="own-review">Открыть разбор</button>':''}</div><p id="copy-status" class="privacy" role="status"></p><p class="review-note">${r.show_review?'Преподаватель открыл подробный разбор.':'Правильные решения пока скрыты: контрольную могут выполнять другие студенты. После открытия разбора преподавателем он будет доступен по коду попытки.'}<br>Сохраните код. На общем устройстве после копирования результата завершите сеанс.</p><div id="error" class="error" hidden></div><button class="text-button" id="end-session">Завершить сеанс на этом устройстве</button></main>`+footer();
 document.querySelectorAll('[data-width]').forEach(x=>x.style.width=x.dataset.width+'%');
 $('#copy-result').onclick=copyResult;$('#result-refresh').onclick=async()=>{try{accept(await api('result'));renderResult();$('#copy-status').textContent=state.show_review?'Разбор доступен.':'Преподаватель пока не открыл разбор.';}catch(e){showError(failText(e));}};if($('#own-review'))$('#own-review').onclick=()=>loadReview(r.code);
 $('#end-session').onclick=()=>{if(!confirm('Результат сохранен на сервере. Вы скопировали код попытки? После выхода локальные данные будут удалены.'))return;localStorage.removeItem(STORE);cache={token:'',pending:{},screen:0,visibility:0};state=null;anchor=null;screen=0;renderHome();};
}
async function copyResult(){const r=state;const text=`Контрольная работа «Принципы гражданского права»\nФИО: ${r.name}\nГруппа: ${r.group}\nКод попытки: ${r.code}\nВариант: ${r.variant}\nРезультат: ${r.score}/100\nОценка: ${r.grade}\nВремя: ${format(r.seconds)}`;try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='Результат скопирован.';}catch{const ta=document.createElement('textarea');ta.value=text;ta.style.width='100%';ta.rows=9;$('#copy-status').replaceChildren(ta);ta.focus();ta.select();document.execCommand('copy');announce('Выделите и скопируйте текст результата.');}}
async function loadReview(code){try{const r=await api('review',{code:code.trim().toUpperCase()});$('#app').innerHTML=header()+`<main class="review-page"><div class="eyebrow">Разбор / ${esc(r.code)}</div><h2>Принципы гражданского права</h2><p class="privacy">Вариант ${r.variant}. Разбор открыт преподавателем.</p>${r.review.map(s=>`<section class="review-screen"><h3>${esc(s.title)}</h3><p class="case-fact">${esc(s.fact)}</p>${s.material?`<article class="evidence"><p>${esc(s.material.text)}</p></article>`:''}${s.items.map(i=>{const texts=ids=>(ids||[]).map(id=>i.options.find(o=>o.id===id)?.text||'').join('; ');return `<article class="review-item"><h3>${esc(i.prompt)}</h3><p><b>Ваш ответ:</b> ${esc(texts(i.answer)||'Нет ответа')}</p><p><b>Решение:</b> ${esc(texts(i.best))}</p><p>${i.points} / ${i.max} баллов</p><p>${esc(i.explanation)}</p><p class="legal">${esc(i.refs)}</p></article>`;}).join('')}</section>`).join('')}<button class="secondary" id="review-back">Назад</button></main>`+footer();$('#review-back').onclick=render;window.scrollTo(0,0);}catch(e){const t=ERR[e.code]||failText(e);const el=$('#review-error');if(el)el.textContent=t;else showError(t);}}
async function boot(){
 try{info=await api('info');}catch{}
 if(cache.token){try{const r=await api(cache.starting?'start':'resume',cache.starting||{});accept(r);render();if(state.status==='active')flush();}catch(e){
  if(e.code==='attempt_not_found'&&!cache.starting){$('#app').innerHTML=header()+`<main class="boot"><h2>Попытка не найдена</h2><p>На этом устройстве сохранен неизвестный код сеанса. Результат ранее завершенной работы можно проверить у преподавателя.</p><button class="secondary" id="reset">Вернуться ко входу</button></main>`+footer();$('#reset').onclick=()=>{cache={token:'',pending:{}};state=null;persist();renderHome();};}
  else{$('#app').innerHTML=header()+`<main class="boot"><h2>Восстанавливаем попытку</h2><p>Введенные ответы сохранены на устройстве. Для проверки оставшегося времени требуется соединение с сервером.</p><div class="error">${esc(failText(e))}</div><button class="primary" id="retry">Повторить подключение</button></main>`+footer();$('#retry').onclick=boot;}
 }}else renderHome();
}
window.addEventListener('online',()=>{connected=true;if(state?.status==='active'){refresh(true);}else if(cache.token)boot();else updateStatus();});
window.addEventListener('offline',()=>{connected=false;updateStatus();});
document.addEventListener('visibilitychange',()=>{if(state?.status!=='active')return;if(document.hidden){cache.visibility=(cache.visibility||0)+1;persist();api('visibility',{count:cache.visibility}).catch(()=>{});}else{api('visibility',{count:cache.visibility}).catch(()=>{});refresh();}});
window.addEventListener('pageshow',e=>{if(e.persisted&&state?.status==='active')refresh();});
setInterval(tick,250);setInterval(()=>{if(state?.status==='active'&&!document.hidden)refresh();},15000);
boot();
