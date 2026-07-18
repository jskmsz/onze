/* =====================================================================
   ONZE — brands.js
   Banco de marcas + slots de patrocínio + cálculo de valor + contratos.
   Sem dependência de navegador (exceto os logos SVG, que são strings).
   ===================================================================== */

export const REACH_ORDER = ["local","regional","nacional","continental","mundial"];
export const reachTier = r => Math.max(0, REACH_ORDER.indexOf(r));
export const REACH_PT = {local:"Local", regional:"Regional", nacional:"Nacional",
  continental:"Continental", mundial:"Mundial"};

/* ---------- Slots: onde o logo aparece e quanto isso vale ----------
   `w` = peso do slot (predominância). pos/size são normalizados (0-1)
   sobre a imagem do uniforme, usados pelo editor de kit.               */
/* pos/size normalizados sobre a IMAGEM inteira do uniforme (medidos no PNG real:
   camisa ocupa x0–0.54 e y0–0.613; calção fica em x0.545–0.99 / y0.60–0.98) */
export const SPONSOR_SLOTS = {
  material:{l:"Fornecedor de material", w:0.85, kind:"supplier",
            pos:{x:0.170,y:0.158}, size:0.058, area:"shirt"},
  frente:  {l:"Máster (peito)",         w:1.00, kind:"sponsor",
            pos:{x:0.270,y:0.300}, size:0.210, area:"shirt"},
  meio:    {l:"Meio do peito",          w:0.60, kind:"sponsor",
            pos:{x:0.270,y:0.232}, size:0.125, area:"shirt"},
  baixo:   {l:"Barra do peito",         w:0.42, kind:"sponsor",
            pos:{x:0.270,y:0.440}, size:0.110, area:"shirt"},
  ombro:   {l:"Linha do ombro",         w:0.34, kind:"sponsor",
            pos:{x:0.270,y:0.108}, size:0.095, area:"shirt"},
  mangaE:  {l:"Manga esquerda",         w:0.30, kind:"sponsor",
            pos:{x:0.062,y:0.242}, size:0.068, area:"shirt"},
  mangaD:  {l:"Manga direita",          w:0.30, kind:"sponsor",
            pos:{x:0.480,y:0.242}, size:0.068, area:"shirt"},
  calcao:  {l:"Calção",                 w:0.28, kind:"sponsor",
            pos:{x:0.770,y:0.790}, size:0.085, area:"shorts"},
  naming:  {l:"Naming rights do estádio", w:1.30, kind:"stadium"},
  placas:  {l:"Placas de publicidade",    w:0.55, kind:"stadium"},
};
export const SLOT_KEYS = Object.keys(SPONSOR_SLOTS);
/* slots que aparecem desenhados no uniforme */
export const KIT_SLOTS = SLOT_KEYS.filter(k=>SPONSOR_SLOTS[k].area);

/* ---------- Marcas ----------
   country: "dou" (Dournéa) ou estrangeira. reach define até onde a marca
   é conhecida — marca local não patrocina clube continental, e vice-versa.
   Estes são placeholders: troque `logo` por um PNG seu quando quiser.   */
const B = (id,name,short,color,prestige,reach,country,size,kind)=>
  ({id,name,short,color,prestige,reach,country,size,kind,logo:null});

