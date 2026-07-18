/* =====================================================================
   ONZE — app.js  (UI + controle da temporada + finanças)
   ===================================================================== */
import * as C from "./core.js";
import * as S from "./storage.js";
import * as K from "./kit.js";
import * as BR from "./brands.js";
import * as ED from "./editors.js";
import { ATTR_PT, STAFF_ROLES } from "./core.js";

let world, userId, view="tabela", calRound=0, finTab="overview", market=null;
const $ = id => document.getElementById(id);
const brl = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
const el = (t,c,h)=>{ const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };
const ovrColor = v => `hsl(${Math.max(0,Math.min(1,(v-40)/50))*120} 60% 55%)`;
const qualWord = q => q>=80?"Excelente":q>=65?"Bom":q>=50?"Regular":q>=35?"Fraco":"Amador";

/* ---------- Menu / telas ---------- */
function showScreen(name){
  for(const s of ["menu","start","main"]) $("screen-"+s).classList.toggle("hidden", s!==name);
}
/* Banco de marcas: IndexedDB (editado no jogo) → arquivo → embutido */
let brandSrc="embutido";
async function loadBrands(){
  try{
    const saved=await S.getData("brands");
    if(saved && saved.length){ BR.setBrands(saved); brandSrc="editor (IndexedDB)"; return; }
  }catch(e){}
  try{
    const r=await fetch("assets/brands/brands.json",{cache:"no-cache"});
    if(r.ok){
      const j=await r.json(); const list=Array.isArray(j)?j:j.brands;
      if(list && list.length){ BR.setBrands(list); brandSrc="assets/brands/brands.json"; return; }
    }
  }catch(e){}
  brandSrc="embutido (placeholders)";
}
/* logos apontando para arquivo inexistente viram null (cai no wordmark) */
async function sanitizeLogos(){
  const n=await BR.validateLogos();
  if(n){ await saveBrands(); console.info(`[Onze] ${n} logo(s) sem arquivo → usando wordmark`); }
  return n;
}
const saveBrands = ()=> S.putData("brands", BR.BRANDS).catch(()=>{});

/* mundo salvo pelo editor: toda carreira nova nasce dele */
let worldTpl=null;
async function loadWorldTemplate(){
  try{ worldTpl = await S.getData("worldTemplate"); }catch(e){ worldTpl=null; }
  return worldTpl;
}
function saveWorldTemplate(w){
  worldTpl = C.worldTemplate(w);
  S.putData("worldTemplate", worldTpl).catch(()=>{});
  return worldTpl;
}
function clearWorldTemplate(){ worldTpl=null; S.putData("worldTemplate", null).catch(()=>{}); }
function freshWorld(){
  const w = worldTpl ? C.worldFromTemplate(worldTpl) : C.generateWorld();
  migrate(w); return w;
}

async function boot(){
  await loadBrands();
  await sanitizeLogos();
  await loadWorldTemplate();
  showScreen("menu");
  try{
    const s=await S.loadGame();
    if(s && s.world){
      const club=s.world.clubs.find(c=>c.id===s.world.userId);
      $("mContinue").disabled=false;
      $("mSaveInfo").innerHTML=`Save encontrado: <b>${club?club.name:"?"}</b> · temporada ${s.world.season} ·
        rodada ${Math.min(s.world.round+1,30)} · ${new Date(s.savedAt).toLocaleString("pt-BR")}`;
    } else $("mSaveInfo").textContent="Nenhuma carreira salva.";
  }catch(e){ $("mSaveInfo").textContent="Nenhuma carreira salva."; }
}
function newGame(){
  // começa do mundo editado/salvo (clubes, elencos, escudos, mapa) ou gera um novo
  world = window.__draft || freshWorld();
  window.__draft = null;
  migrate(world);
  renderClubGrid(); showScreen("start");
}
function renderClubGrid(){
  const grid = $("clubGrid"); grid.innerHTML="";
  for(const c of world.clubs){
    const card = el("div","clubcard");
    card.innerHTML = `<div style="height:40px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center">${badgeHTML(c,40)}</div>
      <div class="nm">${c.name}</div><div class="cy">${c.city} · ${C.stadiumOf(c).capacity.toLocaleString("pt-BR")} lug.</div>
      <div class="rep">${starsHTML(c.prestige)} <span class="muted">${C.reachOf(c.prestige).l}</span></div>`;
    card.onclick = ()=> chooseClub(c.id);
    grid.appendChild(card);
  }
}
function chooseClub(id){
  userId=id; world.userId=id; calRound=world.round; market=C.generateStaffMarket();
  C.refreshMarket(world);
  const c=me(); c.prospects=C.scoutProspects(c);     // primeiro relatório do olheiro
  enterGame();
}
function enterGame(){ showScreen("main"); rerender(); }
/* aviso curto no canto */
function toast(msg){
  const t=el("div","toast",msg); document.body.appendChild(t);
  setTimeout(()=>t.classList.add("show"),10);
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); },1800);
}
function adoptWorld(w){
  migrate(w);
  world=w; userId=w.userId; calRound=Math.min(w.round, C.totalRounds(w)-1);
  market=C.generateStaffMarket(); enterGame();
}
/* saves antigos podem não ter campos novos */
function migrate(w){
  w.customFormations = w.customFormations || [];
  w.phase = w.phase || "league";
  w.transferList = w.transferList || [];
  w.friendlies = w.friendlies || [];
  for(const c of w.clubs){
    c.prospects = c.prospects || [];
    for(const p of c.squad){
      if(p.potential==null) p.potential=Math.max(p.overall, Math.round(p.overall+(p.age<=21?12:p.age<=25?5:0)));
    }
    c.discipline = c.discipline || {closedDoors:0, history:[]};
    c.kit = c.kit || {pattern:"solid", primary:c.color, secondary:"#eef2f7", image:null};
    if(!c.venues){                       // save antigo tinha só c.stadium
      const s=c.stadium||{name:"Stade de "+c.city, capacity:35000, ticketPrice:60, premiumShare:0.1};
      c.venues=[
        {...s, proximity:65, enclosure:58, works:null, owned:true, rent:0, type:"classico", expansion:s.expansion||null},
        {name:"Vieux Parc de "+c.city, capacity:Math.round(s.capacity*0.42), proximity:90, enclosure:76,
         ticketPrice:60, premiumShare:0.03, expansion:null, works:null, owned:true, rent:0, type:"caldeirao"},
        {name:"Grand Stade de Dournéa", capacity:65000, proximity:30, enclosure:44,
         ticketPrice:60, premiumShare:0.18, expansion:null, works:null, owned:false, rent:380000, type:"pista"},
      ];
      c.venueIdx=0; delete c.stadium;
    }
    c.training = c.training || {fields:Math.max(1,Math.round(c.rep/28)),
      equipment:Math.round(Math.max(20,Math.min(90,c.rep-15))), intensity:"normal", focus:"geral", individual:{}};
    c.proficiency = c.proficiency || {defense:50, attack:50, possession:50, setPieces:50, penalties:50};
    if(c.badge===undefined) c.badge=null;
    if(c.prestige==null) c.prestige=c.rep||55;
    if(!c.founded) c.founded=1900+Math.floor(Math.random()*60);
    if(!c.cityPop) c.cityPop=(C.CITIES[c.city]||{}).pop||120000;
    if(!c.coords){ const ct=C.CITIES[c.city]||{}; c.coords={x:ct.x??Math.random(), y:ct.y??Math.random()}; }
    c.sponsors = c.sponsors || {};
    if(!c.kitDesign)    c.kitDesign    = K.defaultKitDesign(c,false);
    if(!c.kitDesignAlt) c.kitDesignAlt = K.defaultKitDesign(c,true);
    if(!Object.keys(c.sponsors).length) C.autoSponsor(c, 0.8);
    for(const v of c.venues){ if(v.pitch==null) v.pitch=Math.round(70+Math.random()*22); if(!v.pitchCare) v.pitchCare="normal"; }
    for(const p of c.squad){ if(p.condition==null) p.condition=100; if(!p.nat) p.nat="dou"; }
  }
}
/* estrelas de prestígio (0–5, com meia-estrela) */
function starsHTML(prestige){
  const s=C.prestigeStars(prestige), full=Math.floor(s), half=s-full>=0.5;
  const empty=5-full-(half?1:0);
  return `<span class="stars" title="Prestígio ${prestige}/100 · ${C.reachOf(prestige).l}">`
    + "★".repeat(full) + (half?"⯪":"") + "☆".repeat(empty) + "</span>";
}
/* escudo do clube: imagem enviada ou caixinha de cor */
function badgeHTML(c, size=32){
  return c.badge
    ? `<img src="${c.badge}" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:6px">`
    : `<span style="display:inline-block;width:${size}px;height:${size}px;border-radius:${size>16?8:3}px;background:${c.color};border:2px solid rgba(255,255,255,.15)"></span>`;
}

/* ---------- Render principal ---------- */
const me = ()=> C.clubById(world, userId);
function rerender(){
  const c=me(), tot=C.totalRounds(world), done=world.round>=tot;
  if(done && world.phase!=="offseason") world.phase="offseason";
  const hb=$("hBadge"); hb.style.background="transparent"; hb.style.border="none"; hb.innerHTML=badgeHTML(c,34);
  $("hClub").textContent=c.name;
  $("hMeta").innerHTML = (done ? `${world.leagueName} · Pré-temporada ${world.season+1}`
    : `${world.leagueName} · Rodada ${world.round+1} de ${tot} · ${c.tactic}`) + ` · ${starsHTML(c.prestige)}`;
  const bal=$("hMoney"); bal.textContent=brl(c.finance.balance); bal.className="v"+(c.finance.balance<0?" neg":"");
  $("btnAdvance").disabled=false;
  $("btnAdvance").textContent = done ? "Pré-temporada ▶" : "Avançar rodada ▶";
  renderView();
}
document.querySelectorAll(".nav .tab").forEach(t=>{
  t.onclick=()=>{ document.querySelectorAll(".nav .tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active"); view=t.dataset.v; renderView(); };
});
function renderView(){
  const v=$("view");
  if(view==="tabela") v.innerHTML=renderTable();
  else if(view==="calendario") renderCalendar(v);
  else if(view==="elenco") v.innerHTML=renderSquad();
  else if(view==="escalacao") renderLineup(v);
  else if(view==="treino") renderTraining(v);
  else if(view==="mercado") renderMarket(v);
  else if(view==="financas") renderFinance(v);
}

/* ---------- Tabela ---------- */
function renderTable(){
  const rows=C.computeTable(world), n=rows.length;
  let html=`<table><thead><tr><th>#</th><th class="name">Clube</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th>
    <th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>`;
  rows.forEach((r,i)=>{
    const c=C.clubById(world,r.id); let cls=c.id===userId?"me ":"";
    if(i===0)cls+="zone-champ"; else if(i>=n-3)cls+="zone-releg";
    html+=`<tr class="${cls}"><td class="pos">${i+1}</td>
      <td class="name"><span class="dot" style="background:${c.color}"></span>${c.name}</td>
      <td><b>${r.P}</b></td><td>${r.J}</td><td>${r.V}</td><td>${r.E}</td><td>${r.D}</td>
      <td>${r.GP}</td><td>${r.GC}</td><td>${r.SG>0?"+":""}${r.SG}</td></tr>`;
  });
  return html+"</tbody></table>";
}

/* ---------- Calendário ---------- */
function renderCalendar(v){
  const tot=C.totalRounds(world); calRound=Math.max(0,Math.min(tot-1,calRound));
  v.innerHTML=`<div class="round-nav"><button id="rPrev">◀</button>
    <span class="rlabel">Rodada ${calRound+1} / ${tot}</span><button id="rNext">▶</button></div><div id="fxList"></div>`;
  const list=$("fxList");
  for(const f of C.fixturesOfRound(world,calRound)){
    const h=C.clubById(world,f.home), a=C.clubById(world,f.away), mine=f.home===userId||f.away===userId;
    const sc=f.result?`${f.result.home} - ${f.result.away}`:`<span class="pend">${h.short} × ${a.short}</span>`;
    const row=el("div","fx"+(mine?" me":""));
    row.innerHTML=`<div class="h">${h.name}</div><div class="sc${f.result?"":" pend"}">${sc}</div><div class="a">${a.name}</div>`;
    list.appendChild(row);
  }
  $("rPrev").onclick=()=>{calRound--; renderCalendar(v);};
  $("rNext").onclick=()=>{calRound++; renderCalendar(v);};
}

/* ---------- Elenco ---------- */
function renderSquad(){
  const c=me(), squad=c.squad.slice().sort((a,b)=>b.overall-a.overall);
  const cols=["pace","passing","dribbling","finishing","tackling","goalkeeping"];
  let html=`<table class="squad-table"><thead><tr><th>Pos</th><th class="name">Nome</th><th>Idade</th><th>Geral</th><th>Cond</th>`;
  for(const a of cols) html+=`<th title="${ATTR_PT[a]}">${ATTR_PT[a].slice(0,3)}</th>`;
  html+=`<th>Salário/sem</th></tr></thead><tbody>`;
  for(const p of squad){
    const inj = p.injury>0 ? ` <span style="color:var(--red);font-size:11px">🩹 ${p.injury}</span>` : "";
    const cond=Math.round(p.condition??100);
    html+=`<tr><td class="pos">${p.pos}</td><td class="name" title="${C.nationName(p)}">${C.flagOf(p)} ${p.name}${inj}</td><td>${p.age}</td>
      <td><span class="ovr" style="background:${ovrColor(p.overall)}">${p.overall}</span></td>
      <td><span style="color:${condColor(cond)};font-weight:600">${cond}%</span></td>`;
    for(const a of cols) html+=`<td>${Math.round(p.attrs[a])}</td>`;
    html+=`<td>${brl(p.wage)}</td></tr>`;
  }
  const inj=C.injuredList(c);
  html+=`</tbody></table><div class="sub" style="margin-top:10px">
    Folha semanal: <b>${brl(C.playerWageTotal(c))}</b> · ${c.squad.length} jogadores`
    + (inj.length?` · <span style="color:var(--red)">${inj.length} lesionado(s)</span>`:"")+`</div>`;
  return html;
}

