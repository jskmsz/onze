/* =====================================================================
   ONZE — core.js
   Modelo + geração fictícia + adequação de posição + comissão técnica +
   estádio/atmosfera + finanças + lesões + motor headless + tabela.
   Sem UI aqui.
   ===================================================================== */

/* ---------- Atributos e posições ---------- */
export const ATTRS = ["pace","stamina","strength","tackling","marking",
  "passing","vision","dribbling","technique","finishing","positioning","goalkeeping"];
export const ATTR_PT = {
  pace:"Velocidade", stamina:"Fôlego", strength:"Força", tackling:"Desarme",
  marking:"Marcação", passing:"Passe", vision:"Visão", dribbling:"Drible",
  technique:"Técnica", finishing:"Finalização", positioning:"Posicionamento", goalkeeping:"Goleiro",
};
const FIT = {
  GOL:{goalkeeping:6, positioning:1.5, strength:1, passing:.5, pace:1},
  ZAG:{marking:2.5, tackling:2.5, strength:2, positioning:1.5, pace:1, passing:.5, vision:.3},
  LAT:{pace:2, stamina:2, tackling:1.5, marking:1, passing:1.5, dribbling:1, positioning:1, technique:.5},
  VOL:{tackling:2, marking:1.5, passing:2, positioning:1.5, stamina:1.5, strength:1.5, vision:1},
  MEI:{passing:2.5, vision:2, dribbling:1.5, technique:1.5, stamina:1.2, finishing:1, positioning:.8},
  PON:{pace:2.5, dribbling:2.5, technique:1.5, passing:1, finishing:1.5, stamina:1, positioning:.8},
  ATA:{finishing:3, positioning:2, technique:1.5, pace:1.5, strength:1, dribbling:1, vision:.5},
};
const GROUP = {GOL:"GK", ZAG:"DEF", LAT:"DEF", VOL:"MID", MEI:"MID", PON:"ATT", ATA:"ATT"};

export function effectiveRating(player, pos){
  const w = FIT[pos]; let sum=0, tot=0;
  for(const a in w){ sum += (player.attrs[a]||30)*w[a]; tot += w[a]; }
  let r = sum/tot;
  if(pos !== player.pos) r *= (GROUP[pos]===GROUP[player.pos]) ? 0.95 : 0.86;
  return Math.round(r);
}
export const overall = p => effectiveRating(p, p.pos);

/* ---------- Helpers ---------- */
const rnd = (a,b)=> a + Math.random()*(b-a);
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
const gauss = ()=> (Math.random()+Math.random()+Math.random())/3;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

/* ---------- Nomes / clubes ---------- */
/* Dournéa: nação fictícia de fala bretã/francesa, forte influência celta */
const FIRST = ["Yann","Erwan","Gwenaël","Loïg","Tanguy","Riwal","Maël","Ronan","Brieg","Judikaël",
  "Gaël","Hervé","Perig","Youenn","Padrig","Alan","Fañch","Konan","Morvan","Goulven","Corentin",
  "Tugdual","Malo","Armel","Joran","Gwendal","Ewen","Killian","Nolan","Yannig","Soïg","Bleiz","Awen",
  "Efflam","Guénolé","Paol","Meven","Tremeur","Deniel","Salaün","Herri","Job","Loïc","Yvon","Kirian",
  "Nevenoe","Riou","Roparz","Envel","Youn","Gwilherm"];
const LAST = ["Le Gall","Le Goff","Le Bris","Le Roy","Le Braz","Kervella","Cadiou","Guivarc'h","Riou",
  "Prigent","Jaffré","Créac'h","Quéméner","Le Corre","Le Bihan","Le Guen","Salaün","Coïc","Hénaff",
  "Perrot","Le Floc'h","Nédélec","Caradec","Guéguen","Kerjean","Morvan","Le Berre","Abgrall","Tanguy",
  "Kermarrec","Le Dû","Cabon","Le Meur","Talec","Le Lann","Guyader","Le Traon","Menez"];
const STAFF_FIRST = ["Dr. Le Bris","Prof. Kerouédan","Yann-Ber","Job Caradec","Herri Le Bras","Dr. Guéguen",
  "Prof. Nédélec","Fañch Coïc","Dr. Kermarrec","Perig Le Dû","Mestr Goulven","Youenn Talec","Dr. Riou","Paol Le Gall"];

/* ---------- Nacionalidades (maioria dournéa, um tempero estrangeiro) ---------- */
export const NATIONS = {
  dou:{flag:"🔵", name:"Dournéa",  first:FIRST, last:LAST, weight:70},
  fra:{flag:"🇫🇷", name:"França",   weight:9,
    first:["Antoine","Lucas","Hugo","Théo","Mathis","Nathan","Enzo","Clément","Baptiste","Rémi","Florian","Julien"],
    last:["Martin","Bernard","Dubois","Moreau","Laurent","Girard","Fontaine","Rousseau","Blanc","Garnier","Faure","Chevalier"]},
  irl:{flag:"🇮🇪", name:"Irlanda",  weight:6,
    first:["Cian","Oisín","Fionn","Darragh","Conor","Séamus","Rory","Eoin","Niall","Cillian","Tadhg","Declan"],
    last:["Murphy","O'Brien","Kelly","Byrne","Ryan","O'Connor","Doyle","McCarthy","Gallagher","Brennan","Nolan","Flynn"]},
  sco:{flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", name:"Escócia",  weight:5,
    first:["Callum","Angus","Hamish","Struan","Fraser","Euan","Rory","Lachlan","Duncan","Kenzie","Gregor","Finlay"],
    last:["MacLeod","Campbell","Stewart","Fraser","Cameron","MacKay","Ross","Murray","Ferguson","Grant","Buchanan","Muir"]},
  isl:{flag:"🇮🇸", name:"Islândia", weight:4,
    first:["Björn","Gunnar","Sigurður","Aron","Kári","Baldur","Hlynur","Ragnar","Einar","Þórir","Dagur","Óli"],
    last:["Jónsson","Sigurðsson","Guðmundsson","Þórsson","Karlsson","Björnsson","Magnússon","Einarsson","Ólafsson","Hansson"]},
  esp:{flag:"🇪🇸", name:"Espanha",  weight:3,
    first:["Álvaro","Sergio","Pablo","Iker","Marcos","Rubén","Adrián","Javier","Diego","Nacho","Gonzalo","Unai"],
    last:["García","Fernández","Martínez","López","Sánchez","Romero","Torres","Navarro","Molina","Ortega","Cabrera","Vidal"]},
  por:{flag:"🇵🇹", name:"Portugal", weight:3,
    first:["João","Rúben","Tiago","Bruno","Diogo","Gonçalo","André","Nuno","Rafael","Vítor","Fábio","Duarte"],
    last:["Silva","Sousa","Costa","Pereira","Carvalho","Gomes","Fonseca","Ribeiro","Moreira","Nunes","Cardoso","Pinto"]},
  nor:{flag:"🇳🇴", name:"Noruega",  weight:3,
    first:["Erling","Kristian","Håkon","Sander","Mathias","Emil","Jonas","Sondre","Ola","Vegard","Halvard","Torbjørn"],
    last:["Hansen","Johansen","Olsen","Larsen","Andersen","Berg","Haugen","Solberg","Dahl","Moen","Lie","Strand"]},
};
const NAT_KEYS = Object.keys(NATIONS);
const NAT_TOTAL = NAT_KEYS.reduce((s,k)=>s+NATIONS[k].weight,0);
function pickNation(){
  let r=Math.random()*NAT_TOTAL;
  for(const k of NAT_KEYS){ if((r-=NATIONS[k].weight)<=0) return k; }
  return "dou";
}
export const flagOf = p => (NATIONS[p.nat]||NATIONS.dou).flag;
export const nationName = p => (NATIONS[p.nat]||NATIONS.dou).name;

const CLUBS = [
  {name:"Stade Kervadan",     short:"KER", color:"#1f6feb", city:"Kervadan",    rep:82},
  {name:"Olympique Gwenmor",  short:"GWE", color:"#2ea043", city:"Gwenmor",     rep:80},
  {name:"AS Ker-Ys",          short:"KYS", color:"#0d9488", city:"Ker-Ys",      rep:78},
  {name:"Racing Plouarnel",   short:"PLO", color:"#dc2626", city:"Plouarnel",   rep:76},
  {name:"US Lanhouarne",      short:"LAN", color:"#16a34a", city:"Lanhouarne",  rep:74},
  {name:"En Avant Tregonan",  short:"TRE", color:"#e11d48", city:"Tregonan",    rep:72},
  {name:"FC Morlaven",        short:"MOR", color:"#0284c7", city:"Morlaven",    rep:70},
  {name:"Stade Roc'halen",    short:"ROC", color:"#0891b2", city:"Roc'halen",   rep:68},
  {name:"AS Brocéliande",     short:"BRO", color:"#15803d", city:"Brocéliande", rep:66},
  {name:"Kerdrec'h FC",       short:"KDR", color:"#b45309", city:"Kerdrec'h",   rep:64},
  {name:"Sant-Konan AC",      short:"SKO", color:"#1e3a8a", city:"Sant-Konan",  rep:62},
  {name:"Union Landivael",    short:"LDV", color:"#7c3aed", city:"Landivael",   rep:60},
  {name:"Gwennili Aravon",    short:"ARA", color:"#f59e0b", city:"Aravon",      rep:57},
  {name:"US Penant",          short:"PEN", color:"#475569", city:"Penant",      rep:54},
  {name:"Korrigan Lannedis",  short:"LND", color:"#4d7c0f", city:"Lannedis",    rep:52},
  {name:"FC Penmarc'hen",     short:"PMH", color:"#38bdf8", city:"Penmarc'hen", rep:49},
];

