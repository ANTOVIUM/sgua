(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const calendar = $('#calendar-grid');
  for (let day = 0; day < 35; day++) { const number = day - 2; const cell = document.createElement('span'); if (number > 0 && number <= 31) { cell.textContent = number; if (number === 24) { cell.className = 'selected'; cell.setAttribute('aria-label','24 июля, день свадьбы'); } } calendar.append(cell); }
  const weddingDate = new Date('2027-07-24T15:30:00+05:00').getTime();
  function tick() { let remaining = Math.max(0, weddingDate - Date.now()); $('#days').textContent = Math.floor(remaining / 86400000); remaining %= 86400000; $('#hours').textContent = String(Math.floor(remaining / 3600000)).padStart(2,'0'); $('#minutes').textContent = String(Math.floor(remaining % 3600000 / 60000)).padStart(2,'0'); $('#seconds').textContent = String(Math.floor(remaining % 60000 / 1000)).padStart(2,'0'); }
  tick(); setInterval(tick, 1000);
  const progress = $('#reading-progress');
  let ticking = false;
  function updateProgress() { const max = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0) + '%'; ticking = false; }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive:true });
  updateProgress();
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold:0.06});
    document.querySelectorAll('main > section:not(.hero)').forEach(section => { section.classList.add('reveal'); observer.observe(section); });
  }
  const stages = [
    ['15:30','Сбор гостей и фуршет','Встречаемся, знакомимся и настраиваемся на вечер. Будет время спокойно обняться и поднять первый бокал.'],
    ['16:00–17:00','Выездная регистрация','Соберемся вместе для главного момента этого дня. Просим подойти к площадке к 16:00.'],
    ['17:00','Банкет','Время для ужина, теплых слов, музыки и долгого вечера в кругу близких.']
  ];
  $('#timeline-controls').addEventListener('click', e => { const button = e.target.closest('button[data-index]'); if (!button) return; const index = Number(button.dataset.index); document.querySelectorAll('.time').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed', b === button ? 'true':'false'); }); $('#detail-num').textContent = `0${index+1} / 03`; $('#detail-time').textContent = stages[index][0]; $('#detail-title').textContent = stages[index][1]; $('#detail-text').textContent = stages[index][2]; });
  const palette = [
    ['Шалфей','#A7AD8C','Мягкий зеленый с приглушенным серым подтоном.','шампань · тауп · песочный'],
    ['Олива','#747A55','Глубокий природный зеленый, сдержанный и выразительный.','песочный · шампань · пыльная роза'],
    ['Мох','#4E5942','Темный зеленый для цельного вечернего образа.','шампань · тауп · дымчатый голубой'],
    ['Шампань','#D5C5A8','Светлый теплый тон с мягким сиянием.','олива · мох · серо-сиреневый'],
    ['Песочный','#C7B69D','Спокойный оттенок натурального камня.','шалфей · олива · дымчатый голубой'],
    ['Тауп','#A89B8B','Универсальный нейтральный оттенок между серым и коричневым.','шалфей · мох · пыльная роза'],
    ['Пыльная роза','#B98E90','Приглушенный розовый без лишней яркости.','олива · тауп · шампань'],
    ['Дымчатый голубой','#8699AA','Прохладный акцент с серым подтоном.','песочный · мох · шампань'],
    ['Серо-сиреневый','#AAA0B2','Мягкий прохладный оттенок для вечернего образа.','шампань · шалфей · тауп']
  ];
  function selectShade(i) { const p = palette[i]; $('#fabric-card').style.backgroundColor = p[1]; $('#fabric-number').textContent = `0${i+1} / 09`; $('#shade-title').textContent = p[0]; $('#shade-desc').textContent = p[2]; $('#shade-pairs').textContent = `Сочетается: ${p[3]}`; document.querySelectorAll('.swatch').forEach((b,n) => b.setAttribute('aria-pressed',n === i?'true':'false')); }
  palette.forEach((p,i) => { const b = document.createElement('button'); b.type='button'; b.className='swatch'; b.style.backgroundColor=p[1]; b.setAttribute('aria-label',p[0]); b.setAttribute('aria-pressed',i===0?'true':'false'); b.addEventListener('click',() => selectShade(i)); $('#swatches').append(b); });
  function download(name,blob) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  $('#save-palette').addEventListener('click',() => { const c=document.createElement('canvas'); c.width=1080;c.height=1400;const x=c.getContext('2d');x.fillStyle='#F5F2EB';x.fillRect(0,0,1080,1400);x.fillStyle='#252A20';x.font='72px Georgia';x.fillText('Никита & Ксения',80,130);x.font='27px Arial';x.fillText('24 ИЮЛЯ 2027  ·  ПАЛИТРА ДНЯ',82,185);palette.forEach((p,i)=>{const col=i%3,row=Math.floor(i/3);const left=80+col*314,top=260+row*337;x.fillStyle=p[1];x.fillRect(left,top,284,250);x.fillStyle='#252A20';x.font='25px Georgia';x.fillText(p[0],left,top+282);x.font='18px Arial';x.fillText(p[1],left,top+308)});x.font='22px Georgia';x.fillText('Сохраним белый цвет для невесты.',80,1330);c.toBlob(b=>{if(b)download('nikita-kseniya-palette.png',b)},'image/png'); });
  const address='Оренбургская область, г. Кувандык, дер. Гумарово, ул. Садовая, 1А';
  $('#copy-address').addEventListener('click', async e=>{try {await navigator.clipboard.writeText(address);e.target.textContent='Адрес скопирован ✓';} catch {const t=document.createElement('textarea');t.value=address;document.body.append(t);t.select();document.execCommand('copy');t.remove();e.target.textContent='Адрес скопирован ✓';}setTimeout(()=>e.target.textContent='Скопировать адрес',2500)});
  $('#calendar-link').addEventListener('click', e=>{e.preventDefault();const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nikita Ksenia//Wedding//RU','BEGIN:VEVENT','UID:nikita-kseniya-20270724@gumarovo','DTSTAMP:20260926T120000Z','DTSTART:20270724T103000Z','DTEND:20270724T190000Z','SUMMARY:Свадьба Никиты и Ксении','LOCATION:Ресторан Эдельвейс\, дер. Гумарово\, ул. Садовая\, 1А','DESCRIPTION:Сбор гостей в 15:30. Регистрация в 16:00. Банкет в 17:00.','END:VEVENT','END:VCALENDAR'].join('\r\n'); download('nikita-kseniya-24-07-2027.ics',new Blob([ics],{type:'text/calendar;charset=utf-8'}));});
  const state={step:0,name:'',attendance:'',drinks:[],strong:'',food:'none',foodDetails:'',lodging:'',song:'',comment:'',requestId:crypto.randomUUID?.() || String(Date.now())+'-'+Math.random()};
  const drinks=['Игристое','Белое вино','Красное вино','Крепкие напитки','Безалкогольные напитки','Пока не знаю'];
  const radio=(name,value,label,checked)=>`<label class="choice"><input type="radio" name="${name}" value="${esc(value)}" ${checked?'checked':''}><span>${esc(label)}</span></label>`;
  const checkbox=(name,value,checked)=>`<label class="choice"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked?'checked':''}><span>${esc(value)}</span></label>`;
  const field=(name,label,value,optional=false,textarea=false)=>`<label class="field"><span>${esc(label)}${optional?' · необязательно':''}</span>${textarea?`<textarea name="${name}" maxlength="500">${esc(value)}</textarea>`:`<input name="${name}" type="text" maxlength="120" value="${esc(value)}" ${optional?'':'required'} autocomplete="${name==='guestName'?'name':'off'}">`}</label>`;
  function render(){const s=state.step; $('#step-label').textContent=`0${Math.min(s+1,4)} / 04`;$('#progress-fill').style.width=`${Math.min(s+1,4)*25}%`;$('#form-error').hidden=true;$('#back').hidden=s===0||s===5;$('#next').hidden=s===5;let html='';
    if(s===0) html=`<h3>Давайте знакомиться</h3>${field('guestName','Имя и фамилия',state.name)}<div class="form-section"><span class="question-label">Сможете ли вы быть с нами?</span><div class="choice-grid">${radio('attendance','yes','С радостью буду',state.attendance==='yes')}${radio('attendance','no','К сожалению, не смогу',state.attendance==='no')}</div></div>`;
    if(s===1) html=`<h3>Ваши предпочтения</h3><div class="form-section"><span class="question-label">Какие напитки вы предпочитаете? Можно выбрать несколько.</span><div class="choice-grid">${drinks.map(d=>checkbox('drinks',d,state.drinks.includes(d))).join('')}</div></div><div id="strong-wrap" ${state.drinks.includes('Крепкие напитки')?'':'hidden'}>${field('strong','Какие крепкие напитки предпочитаете?',state.strong,true)}</div><div class="form-section"><span class="question-label">Особенности питания</span><div class="choice-grid">${radio('food','none','Особых ограничений нет',state.food==='none')}${radio('food','special','Есть особенности питания / аллергии',state.food==='special')}</div><div id="food-wrap" ${state.food==='special'?'':'hidden'}>${field('foodDetails','Расскажите об особенностях питания',state.foodDetails,false,true)}</div></div>`;
    if(s===2) html=`<h3>После праздника</h3><div class="form-section"><span class="question-label">Потребуется ли вам проживание после праздника?</span><div class="choice-grid">${radio('lodging','Да','Да',state.lodging==='Да')}${radio('lodging','Нет','Нет',state.lodging==='Нет')}${radio('lodging','Пока не уверен(а)','Пока не уверен(а)',state.lodging==='Пока не уверен(а)')}</div></div>`;
    if(s===3) html=`<h3>Еще пара слов</h3>${field('song','Песня, которую хотелось бы услышать',state.song,true)}${field('comment','Комментарий организаторам',state.comment,true,true)}`;
    if(s===4){const entries=[['Имя',state.name],['Присутствие',state.attendance==='yes'?'Буду':'Не смогу']];if(state.attendance==='yes')entries.push(['Напитки',state.drinks.join(', ')||'Не указаны'],['Крепкие напитки',state.strong||'—'],['Питание',state.food==='none'?'Без ограничений':state.foodDetails],['Проживание',state.lodging],['Песня',state.song||'—'],['Комментарий',state.comment||'—']);html=`<h3>Все верно?</h3><p>Проверьте ответы перед отправкой.</p><dl class="review-list">${entries.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;}
    if(s===5)html=`<div class="success"><h3>Спасибо, ${esc(state.name.split(/\s+/)[0])}!</h3><p>${state.attendance==='yes'?'Будем рады видеть вас 24 июля.':'Спасибо, что сообщили нам заранее.'}</p></div>`;
    $('#step-content').innerHTML=html;$('#next').innerHTML=s===4?'Отправить ответ <span aria-hidden="true">↗</span>':'Продолжить <span aria-hidden="true">↗</span>';
  }
  function readStep(){const f=$('#rsvp-form');if(state.step===0){state.name=f.elements.guestName.value.trim().replace(/\s+/g,' ');state.attendance=f.querySelector('input[name=attendance]:checked')?.value||'';if(state.name.length<3 || !/\p{L}/u.test(state.name))return 'Укажите имя и фамилию.';if(!state.attendance)return 'Выберите, сможете ли присутствовать.';}
    if(state.step===1){state.drinks=[...f.querySelectorAll('input[name=drinks]:checked')].map(i=>i.value);state.strong=f.elements.strong?.value.trim()||'';state.food=f.querySelector('input[name=food]:checked')?.value||'none';state.foodDetails=f.elements.foodDetails?.value.trim()||'';if(state.drinks.length===0)return 'Выберите хотя бы один вариант напитков.';if(state.food==='special'&&!state.foodDetails)return 'Укажите особенности питания или аллергии.';}
    if(state.step===2){state.lodging=f.querySelector('input[name=lodging]:checked')?.value||'';if(!state.lodging)return 'Выберите ответ о проживании.';}
    if(state.step===3){state.song=f.elements.song.value.trim();state.comment=f.elements.comment.value.trim();}
    return '';
  }
  $('#rsvp-form').addEventListener('change',e=>{if(e.target.name==='drinks'){const list=[...document.querySelectorAll('input[name=drinks]:checked')];if(e.target.checked&&e.target.value==='Пока не знаю')list.forEach(i=>{if(i!==e.target)i.checked=false});else if(e.target.checked)document.querySelector('input[name=drinks][value="Пока не знаю"]').checked=false;$('#strong-wrap').hidden=!document.querySelector('input[name=drinks][value="Крепкие напитки"]').checked;}if(e.target.name==='food')$('#food-wrap').hidden=e.target.value!=='special';});
  $('#back').addEventListener('click',()=>{if(state.step===4&&state.attendance==='no')state.step=0;else state.step=Math.max(0,state.step-1);render()});
  $('#next').addEventListener('click',async()=>{let error=readStep();if(error){$('#form-error').textContent=error;$('#form-error').hidden=false;return;}if(state.step===4){await send();return;}if(state.step===0&&state.attendance==='no')state.step=4;else state.step++;render();});
  async function send(){const button=$('#next');button.disabled=true;button.textContent='Отправляем…';$('#form-error').hidden=true;const payload={requestId:state.requestId,name:state.name,attendance:state.attendance,drinks:state.attendance==='yes'?state.drinks.join(', '):'',strong:state.attendance==='yes'?state.strong:'',food:state.attendance==='yes'?(state.food==='special'?state.foodDetails:'Без ограничений'):'',lodging:state.attendance==='yes'?state.lodging:'',song:state.attendance==='yes'?state.song:'',comment:state.attendance==='yes'?state.comment:''};
    try { if(typeof google!=='undefined' && google.script?.run){await new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).saveRsvp(payload));}
      else if(window.RSVP_ENDPOINT){const response=await fetch(window.RSVP_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw Error('Сервис временно недоступен.');const result=await response.json();if(!result.ok)throw Error(result.error||'Не удалось сохранить ответ.');}
      else throw Error('Отправка анкеты пока не подключена. Пожалуйста, вернитесь позже.');state.step=5;render();
    }catch(e){$('#form-error').textContent=e.message||'Не удалось отправить ответ. Проверьте соединение и повторите попытку.';$('#form-error').hidden=false;button.disabled=false;button.innerHTML='Повторить отправку <span aria-hidden="true">↗</span>';}
  }
  render();
})();