export const BRANDS = [
  /* --- fornecedores de material --- */
  B("kelt",    "Kelt Sportswear",   "KELT",   "#111827", 92, "mundial",     "int", 94, "supplier"),
  B("vanguard","Vanguard Athletic", "VNGRD",  "#dc2626", 88, "mundial",     "int", 90, "supplier"),
  B("aurora",  "Aurora Sport",      "AURORA", "#0284c7", 74, "continental", "int", 72, "supplier"),
  B("morvane", "Morvane Équipement","MORVANE","#15803d", 58, "nacional",    "dou", 55, "supplier"),
  B("gwazh",   "Gwazh Sport",       "GWAZH",  "#7c3aed", 40, "regional",    "dou", 38, "supplier"),

  /* --- patrocinadores globais --- */
  B("nordair", "NordAir",           "NORDAIR","#1d4ed8", 95, "mundial",     "int", 96, "sponsor"),
  B("volstra", "Volstra Motors",    "VOLSTRA","#111827", 90, "mundial",     "int", 92, "sponsor"),
  B("zenith",  "Zenith Electronics","ZENITH", "#0891b2", 86, "mundial",     "int", 88, "sponsor"),
  B("globalq", "GlobalBanq",        "GLOBALQ","#065f46", 82, "continental", "int", 85, "sponsor"),
  B("petrum",  "Petrum Energy",     "PETRUM", "#b45309", 78, "continental", "int", 84, "sponsor"),

  /* --- nacionais (Dournéa) --- */
  B("dtel",    "Dournéa Télécom",   "D-TÉL",  "#e11d48", 70, "nacional",    "dou", 72, "sponsor"),
  B("bkerv",   "Banque Kervadan",   "BANQUE", "#1e3a8a", 68, "nacional",    "dou", 70, "sponsor"),
  B("ysass",   "Ys Assurances",     "YS",     "#0d9488", 62, "nacional",    "dou", 64, "sponsor"),
  B("celten",  "Celtic Énergie",    "CELTEN", "#16a34a", 60, "nacional",    "dou", 62, "sponsor"),
  B("mordis",  "Mor Distribution",  "MOR-D",  "#f59e0b", 56, "nacional",    "dou", 58, "sponsor"),

  /* --- regionais --- */
  B("gwenn",   "Brasserie Gwenn",   "GWENN",  "#a16207", 44, "regional",    "dou", 42, "sponsor"),
  B("marlav",  "Morlaven Marítima", "MARLAV", "#0369a1", 42, "regional",    "dou", 44, "sponsor"),
  B("tregagro","Tregonan Agro",     "TREGAGRO","#4d7c0f",38, "regional",    "dou", 40, "sponsor"),
  B("roczh",   "Roc'h Construção",  "ROC'H",  "#475569", 36, "regional",    "dou", 38, "sponsor"),

  /* --- locais --- */
  B("kerpad",  "Padaria Kerdrec'h", "KERPAD", "#92400e", 20, "local",       "dou", 18, "sponsor"),
  B("aravpn",  "Pneus Aravon",      "PNEUS",  "#334155", 22, "local",       "dou", 22, "sponsor"),
  B("peixys",  "Peixaria do Porto", "PEIXARIA","#0e7490",18, "local",       "dou", 16, "sponsor"),
  B("lanbar",  "Bar Lannedis",      "LAN-BAR","#7c2d12", 15, "local",       "dou", 14, "sponsor"),
];
export const brandById = id => BRANDS.find(b=>b.id===id);
/* cópia dos placeholders, para poder "restaurar padrão" */
export const BUILTIN_BRANDS = BRANDS.map(b=>({...b}));

/* ---------- Banco de marcas: normalizar, importar, exportar ----------
   Para MUITAS marcas (centenas/milhares) o ideal é o logo ser um ARQUIVO
   (`logo:"assets/brands/logos/x.png"`) e não um data-URI: o save continua
   pequeno e só os logos realmente usados são carregados.               */
export const BRAND_FIELDS = ["id","name","short","kind","prestige","reach","country","size","color","logo","sector"];

const slug = s => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")
  .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,40);

export function normalizeBrand(raw, i=0){
  const num=(v,d)=>{ const n=Number(v); return Number.isFinite(n)?Math.max(1,Math.min(100,n)):d; };
  const name=String(raw.name||raw.nome||("Marca "+(i+1))).trim();
  const reach=String(raw.reach||raw.alcance||"nacional").toLowerCase().trim();
  const kind=String(raw.kind||raw.tipo||"sponsor").toLowerCase().trim();
  return {
    id: slug(raw.id||name)|| ("marca"+i),
    name,
    short: String(raw.short||raw.sigla||name).toUpperCase().slice(0,12),
    kind: kind==="supplier"||kind==="material"||kind==="fornecedor" ? "supplier" : "sponsor",
    prestige: num(raw.prestige??raw.prestigio, 50),
    reach: REACH_ORDER.includes(reach) ? reach : "nacional",
    country: String(raw.country||raw.pais||"dou").toLowerCase().trim(),
    size: num(raw.size??raw.porte, 50),
    color: String(raw.color||raw.cor||"#334155"),
    logo: raw.logo ? String(raw.logo) : null,     // caminho de arquivo OU data-URI
    sector: raw.sector||raw.setor||"",
  };
}
/* troca o banco inteiro mantendo a MESMA referência do array
   (core.js e app.js importam BRANDS estaticamente) */
export function setBrands(list){
  const norm=(list||[]).map(normalizeBrand).filter(b=>b.name);
  const seen=new Set(); const out=[];
  for(const b of norm){ let id=b.id, n=2;
    while(seen.has(id)) id=b.id+"-"+(n++);
    seen.add(id); out.push({...b, id});
  }
  BRANDS.length=0; out.forEach(b=>BRANDS.push(b));
  return BRANDS.length;
}
export const brandsToJSON = () => JSON.stringify(BRANDS, null, 1);

