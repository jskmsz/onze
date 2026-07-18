/* =====================================================================
   ONZE — editors.js
   Enciclopédia de clubes (páginas estilo wiki), mapa de Dournéa com
   coordenadas clicáveis, editor de clubes e editor de jogadores.
   O editor de jogadores só roda ANTES de começar a carreira.
   ===================================================================== */
import * as C from "./core.js";
import * as K from "./kit.js";
import * as BR from "./brands.js";

export const MAP_SRC = "assets/map/dournea.png";
const $ = id => document.getElementById(id);
const el = (t,c,h)=>{ const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };
const brl = n => "R$ " + Math.round(n||0).toLocaleString("pt-BR");
const num = n => Math.round(n||0).toLocaleString("pt-BR");
const esc = s => String(s??"").replace(/"/g,"&quot;").replace(/</g,"&lt;");

/* ---------- mapa ---------- */
let mapOk=null;
async function mapAvailable(){
  if(mapOk!==null) return mapOk;
  mapOk = await new Promise(res=>{ const i=new Image();
    i.onload=()=>res(true); i.onerror=()=>res(false); i.src=MAP_SRC; });
  return mapOk;
}
/* desenha o mapa (PNG do usuário ou um fundo estilizado) + os clubes */
export async function drawMap(canvas, world, opts={}){
  const ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  if(await mapAvailable()){
    const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=MAP_SRC;});
    ctx.drawImage(img,0,0,W,H);
  } else {
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"#16323d"); g.addColorStop(1,"#0f2430");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,255,255,.05)"; ctx.lineWidth=1;
    for(let i=1;i<10;i++){ ctx.beginPath(); ctx.moveTo(W*i/10,0); ctx.lineTo(W*i/10,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,H*i/10); ctx.lineTo(W,H*i/10); ctx.stroke(); }
    ctx.fillStyle="rgba(255,255,255,.25)"; ctx.font="12px sans-serif"; ctx.textAlign="center";
    ctx.fillText("mapa: coloque assets/map/dournea.png", W/2, H-10);
  }
  for(const c of world.clubs){
    const x=(c.coords?.x??.5)*W, y=(c.coords?.y??.5)*H;
    const sel = opts.selected===c.id;
    const r = sel?9:6;
    ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fillStyle=c.color; ctx.fill();
    ctx.lineWidth=sel?3:1.5; ctx.strokeStyle=sel?"#d29922":"rgba(0,0,0,.55)"; ctx.stroke();
    if(opts.labels!==false){
      ctx.font="bold 11px sans-serif"; ctx.textAlign="center";
      ctx.lineWidth=3; ctx.strokeStyle="rgba(0,0,0,.75)";
      ctx.strokeText(c.short, x, y-r-4); ctx.fillStyle="#fff"; ctx.fillText(c.short, x, y-r-4);
    }
  }
}
export function mapClickCoords(canvas, ev){
  const r=canvas.getBoundingClientRect();
  return { x:Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),
           y:Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height)) };
}