const ARCH = {
  GOL:{goalkeeping:35, positioning:8, pace:-15, dribbling:-20, finishing:-25, passing:-8, tackling:-10, marking:-10},
  ZAG:{marking:14, tackling:14, strength:12, positioning:9, pace:-4, finishing:-22, dribbling:-16, goalkeeping:-45, vision:-6},
  LAT:{pace:12, stamina:12, tackling:6, dribbling:2, passing:2, finishing:-12, goalkeeping:-45, strength:-4},
  VOL:{tackling:12, marking:8, passing:6, stamina:9, positioning:7, strength:6, finishing:-10, goalkeeping:-45, pace:-2},
  MEI:{passing:14, vision:14, technique:11, dribbling:9, finishing:2, tackling:-8, marking:-12, goalkeeping:-45},
  PON:{pace:16, dribbling:16, technique:9, finishing:5, passing:2, tackling:-13, marking:-15, goalkeeping:-45, strength:-8},
  ATA:{finishing:17, positioning:13, technique:7, pace:7, strength:5, tackling:-17, marking:-19, passing:-6, goalkeeping:-45},
};

let _pid = 1;
function makePlayer(pos, clubRep){
  const base = clamp(clubRep + (gauss()-0.5)*26, 30, 94);
  const off = ARCH[pos]; const attrs = {};
  for(const a of ATTRS){
    let v = base + (off[a]||(a==="goalkeeping"?-40:0)) + (gauss()-0.5)*16;
    attrs[a] = Math.round(clamp(v, 22, 97));
  }
  const nat = pickNation(), N = NATIONS[nat];
  const fn = pick(N.first); let name = fn;
  if(Math.random()<0.55){ const ln=pick(N.last); if(ln!==fn) name = fn+" "+ln; }
  const p = {id:_pid++, name, nat, pos, age:Math.round(rnd(17,35)), attrs,
    morale:Math.round(rnd(55,80)), fitness:100, injury:0, condition:100};
  p.overall = overall(p);
  p.potential = potentialFor(p);
  p.wage = wageFor(p);
  return p;
}
export const wageFor = p => Math.round((p.overall**2.3)/50) * 100;   // salário semanal
/* Teto de evolução: quanto mais jovem, mais espaço para crescer */
function potentialFor(p){
  const room = p.age<=19 ? rnd(6,28) : p.age<=23 ? rnd(3,16) : p.age<=27 ? rnd(0,6) : 0;
  return Math.round(clamp(p.overall+room, p.overall, 99));
}
/* Valor de mercado: cresce forte com a qualidade e cai com a idade */
export function playerValue(p){
  const ageF = p.age<=21?1.45 : p.age<=25?1.30 : p.age<=29?1.0 : p.age<=32?0.55 : 0.22;
  const base = Math.max(0, p.overall-40);
  return Math.round(1000*Math.pow(base,2.6)*ageF/10000)*10000;
}
/* Jovem da base: nota atual baixa, potencial é o que importa */
export function makeProspect(pos, level){
  const p = makePlayer(pos, level);
  p.age = Math.round(rnd(16,19));
  p.overall = overall(p);
  p.potential = Math.round(clamp(p.overall+rnd(8,32), p.overall, 99));
  p.wage = wageFor(p);
  p.condition = 100;
  return p;
}
function makeSquad(clubRep){
  const plan = ["GOL","GOL","ZAG","ZAG","ZAG","LAT","LAT","LAT","VOL","VOL",
    "MEI","MEI","MEI","PON","PON","ATA","ATA","ATA"];
  return plan.map(pos => makePlayer(pos, clubRep));
}

/* ---------- Comissão técnica ---------- */
export const STAFF_ROLES = [
  {key:"headCoach",   label:"Treinador",           desc:"Eleva o rendimento geral do time.",             wageK:1.7},
  {key:"gkCoach",     label:"Prep. de Goleiros",   desc:"Melhora o desempenho do goleiro.",              wageK:0.8},
  {key:"fitnessCoach",label:"Preparador Físico",   desc:"Reduz a queda de rendimento no fim do jogo.",   wageK:0.9},
  {key:"physio",      label:"Departamento Médico", desc:"Menos lesões e recuperação mais rápida.",        wageK:1.0},
  {key:"marketing",   label:"Diretor de Marketing",desc:"Aumenta a receita de patrocínio.",              wageK:1.1},
  {key:"scout",       label:"Olheiro",             desc:"Acha jovens promessas e avalia melhor o talento.", wageK:0.9},
];
export const staffWage = (q, wageK)=> Math.round(q*q*wageK*6/100)*100;
export function makeStaff(role, quality){
  const q = Math.round(clamp(quality,20,95));
  const r = STAFF_ROLES.find(x=>x.key===role);
  return {role, name:pick(STAFF_FIRST), quality:q, wage:staffWage(q, r.wageK)};
}
export function generateStaffMarket(){
  const m = {};
  for(const r of STAFF_ROLES){
    m[r.key] = Array.from({length:5}, ()=> makeStaff(r.key, rnd(30,92)))
      .sort((a,b)=>b.quality-a.quality);
  }
  return m;
}
/* Efeitos derivados da comissão (0 = sem funcionário → pior) */
export function staffEffects(club){
  const q = k => club.staff[k] ? club.staff[k].quality : 0;
  return {
    gkMult:      1 + Math.max(0,q("gkCoach"))/1000,          // até +9%
    overallMult: 1 + Math.max(0,q("headCoach")-30)/2000,     // até +3.3%
    fatigueRed:  Math.max(0,q("fitnessCoach"))/200,          // até 0.47 (menos cansaço)
    injuryRed:   Math.max(0,q("physio"))/170,                // até ~0.56
    injuryDurRed:Math.max(0,q("physio"))/260,                // até ~0.36
    sponsorMult: 1 + Math.max(0,q("marketing"))/250,         // até +38%
  };
}
export const staffWageTotal = club =>
  STAFF_ROLES.reduce((s,r)=> s + (club.staff[r.key]?club.staff[r.key].wage:0), 0);

/* ---------- Estádio, atmosfera, finanças ---------- */
/* ---------- Estádios: o que faz um caldeirão ----------
   Highbury era pequeno, mas a torcida colava no gramado → clima melhor que o
   Emirates. Signal Iduna Park é fechado e coberto → acústica. Aqui:
   proximidade + fechamento + lotação pesam MAIS que capacidade. */
export const stadiumOf = club => club.venues[club.venueIdx];
export const isClosedDoors = club => !!(club.discipline && club.discipline.closedDoors>0);

/* ---------- Prestígio do clube (0–5 estrelas) ---------- */
export const prestigeStars = p => Math.round((p||0)/20*2)/2;   // 0 a 5, em passos de 0,5
export const REACH = [
  {min:88, k:"mundial",    l:"Mundial"},
  {min:70, k:"continental",l:"Continental"},
  {min:45, k:"nacional",   l:"Nacional"},
  {min:22, k:"regional",   l:"Regional"},
  {min:0,  k:"local",      l:"Local"},
];
export const reachOf = p => REACH.find(r=>(p||0)>=r.min);

export function attendanceFactor(club, price=stadiumOf(club).ticketPrice){
  if(isClosedDoors(club)) return 0;                    // portões fechados: ninguém entra
  // torcida (recente, muda com resultados) + prestígio (fama do clube) − preço
  return clamp(0.48 + (club.fans-50)/120 + ((club.prestige||55)-55)/320 - (price-60)/300, 0.2, 1);
}
export function atmosphere(club){
  if(isClosedDoors(club)) return 8;                    // estádio vazio: quase sem clima
  const S=stadiumOf(club), fill=attendanceFactor(club);
  const empty=(1-fill)*Math.min(1,S.capacity/70000)*0.25;   // arena grande e vazia = morta
  const v = 0.18
    + club.fans/100*0.22          // fidelidade da torcida
    + fill*0.22                   // estádio cheio
    + S.proximity/100*0.20        // torcida colada no gramado
    + S.enclosure/100*0.18        // coberto/fechado = acústica
    - S.premiumShare*0.35         // camarote não canta
    - empty;
  return Math.round(clamp(v,0.05,1)*100);
}
export function matchdayRevenue(club, fill=attendanceFactor(club)){
  if(isClosedDoors(club)) return 0;                    // sem bilheteria
  const S=stadiumOf(club), cap=S.capacity, prem=S.premiumShare;
  const popSeats=cap*(1-prem), premSeats=cap*prem;
  const popPrice=S.ticketPrice, premPrice=S.ticketPrice*3.5;
  const popFill=clamp(fill*1.05,0,1), premFill=clamp(fill*0.8,0,1);  // premium enche mais devagar
  return Math.round(popSeats*popFill*popPrice + premSeats*premFill*premPrice);
}
export const attendanceCount = (club, fill=attendanceFactor(club))=>{
  if(isClosedDoors(club)) return 0;
  const S=stadiumOf(club), cap=S.capacity, prem=S.premiumShare;
  return Math.round(cap*(1-prem)*clamp(fill*1.05,0,1) + cap*prem*clamp(fill*0.8,0,1));
};
export const playerWageTotal = club => club.squad.reduce((s,p)=>s+p.wage,0);
export const stadiumUpkeep = (club, isHome)=>{
  const S=stadiumOf(club);
  const care=(PITCH_CARE[S.pitchCare]||PITCH_CARE.normal).cost;
  return Math.round(S.capacity*8 + care + (isHome ? S.capacity*6 + (S.owned?0:S.rent) : 0));
};
/* deriva do gramado 1×/rodada: cuidado alto recupera, baixo apodrece */
export function tickPitch(club){
  const S=stadiumOf(club);
  const keep=(PITCH_CARE[S.pitchCare]||PITCH_CARE.normal).keep;
  S.pitch=Math.round(clamp((S.pitch||80)+keep+rnd(-1,1), 10, 100));
}

