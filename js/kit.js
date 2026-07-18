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
  solid:  "Lisa",
  stripes:"Listras verticais",
  hoops:  "Faixas horizontais",
  sash:   "Faixa diagonal",
  halves: "Metades",
  center: "Faixa central",
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
  logoTint:{},          // slotKey -> cor forçada do logo (ou null = cor da marca)
});

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
  if(d.pattern==="stripes"){ const n=7; for(let i=0;i<n;i++) if(i%2) g.fillRect(x+i*w/n,y,w/n,h); }
  else if(d.pattern==="hoops"){ const n=9; for(let i=0;i<n;i++) if(i%2) g.fillRect(x,y+i*h/n,w,h/n); }
  else if(d.pattern==="halves"){ g.fillRect(x+w/2,y,w/2,h); }
  else if(d.pattern==="center"){ g.fillRect(x+w*0.40,y,w*0.20,h); }
  else if(d.pattern==="sash"){
    g.translate(x+w/2,y+h/2); g.rotate(-0.62);
    g.fillRect(-w*0.13,-h,w*0.26,h*2);
  }
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

/* escudo + logos dos patrocinadores */
async function drawDecals(ctx,W,H,club,d,opts){
  // escudo
  if(club.badge && d.badge && BADGE_POS[d.badge]){
    const B=BADGE_POS[d.badge];
    try{
      const img=await loadImage(club.badge);
      const s=B.size*W;
      ctx.drawImage(img, B.x*W-s/2, B.y*H-s/2, s, s);
    }catch(e){ /* escudo inválido: ignora */ }
  }
  // patrocinadores contratados
  const contracts=club.sponsors||{};
  for(const key of KIT_SLOTS){
    const ct=contracts[key]; if(!ct) continue;
    const S=SPONSOR_SLOTS[key], brand=brandById(ct.brandId); if(!brand) continue;
    const tint=(d.logoTint&&d.logoTint[key])||null;
    try{
      const c=await tintedLogo(brandLogo(brand, tint||undefined), tint);
      const wpx=S.size*W, hpx=wpx*(c.height/c.width);
      ctx.drawImage(c, S.pos.x*W-wpx/2, S.pos.y*H-hpx/2, wpx, hpx);
    }catch(e){ /* ignora logo com problema */ }
  }
  // marcador do slot em edição
  if(opts.highlight && SPONSOR_SLOTS[opts.highlight]?.pos){
    const S=SPONSOR_SLOTS[opts.highlight];
    ctx.strokeStyle="#d29922"; ctx.lineWidth=Math.max(2,W*0.004); ctx.setLineDash([6,4]);
    const wpx=S.size*W, hpx=wpx*0.30;
    ctx.strokeRect(S.pos.x*W-wpx/2, S.pos.y*H-hpx/2, wpx, hpx);
    ctx.setLineDash([]);
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