/* ---------- Enciclopédia: página estilo wiki de um clube ---------- */
export function clubPageHTML(world, club){
  const S=C.stadiumOf(club), table=C.computeTable(world);
  const pos=table.findIndex(r=>r.id===club.id)+1;
  const row=table.find(r=>r.id===club.id)||{P:0,J:0,V:0,E:0,D:0,GP:0,GC:0};
  const rivals=world.clubs.filter(o=>o.id!==club.id && C.isDerby(club,o));
  const squad=club.squad.slice().sort((a,b)=>b.overall-a.overall);
  const best=squad.slice(0,5);
  const avgAge=(club.squad.reduce((s,p)=>s+p.age,0)/club.squad.length).toFixed(1);
  const sponsors=Object.entries(club.sponsors||{});
  const stars=C.prestigeStars(club.prestige);
  const starTxt="★".repeat(Math.floor(stars))+(stars%1?"⯪":"")+"☆".repeat(5-Math.ceil(stars));
  return `
  <div class="wiki">
    <div class="wiki-head">
      <div class="wiki-badge">${club.badge
        ? `<img src="${club.badge}">`
        : `<span style="background:${club.color}"></span>`}</div>
      <div>
        <h2>${esc(club.name)}</h2>
        <div class="sub">${esc(club.city)} · fundado em <b>${club.founded||"?"}</b> ·
          ${starTxt} <span class="muted">${BR.REACH_PT[C.reachOf(club.prestige).k]}</span></div>
      </div>
    </div>
    <div class="wiki-grid">
      <div class="wiki-box"><h3>Identidade</h3>
        <div class="line"><span>Fundação</span><span>${club.founded||"—"}</span></div>
        <div class="line"><span>Cidade</span><span>${esc(club.city)}</span></div>
        <div class="line"><span>População</span><span>${num(club.cityPop)}</span></div>
        <div class="line"><span>Prestígio</span><span>${club.prestige}/100</span></div>
        <div class="line"><span>Torcida</span><span>${club.fans}/100</span></div>
        <div class="line"><span>Caixa</span><span>${brl(club.finance?.balance)}</span></div>
      </div>
      <div class="wiki-box"><h3>Estádio</h3>
        <div class="line"><span>${esc(S.name)}</span><span>${num(S.capacity)} lug.</span></div>
        <div class="line"><span>Atmosfera</span><span>${C.atmosphere(club)}/100</span></div>
        <div class="line"><span>Proximidade</span><span>${Math.round(S.proximity)}</span></div>
        <div class="line"><span>Acústica</span><span>${Math.round(S.enclosure)}</span></div>
        <div class="line"><span>Gramado</span><span>${S.pitch}/100</span></div>
        <div class="line"><span>Público médio</span><span>${num(C.attendanceCount(club))}</span></div>
      </div>
      <div class="wiki-box"><h3>Temporada ${world.season}</h3>
        <div class="line"><span>Posição</span><span>${pos||"—"}º</span></div>
        <div class="line"><span>Jogos</span><span>${row.J}</span></div>
        <div class="line"><span>V / E / D</span><span>${row.V} / ${row.E} / ${row.D}</span></div>
        <div class="line"><span>Gols</span><span>${row.GP} : ${row.GC}</span></div>
        <div class="line"><span>Pontos</span><span><b>${row.P}</b></span></div>
      </div>
      <div class="wiki-box"><h3>Elenco</h3>
        <div class="line"><span>Jogadores</span><span>${club.squad.length}</span></div>
        <div class="line"><span>Idade média</span><span>${avgAge}</span></div>
        <div class="line"><span>Folha semanal</span><span>${brl(C.playerWageTotal(club))}</span></div>
        <div style="margin-top:6px">${best.map(p=>
          `<div class="line"><span>${C.flagOf(p)} ${esc(p.name)} <span class="muted">${p.pos}</span></span>
           <span><b>${p.overall}</b></span></div>`).join("")}</div>
      </div>
      <div class="wiki-box"><h3>Rivais</h3>
        ${rivals.length ? rivals.map(r=>
          `<div class="line"><span><span class="dot" style="background:${r.color}"></span>${esc(r.name)}</span>
            <span class="muted">${club.city===r.city?"mesmo município":C.distanceKm(club,r)+" km"}</span></div>`).join("")
          : `<div class="sub">Sem rival próximo.</div>`}
      </div>
      <div class="wiki-box"><h3>Patrocínios</h3>
        ${sponsors.length ? sponsors.map(([k,ct])=>{
          const b=BR.brandById(ct.brandId);
          return `<div class="line"><span class="muted">${BR.SPONSOR_SLOTS[k].l}</span>
            <span>${b?esc(b.name):"?"} · ${brl(ct.perRound)}</span></div>`; }).join("")
          : `<div class="sub">Sem patrocinadores.</div>`}
      </div>
    </div>
  </div>`;
}