/* ---------- Centro de treinamento ---------- */
export const TRAIN_FOCUS = [
  {k:"geral",     l:"Geral (equilibrado)",  prof:null,          desc:"Evolui um pouco de tudo."},
  {k:"defesa",    l:"Defesa",               prof:"defense",     desc:"Time defende melhor."},
  {k:"ataque",    l:"Ataque",               prof:"attack",      desc:"Time ataca melhor."},
  {k:"posse",     l:"Posse e passe",        prof:"possession",  desc:"Meio-campo domina mais a bola."},
  {k:"bolas",     l:"Bolas paradas",        prof:"setPieces",   desc:"Mais gols de falta direta."},
  {k:"penaltis",  l:"Pênaltis",             prof:"penalties",   desc:"Converte mais pênaltis."},
];
export const INTENSITY = {
  leve:   {l:"Leve",   gain:0.5, load:0.5},
  normal: {l:"Normal", gain:1.0, load:1.0},
  pesado: {l:"Pesado", gain:1.7, load:1.9},
};
export const trainingQuality = club =>
  Math.round(clamp(club.training.fields*12 + club.training.equipment*0.55, 10, 100));
export const trainingUpkeep = club =>
  Math.round(club.training.fields*120000 + club.training.equipment*2500);
export const FIELD_COST=4000000, EQUIP_STEP=15, EQUIP_COST=1500000, MAX_FIELDS=5;

/* Uma semana de treino: desgasta, evolui proficiência do foco e atributos individuais */
export function applyTraining(club){
  const T=club.training, q=trainingQuality(club), I=INTENSITY[T.intensity]||INTENSITY.normal;
  const eff=staffEffects(club);
  // carga x recuperação (instalações boas cansam menos e recuperam mais)
  // leve => sobra condição; normal => empata; pesado => cai de verdade
  const load = I.load*(7 - q/30);
  const recover = 2.5 + q/40 + eff.fatigueRed*3;
  for(const p of club.squad){
    if(p.condition==null) p.condition=100;
    p.condition = clamp(p.condition - load + recover, 55, 100);
  }
  // proficiência: o foco sobe, o resto enferruja devagar
  const gain=I.gain*(0.6+q/100);
  const f=TRAIN_FOCUS.find(x=>x.k===T.focus)||TRAIN_FOCUS[0];
  for(const k in club.proficiency){
    if(f.prof===k) club.proficiency[k]=clamp(club.proficiency[k]+gain*1.2, 0, 100);
    else if(f.prof===null) club.proficiency[k]=clamp(club.proficiency[k]+gain*0.25, 0, 100);
    else club.proficiency[k]=clamp(club.proficiency[k]-0.25, 0, 100);
  }
  // treino individual: jovem evolui mais rápido
  const grown=[];
  for(const pid in (T.individual||{})){
    const p=club.squad.find(x=>x.id===+pid); if(!p) continue;
    const attr=T.individual[pid]; if(!ATTRS.includes(attr)) continue;
    const youth = p.age<=23?1.6 : p.age<=28?1.0 : 0.5;
    const before=Math.floor(p.attrs[attr]);
    p.attrs[attr]=clamp(p.attrs[attr] + 0.11*I.gain*(0.5+q/100)*youth, 20, 99);
    const now=Math.floor(p.attrs[attr]);
    if(now>before) grown.push({name:p.name, attr, val:now});
    p.overall=overall(p);
  }
  return {grown};
}

/* Ledger de uma rodada (sem ruído = projeção; app aplica ruído no público real) */
export function roundFinance(club, isHome, fillOverride, fines=0){
  const eff = staffEffects(club);
  const gate = isHome ? matchdayRevenue(club, fillOverride) : 0;
  const sponsor = Math.round(club.sponsor.perRound * eff.sponsorMult);
  const playerWages = playerWageTotal(club);
  const staffWages = staffWageTotal(club);
  const upkeep = stadiumUpkeep(club, isHome);
  const training = trainingUpkeep(club);
  const income = {gate, sponsor};
  const expense = {playerWages, staffWages, upkeep, training, fines};
  const net = gate+sponsor - (playerWages+staffWages+upkeep+training+fines);
  return {income, expense, net};
}

/* ---------- Patrocínio ---------- */
export function sponsorOptions(club){
  // prestígio maior => marcas maiores pagam mais (cresce mais que linear)
  const base = Math.pow(club.prestige||club.rep, 1.35)*640;
  return [
    {name:"Contrato conservador", perRound:Math.round(base*0.8),  note:"Valor garantido, mais baixo."},
    {name:"Contrato padrão",      perRound:Math.round(base*1.0),  note:"Equilíbrio de risco e retorno."},
    {name:"Contrato agressivo",   perRound:Math.round(base*1.35), note:"Paga mais, exige projeção do clube."},
  ];
}

/* ---------- Lesões ---------- */
export function tickInjuries(club){ club.squad.forEach(p=>{ if(p.injury>0) p.injury--; }); }
export function rollMatchInjuries(club){
  const eff = staffEffects(club);
  const fitPool = club.squad.filter(p=>p.injury<=0);
  const avgCond = fitPool.length ? fitPool.reduce((s,p)=>s+(p.condition??100),0)/fitPool.length : 100;
  const condRisk = 1 + (100-avgCond)/100*1.3;      // time moído de treino se machuca mais
  if(Math.random() < 0.12*(1-eff.injuryRed)*condRisk){
    const fit = fitPool;
    const victim = pick(fit);
    if(victim){
      const dur = Math.max(1, Math.round(rnd(1,5)*(1-eff.injuryDurRed)));
      victim.injury = dur;
      return {name:victim.name, rounds:dur};
    }
  }
  return null;
}
export const injuredList = club => club.squad.filter(p=>p.injury>0);

/* ---------- Mercado de transferências ---------- */
export const SQUAD_MIN=16, SQUAD_MAX=26;
const POSITIONS_ALL=["GOL","ZAG","LAT","VOL","MEI","PON","ATA"];

/* O olheiro traz promessas — e quanto melhor ele é, mais preciso é o relatório */
export function scoutProspects(club){
  const q = club.staff.scout ? club.staff.scout.quality : 0;
  if(!q) return [];
  const n = q>75?3 : q>50?2 : 1;
  const list=[];
  for(let i=0;i<n;i++){
    const level = clamp(30 + q*0.42 + (gauss()-0.5)*30, 25, 82);
    const p = makeProspect(pick(POSITIONS_ALL), level);
    // relatório impreciso: olheiro ruim erra feio a leitura
    const err = Math.round((100-q)/6);
    p.scoutErr = err;
    p.estOverall = Math.round(clamp(p.overall + (Math.random()-0.5)*2*err, 20, 99));
    p.estPotential = Math.round(clamp(p.potential + (Math.random()-0.5)*2*err*1.4, p.estOverall, 99));
    p.fee = Math.round(playerValue(p)*0.35/10000)*10000;
    list.push(p);
  }
  return list;
}
/* Lista de transferências: cada clube da IA põe reservas (e às vezes um titular) à venda */
export function refreshMarket(world){
  world.transferList=[];
  for(const c of world.clubs){
    if(c.id===world.userId) continue;
    const sorted=c.squad.slice().sort((a,b)=>b.overall-a.overall);
    const surplus=sorted.slice(13);
    const n=Math.random()<0.5?1:2;
    for(let i=0;i<n && surplus.length;i++){
      const p=surplus.splice(Math.floor(Math.random()*surplus.length),1)[0];
      p.askingPrice=Math.round(playerValue(p)*rnd(0.95,1.30)/10000)*10000;
      world.transferList.push({clubId:c.id, playerId:p.id});
    }
    if(Math.random()<0.12 && sorted.length>3){                  // vende um bom por dinheiro
      const p=sorted[Math.floor(rnd(0,6))];
      p.askingPrice=Math.round(playerValue(p)*rnd(1.2,1.6)/10000)*10000;
      world.transferList.push({clubId:c.id, playerId:p.id});
    }
  }
}
export function signPlayer(world, buyer, entry){
  const seller=clubById(world, entry.clubId);
  const p=seller.squad.find(x=>x.id===entry.playerId);
  if(!p) return {ok:false, msg:"Jogador não está mais disponível."};
  const price=p.askingPrice||playerValue(p);
  if(buyer.finance.balance < price) return {ok:false, msg:"Caixa insuficiente."};
  if(buyer.squad.length >= SQUAD_MAX) return {ok:false, msg:`Elenco cheio (máx. ${SQUAD_MAX}).`};
  if(seller.squad.length <= SQUAD_MIN) return {ok:false, msg:"O clube vendedor não pode liberar mais ninguém."};
  seller.squad = seller.squad.filter(x=>x.id!==p.id);
  buyer.squad.push(p);
  buyer.finance.balance-=price; seller.finance.balance+=price;
  world.transferList = world.transferList.filter(e=>e.playerId!==p.id);
  delete p.askingPrice;
  return {ok:true, price, player:p, seller};
}
export const sellPrice = p => Math.round(playerValue(p)*0.85/10000)*10000;
export function sellPlayer(world, club, playerId){
  const p=club.squad.find(x=>x.id===playerId);
  if(!p) return {ok:false, msg:"Jogador não encontrado."};
  if(club.squad.length <= SQUAD_MIN) return {ok:false, msg:`Elenco mínimo de ${SQUAD_MIN} jogadores.`};
  const price=sellPrice(p);
  // quem compra: um clube com caixa e vaga
  const buyers=world.clubs.filter(c=>c.id!==club.id && c.squad.length<SQUAD_MAX && c.finance.balance>price);
  if(!buyers.length) return {ok:false, msg:"Nenhum clube interessado agora."};
  const buyer=pick(buyers);
  club.squad = club.squad.filter(x=>x.id!==p.id);
  buyer.squad.push(p);
  club.finance.balance+=price; buyer.finance.balance-=price;
  if(club.lineup) club.lineup.spots.forEach(s=>{ if(s.id===p.id) s.id=null; });
  return {ok:true, price, buyer, player:p};
}
export function signProspect(world, club, prospect){
  if(club.squad.length >= SQUAD_MAX) return {ok:false, msg:`Elenco cheio (máx. ${SQUAD_MAX}).`};
  if(club.finance.balance < prospect.fee) return {ok:false, msg:"Caixa insuficiente."};
  club.finance.balance -= prospect.fee;
  const p={...prospect}; delete p.scoutErr; delete p.estOverall; delete p.estPotential; delete p.fee;
  club.squad.push(p);
  club.prospects = club.prospects.filter(x=>x.id!==prospect.id);
  return {ok:true, player:p};
}