/* ---------- Escalação (prancheta com camisas) ---------- */
const SVGNS="http://www.w3.org/2000/svg";
const mkSVG=(tag,attrs)=>{const e=document.createElementNS(SVGNS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e;};
const surname = n => { const p=n.split(" "); return p.length>1?p.slice(1).join(" "):p[0]; };
function shirtPath(cx,cy,k){
  return `M ${cx-k} ${cy-k*0.55} L ${cx-k*1.75} ${cy} L ${cx-k*1.25} ${cy+k*0.6} L ${cx-k} ${cy+k*0.3}`
       + ` L ${cx-k} ${cy+k*1.45} L ${cx+k} ${cy+k*1.45} L ${cx+k} ${cy+k*0.3} L ${cx+k*1.25} ${cy+k*0.6}`
       + ` L ${cx+k*1.75} ${cy} L ${cx+k} ${cy-k*0.55} L ${cx+k*0.45} ${cy-k*0.55}`
       + ` Q ${cx} ${cy-k*0.05} ${cx-k*0.45} ${cy-k*0.55} Z`;
}
function darken(hex,f=0.65){
  const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
}
const fitColor = r => r>=72?"#7CFC00": r>=58?"#ffd24a": "#ff6b6b";
/* Desenha uma camisa (imagem enviada OU padrão desenhado) dentro de `parent` */
function drawJersey(parent, cx, cy, kit, idSuffix, k=3.1){
  if(kit.image){
    parent.appendChild(mkSVG("image",{href:kit.image, x:cx-k*1.45, y:cy-k*1.3,
      width:k*2.9, height:k*2.9, preserveAspectRatio:"xMidYMid meet"}));
    return;
  }
  const path=shirtPath(cx,cy,k), cid="kit"+idSuffix;
  const defs=mkSVG("defs"); const cp=mkSVG("clipPath",{id:cid});
  cp.appendChild(mkSVG("path",{d:path})); defs.appendChild(cp); parent.appendChild(defs);
  const g=mkSVG("g",{"clip-path":`url(#${cid})`});
  const bx=cx-k*1.9, by=cy-k*0.8, bw=k*3.8, bh=k*2.6;
  g.appendChild(mkSVG("rect",{x:bx,y:by,width:bw,height:bh,fill:kit.primary}));
  const sec=kit.secondary;
  if(kit.pattern==="stripes"){ for(let i=0;i<6;i++) if(i%2) g.appendChild(mkSVG("rect",{x:bx+i*(bw/6),y:by,width:bw/6,height:bh,fill:sec})); }
  else if(kit.pattern==="hoops"){ for(let i=0;i<5;i++) if(i%2) g.appendChild(mkSVG("rect",{x:bx,y:by+i*(bh/5),width:bw,height:bh/5,fill:sec})); }
  else if(kit.pattern==="sash"){ g.appendChild(mkSVG("rect",{x:cx-k*0.45,y:by-k,width:k*0.9,height:bh+k*2,fill:sec,transform:`rotate(38 ${cx} ${cy})`})); }
  else if(kit.pattern==="halves"){ g.appendChild(mkSVG("rect",{x:cx,y:by,width:bw/2,height:bh,fill:sec})); }
  parent.appendChild(g);
  parent.appendChild(mkSVG("path",{d:path,fill:"none",stroke:darken(kit.primary),"stroke-width":.4}));
}

let lineupSel=null;    // {kind:'xi',i} | {kind:'bench',id}
function lineupClick(v, target){
  const c=me();
  if(!lineupSel){ lineupSel=target; renderLineup(v); return; }
  const same = lineupSel.kind===target.kind &&
    ((target.kind==="xi"&&lineupSel.i===target.i)||(target.kind==="bench"&&lineupSel.id===target.id));
  if(same){ lineupSel=null; renderLineup(v); return; }
  const a=lineupSel, b=target, sp=c.lineup.spots;
  if(a.kind==="xi" && b.kind==="xi"){ const t=sp[a.i].id; sp[a.i].id=sp[b.i].id; sp[b.i].id=t; }
  else if(a.kind==="xi" && b.kind==="bench"){ sp[a.i].id=b.id; }
  else if(a.kind==="bench" && b.kind==="xi"){ sp[b.i].id=a.id; }
  // banco+banco: ignora
  lineupSel=null; renderLineup(v);
}

function svgPoint(svg, evt){
  const pt=svg.createSVGPoint(); pt.x=evt.clientX; pt.y=evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
let dragState=null;
function renderLineup(v){
  const c=me();
  C.ensureLineup(c);
  world.customFormations = world.customFormations || [];
  const spots=c.lineup.spots;
  const nf=nextUserFixture();
  let head, opp=null, iAmHome=false;
  if(nf){ iAmHome=nf.home===userId; opp=C.clubById(world, iAmHome?nf.away:nf.home);
    head=`Próximo jogo: <b>${iAmHome?"🏠 em casa vs":"✈️ fora contra"} ${opp.name}</b>`; }
  else head="Temporada encerrada";
  // análise posicional contra o próximo adversário
  let notes=[];
  if(opp){
    const xiMe=C.getXI(c), xiOp=C.getXI(opp);
    const r = iAmHome ? C.computeLines(c,xiMe,opp,xiOp) : C.computeLines(opp,xiOp,c,xiMe);
    notes = iAmHome ? r.notes.home : r.notes.away;
  }
  const presets=[...Object.keys(C.FORMATIONS), ...world.customFormations.map(f=>f.name)];
  const formOpts=presets.map(k=>`<option ${k===c.lineup.name?"selected":""}>${k}</option>`).join("")
    + (presets.includes(c.lineup.name)?"":`<option selected>${c.lineup.name}</option>`);
  const tacOpts=["Defensivo","Equilibrado","Ofensivo"].map(t=>`<option ${t===c.tactic?"selected":""}>${t}</option>`).join("");
  v.innerHTML=`
    <div class="lu-controls">
      <label>Formação <select id="formSel">${formOpts}</select></label>
      <label>Tática <select id="tacSel">${tacOpts}</select></label>
      <button id="luSaveForm">💾 Salvar formação</button>
      <button id="luReset">↺ Melhor XI</button>
      <button id="kitBtn">🎽 Uniforme</button>
    </div>
    <div class="sub">${head} · <b>arraste</b> os jogadores pelo campo (a função muda sozinha) · clique para selecionar/trocar</div>
    <div class="lineup-wrap">
      <div class="pitchwrap"><svg id="luPitch" viewBox="0 0 68 105"></svg></div>
      <div>
        <div id="spotPanel"></div>
        <div class="bench" style="margin-top:10px"><h3>Reservas</h3><div id="benchList"></div></div>
        ${notes.length?`<div class="notes"><h3>Leitura tática</h3>${notes.map(n=>`<div>• ${n}</div>`).join("")}</div>`:""}
      </div>
    </div>`;
  const svg=$("luPitch"); svg.innerHTML="";
  for(let i=0;i<8;i++) svg.appendChild(mkSVG("rect",{x:0,y:i*13.1,width:68,height:13.1,fill:i%2?"#3a7d3f":"#347439"}));
  const stroke={fill:"none",stroke:"rgba(255,255,255,.6)","stroke-width":.4};
  svg.appendChild(mkSVG("rect",{x:1,y:1,width:66,height:103,...stroke}));
  svg.appendChild(mkSVG("line",{x1:1,y1:52.5,x2:67,y2:52.5,stroke:"rgba(255,255,255,.6)","stroke-width":.4}));
  svg.appendChild(mkSVG("circle",{cx:34,cy:52.5,r:9,...stroke}));
  svg.appendChild(mkSVG("rect",{x:19,y:88,width:30,height:16,...stroke}));
  svg.appendChild(mkSVG("rect",{x:19,y:1,width:30,height:16,...stroke}));
  const xi=C.getXI(c);
  xi.forEach((e,i)=>{
    const st=spots[i], p=e.player;
    const pg=mkSVG("g",{style:"cursor:grab","touch-action":"none"});
    if(lineupSel && lineupSel.kind==="xi" && lineupSel.i===i)
      pg.appendChild(mkSVG("circle",{cx:st.x,cy:st.y+1,r:6.8,fill:"none",stroke:"#d29922","stroke-width":.8}));
    drawJersey(pg,st.x,st.y,c.kit,i);
    const injured=p&&p.injury>0;
    const nm=mkSVG("text",{x:st.x,y:st.y+7.4,"text-anchor":"middle","font-size":2.9,fill:injured?"#f85149":"#fff","font-weight":"600",
      style:"paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:.7px"});
    nm.textContent=(p?surname(p.name):"—")+(injured?" 🩹":"")+"  ";
    const rts=mkSVG("tspan",{fill:fitColor(e.rating)}); rts.textContent=e.rating; nm.appendChild(rts);
    pg.appendChild(nm);
    const tag=mkSVG("text",{x:st.x,y:st.y-4.4,"text-anchor":"middle","font-size":2.4,
      fill:st.locked?"#d29922":"#cfe",  "font-weight":"700",
      style:"paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:.7px"});
    tag.textContent=st.slot+(st.locked?" 🔒":"");
    pg.appendChild(tag);
    pg.appendChild(mkSVG("rect",{x:st.x-5,y:st.y-6,width:10,height:15,fill:"transparent"}));
    // arrastar
    pg.addEventListener("pointerdown", ev=>{
      ev.preventDefault(); const p0=svgPoint(svg,ev);
      dragState={i, sx:p0.x, sy:p0.y, moved:false};
      pg.setPointerCapture(ev.pointerId); pg.style.cursor="grabbing";
    });
    pg.addEventListener("pointermove", ev=>{
      if(!dragState || dragState.i!==i) return;
      const p1=svgPoint(svg,ev);
      const dx=p1.x-dragState.sx, dy=p1.y-dragState.sy;
      if(Math.abs(dx)>1||Math.abs(dy)>1) dragState.moved=true;
      pg.setAttribute("transform",`translate(${dx},${dy})`);
    });
    pg.addEventListener("pointerup", ev=>{
      if(!dragState || dragState.i!==i) return;
      const p1=svgPoint(svg,ev);
      const dx=p1.x-dragState.sx, dy=p1.y-dragState.sy;
      const moved=dragState.moved; dragState=null; pg.style.cursor="grab";
      if(!moved){ lineupClick(v,{kind:"xi",i}); return; }
      const oldCat=C.catOf(st.slot);
      st.x=Math.max(4, Math.min(64, st.x+dx));
      st.y=Math.max(4, Math.min(101, st.y+dy));
      if(!st.locked){
        st.slot=C.slotFromPos(st.x, st.y);
        if(C.catOf(st.slot)!==oldCat){ st.role=C.defaultRole(C.catOf(st.slot)); st.markId=null; }
      }
      c.lineup.name="Personalizada";
      lineupSel={kind:"xi",i};
      renderLineup(v);
    });
    svg.appendChild(pg);
  });
  // painel do jogador selecionado
  renderSpotPanel(c, v, opp);
  // banco
  const inXI=new Set(spots.map(s=>s.id));
  const bench=c.squad.filter(p=>!inXI.has(p.id)).sort((a,b)=>b.overall-a.overall);
  const selSlot=(lineupSel && lineupSel.kind==="xi") ? spots[lineupSel.i].slot : null;
  $("benchList").innerHTML=(selSlot?`<div class="sub" style="margin-bottom:6px">Notas como <b>${selSlot}</b></div>`:"")
    + bench.map(p=>{
    const inj=p.injury>0?` <span style="color:var(--red)">🩹${p.injury}</span>`:"";
    const sel=(lineupSel&&lineupSel.kind==="bench"&&lineupSel.id===p.id)?" sel":"";
    const r=selSlot?C.effectiveRating(p,selSlot):p.overall;
    return `<div class="b${sel}" data-id="${p.id}"><span><span class="pos">${p.pos}</span>${surname(p.name)}${inj}</span>
      <span class="ovr" style="background:${ovrColor(r)};padding:0 6px">${r}</span></div>`;
  }).join("");
  $("benchList").querySelectorAll(".b").forEach(row=> row.onclick=()=>lineupClick(v,{kind:"bench",id:+row.dataset.id}));
  $("formSel").onchange=e=>{
    const name=e.target.value;
    if(C.FORMATIONS[name]) c.lineup=C.lineupFromTemplate(c,name);
    else { const f=world.customFormations.find(x=>x.name===name); if(f) C.applySavedFormation(c,f); }
    lineupSel=null; renderLineup(v);
  };
  $("tacSel").onchange=e=>{ c.tactic=e.target.value; lineupSel=null; rerender(); };
  $("luReset").onclick=()=>{ c.lineup=C.lineupFromTemplate(c, C.FORMATIONS[c.lineup.name]?c.lineup.name:"4-3-3"); lineupSel=null; renderLineup(v); };
  $("kitBtn").onclick=()=>openKitEditor(v);
  $("luSaveForm").onclick=()=>{
    const name=prompt("Nome da formação:", c.lineup.name==="Personalizada"?"Minha formação":c.lineup.name);
    if(!name) return;
    const spec={name, spots:spots.map(s=>({x:s.x,y:s.y,slot:s.slot,locked:s.locked,role:s.role}))};
    const ix=world.customFormations.findIndex(f=>f.name===name);
    if(ix>=0) world.customFormations[ix]=spec; else world.customFormations.push(spec);
    c.lineup.name=name; toast("Formação salva: "+name); renderLineup(v);
  };
}

/* painel de função + instrução do jogador selecionado */
function renderSpotPanel(c, v, opp){
  const host=$("spotPanel");
  if(!lineupSel || lineupSel.kind!=="xi"){ host.innerHTML=`<div class="card"><div class="sub">Clique num jogador para editar função e instrução.</div></div>`; return; }
  const i=lineupSel.i, st=c.lineup.spots[i], xi=C.getXI(c), e=xi[i];
  const cat=C.catOf(st.slot);
  const roleOpts=C.roleList(cat).map(r=>`<option value="${r.k}" ${r.k===st.role?"selected":""}>${r.l}</option>`).join("");
  const slotOpts=C.SLOT_LIST.map(s=>`<option value="${s}" ${s===st.slot?"selected":""}>${s} — ${C.SLOT_PT[s]}</option>`).join("");
  const rd=C.roleDef(cat, st.role);
  let markHtml="";
  if(rd.mark){
    // marcar goleiro não faz sentido; e os mais avançados primeiro
    const targets=(opp?C.getXI(opp):[]).filter(t=>C.catOf(t.slot)!=="GK").sort((a,b)=>a.y-b.y);
    markHtml=`<div class="row2"><label>Marcar</label><select id="spMark">
      <option value="">— escolher jogador —</option>
      ${targets.map(t=>`<option value="${t.player.id}" ${st.markId===t.player.id?"selected":""}>${t.slot} ${surname(t.player.name)} (${t.rating})</option>`).join("")}
    </select></div>`;
  }
  host.innerHTML=`<div class="card">
    <h3>${surname(e.player.name)} <span style="color:${fitColor(e.rating)}">${e.rating}</span></h3>
    <div class="row2"><label>Função</label><select id="spSlot" ${st.locked?"":"disabled"}>${slotOpts}</select></div>
    <div class="row2"><label><input type="checkbox" id="spLock" ${st.locked?"checked":""}> Fixar função</label>
      <span class="sub">${st.locked?"manual":"automática pela posição"}</span></div>
    <div class="row2"><label>Instrução</label><select id="spRole">${roleOpts}</select></div>
    ${markHtml}
    <div class="sub" style="margin-top:6px">${rd.l}: ataque ×${rd.atk} · defesa ×${rd.def}${rd.stam&&rd.stam!==1?` · desgaste ×${rd.stam}`:""}</div>
  </div>`;
  $("spLock").onchange=ev=>{ st.locked=ev.target.checked;
    if(!st.locked) st.slot=C.slotFromPos(st.x,st.y); renderLineup(v); };
  $("spSlot").onchange=ev=>{ const old=C.catOf(st.slot); st.slot=ev.target.value;
    if(C.catOf(st.slot)!==old){ st.role=C.defaultRole(C.catOf(st.slot)); st.markId=null; } renderLineup(v); };
  $("spRole").onchange=ev=>{ st.role=ev.target.value; if(!C.roleDef(cat,st.role).mark) st.markId=null; renderLineup(v); };
  if($("spMark")) $("spMark").onchange=ev=>{ st.markId=ev.target.value?+ev.target.value:null; renderLineup(v); };
}

/* ---------- Editor de uniforme (canvas) ---------- */
let kitWhich="kitDesign", kitSlotSel=null;
function openKitEditor(v){
  const c=me(), host=$("modalHost");
  host.innerHTML="";                    // evita modal antigo deixando ids duplicados
  if(!c.kitDesign) c.kitDesign=K.defaultKitDesign(c,false);
  if(!c.kitDesignAlt) c.kitDesignAlt=K.defaultKitDesign(c,true);
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box kitbox"><button class="close" id="kClose">✕ Fechar</button>
    <h2>Uniforme — ${c.name}</h2>
    <div class="kit-tabs">
      <div class="tab ${kitWhich==="kitDesign"?"active":""}" data-k="kitDesign">1º uniforme</div>
      <div class="tab ${kitWhich==="kitDesignAlt"?"active":""}" data-k="kitDesignAlt">2º uniforme</div>
      <button id="kitBig" style="margin-left:auto;padding:6px 12px">🔍 Ampliar</button>
    </div>
    <div class="kit-wrap">
      <div class="kit-canvas">
        <canvas id="kitCv" width="680" height="800"></canvas>
        <div class="sub" id="kitNote"></div>
        <div class="sub" id="kitSel">Arraste o escudo, os logos e o número direto no uniforme.</div>
      </div>
      <div class="kit-ctl" id="kitCtl"></div>
    </div></div>`;
  modal.onclick=e=>{ if(e.target===modal) close(); };
  host.appendChild(modal);
  const close=()=>{ host.innerHTML=""; kitSlotSel=null; renderLineup(v); rerender(); };
  $("kClose").onclick=close;
  $("kitBig").onclick=()=>openKitZoom(c);
  modal.querySelectorAll("[data-k]").forEach(t=> t.onclick=()=>{ kitWhich=t.dataset.k; host.innerHTML=""; openKitEditor(v); });
  buildKitControls(c, v);
  paintKit(c);
  enableKitDrag(c, v);
}

/* arrastar escudo / logos / número direto no canvas */
function enableKitDrag(c, v){
  const cv=$("kitCv"); if(!cv) return;
  const d=curDesign(c);
  let drag=null;
  const norm=ev=>{ const r=cv.getBoundingClientRect();
    return {x:(ev.clientX-r.left)/r.width, y:(ev.clientY-r.top)/r.height}; };
  const hit=p=>{
    const boxes=K.decalBoxes(c,d);
    for(let i=boxes.length-1;i>=0;i--){ const b=boxes[i];
      const hw=Math.max(b.w,0.05)/2, hh=Math.max(b.h,0.04)/2*(680/800);
      if(Math.abs(p.x-b.x)<hw && Math.abs(p.y-b.y)<hh+0.02) return b;
    }
    return null;
  };
  cv.style.cursor="grab";
  cv.addEventListener("pointerdown",ev=>{
    const p=norm(ev), b=hit(p);
    if(!b) return;
    ev.preventDefault(); cv.setPointerCapture(ev.pointerId); cv.style.cursor="grabbing";
    drag={key:b.key, dx:b.x-p.x, dy:b.y-p.y};
    kitSlotSel=b.key; buildKitControls(c,v); paintKit(c);
  });
  cv.addEventListener("pointermove",ev=>{
    if(!drag) return;
    const p=norm(ev);
    const x=Math.max(0.02,Math.min(0.98,p.x+drag.dx));
    const y=Math.max(0.02,Math.min(0.98,p.y+drag.dy));
    if(drag.key==="__number"){ d.number.x=+x.toFixed(4); d.number.y=+y.toFixed(4); }
    else if(drag.key==="__badge"){
      // escudo: move criando uma posição livre
      K.BADGE_POS[d.badge]={...K.BADGE_POS[d.badge], x:+x.toFixed(4), y:+y.toFixed(4)};
    } else {
      d.slots=d.slots||{};
      const cur=d.slots[drag.key]||{};
      d.slots[drag.key]={...cur, x:+x.toFixed(4), y:+y.toFixed(4)};
    }
    paintKit(c);
  });
  const end=ev=>{ if(!drag) return; drag=null; cv.style.cursor="grab"; buildKitControls(c,v); };
  cv.addEventListener("pointerup",end);
  cv.addEventListener("pointercancel",end);
}

/* visualização ampliada */
function openKitZoom(c){
  const host=$("modalHost");
  const z=el("div","modal");
  z.style.zIndex=20;
  z.innerHTML=`<div class="box" style="width:min(760px,96vw)">
    <button class="close" id="kzClose">✕ Fechar</button>
    <h2>Uniforme ampliado</h2>
    <div style="display:flex;justify-content:center;margin-top:10px">
      <canvas id="kitZoom" width="1020" height="1200" class="kit-zoom"></canvas></div></div>`;
  host.appendChild(z);
  $("kzClose").onclick=()=>z.remove();
  z.onclick=e=>{ if(e.target===z) z.remove(); };
  K.renderKit($("kitZoom"), c, curDesign(c), {number:10});
}
function curDesign(c){ return c[kitWhich] || (c[kitWhich]=K.defaultKitDesign(c, kitWhich==="kitDesignAlt")); }

async function paintKit(c){
  const cv=$("kitCv"); if(!cv) return;
  const ok=await K.renderKit(cv, c, curDesign(c), {highlight:kitSlotSel, number:10});
  const s=$("kitSel");
  if(s){
    const b=K.decalBoxes(c,curDesign(c)).find(x=>x.key===kitSlotSel);
    s.innerHTML = b ? `Selecionado: <b>${b.label}</b> — arraste no uniforme ou ajuste o tamanho ao lado.`
                    : "Arraste o escudo, os logos e o número direto no uniforme.";
  }
  const n=$("kitNote");
  if(n) n.innerHTML = ok
    ? `Modelo: <b>${K.KIT_TEMPLATES[curDesign(c).template].l}</b>`
    : `⚠️ Coloque os PNGs em <code>onze/assets/kits/</code> como
       <code>base-lisa.png</code> e <code>base-gola.png</code> para usar seus modelos
       (desenho simplificado por enquanto).`;
}

function buildKitControls(c, v){
  const d=curDesign(c), box=$("kitCtl");
  const tplOpts=Object.entries(K.KIT_TEMPLATES)
    .map(([k,t])=>`<option value="${k}" ${d.template===k?"selected":""}>${t.l}</option>`).join("");
  const patOpts=Object.entries(K.PATTERNS)
    .map(([k,l])=>`<option value="${k}" ${d.pattern===k?"selected":""}>${l}</option>`).join("");
  const badgeOpts=Object.entries(K.BADGE_POS)
    .map(([k,b])=>`<option value="${k}" ${d.badge===k?"selected":""}>${b.l}</option>`).join("");
  const signed=Object.keys(c.sponsors||{}).filter(k=>BR.SPONSOR_SLOTS[k].area);
  const tintRows=signed.map(k=>{
    const b=BR.brandById(c.sponsors[k].brandId);
    const cur=(d.logoTint&&d.logoTint[k])||"";
    return `<div class="row2"><label>${BR.SPONSOR_SLOTS[k].l}</label>
      <span style="display:flex;gap:6px;align-items:center">
        <input type="color" data-tint="${k}" value="${cur||b.color}">
        <button data-untint="${k}" title="Cor original da marca">↺</button></span></div>`;
  }).join("") || `<div class="sub">Nenhum patrocínio no uniforme ainda — assine em <b>Finanças → Patrocínios</b>.</div>`;

  // painel do elemento selecionado (tamanho / número)
  let selPane="";
  if(kitSlotSel){
    const b=K.decalBoxes(c,d).find(x=>x.key===kitSlotSel);
    if(b){
      const cur = kitSlotSel==="__number" ? d.number.size
                : kitSlotSel==="__badge"  ? (d.badgeSize??K.BADGE_POS[d.badge].size)
                : K.slotBox(d,kitSlotSel,BR.SPONSOR_SLOTS[kitSlotSel]).size;
      selPane=`<div class="kit-selbox">
        <h3>${b.label}</h3>
        <div class="row2"><label>Tamanho</label>
          <input type="range" id="kSize" min="20" max="400" value="${Math.round(cur*1000)}"></div>
        ${kitSlotSel==="__number"?`
          <div class="row2"><label>Cor do número</label><input type="color" id="kNumColor" value="${d.number.color}"></div>`:""}
        <button id="kReset" style="margin-top:4px">↺ Posição padrão</button>
      </div>`;
    }
  }
  box.innerHTML=`
    ${selPane}
    <div class="row2"><label>Modelo</label><select id="kTpl">${tplOpts}</select></div>
    <div class="row2"><label>Padrão</label><select id="kPat">${patOpts}</select></div>
    <div class="row2"><label>Camisa</label><input type="color" id="kShirt" value="${d.shirt}"></div>
    <div class="row2"><label>Detalhe/2ª cor</label><input type="color" id="kDet" value="${d.detail}"></div>
    <div class="row2"><label>Calção</label><input type="color" id="kShorts" value="${d.shorts}"></div>
    <div class="row2"><label>Meião</label><input type="color" id="kSocks" value="${d.socks}"></div>
    <hr style="border:none;border-top:1px solid var(--line);margin:10px 0">
    <div class="row2"><label>Escudo</label><select id="kBadgePos">${badgeOpts}</select></div>
    <div class="row2"><label><input type="checkbox" id="kNumShow" ${d.number?.show?"checked":""}> Número no calção</label></div>
    <div class="shirt-upload"><label>Imagem do escudo (PNG)</label>
      <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
        <span>${badgeHTML(c,34)}</span><input type="file" id="kBadge" accept="image/*" style="flex:1">
        ${c.badge?'<button id="kBadgeClear">✕</button>':''}</div></div>
    <hr style="border:none;border-top:1px solid var(--line);margin:10px 0">
    <h3 style="font-size:11px;color:var(--muted);text-transform:uppercase;margin:0 0 6px">Cor dos logos</h3>
    ${tintRows}`;

  const upd=()=>paintKit(c);
  if($("kSize")) $("kSize").oninput=e=>{
    const val=+e.target.value/1000;
    if(kitSlotSel==="__number") d.number.size=val;
    else if(kitSlotSel==="__badge") d.badgeSize=val;
    else { d.slots=d.slots||{}; d.slots[kitSlotSel]={...(d.slots[kitSlotSel]||{}), size:val}; }
    upd();
  };
  if($("kNumColor")) $("kNumColor").oninput=e=>{ d.number.color=e.target.value; upd(); };
  if($("kReset")) $("kReset").onclick=()=>{
    if(kitSlotSel==="__number") d.number={...K.defaultKitDesign(c).number};
    else if(kitSlotSel==="__badge") d.badgeSize=null;
    else if(d.slots) delete d.slots[kitSlotSel];
    buildKitControls(c,v); upd();
  };
  if($("kNumShow")) $("kNumShow").onchange=e=>{
    d.number=d.number||K.defaultKitDesign(c).number; d.number.show=e.target.checked; buildKitControls(c,v); upd(); };
  $("kTpl").onchange=e=>{ d.template=e.target.value; upd(); };
  $("kPat").onchange=e=>{ d.pattern=e.target.value; upd(); };
  $("kShirt").oninput=e=>{ d.shirt=e.target.value; upd(); };
  $("kDet").oninput=e=>{ d.detail=e.target.value; upd(); };
  $("kShorts").oninput=e=>{ d.shorts=e.target.value; upd(); };
  $("kSocks").oninput=e=>{ d.socks=e.target.value; upd(); };
  $("kBadgePos").onchange=e=>{ d.badge=e.target.value; upd(); };
  $("kBadge").onchange=e=>{ const f=e.target.files[0]; if(!f)return; const rd=new FileReader();
    rd.onload=()=>{ c.badge=rd.result; buildKitControls(c,v); paintKit(c); }; rd.readAsDataURL(f); };
  if($("kBadgeClear")) $("kBadgeClear").onclick=()=>{ c.badge=null; buildKitControls(c,v); paintKit(c); };
  box.querySelectorAll("[data-tint]").forEach(i=> i.oninput=e=>{
    d.logoTint=d.logoTint||{}; d.logoTint[e.target.dataset.tint]=e.target.value;
    kitSlotSel=e.target.dataset.tint; paintKit(c); });
  box.querySelectorAll("[data-untint]").forEach(b=> b.onclick=()=>{
    if(d.logoTint) delete d.logoTint[b.dataset.untint];
    buildKitControls(c,v); paintKit(c); });
}

/* ---------- Editor do banco de marcas ---------- */
let beFilter="", beKind="", beEditing=null, bePage=0;
const BE_PAGE=60;
function openBrandEditor(){
  const host=$("modalHost");
  host.innerHTML="";
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box brandbox">
    <button class="close" id="beClose">✕ Fechar</button>
    <h2>Banco de marcas</h2>
    <div class="sub" id="beInfo"></div>
    <div class="be-bar">
      <input id="beSearch" placeholder="Buscar marca..." value="${beFilter}">
      <select id="beKind">
        <option value="">Todos</option>
        <option value="sponsor" ${beKind==="sponsor"?"selected":""}>Patrocinadores</option>
        <option value="supplier" ${beKind==="supplier"?"selected":""}>Fornecedores</option>
      </select>
      <button class="primary" id="beNew">+ Nova marca</button>
      <button id="beImport">⤒ Importar CSV/JSON</button>
      <button id="beCsv">⤓ CSV</button>
      <button id="beJson">⤓ JSON</button>
      <button id="beReset" title="Volta aos placeholders">↺</button>
      <input type="file" id="beFile" accept=".csv,.json,text/csv,application/json" hidden>
    </div>
    <div class="be-body"><div class="be-list" id="beList"></div><div class="be-form" id="beForm"></div></div>
  </div>`;
  host.appendChild(modal);
  $("beClose").onclick=()=>{ host.innerHTML=""; beEditing=null; };
  $("beSearch").oninput=e=>{ beFilter=e.target.value; bePage=0; drawBrandList(); };
  $("beKind").onchange=e=>{ beKind=e.target.value; bePage=0; drawBrandList(); };
  $("beNew").onclick=()=>{ beEditing={__new:true, id:"", name:"", short:"", kind:"sponsor",
    prestige:50, reach:"nacional", country:"dou", size:50, color:"#334155", logo:null, sector:""};
    drawBrandForm(); };
  $("beImport").onclick=()=>$("beFile").click();
  $("beFile").onchange=async e=>{
    const f=e.target.files[0]; if(!f) return;
    const txt=await f.text();
    let list=[];
    try{
      if(/\.json$/i.test(f.name) || txt.trim().startsWith("[") || txt.trim().startsWith("{")){
        const j=JSON.parse(txt); list=Array.isArray(j)?j:(j.brands||[]);
      } else list=BR.parseBrandsCSV(txt);
    }catch(err){ toast("Arquivo inválido: "+err.message); return; }
    if(!list.length){ toast("Nenhuma marca encontrada no arquivo"); return; }
    const n=BR.setBrands(list); await saveBrands(); brandSrc="importado ("+f.name+")";
    toast(`${n} marcas importadas`); bePage=0; drawBrandList(); drawBrandInfo();
  };
  $("beCsv").onclick=()=>downloadText(BR.brandsToCSV(),"marcas.csv","text/csv");
  $("beJson").onclick=()=>downloadText(BR.brandsToJSON(),"brands.json","application/json");
  $("beReset").onclick=async()=>{ BR.setBrands(BR.BUILTIN_BRANDS); await saveBrands();
    brandSrc="embutido (placeholders)"; toast("Banco restaurado"); drawBrandList(); drawBrandInfo(); };
  drawBrandInfo(); drawBrandList(); drawBrandForm();
}
function downloadText(text,name,mime){
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([text],{type:mime}));
  a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function drawBrandInfo(){
  const el2=$("beInfo"); if(!el2) return;
  const sup=BR.BRANDS.filter(b=>b.kind==="supplier").length;
  el2.innerHTML=`<b>${BR.BRANDS.length}</b> marcas (${sup} fornecedores) · origem: <b>${brandSrc}</b>.
    Para centenas de marcas, prefira <code>logo</code> como <b>caminho de arquivo</b>
    (ex.: <code>assets/brands/logos/nike.png</code>) em vez de imagem enviada — o save fica pequeno.`;
}
function brandMatches(b){
  const q=beFilter.trim().toLowerCase();
  if(beKind && b.kind!==beKind) return false;
  if(!q) return true;
  return (b.name+" "+b.short+" "+(b.sector||"")+" "+b.country).toLowerCase().includes(q);
}
function drawBrandList(){
  const box=$("beList"); if(!box) return;
  const all=BR.BRANDS.filter(brandMatches);
  const start=bePage*BE_PAGE, page=all.slice(start,start+BE_PAGE);
  box.innerHTML = page.map(b=>`
    <div class="be-row ${beEditing&&beEditing.id===b.id?"sel":""}" data-id="${b.id}">
      <img src="${BR.brandLogo(b)}" alt="">
      <span class="nm">${b.name}</span>
      <span class="mt">${b.kind==="supplier"?"material":BR.REACH_PT[b.reach]}</span>
      <span class="mt">P${b.prestige}·T${b.size}</span>
      <button data-del="${b.id}" title="Excluir">✕</button>
    </div>`).join("") || `<div class="sub" style="padding:10px">Nenhuma marca encontrada.</div>`;
  if(all.length>BE_PAGE){
    box.insertAdjacentHTML("beforeend",
      `<div class="be-pg"><button id="bePrev" ${bePage?"":"disabled"}>◀</button>
       <span>${start+1}–${Math.min(start+BE_PAGE,all.length)} de ${all.length}</span>
       <button id="beNext" ${start+BE_PAGE<all.length?"":"disabled"}>▶</button></div>`);
    $("bePrev").onclick=()=>{ bePage--; drawBrandList(); };
    $("beNext").onclick=()=>{ bePage++; drawBrandList(); };
  }
  box.querySelectorAll(".be-row").forEach(r=> r.onclick=e=>{
    if(e.target.dataset.del) return;
    beEditing={...BR.brandById(r.dataset.id)}; drawBrandForm(); drawBrandList();
  });
  box.querySelectorAll("[data-del]").forEach(b=> b.onclick=async ev=>{
    ev.stopPropagation();
    const id=b.dataset.del;
    BR.setBrands(BR.BRANDS.filter(x=>x.id!==id));
    await saveBrands(); toast("Marca excluída");
    if(beEditing&&beEditing.id===id) beEditing=null;
    drawBrandList(); drawBrandForm(); drawBrandInfo();
  });
}
function drawBrandForm(){
  const box=$("beForm"); if(!box) return;
  const b=beEditing;
  if(!b){ box.innerHTML=`<div class="sub">Clique numa marca para editar, ou <b>+ Nova marca</b>.</div>`; return; }
  const reachOpts=BR.REACH_ORDER.map(r=>`<option value="${r}" ${b.reach===r?"selected":""}>${BR.REACH_PT[r]}</option>`).join("");
  box.innerHTML=`
    <div class="be-prev"><img src="${BR.brandLogo(b)}" alt=""></div>
    <div class="row2"><label>Nome</label><input id="bfName" value="${(b.name||"").replace(/"/g,"&quot;")}"></div>
    <div class="row2"><label>Sigla</label><input id="bfShort" value="${(b.short||"").replace(/"/g,"&quot;")}"></div>
    <div class="row2"><label>Tipo</label><select id="bfKind">
      <option value="sponsor" ${b.kind==="sponsor"?"selected":""}>Patrocinador</option>
      <option value="supplier" ${b.kind==="supplier"?"selected":""}>Fornecedor de material</option></select></div>
    <div class="row2"><label>Alcance</label><select id="bfReach">${reachOpts}</select></div>
    <div class="row2"><label>País</label><input id="bfCountry" value="${b.country||"dou"}" style="max-width:90px"></div>
    <div class="row2"><label>Setor</label><input id="bfSector" value="${(b.sector||"").replace(/"/g,"&quot;")}"></div>
    <div class="row2"><label>Prestígio ${b.prestige}</label><input type="range" id="bfPrest" min="1" max="100" value="${b.prestige}"></div>
    <div class="row2"><label>Porte ${b.size}</label><input type="range" id="bfSize" min="1" max="100" value="${b.size}"></div>
    <div class="row2"><label>Cor</label><input type="color" id="bfColor" value="${/^#[0-9a-f]{6}$/i.test(b.color||"")?b.color:"#334155"}"></div>
    <div class="row2"><label>Logo (caminho)</label><input id="bfLogoPath" placeholder="assets/brands/logos/x.png"
      value="${b.logo && !String(b.logo).startsWith("data:") ? b.logo : ""}"></div>
    <div class="shirt-upload"><label>ou enviar imagem (PNG com transparência)</label>
      <input type="file" id="bfLogoFile" accept="image/*">
      ${b.logo?'<button id="bfLogoClear" style="margin-top:6px">Remover logo</button>':''}</div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="primary" id="bfSave">${b.__new?"Criar":"Salvar"}</button>
      <button id="bfCancel">Cancelar</button></div>`;
  const g=id=>$(id).value;
  $("bfPrest").oninput=e=>{ b.prestige=+e.target.value; e.target.previousElementSibling.textContent="Prestígio "+b.prestige; };
  $("bfSize").oninput=e=>{ b.size=+e.target.value; e.target.previousElementSibling.textContent="Porte "+b.size; };
  $("bfLogoFile").onchange=e=>{ const f=e.target.files[0]; if(!f)return;
    const rd=new FileReader(); rd.onload=()=>{ b.logo=rd.result; drawBrandForm(); }; rd.readAsDataURL(f); };
  if($("bfLogoClear")) $("bfLogoClear").onclick=()=>{ b.logo=null; drawBrandForm(); };
  $("bfCancel").onclick=()=>{ beEditing=null; drawBrandForm(); drawBrandList(); };
  $("bfSave").onclick=async()=>{
    const path=g("bfLogoPath").trim();
    const upd={ id:b.id, name:g("bfName").trim(), short:g("bfShort").trim(), kind:g("bfKind"),
      reach:g("bfReach"), country:g("bfCountry").trim()||"dou", sector:g("bfSector").trim(),
      prestige:+$("bfPrest").value, size:+$("bfSize").value, color:g("bfColor"),
      logo: path || (b.logo && String(b.logo).startsWith("data:") ? b.logo : null) };
    if(!upd.name){ toast("Dê um nome à marca"); return; }
    const list=BR.BRANDS.map(x=>x.id===b.id && !b.__new ? upd : x);
    if(b.__new) list.push(upd);
    BR.setBrands(list); await saveBrands();
    toast(b.__new?"Marca criada":"Marca salva");
    beEditing=null; drawBrandList(); drawBrandForm(); drawBrandInfo();
  };
}

/* ---------- Treino ---------- */
const PROF_PT = {defense:"Defesa", attack:"Ataque", possession:"Posse e passe",
  setPieces:"Bolas paradas", penalties:"Pênaltis"};
function condColor(v){ return v>=88?"var(--accent)" : v>=72?"var(--gold)" : "var(--red)"; }
function renderTraining(v){
  const c=me(), T=c.training, q=C.trainingQuality(c);
  const I=C.INTENSITY[T.intensity]||C.INTENSITY.normal;
  const avgCond=Math.round(c.squad.reduce((s,p)=>s+(p.condition??100),0)/c.squad.length);
  const focusOpts=C.TRAIN_FOCUS.map(f=>`<option value="${f.k}" ${f.k===T.focus?"selected":""}>${f.l}</option>`).join("");
  const intOpts=Object.entries(C.INTENSITY).map(([k,x])=>`<option value="${k}" ${k===T.intensity?"selected":""}>${x.l}</option>`).join("");
  const curFocus=C.TRAIN_FOCUS.find(f=>f.k===T.focus)||C.TRAIN_FOCUS[0];
  const profRows=Object.keys(c.proficiency).map(k=>{
    const val=Math.round(c.proficiency[k]);
    const isFocus=curFocus.prof===k;
    return `<div class="qrow"><span>${isFocus?"<b>▸ ":""}${PROF_PT[k]}${isFocus?"</b>":""}</span><span>${val}</span></div>
      ${bar(val, isFocus?"var(--accent)":"var(--muted)")}`;
  }).join("");
  const attrOpts=p=>C.ATTRS.map(a=>`<option value="${a}" ${T.individual[p.id]===a?"selected":""}>${ATTR_PT[a]}</option>`).join("");
  const squad=c.squad.slice().sort((a,b)=>b.overall-a.overall);
  const indRows=squad.map(p=>{
    const cond=Math.round(p.condition??100);
    const inj=p.injury>0?` <span style="color:var(--red)">🩹${p.injury}</span>`:"";
    return `<tr><td class="pos">${p.pos}</td><td class="name">${surname(p.name)}${inj}</td>
      <td>${p.age}</td>
      <td><span style="color:${condColor(cond)};font-weight:700">${cond}%</span></td>
      <td><select class="indSel" data-p="${p.id}" style="width:100%;font-size:11px;padding:3px 6px">
        <option value="">— nenhum —</option>${attrOpts(p)}</select></td></tr>`;
  }).join("");
  v.innerHTML=`<div class="fin-grid">
    <div class="card"><h3>Plano da semana</h3>
      <div class="row2"><label>Intensidade</label><select id="trInt">${intOpts}</select></div>
      <div class="row2"><label>Foco do time</label><select id="trFocus">${focusOpts}</select></div>
      <div class="sub" style="margin:4px 0 10px">${curFocus.desc} · intensidade <b>${I.l}</b>:
        ganho ×${I.gain}, desgaste ×${I.load}.</div>
      <div class="line"><span>Condição média do elenco</span><span style="color:${condColor(avgCond)};font-weight:700">${avgCond}%</span></div>
      <div class="sub">Treino pesado evolui mais rápido, mas o time chega <b>cansado</b> ao jogo e se <b>lesiona mais</b>.</div>
      <h3 style="margin-top:14px">Proficiências</h3>${profRows}
    </div>
    <div class="card"><h3>Centro de treinamento</h3>
      <div class="line"><span>Qualidade das instalações</span><span><b>${q}/100</b></span></div>
      ${bar(q,"var(--accent)")}
      <div class="line"><span>Campos de treino</span><span>${T.fields} / ${C.MAX_FIELDS}</span></div>
      <div class="line"><span>Equipamento</span><span>${T.equipment}/100</span></div>
      <div class="line"><span>Custo por rodada</span><span class="neg">- ${brl(C.trainingUpkeep(c))}</span></div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button id="trField" ${T.fields>=C.MAX_FIELDS?"disabled":""}>+1 campo · ${brl(C.FIELD_COST)}</button>
        <button id="trEquip" ${T.equipment>=100?"disabled":""}>Equipamento +${C.EQUIP_STEP} · ${brl(C.EQUIP_COST)}</button>
      </div>
      <div class="sub" style="margin-top:8px">Instalações melhores = evolui mais, cansa menos e recupera mais rápido —
        mas o custo fixo por rodada sobe.</div>
    </div></div>
    <div class="card" style="margin-top:14px"><h3>Treino individual</h3>
      <div class="sub" style="margin:-4px 0 8px">Escolha um atributo para o jogador treinar. Jovens (≤23) evoluem bem mais rápido.</div>
      <div style="max-height:280px;overflow-y:auto">
      <table class="squad-table"><thead><tr><th>Pos</th><th class="name">Nome</th><th>Idade</th><th>Condição</th><th>Treinando</th></tr></thead>
      <tbody>${indRows}</tbody></table></div>
    </div>`;
  $("trInt").onchange=e=>{ T.intensity=e.target.value; renderTraining(v); };
  $("trFocus").onchange=e=>{ T.focus=e.target.value; renderTraining(v); };
  $("trField").onclick=()=>{
    if(c.finance.balance<C.FIELD_COST){ toast("Caixa insuficiente."); return; }
    c.finance.balance-=C.FIELD_COST; T.fields++; toast("Novo campo de treino construído"); renderTraining(v); rerender();
  };
  $("trEquip").onclick=()=>{
    if(c.finance.balance<C.EQUIP_COST){ toast("Caixa insuficiente."); return; }
    c.finance.balance-=C.EQUIP_COST; T.equipment=Math.min(100,T.equipment+C.EQUIP_STEP);
    toast("Equipamento melhorado"); renderTraining(v); rerender();
  };
  v.querySelectorAll(".indSel").forEach(s=> s.onchange=e=>{
    const id=+e.target.dataset.p;
    if(e.target.value) T.individual[id]=e.target.value; else delete T.individual[id];
  });
}

/* ---------- Mercado ---------- */
let mktTab="comprar";
function renderMarket(v){
  const c=me();
  v.innerHTML=`<div class="nav" style="margin:-16px -16px 14px">
      ${[["comprar","Contratar"],["vender","Vender"],["base","Base / Olheiro"]]
        .map(([k,l])=>`<div class="tab ${mktTab===k?"active":""}" data-m="${k}">${l}</div>`).join("")}
    </div><div id="mktBody"></div>`;
  v.querySelectorAll("[data-m]").forEach(t=> t.onclick=()=>{ mktTab=t.dataset.m; renderMarket(v); });
  const b=$("mktBody");
  if(mktTab==="comprar") renderBuy(b,c);
  else if(mktTab==="vender") renderSell(b,c);
  else renderYouth(b,c);
}
function renderBuy(b,c){
  const rows=world.transferList.map(e=>{
    const club=C.clubById(world,e.clubId); if(!club) return "";
    const p=club.squad.find(x=>x.id===e.playerId); if(!p) return "";
    const price=p.askingPrice||C.playerValue(p);
    const afford=c.finance.balance>=price;
    return `<tr><td class="pos">${p.pos}</td><td class="name">${C.flagOf(p)} ${surname(p.name)}</td>
      <td>${p.age}</td><td><span class="ovr" style="background:${ovrColor(p.overall)}">${p.overall}</span></td>
      <td class="muted">${p.potential}</td><td class="name muted" style="font-size:11px">${club.short}</td>
      <td>${brl(p.wage)}</td><td><b>${brl(price)}</b></td>
      <td><button data-buy="${p.id}" ${afford?"":"disabled"}>Contratar</button></td></tr>`;
  }).join("");
  b.innerHTML=`<div class="sub" style="margin-bottom:8px">Caixa: <b>${brl(c.finance.balance)}</b> ·
    elenco ${c.squad.length}/${C.SQUAD_MAX} · a lista muda a cada rodada.</div>
    <div style="max-height:400px;overflow-y:auto"><table class="squad-table">
    <thead><tr><th>Pos</th><th class="name">Nome</th><th>Idade</th><th>Geral</th><th>Pot</th><th class="name">Clube</th><th>Salário</th><th>Preço</th><th></th></tr></thead>
    <tbody>${rows||`<tr><td colspan="9" class="sub">Ninguém à venda no momento.</td></tr>`}</tbody></table></div>`;
  b.querySelectorAll("[data-buy]").forEach(btn=> btn.onclick=()=>{
    const entry=world.transferList.find(e=>e.playerId===+btn.dataset.buy);
    const r=C.signPlayer(world, c, entry);
    if(!r.ok){ toast(r.msg); return; }
    toast(`${surname(r.player.name)} contratado por ${brl(r.price)}`);
    renderMarket($("view")); rerender();
  });
}
function renderSell(b,c){
  const squad=c.squad.slice().sort((a,b2)=>b2.overall-a.overall);
  const rows=squad.map(p=>{
    const val=C.playerValue(p), off=C.sellPrice(p);
    return `<tr><td class="pos">${p.pos}</td><td class="name">${C.flagOf(p)} ${surname(p.name)}</td>
      <td>${p.age}</td><td><span class="ovr" style="background:${ovrColor(p.overall)}">${p.overall}</span></td>
      <td class="muted">${p.potential}</td><td>${brl(p.wage)}</td><td>${brl(val)}</td>
      <td><b class="pos">${brl(off)}</b></td>
      <td><button data-sell="${p.id}">Vender</button></td></tr>`;
  }).join("");
  b.innerHTML=`<div class="sub" style="margin-bottom:8px">Elenco ${c.squad.length} (mínimo ${C.SQUAD_MIN}).
    A oferta é 85% do valor de mercado — vender é rápido, mas você perde na negociação.</div>
    <div style="max-height:400px;overflow-y:auto"><table class="squad-table">
    <thead><tr><th>Pos</th><th class="name">Nome</th><th>Idade</th><th>Geral</th><th>Pot</th><th>Salário</th><th>Valor</th><th>Oferta</th><th></th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
  b.querySelectorAll("[data-sell]").forEach(btn=> btn.onclick=()=>{
    const r=C.sellPlayer(world, c, +btn.dataset.sell);
    if(!r.ok){ toast(r.msg); return; }
    toast(`${surname(r.player.name)} vendido ao ${r.buyer.short} por ${brl(r.price)}`);
    renderMarket($("view")); rerender();
  });
}
function renderYouth(b,c){
  const sc=c.staff.scout;
  if(!sc){
    b.innerHTML=`<div class="card"><h3>Sem olheiro</h3>
      <div class="sub">Você não tem um <b>Olheiro</b> contratado, então ninguém está garimpando a base.
      Contrate um em <b>Finanças → Comissão Técnica</b>. Quanto melhor o olheiro, melhores as promessas
      que ele acha — e mais preciso é o relatório dele.</div></div>`;
    return;
  }
  const rows=(c.prospects||[]).map(p=>{
    const afford=c.finance.balance>=p.fee;
    return `<tr><td class="pos">${p.pos}</td><td class="name">${C.flagOf(p)} ${surname(p.name)}</td><td>${p.age}</td>
      <td><span class="ovr" style="background:${ovrColor(p.estOverall)}">~${p.estOverall}</span></td>
      <td><b style="color:var(--gold)">~${p.estPotential}</b></td>
      <td>${brl(p.wage)}</td><td><b>${brl(p.fee)}</b></td>
      <td><button data-sign="${p.id}" ${afford?"":"disabled"}>Contratar</button></td></tr>`;
  }).join("");
  b.innerHTML=`<div class="card" style="margin-bottom:12px"><h3>Relatório do olheiro</h3>
      <div class="line"><span>${sc.name}</span><span>${qualWord(sc.quality)} (${sc.quality})</span></div>
      <div class="sub" style="margin-top:6px">Margem de erro do relatório: <b>±${Math.round((100-sc.quality)/6)}</b> pontos.
      Um olheiro fraco pode vender gato por lebre — os números abaixo são <b>estimativas</b>, não a verdade.</div></div>
    <div style="max-height:340px;overflow-y:auto"><table class="squad-table">
    <thead><tr><th>Pos</th><th class="name">Nome</th><th>Idade</th><th>Geral~</th><th>Potencial~</th><th>Salário</th><th>Taxa</th><th></th></tr></thead>
    <tbody>${rows||`<tr><td colspan="8" class="sub">Nenhuma promessa no momento — o olheiro traz novidades a cada rodada.</td></tr>`}</tbody></table></div>`;
  b.querySelectorAll("[data-sign]").forEach(btn=> btn.onclick=()=>{
    const pr=c.prospects.find(x=>x.id===+btn.dataset.sign);
    const r=C.signProspect(world, c, pr);
    if(!r.ok){ toast(r.msg); return; }
    toast(`${surname(r.player.name)} promovido ao elenco`);
    renderMarket($("view")); rerender();
  });
}

/* ---------- FINANÇAS (sub-abas) ---------- */
function renderFinance(v){
  v.innerHTML = `<div class="nav" style="margin:-16px -16px 14px">
      ${["overview:Visão Geral","staff:Comissão Técnica","stadium:Estádio","sponsor:Patrocínios"]
        .map(s=>{const [k,l]=s.split(":"); return `<div class="tab ${finTab===k?"active":""}" data-f="${k}">${l}</div>`;}).join("")}
    </div><div id="finBody"></div>`;
  v.querySelectorAll("[data-f]").forEach(t=> t.onclick=()=>{ finTab=t.dataset.f; renderFinance(v); });
  const body=$("finBody");
  if(finTab==="overview") renderFinOverview(body);
  else if(finTab==="staff") renderStaff(body);
  else if(finTab==="stadium") renderStadium(body);
  else if(finTab==="sponsor") renderSponsor(body);
}

function nextUserFixture(){
  return C.fixturesOfRound(world, world.round).find(f=>f.home===userId||f.away===userId);
}
function renderFinOverview(body){
  const c=me(); const nf=nextUserFixture();
  const isHome = nf ? nf.home===userId : false;
  const proj = C.roundFinance(c, isHome);
  const last = c.finance.ledger[c.finance.ledger.length-1];
  const line=(lbl,val,cls)=>`<div class="line"><span>${lbl}</span><span class="${cls||""}">${val}</span></div>`;
  const cd=c.discipline?c.discipline.closedDoors:0;
  let projHtml = line("Bilheteria", isHome?(cd>0?"R$ 0 (portões fechados)":brl(proj.income.gate)):"— (fora de casa)", cd>0&&isHome?"neg":"pos")
    + line("Patrocínio", brl(proj.income.sponsor), "pos")
    + line("Salários (elenco)", "- "+brl(proj.expense.playerWages), "neg")
    + line("Salários (comissão)", "- "+brl(proj.expense.staffWages), "neg")
    + line("Manutenção do estádio", "- "+brl(proj.expense.upkeep), "neg")
    + line("Centro de treinamento", "- "+brl(proj.expense.training||0), "neg")
    + `<div class="line"><b>Saldo projetado</b><b class="${proj.net<0?'neg':'pos'}">${proj.net<0?"":"+"}${brl(proj.net)}</b></div>`;
  // histórico de saldo
  const hist=c.finance.ledger.slice(-8);
  const maxAbs=Math.max(1,...hist.map(h=>Math.abs(h.net)));
  const bars=hist.map(h=>`<div title="Rodada ${h.round+1}: ${h.net<0?'':'+'}${brl(h.net)}"
     style="flex:1;display:flex;flex-direction:column;justify-content:${h.net>=0?'flex-end':'flex-start'};height:46px">
     <div style="height:${Math.abs(h.net)/maxAbs*100}%;background:${h.net>=0?'var(--green)':'var(--red)'};border-radius:2px"></div></div>`).join("");
  body.innerHTML = `<div class="fin-grid">
    <div class="card"><h3>Próxima rodada (${isHome?"em casa":"fora"})</h3>${projHtml}</div>
    <div class="card"><h3>Situação</h3>
      ${line("Caixa atual", brl(c.finance.balance), c.finance.balance<0?"neg":"pos")}
      ${line("Última rodada", last?((last.net<0?"":"+")+brl(last.net)):"—", last?(last.net<0?"neg":"pos"):"")}
      ${line("Atmosfera do estádio", C.atmosphere(c)+"/100")}
      ${line("Lesionados", C.injuredList(c).length)}
      ${cd>0?line("⚖️ Portões fechados", `${cd} jogo(s) restantes`, "neg"):""}
      ${(last&&last.expense.fines)?line("Multas (última rodada)","- "+brl(last.expense.fines),"neg"):""}
      <div class="sub" style="margin-top:10px">Saldo por rodada (últimas ${hist.length})</div>
      <div style="display:flex;gap:3px;align-items:center;margin-top:6px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:2px 0">${bars||'<span class="sub">sem histórico</span>'}</div>
    </div></div>`;
}

function renderStaff(body){
  const c=me();
  let html="";
  for(const r of STAFF_ROLES){
    const s=c.staff[r.key];
    const cur = s
      ? `<div class="line"><span><b>${s.name}</b> · ${qualWord(s.quality)} (${s.quality})</span>
           <span>${brl(s.wage)}/sem <button data-act="fire" data-role="${r.key}" style="margin-left:8px">Demitir</button></span></div>`
      : `<div class="line"><span style="color:var(--red)">Vaga em aberto</span><span class="sub">sem efeito</span></div>`;
    const cands = (market[r.key]||[]).map((cand,i)=>
      `<div class="line"><span>${cand.name} · ${qualWord(cand.quality)} (${cand.quality})</span>
         <span>${brl(cand.wage)}/sem <button data-act="hire" data-role="${r.key}" data-idx="${i}" style="margin-left:8px">Contratar</button></span></div>`).join("");
    html += `<div class="card" style="margin-bottom:12px"><h3>${r.label}</h3>
      <div class="sub" style="margin:-4px 0 8px">${r.desc}</div>${cur}
      <div class="sub" style="margin:10px 0 4px">Disponíveis no mercado</div>${cands||'<span class="sub">ninguém disponível</span>'}</div>`;
  }
  html += `<div class="sub">Folha da comissão: <b>${brl(C.staffWageTotal(c))}</b>/semana. Qualidade maior custa mais,
    mas aumenta a <i>probabilidade</i> de o profissional fazer bem o trabalho — não é garantia.</div>`;
  body.innerHTML=html;
  body.querySelectorAll("[data-act]").forEach(btn=> btn.onclick=()=>{
    const role=btn.dataset.role;
    if(btn.dataset.act==="fire"){ c.staff[role]=null; }
    else { const idx=+btn.dataset.idx, cand=market[role][idx];
      if(c.staff[role]) market[role].push(c.staff[role]);        // ex-funcionário volta ao mercado
      c.staff[role]=cand; market[role].splice(idx,1);
      market[role].sort((a,b)=>b.quality-a.quality); }
    renderFinance($("view")); rerender();
  });
}

function bar(v,color){ return `<div class="qbar"><div style="width:${v}%;background:${color}"></div></div>`; }
function renderStadium(body){
  const c=me(), s=C.stadiumOf(c);
  const att=C.attendanceCount(c), rev=C.matchdayRevenue(c), atmo=C.atmosphere(c);
  const ex=s.expansion, wk=s.works;
  const expHtml = ex
    ? `<div class="line"><span>Ampliação (+${ex.addSeats.toLocaleString("pt-BR")} lug.)</span><span>${ex.roundsLeft} rodada(s)</span></div>`
    : `<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
         <button data-add="5000" data-cost="7500000">+5.000 lug. · ${brl(7.5e6)}</button>
         <button data-add="10000" data-cost="14000000">+10.000 lug. · ${brl(14e6)}</button></div>`;
  const wkHtml = wk
    ? `<div class="line"><span>Reforma: ${wk.kind==="proximity"?"aproximar arquibancadas":"cobrir e fechar"}</span><span>${wk.roundsLeft} rodada(s)</span></div>`
    : `<div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
         <button data-works="proximity" data-add="25" data-cost="9000000" ${s.proximity>=95?"disabled":""}>Aproximar arquibancadas +25 · ${brl(9e6)}</button>
         <button data-works="enclosure" data-add="20" data-cost="7000000" ${s.enclosure>=93?"disabled":""}>Cobrir e fechar +20 · ${brl(7e6)}</button></div>`;
  const venueRows = c.venues.map((v,i)=>{
    const cur=i===c.venueIdx;
    return `<div class="line"><span>${cur?"<b>":""}${v.name}${cur?"</b>":""}
        <span class="sub">${v.capacity.toLocaleString("pt-BR")} lug. · prox ${Math.round(v.proximity)} · acúst ${Math.round(v.enclosure)}${v.owned?"":` · aluguel ${brl(v.rent)}/jogo`}</span></span>
      <span>${cur?'<span class="sub">em uso</span>':`<button data-venue="${i}">Mandar jogos aqui</button>`}</span></div>`;
  }).join("");
  body.innerHTML = `<div class="fin-grid">
    <div class="card"><h3>${s.name}</h3>
      <div class="line"><span>Capacidade</span><span>${s.capacity.toLocaleString("pt-BR")}</span></div>
      <div class="line"><span>Público estimado</span><span>${att.toLocaleString("pt-BR")}</span></div>
      <div class="line"><span>Receita por jogo (casa)</span><span class="pos">${brl(rev)}</span></div>
      <div class="line"><span><b>Atmosfera</b></span><span><b>${atmo}/100</b></span></div>
      <div class="qrow"><span>Proximidade do gramado</span><span>${Math.round(s.proximity)}</span></div>${bar(s.proximity,"var(--accent)")}
      <div class="qrow"><span>Cobertura / acústica</span><span>${Math.round(s.enclosure)}</span></div>${bar(s.enclosure,"var(--home)")}
      <div class="qrow"><span>🌱 Gramado</span><span style="color:${s.pitch<45?'var(--red)':s.pitch<70?'var(--gold)':'var(--accent)'}">${s.pitch}/100${s.pitch<45?' ⚠️ precisa de reparo':''}</span></div>${bar(s.pitch, s.pitch<45?'var(--red)':s.pitch<70?'var(--gold)':'var(--accent)')}
      <div class="row2" style="margin-top:6px"><label>Manutenção do gramado</label>
        <select id="pitchCare">${Object.entries(C.PITCH_CARE).map(([k,x])=>`<option value="${k}" ${s.pitchCare===k?"selected":""}>${x.l} (${brl(x.cost)}/rod)</option>`).join("")}</select></div>
      <div class="sub" style="margin-top:6px">Gramado ruim + chuva = campo encharcado: passe pior e mais cansaço.
      Manutenção alta tem drenagem. Torcida colada e estádio fechado fazem mais barulho que capacidade pura.</div>
      ${wkHtml}${expHtml}</div>
    <div class="card"><h3>Ingressos &amp; setores</h3>
      <div class="slider-row"><label>Preço base do ingresso <b id="priceLbl">${brl(s.ticketPrice)}</b></label>
        <input type="range" id="price" min="20" max="180" step="5" value="${s.ticketPrice}"></div>
      <div class="slider-row"><label>Fatia premium (camarotes) <b id="premLbl">${Math.round(s.premiumShare*100)}%</b></label>
        <input type="range" id="prem" min="0" max="40" step="5" value="${Math.round(s.premiumShare*100)}"></div>
      <div class="sub" style="margin-top:6px">Camarote rende mais por torcedor, mas enche devagar e <b>cala o estádio</b>.</div>
      <h3 style="margin-top:14px">Onde mandar seus jogos</h3>${venueRows}
    </div></div>`;
  $("price").oninput=e=>{ s.ticketPrice=+e.target.value; $("priceLbl").textContent=brl(s.ticketPrice); renderStadium(body); };
  $("prem").oninput=e=>{ s.premiumShare=+e.target.value/100; $("premLbl").textContent=e.target.value+"%"; renderStadium(body); };
  $("pitchCare").onchange=e=>{ s.pitchCare=e.target.value; renderStadium(body); rerender(); };
  body.querySelectorAll("[data-add]:not([data-works])").forEach(b=> b.onclick=()=>{
    const cost=+b.dataset.cost;
    if(c.finance.balance<cost){ toast("Caixa insuficiente para esta obra."); return; }
    c.finance.balance-=cost;
    s.expansion={addSeats:+b.dataset.add, roundsLeft:+b.dataset.add===5000?3:5, cost};
    renderStadium(body); rerender();
  });
  body.querySelectorAll("[data-works]").forEach(b=> b.onclick=()=>{
    const cost=+b.dataset.cost;
    if(c.finance.balance<cost){ toast("Caixa insuficiente para a reforma."); return; }
    c.finance.balance-=cost;
    s.works={kind:b.dataset.works, add:+b.dataset.add, roundsLeft:b.dataset.works==="proximity"?4:3, cost};
    renderStadium(body); rerender();
  });
  body.querySelectorAll("[data-venue]").forEach(b=> b.onclick=()=>{
    c.venueIdx=+b.dataset.venue;
    toast("Agora você manda em "+C.stadiumOf(c).name);
    renderStadium(body); rerender();
  });
}

const logoImg = (brand,color,h=16)=>
  `<img src="${BR.brandLogo(brand,color)}" style="height:${h}px;vertical-align:middle;max-width:110px;object-fit:contain">`;

function renderSponsor(body){
  const c=me(), eff=C.staffEffects(c);
  const rk=C.reachOf(c.prestige).k;
  if(!c.sponsorOffers) c.sponsorOffers=BR.makeOffers(c, rk);
  const total=BR.sponsorIncome(c);
  let html=`<div class="card"><h3>Resumo</h3>
    <div class="line"><span>Slots preenchidos</span><span>${Object.keys(c.sponsors||{}).length} / ${BR.SLOT_KEYS.length}</span></div>
    <div class="line"><span>Receita de patrocínio</span><span class="pos">${brl(total)}/rodada</span></div>
    <div class="line"><span>Com marketing (+${Math.round((eff.sponsorMult-1)*100)}%)</span><span class="pos">${brl(total*eff.sponsorMult)}/rodada</span></div>
    <div class="sub" style="margin-top:6px">Seu clube é <b>${BR.REACH_PT[rk]}</b> (${starsHTML(c.prestige)}).
      Marcas só negociam com clubes de alcance parecido — e slots mais visíveis pagam mais.</div>
    <div style="margin-top:8px"><button id="spBrands">🏷️ Banco de marcas (${BR.BRANDS.length})</button>
      <button id="spRefresh" style="margin-left:6px">↻ Novas propostas</button></div></div>`;

  for(const key of BR.SLOT_KEYS){
    const S=BR.SPONSOR_SLOTS[key], ct=(c.sponsors||{})[key];
    const offers=(c.sponsorOffers[key]||[]).filter(o=>!ct);
    html+=`<div class="card" style="margin-top:10px"><h3>${S.l} <span class="muted" style="text-transform:none">· peso ${S.w.toFixed(2)}</span></h3>`;
    if(ct){
      const b=BR.brandById(ct.brandId);
      html+=`<div class="line"><span>${logoImg(b,null,18)} <b>${b?b.name:"?"}</b>
          <span class="sub">${b?BR.REACH_PT[b.reach]:""}</span></span>
        <span class="pos">${brl(ct.perRound)}/rod · ${ct.seasonsLeft} temp.
          <button data-drop="${key}" style="margin-left:8px">Rescindir</button></span></div>`;
    } else if(offers.length){
      for(let i=0;i<offers.length;i++){
        const o=offers[i], b=BR.brandById(o.brandId);
        html+=`<div class="line"><span>${logoImg(b,null,16)} ${b.name}
            <span class="sub">${BR.REACH_PT[b.reach]} · prestígio ${b.prestige}</span></span>
          <span>${brl(o.perRound)}/rod · ${o.seasons} temp.
            <button data-sign="${key}" data-i="${i}" style="margin-left:8px">Assinar</button></span></div>`;
      }
    } else html+=`<div class="sub">Nenhuma marca interessada neste slot agora.</div>`;
    html+=`</div>`;
  }
  body.innerHTML=html;
  $("spBrands").onclick=()=>openBrandEditor();
  $("spRefresh").onclick=()=>{ c.sponsorOffers=BR.makeOffers(c, rk); toast("Propostas renovadas"); renderFinance($("view")); };
  body.querySelectorAll("[data-sign]").forEach(btn=> btn.onclick=()=>{
    const key=btn.dataset.sign, o=c.sponsorOffers[key][+btn.dataset.i];
    BR.signSponsor(c,key,o);
    toast("Patrocínio assinado: "+BR.brandById(o.brandId).name);
    renderFinance($("view")); rerender();
  });
  body.querySelectorAll("[data-drop]").forEach(btn=> btn.onclick=()=>{
    BR.dropSponsor(c, btn.dataset.drop);
    toast("Contrato rescindido");
    renderFinance($("view")); rerender();
  });
}

/* ---------- Fluxo da rodada: pré-jogo → (assistir | simular) → resolver ---------- */
function advanceRound(){
  const tot=C.totalRounds(world);
  if(world.round>=tot){ openOffseason(); return; }     // acabou a liga → pré-temporada
  const nf=nextUserFixture();
  if(!nf){ runRound(null); return; }
  openPreMatch(nf);
}

/* ---------- Pré-temporada: amistosos + virar o ano ---------- */
function openOffseason(){
  const host=$("modalHost"), c=me();
  const table=C.computeTable(world);
  const pos=table.findIndex(r=>r.id===userId)+1;
  const champ=C.clubById(world, table[0].id);
  const opts=world.clubs.filter(x=>x.id!==userId)
    .map(x=>`<option value="${x.id}">${x.name}</option>`).join("");
  const played=(world.friendlies||[]).filter(f=>f.result);
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box" style="width:min(560px,94vw)">
    <button class="close" id="osClose">✕ Fechar</button>
    <h2>Pré-temporada ${world.season+1}</h2>
    <div class="sub">Temporada ${world.season} encerrada — você terminou em <b>${pos}º</b>.
      Campeão: <b>${champ.name}</b>.</div>
    <div class="card" style="margin-top:12px"><h3>Premiação da liga</h3>
      <div class="line"><span>Sua posição (${pos}º)</span><span class="pos">+${brl(C.leaguePrize(pos, table.length))}</span></div>
      <div class="sub" style="margin-top:4px">Pago ao <b>iniciar a próxima temporada</b>. Campeão leva ${brl(C.leaguePrize(1))}, o último ${brl(C.leaguePrize(table.length))}.</div></div>
    <div class="card" style="margin-top:12px"><h3>Amistoso</h3>
      <div class="sub" style="margin:-4px 0 8px">Amistosos não valem pontos, mas rendem bilheteria,
        rodam uma semana de treino e servem para testar escalação — com risco de lesão.</div>
      <div class="row2"><label>Adversário</label><select id="osOpp">${opts}</select></div>
      <div class="row2"><label>Mando</label><select id="osHome">
        <option value="1">Em casa</option><option value="0">Fora</option></select></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="primary" id="osPlay">▶ Jogar amistoso</button></div>
      ${played.length?`<div class="sub" style="margin-top:10px">Amistosos: ${played.map(f=>{
        const h=C.clubById(world,f.home), a=C.clubById(world,f.away);
        return `${h.short} ${f.result.home}-${f.result.away} ${a.short}`;}).join(" · ")}</div>`:""}
    </div>
    <div class="card" style="margin-top:12px"><h3>Começar a temporada ${world.season+1}</h3>
      <div class="sub" style="margin:-4px 0 8px">Os jogadores envelhecem 1 ano, jovens evoluem rumo ao potencial,
        veteranos caem, alguns se aposentam e a base repõe o elenco. Novo calendário é sorteado.</div>
      <button class="primary" id="osNext">▶ Iniciar temporada ${world.season+1}</button></div>
  </div>`;
  host.appendChild(modal);
  const close=()=>host.innerHTML="";
  $("osClose").onclick=close;
  $("osPlay").onclick=()=>{
    const oppId=+$("osOpp").value, atHome=$("osHome").value==="1";
    const fx={home:atHome?userId:oppId, away:atHome?oppId:userId, result:null, friendly:true};
    world.friendlies.push(fx);
    close(); openPreMatch(fx);
  };
  $("osNext").onclick=()=>{
    const myPrize=(C.leaguePrize(pos, table.length));
    const r=C.startNewSeason(world);
    world.friendlies=[]; calRound=0;
    close();
    rerender();
    toast(`Premiação: +${brl(myPrize)} · Temporada ${world.season} começou!`);
    if(r.news.length) setTimeout(()=>toast(r.news[0]), 1600);
  };
}
/* Amistoso: sem tabela, com bilheteria reduzida, treino da semana e risco de lesão */
function runFriendly(fx, res){
  const h=C.clubById(world,fx.home), a=C.clubById(world,fx.away);
  fx.result={home:res.home, away:res.away};
  for(const club of [h,a]) C.rollMatchInjuries(club);
  C.applyTraining(h); C.applyTraining(a);
  const gate=Math.round(C.matchdayRevenue(h)*0.45);      // amistoso lota menos
  h.finance.balance+=gate;
  for(const club of [h,a]) C.tickInjuries(club);
  S.saveGame(world).catch(()=>{});
  const host=$("modalHost");
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box" style="width:min(460px,92vw)">
    <button class="close" id="frClose">✕ Fechar</button>
    <h2>Amistoso</h2>
    <div class="fx me" style="margin-top:10px"><div class="h">${h.name}</div>
      <div class="sc">${res.home} - ${res.away}</div><div class="a">${a.name}</div></div>
    ${res.scorers.length?`<div class="scorers" style="margin-top:6px">⚽ ${res.scorers.map(s=>`${s.name} ${s.minute}'`).join(" · ")}</div>`:""}
    <div class="sub" style="margin-top:10px">Bilheteria do amistoso: <b class="pos">${brl(gate)}</b> ·
      uma semana de treino aplicada.</div></div>`;
  host.appendChild(modal);
  $("frClose").onclick=()=>{ host.innerHTML=""; openOffseason(); };
  rerender();
}
/* played = {fx, result} quando o usuário assistiu ao próprio jogo */
function runRound(played){
  const tot=C.totalRounds(world); if(world.round>=tot) return;
  const r=world.round;
  const trainNews=[];
  for(const c of world.clubs){
    const S=C.stadiumOf(c);
    const ex=S.expansion;                                              // progride ampliação
    if(ex){ ex.roundsLeft--; if(ex.roundsLeft<=0){ S.capacity+=ex.addSeats; S.expansion=null; } }
    const wk=S.works;                                                  // progride reforma (proximidade/acústica)
    if(wk){ wk.roundsLeft--; if(wk.roundsLeft<=0){
      if(wk.kind==="proximity") S.proximity=Math.min(98,S.proximity+wk.add);
      else S.enclosure=Math.min(95,S.enclosure+wk.add);
      S.works=null; } }
    const t=C.applyTraining(c);                                        // semana de treino
    if(c.id===userId && t.grown.length) trainNews.push(...t.grown);
    C.tickPitch(c);                                                    // gramado (des)recupera
  }
  const results=[], injNews=[], homeIds=new Set();
  for(const f of C.fixturesOfRound(world,r)){
    const h=C.clubById(world,f.home), a=C.clubById(world,f.away);
    const res=(played && played.fx===f) ? played.result : C.simulateMatch(h,a,C.matchContext(world,f));
    f.result={home:res.home, away:res.away}; homeIds.add(h.id);
    results.push({f,res,h,a});
    for(const club of [h,a]){ const inj=C.rollMatchInjuries(club); if(inj&&club.id===userId) injNews.push(inj); }
    // resultado recente move a torcida (forma influencia o público mais que o prestígio fixo)
    const d=res.home-res.away, up=v=>Math.max(30,Math.min(98,v));
    h.fans=up(h.fans + (d>0?0.7:d<0?-0.7:0.1));
    a.fans=up(a.fans + (d<0?0.7:d>0?-0.7:0.1));
  }
  // punições por incidentes (multas agora; portões fechados a partir do PRÓXIMO jogo)
  const fines={}, discNews=[];
  for(const {res} of results){
    for(const inc of (res.incidents||[])){
      const club=C.clubById(world, inc.clubId), P=C.PUNISH[inc.type];
      if(!club || !P) continue;
      if(P.fine) fines[club.id]=(fines[club.id]||0)+P.fine;
      discNews.push({club, type:inc.type, ...P});
    }
  }
  for(const c of world.clubs){                                         // finanças (portões fechados valem para ESTE jogo)
    const isHome=homeIds.has(c.id);
    const fill=isHome?Math.max(0.2,Math.min(1,C.attendanceFactor(c)+(Math.random()-0.5)*0.12)):undefined;
    const fin=C.roundFinance(c,isHome,fill,fines[c.id]||0); c.finance.balance+=fin.net;
    c.finance.ledger.push({round:r,...fin,balanceAfter:c.finance.balance,isHome});
    if(c.finance.ledger.length>12) c.finance.ledger.shift();
  }
  // quem jogou em casa cumpriu um jogo de portões fechados...
  for(const c of world.clubs) if(homeIds.has(c.id) && c.discipline.closedDoors>0) c.discipline.closedDoors--;
  // ...e só então entram as punições novas
  for(const n of discNews){
    if(n.closed) n.club.discipline.closedDoors += n.closed;
    n.club.discipline.history.push({round:r, type:n.type, fine:n.fine, closed:n.closed});
  }
  world.round++; calRound=Math.min(world.round,tot-1);
  for(const c of world.clubs) C.tickInjuries(c);      // recupera para a próxima rodada
  C.refreshMarket(world);                            // nova lista de transferências
  const meClub=me(); meClub.prospects=C.scoutProspects(meClub);   // o olheiro traz promessas
  showRoundModal(results,r,injNews,discNews,trainNews); rerender();
  S.saveGame(world).catch(()=>{});                    // autosave
}

/* ---------- Tela de confirmação pré-jogo ---------- */
function miniBoard(svg, club, xi){
  svg.innerHTML="";
  for(let i=0;i<8;i++) svg.appendChild(mkSVG("rect",{x:0,y:i*13.1,width:68,height:13.1,fill:i%2?"#3a7d3f":"#347439"}));
  const st={fill:"none",stroke:"rgba(255,255,255,.55)","stroke-width":.4};
  svg.appendChild(mkSVG("rect",{x:1,y:1,width:66,height:103,...st}));
  svg.appendChild(mkSVG("line",{x1:1,y1:52.5,x2:67,y2:52.5,stroke:"rgba(255,255,255,.55)","stroke-width":.4}));
  svg.appendChild(mkSVG("circle",{cx:34,cy:52.5,r:9,...st}));
  xi.forEach((s,i)=>{
    const g=mkSVG("g");
    drawJersey(g,s.x,s.y,club.kit,club.id+"_"+i,2.7);
    const nm=mkSVG("text",{x:s.x,y:s.y+6.6,"text-anchor":"middle","font-size":2.6,fill:"#fff","font-weight":"600",
      style:"paint-order:stroke;stroke:rgba(0,0,0,.6);stroke-width:.7px"});
    nm.textContent=surname(s.player.name); g.appendChild(nm); svg.appendChild(g);
  });
}
function openPreMatch(fx){
  const host=$("modalHost");
  const home=C.clubById(world,fx.home), away=C.clubById(world,fx.away);
  const xiH=C.getXI(home), xiA=C.getXI(away);
  if(!fx.weather) fx.weather=C.makeWeather(home.city);    // fixa a previsão do jogo
  const w=fx.weather, sky=C.SKY[w.sky], V=C.stadiumOf(home);
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box" style="width:min(760px,95vw)">
    <h2>Pré-jogo — Rodada ${world.round+1}</h2>
    <div class="sub">${V.name} · público ${C.attendanceCount(home).toLocaleString("pt-BR")} · atmosfera ${C.atmosphere(home)}/100</div>
    <div class="weatherbar" style="margin-top:8px">${sky.ic} <b>${sky.l}</b> · ${w.tempC}°C · 💨 ${w.wind} km/h ${w.windDir} · 🕐 ${w.kickoff}h · 🌱 gramado ${V.pitch}/100${V.pitch<45?" ⚠️":""}</div>
    <div class="prematch">
      <div class="pm-side">
        <div class="pm-head"><span class="dot" style="background:${home.color}"></span><b>${home.name}</b> <span class="muted">(casa)</span></div>
        <div class="muted" style="font-size:12px">${(home.lineup&&home.lineup.formation)||"4-3-3"} · ${home.tactic}</div>
        <svg id="pmH" viewBox="0 0 68 105"></svg>
      </div>
      <div class="pm-vs">×</div>
      <div class="pm-side">
        <div class="pm-head"><span class="dot" style="background:${away.color}"></span><b>${away.name}</b> <span class="muted">(fora)</span></div>
        <div class="muted" style="font-size:12px">${(away.lineup&&away.lineup.formation)||"4-3-3"} · ${away.tactic}</div>
        <svg id="pmA" viewBox="0 0 68 105"></svg>
      </div>
    </div>
    <div class="pm-actions">
      <button class="primary" id="pmWatch">▶ Assistir ao jogo</button>
      <button id="pmSim">⏩ Simular direto</button>
      <button id="pmBack">✕ Voltar e ajustar</button>
    </div>
  </div>`;
  host.appendChild(modal);
  miniBoard($("pmH"), home, xiH); miniBoard($("pmA"), away, xiA);
  const close=()=>host.innerHTML="";
  $("pmBack").onclick=()=>{ close();
    if(fx.friendly){ world.friendlies=world.friendlies.filter(f=>f!==fx); openOffseason(); return; }
    view="escalacao";
    document.querySelectorAll(".nav .tab").forEach(t=>t.classList.toggle("active",t.dataset.v==="escalacao"));
    renderView(); };
  $("pmSim").onclick=()=>{ close();
    if(fx.friendly){ runFriendly(fx, C.simulateMatch(home,away,{stakes:0.05,label:"Amistoso",weather:fx.weather})); return; }
    runRound(null); };
  $("pmWatch").onclick=()=>{ close(); openLiveMatch(fx); };
}
/* ---------- Tela de jogo ao vivo ---------- */
let lm=null, lmTimer=null, lmPlaying=false, lmTab="campo", lmSel=null, lmSide="home", lmHalfDone=false;
function openLiveMatch(fx){
  const host=$("modalHost");
  const home=C.clubById(world,fx.home), away=C.clubById(world,fx.away);
  const ctx = fx.friendly?{stakes:0.05,label:"Amistoso"}:C.matchContext(world,fx);
  ctx.weather = fx.weather;                               // usa a previsão mostrada no pré-jogo
  lm=new C.LiveMatch(home,away, ctx);
  lmSide = fx.home===userId ? "home" : "away";
  lmTab="campo"; lmSel=null; lmPlaying=false; lmHalfDone=false;
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box matchbox">
    <div class="ms-board">
      <div class="t"><span class="dot" style="background:${home.color}"></span>${home.name}</div>
      <div class="c"><div class="score"><span id="msH">0</span> : <span id="msA">0</span></div>
        <div class="clock" id="msClock">0'</div></div>
      <div class="t a">${away.name}<span class="dot" style="background:${away.color};margin-left:6px"></span></div>
    </div>
    <div class="ms-tabs" id="msTabs">
      <div class="tab active" data-m="campo">⚽ Campo</div>
      <div class="tab" data-m="stats">📊 Estatísticas</div>
      <div class="tab" data-m="time">📜 Timeline</div>
      <div class="tab" data-m="ajustes">⚙️ Ajustes</div>
    </div>
    <div class="ms-body" id="msBody"></div>
    <div class="ms-controls">
      <button class="primary" id="msPlay">▶ Iniciar</button>
      <button id="msInstant">⏭ Simular o resto</button>
      <label>Ritmo <select id="msSpeed">
        <option value="1200">Tempo real (lento)</option>
        <option value="450" selected>Normal</option>
        <option value="220">Rápido 2x</option>
        <option value="100">Acelerado 4x</option>
        <option value="35">Turbo 8x</option>
      </select></label>
      <button id="msDone" class="primary hidden">Continuar ▶</button>
    </div>
  </div>`;
  host.appendChild(modal);
  $("msTabs").querySelectorAll(".tab").forEach(t=> t.onclick=()=>{
    $("msTabs").querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active"); lmTab=t.dataset.m; renderMSBody();
  });
  $("msPlay").onclick=()=> lmPlaying?msPause():msPlay();
  $("msInstant").onclick=()=>{ msPause(); lm.finishAll(); msUpdate(); msEnd(); };
  $("msDone").onclick=()=>{ host.innerHTML="";
    if(fx.friendly) runFriendly(fx, lm.result());
    else runRound({fx, result:lm.result()}); };
  msUpdate();
}
function msPlay(){ if(lm.finished)return; lmPlaying=true; $("msPlay").textContent="⏸ Pausar"; msLoop(); }
function msPause(){ lmPlaying=false; if(lmTimer)clearTimeout(lmTimer); const b=$("msPlay"); if(b)b.textContent="▶ Continuar"; }
function msLoop(){
  if(!lmPlaying) return;
  lm.tick(); msUpdate();
  if(lm.finished){ msEnd(); return; }
  if(lm.minute===45 && !lmHalfDone){        // para no intervalo para você decidir
    lmHalfDone=true; msPause(); msHalfTime(); return;
  }
  lmTimer=setTimeout(msLoop, parseInt($("msSpeed").value,10));
}
function msHalfTime(){
  $("msPlay").textContent="▶ Iniciar 2º tempo";
  $("msClock").textContent="Intervalo";
  lmTab="ajustes";
  $("msTabs").querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.m==="ajustes"));
  renderMSBody();
  toast("Intervalo — ajuste o time se quiser");
}
function msEnd(){
  lmPlaying=false; if(lmTimer)clearTimeout(lmTimer);
  $("msPlay").classList.add("hidden"); $("msInstant").classList.add("hidden");
  $("msDone").classList.remove("hidden"); $("msClock").textContent="Encerrado";
}
function msUpdate(){
  if(!$("msH")) return;
  $("msH").textContent=lm.score.home; $("msA").textContent=lm.score.away;
  if(!lm.finished) $("msClock").textContent=lm.minute+"'";
  renderMSBody();
}
function renderMSBody(){
  const b=$("msBody"); if(!b) return;
  if(lmTab==="campo") renderMSPitch(b);
  else if(lmTab==="stats") renderMSStats(b);
  else if(lmTab==="time") renderMSTime(b);
  else renderMSAdjust(b);
}
function renderMSPitch(b){
  const ph=lm.possession(), pa=100-ph, t=lm.territory;
  const phase = t>0.18?`<b>${lm.home.name}</b> pressionando`
    : t<-0.18?`<b>${lm.away.name}</b> pressionando` : "Disputa no meio-campo";
  const T=Math.round(lm.tension);
  const tCol = T>75?"var(--red)" : T>55?"var(--gold)" : "var(--accent)";
  const tWord = T>75?"Fervendo" : T>55?"Quente" : T>35?"Animado" : "Tranquilo";
  const w=lm.weather, sky=C.SKY[w.sky]||C.SKY.nublado, wx=lm.wx;
  const floodTag = wx && wx.label ? ` · <span style="color:var(--home)">${wx.label}</span>` : "";
  b.innerHTML=`<div class="weatherbar">${sky.ic} <b>${sky.l}</b> · ${w.tempC}°C · 💨 ${w.wind} km/h ${w.windDir}
      · 💧 ${w.humidity}% · 🕐 ${w.kickoff}h · 🌱 gramado ${lm.venue.pitch}${floodTag}</div>
    <div class="climate">
      <span class="emo">${lm.emotionOf("home")}</span>
      <div class="tn">
        <div class="tn-top"><span>${lm.ctx.label}</span><span style="color:${tCol}">Clima: ${tWord} (${T})</span></div>
        <div class="tn-bar"><div style="width:${T}%;background:${tCol}"></div></div>
      </div>
      <span class="emo">${lm.emotionOf("away")}</span>
    </div>
    <div class="possbar"><div class="h" style="width:${ph}%">${ph}%</div><div class="a" style="width:${pa}%">${pa}%</div></div>
    <div class="phase">${phase}</div>
    <div class="pitchwrap"><svg id="msPitch" viewBox="0 0 105 64"></svg></div>`;
  const svg=$("msPitch");
  for(let i=0;i<7;i++) svg.appendChild(mkSVG("rect",{x:i*15,y:0,width:15,height:64,fill:i%2?"#3a7d3f":"#347439"}));
  const st={fill:"none",stroke:"rgba(255,255,255,.6)","stroke-width":.3};
  svg.appendChild(mkSVG("rect",{x:1,y:1,width:103,height:62,...st}));
  svg.appendChild(mkSVG("line",{x1:52.5,y1:1,x2:52.5,y2:63,stroke:"rgba(255,255,255,.6)","stroke-width":.3}));
  svg.appendChild(mkSVG("circle",{cx:52.5,cy:32,r:9.15,...st}));
  svg.appendChild(mkSVG("rect",{x:1,y:14,width:16.5,height:36,...st}));
  svg.appendChild(mkSVG("rect",{x:87.5,y:14,width:16.5,height:36,...st}));
  const jit=()=>(Math.random()-0.5)*2.2;
  for(const side of ["home","away"]){
    lm.xi[side].forEach(s=>{
      let x,y;
      if(side==="home"){ x=105-s.y; y=s.x*64/68; }     // prancheta vertical → campo horizontal
      else { x=s.y; y=(68-s.x)*64/68; }
      x=Math.max(3,Math.min(102, x + t*14 + jit()));
      y=Math.max(3,Math.min(61, y + jit()));
      svg.appendChild(mkSVG("circle",{cx:x.toFixed(1),cy:y.toFixed(1),r:1.7,
        fill:side==="home"?"#2f81f7":"#f0883e",stroke:"rgba(0,0,0,.4)","stroke-width":.3}));
    });
  }
  svg.appendChild(mkSVG("circle",{cx:Math.max(4,Math.min(101,52.5+t*38)).toFixed(1),cy:(32+jit()).toFixed(1),
    r:1,fill:"#fff",stroke:"#000","stroke-width":.2}));
}
function renderMSStats(b){
  const s=lm.stats, ph=lm.possession();
  const rows=[
    ["Posse de bola", ph, 100-ph, "%"],
    ["Finalizações", s.home.shots, s.away.shots],
    ["No alvo", s.home.on, s.away.on],
    ["Escanteios", s.home.corners, s.away.corners],
    ["Faltas", s.home.fouls, s.away.fouls],
    ["Cartões", s.home.yellow+s.home.red, s.away.yellow+s.away.red],
  ];
  let html='<div class="stats">';
  for(const [lbl,hv,av,suf] of rows){
    const tot=hv+av||1, hp=Math.round(hv/tot*100);
    html+=`<div class="row">
      <div class="hv">${hv}${suf||""}</div>
      <div class="statbar left"><div class="h" style="width:${hp}%"></div></div>
      <div class="lbl">${lbl}</div>
      <div class="statbar right"><div class="a" style="width:${100-hp}%"></div></div>
      <div class="av">${av}${suf||""}</div></div>`;
  }
  b.innerHTML=html+"</div>";
}
function renderMSTime(b){
  b.innerHTML='<div class="feed">'+lm.events.slice().reverse().map(e=>{
    let cls="ev"; if(e.type==="goal")cls+=" goal";
    if(e.type==="chaos")cls+=" chaos";
    if(["ht","ft","red","sub","tactic"].includes(e.type))cls+=" big";
    return `<div class="${cls}"><span class="min">${e.min}</span><span class="ic">${e.ic}</span><span class="tx">${e.tx}</span></div>`;
  }).join("")+"</div>";
}
function renderMSAdjust(b){
  const side=lmSide, club=lm.clubOf(side);
  const tacOpts=["Defensivo","Equilibrado","Ofensivo"].map(t=>`<option ${t===lm.tactic[side]?"selected":""}>${t}</option>`).join("");
  const curForm=(lm.formationName&&lm.formationName[side])||"4-3-3";
  const formOpts=Object.keys(C.FORMATIONS).map(k=>`<option ${k===curForm?"selected":""}>${k}</option>`).join("");
  const bench=lm.benchOf(side);
  b.innerHTML=`<div class="adj">
    <div class="adj-row">
      <label>Formação <select id="msForm">${formOpts}</select></label>
      <label>Tática <select id="msTac">${tacOpts}</select></label>
      <span class="muted">subs ${lm.subsUsed[side]}/${C.MAX_SUBS}</span></div>
    <div class="adj-cols">
      <div><h3>Em campo</h3><div id="msXI" class="bench"></div></div>
      <div><h3>Banco</h3><div id="msBench" class="bench"></div></div>
    </div>
    <div class="sub">Clique num titular e depois num reserva para substituir. 🟨/🟥 = cartões · <b>%</b> = fôlego restante.</div>
  </div>`;
  $("msXI").innerHTML=lm.xi[side].map((s,i)=>{
    const sel=(lmSel===i)?" sel":"";
    const cards=(s.red?"🟥":"")+(s.yellow?"🟨":"");
    const risk=(s.yellow&&!s.red)?' style="box-shadow:inset 0 0 0 1px var(--yellow)"':"";
    return `<div class="b${sel}" data-i="${i}"${risk}><span>${C.flagOf(s.player)} <span class="pos">${s.slot}</span>${surname(s.player.name)} ${cards}</span>
      <span style="font-size:11px" class="muted">${Math.round(s.fit)}% · <b style="color:${fitColor(s.rating)}">${s.rating}</b></span></div>`;
  }).join("");
  // se um titular está selecionado, mostra a nota do reserva NAQUELA posição (evita pôr goleiro de centroavante)
  const selSlot = lmSel!=null ? lm.xi[side][lmSel].slot : null;
  $("msBench").innerHTML = bench.length ? bench.map(p=>{
    const r = selSlot ? C.effectiveRating(p, selSlot) : p.overall;
    const tag = selSlot ? `<span class="ovr" style="background:${ovrColor(r)};padding:0 6px" title="Nota como ${selSlot}">${r}</span>`
                        : `<span class="ovr" style="background:${ovrColor(r)};padding:0 6px">${r}</span>`;
    return `<div class="b" data-id="${p.id}"><span>${C.flagOf(p)} <span class="pos">${p.pos}</span>${surname(p.name)}</span>${tag}</div>`;
  }).join("") : '<span class="sub">Sem reservas disponíveis</span>';
  if(selSlot) $("msBench").insertAdjacentHTML("afterbegin",
    `<div class="sub" style="margin-bottom:6px">Notas como <b>${selSlot}</b></div>`);
  $("msForm").onchange=e=>{ lm.setFormation(side, e.target.value); toast("Formação: "+e.target.value); lmSel=null; renderMSBody(); };
  $("msTac").onchange=e=>{ lm.setTactic(side, e.target.value); toast("Tática: "+e.target.value); renderMSBody(); };
  $("msXI").querySelectorAll(".b").forEach(r=> r.onclick=()=>{ lmSel=(lmSel===+r.dataset.i)?null:+r.dataset.i; renderMSBody(); });
  $("msBench").querySelectorAll(".b").forEach(r=> r.onclick=()=>{
    if(lmSel==null){ toast("Escolha primeiro quem sai"); return; }
    const res=lm.substitute(side, lmSel, +r.dataset.id);
    toast(res.ok?"Substituição feita":res.msg);
    lmSel=null; renderMSBody();
  });
}

function showRoundModal(results,r,injNews,discNews,trainNews){
  const host=$("modalHost");
  let inner=`<button class="close" id="mClose">✕ Fechar</button>
    <h2>Resultados — Rodada ${r+1}</h2><div class="sub">Temporada ${world.season}</div>
    <div class="result-list" style="margin-top:12px">`;
  for(const {f,res,h,a} of results){
    const mine=f.home===userId||f.away===userId;
    inner+=`<div class="fx${mine?" me":""}"><div class="h">${h.name}</div>
      <div class="sc">${res.home} - ${res.away}${res.abandoned?" ⛔":""}</div><div class="a">${a.name}</div>`;
    if(mine&&res.scorers.length) inner+=`<div class="scorers">⚽ ${res.scorers.map(s=>`${s.name} ${s.minute}'`).join(" · ")}</div>`;
    inner+=`</div>`;
  }
  inner+=`</div>`;
  if(injNews.length) inner+=`<div class="sub" style="margin-top:10px;color:var(--red)">🩹 Lesões: `
    + injNews.map(x=>`${x.name} (${x.rounds} rod.)`).join(" · ")+`</div>`;
  if(trainNews && trainNews.length) inner+=`<div class="sub" style="margin-top:6px;color:var(--accent)">📈 Evoluiu no treino: `
    + trainNews.map(x=>`${surname(x.name)} ${ATTR_PT[x.attr]} → ${x.val}`).join(" · ")+`</div>`;
  if(discNews && discNews.length){
    // agrupa por clube+tipo para não repetir
    const seen=new Map();
    for(const n of discNews){
      const k=n.club.id+"|"+n.type;
      if(seen.has(k)) seen.get(k).n++; else seen.set(k,{...n,n:1});
    }
    inner+=`<div class="discipline"><h3>⚖️ Tribunal / Segurança</h3>`;
    for(const n of seen.values()){
      const mine=n.club.id===userId;
      inner+=`<div class="${mine?"me":""}">${mine?"<b>":""}${n.club.name}${mine?"</b>":""} — ${n.label}${n.n>1?` (×${n.n})`:""}:
        ${n.fine?`multa de ${brl(n.fine*n.n)}`:""}${n.fine&&n.closed?" e ":""}${n.closed?`<b>${n.closed} jogo(s) de portões fechados</b>`:""}</div>`;
    }
    inner+=`</div>`;
  }
  if(world.round>=C.totalRounds(world)){
    const champ=C.clubById(world,C.computeTable(world)[0].id);
    inner+=`<div class="champ"><div>🏆 Campeão da Temporada ${world.season}</div>
      <div class="big" style="color:${champ.color}">${champ.name}</div>
      <div class="sub">${champ.id===userId?"Parabéns, é você!":"Foi a máquina desta vez."}</div></div>`;
  }
  const modal=el("div","modal"); modal.innerHTML=`<div class="box">${inner}</div>`;
  const close=()=>host.innerHTML=""; modal.onclick=e=>{ if(e.target===modal) close(); };
  host.appendChild(modal); $("mClose").onclick=close;
}

/* liga um handler SEM quebrar o resto se o elemento não existir
   (um game.html em cache já derrubou todos os botões seguintes uma vez) */
function on(id, ev, fn){
  const e=$(id);
  if(!e){ console.warn("[Onze] elemento ausente:", id, "— recarregue com Ctrl+F5"); return; }
  e[ev]=fn;
}
on("btnAdvance","onclick",advanceRound);
on("btnSave","onclick",async()=>{ try{ await S.saveGame(world); toast("Jogo salvo"); }catch(e){ toast("Erro ao salvar"); } });
on("btnExport","onclick",()=> S.exportJSON(world));
on("btnImport","onclick",()=> $("importFile").click());
on("importFile","onchange",async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{ const w=await S.importJSON(f); adoptWorld(w); toast("Save importado"); }
  catch(err){ toast("Arquivo inválido"); }
});
/* menu */
on("mNew","onclick",newGame);
on("mContinue","onclick",async()=>{
  try{ const s=await S.loadGame(); if(s&&s.world){ adoptWorld(s.world); toast("Carreira carregada"); } }
  catch(e){ toast("Erro ao carregar"); }
});
on("mImport","onclick",()=> $("importFile").click());
on("mBrands","onclick",()=> openBrandEditor());
/* mundo "de pré-jogo": gerado sob demanda para navegar/editar antes da carreira */
function draftWorld(){
  if(!window.__draft) window.__draft=freshWorld();
  return window.__draft;
}
on("mClubs","onclick",()=> ED.openClubBrowser(world||draftWorld()));
function openEditor(){
  ED.openWorldEditor(draftWorld(), {
    allowPlayers:true,
    onChange:w=>saveWorldTemplate(w),
    onImport:tpl=>{ window.__draft=C.worldFromTemplate(tpl); migrate(window.__draft);
      saveWorldTemplate(window.__draft); $("modalHost").innerHTML=""; openEditor(); },
    onRandom:()=>{ clearWorldTemplate(); window.__draft=C.generateWorld(); migrate(window.__draft);
      $("modalHost").innerHTML=""; openEditor(); toast("Mundo aleatório gerado"); },
  });
}
on("mEditor","onclick",openEditor);
on("backToMenu","onclick",()=>{ showScreen("menu"); boot(); });
on("btnClubs","onclick",()=> ED.openClubBrowser(world));
on("btnMenu","onclick",async()=>{
  try{ await S.saveGame(world); toast("Jogo salvo"); }catch(e){}
  showScreen("menu"); boot();
});
boot();
