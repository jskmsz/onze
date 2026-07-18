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
  ({id,name,short,color,prestige,reach,country,size,kind,logo: `/assets/brands/logos/${id}.png`});


/* 
  Campos da função B: 
  1. id (string)
  2. name (string)
  3. short (string)
  4. color (string hex)
  5. prestige (number 1-100)
  6. reach (string: local, regional, nacional, continental, mundial)
  7. country (string: "dou" ou "int")
  8. size (number 1-100)
  9. kind (string: "sponsor" ou "supplier")
*/

export const BRANDS = [
  /* =========================================
     FORNECEDORES DE MATERIAL (SUPPLIERS)
  ========================================= */
  
  /* --- Reais (Mundiais / Internacionais) --- */
  B("adidas",      "Adidas",             "ADIDAS",      "#000000", 99, "mundial",     "int", 99, "supplier"),
  B("nike",        "Nike",               "NIKE",        "#000000", 99, "mundial",     "int", 99, "supplier"),
  B("puma",        "Puma",               "PUMA",        "#000000", 96, "mundial",     "int", 97, "supplier"),
  B("umbro",       "Umbro",              "UMBRO",       "#000000", 88, "mundial",     "int", 85, "supplier"),
  B("under armour", "Under Armour",       "UNDER ARMOUR","#000000", 92, "mundial",     "int", 94, "supplier"),
  B("reebok",      "Reebok",             "REEBOK",      "#e11d48", 85, "mundial",     "int", 88, "supplier"),
  B("kappa",       "Kappa",              "KAPPA",       "#000000", 86, "mundial",     "int", 82, "supplier"),
  B("macron",      "Macron",             "MACRON",      "#1e3a8a", 84, "mundial",     "int", 80, "supplier"),
  B("joma",        "Joma",               "JOMA",        "#000000", 83, "mundial",     "int", 82, "supplier"),
  B("le coq sportif",       "Le Coq Sportif",     "LE COQ",      "#000000", 82, "mundial",     "int", 80, "supplier"),
  B("newbalance",  "New Balance",        "NEW BALANCE", "#dc2626", 90, "mundial",     "int", 92, "supplier"),
  B("castore",     "Castore",            "CASTORE",     "#111827", 80, "mundial",     "int", 82, "supplier"),
  B("hummel",      "Hummel",             "HUMMEL",      "#dc2626", 81, "mundial",     "int", 78, "supplier"),
  B("kelme",       "Kelme",              "KELME",       "#16a34a", 76, "continental", "int", 72, "supplier"),
  B("jako",        "Jako",               "JAKO",        "#1d4ed8", 78, "continental", "int", 75, "supplier"),
  B("diadora",     "Diadora",            "DIADORA",     "#000000", 80, "mundial",     "int", 76, "supplier"),
  B("fila",        "Fila",               "FILA",        "#022c5e", 82, "mundial",     "int", 85, "supplier"),
  B("lotto",       "Lotto",              "LOTTO",       "#dc2626", 78, "continental", "int", 75, "supplier"),
  B("errea",       "Erreà",              "ERREA",       "#000000", 77, "continental", "int", 74, "supplier"),
  B("uhlsport",    "Uhlsport",           "UHLSPORT",    "#000000", 75, "continental", "int", 70, "supplier"),
  B("capelli",     "Capelli Sport",      "CAPELLI",     "#0f766e", 74, "continental", "int", 72, "supplier"),
  B("admiral",     "Admiral",            "ADMIRAL",     "#1e3a8a", 72, "continental", "int", 68, "supplier"),
  B("merooj",      "Merooj",             "MEROOJ",      "#dc2626", 65, "continental", "int", 60, "supplier"),
  B("7saber",      "7SABER",             "7SABER",      "#000000", 60, "regional",    "int", 55, "supplier"),
  B("asics",       "ASICS",              "ASICS",       "#00285e", 85, "mundial",     "int", 88, "supplier"),
  B("mizuno",      "Mizuno",             "MIZUNO",      "#000000", 84, "mundial",     "int", 85, "supplier"),

  /* --- Fictícios (OGF / Dournéa / Listados) --- */
  B("kelt",        "Kelt Sportswear",    "KELT",        "#111827", 92, "mundial",     "int", 94, "supplier"),
  B("vanguard",    "Vanguard Athletic",  "VNGRD",       "#dc2626", 88, "mundial",     "int", 90, "supplier"),
  B("aurora",      "Aurora Sport",       "AURORA",      "#0284c7", 74, "continental", "int", 72, "supplier"),
  B("morvane",     "Morvane Équipement", "MORVANE",     "#15803d", 58, "nacional",    "dou", 55, "supplier"),
  B("gwazh",       "Gwazh Sport",        "GWAZH",       "#7c3aed", 40, "regional",    "dou", 38, "supplier"),
  B("triskell",    "Triskell",           "TRISKELL",    "#f97316", 65, "nacional",    "dou", 60, "supplier"),
  B("mike wings",   "Mike Wings",         "MIKE WINGS",  "#1e3a8a", 55, "continental", "int", 50, "supplier"),
  B("regora",      "Regora",             "REGORA",      "#b45309", 52, "regional",    "int", 50, "supplier"),


  /* =========================================
     PATROCINADORES (SPONSORS)
  ========================================= */

  /* --- Reais (Mundiais / Internacionais) --- */
  B("emirates",    "Emirates",           "EMIRATES",    "#d90a2c", 98, "mundial",     "int", 99, "sponsor"),
  B("beko",        "Beko",               "BEKO",        "#0033a0", 88, "mundial",     "int", 90, "sponsor"),
  B("spotify",     "Spotify",            "SPOTIFY",     "#1db954", 95, "mundial",     "int", 96, "sponsor"),
  B("rakuten",     "Rakuten",            "RAKUTEN",     "#bf0000", 90, "mundial",     "int", 92, "sponsor"),
  B("teamviewer",  "TeamViewer",         "TEAMVIEWER",  "#0055ff", 85, "mundial",     "int", 88, "sponsor"),
  B("standard",    "Standard Chartered", "STANDARD",    "#002b5e", 90, "mundial",     "int", 92, "sponsor"),
  B("chevrolet",   "Chevrolet",          "CHEVROLET",   "#b4975a", 92, "mundial",     "int", 95, "sponsor"),
  B("jeep",        "Jeep",               "JEEP",        "#ffba00", 90, "mundial",     "int", 94, "sponsor"),
  B("pirelli",     "Pirelli",            "PIRELLI",     "#d81e05", 88, "mundial",     "int", 86, "sponsor"),
  B("tmobile",     "T-Mobile",           "T-MOBILE",    "#ea0a8e", 92, "mundial",     "int", 95, "sponsor"),
  B("o2",          "O2",                 "O2",          "#0000ff", 85, "continental", "int", 88, "sponsor"),
  B("vodafone",    "Vodafone",           "VODAFONE",    "#e60000", 94, "mundial",     "int", 95, "sponsor"),
  B("redbull",     "Red Bull",           "RED BULL",    "#dc0a38", 96, "mundial",     "int", 98, "sponsor"),
  B("qatar",       "Qatar Airways",      "QATAR",       "#5c0632", 97, "mundial",     "int", 99, "sponsor"),
  B("etihad",      "Etihad Airways",     "ETIHAD",      "#b4975a", 94, "mundial",     "int", 95, "sponsor"),
  B("allianz",     "Allianz",            "ALLIANZ",     "#003781", 95, "mundial",     "int", 96, "sponsor"),
  B("axa",         "AXA",                "AXA",         "#00008f", 92, "mundial",     "int", 94, "sponsor"),
  B("aia",         "AIA",                "AIA",         "#d31145", 88, "mundial",     "int", 90, "sponsor"),
  B("samsung",     "Samsung",            "SAMSUNG",     "#1428a0", 98, "mundial",     "int", 99, "sponsor"),
  B("sony",        "Sony",               "SONY",        "#000000", 95, "mundial",     "int", 97, "sponsor"),
  B("heineken",    "Heineken",           "HEINEKEN",    "#007a33", 94, "mundial",     "int", 96, "sponsor"),
  B("carlsberg",   "Carlsberg",          "CARLSBERG",   "#00472f", 90, "mundial",     "int", 92, "sponsor"),
  B("cocacola",    "Coca-Cola",          "COCA-COLA",   "#f40009", 99, "mundial",     "int", 99, "sponsor"),
  B("pepsi",       "Pepsi",              "PEPSI",       "#004b93", 98, "mundial",     "int", 98, "sponsor"),
  B("mastercard",  "Mastercard",         "MASTERCARD",  "#eb001b", 97, "mundial",     "int", 98, "sponsor"),
  B("visa",        "Visa",               "VISA",        "#1a1f71", 98, "mundial",     "int", 99, "sponsor"),
  B("santander",   "Santander",          "SANTANDER",   "#ec0000", 93, "mundial",     "int", 95, "sponsor"),
  B("barclays",    "Barclays",           "BARCLAYS",    "#00aeef", 92, "mundial",     "int", 94, "sponsor"),
  B("toyota",      "Toyota",             "TOYOTA",      "#eb0a1e", 98, "mundial",     "int", 99, "sponsor"),
  B("audi",        "Audi",               "AUDI",        "#000000", 95, "mundial",     "int", 97, "sponsor"),
  B("bmw",         "BMW",                "BMW",         "#0066b1", 96, "mundial",     "int", 98, "sponsor"),
  B("mercedes",    "Mercedes-Benz",      "MERCEDES",    "#000000", 97, "mundial",     "int", 98, "sponsor"),
  B("rolex",       "Rolex",              "ROLEX",       "#006039", 99, "mundial",     "int", 99, "sponsor"),
  B("crypto",      "Crypto.com",         "CRYPTO.COM",  "#103f68", 85, "mundial",     "int", 90, "sponsor"),
  B("binance",     "Binance",            "BINANCE",     "#f3ba2f", 86, "mundial",     "int", 92, "sponsor"),
  B("bet365",      "bet365",             "BET365",      "#007a53", 88, "mundial",     "int", 90, "sponsor"),
  B("apple",       "Apple",              "APPLE",       "#000000", 99, "mundial",     "int", 99, "sponsor"),
  B("microsoft",   "Microsoft",          "MICROSOFT",   "#00a4ef", 99, "mundial",     "int", 99, "sponsor"),
  B("google",      "Google",             "GOOGLE",      "#4285f4", 99, "mundial",     "int", 99, "sponsor"),
  B("amazon",      "Amazon",             "AMAZON",      "#ff9900", 98, "mundial",     "int", 99, "sponsor"),
  B("intel",       "Intel",              "INTEL",       "#0071c5", 94, "mundial",     "int", 96, "sponsor"),
  B("oracle",      "Oracle",             "ORACLE",      "#f80000", 92, "mundial",     "int", 95, "sponsor"),
  B("ibm",         "IBM",                "IBM",         "#0f62fe", 93, "mundial",     "int", 96, "sponsor"),
  B("dell",        "Dell",               "DELL",        "#007db8", 90, "mundial",     "int", 94, "sponsor"),
  B("hp",          "HP",                 "HP",          "#0096d6", 90, "mundial",     "int", 93, "sponsor"),
  B("mcdonalds",   "McDonald's",         "MCDONALDS",   "#ffc72c", 98, "mundial",     "int", 99, "sponsor"),
  B("kfc",         "KFC",                "KFC",         "#e51636", 95, "mundial",     "int", 96, "sponsor"),
  B("subway",      "Subway",             "SUBWAY",      "#008c15", 94, "mundial",     "int", 95, "sponsor"),

  /* --- Fictícios / OpenGeofiction Globais (Conforme solicitado) --- */
  B("nordair",     "NordAir",            "NORDAIR",     "#1d4ed8", 95, "mundial",     "int", 96, "sponsor"),
  B("volstra",     "Volstra Motors",     "VOLSTRA",     "#111827", 90, "mundial",     "int", 92, "sponsor"),
  B("zenith",      "Zenith Electronics", "ZENITH",      "#0891b2", 86, "mundial",     "int", 88, "sponsor"),
  B("globalq",     "GlobalBanq",         "GLOBALQ",     "#065f46", 82, "continental", "int", 85, "sponsor"),
  B("petrum",      "Petrum Energy",      "PETRUM",      "#b45309", 78, "continental", "int", 84, "sponsor"),
  
  // Navenna baseados
  B("adta",        "ADTA",               "ADTA",        "#1e3a8a", 88, "mundial",     "int", 92, "sponsor"), 
  B("bloom",       "Bloom",              "BLOOM",       "#e11d48", 86, "mundial",     "int", 89, "sponsor"), 
  B("bmn",         "BMN",                "BMN",         "#b45309", 92, "mundial",     "int", 95, "sponsor"), 
  B("krispy",      "Krispy",             "KRISPY",      "#f59e0b", 78, "mundial",     "int", 80, "sponsor"), 
  B("nasec",       "NASEC",              "NASEC",       "#111827", 88, "mundial",     "int", 90, "sponsor"), 
  B("sbns",        "SBNS",               "SBNS",        "#065f46", 85, "mundial",     "int", 88, "sponsor"), 

  // Izaland baseados
  B("aono foods",        "Aono Foods",         "AONO",        "#dc2626", 80, "mundial",     "int", 85, "sponsor"), 
  B("izaland airlines",  "Izaland Airlines",   "IZALAND",     "#1d4ed8", 85, "mundial",     "int", 88, "sponsor"), 
  B("zheiis",      "Zheiis",             "ZHEIIS",      "#059669", 75, "nacional",    "int", 78, "sponsor"), 

  // Freedemia baseados
  B("mito",        "Mito",               "MITO",        "#be123c", 84, "mundial",     "int", 86, "sponsor"), 
  B("thoughtbite", "Thoughtbite",        "THOUGHTBITE", "#2563eb", 94, "mundial",     "int", 96, "sponsor"), 

  // Mauretia
  B("frotta bar",      "Frotta Bar",         "FROTTA",      "#064e3b", 76, "continental", "int", 78, "sponsor"),

  // Outros ficcionais globais solicitados
  B("atron",       "Atron Electronics",  "ATRON",       "#0f766e", 85, "mundial",     "int", 88, "sponsor"),
  B("binat",       "Binat",              "BINAT",       "#312e81", 78, "continental", "int", 80, "sponsor"),
  B("carlton hotels",     "Carlton Hotels",     "CARLTON",     "#7c3aed", 84, "mundial",     "int", 86, "sponsor"),
  B("ideal",       "Ideal",              "IDEAL",       "#0369a1", 70, "nacional",    "int", 75, "sponsor"),
  B("intercard",   "Intercard",          "INTERCARD",   "#831843", 82, "continental", "int", 85, "sponsor"),
  B("itsnel",      "It'snel",             "ITSNEL",      "#047857", 75, "continental", "int", 77, "sponsor"),
  B("minuks",      "Mi:nuks",             "MINUKS",      "#4f46e5", 72, "nacional",    "int", 75, "sponsor"),
  B("namiki",      "Namiki",             "NAMIKI",      "#4338ca", 76, "continental", "int", 80, "sponsor"),
  B("renashterea", "Renashterea",        "RENASTEREA",  "#a21caf", 65, "nacional",    "int", 68, "sponsor"),
  B("rka",         "RKA",                "RKA",         "#c2410c", 74, "continental", "int", 75, "sponsor"),
  B("sahya",       "Sahya",              "SAHYA",       "#0f766e", 70, "regional",    "int", 72, "sponsor"),
  B("samix",       "Samix",              "SAMIX",       "#1d4ed8", 80, "continental", "int", 82, "sponsor"),
  B("shizau",      "Shizau",             "SHIZAU",      "#9f1239", 77, "continental", "int", 80, "sponsor"),
  B("smosa",       "Smosa",              "SMOSA",       "#1e40af", 72, "nacional",    "int", 74, "sponsor"),
  B("southern",    "Southern",           "SOUTHERN",    "#0369a1", 82, "continental", "int", 85, "sponsor"),
  B("superior",    "Superiór",           "SUPERIÓR",    "#b45309", 84, "mundial",     "int", 88, "sponsor"),
  B("telaus",      "Telaus",             "TELAUS",      "#3f6212", 76, "continental", "dou", 80, "sponsor"),
  B("telemaura",   "Telemaura",          "TELEMAURA",   "#6d28d9", 80, "continental", "int", 85, "sponsor"),
  B("ulano group",       "Ulano Group",        "ULANO",       "#334155", 86, "mundial",     "int", 88, "sponsor"),
  B("ulet",        "Ulet",               "ULET",        "#0284c7", 78, "continental", "int", 80, "sponsor"),
  B("ushop",       "UShop",              "USHOP",       "#ea580c", 82, "mundial",     "int", 85, "sponsor"),
  B("yodoshiya foods",   "Yodoshiya Foods",    "YODOSHIYA",   "#dc2626", 80, "continental", "int", 82, "sponsor"),

  /* --- Dournéa (Nacionais, Regionais e Locais) --- */
  
  // Grandes Patrocinadores Nacionais
  B("bennog",      "Bennog Oil",         "BENNOG",      "#000000", 88, "nacional",    "dou", 92, "sponsor"),
  B("biarfradi",   "Biarfradi",          "BIARFRADI",   "#dc2626", 75, "nacional",    "dou", 80, "sponsor"),
  B("mud",         "Mines d'Uranium de Dournéa",     "M.U.D.",      "#15803d", 90, "nacional",    "dou", 95, "sponsor"),
  B("dtel",        "Dournéa Télécom",    "D-TÉL",       "#e11d48", 70, "nacional",    "dou", 72, "sponsor"),
  B("bkerv",       "Banque Kervadan",    "BANQUE",      "#1e3a8a", 68, "nacional",    "dou", 70, "sponsor"),
  B("ysass",       "Ys Assurances",      "YS",          "#0d9488", 62, "nacional",    "dou", 64, "sponsor"),
  B("celten",      "Celtic Énergie",     "CELTEN",      "#16a34a", 60, "nacional",    "dou", 62, "sponsor"),
  B("mordis",      "Mor Distribution",   "MOR-D",       "#f59e0b", 56, "nacional",    "dou", 58, "sponsor"),
  B("tvtauka",     "TV Tauka",           "TV TAUKA",    "#0284c7", 82, "nacional",    "dou", 85, "sponsor"),

  // Regionais (Norte, Indústria Naval e Ferries)
  B("arbag",       "Arbag Ferries",      "ARBAG",       "#1e3a8a", 78, "regional",    "dou", 80, "sponsor"),
  B("kervalhouarn","Kerval Houarn",      "KERVAL-H",    "#b45309", 70, "regional",    "dou", 75, "sponsor"),
  B("porsouarn",   "Porsouarn Steel",    "P-STEEL",     "#475569", 68, "regional",    "dou", 72, "sponsor"),
  B("douelezmar",  "Douelez Maritim",    "DOUELEZ",     "#0369a1", 65, "regional",    "dou", 68, "sponsor"),
  B("gwenn",       "Brasserie Gwenn",    "GWENN",       "#a16207", 44, "regional",    "dou", 42, "sponsor"),
  B("marlav",      "Morlaven Marítima",  "MARLAV",      "#0369a1", 42, "regional",    "dou", 44, "sponsor"),
  B("tregagro",    "Tregonan Agro",      "TREGAGRO",    "#4d7c0f", 38, "regional",    "dou", 40, "sponsor"),
  B("roczh",       "Roc'h Construção",   "ROC'H",       "#475569", 36, "regional",    "dou", 38, "sponsor"),

  // Locais (Pequenos negócios)
  B("kerpad",      "Padaria Kerdrec'h",  "KERPAD",      "#92400e", 20, "local",       "dou", 18, "sponsor"),
  B("aravpn",      "Pneus Aravon",       "PNEUS",       "#334155", 22, "local",       "dou", 22, "sponsor"),
  B("peixys",      "Peixaria do Porto",  "PEIXARIA",    "#0e7490", 18, "local",       "dou", 16, "sponsor"),
  B("lanbar",      "Bar Lannedis",       "LAN-BAR",     "#7c2d12", 15, "local",       "dou", 14, "sponsor")
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
/* Verifica os caminhos de logo e zera os que não existem na pasta,
   assim a marca cai automaticamente no wordmark gerado em vez de sumir. */
export async function validateLogos(list=BRANDS){
  const check = src => new Promise(res=>{
    const i=new Image(); i.onload=()=>res(true); i.onerror=()=>res(false); i.src=src;
  });
  let cleared=0;
  await Promise.all(list.map(async b=>{
    if(!b.logo || String(b.logo).startsWith("data:")) return;
    if(!(await check(b.logo))){ b.logo=null; cleared++; }
  }));
  return cleared;
}
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


/* // original!!!
export const BRANDS = [
  // --- fornecedores de material ---
  B("kelt",    "Kelt Sportswear",   "KELT",   "#111827", 92, "mundial",     "int", 94, "supplier"),
  B("vanguard","Vanguard Athletic", "VNGRD",  "#dc2626", 88, "mundial",     "int", 90, "supplier"),
  B("aurora",  "Aurora Sport",      "AURORA", "#0284c7", 74, "continental", "int", 72, "supplier"),
  B("morvane", "Morvane Équipement","MORVANE","#15803d", 58, "nacional",    "dou", 55, "supplier"),
  B("gwazh",   "Gwazh Sport",       "GWAZH",  "#7c3aed", 40, "regional",    "dou", 38, "supplier"),

  // --- patrocinadores globais ---
  B("nordair", "NordAir",           "NORDAIR","#1d4ed8", 95, "mundial",     "int", 96, "sponsor"),
  B("volstra", "Volstra Motors",    "VOLSTRA","#111827", 90, "mundial",     "int", 92, "sponsor"),
  B("zenith",  "Zenith Electronics","ZENITH", "#0891b2", 86, "mundial",     "int", 88, "sponsor"),
  B("globalq", "GlobalBanq",        "GLOBALQ","#065f46", 82, "continental", "int", 85, "sponsor"),
  B("petrum",  "Petrum Energy",     "PETRUM", "#b45309", 78, "continental", "int", 84, "sponsor"),

  // --- nacionais (Dournéa) --- 
  B("dtel",    "Dournéa Télécom",   "D-TÉL",  "#e11d48", 70, "nacional",    "dou", 72, "sponsor"),
  B("bkerv",   "Banque Kervadan",   "BANQUE", "#1e3a8a", 68, "nacional",    "dou", 70, "sponsor"),
  B("ysass",   "Ys Assurances",     "YS",     "#0d9488", 62, "nacional",    "dou", 64, "sponsor"),
  B("celten",  "Celtic Énergie",    "CELTEN", "#16a34a", 60, "nacional",    "dou", 62, "sponsor"),
  B("mordis",  "Mor Distribution",  "MOR-D",  "#f59e0b", 56, "nacional",    "dou", 58, "sponsor"),

  // --- regionais --- 
  B("gwenn",   "Brasserie Gwenn",   "GWENN",  "#a16207", 44, "regional",    "dou", 42, "sponsor"),
  B("marlav",  "Morlaven Marítima", "MARLAV", "#0369a1", 42, "regional",    "dou", 44, "sponsor"),
  B("tregagro","Tregonan Agro",     "TREGAGRO","#4d7c0f",38, "regional",    "dou", 40, "sponsor"),
  B("roczh",   "Roc'h Construção",  "ROC'H",  "#475569", 36, "regional",    "dou", 38, "sponsor"),

  // --- locais ---
  B("kerpad",  "Padaria Kerdrec'h", "KERPAD", "#92400e", 20, "local",       "dou", 18, "sponsor"),
  B("aravpn",  "Pneus Aravon",      "PNEUS",  "#334155", 22, "local",       "dou", 22, "sponsor"),
  B("peixys",  "Peixaria do Porto", "PEIXARIA","#0e7490",18, "local",       "dou", 16, "sponsor"),
  B("lanbar",  "Bar Lannedis",      "LAN-BAR","#7c2d12", 15, "local",       "dou", 14, "sponsor"),
];
*/