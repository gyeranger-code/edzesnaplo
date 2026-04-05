// ════════════════════════════════════════════════
// DATA LAYER
// ════════════════════════════════════════════════
const DB = {
  get exercises(){ return JSON.parse(localStorage.getItem('exercises')||'[]') },
  set exercises(v){ localStorage.setItem('exercises',JSON.stringify(v)) },
  get workouts(){ return JSON.parse(localStorage.getItem('workouts')||'[]') },
  set workouts(v){ localStorage.setItem('workouts',JSON.stringify(v)) },
  get bodyweights(){ return JSON.parse(localStorage.getItem('bodyweights')||'[]') },
  set bodyweights(v){ localStorage.setItem('bodyweights',JSON.stringify(v)) },
  get templates(){ return JSON.parse(localStorage.getItem('templates')||'[]') },
  set templates(v){ localStorage.setItem('templates',JSON.stringify(v)) },
};
const DEFAULT_MUSCLES = {};
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6) }
function getPRs(){ return JSON.parse(localStorage.getItem('prs')||'{}') }
function epley(w,r){ if(!w||w<=0) return 0; return Math.round(w*(1+Math.min(r||1,30)/30)*10)/10 }
function bestEpley(sets){ return Math.max(0,...sets.map(s=>epley(s.weight||0,s.reps||1))) }
function today(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function formatDuration(startTime,endTime){
  if(!startTime||!endTime) return null;
  const mins=Math.round((endTime-startTime)/60000);
  if(mins<1) return null;
  if(mins<60) return `${mins} perc`;
  const h=Math.floor(mins/60), m=mins%60;
  return m>0?`${h} óra ${m} perc`:`${h} óra`;
}

// ════════════════════════════════════════════════
// DEFAULT EXERCISES
// ════════════════════════════════════════════════
function initDefaults(){
  const defs=[
    {name:'Fekvenyomás rúddal',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Fekvenyomás síkpadon (súlyzó)',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Fekvenyomás egykezes súlyzóval (síkpad)',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Fekvenyomás döntött padon (rúd)',muscle:'Mell',muscles:['chest-upper','front-delt','triceps']},
    {name:'Fekvenyomás döntött padon (súlyzó)',muscle:'Mell',muscles:['chest-upper','front-delt','triceps']},
    {name:'Fekvenyomás 30 fokos padon egykezes',muscle:'Mell',muscles:['chest-upper','front-delt','triceps']},
    {name:'Fekvenyomás lejtős padon',muscle:'Mell',muscles:['chest-lower','triceps']},
    {name:'Fekvenyomás Smith kereten',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Döntött padú nyomás Smith kereten',muscle:'Mell',muscles:['chest-upper','front-delt','triceps']},
    {name:'Tárogatás gépen',muscle:'Mell',muscles:['chest','front-delt']},
    {name:'Tárogatás síkpadon',muscle:'Mell',muscles:['chest','front-delt']},
    {name:'Tárogatás döntött padon',muscle:'Mell',muscles:['chest-upper','front-delt']},
    {name:'Kábeles tárogatás (crossover)',muscle:'Mell',muscles:['chest','front-delt']},
    {name:'Gépi mellnyomás',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Peck-deck (pillangó gép)',muscle:'Mell',muscles:['chest']},
    {name:'Tőlenyomás mellen (dips)',muscle:'Mell',muscles:['chest-lower','triceps','front-delt']},
    {name:'Fekvőtámasz',muscle:'Mell',muscles:['chest','front-delt','triceps']},
    {name:'Húzódzkodás (szupinált)',muscle:'Hát',muscles:['lats','biceps','rear-delt']},
    {name:'Húzódzkodás (pronált, széles)',muscle:'Hát',muscles:['lats','rear-delt']},
    {name:'Evezés rúddal (overhand)',muscle:'Hát',muscles:['lats','mid-back','rear-delt','biceps']},
    {name:'Evezés rúddal (underhand)',muscle:'Hát',muscles:['lats','mid-back','biceps']},
    {name:'Evezés T-rúddal',muscle:'Hát',muscles:['lats','mid-back','rear-delt']},
    {name:'Evezés gépen (ülve)',muscle:'Hát',muscles:['lats','mid-back','biceps']},
    {name:'Evezés kábelen (ülve)',muscle:'Hát',muscles:['lats','mid-back','biceps']},
    {name:'Evezés egykezes súlyzóval',muscle:'Hát',muscles:['lats','mid-back','rear-delt','biceps']},
    {name:'Egykezes kábeles evezés',muscle:'Hát',muscles:['lats','mid-back','biceps']},
    {name:'Lat pulldown (széles)',muscle:'Hát',muscles:['lats','biceps','rear-delt']},
    {name:'Lat pulldown (szűk fogás)',muscle:'Hát',muscles:['lats','biceps']},
    {name:'Nyújtott karú lehúzás',muscle:'Hát',muscles:['lats']},
    {name:'Felhúzás (deadlift)',muscle:'Hát',muscles:['lower-back','lats','glutes','hamstrings','traps']},
    {name:'Román felhúzás',muscle:'Hát',muscles:['lower-back','hamstrings','glutes']},
    {name:'Egylábas román felhúzás',muscle:'Hát',muscles:['lower-back','hamstrings','glutes']},
    {name:'Jó reggelt gyakorlat',muscle:'Hát',muscles:['lower-back','hamstrings']},
    {name:'Hátrahajlítás (hyperextension)',muscle:'Hát',muscles:['lower-back','glutes']},
    {name:'Vállrándítás (shrug)',muscle:'Hát',muscles:['traps']},
    {name:'Katonai nyomás rúddal (állva)',muscle:'Váll',muscles:['front-delt','side-delt','triceps','traps']},
    {name:'Katonai nyomás rúddal (ülve)',muscle:'Váll',muscles:['front-delt','side-delt','triceps']},
    {name:'Vállnyomás súlyzóval (ülve)',muscle:'Váll',muscles:['front-delt','side-delt','triceps']},
    {name:'Arnold press',muscle:'Váll',muscles:['front-delt','side-delt','rear-delt','triceps']},
    {name:'Oldalemeléses (állva)',muscle:'Váll',muscles:['side-delt','traps']},
    {name:'Oldalemeléses kábelen',muscle:'Váll',muscles:['side-delt']},
    {name:'Előreemelés súlyzóval',muscle:'Váll',muscles:['front-delt']},
    {name:'Hátsódelta emelés (bent-over)',muscle:'Váll',muscles:['rear-delt','mid-back']},
    {name:'Hátsódelta gépen',muscle:'Váll',muscles:['rear-delt','mid-back']},
    {name:'Face pull kábelen',muscle:'Váll',muscles:['rear-delt','mid-back','traps']},
    {name:'Vállból nyomás gépen',muscle:'Váll',muscles:['front-delt','side-delt','triceps']},
    {name:'Upright row',muscle:'Váll',muscles:['side-delt','traps','biceps']},
    {name:'Bicepsz curl (rúd)',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Bicepsz curl (súlyzó, állva)',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Bicepsz curl (súlyzó, ülve)',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Kalapács curl (hammer curl)',muscle:'Bicepsz',muscles:['biceps','forearms']},
    {name:'Koncentrált curl',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Preacher curl',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Kábeles curl',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Incline curl (döntött padon)',muscle:'Bicepsz',muscles:['biceps']},
    {name:'Csukló curl (alkar)',muscle:'Bicepsz',muscles:['forearms']},
    {name:'Szűk fekvenyomás',muscle:'Tricepsz',muscles:['triceps','chest','front-delt']},
    {name:'Tőlenyomás párhuzamon (dips)',muscle:'Tricepsz',muscles:['triceps','chest-lower','front-delt']},
    {name:'Tricepsz nyomás kábelen (felső)',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Tricepsz nyomás kábelen (rope)',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Francia nyomás (EZ rúd)',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Francia nyomás súlyzóval',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Tricepsz kickback',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Overhead tricepsz kábelen',muscle:'Tricepsz',muscles:['triceps']},
    {name:'Guggolás (back squat)',muscle:'Láb',muscles:['quads','glutes','hamstrings','lower-back']},
    {name:'Guggolás (front squat)',muscle:'Láb',muscles:['quads','glutes','core']},
    {name:'Bolgár guggolás (split squat)',muscle:'Láb',muscles:['quads','glutes','hamstrings']},
    {name:'Kitörés (lunge)',muscle:'Láb',muscles:['quads','glutes','hamstrings']},
    {name:'Légguggolás (goblet squat)',muscle:'Láb',muscles:['quads','glutes','core']},
    {name:'Lábprés (leg press)',muscle:'Láb',muscles:['quads','glutes','hamstrings']},
    {name:'Lábnyújtás gépen',muscle:'Láb',muscles:['quads']},
    {name:'Fekvő lábhajlítás gépen',muscle:'Láb',muscles:['hamstrings']},
    {name:'Ülő lábhajlítás gépen',muscle:'Láb',muscles:['hamstrings']},
    {name:'Hip thrust (csípőemelés)',muscle:'Láb',muscles:['glutes','hamstrings']},
    {name:'Sumo felhúzás',muscle:'Láb',muscles:['glutes','quads','inner-thigh','lower-back']},
    {name:'Borjúemelés (calf raise, állva)',muscle:'Láb',muscles:['calves']},
    {name:'Borjúemelés (ülve)',muscle:'Láb',muscles:['calves']},
    {name:'Adduktor gép',muscle:'Láb',muscles:['inner-thigh']},
    {name:'Abduktor gép',muscle:'Láb',muscles:['glutes','outer-thigh']},
    {name:'Plank',muscle:'Has',muscles:['core','lower-back']},
    {name:'Oldalsó plank',muscle:'Has',muscles:['core','obliques']},
    {name:'Hasprés (crunch)',muscle:'Has',muscles:['core']},
    {name:'Hasprés gépen',muscle:'Has',muscles:['core']},
    {name:'Lábemeléses hasprés',muscle:'Has',muscles:['core','hip-flexors']},
    {name:'Kábeles crunch',muscle:'Has',muscles:['core']},
    {name:'Orosz csavar (Russian twist)',muscle:'Has',muscles:['core','obliques']},
    {name:'Kerékpározás (bicycle crunch)',muscle:'Has',muscles:['core','obliques']},
    {name:'Felülés (sit-up)',muscle:'Has',muscles:['core','hip-flexors']},
    {name:'Lábemelés (lying leg raise)',muscle:'Has',muscles:['core','hip-flexors']},
    {name:'Rollout (ab wheel)',muscle:'Has',muscles:['core','lats','lower-back']},
    {name:'Farmer séta',muscle:'Egyéb',muscles:['forearms','traps','core','glutes']},
    {name:'Kettlebell swing',muscle:'Egyéb',muscles:['glutes','hamstrings','lower-back','core']},
    {name:'Clean and press',muscle:'Egyéb',muscles:['glutes','hamstrings','traps','front-delt','triceps']},
    {name:'Burpee',muscle:'Egyéb',muscles:['chest','quads','core','front-delt']},
  ];
  defs.forEach(e=>{ DEFAULT_MUSCLES[e.name]=e.muscles||[] });
  if(DB.exercises.length===0){
    DB.exercises=defs.map(e=>({...e,id:uid()}));
  } else {
    const stored=DB.exercises; let changed=false;
    stored.forEach(e=>{ if(!e.muscles){e.muscles=DEFAULT_MUSCLES[e.name]||[];changed=true} });
    const existingNames=new Set(stored.map(e=>e.name));
    defs.forEach(d=>{
      if(!existingNames.has(d.name)){stored.push({...d,id:uid()});changed=true}
    });
    if(changed) DB.exercises=stored;
  }
}

// ════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════
function haptic(ms){if(navigator.vibrate)navigator.vibrate(ms||10)}
const screenOrder={home:0,log:1,history:2,progress:3,templates:3,exercises:3,more:3};
let currentScreen='home';
function switchScreen(name){
  haptic(8);
  const dir=(screenOrder[name]||0)>=(screenOrder[currentScreen]||0)?'30px':'-30px';
  document.documentElement.style.setProperty('--slide-dir',dir);
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const el=document.getElementById('screen-'+name);
  el.classList.add('active');
  currentScreen=name;
  const nav=document.getElementById('nav-'+name);
  if(nav) nav.classList.add('active');
  if(name==='home') renderHome();
  else if(name==='history') renderHistory();
  else if(name==='progress') renderProgressScreen();
  else if(name==='templates') renderTemplates();
  else if(name==='more') renderMore();
  else if(name==='exercises'){ const s=document.getElementById('exercise-list-search'); if(s) s.value=''; renderExerciseList(); }
  else if(name==='log') renderLogScreen();
}

// ════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════
let calDate=new Date();
function calNav(dir){calDate.setMonth(calDate.getMonth()+dir);renderCal()}
function renderCal(){
  const y=calDate.getFullYear(),m=calDate.getMonth();
  const label=new Date(y,m).toLocaleDateString('hu-HU',{year:'numeric',month:'long'});
  document.getElementById('cal-month-label').textContent=label.charAt(0).toUpperCase()+label.slice(1);
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  let startDay=(first.getDay()+6)%7;
  const days=['H','K','Sz','Cs','P','Sz','V'];
  let html=days.map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  const wMap={};
  DB.workouts.forEach(w=>{
    const d=new Date(w.date);
    if(d.getFullYear()===y&&d.getMonth()===m){
      const key=d.getDate();
      wMap[key]=(wMap[key]||0)+1;
    }
  });
  const today=new Date();
  const isCurrentMonth=today.getFullYear()===y&&today.getMonth()===m;
  const todayDate=today.getDate();
  for(let i=0;i<startDay;i++){
    const prev=new Date(y,m,0-startDay+i+1);
    html+=`<div class="cal-day">${prev.getDate()}</div>`;
  }
  let totalWorkouts=0;
  for(let d=1;d<=last.getDate();d++){
    const cnt=wMap[d]||0;
    totalWorkouts+=cnt;
    let cls='cal-day current-month';
    if(cnt>=2)cls+=' has-workout has-workout-2';
    else if(cnt===1)cls+=' has-workout';
    if(isCurrentMonth&&d===todayDate)cls+=' is-today';
    html+=`<div class="${cls}">${d}</div>`;
  }
  const remaining=7-((startDay+last.getDate())%7);
  if(remaining<7){
    for(let i=1;i<=remaining;i++) html+=`<div class="cal-day">${i}</div>`;
  }
  document.getElementById('cal-grid').innerHTML=html;
  const workoutDays=Object.keys(wMap).length;
  document.getElementById('cal-summary').innerHTML=
    `<div class="cal-summary-item"><div class="cal-summary-dot" style="background:rgba(232,255,71,0.15);border:1px solid rgba(232,255,71,0.3)"></div>${workoutDays} edzésnap</div>`+
    `<div class="cal-summary-item"><div class="cal-summary-dot" style="background:rgba(232,255,71,0.3);border:1px solid var(--accent)"></div>2+ edzés/nap</div>`+
    `<div class="cal-summary-item" style="font-weight:600;color:var(--accent)">${totalWorkouts} edzés</div>`;
}
function renderHome(){
  const now=new Date();
  const h=now.getHours();
  const greet=h<5?'Jó éjt':h<12?'Jó reggelt':h<18?'Szép napot':h<22?'Jó estét':'Jó éjt';
  const emoji=h<5?'🌙':h<12?'☀️':h<18?'💪':h<22?'🌆':'🌙';
  const userName=localStorage.getItem('username')||'';
  document.getElementById('home-greeting').textContent=userName?`${greet}, ${userName}! ${emoji}`:`${greet}! ${emoji}`;
  document.getElementById('today-date').textContent=now.toLocaleDateString('hu-HU',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const ws=DB.workouts, weekAgo=Date.now()-7*864e5;
  document.getElementById('stat-week').textContent=ws.filter(w=>w.date>weekAgo).length;
  document.getElementById('stat-total').textContent=ws.length;
  const prVals=Object.values(getPRs());
  const maxPR=prVals.length?Math.max(...prVals):0;
  document.getElementById('stat-maxpr').textContent=maxPR>0?maxPR+' kg':'—';
  document.getElementById('stat-pr').textContent=Object.keys(getPRs()).length;
  const streak=calcStreak(ws);
  document.getElementById('home-streak').textContent=getStreakMessage(streak);
  const todayStart=new Date(); todayStart.setHours(0,0,0,0);
  const todayW=ws.filter(w=>w.date>=todayStart.getTime());
  document.getElementById('today-summary').textContent=todayW.length>0
    ?`${todayW[todayW.length-1].exercises.length} gyakorlat · ${todayW[todayW.length-1].exercises.reduce((a,e)=>a+e.sets.length,0)} sorozat`
    :'Még nincs mai edzés';
  const recent=[...ws].sort((a,b)=>b.date-a.date).slice(0,3);
  document.getElementById('recent-list').innerHTML=recent.length===0
    ?`<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">Még nincs edzés</div><div class="empty-sub">Nyomd az "Új edzés indítása" gombot!</div></div>`
    :recent.map(w=>workoutCard(w)).join('');
  renderCal();
  renderMuscleHeatmap();
  renderBWSparkline();
}
const muscleColors={'Mell':'#ff6b35','Hát':'#47c4ff','Váll':'#e8ff47','Bicepsz':'#c864ff','Tricepsz':'#ffc832','Láb':'#50dc78','Has':'#ff5078','Egyéb':'#888'};
const muscleRGB={'Mell':'255,107,53','Hát':'71,196,255','Váll':'232,255,71','Bicepsz':'200,100,255','Tricepsz':'255,200,50','Láb':'80,220,120','Has':'255,80,120','Egyéb':'136,136,136'};
function renderMuscleHeatmap(){
  const weekAgo=Date.now()-7*864e5;
  const weekWorkouts=DB.workouts.filter(w=>w.date>weekAgo);
  const sets={};
  weekWorkouts.forEach(w=>w.exercises.forEach(ex=>{
    const e=DB.exercises.find(x=>x.id===ex.exerciseId);
    if(e){const g=e.muscle;sets[g]=(sets[g]||0)+ex.sets.length}
  }));
  const groups=['Mell','Hát','Váll','Bic.','Tric.','Láb','Has'];
  const groupKeys=['Mell','Hát','Váll','Bicepsz','Tricepsz','Láb','Has'];
  const maxSets=Math.max(1,...Object.values(sets));
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div style="font-family:Syne,sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.01em">Heti izomterhelés</div>
    <div style="font-size:10px;color:var(--muted);letter-spacing:0.05em;text-transform:uppercase">Elmúlt 7 nap</div>
  </div>`;
  html+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">';
  groupKeys.forEach((g,i)=>{
    const cnt=sets[g]||0;
    const pct=cnt/maxSets;
    const rgb=muscleRGB[g]||'136,136,136';
    const bgAlpha=cnt===0?0.06:(0.12+pct*0.45).toFixed(2);
    const clr=muscleColors[g]||'#888';
    html+=`<div style="text-align:center">
      <div style="aspect-ratio:1;border-radius:10px;background:rgba(${rgb},${bgAlpha});border:1.5px solid ${cnt>0?`rgba(${rgb},0.5)`:'var(--border)'};display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-size:${cnt>0?15:12}px;font-weight:700;color:${cnt>0?clr:'var(--muted2)'};opacity:${cnt===0?0.5:1}">${cnt>0?cnt:'—'}</div>
      <div style="font-size:8px;color:${cnt>0?'var(--muted)':'var(--muted2)'};margin-top:4px;font-weight:600;letter-spacing:0.04em">${groups[i]}</div>
    </div>`;
  });
  html+='</div>';
  const totalSets=Object.values(sets).reduce((a,b)=>a+b,0);
  html+=`<div style="text-align:center;margin-top:10px;font-size:11px;color:var(--muted)">Összesen <span style="color:var(--accent);font-weight:700">${totalSets}</span> sorozat az elmúlt 7 napban</div>`;
  document.getElementById('muscle-heatmap').innerHTML=html;
}
function renderBWSparkline(){
  const bws=[...DB.bodyweights].sort((a,b)=>a.date-b.date).slice(-15);
  const el=document.getElementById('bw-sparkline');
  if(bws.length<2){el.style.display='none';return}
  el.style.display='block';
  const weights=bws.map(b=>b.weight);
  const min=Math.min(...weights),max=Math.max(...weights);
  const range=max-min||1;
  const w=280,h=50,pad=4;
  const pts=weights.map((v,i)=>{
    const x=pad+i/(weights.length-1)*(w-pad*2);
    const y=pad+(1-(v-min)/range)*(h-pad*2);
    return `${x},${y}`;
  });
  const last=bws[bws.length-1],first=bws[0];
  const diff=Math.round((last.weight-first.weight)*10)/10;
  const diffClr=diff>0?'var(--danger)':diff<0?'var(--safe)':'var(--muted)';
  const diffTxt=diff>0?`+${diff}`:diff<0?`${diff}`:'0';
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
    <div style="font-family:Syne,sans-serif;font-size:13px;font-weight:700">Testsúly trend</div>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-family:Syne,sans-serif;font-size:18px;font-weight:800">${last.weight} kg</span>
      <span style="font-size:11px;font-weight:700;color:${diffClr};background:${diff>0?'rgba(244,67,54,0.12)':diff<0?'rgba(76,175,80,0.12)':'var(--surface3)'};padding:2px 8px;border-radius:20px">${diffTxt} kg</span>
    </div>
  </div>`;
  html+=`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:50px">
    <polyline points="${pts.join(' ')}" fill="none" stroke="#47c4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="3.5" fill="#47c4ff"/>
  </svg>`;
  el.innerHTML=html;
}
function workoutMuscleColor(w){
  const freq={};
  w.exercises.forEach(ex=>{const e=DB.exercises.find(x=>x.id===ex.exerciseId);if(e)freq[e.muscle]=(freq[e.muscle]||0)+1});
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
  return top?muscleColors[top[0]]||'#888':'#888';
}
function workoutCard(w,swipeable){
  const date=new Date(w.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric',weekday:'short'});
  const names=w.exercises.map(e=>e.name).join(', ');
  const sets=w.exercises.reduce((a,e)=>a+e.sets.length,0);
  const vol=Math.round(w.exercises.reduce((a,e)=>a+e.sets.reduce((b,s)=>b+(s.weight||0)*(s.reps||0),0),0));
  const dur=formatDuration(w.startTime,w.endTime);
  const clr=workoutMuscleColor(w);
  const inner=`<div class="history-item" onclick="openWorkoutDetail('${w.id}')" style="border-left:3px solid ${clr}" data-wid="${w.id}">
    <div class="history-date">${date}</div>
    <div class="history-exercises">${names||'—'}</div>
    <div class="history-stats">
      <div class="history-stat"><span>${sets}</span> sorozat</div>
      <div class="history-stat"><span>${vol.toLocaleString('hu-HU')}</span> kg vol.</div>
      ${dur?`<div class="history-stat">⏱ <span>${dur}</span></div>`:''}
      ${w.notes?`<div class="history-stat" style="font-style:italic">"${w.notes}"</div>`:''}
    </div>
  </div>`;
  if(!swipeable) return inner;
  return `<div class="history-wrap"><div class="history-delete" onclick="swipeDeleteWorkout('${w.id}')">Törlés</div>${inner}</div>`;
}
function getStreakMessage(s){
  if(s>=30)return `🏆 Legenda! ${s} napos sorozat!`;
  if(s>=14)return `⚡ Megállíthatatlan! ${s} napos sorozat!`;
  if(s>=10)return `🔥 Gépezet vagy! ${s} napos sorozat!`;
  if(s>=7)return `💎 Egy teljes hét! ${s} napos sorozat!`;
  if(s>=5)return `🚀 Beindultál! ${s} napos sorozat!`;
  if(s>=3)return `💪 Erős vagy! ${s} napos sorozat!`;
  if(s===2)return `✌️ Szép, 2 napos sorozat!`;
  if(s===1)return `💪 Ma edzettél!`;
  return 'Kezdj el edzeni!';
}
function calcStreak(ws){
  const days=new Set(ws.map(w=>new Date(w.date).toDateString()));
  let s=0,d=new Date();
  while(days.has(d.toDateString())){ s++; d.setDate(d.getDate()-1) }
  return s;
}
function startNewWorkout(){
  editingWorkoutId=null; currentExercises=[]; workoutStartTime=Date.now();
  document.getElementById('session-notes').value='';
  document.getElementById('session-date').value=today();
  switchScreen('log');
}

// ════════════════════════════════════════════════
// REST TIMER
// ════════════════════════════════════════════════
let timerInterval=null, timerSecs=0;
const timerAudio=new Audio('./timer-sound.mp3');
timerAudio.preload='auto';
function startTimer(s){
  if(timerInterval) clearInterval(timerInterval);
  timerAudio.play().then(()=>{timerAudio.pause();timerAudio.currentTime=0}).catch(()=>{});
  timerSecs=s; updateTimerDisplay();
  document.getElementById('rest-timer').classList.add('visible');
  timerInterval=setInterval(()=>{
    timerSecs--;
    updateTimerDisplay();
    if(timerSecs<=0){
      clearInterval(timerInterval); timerInterval=null;
      document.getElementById('rest-timer').classList.remove('visible');
      showToast('⏱ Pihenőidő lejárt!');
      timerAudio.currentTime=0;timerAudio.play().catch(()=>{});
      if(navigator.vibrate) navigator.vibrate([300,100,300]);
    }
  },1000);
}
function toggleRestPanel(){
  const p=document.getElementById('rest-panel');
  const a=document.getElementById('rest-arrow');
  if(p.style.display==='flex'){p.style.display='none';a.style.transform='rotate(0deg)'}
  else{p.style.display='flex';a.style.transform='rotate(180deg)'}
}
function addRestTime(s){ timerSecs+=s; updateTimerDisplay() }
function stopTimer(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval=null }
  document.getElementById('rest-timer').classList.remove('visible');
}
function updateTimerDisplay(){
  const m=Math.floor(timerSecs/60), s=timerSecs%60;
  document.getElementById('timer-display').textContent=`${m}:${String(s).padStart(2,'0')}`;
  document.getElementById('timer-display').style.color=timerSecs<=10?'var(--danger)':'var(--accent)';
}

// ════════════════════════════════════════════════
// LOG
// ════════════════════════════════════════════════
let currentExercises=[], editingWorkoutId=null, selectedExerciseId=null, workoutStartTime=null;

function renderLogScreen(){
  if(editingWorkoutId){
    document.getElementById('log-tag').textContent='Szerkesztés';
    document.getElementById('log-title').textContent='Edzés módosítása';
    document.getElementById('save-btn-label').textContent='Változások mentése';
    document.getElementById('cancel-edit-btn').style.display='flex';
  } else {
    document.getElementById('log-tag').textContent='Rögzítés';
    document.getElementById('log-title').textContent='Edzés napló';
    document.getElementById('save-btn-label').textContent='Edzés mentése';
    document.getElementById('cancel-edit-btn').style.display='none';
    if(!document.getElementById('session-date').value) document.getElementById('session-date').value=today();
  }
  renderExerciseBlocks();
}
function renderExerciseBlocks(){
  const cont=document.getElementById('exercise-blocks');
  if(currentExercises.length===0){
    cont.innerHTML=`<div class="empty-state" style="padding:30px"><div class="empty-icon">➕</div><div class="empty-title">Adj hozzá gyakorlatot</div></div>`;
    document.getElementById('save-btn').style.display='none'; return;
  }
  document.getElementById('save-btn').style.display='flex';
  cont.innerHTML=currentExercises.map((ex,i)=>`
    <div class="exercise-block">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div><div class="exercise-block-name">${ex.name}</div><div class="exercise-block-muscle">${ex.muscle}</div></div>
        <button class="btn btn-danger btn-sm" onclick="removeExercise(${i})">Töröl</button>
      </div>
      <div class="set-header"><span></span><span>Súly (kg)</span><span>Ismétlés</span><span>RPE</span><span></span></div>
      ${ex.sets.map((s,j)=>`<div class="set-row">
        <div class="set-num">${j+1}</div>
        <input type="number" class="set-input" placeholder="0" value="${s.weight||''}" oninput="updateSet(${i},${j},'weight',this.value)" inputmode="decimal" step="0.5">
        <input type="number" class="set-input" placeholder="0" value="${s.reps||''}" oninput="updateSet(${i},${j},'reps',this.value)" inputmode="numeric">
        <input type="number" class="set-input" placeholder="—" value="${s.rpe||''}" oninput="updateSet(${i},${j},'rpe',this.value)" inputmode="numeric" min="1" max="10" style="font-size:13px;padding:10px 4px">
        <button class="set-delete" onclick="deleteSet(${i},${j})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('')}
      <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="addSet(${i})">+ Sorozat</button>
    </div>`).join('');
}
function updateSet(i,j,f,v){ currentExercises[i].sets[j][f]=parseFloat(v)||0 }
function addSet(i){ const l=currentExercises[i].sets.slice(-1)[0]; currentExercises[i].sets.push({weight:l?.weight||0,reps:l?.reps||0}); renderExerciseBlocks() }
function deleteSet(i,j){ if(currentExercises[i].sets.length<=1) return; currentExercises[i].sets.splice(j,1); renderExerciseBlocks() }
function removeExercise(i){ currentExercises.splice(i,1); renderExerciseBlocks() }

function saveWorkout(){
  if(!currentExercises.length){ showToast('Adj hozzá legalább egy gyakorlatot!'); return }
  const prs=getPRs(); let newPR=false;
  currentExercises.forEach(ex=>{
    const est1RM=bestEpley(ex.sets);
    if(est1RM>0&&(!prs[ex.exerciseId]||est1RM>prs[ex.exerciseId])){ prs[ex.exerciseId]=est1RM; newPR=true }
  });
  localStorage.setItem('prs',JSON.stringify(prs));
  const dateVal=document.getElementById('session-date').value;
  const wDate=dateVal?new Date(dateVal).getTime():Date.now();
  const ws=DB.workouts;
  if(editingWorkoutId){
    const idx=ws.findIndex(w=>w.id===editingWorkoutId);
    if(idx!==-1){ ws[idx]={...ws[idx],date:wDate,notes:document.getElementById('session-notes').value,exercises:currentExercises.map(ex=>({...ex}))} }
    DB.workouts=ws; editingWorkoutId=null; showToast('✓ Edzés frissítve!'); haptic(15);
  } else {
    ws.push({id:uid(),date:wDate,notes:document.getElementById('session-notes').value,exercises:currentExercises.map(ex=>({...ex})),startTime:workoutStartTime||Date.now(),endTime:Date.now()});
    DB.workouts=ws;
    if(newPR){showToast('🏆 Új 1RM rekord!');celebratePR()}else{showToast('✓ Edzés mentve!');haptic(15)}
  }
  currentExercises=[]; workoutStartTime=null; document.getElementById('session-notes').value=''; document.getElementById('session-date').value='';
  renderExerciseBlocks(); setTimeout(()=>switchScreen('history'),600);
}
function editWorkout(){
  const w=DB.workouts.find(w=>w.id===selectedWorkoutId); if(!w) return;
  closeModal('modal-workout-detail'); editingWorkoutId=w.id;
  currentExercises=w.exercises.map(ex=>({...ex,sets:ex.sets.map(s=>({...s}))}));
  const d=new Date(w.date);
  document.getElementById('session-date').value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  document.getElementById('session-notes').value=w.notes||'';
  switchScreen('log');
}
function cancelEdit(){ editingWorkoutId=null; currentExercises=[]; document.getElementById('session-notes').value=''; document.getElementById('session-date').value=''; switchScreen('history') }

// ════════════════════════════════════════════════
// ADD EXERCISE MODAL
// ════════════════════════════════════════════════
function openAddExerciseModal(){
  selectedExerciseId=null;
  document.getElementById('exercise-search').value='';
  document.getElementById('prev-session-info').innerHTML='';
  const btn=document.getElementById('add-ex-confirm-btn'); btn.disabled=true; btn.style.opacity='0.5';
  const ws=[...DB.workouts].sort((a,b)=>b.date-a.date);
  // Last workout chips
  const last=ws[0];
  const lastEl=document.getElementById('quick-last');
  if(last?.exercises?.length){
    const date=new Date(last.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'});
    lastEl.innerHTML=`<div class="quick-label">⏱ Legutóbbi edzés (${date})</div><div class="quick-chips">${last.exercises.map(e=>`<button class="quick-chip recent" data-exid="${e.exerciseId}" onclick="selectExercise('${e.exerciseId}')">${e.name}</button>`).join('')}</div>`;
  } else lastEl.innerHTML='';
  // Frequent chips
  const freq={};
  ws.forEach(w=>w.exercises.forEach(e=>{ freq[e.exerciseId]=(freq[e.exerciseId]||0)+1 }));
  const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const freqEl=document.getElementById('quick-frequent');
  if(top.length){
    const exs=DB.exercises;
    freqEl.innerHTML=`<div class="quick-label">🔥 Leggyakoribb</div><div class="quick-chips">${top.map(([id])=>{ const ex=exs.find(e=>e.id===id); return ex?`<button class="quick-chip" data-exid="${id}" onclick="selectExercise('${id}')">${ex.name}</button>`:'' }).join('')}</div>`;
  } else freqEl.innerHTML='';
  renderExercisePickList('');
  openModal('modal-add-exercise');
  setTimeout(()=>document.getElementById('exercise-search').focus(),350);
}
function selectExercise(exId){
  selectedExerciseId=exId;
  document.querySelectorAll('[data-exid]').forEach(c=>{ c.classList.toggle('selected',c.dataset.exid===exId) });
  const btn=document.getElementById('add-ex-confirm-btn'); btn.disabled=false; btn.style.opacity='1';
  const prev=getPrevSession(exId);
  const cont=document.getElementById('prev-session-info');
  if(prev){
    const date=new Date(prev.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'});
    cont.innerHTML=`<div class="prev-session"><div class="prev-title">⏱ Előző edzés (${date})</div><div class="prev-sets">${prev.sets.map((s,i)=>`${i+1}. sorozat: ${s.weight} kg × ${s.reps} ism.`).join('<br>')}</div></div>`;
  } else cont.innerHTML='';
}
function filterExercises(){ renderExercisePickList(document.getElementById('exercise-search').value) }
function renderExercisePickList(query){
  const exs=DB.exercises, q=query.toLowerCase().trim();
  const filtered=q?exs.filter(e=>e.name.toLowerCase().includes(q)||e.muscle.toLowerCase().includes(q)):exs;
  const groups={};
  filtered.forEach(e=>{ (groups[e.muscle]||(groups[e.muscle]=[])).push(e) });
  const order=['Mell','Hát','Váll','Bicepsz','Tricepsz','Láb','Has','Egyéb'];
  let html='';
  (q?Object.keys(groups):order).forEach(m=>{
    if(!groups[m]) return;
    html+=`<div class="pick-group-header">${m}</div>`;
    groups[m].forEach(e=>{
      const sel=selectedExerciseId===e.id;
      html+=`<div class="pick-item${sel?' selected':''}" data-exid="${e.id}" onclick="selectExercise('${e.id}')">
        <div>${e.name}</div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;color:${sel?'var(--accent)':'transparent'}"><polyline points="20 6 9 17 4 12"/></svg>
      </div>`;
    });
  });
  document.getElementById('exercise-pick-list').innerHTML=html||`<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">Nincs találat</div>`;
}
function getPrevSession(exId){
  for(const w of [...DB.workouts].sort((a,b)=>b.date-a.date)){
    const ex=w.exercises.find(e=>e.exerciseId===exId);
    if(ex) return{date:w.date,sets:ex.sets};
  }
  return null;
}
function confirmAddExercise(){
  if(!selectedExerciseId) return;
  const ex=DB.exercises.find(e=>e.id===selectedExerciseId); if(!ex) return;
  const prev=getPrevSession(selectedExerciseId);
  currentExercises.push({exerciseId:selectedExerciseId,name:ex.name,muscle:ex.muscle,sets:prev?prev.sets.map(s=>({weight:s.weight,reps:s.reps})):[{weight:0,reps:0}]});
  closeModal('modal-add-exercise'); selectedExerciseId=null; renderExerciseBlocks();
}

// ════════════════════════════════════════════════
// HISTORY
// ════════════════════════════════════════════════
let selectedWorkoutId=null;
function renderHistory(){
  const ws=[...DB.workouts].sort((a,b)=>b.date-a.date);
  if(ws.length===0){
    document.getElementById('history-list').innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Még nincs edzés</div></div>`;
    return;
  }
  let html='', lastMonth='';
  ws.forEach(w=>{
    const d=new Date(w.date);
    const month=d.toLocaleDateString('hu-HU',{year:'numeric',month:'long'});
    if(month!==lastMonth){
      html+=`<div style="padding:12px 20px 6px;font-family:Syne,sans-serif;font-size:14px;font-weight:700;color:var(--muted);letter-spacing:-0.01em">${month}</div>`;
      lastMonth=month;
    }
    html+=workoutCard(w,true);
  });
  document.getElementById('history-list').innerHTML=html;
  initSwipeDelete();
}
function initSwipeDelete(){
  document.querySelectorAll('.history-wrap').forEach(wrap=>{
    const item=wrap.querySelector('.history-item');
    let startX=0,dx=0,swiping=false;
    item.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;dx=0;swiping=true},{passive:true});
    item.addEventListener('touchmove',e=>{
      if(!swiping)return;
      dx=e.touches[0].clientX-startX;
      if(dx>0)dx=0;
      if(dx<-80)dx=-80;
      item.style.transform=`translateX(${dx}px)`;
      item.style.transition='none';
    },{passive:true});
    item.addEventListener('touchend',()=>{
      swiping=false;
      item.style.transition='transform 0.2s ease';
      item.style.transform=dx<-40?'translateX(-80px)':'translateX(0)';
    },{passive:true});
  });
}
function swipeDeleteWorkout(id){
  if(!confirm('Biztosan törlöd ezt az edzést?'))return;
  DB.workouts=DB.workouts.filter(w=>w.id!==id);
  renderHistory();haptic(20);showToast('🗑 Edzés törölve');
}
function openWorkoutDetail(id){
  selectedWorkoutId=id;
  const w=DB.workouts.find(w=>w.id===id); if(!w) return;
  const date=new Date(w.date).toLocaleDateString('hu-HU',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const prs=getPRs();
  const dur=formatDuration(w.startTime,w.endTime);
  let html=`<div class="modal-title">${date}</div>`;
  if(dur) html+=`<div style="font-size:12px;color:var(--accent3);margin-bottom:6px">⏱ ${dur}</div>`;
  if(w.notes) html+=`<div style="font-size:13px;color:var(--muted);margin-bottom:14px;font-style:italic">"${w.notes}"</div>`;
  w.exercises.forEach(ex=>{
    const est1RM=bestEpley(ex.sets);
    const isPR=prs[ex.exerciseId]&&Math.abs(prs[ex.exerciseId]-est1RM)<0.5&&est1RM>0;
    html+=`<div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700">${ex.name}</div>
        ${isPR?'<span class="pr-badge">🏆 PR</span>':''}
      </div>
      ${ex.sets.map((s,i)=>`<div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px">
        <span style="color:var(--muted);min-width:60px">${i+1}. sor</span>
        <span><b>${s.weight}</b> kg</span>
        <span><b>${s.reps}</b> ism.</span>
        ${s.rpe?`<span style="color:var(--accent2)">RPE ${s.rpe}</span>`:''}
        <span style="color:var(--accent3)">~${epley(s.weight||0,s.reps||1)} 1RM</span>
      </div>`).join('')}
    </div>`;
  });
  document.getElementById('workout-detail-content').innerHTML=html;
  openModal('modal-workout-detail');
}
function deleteWorkout(){
  if(!selectedWorkoutId) return;
  DB.workouts=DB.workouts.filter(w=>w.id!==selectedWorkoutId);
  closeModal('modal-workout-detail'); renderHistory(); showToast('🗑 Edzés törölve');
}

// ════════════════════════════════════════════════
// PROGRESS
// ════════════════════════════════════════════════
let progressChart=null, volumeChart=null;
let selectedMuscleGroup='Mell';
let selectedExerciseForProgress=null;

function renderProgressScreen(){
  // Build muscle group tabs — only show groups that have workout data
  const ws=DB.workouts;
  const usedExIds=new Set();
  ws.forEach(w=>w.exercises.forEach(e=>usedExIds.add(e.exerciseId)));
  const usedExs=DB.exercises.filter(e=>usedExIds.has(e.id));
  const usedGroups=[...new Set(usedExs.map(e=>e.muscle))];

  // All groups always shown, grayed if no data
  const allGroups=['Mell','Hát','Váll','Kar','Láb','Has','Egyéb'];
  // "Kar" = Bicepsz + Tricepsz combined
  const karGroups=['Bicepsz','Tricepsz'];

  const tabs=document.getElementById('muscle-tabs');
  tabs.innerHTML=allGroups.map(g=>{
    const hasData= g==='Kar'
      ? usedExs.some(e=>karGroups.includes(e.muscle))
      : usedExs.some(e=>e.muscle===g);
    const isActive=selectedMuscleGroup===g;
    const bg=isActive?'var(--accent)':'var(--surface2)';
    const col=isActive?'#000':(hasData?'var(--text)':'var(--muted)');
    const op=hasData?'1':'0.5';
    return '<button onclick="selectMuscleGroup(\''+g+'\')" style="flex-shrink:0;padding:9px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all 0.2s;background:'+bg+';color:'+col+';opacity:'+op+'">'+g+'</button>';
  }).join('');

  renderExerciseListForMuscle(selectedMuscleGroup);
}

function selectMuscleGroup(group){
  selectedMuscleGroup=group;
  selectedExerciseForProgress=null;
  document.getElementById('progress-content').innerHTML='';
  renderProgressScreen();
}

function renderExerciseListForMuscle(group){
  const karGroups=['Bicepsz','Tricepsz'];
  const ws=DB.workouts;
  // Get all exercise IDs that have at least 1 workout entry for this muscle group
  const muscleExs=DB.exercises.filter(e=>
    group==='Kar' ? karGroups.includes(e.muscle) : e.muscle===group
  );

  const cont=document.getElementById('progress-exercise-list');
  if(!ws.length||!muscleExs.length){
    cont.innerHTML=`<div class="empty-state"><div class="empty-icon">📈</div><div class="empty-title">Még nincs edzés</div><div class="empty-sub">Rögzíts ${group} edzést az előzmények megjelenítéséhez</div></div>`;
    return;
  }

  // For each exercise, gather stats
  const exStats=muscleExs.map(ex=>{
    const sessions=[];
    [...ws].sort((a,b)=>a.date-b.date).forEach(w=>{
      const found=w.exercises.find(e=>e.exerciseId===ex.id);
      if(found&&found.sets.length) sessions.push({date:w.date,sets:found.sets,best1RM:bestEpley(found.sets),maxWeight:Math.max(...found.sets.map(s=>s.weight||0))});
    });
    if(!sessions.length) return null;
    const last=sessions[sessions.length-1];
    const first=sessions[0];
    const trend=sessions.length>1?Math.round((last.best1RM-first.best1RM)/first.best1RM*100):null;
    const prs=getPRs();
    return{ex,sessions,last,trend,pr:prs[ex.id]||0};
  }).filter(Boolean);

  if(!exStats.length){
    cont.innerHTML=`<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">Nincs ${group} adat</div><div class="empty-sub">Rögzíts ${group} edzést az előzmények megjelenítéséhez</div></div>`;
    return;
  }

  cont.innerHTML='<div style="padding:0 16px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px">'
    +exStats.map(s=>{
      const isSelected=selectedExerciseForProgress===s.ex.id;
      const trendColor=s.trend===null?'var(--muted)':s.trend>=0?'var(--safe)':'var(--danger)';
      const trendText=s.trend===null?'—':(s.trend>=0?'+':'')+s.trend+'%';
      const borderCol=isSelected?'var(--accent)':'var(--border)';
      const bg=isSelected?'rgba(232,255,71,0.05)':'var(--surface)';
      const dateStr=new Date(s.last.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'});
      const arrow=isSelected?'<div style="margin-top:10px;font-size:12px;color:var(--accent);text-align:center">▾ Részletek lentebb</div>':'';
      return '<div onclick="selectExerciseForProgress(\''+s.ex.id+'\')" style="background:'+bg+';border:1px solid '+borderCol+';border-radius:var(--radius);padding:16px;cursor:pointer;transition:all 0.2s">'
        +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
        +'<div><div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;line-height:1.3">'+s.ex.name+'</div>'
        +'<div style="font-size:12px;color:var(--muted);margin-top:2px">'+s.sessions.length+' edzés · utolsó: '+dateStr+'</div></div>'
        +'<div style="text-align:right;flex-shrink:0;margin-left:12px">'
        +'<div style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:var(--accent)">'+s.pr+' kg</div>'
        +'<div style="font-size:10px;color:var(--muted)">PR</div></div></div>'
        +'<div style="display:flex;gap:12px">'
        +'<div style="flex:1;background:var(--surface2);border-radius:8px;padding:8px 10px;text-align:center"><div style="font-size:13px;font-weight:600;color:var(--accent3)">'+s.last.best1RM+' kg</div><div style="font-size:10px;color:var(--muted)">Utolsó 1RM</div></div>'
        +'<div style="flex:1;background:var(--surface2);border-radius:8px;padding:8px 10px;text-align:center"><div style="font-size:13px;font-weight:600;color:'+trendColor+'">'+trendText+'</div><div style="font-size:10px;color:var(--muted)">Fejlődés</div></div>'
        +'<div style="flex:1;background:var(--surface2);border-radius:8px;padding:8px 10px;text-align:center"><div style="font-size:13px;font-weight:600">'+s.last.maxWeight+' kg</div><div style="font-size:10px;color:var(--muted)">Max súly</div></div>'
        +'</div>'+arrow+'</div>';
    }).join('')
    +'</div>';

  // If one is selected, show its detail below
  if(selectedExerciseForProgress){
    const stat=exStats.find(s=>s.ex.id===selectedExerciseForProgress);
    if(stat) renderProgressDetail(stat);
  }
}

function selectExerciseForProgress(exId){
  selectedExerciseForProgress=selectedExerciseForProgress===exId?null:exId;
  renderExerciseListForMuscle(selectedMuscleGroup);
  if(selectedExerciseForProgress){
    setTimeout(()=>{
      const el=document.getElementById('progress-content');
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    },100);
  }
}

function renderProgressDetail(stat){
  const data=stat.sessions;
  const prV=stat.pr;
  const first=data[0], last=data[data.length-1];
  const impr=first.best1RM>0?Math.round((last.best1RM-first.best1RM)/first.best1RM*100):0;

  document.getElementById('progress-content').innerHTML=`
    <div style="padding:0 16px;margin-bottom:8px">
      <div style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;margin-bottom:14px;color:var(--accent)">${stat.ex.name}</div>
    </div>
    <div class="stat-grid" style="padding:0 16px;margin-bottom:12px">
      <div class="stat-card"><div class="stat-value stat-accent">${prV} kg</div><div class="stat-label">Max 1RM</div></div>
      <div class="stat-card"><div class="stat-value" style="color:${impr>=0?'var(--safe)':'var(--danger)'}">${impr>=0?'+':''}${impr}%</div><div class="stat-label">1RM fejlődés</div></div>
      <div class="stat-card"><div class="stat-value">${data.length}</div><div class="stat-label">Edzések</div></div>
      <div class="stat-card"><div class="stat-value">${last.best1RM} kg</div><div class="stat-label">Utolsó 1RM</div></div>
    </div>
    <div class="card" style="margin:0 16px 12px"><div style="font-weight:700;font-family:Syne,sans-serif;font-size:14px;margin-bottom:14px">Becsült 1RM fejlődés</div><div class="chart-wrap"><canvas id="weight-chart"></canvas></div></div>
    <div class="card" style="margin:0 16px 12px"><div style="font-weight:700;font-family:Syne,sans-serif;font-size:14px;margin-bottom:14px">Volumen</div><div class="chart-wrap"><canvas id="volume-chart"></canvas></div></div>
    <div class="card" style="margin:0 16px 20px">
      <div style="font-family:Syne,sans-serif;font-size:14px;font-weight:700;margin-bottom:12px">Előzmények</div>
      ${data.slice().reverse().slice(0,10).map(d=>{
        const date=new Date(d.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'});
        const isPR=Math.abs(d.best1RM-prV)<0.5&&prV>0;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:13px;color:var(--muted)">${date}</div>
          <div style="display:flex;align-items:center;gap:8px"><div style="font-size:13px"><b>${d.best1RM}</b> kg 1RM</div>${isPR?'<span class="pr-badge">🏆</span>':''}</div>
          <div style="font-size:12px;color:var(--muted)">${d.maxWeight}kg · ${d.sets.length} sor</div>
        </div>`;
      }).join('')}
    </div>`;

  setTimeout(()=>{
    const labels=data.map(d=>new Date(d.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'}));
    const base={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1f1f1f',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,titleColor:'#e8ff47',bodyColor:'#f0f0f0',padding:10,cornerRadius:8}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#666',font:{size:10},maxTicksLimit:6}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#666',font:{size:10}}}}};
    if(progressChart) progressChart.destroy();
    progressChart=new Chart(document.getElementById('weight-chart'),{type:'line',data:{labels,datasets:[{data:data.map(d=>d.best1RM),borderColor:'#e8ff47',backgroundColor:'rgba(232,255,71,0.08)',borderWidth:2.5,fill:true,tension:0.4,pointBackgroundColor:data.map(d=>Math.abs(d.best1RM-prV)<0.5?'#ffd700':'#e8ff47'),pointRadius:data.map(d=>Math.abs(d.best1RM-prV)<0.5?6:3)}]},options:{...base,plugins:{...base.plugins,tooltip:{...base.plugins.tooltip,callbacks:{label:ctx=>`~${ctx.raw} kg 1RM`}}}}});
    if(volumeChart) volumeChart.destroy();
    const volumes=data.map(d=>d.sets.reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0));
    volumeChart=new Chart(document.getElementById('volume-chart'),{type:'bar',data:{labels,datasets:[{data:volumes,backgroundColor:'rgba(71,196,255,0.3)',borderColor:'#47c4ff',borderWidth:1.5,borderRadius:6}]},options:{...base,plugins:{...base.plugins,tooltip:{...base.plugins.tooltip,callbacks:{label:ctx=>`${ctx.raw.toLocaleString('hu-HU')} kg`}}}}});
  },50);
}

function renderProgress(){ /* legacy compat */ }

// ════════════════════════════════════════════════
// TEMPLATES
// ════════════════════════════════════════════════
let tplSelected=[], editingTemplateId=null;
function renderTemplates(){
  const temps=DB.templates;
  const cont=document.getElementById('template-list');
  if(!temps.length){
    cont.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Még nincs sablon</div><div class="empty-sub">Mentsd el kedvenc edzéseidet és egy gombbal indítsd el!</div></div>`;
    return;
  }
  cont.innerHTML=temps.map(t=>`
    <div class="template-card">
      <div class="template-name">${t.name}</div>
      <div class="template-exercises">${t.exercises.map(e=>e.name).join(' · ')}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn btn-primary btn-sm" onclick="loadTemplate('${t.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Indítás
        </button>
        <button class="btn btn-secondary btn-sm" onclick="editTemplate('${t.id}')">Szerkesztés</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTemplate('${t.id}')" style="padding:8px 10px">✕</button>
      </div>
    </div>`).join('');
}
function openSaveTemplateModal(preselected,preName){
  tplSelected=preselected||[];
  document.getElementById('template-name-input').value=preName||'';
  const exs=DB.exercises, groups={};
  exs.forEach(e=>{ (groups[e.muscle]||(groups[e.muscle]=[])).push(e) });
  const order=['Mell','Hát','Váll','Bicepsz','Tricepsz','Láb','Has','Egyéb'];
  const selIds=new Set(tplSelected.map(s=>s.id));
  let html='';
  order.forEach(m=>{
    if(!groups[m]) return;
    html+=`<div class="pick-group-header">${m}</div>`;
    groups[m].forEach(e=>{
      const sel=selIds.has(e.id);
      html+=`<div class="pick-item${sel?' selected':''}" id="tpl-${e.id}" onclick="toggleTpl('${e.id}','${e.name.replace(/'/g,"\\'")}','${e.muscle}')">
        <div>${e.name}</div>
        <svg id="tc-${e.id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;color:${sel?'var(--accent)':'transparent'}"><polyline points="20 6 9 17 4 12"/></svg>
      </div>`;
    });
  });
  document.getElementById('template-ex-picker').innerHTML=html;
  openModal('modal-save-template');
}
function editTemplate(id){
  const t=DB.templates.find(t=>t.id===id);if(!t)return;
  editingTemplateId=id;
  const preselected=t.exercises.map(ex=>({id:ex.exerciseId,name:ex.name,muscle:ex.muscle}));
  openSaveTemplateModal(preselected,t.name);
}
function toggleTpl(id,name,muscle){
  const idx=tplSelected.findIndex(e=>e.id===id);
  if(idx===-1){ tplSelected.push({id,name,muscle}); document.getElementById(`tpl-${id}`).classList.add('selected'); document.getElementById(`tc-${id}`).style.color='var(--accent)' }
  else{ tplSelected.splice(idx,1); document.getElementById(`tpl-${id}`).classList.remove('selected'); document.getElementById(`tc-${id}`).style.color='transparent' }
}
function saveTemplate(){
  const name=document.getElementById('template-name-input').value.trim();
  if(!name){ showToast('Adj meg egy nevet!'); return }
  if(!tplSelected.length){ showToast('Válassz legalább egy gyakorlatot!'); return }
  const temps=DB.templates;
  const exercises=tplSelected.map(e=>({exerciseId:e.id,name:e.name,muscle:e.muscle}));
  if(editingTemplateId){
    const idx=temps.findIndex(t=>t.id===editingTemplateId);
    if(idx!==-1) temps[idx]={...temps[idx],name,exercises};
    editingTemplateId=null;
    DB.templates=temps; closeModal('modal-save-template'); renderTemplates(); showToast('✓ Sablon frissítve!');
  } else {
    temps.push({id:uid(),name,exercises});
    DB.templates=temps; closeModal('modal-save-template'); renderTemplates(); showToast('✓ Sablon mentve!');
  }
}
function loadTemplate(id){
  const t=DB.templates.find(t=>t.id===id); if(!t) return;
  editingWorkoutId=null; workoutStartTime=Date.now();
  currentExercises=t.exercises.map(ex=>{
    const prev=getPrevSession(ex.exerciseId);
    return{exerciseId:ex.exerciseId,name:ex.name,muscle:ex.muscle,sets:prev?prev.sets.map(s=>({weight:s.weight,reps:s.reps})):[{weight:0,reps:0}]};
  });
  document.getElementById('session-date').value=today();
  document.getElementById('session-notes').value=t.name;
  switchScreen('log'); showToast(`✓ ${t.name} betöltve!`);
}
function deleteTemplate(id){ DB.templates=DB.templates.filter(t=>t.id!==id); renderTemplates(); showToast('🗑 Sablon törölve') }

// ════════════════════════════════════════════════
// MORE: BODYWEIGHT + WEEKLY + EXPORT
// ════════════════════════════════════════════════
let bwChart=null;
function toggleTheme(){
  const isLight=document.documentElement.classList.toggle('light');
  localStorage.setItem('theme',isLight?'light':'dark');
  updateThemeUI(isLight);
  document.querySelector('meta[name="theme-color"]').content=isLight?'#f5f5f5':'#0d0d0d';
}
function updateThemeUI(isLight){
  document.getElementById('theme-icon').textContent=isLight?'☀️':'🌙';
  document.getElementById('theme-label').textContent=isLight?'Világos mód':'Sötét mód';
  const knob=document.getElementById('theme-knob');
  const toggle=document.getElementById('theme-toggle');
  if(isLight){knob.style.left='3px';toggle.style.background='var(--accent)'}
  else{knob.style.left='25px';toggle.style.background='var(--accent)'}
}
function initTheme(){
  const saved=localStorage.getItem('theme');
  if(saved==='light'){document.documentElement.classList.add('light');updateThemeUI(true);document.querySelector('meta[name="theme-color"]').content='#f5f5f5'}
}
function saveUsername(val){ localStorage.setItem('username',val.trim()) }
function renderMore(){
  document.getElementById('bw-date').value=today();
  document.getElementById('username-input').value=localStorage.getItem('username')||'';
  renderBodyweightList(); renderWeeklySummary();
  updateThemeUI(document.documentElement.classList.contains('light'));
}
function addBodyweight(){
  const val=parseFloat(document.getElementById('bw-input').value);
  if(!val||val<=0){ showToast('Adj meg egy súlyt!'); return }
  const dateVal=document.getElementById('bw-date').value;
  const bws=DB.bodyweights;
  bws.push({id:uid(),date:dateVal?new Date(dateVal).getTime():Date.now(),weight:val});
  DB.bodyweights=bws.sort((a,b)=>b.date-a.date);
  document.getElementById('bw-input').value='';
  renderBodyweightList(); showToast('✓ Testsúly mentve!');
}
function renderBodyweightList(){
  const bws=[...DB.bodyweights].sort((a,b)=>b.date-a.date);
  const cont=document.getElementById('bw-list');
  cont.innerHTML=bws.length===0
    ?`<div style="text-align:center;padding:16px 0;color:var(--muted);font-size:13px">Még nincs bejegyzés</div>`
    :bws.slice(0,10).map((b,i)=>{
      const date=new Date(b.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric',weekday:'short'});
      const prev=bws[i+1];
      const diff=prev?Math.round((b.weight-prev.weight)*10)/10:null;
      const diffHtml=diff!==null?`<span class="bw-diff ${diff>0?'up':diff<0?'down':'same'}">${diff>0?'+':''}${diff} kg</span>`:'';
      return `<div class="bw-entry">
        <div class="bw-date">${date}</div>
        <div style="display:flex;align-items:center;gap:8px"><div class="bw-value">${b.weight} kg</div>${diffHtml}</div>
        <button onclick="deleteBW('${b.id}')" style="background:none;border:none;color:var(--muted2);cursor:pointer;font-size:16px;padding:4px">✕</button>
      </div>`;
    }).join('');
  // BW Chart
  const chartData=[...bws].sort((a,b)=>a.date-b.date).slice(-20);
  if(chartData.length>1){
    setTimeout(()=>{
      if(bwChart) bwChart.destroy();
      bwChart=new Chart(document.getElementById('bw-chart'),{
        type:'line',
        data:{labels:chartData.map(b=>new Date(b.date).toLocaleDateString('hu-HU',{month:'short',day:'numeric'})),datasets:[{data:chartData.map(b=>b.weight),borderColor:'#47c4ff',backgroundColor:'rgba(71,196,255,0.08)',borderWidth:2,fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#47c4ff'}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1f1f1f',borderColor:'rgba(255,255,255,0.1)',borderWidth:1,titleColor:'#47c4ff',bodyColor:'#f0f0f0',padding:8,cornerRadius:8,callbacks:{label:ctx=>`${ctx.raw} kg`}}},scales:{x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#666',font:{size:9},maxTicksLimit:5}},y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#666',font:{size:9}}}}}
      });
    },50);
  }
}
function deleteBW(id){ DB.bodyweights=DB.bodyweights.filter(b=>b.id!==id); renderBodyweightList() }

function renderWeeklySummary(){
  const weekAgo=Date.now()-7*864e5;
  const ws=DB.workouts.filter(w=>w.date>weekAgo);
  const cont=document.getElementById('weekly-summary');
  if(!ws.length){
    cont.innerHTML=`<div class="card" style="margin:0 16px 12px"><div style="text-align:center;padding:10px 0;color:var(--muted);font-size:13px">Ezen a héten még nincs edzés</div></div>`;
    return;
  }
  const mc={};
  ws.forEach(w=>w.exercises.forEach(e=>{ mc[e.muscle]=(mc[e.muscle]||0)+1 }));
  const maxC=Math.max(...Object.values(mc));
  const allM=['Mell','Hát','Váll','Bicepsz','Tricepsz','Láb','Has'];
  const neglected=allM.filter(m=>!mc[m]);
  const totalSets=ws.reduce((a,w)=>a+w.exercises.reduce((b,e)=>b+e.sets.length,0),0);
  const totalVol=ws.reduce((a,w)=>a+w.exercises.reduce((b,e)=>b+e.sets.reduce((c,s)=>c+(s.weight||0)*(s.reps||0),0),0),0);
  cont.innerHTML=`<div class="card" style="margin:0 16px 12px">
    <div style="display:flex;justify-content:space-around;margin-bottom:18px">
      <div style="text-align:center"><div style="font-family:Syne,sans-serif;font-size:24px;font-weight:800;color:var(--accent)">${ws.length}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em">Edzés</div></div>
      <div style="text-align:center"><div style="font-family:Syne,sans-serif;font-size:24px;font-weight:800">${totalSets}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em">Sorozat</div></div>
      <div style="text-align:center"><div style="font-family:Syne,sans-serif;font-size:24px;font-weight:800">${Math.round(totalVol/1000*10)/10}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em">Tonna</div></div>
    </div>
    <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Izomcsoportok ezen a héten</div>
    ${Object.keys(mc).map(m=>`<div class="muscle-bar-row">
      <div class="muscle-bar-label">${m}</div>
      <div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:${Math.round(mc[m]/maxC*100)}%"></div></div>
      <div class="muscle-bar-count">${mc[m]}×</div>
    </div>`).join('')}
    ${neglected.length?`<div style="margin-top:12px;padding:10px 14px;background:rgba(255,107,53,0.1);border:1px solid rgba(255,107,53,0.2);border-radius:8px;font-size:13px;color:#ff6b35">⚠️ <b>Elhanyagolt:</b> ${neglected.join(', ')}</div>`:'<div style="margin-top:10px;padding:10px 14px;background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.2);border-radius:8px;font-size:13px;color:var(--safe)">✅ Minden izomcsoport edzetted!</div>'}
  </div>`;
}

// ════════════════════════════════════════════════
// EXPORT / IMPORT
// ════════════════════════════════════════════════
function exportData(){
  const data={version:2,exported:new Date().toISOString(),workouts:DB.workouts,exercises:DB.exercises,bodyweights:DB.bodyweights,templates:DB.templates,prs:getPRs()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=`edzsnaplo-${today()}.json`; a.click();
  URL.revokeObjectURL(url); showToast('✓ Backup letöltve!');
}
function importData(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=evt=>{
    try{
      const data=JSON.parse(evt.target.result);
      if(data.workouts) DB.workouts=data.workouts;
      if(data.exercises) DB.exercises=data.exercises;
      if(data.bodyweights) DB.bodyweights=data.bodyweights;
      if(data.templates) DB.templates=data.templates;
      if(data.prs) localStorage.setItem('prs',JSON.stringify(data.prs));
      initDefaults(); renderHome(); showToast('✓ Adatok visszaállítva!');
    } catch(err){ showToast('❌ Hibás fájl!') }
  };
  reader.readAsText(file); e.target.value='';
}

// ════════════════════════════════════════════════
// EXERCISE LIST
// ════════════════════════════════════════════════
function filterExerciseList(){
  const q=document.getElementById('exercise-list-search').value;
  renderExerciseList(q);
}
function renderExerciseList(query){
  const q=(query||'').toLowerCase().trim();
  const allExs=DB.exercises;
  const exs=q?allExs.filter(e=>e.name.toLowerCase().includes(q)||e.muscle.toLowerCase().includes(q)):allExs;
  const cont=document.getElementById('exercise-list-container');
  if(!exs.length){ cont.innerHTML=`<div class="empty-state"><div class="empty-icon">${q?'🔍':'💪'}</div><div class="empty-title">${q?'Nincs találat':'Nincs gyakorlat'}</div></div>`; return }
  const groups={};
  exs.forEach(e=>{ (groups[e.muscle]||(groups[e.muscle]=[])).push(e) });
  const order=['Mell','Hát','Váll','Bicepsz','Tricepsz','Láb','Has','Egyéb'];
  let html='';
  order.forEach(m=>{
    if(!groups[m]) return;
    html+=`<div style="padding:9px 16px 3px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);background:var(--surface2)">${m}</div>`;
    groups[m].forEach(e=>{
      html+=`<div class="exercise-list-item">
        <div style="flex:1;min-width:0"><div class="exlist-name">${e.name}</div></div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          <button class="btn-muscle-map" onclick="showMuscleMap('${e.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--accent3)"><circle cx="12" cy="8" r="3"/><path d="M12 11c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"/><path d="M8 18v3M16 18v3"/></svg>
          </button>
          <button onclick="deleteExercise('${e.id}')" style="background:none;border:none;color:var(--muted2);cursor:pointer;padding:4px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
    });
  });
  cont.innerHTML=html;
}
function openNewExerciseModal(){ document.getElementById('new-ex-name').value=''; openModal('modal-new-exercise') }
function saveNewExercise(){
  const name=document.getElementById('new-ex-name').value.trim();
  if(!name){ showToast('Adj meg egy nevet!'); return }
  const muscle=document.getElementById('new-ex-muscle').value;
  const exs=DB.exercises; exs.push({id:uid(),name,muscle,muscles:[]});
  DB.exercises=exs; closeModal('modal-new-exercise'); renderExerciseList(); showToast('✓ Gyakorlat hozzáadva!');
}
function deleteExercise(id){ DB.exercises=DB.exercises.filter(e=>e.id!==id); renderExerciseList(); showToast('🗑 Törölve') }

// ════════════════════════════════════════════════
// MUSCLE MAP
// ════════════════════════════════════════════════
function showMuscleMap(exId){
  const ex=DB.exercises.find(e=>e.id===exId); if(!ex) return;
  const active=ex.muscles?.length?ex.muscles:(DEFAULT_MUSCLES[ex.name]||[]);
  document.getElementById('muscle-map-content').innerHTML=`
    <div class="modal-title">${ex.name}</div>
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
      <span class="exlist-muscle muscle-${ex.muscle.toLowerCase()}">${ex.muscle}</span>
      ${active.map(m=>`<span style="font-size:11px;color:var(--muted);background:var(--surface2);padding:3px 8px;border-radius:20px">${muscleLabel(m)}</span>`).join('')}
    </div>
    <div style="display:flex;gap:12px;justify-content:center">
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.1em">Elöl</div>${bodyFront(active)}</div>
      <div style="text-align:center"><div style="font-size:10px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.1em">Hátul</div>${bodyBack(active)}</div>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;margin-top:12px;font-size:12px;color:var(--muted)">
      <div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;background:#e8ff47;border-radius:3px;display:inline-block"></span>Elsődleges</div>
      <div style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;background:rgba(232,255,71,0.25);border-radius:3px;display:inline-block;border:1px solid rgba(232,255,71,0.4)"></span>Másodlagos</div>
    </div>`;
  openModal('modal-muscle-map');
}
function muscleLabel(m){const map={'chest':'Mell (középső)','chest-upper':'Mell (felső)','chest-lower':'Mell (alsó)','front-delt':'Váll (elülső)','side-delt':'Váll (oldalsó)','rear-delt':'Váll (hátsó)','lats':'Széles hátizom','mid-back':'Középső hát','lower-back':'Ágyéki hát','traps':'Trapézizom','biceps':'Bicepsz','triceps':'Tricepsz','forearms':'Alkar','quads':'Combfeszítő','hamstrings':'Combhajlító','glutes':'Farizom','calves':'Vádli','inner-thigh':'Belső comb','outer-thigh':'Külső comb','core':'Has','obliques':'Oldalsó has','hip-flexors':'Csípőhajlító'};return map[m]||m}
function fill(m,id){return m.includes(id)?'#e8ff47':'#2a2a2a'}
function fillSec(m,p,s){if(p.some(id=>m.includes(id)))return'#e8ff47';if(s.some(id=>m.includes(id)))return'rgba(232,255,71,0.3)';return'#2a2a2a'}
function bodyFront(m){return`<svg viewBox="0 0 120 260" width="110" height="250" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="22" rx="14" ry="16" fill="#222" stroke="#444" stroke-width="1.5"/><rect x="54" y="35" width="12" height="10" rx="4" fill="#222" stroke="#444" stroke-width="1"/><path d="M32 45 Q28 50 26 80 Q24 110 28 130 L92 130 Q96 110 94 80 Q92 50 88 45 Z" fill="#222" stroke="#444" stroke-width="1.5"/><ellipse cx="47" cy="62" rx="14" ry="9" fill="${fillSec(m,['chest','chest-upper'],[])}"/><ellipse cx="73" cy="62" rx="14" ry="9" fill="${fillSec(m,['chest','chest-upper'],[])}"/><ellipse cx="47" cy="76" rx="13" ry="7" fill="${fillSec(m,['chest-lower','chest'],['chest-upper'])}"/><ellipse cx="73" cy="76" rx="13" ry="7" fill="${fillSec(m,['chest-lower','chest'],['chest-upper'])}"/><rect x="49" y="85" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><rect x="63" y="85" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><rect x="49" y="95" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><rect x="63" y="95" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><rect x="49" y="105" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><rect x="63" y="105" width="8" height="7" rx="2" fill="${fill(m,'core')}"/><ellipse cx="38" cy="100" rx="7" ry="14" fill="${fill(m,'obliques')}"/><ellipse cx="82" cy="100" rx="7" ry="14" fill="${fill(m,'obliques')}"/><ellipse cx="26" cy="53" rx="9" ry="10" fill="${fillSec(m,['front-delt'],['side-delt'])}"/><ellipse cx="94" cy="53" rx="9" ry="10" fill="${fillSec(m,['front-delt'],['side-delt'])}"/><ellipse cx="19" cy="60" rx="7" ry="9" fill="${fill(m,'side-delt')}"/><ellipse cx="101" cy="60" rx="7" ry="9" fill="${fill(m,'side-delt')}"/><path d="M16 68 Q10 80 12 100 Q18 108 24 100 Q26 82 24 68 Z" fill="${fill(m,'biceps')}" stroke="#333" stroke-width="1"/><path d="M104 68 Q110 80 108 100 Q102 108 96 100 Q94 82 96 68 Z" fill="${fill(m,'biceps')}" stroke="#333" stroke-width="1"/><path d="M12 102 Q10 118 13 132 Q17 136 22 132 Q24 118 24 102 Z" fill="${fill(m,'forearms')}" stroke="#333" stroke-width="1"/><path d="M108 102 Q110 118 107 132 Q103 136 98 132 Q96 118 96 102 Z" fill="${fill(m,'forearms')}" stroke="#333" stroke-width="1"/><ellipse cx="15" cy="137" rx="7" ry="9" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="105" cy="137" rx="7" ry="9" fill="#222" stroke="#444" stroke-width="1"/><path d="M28 130 Q24 145 26 158 L94 158 Q96 145 92 130 Z" fill="#222" stroke="#444" stroke-width="1.5"/><ellipse cx="46" cy="140" rx="11" ry="8" fill="${fill(m,'hip-flexors')}"/><ellipse cx="74" cy="140" rx="11" ry="8" fill="${fill(m,'hip-flexors')}"/><path d="M30 158 Q26 185 28 215 Q34 222 42 215 Q46 185 48 158 Z" fill="${fill(m,'quads')}" stroke="#333" stroke-width="1"/><path d="M90 158 Q94 185 92 215 Q86 222 78 215 Q74 185 72 158 Z" fill="${fill(m,'quads')}" stroke="#333" stroke-width="1"/><path d="M48 158 Q52 178 54 210 Q58 218 60 210 Q60 178 72 158 Q60 162 48 158Z" fill="${fillSec(m,['inner-thigh'],['quads'])}"/><ellipse cx="37" cy="220" rx="10" ry="8" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="83" cy="220" rx="10" ry="8" fill="#222" stroke="#444" stroke-width="1"/><path d="M28 228 Q26 245 30 258 Q36 262 42 258 Q44 244 44 228 Z" fill="${fill(m,'calves')}" stroke="#333" stroke-width="1"/><path d="M92 228 Q94 245 90 258 Q84 262 78 258 Q76 244 76 228 Z" fill="${fill(m,'calves')}" stroke="#333" stroke-width="1"/><ellipse cx="36" cy="260" rx="10" ry="5" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="84" cy="260" rx="10" ry="5" fill="#222" stroke="#444" stroke-width="1"/><path d="M43 45 Q60 40 77 45 Q70 50 60 48 Q50 50 43 45Z" fill="${fill(m,'traps')}" opacity="0.7"/></svg>`}
function bodyBack(m){return`<svg viewBox="0 0 120 260" width="110" height="250" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="22" rx="14" ry="16" fill="#222" stroke="#444" stroke-width="1.5"/><rect x="54" y="35" width="12" height="10" rx="4" fill="#222" stroke="#444" stroke-width="1"/><path d="M32 45 Q28 50 26 80 Q24 110 28 130 L92 130 Q96 110 94 80 Q92 50 88 45 Z" fill="#222" stroke="#444" stroke-width="1.5"/><path d="M43 45 Q60 38 77 45 Q82 55 80 65 Q70 60 60 62 Q50 60 40 65 Q38 55 43 45Z" fill="${fill(m,'traps')}"/><ellipse cx="26" cy="53" rx="9" ry="10" fill="${fillSec(m,['rear-delt'],['side-delt'])}"/><ellipse cx="94" cy="53" rx="9" ry="10" fill="${fillSec(m,['rear-delt'],['side-delt'])}"/><ellipse cx="19" cy="60" rx="7" ry="9" fill="${fill(m,'side-delt')}" opacity="0.7"/><ellipse cx="101" cy="60" rx="7" ry="9" fill="${fill(m,'side-delt')}" opacity="0.7"/><path d="M32 65 Q26 80 28 110 Q34 118 46 110 Q50 88 48 65 Z" fill="${fill(m,'lats')}"/><path d="M88 65 Q94 80 92 110 Q86 118 74 110 Q70 88 72 65 Z" fill="${fill(m,'lats')}"/><rect x="48" y="70" width="10" height="30" rx="3" fill="${fill(m,'mid-back')}"/><rect x="62" y="70" width="10" height="30" rx="3" fill="${fill(m,'mid-back')}"/><path d="M48 100 Q44 118 46 130 L74 130 Q76 118 72 100 Q66 108 60 108 Q54 108 48 100Z" fill="${fill(m,'lower-back')}"/><path d="M16 68 Q10 80 12 100 Q18 108 24 100 Q26 82 24 68 Z" fill="${fill(m,'triceps')}" stroke="#333" stroke-width="1"/><path d="M104 68 Q110 80 108 100 Q102 108 96 100 Q94 82 96 68 Z" fill="${fill(m,'triceps')}" stroke="#333" stroke-width="1"/><path d="M12 102 Q10 118 13 132 Q17 136 22 132 Q24 118 24 102 Z" fill="${fill(m,'forearms')}" stroke="#333" stroke-width="1"/><path d="M108 102 Q110 118 107 132 Q103 136 98 132 Q96 118 96 102 Z" fill="${fill(m,'forearms')}" stroke="#333" stroke-width="1"/><ellipse cx="15" cy="137" rx="7" ry="9" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="105" cy="137" rx="7" ry="9" fill="#222" stroke="#444" stroke-width="1"/><path d="M28 130 Q24 148 28 160 Q36 168 50 162 Q58 152 60 148 Q62 152 70 162 Q84 168 92 160 Q96 148 92 130 Z" fill="${fill(m,'glutes')}" stroke="#333" stroke-width="1"/><path d="M30 162 Q26 188 30 215 Q36 222 44 215 Q48 188 50 162 Z" fill="${fill(m,'hamstrings')}" stroke="#333" stroke-width="1"/><path d="M90 162 Q94 188 90 215 Q84 222 76 215 Q72 188 70 162 Z" fill="${fill(m,'hamstrings')}" stroke="#333" stroke-width="1"/><ellipse cx="37" cy="220" rx="10" ry="8" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="83" cy="220" rx="10" ry="8" fill="#222" stroke="#444" stroke-width="1"/><path d="M28 228 Q26 245 30 258 Q36 262 44 258 Q46 244 44 228 Z" fill="${fill(m,'calves')}" stroke="#333" stroke-width="1"/><path d="M92 228 Q94 245 90 258 Q84 262 76 258 Q74 244 76 228 Z" fill="${fill(m,'calves')}" stroke="#333" stroke-width="1"/><ellipse cx="36" cy="260" rx="10" ry="5" fill="#222" stroke="#444" stroke-width="1"/><ellipse cx="84" cy="260" rx="10" ry="5" fill="#222" stroke="#444" stroke-width="1"/></svg>`}

// ════════════════════════════════════════════════
// RESET
// ════════════════════════════════════════════════
function confirmReset(){ openModal('modal-reset') }
function doReset(){
  ['workouts','prs','bodyweights','templates','exercises'].forEach(k=>localStorage.removeItem(k));
  initDefaults(); closeModal('modal-reset'); renderHome(); renderExerciseList(); showToast('🗑 Összes adat törölve');
}

// ════════════════════════════════════════════════
// MODAL + TOAST HELPERS
// ════════════════════════════════════════════════
function openModal(id){ document.getElementById(id).classList.add('open') }
function closeModal(id){ document.getElementById(id).classList.remove('open') }
function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500) }
function celebratePR(){
  const colors=['#e8ff47','#ffd700','#ff6b35','#47c4ff','#c864ff','#50dc78','#ff5078'];
  const wrap=document.createElement('div');wrap.className='confetti-wrap';document.body.appendChild(wrap);
  for(let i=0;i<40;i++){
    const p=document.createElement('div');p.className='confetti-piece';
    const c=colors[Math.floor(Math.random()*colors.length)];
    const shapes=['50%','2px','0'];const br=shapes[Math.floor(Math.random()*3)];
    Object.assign(p.style,{left:Math.random()*100+'%',background:c,borderRadius:br,width:(6+Math.random()*8)+'px',height:(6+Math.random()*8)+'px',animationDelay:(Math.random()*0.6)+'s',animationDuration:(1.2+Math.random()*1)+'s'});
    wrap.appendChild(p);
  }
  if(navigator.vibrate)navigator.vibrate([50,30,100]);
  setTimeout(()=>wrap.remove(),3000);
}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('open') }));

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
initDefaults();
initTheme();
if(!localStorage.getItem('prs_v2_migrated')){
  const prs={};
  DB.workouts.forEach(w=>w.exercises.forEach(ex=>{
    const est=bestEpley(ex.sets);
    if(est>0&&(!prs[ex.exerciseId]||est>prs[ex.exerciseId])) prs[ex.exerciseId]=est;
  }));
  localStorage.setItem('prs',JSON.stringify(prs));
  localStorage.setItem('prs_v2_migrated','1');
}
renderHome();

// Hide splash screen
setTimeout(()=>{
  const splash=document.getElementById('splash');
  if(splash){splash.style.opacity='0';splash.style.visibility='hidden';setTimeout(()=>splash.remove(),500)}
},1200);

let swipeBackStart=null;
document.addEventListener('touchstart',e=>{
  if(!['progress','templates','exercises'].includes(currentScreen))return;
  swipeBackStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!swipeBackStart)return;
  const t=e.changedTouches[0];
  const dx=t.clientX-swipeBackStart.x,dy=Math.abs(t.clientY-swipeBackStart.y);
  const edge=Math.max(120,Math.min(200,window.innerWidth*0.38));
  if(dx>65&&swipeBackStart.x<edge&&dy<100) switchScreen('more');
  swipeBackStart=null;
},{passive:true});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
</script>