/* ---------- Navegador de clubes (enciclopédia) ---------- */
export function openClubBrowser(world, hostId="modalHost"){
  const host=$(hostId);
  let sel=world.clubs[0].id, q="";
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box browserbox">
    <button class="close" id="cbClose">✕ Fechar</button>
    <h2>Clubes de Dournéa</h2>
    <div class="cb-wrap">
      <div class="cb-side">
        <input id="cbSearch" placeholder="Buscar clube ou cidade...">
        <div id="cbList" class="cb-list"></div>
        <canvas id="cbMap" width="300" height="380"></canvas>
        <div class="sub" style="text-align:center">clique num ponto para abrir o clube</div>
      </div>
      <div class="cb-page" id="cbPage"></div>
    </div></div>`;
  host.appendChild(modal);
  $("cbClose").onclick=()=>host.innerHTML="";
  const list=()=>{
    const term=q.trim().toLowerCase();
    const arr=world.clubs.filter(c=>!term || (c.name+" "+c.city).toLowerCase().includes(term));
    $("cbList").innerHTML=arr.map(c=>`
      <div class="cb-item ${c.id===sel?"sel":""}" data-id="${c.id}">
        <span class="dot" style="background:${c.color}"></span>
        <span class="nm">${esc(c.name)}</span>
        <span class="muted">${esc(c.city)}</span></div>`).join("")
      || `<div class="sub" style="padding:8px">Nada encontrado.</div>`;
    $("cbList").querySelectorAll(".cb-item").forEach(r=> r.onclick=()=>{ sel=+r.dataset.id; render(); });
  };
  const render=()=>{
    list();
    $("cbPage").innerHTML=clubPageHTML(world, C.clubById(world,sel));
    drawMap($("cbMap"), world, {selected:sel});
  };
  $("cbSearch").oninput=e=>{ q=e.target.value; list(); };
  $("cbMap").onclick=ev=>{
    const p=mapClickCoords($("cbMap"), ev);
    let best=null,bd=1e9;
    for(const c of world.clubs){
      const d=Math.hypot((c.coords.x-p.x),(c.coords.y-p.y));
      if(d<bd){bd=d;best=c;}
    }
    if(best && bd<0.08){ sel=best.id; render(); }
  };
  render();
}

/* ---------- Editor de clubes (e jogadores, antes da carreira) ---------- */
export function openWorldEditor(world, opts={}){
  const host=$("modalHost");
  const canEditPlayers = !!opts.allowPlayers;
  let sel=world.clubs[0].id, tab="clube";
  const modal=el("div","modal");
  modal.innerHTML=`<div class="box browserbox">
    <button class="close" id="weClose">✕ Fechar</button>
    <h2>Editor de mundo ${canEditPlayers?"":"<span class='sub'>(jogadores só antes de começar)</span>"}</h2>
    <div class="cb-wrap">
      <div class="cb-side">
        <div id="weList" class="cb-list"></div>
        <canvas id="weMap" width="300" height="380"></canvas>
        <div class="sub" style="text-align:center">clique no mapa para mover o clube selecionado</div>
      </div>
      <div class="cb-page">
        <div class="kit-tabs">
          <div class="tab ${tab==="clube"?"active":""}" data-t="clube">Clube</div>
          <div class="tab ${tab==="jogadores"?"active":""}" data-t="jogadores">Jogadores</div>
        </div>
        <div class="we-body" id="wePane"></div>
      </div>
    </div></div>`;
  host.appendChild(modal);
  $("weClose").onclick=()=>{ host.innerHTML=""; opts.onClose&&opts.onClose(); };

  const listar=()=>{
    $("weList").innerHTML=world.clubs.map(c=>`
      <div class="cb-item ${c.id===sel?"sel":""}" data-id="${c.id}">
        <span class="dot" style="background:${c.color}"></span>
        <span class="nm">${esc(c.name)}</span></div>`).join("");
    $("weList").querySelectorAll(".cb-item").forEach(r=> r.onclick=()=>{ sel=+r.dataset.id; render(); });
  };
  const render=()=>{
    listar();
    modal.querySelectorAll(".kit-tabs .tab").forEach(t=>{
      t.classList.toggle("active", t.dataset.t===tab);
      t.onclick=()=>{ tab=t.dataset.t; render(); };
    });
    (tab==="clube"?paneClub:panePlayers)();
    drawMap($("weMap"), world, {selected:sel});
    $("weMap").onclick=ev=>{
      const p=mapClickCoords($("weMap"), ev);
      const c=C.clubById(world,sel);
      c.coords={x:+p.x.toFixed(4), y:+p.y.toFixed(4)};
      render();
    };
  };
  function paneClub(){
    const c=C.clubById(world,sel);
    const near=world.clubs.filter(o=>o.id!==c.id && C.isDerby(c,o));
    $("wePane").innerHTML=`
      <div class="row2"><label>Nome</label><input id="wName" value="${esc(c.name)}"></div>
      <div class="row2"><label>Sigla</label><input id="wShort" value="${esc(c.short)}" maxlength="4"></div>
      <div class="row2"><label>Cidade</label><input id="wCity" value="${esc(c.city)}"></div>
      <div class="row2"><label>População</label><input id="wPop" type="number" value="${c.cityPop||0}"></div>
      <div class="row2"><label>Fundação</label><input id="wFound" type="number" value="${c.founded||1900}"></div>
      <div class="row2"><label>Cor</label><input type="color" id="wColor" value="${/^#[0-9a-f]{6}$/i.test(c.color)?c.color:"#334155"}"></div>
      <div class="row2"><label>Prestígio ${c.prestige}</label><input type="range" id="wPrest" min="1" max="100" value="${c.prestige}"></div>
      <div class="row2"><label>Torcida ${c.fans}</label><input type="range" id="wFans" min="20" max="98" value="${c.fans}"></div>
      <div class="row2"><label>Coordenadas</label><span class="muted">x ${c.coords.x.toFixed(3)} · y ${c.coords.y.toFixed(3)}</span></div>
      <div class="row2"><label>Estádio</label><input id="wStad" value="${esc(C.stadiumOf(c).name)}"></div>
      <div class="row2"><label>Capacidade</label><input id="wCap" type="number" value="${C.stadiumOf(c).capacity}"></div>
      <div class="shirt-upload"><label>Escudo (PNG)</label>
        <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
          <span>${c.badge?`<img src="${c.badge}" style="width:34px;height:34px;object-fit:contain">`
            :`<span style="display:inline-block;width:34px;height:34px;border-radius:8px;background:${c.color}"></span>`}</span>
          <input type="file" id="wBadge" accept="image/*" style="flex:1">
          ${c.badge?'<button id="wBadgeClr">✕</button>':''}</div></div>
      <div class="sub" style="margin-top:8px">${near.length
        ? "Rival próximo: <b>"+near.map(r=>esc(r.name)).join(", ")+"</b> (vira clássico)"
        : "Sem rival num raio de 35 km."}</div>
      <button class="primary" id="wSave" style="margin-top:10px">Salvar clube</button>`;
    $("wPrest").oninput=e=>{ e.target.previousElementSibling.textContent="Prestígio "+e.target.value; };
    $("wFans").oninput=e=>{ e.target.previousElementSibling.textContent="Torcida "+e.target.value; };
    $("wBadge").onchange=e=>{ const f=e.target.files[0]; if(!f)return; const rd=new FileReader();
      rd.onload=()=>{ c.badge=rd.result; render(); }; rd.readAsDataURL(f); };
    if($("wBadgeClr")) $("wBadgeClr").onclick=()=>{ c.badge=null; render(); };
    $("wSave").onclick=()=>{
      c.name=$("wName").value.trim()||c.name;
      c.short=($("wShort").value.trim()||c.short).toUpperCase().slice(0,4);
      c.city=$("wCity").value.trim()||c.city;
      c.cityPop=Math.max(1000,+$("wPop").value||c.cityPop);
      c.founded=+$("wFound").value||c.founded;
      c.color=$("wColor").value;
      c.prestige=+$("wPrest").value; c.fans=+$("wFans").value;
      const S=C.stadiumOf(c);
      S.name=$("wStad").value.trim()||S.name;
      S.capacity=Math.max(2000,+$("wCap").value||S.capacity);
      if(c.kitDesign) c.kitDesign.shirt=c.color;
      opts.onChange&&opts.onChange();
      render();
    };
  }
  function panePlayers(){
    const c=C.clubById(world,sel);
    if(!canEditPlayers){
      $("wePane").innerHTML=`<div class="sub" style="padding:14px">
        A edição de jogadores só está disponível <b>antes de iniciar a carreira</b>
        (menu → Editor de mundo). Assim ninguém muda atributos com o campeonato rolando.</div>`;
      return;
    }
    const squad=c.squad.slice().sort((a,b)=>b.overall-a.overall);
    $("wePane").innerHTML=`<div class="sub">Clique num jogador para editar atributos.</div>
      <div class="we-players" id="wePlayers">${squad.map(p=>`
        <div class="cb-item" data-p="${p.id}">
          <span class="muted" style="width:34px">${p.pos}</span>
          <span class="nm">${C.flagOf(p)} ${esc(p.name)}</span>
          <span class="muted">${p.age}a</span>
          <span style="font-weight:700">${p.overall}</span></div>`).join("")}</div>
      <div id="wePlayerForm"></div>`;
    $("wePlayers").querySelectorAll("[data-p]").forEach(r=> r.onclick=()=>playerForm(c, +r.dataset.p));
  }
  function playerForm(club, pid){
    const p=club.squad.find(x=>x.id===pid); if(!p) return;
    const natOpts=Object.entries(C.NATIONS).map(([k,n])=>
      `<option value="${k}" ${p.nat===k?"selected":""}>${n.flag} ${n.name}</option>`).join("");
    const posOpts=C.SLOT_LIST.map(s=>`<option value="${s}" ${p.pos===s?"selected":""}>${s}</option>`).join("");
    $("wePlayerForm").innerHTML=`<div class="we-form">
      <div class="row2"><label>Nome</label><input id="pName" value="${esc(p.name)}"></div>
      <div class="row2"><label>Posição</label><select id="pPos">${posOpts}</select></div>
      <div class="row2"><label>Nacionalidade</label><select id="pNat">${natOpts}</select></div>
      <div class="row2"><label>Idade</label><input id="pAge" type="number" min="15" max="45" value="${p.age}"></div>
      <div class="row2"><label>Potencial ${p.potential}</label><input type="range" id="pPot" min="30" max="99" value="${p.potential}"></div>
      ${C.ATTRS.map(a=>`<div class="row2"><label>${C.ATTR_PT[a]} <b id="lab_${a}">${Math.round(p.attrs[a])}</b></label>
        <input type="range" data-a="${a}" min="20" max="99" value="${Math.round(p.attrs[a])}"></div>`).join("")}
      <button class="primary" id="pSave" style="margin-top:8px">Salvar jogador</button></div>`;
    $("wePlayerForm").querySelectorAll("[data-a]").forEach(i=> i.oninput=e=>{
      $("lab_"+e.target.dataset.a).textContent=e.target.value; });
    $("pPot").oninput=e=>{ e.target.previousElementSibling.innerHTML="Potencial "+e.target.value; };
    $("pSave").onclick=()=>{
      p.name=$("pName").value.trim()||p.name;
      p.pos=$("pPos").value; p.nat=$("pNat").value;
      p.age=Math.max(15,Math.min(45,+$("pAge").value||p.age));
      $("wePlayerForm").querySelectorAll("[data-a]").forEach(i=>{ p.attrs[i.dataset.a]=+i.value; });
      p.overall=C.overall(p);
      p.potential=Math.max(p.overall, +$("pPot").value);
      p.wage=C.wageFor(p);
      opts.onChange&&opts.onChange();
      panePlayers();
    };
  }
  render();
}