/* ---------- Virada de temporada ---------- */
/* Premiação da liga por posição final (destrava a renda no fim da temporada) */
export function leaguePrize(pos, n=16){
  const champ=28e6, last=3e6;
  const share=(n-pos)/(n-1);            // 1º=1 … último=0
  return Math.round((last + (champ-last)*Math.pow(share,1.6))/1e5)*1e5;
}
export function payLeaguePrizes(world){
  const table=computeTable(world), n=table.length, out=[];
  table.forEach((row,i)=>{
    const c=clubById(world,row.id), prize=leaguePrize(i+1,n);
    c.finance.balance+=prize;
    c.finance.lastPrize=prize;
    out.push({clubId:row.id, pos:i+1, prize});
  });
  return out;
}
export function startNewSeason(world){
  const prizes = payLeaguePrizes(world);       // paga ANTES de zerar a tabela
  // prestígio evolui com a colocação final (1º sobe, últimos caem)
  const table=computeTable(world), n=table.length;
  table.forEach((row,i)=>{
    const c=clubById(world,row.id);
    const gain = (n-1-i*2)/(n-1) * 3.5;        // 1º ~ +3.5, meio ~ 0, último ~ -3.5
    c.prestige=Math.round(clamp((c.prestige||55)+gain, 5, 100));
    c.fans=Math.round(clamp(c.fans + gain*0.8, 30, 98));   // resultado puxa a torcida junto
  });
  world.season++; world.round=0; world.phase="league";
  world.fixtures = makeSchedule(world.clubs.map(c=>c.id));
  const news=[];
  for(const c of world.clubs){
    for(const p of c.squad){
      p.age++; p.condition=100; p.injury=0;
      // jovem cresce rumo ao potencial; veterano perde velocidade primeiro
      let d;
      if(p.age<=23)      d = p.overall<p.potential ? rnd(0.8,2.6) : rnd(0,0.4);
      else if(p.age<=28) d = p.overall<p.potential ? rnd(0.2,1.1) : rnd(-0.2,0.3);
      else if(p.age<=31) d = rnd(-1.0,0.2);
      else               d = rnd(-2.6,-0.8);
      for(const a of ATTRS){
        const w=(a==="pace"||a==="stamina")?1.4:0.9;
        p.attrs[a]=clamp(p.attrs[a]+d*w*rnd(0.5,1.3), 20, 99);
      }
      p.overall=overall(p); p.wage=wageFor(p);
    }
    // aposentadorias
    const retiring=c.squad.filter(p=>p.age>=36 && Math.random()<0.7);
    if(retiring.length && c.id===world.userId)
      news.push(...retiring.map(p=>`${p.name} (${p.age}) pendurou as chuteiras.`));
    c.squad=c.squad.filter(p=>!retiring.includes(p));
    // repõe com a base
    while(c.squad.length < 18) c.squad.push(makeProspect(pick(POSITIONS_ALL), clamp(c.rep-12+rnd(-6,8),28,72)));
    c.discipline.closedDoors=0;
    if(c.lineup) c.lineup.spots.forEach(s=>{ if(!c.squad.find(p=>p.id===s.id)) s.id=null; });
  }
  refreshMarket(world);
  return {news, prizes};
}

/* ---------- Mundo ---------- */
/* Arquétipos de estádio: capacidade NÃO é tudo */
const VENUE_TYPES = [
  {k:"caldeirao", l:"Caldeirão antigo", capF:0.75, prox:[82,94], enc:[64,80]},   // Highbury
  {k:"arena",     l:"Arena moderna",    capF:1.15, prox:[44,60], enc:[55,72]},   // Emirates
  {k:"pista",     l:"Estádio com pista",capF:0.95, prox:[24,40], enc:[38,55]},   // pista de atletismo
  {k:"classico",  l:"Estádio clássico", capF:1.00, prox:[62,78], enc:[52,68]},
];
const mkVenue=(name,capacity,prox,enc,opts={})=>({
  name, capacity:Math.round(capacity), proximity:Math.round(prox), enclosure:Math.round(enc),
  ticketPrice:60, premiumShare:opts.premium??0.10, expansion:null, works:null,
  owned:opts.owned!==false, rent:opts.rent||0, type:opts.type||"classico",
  pitch:Math.round(rnd(70,92)), pitchCare:"normal",     // qualidade do gramado + nível de manutenção
});
export const PITCH_CARE = { baixa:{l:"Baixa",cost:40000,keep:-3}, normal:{l:"Normal",cost:110000,keep:2}, alta:{l:"Alta (drenagem)",cost:240000,keep:5} };

/* ---------- Clima (Dournéa ~ Islândia: frio, vento, úmido) ----------
   Gera o clima do JOGO e o faz variar ao longo dos 90 minutos. */
export const SKY = {
  sol:      {l:"Sol",           ic:"☀️", wet:0,   grip:1.00},
  nublado:  {l:"Nublado",       ic:"☁️", wet:0,   grip:1.00},
  garoa:    {l:"Garoa",         ic:"🌦️", wet:0.4, grip:0.97},
  chuva:    {l:"Chuva",         ic:"🌧️", wet:0.8, grip:0.92},
  tempestade:{l:"Temporal",     ic:"⛈️", wet:1.2, grip:0.85},
  neve:     {l:"Neve",          ic:"❄️", wet:0.9, grip:0.86},
  granizo:  {l:"Granizo",       ic:"🌨️", wet:0.7, grip:0.88},
};
const WIND_DIRS=["N","NE","L","SE","S","SO","O","NO"];
/* transições possíveis (Islândia muda rápido) */
const SKY_NEXT = {
  sol:["sol","sol","nublado","garoa"], nublado:["nublado","sol","garoa","chuva"],
  garoa:["garoa","nublado","chuva","sol"], chuva:["chuva","garoa","tempestade","nublado"],
  tempestade:["tempestade","chuva","chuva"], neve:["neve","nublado","granizo"],
  granizo:["granizo","neve","chuva"],
};
export function makeWeather(city){
  const cold = Math.random()<0.35;          // frente fria → neve possível
  const startTemp = cold ? rnd(-3,4) : rnd(3,12);
  let sky;
  const r=Math.random();
  if(cold) sky = r<0.35?"neve" : r<0.5?"granizo" : r<0.8?"nublado":"chuva";
  else     sky = r<0.3?"sol" : r<0.55?"nublado" : r<0.8?"garoa":"chuva";
  const kickoff = pick([15,16,18,20,21]);   // hora do jogo
  return {
    tempC:Math.round(startTemp), humidity:Math.round(rnd(62,95)),
    wind:Math.round(rnd(6,48)), windDir:pick(WIND_DIRS),
    sky, kickoff, cold, city:city||"Dournéa", puddle:0,
  };
}
/* evolui o clima 1 minuto (chamado pelo motor) */
export function stepWeather(w, minute){
  if(minute%12===0 && Math.random()<0.6){
    w.sky = pick(SKY_NEXT[w.sky]||["nublado"]);
    w.wind = Math.round(clamp(w.wind + rnd(-6,6), 3, 60));
    w.tempC = Math.round(clamp(w.tempC + rnd(-1,1), -8, 16));
  }
  // acúmulo/escoamento de água no gramado
  const wet=(SKY[w.sky]||SKY.nublado).wet;
  w.puddle = clamp(w.puddle + wet*0.02 - 0.01, 0, 1);
  return w;
}
/* efeito combinado clima + gramado no jogo (multiplicadores) */
export function pitchWeatherEffect(venue, weather){
  const S=SKY[weather.sky]||SKY.nublado;
  const pitch=(venue&&venue.pitch)!=null?venue.pitch:80;
  // gramado ruim + molhado = poças; drenagem (pitch alto) ajuda muito
  const flood = weather.puddle * (1.4 - pitch/100);
  const grip = S.grip * (0.9 + pitch/1000);
  const windChaos = weather.wind/100;
  return {
    grip: clamp(grip,0.7,1.02),                 // aderência: <1 erra mais passe/chute
    pass: clamp(1 - flood*0.35, 0.6, 1),        // precisão de passe
    fatigue: 1 + flood*0.5 + Math.max(0,(2-weather.tempC))/40,  // campo pesado/frio cansa mais
    windShot: windChaos*0.6,                    // ruído no chute
    flood,
    label: weather.puddle>0.5 ? "Campo encharcado" : weather.puddle>0.25 ? "Campo pesado" : "",
  };
}

