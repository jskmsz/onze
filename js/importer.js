/* =====================================================================
   ONZE — importer.js
   Importa clubes e jogadores em massa (CSV ou JSON).
   O CSV de jogadores só precisa de `overall`: os 12 atributos são
   gerados a partir da posição, e você pode sobrescrever os que quiser.
   ===================================================================== */
import * as C from "./core.js";
import * as K from "./kit.js";
import { parseBrandsCSV as parseCSV } from "./brands.js";

/* vazio/ausente → valor padrão (Number("") é 0 e já causou população zerada) */
const num = (v,d=null)=>{
  if(v===undefined || v===null || String(v).trim()==="") return d;
  const n=Number(String(v).replace(",","."));
  return Number.isFinite(n)?n:d;
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* o parser de CSV normaliza cabeçalhos p/ minúsculas: aceita cityPop e citypop */
const F = (row,name)=>{
  if(row[name]!==undefined && String(row[name]).trim()!=="") return row[name];
  const k=name.toLowerCase();
  if(row[k]!==undefined && String(row[k]).trim()!=="") return row[k];
  return undefined;
};

/* perfil de atributos por posição (mesma lógica do gerador do jogo) */
const ARCH = {
  GOL:{goalkeeping:35, positioning:8, pace:-15, dribbling:-20, finishing:-25, passing:-8, tackling:-10, marking:-10},
  ZAG:{marking:14, tackling:14, strength:12, positioning:9, pace:-4, finishing:-22, dribbling:-16, goalkeeping:-45, vision:-6},
  LAT:{pace:12, stamina:12, tackling:6, dribbling:2, passing:2, finishing:-12, goalkeeping:-45, strength:-4},
  VOL:{tackling:12, marking:8, passing:6, stamina:9, positioning:7, strength:6, finishing:-10, goalkeeping:-45, pace:-2},
  MEI:{passing:14, vision:14, technique:11, dribbling:9, finishing:2, tackling:-8, marking:-12, goalkeeping:-45},
  PON:{pace:16, dribbling:16, technique:9, finishing:5, passing:2, tackling:-13, marking:-15, goalkeeping:-45, strength:-8},
  ATA:{finishing:17, positioning:13, technique:7, pace:7, strength:5, tackling:-17, marking:-19, passing:-6, goalkeeping:-45},
};
const POS_OK = ["GOL","ZAG","LAT","VOL","MEI","PON","ATA"];

/* Gera os 12 atributos a partir de overall+posição e depois calibra
   para que o `overall` final bata com o que você pediu.               */
export function attrsFromOverall(pos, overall, over={}){
  const off = ARCH[pos]||ARCH.MEI;
  let base = overall;
  let attrs, calc, tries=0;
  do{
    attrs={};
    for(const a of C.ATTRS){
      const o = over[a]!=null ? num(over[a]) : null;
      attrs[a] = o!=null ? clamp(o,20,99)
        : clamp(Math.round(base + (off[a]|| (a==="goalkeeping"?-40:0))), 20, 99);
    }
    calc = C.effectiveRating({attrs, pos}, pos);
    base += (overall - calc) * 0.9;                 // ajusta até bater
  } while(Math.abs(calc-overall)>1 && ++tries<12);
  return attrs;
}

export function makePlayerFrom(row, idFn){
  const rawPos=String(F(row,"pos")||"").toUpperCase();
  const pos = POS_OK.includes(rawPos) ? rawPos : "MEI";
  const overall = clamp(num(F(row,"overall"), 65), 20, 99);
  const age = clamp(num(F(row,"age"), 24), 15, 45);
  const over={}; for(const a of C.ATTRS){ const v=F(row,a); if(v!==undefined) over[a]=v; }
  const attrs = attrsFromOverall(pos, overall, over);
  const p = {
    id: idFn(), name: String(F(row,"name")||"Sem nome").trim(), pos, age,
    nat: String(F(row,"nat")||"dou").toLowerCase().trim(),
    attrs, morale:70, fitness:100, injury:0, condition:100,
  };
  p.overall = C.overall(p);
  p.potential = clamp(num(F(row,"potential"), Math.max(p.overall, p.overall + (age<=23?10:age<=27?4:0))), p.overall, 99);
  p.wage = C.wageFor(p);
  return p;
}

/* ---------- clubes ---------- */
export function makeClubFrom(row, i, tplClub){
  const c = JSON.parse(JSON.stringify(tplClub));      // usa um clube existente como molde
  c.id = i;
  c.name  = String(F(row,"name")||`Clube ${i+1}`).trim();
  c.short = String(F(row,"short")||c.name).toUpperCase().slice(0,4);
  c.city  = String(F(row,"city")||c.name).trim();
  c.cityPop = num(F(row,"cityPop"), 150000);
  c.founded = num(F(row,"founded"), 1900);
  const col=F(row,"color");
  c.color  = /^#[0-9a-f]{6}$/i.test(col||"") ? col : c.color;
  c.prestige = clamp(num(F(row,"prestige"), 55), 1, 100);
  c.fans     = clamp(num(F(row,"fans"), c.prestige), 20, 98);
  c.badge = F(row,"badge") ? String(F(row,"badge")).trim() : null;
  c.coords = { x: clamp(num(F(row,"x"), Math.random()),0,1), y: clamp(num(F(row,"y"), Math.random()),0,1) };
  const S = c.venues[0];
  S.name = String(F(row,"stadium") || ("Stade de "+c.city)).trim();
  S.capacity  = num(F(row,"capacity"), 25000);
  S.proximity = clamp(num(F(row,"proximity"), 65),0,100);
  S.enclosure = clamp(num(F(row,"enclosure"), 55),0,100);
  S.pitch     = clamp(num(F(row,"pitch"), 82),10,100);
  c.venueIdx = 0;
  if(!c.kitDesign)    c.kitDesign    = K.defaultKitDesign(c,false);
  if(!c.kitDesignAlt) c.kitDesignAlt = K.defaultKitDesign(c,true);
  if(F(row,"kitPattern")) c.kitDesign.pattern = String(F(row,"kitPattern")).trim();
  c.kitDesign.shirt  = F(row,"kitShirt")  || c.color;
  c.kitDesign.shorts = F(row,"kitShorts") || c.kitDesign.shorts;
  c.kitDesign.socks  = F(row,"kitSocks")  || c.color;
  c.kitDesign.detail = F(row,"kitDetail") || c.kitDesign.detail;
  c.squad = [];
  return c;
}

/* ---------- entrada principal ----------
   Aceita: JSON {clubs:[{...,players:[...]}]}  |  CSV de clubes  |  CSV de jogadores
   Devolve um relatório do que foi feito.                                 */
export function importData(world, files){
  const report={clubs:0, players:0, warnings:[]};
  let nextId = 1 + world.clubs.reduce((m,c)=>Math.max(m, ...c.squad.map(p=>p.id||0), 0), 0);
  const idFn=()=>nextId++;
  const tpl = world.clubs[0];
  if(!tpl) { report.warnings.push("Mundo sem clube-molde."); return report; }

  /* procura de trás pra frente: se você acabou de importar um clube com o
     mesmo nome de um já existente, os jogadores vão para o NOVO.        */
  const byName = n => {
    const k=String(n).toLowerCase().trim();
    for(let i=world.clubs.length-1;i>=0;i--){
      const c=world.clubs[i];
      if(c.name.toLowerCase()===k || c.short.toLowerCase()===k) return c;
    }
    return null;
  };

  for(const f of files){
    const txt=f.text, isJSON = f.name.match(/\.json$/i) || txt.trim().startsWith("{") || txt.trim().startsWith("[");
    if(isJSON){
      let data; try{ data=JSON.parse(txt); }catch(e){ report.warnings.push(`${f.name}: JSON inválido`); continue; }
      const list = Array.isArray(data) ? data : (data.clubs||[]);
      list.forEach((row,i)=>{
        const c = makeClubFrom(row, world.clubs.length, tpl);
        (row.players||[]).forEach(pr=> c.squad.push(makePlayerFrom(pr, idFn)));
        world.clubs.push(c); report.clubs++; report.players+=c.squad.length;
      });
      continue;
    }
    const rows = parseCSV(txt);
    if(!rows.length){ report.warnings.push(`${f.name}: vazio`); continue; }
    const head = Object.keys(rows[0]);
    const isPlayers = head.includes("club") && (head.includes("pos")||head.includes("overall"));
    if(isPlayers){
      for(const r of rows){
        const club = byName(F(r,"club"));
        if(!club){ report.warnings.push(`Clube não encontrado: "${F(r,"club")}" (jogador ${F(r,"name")})`); continue; }
        club.squad.push(makePlayerFrom(r, idFn)); report.players++;
      }
    } else {
      for(const r of rows){
        const c = makeClubFrom(r, world.clubs.length, tpl);
        world.clubs.push(c); report.clubs++;
      }
    }
  }
  // todo clube precisa de pelo menos 16 jogadores para escalar um XI
  for(const c of world.clubs){
    while(c.squad.length<16){
      const p=makePlayerFrom({name:"Reserva", pos:["GOL","ZAG","LAT","VOL","MEI","PON","ATA"][c.squad.length%7],
        age:20+(c.squad.length%8), overall:Math.max(35,(c.prestige||55)-18)}, idFn);
      c.squad.push(p); report.players++;
    }
  }
  world.fixtures = C.makeSchedule(world.clubs.map(c=>c.id));
  world.round = 0;
  return report;
}