/* ---- CSV (para editar centenas de marcas numa planilha) ---- */
export function brandsToCSV(){
  const esc=v=>{ const s=String(v??""); return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; };
  return [BRAND_FIELDS.join(",")]
    .concat(BRANDS.map(b=>BRAND_FIELDS.map(f=>esc(b[f])).join(",")))
    .join("\n");
}
export function parseBrandsCSV(text){
  const rows=[]; let row=[], cell="", q=false;
  const s=String(text).replace(/\r\n?/g,"\n");
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(q){
      if(ch==='"' && s[i+1]==='"'){ cell+='"'; i++; }
      else if(ch==='"') q=false;
      else cell+=ch;
    } else if(ch==='"') q=true;
    else if(ch===","||ch===";"){ row.push(cell); cell=""; }
    else if(ch==="\n"){ row.push(cell); rows.push(row); row=[]; cell=""; }
    else cell+=ch;
  }
  if(cell||row.length){ row.push(cell); rows.push(row); }
  if(!rows.length) return [];
  const head=rows.shift().map(h=>h.trim().toLowerCase());
  return rows.filter(r=>r.some(c=>String(c).trim()))
    .map(r=>{ const o={}; head.forEach((h,i)=>o[h]=String(r[i]??"").trim()); return o; });
}

/* Logo: se a marca tiver PNG enviado usa ele; senão gera um wordmark SVG
   (fundo transparente, recolorível — é o mesmo contrato de um PNG seu). */
export function brandLogo(brand, color){
  if(brand.logo) return brand.logo;                     // PNG enviado pelo usuário
  const c = color || brand.color;
  const t = (brand.short||brand.name).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60">`
    + `<text x="110" y="43" text-anchor="middle" font-family="Arial Black, Arial, sans-serif"`
    + ` font-size="34" font-weight="900" letter-spacing="0.5" fill="${c}">${t}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

/* ---------- Quem topa patrocinar quem ----------
   A marca precisa jogar no mesmo "nível" do clube (±1 degrau de alcance).
   Marca estrangeira pequena não atravessa a fronteira.                  */
export function canSponsor(clubReachKey, brand){
  const ct = reachTier(clubReachKey), bt = reachTier(brand.reach);
  if(brand.country !== "dou" && bt < 3) return false;   // estrangeira só se for grande
  return Math.abs(bt - ct) <= 1;
}

/* Valor por rodada: prestígio do clube × prestígio e porte da marca × peso do slot */
export function slotOffer(clubPrestige, brand, slotKey){
  const S = SPONSOR_SLOTS[slotKey]; if(!S) return 0;
  const v = Math.pow(clubPrestige||55, 1.45)
          * (brand.prestige/55) * (brand.size/55) * S.w * 100;
  return Math.round(v/1000)*1000;
}

/* Gera as propostas da temporada (2–3 marcas elegíveis por slot livre) */
export function makeOffers(club, clubReachKey){
  const out={};
  for(const k of SLOT_KEYS){
    const S=SPONSOR_SLOTS[k];
    const pool=BRANDS.filter(b=>
      (S.kind==="supplier" ? b.kind==="supplier" : b.kind==="sponsor") &&
      canSponsor(clubReachKey,b));
    if(!pool.length){ out[k]=[]; continue; }
    const shuffled=pool.slice().sort(()=>Math.random()-0.5).slice(0,3);
    out[k]=shuffled.map(b=>({
      brandId:b.id,
      perRound:slotOffer(club.prestige,b,k),
      seasons: 1+Math.floor(Math.random()*3),
    }));
  }
  return out;
}

/* ---------- Contratos ---------- */
export function signSponsor(club, slotKey, offer){
  club.sponsors = club.sponsors || {};
  club.sponsors[slotKey] = {brandId:offer.brandId, perRound:offer.perRound,
    seasonsLeft:offer.seasons, logoColor:null};
  return club.sponsors[slotKey];
}
export function dropSponsor(club, slotKey){
  if(club.sponsors) delete club.sponsors[slotKey];
}
export const sponsorIncome = club =>
  Object.values(club.sponsors||{}).reduce((s,c)=>s+(c.perRound||0),0);
/* no fim da temporada os contratos correm */
export function tickContracts(club){
  const expired=[];
  for(const [k,c] of Object.entries(club.sponsors||{})){
    c.seasonsLeft--;
    if(c.seasonsLeft<=0){ expired.push({slot:k, brandId:c.brandId}); delete club.sponsors[k]; }
  }
  return expired;
}