export function generateWorld(){
  _pid = 1;
  const clubs = CLUBS.map((c,i)=>{
    const squad = makeSquad(c.rep);
    const staff = {};
    for(const r of STAFF_ROLES) staff[r.key] = makeStaff(r.key, clamp(c.rep+rnd(-16,8),25,92));
    const vt = VENUE_TYPES[Math.floor(rnd(0,VENUE_TYPES.length))];
    const baseCap = clamp(c.rep*700 + rnd(-6000,6000), 12000, 62000);
    const main = mkVenue("Stade de "+c.city, baseCap*vt.capF, rnd(...vt.prox), rnd(...vt.enc),
      {type:vt.k, premium: vt.k==="arena"?0.20:0.08});
    const old  = mkVenue("Vieux Parc de "+c.city, baseCap*0.42, rnd(86,94), rnd(70,82),
      {type:"caldeirao", premium:0.03});
    const nat  = mkVenue("Grand Stade de Dournéa", 65000, 30, 44,
      {type:"pista", owned:false, rent:380000, premium:0.18});
    return {
      id:i, name:c.name, short:c.short, color:c.color, city:c.city, rep:c.rep, badge:null,
      prestige:Math.round(clamp(c.rep+rnd(-5,5),15,95)),
      tactic:"Equilibrado", morale:Math.round(rnd(60,75)), fans:Math.round(clamp(c.rep+rnd(-8,8),40,95)),
      squad, staff,
      venues:[main, old, nat], venueIdx:0,
      training:{fields:Math.max(1,Math.round(c.rep/28)), equipment:Math.round(clamp(c.rep-15,20,90)),
        intensity:"normal", focus:"geral", individual:{}},
      proficiency:{defense:50, attack:50, possession:50, setPieces:50, penalties:50},
      sponsor:{name:"Contrato padrão", perRound:Math.round(Math.pow(c.rep,1.35)*640 + rnd(0,40000))},
      finance:{ balance: Math.round(c.rep*300000 + rnd(-2e6,4e6)), ledger:[] },
      kit:{pattern:"solid", primary:c.color, secondary:"#eef2f7", image:null},
      lineup:null,
      discipline:{closedDoors:0, history:[]},
      prospects:[],
    };
  });
  const fixtures = makeSchedule(clubs.map(c=>c.id));
  const w = { clubs, fixtures, round:0, season:2026, userId:null, leagueName:"Ligue de Dournéa",
    customFormations:[], phase:"league", transferList:[], friendlies:[] };
  refreshMarket(w);
  return w;
}

/* ---------- Melhor XI e linhas de força ---------- */
/* Formações: slots (posições, na ordem) + coordenadas na prancheta vertical (viewBox 68x105, gol embaixo) */
export const FORMATIONS = {
  "4-3-3":{ slots:["GOL","LAT","ZAG","ZAG","LAT","VOL","MEI","MEI","PON","ATA","PON"],
    pos:[{x:34,y:97},{x:9,y:78},{x:25,y:80},{x:43,y:80},{x:59,y:78},{x:34,y:60},{x:20,y:52},{x:48,y:52},{x:12,y:30},{x:34,y:23},{x:56,y:30}] },
  "4-4-2":{ slots:["GOL","LAT","ZAG","ZAG","LAT","PON","VOL","VOL","PON","ATA","ATA"],
    pos:[{x:34,y:97},{x:9,y:80},{x:25,y:82},{x:43,y:82},{x:59,y:80},{x:9,y:55},{x:26,y:58},{x:42,y:58},{x:59,y:55},{x:24,y:26},{x:44,y:26}] },
  "3-5-2":{ slots:["GOL","ZAG","ZAG","ZAG","LAT","MEI","VOL","MEI","LAT","ATA","ATA"],
    pos:[{x:34,y:97},{x:18,y:82},{x:34,y:84},{x:50,y:82},{x:8,y:58},{x:24,y:55},{x:34,y:64},{x:44,y:55},{x:60,y:58},{x:26,y:26},{x:42,y:26}] },
  "4-2-3-1":{ slots:["GOL","LAT","ZAG","ZAG","LAT","VOL","VOL","PON","MEI","PON","ATA"],
    pos:[{x:34,y:97},{x:9,y:80},{x:25,y:82},{x:43,y:82},{x:59,y:80},{x:26,y:62},{x:42,y:62},{x:12,y:42},{x:34,y:44},{x:56,y:42},{x:34,y:22}] },
};
export const catOf = slot => slot==="GOL"?"GK":(["ZAG","LAT"].includes(slot)?"DEF":(["VOL","MEI"].includes(slot)?"MID":"ATT"));
export const SLOT_LIST = ["GOL","ZAG","LAT","VOL","MEI","PON","ATA"];
export const SLOT_PT = {GOL:"Goleiro",ZAG:"Zagueiro",LAT:"Lateral",VOL:"Volante",MEI:"Meia",PON:"Ponta",ATA:"Atacante"};

/* Posição no campo (prancheta 68x105, gol embaixo) → função automática */
export function slotFromPos(x,y){
  if(y>=88) return "GOL";
  const wide = x<18 || x>50;
  if(y>=62) return wide?"LAT":"ZAG";
  if(y>=38) return wide?"PON":(y>=50?"VOL":"MEI");
  return wide?"PON":"ATA";
}
/* Instruções individuais. atk/def = como o jogador distribui seu rendimento.
   stam = desgaste (box-to-box cansa mais). mark = marca um adversário específico. */
export const ROLES = {
  GK:  [ {k:"tradicional", l:"Tradicional",            atk:1.00, def:1.00, stam:1.0},
         {k:"libero",      l:"Goleiro-líbero",         atk:1.06, def:0.95, stam:1.05} ],
  DEF: [ {k:"zona",        l:"Marcar por zona",        atk:1.00, def:1.06, stam:1.0},
         {k:"homem",       l:"Marcação individual",    atk:0.90, def:1.00, stam:1.25, mark:true},
         {k:"saida",       l:"Sair jogando",           atk:1.16, def:0.90, stam:1.1} ],
  MID: [ {k:"box",         l:"Box-to-box",             atk:1.06, def:1.06, stam:1.4},
         {k:"armador",     l:"Armador (criação)",      atk:1.20, def:0.84, stam:1.0},
         {k:"passador",    l:"Passador",               atk:1.10, def:0.96, stam:0.95},
         {k:"volante",     l:"Volante (proteção)",     atk:0.84, def:1.22, stam:1.05} ],
  ATT: [ {k:"finalizador", l:"Finalizador",            atk:1.16, def:0.84, stam:1.0},
         {k:"pivo",        l:"Pivô (referência)",      atk:1.06, def:0.96, stam:1.05},
         {k:"movel",       l:"Móvel (recua e ajuda)",  atk:0.94, def:1.16, stam:1.3} ],
};
export const roleList = cat => ROLES[cat]||ROLES.MID;
export const defaultRole = cat => (ROLES[cat]||ROLES.MID)[0].k;
export function roleDef(cat,k){ const L=ROLES[cat]||ROLES.MID; return L.find(r=>r.k===k)||L[0]; }

/* Jogador colado na linha lateral fica isolado: participa menos do jogo */
const isolation = x => { const d=Math.min(x, 68-x); return d>=8?0:Math.min(0.14,(8-d)*0.018); };
const channelOf = x => x<23?"L" : x>45?"R" : "C";
const MIRROR = {L:"R", C:"C", R:"L"};

function autoAssign(pool, slots){
  const used=new Set(), res=[];
  for(const slot of slots){ let best=null,br=-1;
    for(const p of pool){ if(used.has(p.id))continue; const r=effectiveRating(p,slot); if(r>br){br=r;best=p;} }
    used.add(best.id); res.push(best);
  }
  return res;
}
/* melhor escalação (lista de ids) para uma formação */
export function bestLineup(team, formation){
  const slots=FORMATIONS[formation].slots;
  const avail=team.squad.filter(p=>p.injury<=0);
  return autoAssign(avail.length>=slots.length?avail:team.squad, slots).map(p=>p.id);
}
/* reencaixa os mesmos jogadores em outra formação (melhor ajuste) */
export function fitToFormation(playerIds, team, formation){
  const slots=FORMATIONS[formation].slots;
  const pool=playerIds.map(id=>team.squad.find(p=>p.id===id)).filter(Boolean);
  return autoAssign(pool, slots).map(p=>p.id);
}
/* Escalação livre: cada "spot" tem posição (x,y) no campo, função, instrução e alvo de marcação */
export function lineupFromTemplate(team, name){
  const F=FORMATIONS[name]||FORMATIONS["4-3-3"];
  const ids=bestLineup(team, FORMATIONS[name]?name:"4-3-3");
  return { name, spots: F.slots.map((slot,i)=>({
    id:ids[i], x:F.pos[i].x, y:F.pos[i].y, slot, locked:false,
    role:defaultRole(catOf(slot)), markId:null })) };
}
export function ensureLineup(team){
  if(team.lineup && Array.isArray(team.lineup.spots) && team.lineup.spots.length===11) return team.lineup;
  team.lineup = lineupFromTemplate(team, "4-3-3");
  return team.lineup;
}
/* aplica uma formação salva (posições/funções/instruções), reatribuindo os melhores jogadores */
export function applySavedFormation(team, custom){
  const slots=custom.spots.map(s=>s.slot);
  const avail=team.squad.filter(p=>p.injury<=0);
  const ids=autoAssign(avail.length>=11?avail:team.squad, slots).map(p=>p.id);
  team.lineup={ name:custom.name, spots:custom.spots.map((s,i)=>({...s, id:ids[i], markId:null})) };
  return team.lineup;
}
/* XI efetivo: resolve jogadores (substituindo lesionados) mantendo posição/função/instrução */
export function getXI(team){
  const lu=ensureLineup(team);
  const avail=team.squad.filter(p=>p.injury<=0);
  const used=new Set();
  const resolved=lu.spots.map(s=>{
    const p=team.squad.find(x=>x.id===s.id);
    if(p && p.injury<=0 && !used.has(p.id)){ used.add(p.id); return p; }
    return null;
  });
  for(let i=0;i<lu.spots.length;i++){
    if(!resolved[i]){
      let best=null,br=-1;
      for(const q of avail){ if(used.has(q.id))continue; const r=effectiveRating(q,lu.spots[i].slot); if(r>br){br=r;best=q;} }
      if(best){ used.add(best.id); resolved[i]=best; }
    }
  }
  if(resolved.some(p=>!p)){
    const fb=autoAssign(team.squad, lu.spots.map(s=>s.slot));
    resolved.forEach((p,i)=>{ if(!p) resolved[i]=fb[i]; });
  }
  return lu.spots.map((s,i)=>({
    player:resolved[i], slot:s.slot, x:s.x, y:s.y, role:s.role, markId:s.markId, locked:s.locked,
    rating:effectiveRating(resolved[i], s.slot)
  }));
}
export const buildXI = getXI;   // compat
const TACTICS = {
  Defensivo:{atk:0.85,def:1.15,tempo:0.90}, Equilibrado:{atk:1,def:1,tempo:1},
  Ofensivo:{atk:1.18,def:0.88,tempo:1.10},
};
/* ---------------------------------------------------------------
   computeLines: força dos DOIS times ao mesmo tempo, porque agora o
   posicionamento vale *em relação ao adversário* (duelo por canal) e
   a marcação individual mexe no jogador marcado do outro time.
   --------------------------------------------------------------- */
