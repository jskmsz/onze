/* =====================================================================
   ONZE — kit.js
   Desenha o uniforme num <canvas>: pega o PNG branco de base, pinta cada
   peça (camisa / calção / meião) com multiply (mantém as sombras do
   tecido), aplica o padrão, e por cima cola escudo e logos dos
   patrocinadores — com opção de recolorir o logo.
   ===================================================================== */
import { SPONSOR_SLOTS, KIT_SLOTS, brandById, brandLogo } from "./brands.js";

export const KIT_TEMPLATES = {
  lisa: {l:"Gola careca", src:"assets/kits/base-lisa.png"},
  gola: {l:"Com gola polo", src:"assets/kits/base-gola.png"},
};
/* caixas normalizadas de cada peça — medidas nos PNGs reais (1888x2222):
   camisa x0–0.54 / y0–0.613 · meião x0.545–0.98 / y0.07–0.595 · calção y0.60–0.98 */
export const REGIONS = {
  shirt:  {x:0.000, y:0.000, w:0.545, h:0.630},
  socks:  {x:0.545, y:0.000, w:0.455, h:0.602},
  shorts: {x:0.545, y:0.602, w:0.455, h:0.398},
};
export const PATTERNS = {
  solid:    "Lisa",
  stripes:  "Listras verticais",
  pinstripe:"Listras finas",
  hoops:    "Faixas horizontais",
  hoopsThin:"Faixas finas",
  sash:     "Faixa diagonal",
  sashD:    "Faixa diagonal (dupla)",
  halves:   "Metades",
  quarters: "Quartos",
  center:   "Faixa central",
  chevron:  "Chevron (V)",
  shoulders:"Ombros",
  checker:  "Xadrez",
  gradient: "Degradê",
  waves:    "Ondas",
};
export const BADGE_POS = {
  esq:  {l:"Peito esquerdo", x:0.175, y:0.160, size:0.070},
  dir:  {l:"Peito direito",  x:0.368, y:0.160, size:0.070},
  meio: {l:"Meio do peito",  x:0.270, y:0.150, size:0.080},
};

/* kit padrão de um clube novo */
export const defaultKitDesign = (club, alt=false) => ({
  template:"lisa",
  pattern:"solid",
  shirt: alt ? "#f5f7fa" : (club.color||"#1f6feb"),
  shorts: alt ? "#f5f7fa" : "#ffffff",
  socks: alt ? "#f5f7fa" : (club.color||"#1f6feb"),
  detail:"#ffffff",
  badge:"dir",              // à direita p/ não colidir com o logo do fornecedor
  badgeSize:null,           // null = tamanho padrão
  logoTint:{},              // slotKey -> cor forçada do logo (ou null = cor da marca)
  slots:{},                 // slotKey -> {x,y,size} sobrescrevendo o padrão
  number:{show:true, x:0.770, y:0.700, size:0.075, color:"#ffffff"},  // número no calção
});
/* posição/tamanho efetivos de um slot (respeita o que você arrastou) */
export function slotBox(design, key, def){
  const o=(design.slots&&design.slots[key])||{};
  return { x:o.x??def.pos.x, y:o.y??def.pos.y, size:o.size??def.size };
}

/* ---------- carregamento de imagens (com cache) ---------- */
const _cache=new Map();
export function loadImage(src){
  if(_cache.has(src)) return _cache.get(src);
  const p=new Promise((res,rej)=>{
    const i=new Image();
    i.onload=()=>res(i);
    i.onerror=()=>rej(new Error("não carregou: "+src));
    i.src=src;
  });
  _cache.set(src,p);
  return p;
}
export async function templateAvailable(key){
  try{ await loadImage(KIT_TEMPLATES[key].src); return true; }catch(e){ return false; }
}

/* recolore um logo mantendo a transparência (source-in pinta só o desenho) */
async function tintedLogo(src, color){
  const img=await loadImage(src);
  const c=document.createElement("canvas");
  c.width=img.naturalWidth||220; c.height=img.naturalHeight||60;
  const g=c.getContext("2d");
  g.drawImage(img,0,0,c.width,c.height);
  if(color){
    g.globalCompositeOperation="source-in";
    g.fillStyle=color; g.fillRect(0,0,c.width,c.height);
  }
  return c;
}

