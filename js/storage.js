/* =====================================================================
   ONZE — storage.js
   Save/load em IndexedDB (aguenta centenas de MB, inclusive imagens de
   camisa em dataURL) + exportar/importar arquivo .json.
   ===================================================================== */
const DB="onze-db", STORE="saves", VER=1;

function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB,VER);
    r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}
export async function saveGame(world, slot="auto"){
  const db=await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).put({world, savedAt:Date.now()}, slot);
    tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error);
  });
}
export async function loadGame(slot="auto"){
  const db=await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(STORE,"readonly");
    const rq=tx.objectStore(STORE).get(slot);
    rq.onsuccess=()=>res(rq.result||null); rq.onerror=()=>rej(rq.error);
  });
}
export async function deleteSave(slot="auto"){
  const db=await openDB();
  return new Promise((res,rej)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(slot);
    tx.oncomplete=()=>res(true); tx.onerror=()=>rej(tx.error);
  });
}
export function exportJSON(world){
  const blob=new Blob([JSON.stringify(world)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`onze-${world.season}-rodada${world.round}.json`;
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
export function importJSON(file){
  return new Promise((res,rej)=>{
    const rd=new FileReader();
    rd.onload=()=>{ try{ res(JSON.parse(rd.result)); }catch(e){ rej(e); } };
    rd.onerror=()=>rej(rd.error);
    rd.readAsText(file);
  });
}