const CH_OVER = {L:"a esquerda", C:"o meio", R:"a direita"};      // "Você sobrecarrega ..."
const CH_WEAK = {L:"pela esquerda", C:"no meio", R:"pela direita"}; // "Pouca presença ..."
export function computeLines(home, xiH, away, xiA, tacticH=home.tactic, tacticA=away.tactic){
  const prep = xi => xi.map(e=>{
    const cat=catOf(e.slot), rd=roleDef(cat, e.role);
    const fitF = e.fit!=null ? (0.8+0.2*e.fit/100) : 1;
    const base = e.rating * fitF * (1-isolation(e.x));    // colado na linha = menos participação
    return {...e, cat, rd, ch:channelOf(e.x), atkV:base*rd.atk, defV:base*rd.def};
  });
  const H=prep(xiH), A=prep(xiA);

  // marcação individual: quem marca reduz o marcado (e se dedica menos ao ataque)
  const applyMark=(markers,targets)=>{
    for(const m of markers){
      if(!m.rd.mark || !m.markId) continue;
      const t=targets.find(x=>x.player.id===m.markId);
      if(!t) continue;                                   // alvo não está em campo → sem efeito
      const eff=m.defV/(m.defV+t.atkV);                  // qualidade do marcador vs marcado
      const cut=0.15+eff*0.30;                           // corta 15%–45% do marcado
      t.atkV*=(1-cut); t.defV*=(1-cut*0.5); t.markedBy=m.player.name;
      m.atkV*=0.85; m.marking=t.player.name;
    }
  };
  applyMark(H,A); applyMark(A,H);

  // presença por canal (esquerda / meio / direita)
  const presence=T=>{
    const att={L:0,C:0,R:0}, def={L:0,C:0,R:0};
    for(const e of T){
      if(e.cat==="ATT"){ att[e.ch]+=e.atkV; }
      else if(e.cat==="MID"){ att[e.ch]+=e.atkV*0.5; def[e.ch]+=e.defV*0.5; }
      else if(e.cat==="DEF"){ def[e.ch]+=e.defV; }
    }
    return {att,def};
  };
  const pH=presence(H), pA=presence(A);
  // meu ataque pela esquerda enfrenta a defesa DELES pela direita
  const duel=(mine,opp,name)=>{
    const notes=[]; let sum=0;
    for(const ch of ["L","C","R"]){
      const m=mine.att[ch], o=opp.def[MIRROR[ch]];
      const adv=(m-o)/(m+o+1); sum+=adv;
      if(adv>0.22) notes.push(`Você sobrecarrega ${CH_OVER[ch]} — o adversário está exposto ali.`);
      else if(adv<-0.25) notes.push(`Pouca presença ${CH_WEAK[ch]} — o adversário domina esse setor.`);
    }
    return { mult: 1+Math.max(-0.12, Math.min(0.12, sum/3*0.30)), notes };
  };
  const dH=duel(pH,pA), dA=duel(pA,pH);

  const lines=(team,T,isHome,tactic,atkMult)=>{
    const eff=staffEffects(team);
    const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:60;
    const gkE=T.find(e=>e.cat==="GK");
    const defs=T.filter(e=>e.cat==="DEF"), mids=T.filter(e=>e.cat==="MID"), atts=T.filter(e=>e.cat==="ATT");
    const midA=avg(mids.map(e=>e.atkV)), midD=avg(mids.map(e=>e.defV));
    let gk=(gkE?gkE.defV:60)*eff.gkMult;
    let mid=(midA+midD)/2;
    let def=avg(defs.map(e=>e.defV))*0.85 + midD*0.15;
    let atk=avg(atts.map(e=>e.atkV))*0.85 + midA*0.15;
    def*=eff.overallMult; mid*=eff.overallMult; atk*=eff.overallMult;
    const P=team.proficiency||{};                        // treino da semana a semana
    def*=0.95+(P.defense??50)/1000;
    atk*=0.95+(P.attack??50)/1000;
    mid*=0.95+(P.possession??50)/1000;
    const t=TACTICS[tactic]||TACTICS.Equilibrado;
    // mando de campo vem sobretudo da ATMOSFERA (a torcida já está embutida nela — não conta duas vezes)
    let homeF = isHome ? 1 + atmosphere(team)/100*0.16 + (team.morale-50)/500
                       : 1 + (team.morale-50)/700;
    return { gk, def:def*t.def*homeF, mid:mid*homeF, atk:atk*t.atk*homeF*atkMult,
      tempo:t.tempo, xi:T, fatigueRed:eff.fatigueRed,
      aggression: tactic==="Ofensivo"?1.15:tactic==="Defensivo"?1.2:1.0 };
  };
  return {
    home: lines(home,H,true,tacticH,dH.mult),
    away: lines(away,A,false,tacticA,dA.mult),
    notes:{home:dH.notes, away:dA.notes},
  };
}
/* força isolada (para telas fora de jogo) */
export function teamLines(team, isHome){
  const xi=getXI(team);
  const r=computeLines(team, xi, team, xi, team.tactic, team.tactic);
  return isHome?r.home:r.away;
}

/* ---------- Motor de partida (headless) ---------- */
function pickScorer(xi){
  const cand = xi.filter(s=>["ATA","PON","MEI"].includes(s.slot));
  const w = cand.map(s=> s.rating*(s.slot==="ATA"?1.6:s.slot==="PON"?1.2:0.7));
  let r=Math.random()*w.reduce((a,b)=>a+b,0);
  for(let i=0;i<cand.length;i++){ if((r-=w[i])<=0) return cand[i].player.name; }
  return cand[0].player.name;
}
function foulerEntry(xi){
  const c=xi.filter(s=>["ZAG","LAT","VOL","MEI"].includes(s.slot));
  return c.length?pick(c):pick(xi);
}
function blank(){return {shots:0,on:0,fouls:0,yellow:0,red:0,poss:0,corners:0};}

/* ---------------------------------------------------------------
   LiveMatch — o MESMO motor serve para assistir ao vivo e para o
   quick-sim, garantindo resultados consistentes na liga inteira.
   Aceita substituição e mudança de tática no meio do jogo.
   --------------------------------------------------------------- */
export const MAX_SUBS = 5;

/* Estado emocional do time: muda como ele joga (e o quanto perde a cabeça) */
export const EMO = {
  "Focado":      {atk:1.00, def:1.00, agg:1.00},
  "Aceso":       {atk:1.02, def:1.00, agg:1.20},
  "Confiante":   {atk:1.03, def:1.03, agg:0.95},
  "Nervoso":     {atk:0.94, def:0.94, agg:1.10},
  "Irritado":    {atk:1.05, def:0.97, agg:1.65},
  "Desesperado": {atk:1.10, def:0.90, agg:1.35},
};
/* Importância do jogo: alimenta a tensão desde o apito inicial */
export function matchContext(world, fx){
  const table=computeTable(world);
  const posOf=id=>table.findIndex(r=>r.id===id)+1;
  const ph=posOf(fx.home), pa=posOf(fx.away), n=table.length;
  const tot=totalRounds(world), late=world.round/Math.max(1,tot-1);
  let stakes=0.10+late*0.35, label="Jogo de rotina";
  if(world.round >= tot*0.5){                     // só no returno a tabela pesa
    if(ph<=3 && pa<=3){ stakes+=0.40; label="Confronto direto pelo título"; }
    else if(ph>=n-3 && pa>=n-3){ stakes+=0.35; label="Duelo contra o rebaixamento"; }
    else if(Math.abs(ph-pa)<=2 && (ph<=6||pa<=6)){ stakes+=0.18; label="Briga direta na parte de cima"; }
  }
  return {stakes:Math.min(1,stakes), label, posHome:ph, posAway:pa};
}

export class LiveMatch{
  constructor(home, away, ctx){
    this.home=home; this.away=away;
    // chegam ao jogo com o condicionamento que a semana de treino deixou
    const fitOf=s=> s.player.condition!=null ? s.player.condition : 100;
    this.xi={ home:getXI(home).map(s=>({...s, fit:fitOf(s)})), away:getXI(away).map(s=>({...s, fit:fitOf(s)})) };
    this.tactic={home:home.tactic, away:away.tactic};
    this.subsUsed={home:0, away:0};
    this.subbedOff={home:new Set(), away:new Set()};
    this.minute=0; this.stoppage=2+Math.floor(Math.random()*4);
    this.score={home:0, away:0};
    this.stats={home:blank(), away:blank()};
    this.events=[]; this.scorers=[]; this.finished=false; this.territory=0;
    // clima / caos
    this.ctx = ctx || {stakes:0.25, label:"Jogo de rotina"};
    this.tension = 15 + this.ctx.stakes*30;      // já começa quente se o jogo vale muito
    this.incidents=[]; this.invasions=0; this.abandoned=false;
    this.boost={home:1, away:1}; this.boostEnd={home:0, away:0};
    // clima do jogo (roda no estádio do mandante)
    this.venue = stadiumOf(home);
    this.weather = (ctx && ctx.weather) || makeWeather(home.city);
    this.recompute();
  }
  emotionOf(side){
    const diff = side==="home" ? this.score.home-this.score.away : this.score.away-this.score.home;
    const t=this.tension;
    if(diff<=-2 && t>62) return "Irritado";
    if(diff<=-1 && this.minute>70) return "Desesperado";
    if(t>78) return "Nervoso";
    if(diff>=2) return "Confiante";
    if(t>55) return "Aceso";
    return "Focado";
  }
  recompute(){
    const r=computeLines(this.home, this.xi.home, this.away, this.xi.away, this.tactic.home, this.tactic.away);
    this.L={home:r.home, away:r.away};
    this.notes=r.notes;
  }
  _clk(){ return this.minute<=90 ? this.minute+"'" : "90+"+(this.minute-90)+"'"; }
  clubOf(side){ return side==="home"?this.home:this.away; }