/* ---------- camada de tinta: cores + padrão, tudo chapado ---------- */
function paintLayer(W,H,d){
  const c=document.createElement("canvas"); c.width=W; c.height=H;
  const g=c.getContext("2d");
  const R=(r)=>[r.x*W, r.y*H, r.w*W, r.h*H];
  // peças simples
  const [sx,sy,sw,sh]=R(REGIONS.shorts); g.fillStyle=d.shorts; g.fillRect(sx,sy,sw,sh);
  const [kx,ky,kw,kh]=R(REGIONS.socks);  g.fillStyle=d.socks;  g.fillRect(kx,ky,kw,kh);
  // camisa + padrão
  const [x,y,w,h]=R(REGIONS.shirt);
  g.fillStyle=d.shirt; g.fillRect(x,y,w,h);
  g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip();
  g.fillStyle=d.detail;
  const P=d.pattern;
  if(P==="stripes"){ const n=7; for(let i=0;i<n;i++) if(i%2) g.fillRect(x+i*w/n,y,w/n,h); }
  else if(P==="pinstripe"){ const n=19; for(let i=0;i<n;i++) if(i%2) g.fillRect(x+i*w/n,y,w/n*0.55,h); }
  else if(P==="hoops"){ const n=9; for(let i=0;i<n;i++) if(i%2) g.fillRect(x,y+i*h/n,w,h/n); }
  else if(P==="hoopsThin"){ const n=21; for(let i=0;i<n;i++) if(i%2) g.fillRect(x,y+i*h/n,w,h/n*0.6); }
  else if(P==="halves"){ g.fillRect(x+w/2,y,w/2,h); }
  else if(P==="quarters"){ g.fillRect(x+w/2,y,w/2,h/2); g.fillRect(x,y+h/2,w/2,h/2); }
  else if(P==="center"){ g.fillRect(x+w*0.40,y,w*0.20,h); }
  else if(P==="sash"){ g.translate(x+w/2,y+h/2); g.rotate(-0.62); g.fillRect(-w*0.13,-h,w*0.26,h*2); }
  else if(P==="sashD"){ g.save(); g.translate(x+w/2,y+h/2); g.rotate(-0.62);
      g.fillRect(-w*0.30,-h,w*0.16,h*2); g.fillRect(w*0.06,-h,w*0.16,h*2); g.restore(); }
  else if(P==="chevron"){ const n=5;
      for(let i=0;i<n;i++){ const yy=y+h*(0.12+i*0.17);
        g.beginPath(); g.moveTo(x,yy); g.lineTo(x+w/2,yy+h*0.09); g.lineTo(x+w,yy);
        g.lineTo(x+w,yy+h*0.05); g.lineTo(x+w/2,yy+h*0.14); g.lineTo(x,yy+h*0.05); g.closePath(); g.fill(); } }
  else if(P==="shoulders"){ g.fillRect(x,y,w,h*0.16);
      g.fillRect(x,y,w*0.13,h*0.42); g.fillRect(x+w*0.87,y,w*0.13,h*0.42); }
  else if(P==="checker"){ const n=8, m=10;
      for(let i=0;i<n;i++) for(let j=0;j<m;j++) if((i+j)%2) g.fillRect(x+i*w/n,y+j*h/m,w/n,h/m); }
  else if(P==="gradient"){ const gr=g.createLinearGradient(x,y,x,y+h);
      gr.addColorStop(0,d.detail); gr.addColorStop(1,"rgba(0,0,0,0)");
      g.fillStyle=gr; g.fillRect(x,y,w,h); }
  else if(P==="waves"){ const n=7;
      for(let i=0;i<n;i++){ const yy=y+h*(i+0.5)/n;
        g.beginPath(); g.moveTo(x,yy);
        for(let px=0;px<=w;px+=w/24) g.lineTo(x+px, yy+Math.sin(px/w*Math.PI*4)*h*0.022);
        g.lineTo(x+w,yy+h*0.045);
        for(let px=w;px>=0;px-=w/24) g.lineTo(x+px, yy+h*0.045+Math.sin(px/w*Math.PI*4)*h*0.022);
        g.closePath(); g.fill(); } }
  g.restore();
  return c;
}

/* ---------- desenho principal ---------- */
export async function renderKit(canvas, club, design, opts={}){
  const ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  const d=design;
  ctx.clearRect(0,0,W,H);

  let base=null;
  try{ base=await loadImage(KIT_TEMPLATES[d.template]?.src || KIT_TEMPLATES.lisa.src); }
  catch(e){ base=null; }

  if(base){
    ctx.drawImage(base,0,0,W,H);                 // tecido branco com sombras
    ctx.globalCompositeOperation="multiply";
    ctx.drawImage(paintLayer(W,H,d),0,0);        // pinta preservando as dobras
    ctx.globalCompositeOperation="destination-in";
    ctx.drawImage(base,0,0,W,H);                 // devolve o recorte (fundo transparente)
    ctx.globalCompositeOperation="source-over";
  } else {
    drawFallback(ctx,W,H,d);                     // sem PNG ainda: silhuetas simples
  }
  await drawDecals(ctx,W,H,club,d,opts);
  return !!base;
}