  setTactic(side, tactic){
    this.tactic[side]=tactic; this.recompute();
    const e={min:this._clk(), type:"tactic", side, ic:"⚙️", tx:`${this.clubOf(side).name} muda para ${tactic}.`};
    this.events.push(e); return e;
  }
  /* muda a formação no meio do jogo: reencaixa os MESMOS 11 nas novas posições */
  setFormation(side, name){
    const F=FORMATIONS[name]; if(!F) return {ok:false};
    const cur=this.xi[side];
    const players=cur.map(s=>s.player);
    const byId={}; cur.forEach(s=>{ byId[s.player.id]={fit:s.fit, yellow:s.yellow, red:s.red}; });
    // atribui greedy: para cada slot, o jogador restante que melhor se encaixa
    const used=new Set(), xi=[];
    for(const slot of F.slots){
      let best=null,br=-1;
      for(const p of players){ if(used.has(p.id))continue; const r=effectiveRating(p,slot); if(r>br){br=r;best=p;} }
      used.add(best.id);
      const meta=byId[best.id]||{};
      xi.push({player:best, slot, rating:effectiveRating(best,slot), role:defaultRole(catOf(slot)),
        markId:null, fit:meta.fit!=null?meta.fit:100, yellow:meta.yellow, red:meta.red});
    }
    this.xi[side]=xi; this.formationName=this.formationName||{}; this.formationName[side]=name;
    this.recompute();
    const e={min:this._clk(), type:"tactic", side, ic:"📐", tx:`${this.clubOf(side).name} muda a formação para ${name}.`};
    this.events.push(e); return {ok:true, event:e};
  }
  benchOf(side){
    const club=this.clubOf(side);
    const inXI=new Set(this.xi[side].map(s=>s.player.id));
    return club.squad.filter(p=>!inXI.has(p.id) && p.injury<=0 && !this.subbedOff[side].has(p.id));
  }
  substitute(side, slotIdx, inPlayerId){
    if(this.subsUsed[side]>=MAX_SUBS) return {ok:false, msg:`Limite de ${MAX_SUBS} substituições.`};
    const club=this.clubOf(side);
    const inP=club.squad.find(p=>p.id===inPlayerId);
    const entry=this.xi[side][slotIdx];
    if(!inP || !entry) return {ok:false, msg:"Jogador inválido."};
    const outP=entry.player;
    this.xi[side][slotIdx]={...entry, player:inP, rating:effectiveRating(inP,entry.slot), fit:100};
    this.subbedOff[side].add(outP.id); this.subsUsed[side]++;
    this.recompute();
    const e={min:this._clk(), type:"sub", side, ic:"🔁", tx:`${club.name}: entra ${inP.name}, sai ${outP.name}.`};
    this.events.push(e);
    return {ok:true, event:e};
  }

  tick(){
    if(this.finished) return [];
    this.minute++;
    const evs=[];
    // clima evolui e afeta o jogo
    stepWeather(this.weather, this.minute);
    const wx=pitchWeatherEffect(this.venue, this.weather);
    this.wx=wx;
    // desgaste individual (fôlego do jogador + preparador físico + campo pesado/frio)
    for(const side of ["home","away"]){
      const fr=this.L[side].fatigueRed;
      for(const s of this.xi[side]){
        const stam=(s.player.attrs && s.player.attrs.stamina)||60;
        const rd=roleDef(catOf(s.slot), s.role);          // box-to-box cansa mais
        s.fit=Math.max(30, s.fit - 0.55*(1-stam/200)*(1-fr)*(rd.stam||1)*wx.fatigue);
      }
    }
    if(this.minute%5===0) this.recompute();      // reflete o cansaço periodicamente

    // tensão sobe com o tempo e com o que está em jogo (com decaimento, para variar de jogo p/ jogo)
    this.tension += 0.03 + this.ctx.stakes*0.06;
    if(this.minute>75) this.tension += 0.08;
    this.tension = Math.max(0, Math.min(100, this.tension*0.997));

    // emoção altera rendimento e agressividade
    const eH=EMO[this.emotionOf("home")], eA=EMO[this.emotionOf("away")];
    const bH=this.minute<=this.boostEnd.home?this.boost.home:1;
    const bA=this.minute<=this.boostEnd.away?this.boost.away:1;
    const LH={...this.L.home, atk:this.L.home.atk*eH.atk*bH, def:this.L.home.def*eH.def,
              aggression:this.L.home.aggression*eH.agg};
    const LA={...this.L.away, atk:this.L.away.atk*eA.atk*bA, def:this.L.away.def*eA.def,
              aggression:this.L.away.aggression*eA.agg};

    // campo pesado/molhado embola o meio-campo (passe pior)
    const powH=(LH.atk*0.6+LH.mid*0.4*wx.pass), powA=(LA.atk*0.6+LA.mid*0.4*wx.pass);
    const tot=powH+powA;
    this.stats.home.poss+=powH/tot; this.stats.away.poss+=powA/tot;
    let target=(powH-powA)/tot*0.6;

    // bola parada agora também faz gol → jogada aberta cede um pouco p/ o total ficar realista
    if(Math.random() < 0.275*(LH.tempo+LA.tempo)/2){
      const hAtt=Math.random()<powH/tot;
      const aL=hAtt?LH:LA, dL=hAtt?LA:LH, side=hAtt?"home":"away";
      const club=this.clubOf(side), xi=this.xi[side];
      target = hAtt?0.85:-0.85;
      if(Math.random() < aL.atk/(aL.atk+dL.def*0.9)){
        this.stats[side].shots++;
        const sc=pickScorer(xi);
        if(Math.random() < 0.55*(0.75+0.25*wx.grip) - wx.windShot*Math.random()*0.7){   // vento/aderência erram o alvo
          this.stats[side].on++;
          if(Math.random() < 0.62*(0.82+0.18*wx.grip)*(aL.atk/(aL.atk+dL.gk))){
            this.score[side]++;
            const min=this.minute<=90?this.minute:90;
            this.scorers.push({team:side, name:sc, minute:min});
            evs.push({min:this._clk(),type:"goal",side,ic:"⚽",tx:`GOL do ${club.name}! ${sc} balança as redes!`});
            this.tension += 4 + this.ctx.stakes*3;      // gol esquenta o jogo
            target=0;
          } else evs.push({min:this._clk(),type:"save",side,ic:"🧤",tx:`${sc} finaliza, mas o goleiro defende!`});
        } else {
          if(Math.random()<0.4){ this.stats[side].corners++;
            evs.push({min:this._clk(),type:"chance",side,ic:"🚩",tx:`${sc} obriga o zagueiro a mandar para escanteio.`}); }
          else evs.push({min:this._clk(),type:"miss",side,ic:"🎯",tx:`${sc} arrisca e manda por cima.`});
        }
      } else if(Math.random()<0.4){
        evs.push({min:this._clk(),type:"chance",side,ic:"⚡",tx:`${club.name} chega com ${pickScorer(xi)}, mas a defesa afasta.`});
      }
    }
    this.territory += (target-this.territory)*0.35 + (Math.random()-0.5)*0.22;
    this.territory = Math.max(-1, Math.min(1, this.territory));

    if(Math.random()<0.10){
      const hf=Math.random()<0.5, side=hf?"home":"away", club=this.clubOf(side);
      this.stats[side].fouls++; this.tension += 0.5;
      const agg=(hf?LH:LA).aggression, r=Math.random(), fe=foulerEntry(this.xi[side]), who=fe.player.name;
      if(r<0.012*agg){ this.stats[side].red++; this.tension += 10; fe.red=true;
        evs.push({min:this._clk(),type:"red",side,ic:"🟥",tx:`VERMELHO para ${who} (${club.name})!`}); }
      else if(r<0.20*agg){ this.stats[side].yellow++; this.tension += 2;
        if(fe.yellow){ fe.red=true; this.stats[side].red++;   // 2º amarelo = vermelho
          evs.push({min:this._clk(),type:"red",side,ic:"🟥",tx:`SEGUNDO amarelo! ${who} (${club.name}) está expulso!`}); }
        else { fe.yellow=true;
          evs.push({min:this._clk(),type:"yellow",side,ic:"🟨",tx:`Amarelo para ${who} (${club.name}).`}); } }
      // a falta foi de quem? a bola parada é do OUTRO time
      const att = side==="home" ? "away" : "home";
      if(Math.random()<0.03) this._penalty(att, evs);        // falta dentro da área (~0.27/jogo)
      else if(Math.random()<0.12) this._freeKick(att, evs);  // falta perigosa
    }

    this._rollChaos(evs);
    if(this.minute===45)
      evs.push({min:"45'",type:"ht",ic:"⏸",tx:`Intervalo. ${this.home.short} ${this.score.home} x ${this.score.away} ${this.away.short}.`});
    if(this.minute>=90+this.stoppage){
      this.finished=true;
      evs.push({min:"FIM",type:"ft",ic:"🏁",tx:`Fim de jogo! ${this.home.name} ${this.score.home} x ${this.score.away} ${this.away.name}.`});
    }
    this.events.push(...evs);
    return evs;
  }
  /* -------- Bolas paradas: é aqui que o treino de pênalti/falta aparece -------- */
  _bestBy(side, attr){
    const xi=this.xi[side].filter(s=>s.slot!=="GOL");
    return xi.reduce((b,s)=> (s.player.attrs[attr]||0) > (b.player.attrs[attr]||0) ? s : b, xi[0]).player;
  }
  _scoreGoal(side, name, evs, ic, tx){
    this.score[side]++;
    this.scorers.push({team:side, name, minute:this.minute<=90?this.minute:90});
    this.tension += 4 + this.ctx.stakes*3;
    evs.push({min:this._clk(), type:"goal", side, ic, tx});
  }
  _penalty(side, evs){
    const club=this.clubOf(side), taker=this._bestBy(side,"finishing");
    const prof=(club.proficiency&&club.proficiency.penalties)??50;
    this.stats[side].shots++; this.stats[side].on++; this.tension += 6;
    evs.push({min:this._clk(), type:"chance", side, ic:"⚖️", tx:`PÊNALTI para o ${club.name}! ${taker.name} vai bater.`});
    const p = 0.58 + prof/100*0.26 + (taker.attrs.finishing||60)/100*0.10;
    if(Math.random()<p) this._scoreGoal(side, taker.name, evs, "⚽", `${taker.name} converte o pênalti!`);
    else evs.push({min:this._clk(), type:"save", side, ic:"🧤", tx:`${taker.name} PERDE o pênalti!`});
  }
  _freeKick(side, evs){
    const club=this.clubOf(side), taker=this._bestBy(side,"technique");
    const prof=(club.proficiency&&club.proficiency.setPieces)??50;
    this.stats[side].shots++;
    const p = 0.03 + prof/100*0.11 + (taker.attrs.technique||60)/100*0.04;
    if(Math.random()<p){ this.stats[side].on++;
      this._scoreGoal(side, taker.name, evs, "⚽", `GOL DE FALTA! ${taker.name} acerta o ângulo!`); }
    else if(Math.random()<0.4){ this.stats[side].on++;
      evs.push({min:this._clk(), type:"save", side, ic:"🧤", tx:`${taker.name} bate a falta e o goleiro espalma.`}); }
    else evs.push({min:this._clk(), type:"miss", side, ic:"🎯", tx:`${taker.name} bate a falta por cima.`});
  }

  /* -------- CAOS: eventos pré-programados, disparados por condições -------- */
  _rollChaos(evs){
    const H=this.home, A=this.away, T=this.tension;
    const atmo=atmosphere(H), closed=isClosedDoors(H);
    const diff=this.score.home-this.score.away;      // do ponto de vista do mandante
    const push=(e)=>evs.push(e);

    // 1) Briga / confusão entre jogadores — tensão alta
    if(T>62 && this.minute>15 && Math.random() < (T-62)/38*0.008){
      const p1=pick(this.xi.home).player.name, p2=pick(this.xi.away).player.name;
      this.stats.home.yellow++; this.stats.away.yellow++;
      this.tension=Math.min(100,T+10); this.stoppage+=2;
      push({min:this._clk(),type:"chaos",ic:"🥊",
        tx:`CONFUSÃO! ${p1} e ${p2} se estranham, jogadores dos dois times se envolvem. Amarelos para ambos.`});
      if(Math.random()<0.30){
        const side=Math.random()<0.5?"home":"away", club=this.clubOf(side);
        this.stats[side].red++;
        push({min:this._clk(),type:"red",side,ic:"🟥",
          tx:`${pick(this.xi[side]).player.name} (${club.name}) é expulso pela confusão!`});
      }
      this.incidents.push({type:"brawl", clubId:H.id});
      this.incidents.push({type:"brawl", clubId:A.id});
    }
    // 2) Objetos arremessados — torcida da casa revoltada
    if(!closed && atmo>42 && T>58 && diff<0 && this.minute>25 && Math.random()<0.004){
      this.stoppage+=2; this.tension=Math.min(100,T+6);
      push({min:this._clk(),type:"chaos",ic:"🥤",
        tx:`Objetos arremessados no campo pela torcida do ${H.name}. Árbitro paralisa a partida.`});
      this.incidents.push({type:"objects", clubId:H.id});
    }
    // 3) Invasão de campo — perdendo feio em casa, jogo grande, estádio quente
    if(!closed && atmo>52 && T>66 && diff<=-2 && this.minute>55 && Math.random()<0.010){
      this.invasions++; this.stoppage+=5; this.tension=Math.min(100,T+8);
      push({min:this._clk(),type:"chaos",ic:"🚨",
        tx:`INVASÃO DE CAMPO! Torcedores do ${H.name} pulam o alambrado e o jogo é paralisado.`});
      this.incidents.push({type:"invasion", clubId:H.id});
    }
    // 4) Torcida empurra o time (positivo) — perdendo por 1 no fim, com casa cheia
    if(!closed && atmo>58 && diff===-1 && this.minute>68 && this.boostEnd.home<this.minute && Math.random()<0.020){
      this.boost.home=1.12; this.boostEnd.home=this.minute+15;
      push({min:this._clk(),type:"chaos",ic:"📣",
        tx:`A torcida do ${H.name} empurra o time! O estádio vem abaixo e a equipe se lança ao ataque.`});
    }
    // 5) Vaias — perdendo feio em casa
    if(!closed && atmo>40 && diff<=-2 && this.minute>60 && this.boostEnd.home<this.minute && Math.random()<0.018){
      this.boost.home=0.93; this.boostEnd.home=this.minute+12; this.tension=Math.min(100,T+4);
      push({min:this._clk(),type:"chaos",ic:"👎",
        tx:`Vaias fortes no ${stadiumOf(H).name}. O time da casa sente o clima pesar.`});
    }
    // 6) Expulsão por reclamação — cabeça quente
    if(T>72 && Math.random()<0.0018){
      const side=Math.random()<0.5?"home":"away", club=this.clubOf(side);
      this.stats[side].red++; this.tension=Math.min(100,T+8);
      push({min:this._clk(),type:"red",side,ic:"🟥",
        tx:`${pick(this.xi[side]).player.name} (${club.name}) é expulso por reclamação!`});
    }
    // 7) Partida suspensa — o caos passou do ponto
    if(this.invasions>=2 && !this.abandoned && Math.random()<0.06){
      this.abandoned=true; this.finished=true;
      push({min:this._clk(),type:"chaos",ic:"⛔",
        tx:`PARTIDA SUSPENSA! Após nova invasão, o árbitro encerra o jogo no ${stadiumOf(H).name}.`});
      this.incidents.push({type:"abandoned", clubId:H.id});
    }
  }
  finishAll(){ while(!this.finished) this.tick(); }
  possession(){ const t=this.stats.home.poss+this.stats.away.poss||1; return Math.round(this.stats.home.poss/t*100); }
  result(){ return {home:this.score.home, away:this.score.away, scorers:this.scorers,
    stats:this.stats, incidents:this.incidents, abandoned:this.abandoned}; }
}

/* quick-sim: mesmo motor, sem UI (o caos também acontece nos jogos da IA) */
export function simulateMatch(home, away, ctx){
  const m=new LiveMatch(home,away,ctx); m.finishAll(); return m.result();
}

/* Punições da federação por incidente */
export const PUNISH = {
  brawl:     {fine:180000,  closed:0, label:"Confusão entre jogadores"},
  objects:   {fine:450000,  closed:0, label:"Objetos arremessados pela torcida"},
  invasion:  {fine:1200000, closed:2, label:"Invasão de campo"},
  abandoned: {fine:3000000, closed:3, label:"Partida suspensa por falta de segurança"},
};

/* ---------- Calendário / tabela ---------- */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
export function makeSchedule(ids){
  const teams = shuffle(ids); if(teams.length%2) teams.push(-1);   // embaralha => tabela diferente a cada temporada
  const n=teams.length, half=n/2, rounds=[]; let arr=teams.slice();
  for(let r=0; r<n-1; r++){
    const round=[];
    for(let i=0;i<half;i++){ const a=arr[i], b=arr[n-1-i];
      if(a!==-1 && b!==-1) round.push(r%2? {home:b,away:a}:{home:a,away:b}); }
    rounds.push(round);
    arr = [arr[0], arr[n-1], ...arr.slice(1,n-1)];
  }
  const ret = rounds.map(rd=> rd.map(g=>({home:g.away, away:g.home})));
  const fixtures=[];
  [...rounds,...ret].forEach((rd,ri)=> rd.forEach(g=> fixtures.push({round:ri, home:g.home, away:g.away, result:null})));
  return fixtures;
}
export function computeTable(world){
  const row=id=>({id,P:0,J:0,V:0,E:0,D:0,GP:0,GC:0});
  const t={}; world.clubs.forEach(c=>t[c.id]=row(c.id));
  for(const f of world.fixtures){ if(!f.result)continue;
    const h=t[f.home], a=t[f.away], {home:hg, away:ag}=f.result;
    h.J++;a.J++;h.GP+=hg;h.GC+=ag;a.GP+=ag;a.GC+=hg;
    if(hg>ag){h.V++;a.D++;h.P+=3;} else if(hg<ag){a.V++;h.D++;a.P+=3;} else {h.E++;a.E++;h.P++;a.P++;}
  }
  return Object.values(t).map(r=>({...r,SG:r.GP-r.GC}))
    .sort((x,y)=> y.P-x.P || y.SG-x.SG || y.GP-x.GP);
}
export const totalRounds = world => Math.max(...world.fixtures.map(f=>f.round))+1;
export const fixturesOfRound = (world,r)=> world.fixtures.filter(f=>f.round===r);
export const clubById = (world,id)=> world.clubs.find(c=>c.id===id);