/* silhuetas vetoriais caso o PNG base ainda não esteja na pasta */
function drawFallback(ctx,W,H,d){
  const paint=paintLayer(W,H,d);
  const mask=document.createElement("canvas"); mask.width=W; mask.height=H;
  const m=mask.getContext("2d");
  m.fillStyle="#fff";
  // camisa
  m.beginPath();
  m.moveTo(0.09*W,0.14*H); m.lineTo(0.20*W,0.05*H); m.lineTo(0.35*W,0.05*H); m.lineTo(0.46*W,0.14*H);
  m.lineTo(0.40*W,0.25*H); m.lineTo(0.40*W,0.66*H); m.lineTo(0.15*W,0.66*H); m.lineTo(0.15*W,0.25*H);
  m.closePath(); m.fill();
  // calção
  m.fillRect(0.60*W,0.66*H,0.34*W,0.28*H);
  // meiões
  m.fillRect(0.63*W,0.06*H,0.11*W,0.46*H);
  m.fillRect(0.80*W,0.06*H,0.11*W,0.46*H);
  m.globalCompositeOperation="source-in"; m.drawImage(paint,0,0);
  ctx.drawImage(mask,0,0);
}

/* onde cada elemento arrastável está agora (usado pelo editor p/ hit-test) */
export function decalBoxes(club, d){
  const out=[];
  if(club.badge && d.badge && BADGE_POS[d.badge]){
    const B=BADGE_POS[d.badge], s=(d.badgeSize??B.size);
    out.push({key:"__badge", label:"Escudo", x:B.x, y:B.y, w:s, h:s});
  }
  for(const key of KIT_SLOTS){
    if(!(club.sponsors||{})[key]) continue;
    const b=slotBox(d,key,SPONSOR_SLOTS[key]);
    out.push({key, label:SPONSOR_SLOTS[key].l, x:b.x, y:b.y, w:b.size, h:b.size*0.32});
  }
  if(d.number&&d.number.show)
    out.push({key:"__number", label:"Número", x:d.number.x, y:d.number.y, w:d.number.size, h:d.number.size});
  return out;
}

/* escudo + logos dos patrocinadores + número */
async function drawDecals(ctx,W,H,club,d,opts){
  // escudo
  if(club.badge && d.badge && BADGE_POS[d.badge]){
    const B=BADGE_POS[d.badge];
    try{
      const img=await loadImage(club.badge);
      const s=(d.badgeSize??B.size)*W;
      ctx.drawImage(img, B.x*W-s/2, B.y*H-s/2, s, s);
    }catch(e){ /* escudo inválido: ignora */ }
  }
  // patrocinadores contratados
  const contracts=club.sponsors||{};
  for(const key of KIT_SLOTS){
    const ct=contracts[key]; if(!ct) continue;
    const S=SPONSOR_SLOTS[key], brand=brandById(ct.brandId); if(!brand) continue;
    const tint=(d.logoTint&&d.logoTint[key])||null;
    const box=slotBox(d,key,S);
    try{
      let src=brandLogo(brand, tint||undefined);
      try{ await loadImage(src); }
      catch(e){ src=brandLogo({...brand, logo:null}, tint||undefined); }   // PNG faltando → wordmark
      const c=await tintedLogo(src, tint);
      const wpx=box.size*W, hpx=wpx*(c.height/c.width);
      ctx.drawImage(c, box.x*W-wpx/2, box.y*H-hpx/2, wpx, hpx);
    }catch(e){ /* ignora logo com problema */ }
  }
  // número do jogador (no calção)
  if(d.number && d.number.show){
    const n=d.number, px=n.size*W;
    ctx.save();
    ctx.font=`900 ${px}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.lineWidth=px*0.14; ctx.strokeStyle="rgba(0,0,0,.35)";
    ctx.strokeText(String(opts.number??10), n.x*W, n.y*H);
    ctx.fillStyle=n.color||"#fff";
    ctx.fillText(String(opts.number??10), n.x*W, n.y*H);
    ctx.restore();
  }
  // marcador do elemento selecionado
  if(opts.highlight){
    const b=decalBoxes(club,d).find(x=>x.key===opts.highlight);
    if(b){
      ctx.strokeStyle="#d29922"; ctx.lineWidth=Math.max(2,W*0.005); ctx.setLineDash([7,5]);
      ctx.strokeRect(b.x*W-b.w*W/2, b.y*H-b.h*W/2, b.w*W, b.h*W);
      ctx.setLineDash([]);
    }
  }
}

/* ---------- conflito de cores entre os times ---------- */
function hexRGB(h){ const n=parseInt((h||"#888").slice(1),16);
  return [(n>>16)&255,(n>>8)&255,n&255]; }
export function colorDistance(a,b){
  const A=hexRGB(a),B=hexRGB(b);
  return Math.sqrt((A[0]-B[0])**2+(A[1]-B[1])**2+(A[2]-B[2])**2);
}
/* devolve qual kit o visitante usa: troca para o 2º se as camisas se parecem */
export function pickKits(home, away){
  const h=home.kitDesign||defaultKitDesign(home);
  const a1=away.kitDesign||defaultKitDesign(away);
  const a2=away.kitDesignAlt||defaultKitDesign(away,true);
  const clash=colorDistance(h.shirt,a1.shirt)<110;
  return {home:h, away:clash?a2:a1, clashed:clash};
}
