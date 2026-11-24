
"use strict";
/* ===== utilidades ===== */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n0=v=>{const x=parseFloat(v);return isFinite(x)?x:0};
const fmt=n=>'Bs '+n0(n).toLocaleString('es-BO',{minimumFractionDigits:2,maximumFractionDigits:2});
const pad2=n=>String(n).padStart(2,'0');
const pad4=n=>String(n).padStart(4,'0');
const isoDate=d=>d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
const today=()=>isoDate(new Date());
const parseD=iso=>{const p=String(iso).split('-').map(Number);return new Date(p[0],p[1]-1,p[2])};
const addDays=(iso,n)=>{const d=parseD(iso);d.setDate(d.getDate()+n);return isoDate(d)};
const addMonthsIso=(iso,m)=>{const d=parseD(iso),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+m);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return isoDate(d)};
const fmtD=iso=>iso?parseD(iso).toLocaleDateString('es-BO',{day:'numeric',month:'short',year:'numeric'}):'—';
const fmtLong=iso=>iso?parseD(iso).toLocaleDateString('es-BO',{day:'numeric',month:'long',year:'numeric'}):'';
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const norm=s=>String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
function numLetras(n){
  const U=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  const D=['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
  const C=['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
  const apo=s=>s.replace(/veintiuno$/,'veintiún').replace(/uno$/,'un');
  const b=x=>{if(x===100)return 'cien';let s='';const c=Math.floor(x/100),r=x%100;if(c)s+=C[c]+(r?' ':'');if(r<30){if(r)s+=U[r]}else{const d=Math.floor(r/10),u=r%10;s+=D[d]+(u?' y '+U[u]:'')}return s};
  n=Math.floor(n);if(n<=0)return 'cero';
  let out='';const mi=Math.floor(n/1e6),k=Math.floor((n%1e6)/1000),r=n%1000;
  if(mi)out+=(mi===1?'un millón':apo(b(mi))+' millones')+' ';
  if(k)out+=(k===1?'mil':apo(b(k))+' mil')+' ';
  if(r)out+=b(r);
  return out.trim();
}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ===== datos fijos ===== */
const CATS=['Tarjeta de video','Procesador','Placa madre','Memoria RAM','Disco / SSD','Fuente de poder','Gabinete','Refrigeración','Monitor','Teclado / Mouse','Consola / Control','Realidad virtual','PC armada','Laptop','Impresora / Escáner','Servicio / Instalación','Otro'];
const METODOS=['Efectivo','QR','Transferencia','Mixto'];
const PAGOS={pagado:'Ya le pagué',debo:'Se lo debo',propio:'Stock propio'};
const COND0=[
'Vigencia. Esta garantía dura {meses} meses contados desde la fecha de esta nota y cubre únicamente defectos de fabricación del producto nuevo entregado, tal como figura en la descripción.',
'Requisitos. Para cualquier reclamo se debe presentar esta nota de venta y el producto completo, con su caja y accesorios, y con el número de serie, los sellos y las etiquetas intactos y legibles. El número de serie debe coincidir con el registrado en esta nota. Sin nota de venta no hay garantía.',
'Prueba al entregar. Los productos que se pueden probar en tienda (teclados, mouse, monitores, auriculares, controles, consolas, etc.) se prueban junto al cliente al momento de la entrega. Lo que el cliente pudo ver y comprobar en esa prueba (funcionamiento, imagen, píxeles, teclas, botones, estado físico y estético) queda aceptado al retirar el producto. La garantía cubre las fallas de fabricación que aparezcan después, con el uso normal.',
'Exclusiones. La garantía se anula si el producto presenta golpes, caídas, aplastamiento, rayones, pines o conectores doblados, quemados o forzados; humedad, líquidos, óxido o sulfatación; daños por picos o bajas de voltaje, descargas eléctricas o falta de estabilizador; sobrecalentamiento por mala ventilación o polvo; sellos o etiquetas rotos, retirados o alterados; apertura, reparación o manipulación por terceros; modificaciones de BIOS o firmware; overclock o voltajes fuera de especificación.',
'Uso no cubierto. No está cubierto el uso en minería de criptomonedas, el trabajo continuo 24/7 con cargas industriales ni cualquier uso fuera de lo indicado por el fabricante.',
'Desgaste. No se cubren piezas de desgaste ni consumibles (pasta y almohadillas térmicas, cables, conectores, baterías, empaques) ni daños estéticos por el uso.',
'@armado Equipos armados. Los componentes del equipo se abren e instalan en la tienda para armarlo; es parte normal del servicio y no anula su garantía. Se entregan con sus cajas y accesorios originales. La garantía cubre los componentes descritos en esta nota, identificados por su número de serie, y las fallas de ensamblaje atribuibles a la tienda. Se anula para el componente que sea retirado, cambiado, abierto, desarmado o reparado por terceros, o si se rompen los sellos de la tienda.',
'@armado Software y mantenimiento. No se cubren el sistema operativo, programas, controladores, licencias, virus ni configuraciones hechas por el cliente. Se recomienda limpieza y mantenimiento periódicos: el polvo acumulado, el mal uso de la energía eléctrica y la falta de estabilizador no se consideran defecto. Si el cliente amplía o cambia piezas con terceros, la tienda no garantiza el funcionamiento del equipo con ellas.',
'@armado Cambios en equipos armados. Como las cajas de los componentes se abren para el ensamblaje, no hay cambio ni devolución de componentes sueltos de un equipo armado, salvo falla de fabricación cubierta por esta garantía.',
'Diagnóstico. La tienda revisa el producto y, cuando corresponde, lo envía al proveedor o al fabricante; el diagnóstico técnico define si el defecto es de fabricación. El plazo de revisión o reparación es de hasta 30 días calendario y puede ampliarse por trámite del proveedor, con aviso al cliente.',
'Solución. Si la falla está cubierta, la tienda elegirá entre reparar, reponer por un producto igual o equivalente, o emitir una nota de crédito. No se devuelve dinero en efectivo. El producto repuesto continúa con el plazo restante de la garantía original.',
'Compatibilidad. La tienda no responde por incompatibilidades con piezas o equipos del cliente que no haya revisado y confirmado por escrito, ni por rendimiento, temperaturas o consumo distintos a los indicados por el fabricante.',
'Responsabilidad. La responsabilidad de la tienda se limita al valor pagado por el producto. No responde por pérdida de datos, software, licencias, lucro cesante ni daños indirectos. El cliente debe respaldar su información.',
'Entrega y reclamos. El cliente revisa la cantidad, los accesorios y el estado del producto al recibirlo. Después de retirarlo no se aceptan reclamos por daños estéticos, faltantes ni accesorios que no se hayan reportado en ese momento.',
'Cambios y devoluciones. Los productos entregados en buen estado no tienen cambio ni devolución, salvo que la tienda lo acepte por escrito en esta nota.',
'@reserva Reservas y pedidos. En productos bajo pedido, el pedido se hace al proveedor al recibir la reserva. Si el cliente desiste después de hacerlo, la reserva cubre los gastos del pedido y no se reembolsa, salvo que la tienda no entregue el producto en el plazo informado.',
'Conformidad. Al retirar el producto o firmar esta nota, el cliente declara que leyó estas condiciones en la entrega, que las entendió y que está conforme con ellas y con el producto recibido, probado y revisado.'
].join('\n');
const DEF={tienda:'Spider Store',lema:'Hardware · Computadoras · Consolas',tel:'730-94025 · 758-77929',dir:'Uyustus, La Paz — Bolivia',horario:'Lunes a sábado, de 13:00 a 20:00',redes:'TikTok @spiderstoredx',vendedor:'',garantia:12,cond:''};

/* ===== estado y datos (Supabase) ===== */
const S={cfg:{...DEF},ventas:[],proveedores:[],perfiles:[],mis:[],res:{meta:0,pct:0,dias:[]}};
let mf='todas',cc=0;
let sb=null,me=null,isAdmin=false,ready=false,view='vender',cTab='pend',vf='mes',af='todas',rp='mes',q='',D=null,mounted=null,curNota=null,curPdf=null,saving=false,authMsg='',liveTimer=null,rTimer=null,chan=null;
const emailOf=u=>{u=String(u||'').trim().toLowerCase();return u.includes('@')?u:u+'@spiderstore.app'};
const rowToVenta=r=>({id:r.id,num:r.num,fecha:r.fecha,hora:r.hora||'',cliente:r.cliente||'',doc:r.doc||'',tel:r.tel||'',metodo:r.metodo||'Efectivo',vendedor:r.vendedor||'',vid:r.vendedor_id,estado:r.estado,cobrado:n0(r.cobrado),obs:r.obs||'',cpct:r.comision_pct,cpag:!!r.comision_pagada,aprob:r.aprobacion,aprobNota:r.nota_admin||'',aprobEn:r.aprobada_en,
  items:(r.venta_items||[]).slice().sort((a,b)=>a.orden-b.orden).map(i=>({id:i.id,cat:i.cat,desc:i.descr,serie:i.serie||'',qty:i.qty,precio:n0(i.precio),garantia:i.garantia,costo:n0(i.costo),prov:i.prov_id||'',pago:i.pago,liquidado:!!i.liquidado,est:i.costo_estado||'sin_costo'}))});
const itemRow=(i,vid,k)=>({venta_id:vid,orden:k,cat:i.cat||'Otro',descr:i.desc,serie:i.serie||'',qty:Math.max(1,Math.round(n0(i.qty))||1),precio:n0(i.precio),garantia:Math.max(0,Math.round(n0(i.garantia))),costo:n0(i.costo),prov_id:i.prov||null,pago:i.pago||'pagado',liquidado:!!i.liquidado,costo_estado:i.est||(n0(i.costo)>0&&(i.pago==='propio'||i.prov)?'oficial':'sin_costo')});
async function loadAll(){
  if(!sb||!me)return;
  const [pr,cf]=await Promise.all([sb.from('proveedores').select('*').order('nombre'),sb.from('config').select('datos').eq('id',1).maybeSingle()]);
  if(pr.error)throw pr.error;
  S.proveedores=(pr.data||[]).map(p=>({id:p.id,nombre:p.nombre,telefono:p.telefono||'',ciudad:p.ciudad||'',nota:p.nota||'',revisado:p.revisado!==false}));
  S.cfg={...DEF,...((cf.data&&cf.data.datos)||{})};
  if(isAdmin){
    const all=[];
    for(let from=0;;from+=1000){
      const r=await sb.from('ventas').select('*,venta_items(*)').order('fecha',{ascending:false}).order('num',{ascending:false}).range(from,from+999);
      if(r.error)throw r.error;all.push(...r.data);if(r.data.length<1000)break;
    }
    S.ventas=all.map(rowToVenta);
    const pf=await sb.from('perfiles').select('*').order('creado');
    if(!pf.error)S.perfiles=pf.data||[];
  }else{
    S.ventas=[];S.perfiles=[];
    const mv=await sb.rpc('mis_ventas');if(mv.error)throw mv.error;S.mis=mv.data||[];
    const rs=await sb.rpc('mi_resumen');if(!rs.error&&rs.data)S.res=rs.data;
  }
}
async function refresh(quiet){try{await loadAll();render();updMini()}catch(e){if(!quiet)toast('No se pudo actualizar: '+((e&&e.message)||'sin conexión'))}}
function scheduleRefresh(){clearTimeout(rTimer);rTimer=setTimeout(()=>refresh(true),700)}
function startLive(){
  stopLive();
  try{
    chan=sb.channel('spider-live');
    ['ventas','venta_items','proveedores','config'].forEach(t=>{chan.on('postgres_changes',{event:'*',schema:'public',table:t},scheduleRefresh)});
    chan.subscribe();
  }catch(e){chan=null}
  liveTimer=setInterval(()=>{if(me&&!document.hidden)refresh(true)},60000);
}
function stopLive(){clearInterval(liveTimer);liveTimer=null;try{if(chan&&sb)sb.removeChannel(chan)}catch(e){}chan=null}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me)refresh(true)});

async function put(col,obj){
  if(col==='proveedores'){
    const row={nombre:obj.nombre,telefono:obj.telefono||'',ciudad:obj.ciudad||'',nota:obj.nota||''};
    let id=obj.id;
    if(id){if(isAdmin)row.revisado=true;const r=await sb.from('proveedores').update(row).eq('id',id);if(r.error)throw r.error}
    else{const r=await sb.from('proveedores').insert(row).select('id').single();if(r.error)throw r.error;id=r.data.id}
    await refresh(true);return id;
  }
  const v=obj,old=S.ventas.find(x=>x.id===v.id);
  const r=await sb.from('ventas').update({fecha:v.fecha,cliente:v.cliente,doc:v.doc,tel:v.tel,metodo:v.metodo,vendedor:v.vendedor,estado:v.estado,cobrado:n0(v.cobrado),obs:v.obs}).eq('id',v.id);
  if(r.error)throw r.error;
  const keep=[],fresh=[];
  (v.items||[]).forEach((i,k)=>{const row=itemRow(i,v.id,k);if(i.id)keep.push({id:i.id,...row});else fresh.push(row)});
  if(keep.length){const u=await sb.from('venta_items').upsert(keep);if(u.error)throw u.error}
  if(fresh.length){const u=await sb.from('venta_items').insert(fresh);if(u.error)throw u.error}
  const gone=(old?old.items:[]).map(i=>i.id).filter(id=>id&&!keep.some(k=>k.id===id));
  if(gone.length){const d=await sb.from('venta_items').delete().in('id',gone);if(d.error)throw d.error}
  await refresh(true);return v.id;
}
async function delDoc(col,id){
  const r=await sb.from(col).delete().eq('id',id);if(r.error)throw r.error;await refresh(true);
}
async function setCfg(patch){
  S.cfg={...S.cfg,...patch};renderTop();
  const r=await sb.from('config').upsert({id:1,datos:S.cfg,actualizado:new Date().toISOString()});
  if(r.error)toast('No se pudo guardar los ajustes: '+r.error.message);
}
async function setAprob(id,estado,nota){
  const r=await sb.from('ventas').update({aprobacion:estado,nota_admin:nota||''}).eq('id',id);if(r.error)throw r.error;await refresh(true);
}
async function aprobarTodas(){
  const r=await sb.from('ventas').update({aprobacion:'aprobada',nota_admin:''}).eq('aprobacion','pendiente');if(r.error)throw r.error;await refresh(true);
}
async function adminUser(body){
  const r=await sb.functions.invoke('admin-usuarios',{body});
  if(r.error){let m=r.error.message;try{const j=await r.error.context.json();m=j.error||m}catch(e){}throw new Error(m)}
  if(r.data&&r.data.error)throw new Error(r.data.error);
  await loadAll();mounted=null;render();return r.data;
}

/* ===== sesión ===== */
async function startSession(user){
  const r=await sb.from('perfiles').select('*').eq('id',user.id).maybeSingle();
  if(r.error||!r.data||!r.data.activo){await sb.auth.signOut();me=null;isAdmin=false;authMsg='Tu cuenta no tiene acceso. Pide al administrador que la active.';return false}
  me=r.data;isAdmin=me.rol==='admin';authMsg='';
  view='vender';mounted=null;newDraftNow();
  try{await loadAll()}catch(e){toast('No se pudieron cargar los datos: '+((e&&e.message)||''))}
  startLive();return true;
}
async function doLogin(u,p){
  if(!sb)return;
  const r=await sb.auth.signInWithPassword({email:emailOf(u),password:p});
  if(r.error||!r.data||!r.data.user){authMsg='Usuario o clave incorrectos.';render();return}
  await startSession(r.data.user);render();
}
async function doLogout(){
  stopLive();try{await sb.auth.signOut()}catch(e){}
  me=null;isAdmin=false;S.ventas=[];S.proveedores=[];S.perfiles=[];S.mis=[];S.res={meta:0,pct:0,dias:[]};D=null;curNota=null;closeModal();authMsg='';mounted=null;render();
}
async function boot(){
  renderTop();render();
  if(!window.supabase||!window.SPIDER_CFG){authMsg='No se pudo cargar el sistema. Revisa tu conexión y recarga la página.';ready=true;render();return}
  sb=supabase.createClient(SPIDER_CFG.url,SPIDER_CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  try{
    const {data}=await sb.auth.getSession();
    if(data&&data.session)await startSession(data.session.user);
  }catch(e){authMsg='Sin conexión. Revisa tu internet y recarga.'}
  ready=true;render();
}
async function guard(fn){try{await fn()}catch(e){toast('No se pudo guardar: '+((e&&e.message)||'error'))}}

/* ===== cálculos ===== */
const prov=id=>S.proveedores.find(p=>p.id===id);
const provName=id=>(prov(id)||{}).nombre||'';
const itemSub=i=>n0(i.qty)*n0(i.precio);
const itemFull=i=>n0(i.costo)>0&&(i.pago==='propio'||!!i.prov);
const itemRev=i=>itemFull(i)&&i.est==='revision';
const itemDone=i=>itemFull(i)&&i.est==='oficial';
function calc(v){
  let total=0,costo=0,gan=0,sinCosto=0,deuda=0,rev=0;
  (v.items||[]).forEach(i=>{const s=itemSub(i);total+=s;if(itemDone(i)){const c=n0(i.qty)*n0(i.costo);costo+=c;gan+=s-c;if(i.pago==='debo'&&!i.liquidado)deuda+=c}else{sinCosto++;if(itemRev(i))rev++}});
  const cobrado=v.estado==='reservada'?n0(v.cobrado):total;
  return {total,costo,gan,sinCosto,rev,deuda,cobrado,saldo:Math.max(0,total-cobrado)};
}
function pendingItems(){
  const out=[];
  S.ventas.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.num-a.num).forEach(v=>(v.items||[]).forEach((i,k)=>{if(!itemDone(i))out.push({v,k,i})}));
  return out;
}
function lastInfo(){
  const cost={},price={};
  S.ventas.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.num-b.num).forEach(v=>(v.items||[]).forEach(i=>{
    const key=norm(i.desc);if(!key)return;
    if(n0(i.precio)>0)price[key]=n0(i.precio);
    if(itemDone(i))cost[key]={prov:i.prov,costo:n0(i.costo),pago:i.pago};
  }));
  return {cost,price};
}
function gHasta(v,i){const m=n0(i.garantia);if(!m)return null;const h=addMonthsIso(v.fecha,m);return {hasta:h,vigente:h>=today()}}
function provStats(pid){
  let n=0,compras=0,deuda=0,venta=0;
  S.ventas.forEach(v=>(v.items||[]).forEach(i=>{if(i.prov===pid&&itemDone(i)){const q2=n0(i.qty);n+=q2;compras+=q2*n0(i.costo);venta+=q2*n0(i.precio);if(i.pago==='debo'&&!i.liquidado)deuda+=q2*n0(i.costo)}}));
  return {n,compras,deuda,gan:venta-compras};
}
const perfil=id=>S.perfiles.find(p=>p.id===id);
function comVenta(v){
  const pf=perfil(v.vid);
  const pct=v.cpct!=null?n0(v.cpct):(pf&&pf.rol==='vendedor'?n0(pf.comision_pct):0);
  if(!(pct>0))return null;
  const c=calc(v);
  return {pct,monto:Math.max(0,c.gan)*pct/100,completa:c.sinCosto===0,pagada:!!v.cpag};
}
const cicloDia=()=>Math.min(28,Math.max(1,Math.round(n0(S.cfg.cicloDia))||16));
function cicloIni(off){
  const t=today(),d=cicloDia();let y=+t.slice(0,4),m=+t.slice(5,7);
  if(+t.slice(8,10)<d)m--;
  m+=off;while(m<1){m+=12;y--}while(m>12){m-=12;y++}
  return y+'-'+pad2(m)+'-'+pad2(d);
}
function cicloRango(off){const a=cicloIni(off),b=addDays(cicloIni(off+1),-1);return {a,b,txt:fmtD(a)+' al '+fmtD(b)}}
const inCom=v=>{if(cc==='todo')return true;const r=cicloRango(+cc);return (v.fecha||'')>=r.a&&(v.fecha||'')<=r.b};
function comRows(){
  const m={};
  S.ventas.filter(v=>v.aprob==='aprobada'&&inCom(v)).forEach(v=>{
    const k=comVenta(v);if(!k)return;const pf=perfil(v.vid),c=calc(v);
    const r=m[v.vid]||(m[v.vid]={id:v.vid,nombre:(pf&&pf.nombre)||v.vendedor||'Vendedor',n:0,gan:0,monto:0,pagado:0,porPagar:0,inc:0,ids:[]});
    r.n++;r.gan+=Math.max(0,c.gan);r.monto+=k.monto;
    if(!k.completa)r.inc++;else if(k.pagada)r.pagado+=k.monto;else{r.porPagar+=k.monto;r.ids.push(v.id)}
  });
  return Object.values(m);
}
function inPeriod(v,p){
  const t=today(),d=v.fecha||'';
  if(p==='hoy')return d===t;
  if(p==='sem')return d>=addDays(t,-6)&&d<=t;
  if(p==='mes')return d.slice(0,7)===t.slice(0,7);
  return true;
}

/* ===== UI base ===== */
function toast(m){const t=document.createElement('div');t.textContent=m;$('#toast').appendChild(t);setTimeout(()=>t.remove(),3200)}
function modal(html,wide){const m=$('#modal');m.innerHTML='<div class="sheet'+(wide?' wide':'')+'">'+html+'</div>';m.classList.add('on');m.scrollTop=0;document.body.style.overflow='hidden'}
function closeModal(){const m=$('#modal');m.classList.remove('on');m.innerHTML='';document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$('#modal').addEventListener('mousedown',e=>{if(e.target.id==='modal')closeModal()});
const IC={
  plus:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  truck:'<path d="M2 6h11v10H2zM13 10h4l4 3v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};
const ico=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
const NAV_A=[['vender','Vender','plus'],['ventas','Ventas','receipt'],['costos','Costos','truck'],['resumen','Resumen','chart'],['ajustes','Ajustes','cog']];
const NAV_V=[['vender','Vender','plus'],['misventas','Mis ventas','receipt'],['mimeta','Mi meta','chart'],['prov','Proveedores','truck']];
const navList=()=>isAdmin?NAV_A:NAV_V;
const pendAprob=()=>S.ventas.filter(v=>v.aprob==='pendiente').length;
function renderNav(){
  if(!me){$('#nav').innerHTML='';return}
  const pend=isAdmin?pendingItems().length:0,pa=isAdmin?pendAprob():0;
  $('#nav').innerHTML='<div>'+navList().map(n=>'<button data-act="nav" data-v="'+n[0]+'"'+(view===n[0]?' aria-current="page"':'')+'>'+ico(n[2])+n[1]+(n[0]==='costos'&&pend?'<span class="bd">'+pend+'</span>':'')+(n[0]==='ventas'&&pa?'<span class="bd">'+pa+'</span>':'')+'</button>').join('')+'</div>';
}
function renderTop(){
  const s=$('#status'),w=$('#who');if(!s||!w)return;
  if(!ready){s.textContent='Conectando…';s.className='chip';w.hidden=true;return}
  if(!me){s.textContent='Sin sesión';s.className='chip warn';w.hidden=true;return}
  s.textContent=isAdmin?'Administrador':'Vendedor';s.className='chip '+(isAdmin?'good':'');
  w.hidden=false;w.textContent=(me.nombre||me.usuario||'Cuenta').split(' ')[0];
}
function go(v){
  if(!navList().some(n=>n[0]===v))return;
  syncDraft();view=v;mounted=null;render();window.scrollTo(0,0);
}
function refreshDatalist(){
  const seen=new Set(),out=[];
  S.ventas.forEach(v=>(v.items||[]).forEach(i=>{const k=norm(i.desc);if(k&&!seen.has(k)){seen.add(k);out.push(i.desc)}}));
  $('#dl').innerHTML=out.slice(0,200).map(d=>'<option value="'+esc(d)+'">').join('');
}
function vLogin(){
  return '<div class="login"><div class="card"><h1>Entrar</h1><p class="mut" style="margin:4px 0 14px">Sistema de ventas de Spider Store. Usa tu usuario y tu clave.</p>'+
  (!ready?'<div class="empty">Conectando…</div>':
  '<form id="lf" autocomplete="on"><label class="f"><span>Usuario o correo</span><input name="u" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>'+
  '<label class="f" style="margin-top:10px"><span>Clave</span><input name="p" type="password" autocomplete="current-password" required></label>'+
  (authMsg?'<div class="hint bad" role="alert">'+esc(authMsg)+'</div>':'')+
  '<button class="btn pri" style="width:100%;margin-top:14px;padding:13px">Entrar</button></form>')+
  '</div><p class="mut small" style="text-align:center">¿No tienes cuenta? Pídesela al administrador.</p></div>';
}
function openCuenta(){
  if(!me)return;
  modal('<div class="row between"><h2>Mi cuenta</h2><button class="btn sm" data-act="close">Cerrar</button></div>'+
  '<p><b>'+esc(me.nombre)+'</b> · '+(isAdmin?'Administrador':'Vendedor')+'</p><p class="mut small">Usuario: '+esc(me.usuario)+'</p>'+
  '<form id="pwf" style="margin-top:14px"><h3 style="margin-bottom:6px">Cambiar mi clave</h3><div class="g2"><label class="f"><span>Clave nueva (mín. 8)</span><input name="a" type="password" autocomplete="new-password" minlength="8" required></label><label class="f"><span>Repetir clave</span><input name="b" type="password" autocomplete="new-password" minlength="8" required></label></div><div class="actions"><button class="btn blue">Guardar clave</button></div></form>'+
  '<div class="actions" style="justify-content:flex-start"><button class="btn danger" data-act="logout">Cerrar sesión</button></div>');
  $('#pwf').addEventListener('submit',e=>{e.preventDefault();const el=e.target.elements;
    if(el.a.value!==el.b.value){toast('Las claves no coinciden');return}
    if(el.a.value.length<8){toast('Mínimo 8 caracteres');return}
    guard(async()=>{const r=await sb.auth.updateUser({password:el.a.value});if(r.error)throw r.error;closeModal();toast('Clave cambiada')})});
}
function render(){
  renderNav();renderTop();
  const el=$('#view');
  if(!me){mounted=null;el.innerHTML=vLogin();return}
  refreshDatalist();
  const once=(view==='vender'||view==='ajustes');
  if(once&&mounted===view)return;
  if(view==='ventas'&&mounted==='ventas'&&document.activeElement&&document.activeElement.id==='q'){const l=$('#vlist');if(l)l.innerHTML=listVentas();return}
  mounted=view;
  el.innerHTML=view==='vender'?vVender():view==='ventas'?vVentas():view==='costos'?vCostos():view==='resumen'?vResumen():view==='prov'?vProvVend():view==='misventas'?vMisVentas():view==='mimeta'?vMiMeta():vAjustes();
  if(view==='vender')updateTotals();
}

/* ===== MIS VENTAS (vendedor) ===== */
const miTotal=v=>(v.items||[]).reduce((a,i)=>a+n0(i.qty)*n0(i.precio),0);
const miAp=v=>v.aprob==='aprobada'?'<span class="chip good">Aprobada</span>':v.aprob==='observada'?'<span class="chip red">Observada</span>':'<span class="chip warn">Por aprobar</span>';
const miCostoChip=i=>i.est==='oficial'?'<span class="chip good">Costo aprobado</span>':i.est==='revision'?'<span class="chip warn">Costo en revisión</span>':'<span class="chip">Sin costo</span>';
function vMisVentas(){
  const L=S.mis||[],c={pend:0,aprobada:0,observada:0};
  L.forEach(v=>{if(v.aprob==='aprobada')c.aprobada++;else if(v.aprob==='observada')c.observada++;else c.pend++});
  const F=[['todas','Todas ('+L.length+')'],['pendiente','Por aprobar ('+c.pend+')'],['aprobada','Aprobadas ('+c.aprobada+')'],['observada','Observadas ('+c.observada+')']];
  const V=L.filter(v=>mf==='todas'||(mf==='pendiente'?(v.aprob!=='aprobada'&&v.aprob!=='observada'):v.aprob===mf));
  return '<div class="head"><h1>Mis ventas</h1><p>Aquí ves lo que vendiste y si el administrador ya lo aprobó. También puedes anotar costos que quedan por revisión.</p></div>'+
  '<div class="seg">'+F.map(f=>'<button data-act="mf" data-p="'+f[0]+'" aria-pressed="'+(mf===f[0])+'">'+f[1]+'</button>').join('')+'</div>'+
  (V.length?V.map(v=>{
    const its=v.items||[],res=its.slice(0,2).map(i=>n0(i.qty)+'× '+esc(i.desc)).join(' · ')+(its.length>2?' · +'+(its.length-2)+' más':'');
    const rev=its.filter(i=>i.est==='revision').length,sin=its.filter(i=>i.est==='sin_costo').length;
    return '<button class="vc" data-act="open-mia" data-id="'+esc(v.id)+'"><div class="vh"><b>#'+pad4(v.num)+'</b><span class="mut small">'+fmtD(v.fecha)+(v.hora?' · '+esc(v.hora):'')+'</span><span class="num" style="font-weight:500">'+fmt(miTotal(v))+'</span></div>'+
    '<div>'+esc(v.cliente||'Sin nombre')+'</div><div class="mut small">'+res+'</div><div class="chips">'+miAp(v)+(v.estado==='reservada'?'<span class="chip">Reserva</span>':'')+(rev?'<span class="chip warn">Costo en revisión ('+rev+')</span>':'')+(sin?'<span class="chip">Sin costo ('+sin+')</span>':'')+'</div></button>';
  }).join(''):'<div class="empty"><b>'+(L.length?'Nada en esta lista':'Aún no registraste ventas')+'</b>'+(L.length?'Prueba con otro filtro.':'Cuando registres una venta aparecerá aquí.')+'</div>');
}
function openMia(id){
  const v=(S.mis||[]).find(x=>x.id===id);if(!v)return;
  const rows=(v.items||[]).map((i,k)=>{const p=prov(i.prov);return '<div class="pi"><div class="row between"><b>'+esc(i.desc)+'</b><span class="num">'+fmt(n0(i.qty)*n0(i.precio))+'</span></div>'+
    '<div class="mut small">'+n0(i.qty)+' u. a '+fmt(i.precio)+(i.serie?' · S/N '+esc(i.serie):'')+'</div>'+
    '<div class="chips" style="margin-top:4px">'+miCostoChip(i)+'</div>'+
    (i.est==='revision'?'<div class="mut small" style="margin-top:4px">Propuesto: '+(i.pago==='propio'?'Stock propio':esc(p?p.nombre:'Proveedor'))+' · costo '+fmt(i.costo)+' c/u</div>':'')+
    (i.est!=='oficial'?'<div><button class="lnk" data-act="mi-costo" data-v="'+esc(v.id)+'" data-i="'+k+'">'+(i.est==='revision'?'Cambiar costo':'Agregar costo y proveedor')+'</button></div>':'')+'</div>'}).join('');
  modal('<div class="row between"><h2>Venta #'+pad4(v.num)+'</h2><button class="btn sm" data-act="close">Cerrar</button></div><p class="mut" style="margin-bottom:6px">'+esc(v.cliente||'Sin nombre')+' · '+fmtLong(v.fecha)+(v.hora?' · '+esc(v.hora):'')+' · '+esc(v.metodo||'')+'</p>'+
   '<div class="row" style="margin-bottom:10px">'+miAp(v)+(v.estado==='reservada'?'<span class="chip">Reserva</span>':'')+'</div>'+
   (v.nota?'<div class="hint" style="margin:0 0 10px"><b>Nota del administrador:</b> '+esc(v.nota)+'</div>':'')+
   rows+'<div class="row between" style="margin-top:10px"><span class="mut">Total</span><b class="num" style="font-size:1.2rem">'+fmt(miTotal(v))+'</b></div>');
}
function openMiCosto(vid,k){
  const v=(S.mis||[]).find(x=>x.id===vid);if(!v)return;const i=v.items[k];if(!i)return;
  modal('<h2>Costo y proveedor</h2><p class="mut" style="margin-bottom:10px">'+esc(i.desc)+' · venta '+fmt(i.precio)+' c/u</p><form id="mc">'+
   '<label class="f"><span>Proveedor</span><select name="prov"><option value="">— elegir —</option>'+S.proveedores.slice().sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(p=>'<option value="'+esc(p.id)+'"'+(i.prov===p.id?' selected':'')+'>'+esc(p.nombre)+'</option>').join('')+'</select></label>'+
   '<div class="g2" style="margin-top:10px"><label class="f"><span>Costo c/u (Bs)</span><input name="costo" type="number" step="any" inputmode="decimal" required value="'+esc(i.costo||'')+'"></label>'+
   '<label class="f"><span>Pago al proveedor</span><select name="pago">'+Object.entries(PAGOS).map(([a,b])=>'<option value="'+a+'"'+((i.pago||'pagado')===a?' selected':'')+'>'+b+'</option>').join('')+'</select></label></div>'+
   '<div class="hint">Queda <b>en revisión</b> hasta que el administrador lo apruebe. Si el proveedor no está en la lista, regístralo antes en Proveedores.</div>'+
   '<div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Enviar a revisión</button></div></form>');
  $('#mc').addEventListener('submit',e=>{e.preventDefault();const el=e.target.elements;
    const costo=n0(el.costo.value),pago=el.pago.value,pid=el.prov.value;
    if(!(costo>0)){toast('Escribe el costo');return}
    if(pago!=='propio'&&!pid){toast('Elige el proveedor');return}
    guard(async()=>{const r=await sb.rpc('proponer_costo',{p_item:i.id,p_costo:costo,p_prov:pago==='propio'?null:pid,p_pago:pago});if(r.error)throw r.error;await refresh(true);closeModal();toast('Costo enviado a revisión')})});
}

/* ===== META DEL VENDEDOR ===== */
function metaData(){
  const R=S.res||{meta:0,pct:0,dias:[]},map={};(R.dias||[]).forEach(d=>{map[d.fecha]={conf:Math.max(0,n0(d.conf)),est:Math.max(0,n0(d.est)),sin:n0(d.sin)}});
  const g=f=>map[f]||{conf:0,est:0,sin:0},meta=n0(R.meta),t=today(),h=g(t);
  const tot=f=>g(f).conf+g(f).est;
  let racha=0;for(let k=tot(t)>=meta&&meta>0?0:1;meta>0;k++){if(tot(addDays(t,-k))>=meta)racha++;else break;if(k>60)break}
  const semana=[];for(let k=6;k>=0;k--){const f=addDays(t,-k);semana.push({f,...g(f)})}
  const ini=cicloIni(0);let cConf=0,cEst=0,cumpl=0,dias=0;
  for(let f=ini;f<=t;f=addDays(f,1)){const x=g(f);cConf+=x.conf;cEst+=x.est;dias++;if(meta>0&&x.conf+x.est>=meta)cumpl++}
  return {meta,pct:n0(R.pct),h,semana,racha,cConf,cEst,cumpl,dias,ini,sin:h.sin};
}
function metaMsg(p,falta,extra){
  if(p>=1.5)return '¡Increíble! Superaste la meta por Bs '+fmt(extra).replace('Bs ','');
  if(p>=1)return '¡Meta cumplida! Llevas Bs '+fmt(extra).replace('Bs ','')+' de más';
  if(p>=.75)return '¡Casi lo logras! Te faltan solo '+fmt(falta);
  if(p>=.5)return '¡Ya pasaste la mitad! Te faltan '+fmt(falta);
  if(p>0)return 'Buen comienzo, sigue así. Te faltan '+fmt(falta);
  return 'Hoy aún no hay ventas. ¡A por la meta!';
}
function miniMeta(){
  const m=metaData();if(!(m.meta>0))return '';
  const a=m.h.conf,b=m.h.conf+m.h.est,pc=Math.min(100,a/m.meta*100),pe=Math.min(100,b/m.meta*100);
  return '<button class="vc" id="mini" data-act="nav" data-v="mimeta" style="margin-bottom:12px"><div class="vh"><b>Meta de hoy</b><span class="num">'+fmt(b)+' / '+fmt(m.meta)+'</span></div><div class="mbar"><i style="width:'+pe+'%;background:var(--blue)"></i><i style="width:'+pc+'%;background:var(--good)"></i></div><div class="mut small">'+(b>=m.meta?'¡Meta cumplida!':'Te faltan '+fmt(m.meta-b))+' · toca para ver tu resumen</div></button>';
}
function updMini(){const el=$('#mini');if(!el||isAdmin)return;const t=document.createElement('div');t.innerHTML=miniMeta();if(t.firstChild)el.replaceWith(t.firstChild)}
function vMiMeta(){
  const m=metaData();
  if(!(m.meta>0))return '<div class="head"><h1>Mi meta</h1><p>El administrador aún no te asignó una meta diaria.</p></div>';
  const a=m.h.conf,b=m.h.conf+m.h.est,p=b/m.meta,R=52,C=2*Math.PI*R;
  const ring='<svg viewBox="0 0 140 140" width="170" height="170" role="img" aria-label="Avance de la meta"><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="var(--line)" stroke-width="14"/><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="var(--blue)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+(C*Math.min(1,p))+' '+C+'" transform="rotate(-90 70 70)"/><circle cx="70" cy="70" r="'+R+'" fill="none" stroke="var(--good)" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+(C*Math.min(1,a/m.meta))+' '+C+'" transform="rotate(-90 70 70)"/><text x="70" y="68" text-anchor="middle" fill="var(--ink)" font-size="26" font-weight="700">'+Math.round(p*100)+'%</text><text x="70" y="88" text-anchor="middle" fill="var(--mut)" font-size="11">de la meta</text></svg>';
  const mx=Math.max(m.meta,...m.semana.map(x=>x.conf+x.est),1);
  const bars=m.semana.map(x=>{const v=x.conf+x.est,ok=v>=m.meta,dia=parseD(x.f).toLocaleDateString('es-BO',{weekday:'narrow'}).toUpperCase();
    return '<div style="flex:1;text-align:center"><div style="height:80px;display:flex;align-items:flex-end;justify-content:center;position:relative"><div title="'+esc(fmtD(x.f))+': '+esc(fmt(v))+'" style="width:70%;height:'+Math.max(3,v/mx*100)+'%;background:'+(ok?'var(--good)':'var(--blue)')+';border-radius:6px 6px 2px 2px;opacity:'+(x.f===today()?1:.8)+'"></div></div><div class="mut small">'+dia+'</div></div>'}).join('');
  const lineY=100-m.meta/mx*100;
  const com=m.cConf*m.pct/100,comE=(m.cConf+m.cEst)*m.pct/100;
  return '<div class="head"><h1>Mi meta</h1><p>Tu meta de hoy es generar <b>'+fmt(m.meta)+'</b> de ganancia.</p></div>'+
  '<div class="card" style="text-align:center">'+ring+'<div style="font-size:1.15rem;font-weight:600;margin-top:4px">'+esc(metaMsg(p,m.meta-b,b-m.meta))+'</div>'+
  '<div class="chips" style="justify-content:center;margin-top:8px"><span class="chip good">Confirmado '+fmt(a)+'</span>'+(m.h.est>0?'<span class="chip" style="color:var(--blue2)">En revisión '+fmt(m.h.est)+'</span>':'')+(m.sin?'<span class="chip warn">'+m.sin+' producto(s) sin costo</span>':'')+'</div>'+
  '<div class="mut small" style="margin-top:8px">Lo confirmado es de ventas ya aprobadas por el administrador. Lo que está en revisión cuenta en la barra, pero puede cambiar al aprobarse.</div></div>'+
  '<div class="card"><h3 style="margin-bottom:8px">Últimos 7 días</h3><div style="display:flex;gap:6px;position:relative;align-items:flex-end">'+bars+'</div><div class="mut small" style="margin-top:6px">Verde: día con meta cumplida · azul: aún por debajo de '+fmt(m.meta)+'</div></div>'+
  '<div class="stats"><div class="stat"><small>Racha de días con meta</small><span class="num good">'+m.racha+'</span></div><div class="stat"><small>Días cumplidos en este ciclo</small><span class="num">'+m.cumpl+' / '+m.dias+'</span></div><div class="stat"><small>Ganancia del ciclo</small><span class="num">'+fmt(m.cConf+m.cEst)+'</span></div><div class="stat"><small>Tu comisión ('+m.pct+' %)</small><span class="num good">'+fmt(com)+'</span></div></div>'+
  '<div class="hint">El ciclo de pago empezó el '+fmtD(m.ini)+'. Tu comisión confirmada es '+fmt(com)+(comE>com?'; si se aprueba todo lo que está en revisión sería '+fmt(comE):'')+'.</div>';
}
function vProvVend(){
  const L=S.proveedores.slice().sort((a,b)=>a.nombre.localeCompare(b.nombre));
  return '<div class="head"><h1>Proveedores</h1><p>Registra aquí los proveedores nuevos que consigas. Quedan por revisión hasta que el administrador los apruebe; solo él puede modificarlos o borrarlos.</p></div>'+
  '<div class="row between" style="margin-bottom:10px"><span class="mut">'+L.length+' proveedor(es)</span><button class="btn pri sm" data-act="new-prov">+ Nuevo proveedor</button></div>'+
  (L.length?L.map(p=>'<div class="vc" style="cursor:default"><div class="vh"><b>'+esc(p.nombre)+'</b><span class="num mut small">'+esc(p.telefono||'')+'</span></div><div class="mut small">'+esc([p.ciudad,p.nota].filter(Boolean).join(' · '))+'</div>'+(p.revisado===false?'<div class="chips"><span class="chip warn">Por revisar</span></div>':'')+'</div>').join(''):'<div class="empty"><b>Aún no hay proveedores</b>Registra el primero con el botón de arriba.</div>');
}

/* ===== VENDER ===== */
function blankItem(){return {cat:'Tarjeta de video',desc:'',serie:'',qty:1,precio:'',garantia:S.cfg.garantia,prov:'',costo:'',pago:'pagado'}}
function newDraft(){const n=new Date();return {id:null,num:null,fecha:today(),hora:pad2(n.getHours())+':'+pad2(n.getMinutes()),cliente:'',doc:'',tel:'',metodo:'Efectivo',vendedor:isAdmin?(S.cfg.vendedor||(me&&me.nombre)||''):((me&&me.nombre)||''),estado:'entregada',cobrado:'',obs:'',items:[blankItem()]}}
function newDraftNow(){D=newDraft()}
function itemHtml(i,k){
  return '<div class="item" data-i="'+k+'">'+
  '<div class="g2"><label class="f"><span>Categoría</span><select data-f="cat">'+CATS.map(c=>'<option'+(i.cat===c?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label>'+
  '<label class="f"><span>Descripción</span><input data-f="desc" list="dl" autocomplete="off" value="'+esc(i.desc)+'" placeholder="Ej. RTX 3090 24GB"></label></div>'+
  '<label class="f"><span>N.º de serie (escanea o escribe)</span><input data-f="serie" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(i.serie)+'" placeholder="Escanea con el lector"></label>'+
  '<div class="g3"><label class="f"><span>Cantidad</span><input data-f="qty" type="number" min="1" step="1" inputmode="numeric" value="'+esc(i.qty)+'"></label>'+
  '<label class="f"><span>Precio c/u (Bs)</span><input data-f="precio" type="number" step="any" inputmode="decimal" value="'+esc(i.precio)+'"></label>'+
  '<label class="f"><span>Garantía (meses)</span><input data-f="garantia" type="number" min="0" step="1" inputmode="numeric" value="'+esc(i.garantia)+'"></label></div>'+
  (D.id?'':'<details class="cst"'+(n0(i.costo)>0||i.prov?' open':'')+'><summary>Costo y proveedor (opcional)</summary><div class="hint">'+(isAdmin?'Si ya lo sabes, anótalo aquí; si no, complétalo después en Costos.':'¿Lo conseguiste en otro lado? Anota dónde y a cuánto. Queda <b>por revisión</b> hasta que el administrador lo apruebe.')+'</div>'+
  '<label class="f"><span>Proveedor</span><select data-f="prov"><option value="">— elegir —</option>'+S.proveedores.slice().sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(p=>'<option value="'+esc(p.id)+'"'+(i.prov===p.id?' selected':'')+'>'+esc(p.nombre)+'</option>').join('')+'</select></label>'+
  '<div class="g2"><label class="f"><span>Costo c/u (Bs)</span><input data-f="costo" type="number" step="any" inputmode="decimal" value="'+esc(i.costo)+'"></label><label class="f"><span>Pago al proveedor</span><select data-f="pago">'+Object.entries(PAGOS).map(([a,b])=>'<option value="'+a+'"'+(i.pago===a?' selected':'')+'>'+b+'</option>').join('')+'</select></label></div></details>')+
  '<div class="itot"><span class="mut">Subtotal <b class="num" data-sub style="color:var(--ink)"></b></span>'+(D.items.length>1?'<button type="button" class="lnk bad" data-act="rm-item">Quitar</button>':'')+'</div></div>';
}
function vVender(){
  const d=D;
  return (isAdmin?'':miniMeta())+'<div class="head"><h1>'+(d.id?'Editar venta <span class="num mut" style="font-size:1.1rem">#'+pad4(d.num)+'</span>':'Nueva venta')+'</h1><p>'+(isAdmin?'Producto, serie y precio. El proveedor y el costo son opcionales: puedes completarlos después en Costos.':'Registra producto, serie y precio. Si conseguiste el producto en otro lado, anota su costo y proveedor: el administrador los revisa y aprueba la venta.')+'</p></div>'+
  '<div class="card"><div class="g2"><label class="f"><span>Cliente</span><input data-k="cliente" value="'+esc(d.cliente)+'" placeholder="Nombre del cliente"></label>'+
  '<label class="f"><span>CI / NIT (opcional)</span><input data-k="doc" value="'+esc(d.doc)+'" inputmode="numeric"></label>'+
  '<label class="f"><span>Celular (WhatsApp)</span><input data-k="tel" value="'+esc(d.tel)+'" inputmode="tel" placeholder="Ej. 730-94025"></label>'+
  '<label class="f"><span>Forma de pago</span><select data-k="metodo">'+METODOS.map(m=>'<option'+(d.metodo===m?' selected':'')+'>'+m+'</option>').join('')+'</select></label>'+
  '<label class="f"><span>Atendido por</span><input data-k="vendedor" value="'+esc(d.vendedor)+'"'+(isAdmin?'':' readonly')+'></label></div></div>'+
  '<div id="items">'+d.items.map(itemHtml).join('')+'</div>'+
  '<button type="button" class="btn wide" data-act="add-item">+ Agregar producto</button>'+
  '<div class="card"><label class="chk"><input type="checkbox" data-k="reserva"'+(d.estado==='reservada'?' checked':'')+'> Reserva / bajo pedido (cobro parcial)</label>'+
  '<div id="resv" style="margin-top:10px"'+(d.estado==='reservada'?'':' hidden')+'><label class="f"><span>Cobrado ahora (Bs)</span><input data-k="cobrado" type="number" step="any" inputmode="decimal" value="'+esc(d.cobrado)+'"></label></div>'+
  '<label class="f" style="margin-top:10px"><span>Observaciones (salen en la nota)</span><input data-k="obs" value="'+esc(d.obs)+'" placeholder="Ej. Incluye instalación"></label></div>'+
  '<div class="card"><div class="tot" id="tot"></div></div>'+
  '<div class="actions" style="justify-content:stretch"><button class="btn pri" style="flex:1;padding:14px" data-act="save-sale">Guardar y generar nota</button></div>';
}
function syncDraft(){
  const root=$('#view');if(!root||mounted!=='vender'||!$('#items')||!D)return;
  root.querySelectorAll('[data-k]').forEach(el=>{const k=el.dataset.k;if(k==='reserva')D.estado=el.checked?'reservada':'entregada';else D[k]=el.value});
  root.querySelectorAll('#items .item').forEach((r,k)=>{const it=D.items[k];if(!it)return;r.querySelectorAll('[data-f]').forEach(el=>{it[el.dataset.f]=el.value})});
}
function updateTotals(){
  if(!D)return;
  const c=calc({items:D.items,estado:D.estado,cobrado:D.cobrado});
  document.querySelectorAll('#items .item').forEach((r,k)=>{const b=r.querySelector('[data-sub]');if(b&&D.items[k])b.textContent=fmt(itemSub(D.items[k]))});
  const t=$('#tot');
  if(t)t.innerHTML='<div><small>Total</small><b class="big num">'+fmt(c.total)+'</b></div>'+(D.estado==='reservada'?'<div><small>Cobrado</small><b class="num">'+fmt(c.cobrado)+'</b></div><div><small>Saldo</small><b class="num warnc">'+fmt(c.saldo)+'</b></div>':'');
}
async function saveSale(){
  syncDraft();
  if(saving)return;
  const items=D.items.map(i=>({...i,desc:String(i.desc||'').trim(),serie:String(i.serie||'').trim().replace(/[,;\s]+$/,''),qty:Math.max(1,Math.round(n0(i.qty))||1),precio:n0(i.precio),garantia:Math.max(0,Math.round(n0(i.garantia)))})).filter(i=>i.desc);
  if(!items.length){toast('Escribe qué producto vendes');return}
  if(items.some(i=>!(i.precio>0))){toast('Falta el precio de algún producto');return}
  if(!D.id&&items.some(i=>n0(i.costo)>0&&i.pago!=='propio'&&!i.prov)){toast('Elige el proveedor del producto que tiene costo, o borra el costo');return}
  const c=calc({items,estado:D.estado,cobrado:D.cobrado});
  const v={...D,items};
  v.cliente=String(D.cliente||'').trim();v.cobrado=D.estado==='reservada'?Math.min(n0(D.cobrado),c.total):c.total;
  const btn=$('[data-act=save-sale]'),old=btn&&btn.textContent;
  saving=true;if(btn){btn.disabled=true;btn.textContent='Guardando…'}
  try{
    let saved;
    if(D.id){
      await put('ventas',v);saved={...v};
      toast('Venta #'+pad4(v.num)+' actualizada');
    }else{
      const payload={fecha:v.fecha,cliente:v.cliente,doc:v.doc,tel:v.tel,metodo:v.metodo,vendedor:v.vendedor,estado:v.estado,cobrado:v.cobrado,obs:v.obs,
        items:items.map(i=>({cat:i.cat,desc:i.desc,serie:i.serie,qty:i.qty,precio:i.precio,garantia:i.garantia,costo:n0(i.costo),prov:i.prov||'',pago:i.pago||'pagado'}))};
      const r=await sb.rpc('registrar_venta',{p:payload});
      if(r.error)throw r.error;
      saved={...v,id:r.data.id,num:r.data.num,fecha:r.data.fecha,hora:r.data.hora,aprob:r.data.aprobacion,vendedor:isAdmin?v.vendedor:me.nombre};
      toast('Venta #'+pad4(saved.num)+' guardada'+(isAdmin?'':' · queda por aprobar'));
      await refresh(true);
    }
    newDraftNow();mounted=null;render();
    openNota(saved);
  }catch(e){toast('No se pudo guardar: '+((e&&e.message)||'error')+'. Revisa tu conexión; no se perdió lo escrito.')}
  finally{saving=false;if(btn){btn.disabled=false;btn.textContent=old}}
}

/* ===== VENTAS (solo administrador) ===== */
const apChip=v=>v.aprob==='aprobada'?'<span class="chip good">Aprobada</span>':v.aprob==='observada'?'<span class="chip red">Observada</span>':'<span class="chip warn">Por aprobar</span>';
function ventasFiltered(){
  const qq=norm(q),per=(qq||af!=='todas')?'todo':vf;
  return S.ventas.filter(v=>inPeriod(v,per)).filter(v=>af==='todas'||(af==='pend'?v.aprob==='pendiente':v.aprob==='observada'))
    .filter(v=>!qq||[pad4(v.num),v.cliente,v.doc,v.vendedor,...(v.items||[]).flatMap(i=>[i.desc,i.cat,i.serie,provName(i.prov)])].some(s=>norm(s).includes(qq)))
    .sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.num-a.num);
}
function listVentas(){
  const L=ventasFiltered(),qq=norm(q);
  if(!L.length)return '<div class="empty"><b>'+(qq?'Sin resultados':af==='pend'?'Nada por aprobar':af==='obs'?'Sin ventas observadas':'Aún no hay ventas')+'</b>'+(qq?'Prueba con otro nombre, producto o número de serie.':af==='todas'?'Registra la primera en la pestaña Vender.':'Todo al día.')+'</div>';
  return L.map(v=>{
    const c=calc(v),its=v.items||[];
    const resumen=its.slice(0,2).map(i=>n0(i.qty)+'× '+esc(i.desc)).join(' · ')+(its.length>2?' · +'+(its.length-2)+' más':'');
    const m=qq?its.filter(i=>i.serie&&norm(i.serie).includes(qq)):[];
    const gline=m.map(i=>{const g=gHasta(v,i);return '<div class="small" style="margin-top:6px">S/N <span class="num">'+esc(i.serie)+'</span> · '+(g?(g.vigente?'<span class="good">Garantía vigente hasta '+fmtD(g.hasta)+'</span>':'<span class="bad">Garantía vencida el '+fmtD(g.hasta)+'</span>'):'Sin garantía')+'</div>'}).join('');
    return '<button class="vc" data-act="open-venta" data-id="'+esc(v.id)+'"><div class="vh"><b>#'+pad4(v.num)+'</b><span class="mut small">'+fmtD(v.fecha)+(v.hora?' · '+esc(v.hora):'')+'</span><span class="num" style="font-weight:500">'+fmt(c.total)+'</span></div>'+
      '<div>'+esc(v.cliente||'Sin nombre')+' <span class="mut">· '+esc(v.metodo||'')+(v.vendedor?' · vendió '+esc(v.vendedor):'')+'</span></div><div class="mut small">'+resumen+'</div>'+gline+
      '<div class="chips">'+apChip(v)+(v.estado==='reservada'?'<span class="chip">Reserva · saldo '+fmt(c.saldo)+'</span>':'')+
      (c.rev?'<span class="chip warn">Costo por revisar ('+c.rev+')</span>':'')+(c.sinCosto-c.rev>0?'<span class="chip warn">Falta costo ('+(c.sinCosto-c.rev)+')</span>':(c.rev?'':'<span class="chip good">Ganancia '+fmt(c.gan)+'</span>'))+'</div></button>';
  }).join('');
}
function vVentas(){
  const per=[['hoy','Hoy'],['sem','7 días'],['mes','Este mes'],['todo','Todo']];
  const pa=pendAprob(),ob=S.ventas.filter(v=>v.aprob==='observada').length;
  const aps=[['todas','Todas'],['pend','Por aprobar ('+pa+')'],['obs','Observadas ('+ob+')']];
  return '<div class="head"><h1>Ventas</h1><p>Revisa y aprueba lo que se vendió. Busca por cliente, producto o número de serie para ver una garantía.</p></div>'+
  (pa&&af!=='pend'?'<div class="hint" style="margin:0 0 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span><b>'+pa+'</b> venta(s) esperan tu aprobación.</span><button class="btn sm pri" data-act="af" data-p="pend">Revisar ahora</button></div>':'')+
  '<div class="seg">'+aps.map(p=>'<button data-act="af" data-p="'+p[0]+'" aria-pressed="'+(af===p[0])+'">'+p[1]+'</button>').join('')+'</div>'+
  (af==='todas'?'<div class="seg">'+per.map(p=>'<button data-act="vf" data-p="'+p[0]+'" aria-pressed="'+(vf===p[0])+'">'+p[1]+'</button>').join('')+'</div>':'')+
  (af==='pend'&&pa?'<div class="row" style="margin-bottom:10px"><button class="btn ok" data-act="approve-all">Aprobar las '+pa+' pendientes</button></div>':'')+
  '<label class="f" style="margin-bottom:12px"><span>Buscar</span><input id="q" value="'+esc(q)+'" placeholder="Cliente, producto, vendedor, N.º de serie…" autocomplete="off"></label>'+
  '<div id="vlist">'+listVentas()+'</div>';
}
function openVenta(id){
  const v=S.ventas.find(x=>x.id===id);if(!v)return;const c=calc(v);
  const left='<div class="scroll"><table class="t"><thead><tr><th>Cant.</th><th>Producto</th><th class="r">P. unit.</th><th class="r">Subtotal</th></tr></thead><tbody>'+(v.items||[]).map(i=>'<tr><td>'+n0(i.qty)+'</td><td><b>'+esc(i.desc)+'</b><div class="mut small">'+esc(i.cat)+(i.serie?' · S/N <span class="num">'+esc(i.serie)+'</span>':'')+'</div>'+((g=>g?'<div class="small '+(g.vigente?'good':'bad')+'">'+(g.vigente?'Garantía hasta ':'Venció el ')+fmtD(g.hasta)+'</div>':'')(gHasta(v,i)))+'</td><td class="r num">'+fmt(i.precio)+'</td><td class="r num">'+fmt(itemSub(i))+'</td></tr>').join('')+'</tbody></table></div>'+
   '<div class="row between" style="margin-top:10px"><span class="mut">Total</span><b class="num" style="font-size:1.3rem">'+fmt(c.total)+'</b></div>'+
   (v.estado==='reservada'?'<div class="row between"><span class="mut">Cobrado</span><span class="num">'+fmt(c.cobrado)+'</span></div><div class="row between"><span class="mut">Saldo por cobrar</span><b class="num warnc">'+fmt(c.saldo)+'</b></div>':'')+
   '<div class="row between" style="margin-top:6px"><span class="mut">Ganancia (con costo cargado)</span><b class="num good">'+fmt(c.gan)+'</b></div>'+((k=>k?'<div class="row between"><span class="mut">Comisión de '+esc(v.vendedor||'vendedor')+' ('+k.pct+' %)</span><b class="num">'+fmt(k.monto)+'</b></div><div class="row" style="justify-content:flex-end">'+(!k.completa?'<span class="chip">Se define cuando estén todos los costos</span>':k.pagada?'<span class="chip good">Pagada</span>':v.aprob==='aprobada'?'<span class="chip warn">Por pagar</span>':'<span class="chip warn">Se paga al aprobar la venta</span>')+'</div>':'')(comVenta(v)));
  const side='<aside class="side"><h3 style="margin-bottom:6px">Proveedor y costos</h3>'+(v.items||[]).map((i,k)=>{
    const p=prov(i.prov),done=itemDone(i),rv=itemRev(i);
    return '<div class="pi"><b>'+esc(i.desc)+'</b>'+(done?'<div>'+(i.pago==='propio'?'Stock propio':esc(p?p.nombre:'Proveedor'))+(p&&p.telefono?' <span class="mut num small">'+esc(p.telefono)+'</span>':'')+'</div><div class="mut small">Costo '+fmt(n0(i.qty)*n0(i.costo))+' · ganancia '+fmt(itemSub(i)-n0(i.qty)*n0(i.costo))+'</div><div style="margin-top:4px"><span class="chip '+(i.pago==='debo'&&!i.liquidado?'red':'good')+'">'+(i.pago==='debo'?(i.liquidado?'Pagado':'Debo'):PAGOS[i.pago])+'</span></div>':(rv?'<div>'+(i.pago==='propio'?'Stock propio':esc(p?p.nombre:'Proveedor'))+'</div><div class="mut small">Costo propuesto '+fmt(n0(i.qty)*n0(i.costo))+' · ganancia '+fmt(itemSub(i)-n0(i.qty)*n0(i.costo))+'</div><div style="margin-top:4px"><span class="chip warn">Por revisión</span></div>':'<span class="chip warn">Falta proveedor y costo</span>'))+
      '<div><button class="lnk" data-act="assign" data-v="'+esc(v.id)+'" data-i="'+k+'">'+(done?'Editar':rv?'Revisar y aprobar':'Completar ahora')+'</button></div></div>';
  }).join('')+'</aside>';
  modal('<div class="row between"><h2>Venta #'+pad4(v.num)+'</h2><button class="btn sm" data-act="close">Cerrar</button></div><p class="mut" style="margin-bottom:6px">'+esc(v.cliente||'Sin nombre')+' · '+fmtLong(v.fecha)+(v.hora?' · '+esc(v.hora):'')+' · '+esc(v.metodo||'')+'</p><div class="row" style="margin-bottom:12px">'+apChip(v)+'<span class="mut small">Vendió: '+esc(v.vendedor||'—')+'</span>'+(v.aprobNota?'<span class="small warnc">Nota: '+esc(v.aprobNota)+'</span>':'')+'</div><div class="split"><div>'+left+'</div>'+side+'</div>'+
   '<div class="actions" style="justify-content:flex-start">'+(v.aprob!=='aprobada'?'<button class="btn ok" data-act="aprobar" data-id="'+esc(v.id)+'">Aprobar venta</button>':'')+(c.rev?'<button class="btn ok" data-act="aprobar-costos" data-id="'+esc(v.id)+'">Aprobar costos ('+c.rev+')</button>':'')+(v.aprob!=='observada'?'<button class="btn" data-act="observar" data-id="'+esc(v.id)+'">Observar…</button>':'')+'<button class="btn blue" data-act="show-nota" data-id="'+esc(v.id)+'">Ver nota</button>'+(v.estado==='reservada'&&c.saldo>0?'<button class="btn" data-act="cobro" data-id="'+esc(v.id)+'">Registrar cobro</button>':'')+'<button class="btn" data-act="edit-venta" data-id="'+esc(v.id)+'">Editar</button><button class="btn danger" data-act="del-venta" data-id="'+esc(v.id)+'">Eliminar</button></div>',true);
}
function openCobro(id){
  const v=S.ventas.find(x=>x.id===id);if(!v)return;const c=calc(v);
  modal('<h2>Registrar cobro</h2><p class="mut" style="margin-bottom:10px">Saldo pendiente: <b class="num">'+fmt(c.saldo)+'</b></p><form id="cf"><label class="f"><span>Monto cobrado (Bs)</span><input name="m" type="number" step="any" inputmode="decimal" required value="'+c.saldo+'"></label><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar cobro</button></div></form>');
  $('#cf').addEventListener('submit',e=>{e.preventDefault();const m=n0(e.target.elements.m.value);if(m<=0)return;
    guard(async()=>{const nv={...v,cobrado:n0(v.cobrado)+m};if(nv.cobrado>=c.total-0.004){nv.cobrado=c.total;nv.estado='entregada'}await put('ventas',nv);closeModal();toast('Cobro registrado')})});
}
function confirmDel(id){
  const v=S.ventas.find(x=>x.id===id);if(!v)return;
  modal('<h2>¿Eliminar la venta #'+pad4(v.num)+'?</h2><p class="mut">Se borra también su nota y sus costos. No se puede deshacer.</p><div class="actions"><button class="btn" data-act="close">Cancelar</button><button class="btn pri" id="yes">Sí, eliminar</button></div>');
  $('#yes').addEventListener('click',()=>guard(async()=>{await delDoc('ventas',id);closeModal();toast('Venta eliminada')}));
}

/* ===== COSTOS Y PROVEEDORES ===== */
function vCostos(){
  const pend=pendingItems();
  const seg='<div class="seg"><button data-act="ctab" data-t="pend" aria-pressed="'+(cTab==='pend')+'">Por completar ('+pend.length+')</button><button data-act="ctab" data-t="prov" aria-pressed="'+(cTab==='prov')+'">Proveedores</button></div>';
  let body='';
  if(cTab==='pend'){
    body=pend.length?pend.map(x=>'<button class="vc" data-act="assign" data-v="'+esc(x.v.id)+'" data-i="'+x.k+'"><div class="vh"><b>'+esc(x.i.desc)+'</b><span class="num">'+fmt(itemSub(x.i))+'</span></div><div class="mut small">'+n0(x.i.qty)+' u. · venta #'+pad4(x.v.num)+' · '+fmtD(x.v.fecha)+' · '+esc(x.v.cliente||'Sin nombre')+(x.i.serie?' · S/N '+esc(x.i.serie):'')+'</div><div class="chips">'+(itemRev(x.i)?'<span class="chip warn">Por revisión · '+fmt(n0(x.i.qty)*n0(x.i.costo))+(x.v.vendedor?' · '+esc(x.v.vendedor):'')+'</span>':'<span class="chip warn">Asignar proveedor y costo</span>')+'</div></button>').join(''):'<div class="empty"><b>Todo al día</b>Cada producto vendido ya tiene su proveedor y su costo.</div>';
  }else{
    body='<div class="row between" style="margin-bottom:10px"><span class="mut">'+S.proveedores.length+' proveedor(es)</span><button class="btn pri sm" data-act="new-prov">+ Nuevo proveedor</button></div>'+
    (S.proveedores.length?S.proveedores.slice().sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(p=>{const st=provStats(p.id);return '<button class="vc" data-act="open-prov" data-id="'+esc(p.id)+'"><div class="vh"><b>'+esc(p.nombre)+'</b><span class="num mut small">'+esc(p.telefono||'')+'</span></div><div class="mut small">'+st.n+' pieza(s) vendidas · compras '+fmt(st.compras)+'</div><div class="chips">'+(p.revisado===false?'<span class="chip warn">Por revisar</span>':'')+(st.deuda>0?'<span class="chip red">Debo '+fmt(st.deuda)+'</span>':'<span class="chip good">Sin deuda</span>')+'<span class="chip">Ganancia '+fmt(st.gan)+'</span></div></button>'}).join(''):'<div class="empty"><b>Aún no hay proveedores</b>Se crean aquí o al completar el costo de un producto vendido.</div>');
  }
  return '<div class="head"><h1>Costos y proveedores</h1><p>Aquí se asigna de qué proveedor salió cada producto y cuánto costó.</p></div>'+seg+body;
}
function openAssign(vid,k){
  const v=S.ventas.find(x=>x.id===vid);if(!v)return;const i=v.items[k];if(!i)return;
  const last=lastInfo().cost[norm(i.desc)]||{};
  const cur={prov:i.prov||last.prov||'',costo:i.costo||last.costo||'',pago:i.pago||last.pago||'pagado'};
  const same=pendingItems().filter(x=>!(x.v.id===vid&&x.k===k)&&norm(x.i.desc)===norm(i.desc)&&!itemRev(x.i));
  modal('<h2>Proveedor y costo</h2><p class="mut" style="margin-bottom:10px">'+esc(i.desc)+' · '+n0(i.qty)+' u. · venta '+fmt(i.precio)+' c/u'+(i.serie?' · S/N '+esc(i.serie):'')+'</p>'+(itemRev(i)?'<div class="hint" style="margin-bottom:10px">Costo propuesto por <b>'+esc(v.vendedor||'el vendedor')+'</b>. Revísalo y pulsa Guardar para aprobarlo.</div>':'')+'<form id="af">'+
   '<label class="f"><span>Proveedor</span><select name="prov"><option value="">— elegir —</option>'+S.proveedores.map(p=>'<option value="'+esc(p.id)+'"'+(cur.prov===p.id?' selected':'')+'>'+esc(p.nombre)+'</option>').join('')+'<option value="__new">+ Nuevo proveedor…</option></select></label>'+
   '<div id="newp" class="g2" style="margin-top:10px" hidden><label class="f"><span>Nombre</span><input name="pnom"></label><label class="f"><span>Teléfono</span><input name="ptel" inputmode="tel"></label></div>'+
   '<div class="g2" style="margin-top:10px"><label class="f"><span>Costo por unidad (Bs)</span><input name="costo" type="number" step="any" inputmode="decimal" required value="'+esc(cur.costo)+'"></label>'+
   '<label class="f"><span>Pago al proveedor</span><select name="pago">'+Object.entries(PAGOS).map(([a,b])=>'<option value="'+a+'"'+(cur.pago===a?' selected':'')+'>'+b+'</option>').join('')+'</select></label></div>'+
   (same.length?'<label class="chk" style="margin-top:12px"><input type="checkbox" name="all" checked> Aplicar también a '+same.length+' producto(s) igual(es) sin costo</label>':'')+
   '<div class="hint" id="agan"></div>'+
   '<div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
  const f=$('#af'),upd=()=>{const el=f.elements;$('#newp').hidden=el.prov.value!=='__new';const g=n0(i.precio)-n0(el.costo.value);$('#agan').innerHTML='Ganancia por unidad: <b class="num '+(g<0?'bad':'good')+'">'+fmt(g)+'</b> · por esta venta: <b class="num '+(g<0?'bad':'good')+'">'+fmt(g*n0(i.qty))+'</b>'};
  f.addEventListener('input',upd);f.addEventListener('change',upd);upd();
  f.addEventListener('submit',e=>{e.preventDefault();guard(async()=>{
    const el=f.elements;let pid=el.prov.value;const pago=el.pago.value;
    if(pid==='__new'){const nom=el.pnom.value.trim();if(!nom){toast('Escribe el nombre del proveedor');return}pid=await put('proveedores',{nombre:nom,telefono:el.ptel.value.trim()})}
    if(pago!=='propio'&&!pid){toast('Elige un proveedor');return}
    const costo=n0(el.costo.value);if(!(costo>0)){toast('Escribe el costo');return}
    const targets=[{vid,k}].concat(el.all&&el.all.checked?same.map(x=>({vid:x.v.id,k:x.k})):[]);
    const work={};
    targets.forEach(t=>{const vv=work[t.vid]||(work[t.vid]=JSON.parse(JSON.stringify(S.ventas.find(x=>x.id===t.vid))));const it=vv.items[t.k];vv.items[t.k]={...it,est:'oficial',prov:pago==='propio'?'':pid,costo,pago,liquidado:pago==='debo'?!!(it.liquidado&&it.pago==='debo'):false}});
    for(const id in work)await put('ventas',work[id]);
    closeModal();toast('Costo guardado');
  })});
}
function provForm(p){
  modal('<h2>'+(p?'Proveedor':'Nuevo proveedor')+'</h2><form id="pf"><div class="g2"><label class="f"><span>Nombre o tienda *</span><input name="nombre" required value="'+esc(p?p.nombre:'')+'"></label><label class="f"><span>Teléfono / WhatsApp</span><input name="telefono" inputmode="tel" value="'+esc(p?p.telefono:'')+'"></label><label class="f"><span>Ciudad</span><input name="ciudad" value="'+esc(p?p.ciudad:'')+'"></label><label class="f"><span>Nota</span><input name="nota" value="'+esc(p?p.nota:'')+'" placeholder="Ej. bajo pedido, llega en 3 días"></label></div><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
  $('#pf').addEventListener('submit',e=>{e.preventDefault();const el=e.target.elements;guard(async()=>{await put('proveedores',{...(p||{}),nombre:el.nombre.value.trim(),telefono:el.telefono.value.trim(),ciudad:el.ciudad.value.trim(),nota:el.nota.value.trim()});closeModal();toast('Proveedor guardado')})});
}
function openProv(id){
  const p=prov(id);if(!p)return;const st=provStats(id);
  const rows=[];S.ventas.forEach(v=>(v.items||[]).forEach((i,k)=>{if(i.prov===id&&itemDone(i))rows.push({v,k,i})}));
  rows.sort((a,b)=>b.v.fecha.localeCompare(a.v.fecha));
  const debts=rows.filter(r=>r.i.pago==='debo'&&!r.i.liquidado);
  modal('<div class="row between"><h2>'+esc(p.nombre)+'</h2><button class="btn sm" data-act="close">Cerrar</button></div><p class="mut">'+esc([p.telefono,p.ciudad,p.nota].filter(Boolean).join(' · '))+'</p>'+
   '<div class="stats" style="margin-top:12px"><div class="stat"><small>Piezas vendidas</small><span class="num">'+st.n+'</span></div><div class="stat"><small>Compras</small><span class="num">'+fmt(st.compras)+'</span></div><div class="stat"><small>Debo</small><span class="num '+(st.deuda>0?'bad':'good')+'">'+fmt(st.deuda)+'</span></div></div>'+
   (rows.length?'<div class="scroll"><table class="t"><thead><tr><th>Producto</th><th class="r">Costo</th><th>Estado</th><th></th></tr></thead><tbody>'+rows.map(r=>{const d=r.i.pago==='debo'&&!r.i.liquidado;return '<tr><td><b>'+esc(r.i.desc)+'</b><div class="mut small">#'+pad4(r.v.num)+' · '+fmtD(r.v.fecha)+(r.i.serie?' · S/N '+esc(r.i.serie):'')+'</div></td><td class="r num">'+fmt(n0(r.i.qty)*n0(r.i.costo))+'</td><td><span class="chip '+(d?'red':'good')+'">'+(d?'Debo':'Pagado')+'</span></td><td>'+(d?'<button class="lnk" data-act="pay-item" data-v="'+esc(r.v.id)+'" data-i="'+r.k+'" data-p="'+esc(id)+'">Marcar pagado</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="empty">Aún no hay productos vendidos de este proveedor.</div>')+
   '<div class="actions" style="justify-content:flex-start">'+(debts.length?'<button class="btn pri" data-act="pay-all" data-p="'+esc(id)+'">Pagar toda la deuda ('+fmt(st.deuda)+')</button>':'')+(p.revisado===false?'<button class="btn ok" data-act="ok-prov" data-id="'+esc(id)+'">Aprobar proveedor</button>':'')+'<button class="btn" data-act="edit-prov" data-id="'+esc(id)+'">Editar datos</button><button class="btn danger" data-act="del-prov" data-id="'+esc(id)+'">Eliminar</button></div>',true);
}
async function payItems(pid,only){
  const work={};
  S.ventas.forEach(v=>(v.items||[]).forEach((i,k)=>{
    if(i.prov===pid&&i.pago==='debo'&&!i.liquidado&&(!only||(only.v===v.id&&only.k===k))){const vv=work[v.id]||(work[v.id]=JSON.parse(JSON.stringify(v)));vv.items[k].liquidado=true}
  }));
  for(const id in work)await put('ventas',work[id]);
}

/* ===== RESUMEN ===== */
function comCard(){
  const R=comRows(),opts=[0,-1,-2,-3,-4,-5].map(o=>'<option value="'+o+'"'+(String(cc)===String(o)?' selected':'')+'>'+(o===0?'Ciclo actual: ':o===-1?'Ciclo anterior: ':'Ciclo: ')+esc(cicloRango(o).txt)+'</option>').join('')+'<option value="todo"'+(cc==='todo'?' selected':'')+'>Todo el tiempo</option>';
  const head='<div class="card"><h3 style="margin-bottom:6px">Comisiones de vendedores</h3><label class="f"><span>Ciclo de pago (cada mes, desde el '+cicloDia()+')</span><select id="ccsel">'+opts+'</select></label><div class="mut small" style="margin:4px 0 8px"><button class="lnk" data-act="ciclo-dia">Cambiar día de corte</button></div>';
  if(!R.length)return head+'<div class="empty" style="padding:12px"><b>Sin comisiones en este ciclo</b>Aparecen cuando hay ventas aprobadas de un vendedor.</div></div>';
  return head+R.map(r=>'<div class="pi"><div class="row between"><b>'+esc(r.nombre)+'</b><span class="num">'+fmt(r.monto)+'</span></div><div class="mut small">'+r.n+' venta(s) aprobada(s) · ganancia '+fmt(r.gan)+'</div><div class="chips" style="margin-top:4px">'+(r.porPagar>0?'<span class="chip warn">Por pagar '+fmt(r.porPagar)+'</span>':'<span class="chip good">Al día</span>')+(r.pagado>0?'<span class="chip good">Pagado '+fmt(r.pagado)+'</span>':'')+(r.inc?'<span class="chip">'+r.inc+' con costo pendiente</span>':'')+'</div>'+(r.porPagar>0?'<div><button class="lnk" data-act="pay-com" data-id="'+esc(r.id)+'">Marcar como pagada</button></div>':'')+'</div>').join('')+'<div class="mut small" style="margin-top:6px">Comisión = porcentaje de la ganancia de cada venta aprobada. Solo se paga cuando la venta ya tiene todos sus costos aprobados.</div></div>';
}
function vResumen(){
  const per=[['hoy','Hoy'],['sem','7 días'],['mes','Este mes'],['todo','Todo']];
  const APR=S.ventas.filter(v=>v.aprob==='aprobada'),V=APR.filter(v=>inPeriod(v,rp));
  let total=0,costo=0,gan=0,sin=0,cobrar=0;const cats={},provs={},mets={};
  V.forEach(v=>{const c=calc(v);total+=c.total;costo+=c.costo;gan+=c.gan;sin+=c.sinCosto;cobrar+=c.saldo;mets[v.metodo||'—']=(mets[v.metodo||'—']||0)+c.total;
    (v.items||[]).forEach(i=>{const s=itemSub(i),g=itemDone(i)?s-n0(i.qty)*n0(i.costo):0;const a=cats[i.cat]||(cats[i.cat]={u:0,v:0,g:0});a.u+=n0(i.qty);a.v+=s;a.g+=g;
      if(itemDone(i)&&i.pago!=='propio'){const pn=provName(i.prov)||'—';const b=provs[pn]||(provs[pn]={c:0,g:0});b.c+=n0(i.qty)*n0(i.costo);b.g+=g}})});
  const deudaProv=S.proveedores.reduce((s,p)=>s+provStats(p.id).deuda,0);
  const venCosto=total-0;const costedVenta=V.reduce((s,v)=>s+(v.items||[]).filter(itemDone).reduce((a,i)=>a+itemSub(i),0),0);
  const margen=costedVenta>0?gan/costedVenta*100:0;
  let chart='';
  if(rp!=='hoy'){
    const t=today();const n=rp==='sem'?7:rp==='mes'?new Date().getDate():30;
    const days=[];for(let k=n-1;k>=0;k--)days.push(addDays(t,-k));
    const agg=days.map(d=>{let tv=0,tg=0;APR.filter(v=>v.fecha===d).forEach(v=>{const c=calc(v);tv+=c.total;tg+=c.gan});return {d,tv,tg}});
    const mx=Math.max(1,...agg.map(a=>a.tv));
    chart='<div class="card"><h3>Ventas por día</h3><div class="mut small">Azul: venta · verde: ganancia</div><div class="bars">'+agg.map(a=>'<div class="bc" title="'+esc(fmtD(a.d))+': '+esc(fmt(a.tv))+'"><div class="bv" style="height:'+Math.max(1,a.tv/mx*100)+'%"><i style="height:'+(a.tv>0?Math.max(0,Math.min(100,a.tg/a.tv*100)):0)+'%"></i></div><small>'+parseD(a.d).getDate()+'</small></div>').join('')+'</div></div>';
  }
  const tbl=(title,obj,cols)=>{const e=Object.entries(obj).sort((a,b)=>b[1][cols[0][0]]-a[1][cols[0][0]]);return '<div class="card"><h3 style="margin-bottom:6px">'+title+'</h3>'+(e.length?'<div class="scroll"><table class="t"><thead><tr><th></th>'+cols.map(c=>'<th class="r">'+c[1]+'</th>').join('')+'</tr></thead><tbody>'+e.map(([k,o])=>'<tr><td>'+esc(k)+'</td>'+cols.map(c=>'<td class="r num">'+(c[2]==='n'?o[c[0]]:fmt(o[c[0]]))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<div class="mut">Sin datos todavía.</div>')+'</div>'};
  const met=Object.fromEntries(Object.entries(mets).map(([k,x])=>[k,{t:x}]));
  return '<div class="head"><h1>Resumen</h1>'+(pendAprob()?'<p>Solo cuenta ventas aprobadas. Hay <b>'+pendAprob()+'</b> por aprobar que aún no suman.</p>':'<p>Solo cuenta ventas aprobadas.</p>')+'</div><div class="seg">'+per.map(p=>'<button data-act="rp" data-p="'+p[0]+'" aria-pressed="'+(rp===p[0])+'">'+p[1]+'</button>').join('')+'</div>'+
  '<div class="stats"><div class="stat"><small>Ventas</small><span class="num">'+fmt(total)+'</span></div><div class="stat"><small>Costo</small><span class="num">'+fmt(costo)+'</span></div><div class="stat"><small>Ganancia</small><span class="num good">'+fmt(gan)+'</span></div><div class="stat"><small>Margen</small><span class="num">'+margen.toFixed(1)+' %</span></div><div class="stat"><small>N.º de ventas</small><span class="num">'+V.length+'</span></div><div class="stat"><small>Por cobrar</small><span class="num '+(cobrar>0?'warnc':'')+'">'+fmt(cobrar)+'</span></div><div class="stat"><small>Debo a proveedores</small><span class="num '+(deudaProv>0?'bad':'')+'">'+fmt(deudaProv)+'</span></div></div>'+
  (sin?'<div class="hint" style="margin:0 0 12px">La ganancia solo cuenta lo que ya tiene costo. Faltan <b>'+sin+'</b> producto(s) por completar en Costos.</div>':'')+
  chart+
  tbl('Por categoría',cats,[['v','Venta'],['g','Ganancia'],['u','Unid.','n']])+
  tbl('Por proveedor',provs,[['c','Compras'],['g','Ganancia']])+
  tbl('Por forma de pago',met,[['t','Venta']])+
  comCard()+
  '<div class="actions" style="justify-content:flex-start"><button class="btn blue" data-act="csv">Descargar ventas (CSV para Excel)</button></div>';
}
/* ===== guardar / compartir archivos ===== */
async function saveFile(name,data,mime){
  const blob=new Blob([data],{type:mime});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.rel='noopener';
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000);
}
async function exportCsv(){
  const q2=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
  const rows=[['Nota','Fecha','Cliente','Vendedor','Aprobación','Pago','Estado','Categoría','Descripción','N.º de serie','Cantidad','Precio unit.','Subtotal','Proveedor','Costo unit.','Ganancia','Pago al proveedor','Garantía hasta']];
  S.ventas.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)||a.num-b.num).forEach(v=>(v.items||[]).forEach(i=>{
    const done=itemDone(i),g=gHasta(v,i);
    rows.push([pad4(v.num),v.fecha,v.cliente,v.vendedor,v.aprob,v.metodo,v.estado,i.cat,i.desc,i.serie,n0(i.qty),n0(i.precio),itemSub(i),i.pago==='propio'?'Stock propio':provName(i.prov),done?n0(i.costo):'',done?itemSub(i)-n0(i.qty)*n0(i.costo):'',done?(i.pago==='debo'?(i.liquidado?'Pagado':'Debo'):PAGOS[i.pago]):'',g?g.hasta:'']);
  }));
  const data='﻿'+rows.map(r=>r.map(q2).join(';')).join('\r\n');
  await saveFile('ventas-spider-store.csv',data,'text/csv;charset=utf-8');toast('Archivo listo');
}

/* ===== AJUSTES ===== */
function vAjustes(){
  const c=S.cfg;
  const fld=(k,l,t,w)=>'<label class="f'+(w?' w':'')+'"><span>'+l+'</span><input data-c="'+k+'"'+(t?' type="'+t+'"':'')+' value="'+esc(c[k])+'"></label>';
  return '<div class="head"><h1>Ajustes</h1><p>Estos datos salen en la nota de venta. Se guardan al salir de cada campo.</p></div>'+
  '<div class="card"><div class="g2">'+fld('tienda','Nombre de la tienda')+fld('lema','Línea bajo el nombre')+fld('tel','Teléfonos')+fld('dir','Dirección')+fld('horario','Horario')+fld('redes','Redes sociales')+fld('vendedor','Atendido por (por defecto)')+fld('garantia','Garantía por defecto (meses)','number')+'</div></div>'+
  usersCard()+'<div class="card"><h3 style="margin-bottom:4px">Condiciones de garantía</h3><p class="mut small" style="margin-bottom:8px">Una condición por línea. Escribe «Título. texto…». Usa {meses} para los meses de garantía. Las líneas que empiezan con @reserva solo salen en notas de reserva, y las que empiezan con @armado solo cuando la venta incluye una PC armada.</p><textarea data-c="cond" style="min-height:360px;font-size:14px">'+esc(c.cond||COND0)+'</textarea><div class="actions"><button class="btn" data-act="cond-reset">Restaurar texto original</button></div></div>';
}

function usersCard(){
  const L=S.perfiles.slice().sort((a,b)=>(a.rol===b.rol?0:a.rol==='admin'?-1:1)||a.nombre.localeCompare(b.nombre));
  return '<div class="card"><div class="row between"><h3>Cuentas y roles</h3><button class="btn pri sm" data-act="new-user">+ Nueva cuenta</button></div>'+
  '<p class="mut small" style="margin:4px 0 8px"><b>Administrador:</b> ve y modifica todo y aprueba las ventas. <b>Vendedor:</b> solo registra ventas y proveedores nuevos; no ve ni modifica registros.</p>'+
  L.map(p=>'<div class="pi"><div class="row between"><b>'+esc(p.nombre||p.usuario)+'</b><span class="row" style="gap:6px"><span class="chip '+(p.rol==='admin'?'good':'')+'">'+(p.rol==='admin'?'Administrador':'Vendedor')+'</span>'+(p.activo?'':'<span class="chip red">Desactivada</span>')+'</span></div>'+
    '<div class="mut small">Usuario: '+esc(p.usuario)+'</div>'+(p.rol==='vendedor'?'<div class="mut small">Comisión: <b>'+n0(p.comision_pct)+' %</b> de la ganancia <button class="lnk" data-act="user-com" data-id="'+esc(p.id)+'">Cambiar</button></div><div class="mut small">Meta diaria: <b>Bs '+n0(p.meta_diaria)+'</b> de ganancia <button class="lnk" data-act="user-meta" data-id="'+esc(p.id)+'">Cambiar</button></div>':'')+
    (p.id===me.id?'<div class="mut small">Esta eres tú (cambia tu clave en tu cuenta).</div>':'<div class="row" style="gap:4px;margin-top:2px"><button class="lnk" data-act="user-pass" data-id="'+esc(p.id)+'">Cambiar clave</button><button class="lnk" data-act="user-role" data-id="'+esc(p.id)+'">Hacer '+(p.rol==='admin'?'vendedor':'administrador')+'</button><button class="lnk '+(p.activo?'bad':'')+'" data-act="user-toggle" data-id="'+esc(p.id)+'">'+(p.activo?'Desactivar':'Activar')+'</button></div>')+'</div>').join('')+'</div>';
}
function newUserForm(){
  modal('<div class="row between"><h2>Nueva cuenta</h2><button class="btn sm" data-act="close">Cerrar</button></div><form id="uf"><div class="g2"><label class="f"><span>Nombre de la persona *</span><input name="nombre" required></label><label class="f"><span>Usuario o correo *</span><input name="usuario" autocapitalize="none" spellcheck="false" required placeholder="Ej. carlos"></label><label class="f"><span>Clave (mín. 8) *</span><input name="clave" minlength="8" required></label><label class="f"><span>Rol</span><select name="rol"><option value="vendedor">Vendedor</option><option value="admin">Administrador</option></select></label></div><p class="mut small" style="margin-top:8px">Si la persona no tiene correo, escribe solo un usuario (por ejemplo «carlos»). Entrará con ese usuario y la clave que le des; puede cambiarla después.</p><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Crear cuenta</button></div></form>');
  $('#uf').addEventListener('submit',e=>{e.preventDefault();const el=e.target.elements;
    guard(async()=>{await adminUser({accion:'crear',nombre:el.nombre.value.trim(),usuario:el.usuario.value.trim(),clave:el.clave.value,rol:el.rol.value});closeModal();toast('Cuenta creada')})});
}
function askUserPass(id){
  const p=S.perfiles.find(x=>x.id===id);if(!p)return;
  modal('<h2>Nueva clave para '+esc(p.nombre||p.usuario)+'</h2><form id="kf"><label class="f"><span>Clave nueva (mín. 8)</span><input name="c" minlength="8" required></label><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
  $('#kf').addEventListener('submit',e=>{e.preventDefault();guard(async()=>{await adminUser({accion:'clave',id,clave:e.target.elements.c.value});closeModal();toast('Clave cambiada')})});
}

/* ===== NOTA DE VENTA ===== */
const NOTA_CSS=`
.nota{width:720px;background:#fff;color:#111;font-family:'Nunito','Trebuchet MS',Arial,sans-serif;font-size:12px;line-height:1.35;padding:16px 28px 12px;box-sizing:border-box;position:relative;border:3px solid #000;border-radius:18px;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.nota *{box-sizing:border-box}
.nota .cw{position:absolute;top:0;width:96px;height:96px;opacity:.38;pointer-events:none}
.nota .cw.l{left:0}.nota .cw.r{right:0;transform:scaleX(-1)}
.nota .hang{position:absolute;top:0;left:392px;width:34px;height:86px;pointer-events:none}
.nota .nh{position:relative;display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:8px}
.nota .nbrand{display:flex;gap:10px;align-items:center}
.nota .nbrand svg{width:50px;height:50px;flex:none}
.nota .nbrand b{display:block;font-family:'Bangers',Impact,'Arial Black',sans-serif;font-size:40px;letter-spacing:.05em;font-weight:400;line-height:.95}
.nota .nbrand b span{color:#d62839}
.nota .nbrand small{display:block;margin-top:4px;font-size:9.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#1d4ed8}
.nota .nnum{text-align:center;width:128px;flex:none}
.nota .burst{width:110px;height:102px;display:block;margin:0 auto;transform:rotate(-4deg)}
.nota .bt1{font:800 7px 'Nunito',Arial,sans-serif;letter-spacing:.14em;fill:#111}
.nota .bt2{font:400 25px 'Bangers',Impact,sans-serif;letter-spacing:.04em;fill:#111}
.nota .nd{display:block;font-size:10.5px;font-weight:700;margin-top:-4px}
.nota .nnum em{display:inline-block;margin-top:3px;border:1.5px solid #000;border-radius:99px;padding:0 8px;font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-style:normal}
.nota .info{display:grid;grid-template-columns:1.7fr 1fr 1fr 1fr;gap:8px;margin-top:6px}
.nota .info div{border:2px solid #000;border-radius:10px;box-shadow:2px 2px 0 #000;padding:3px 9px 4px;min-width:0}
.nota .info small{display:block;font-family:'Bangers',Impact,sans-serif;font-size:11.5px;letter-spacing:.1em;color:#d62839;font-weight:400}
.nota .info span{font-size:13px;font-weight:800;display:block;min-height:17px;overflow-wrap:anywhere}
.nota .tbl{border:2px solid #000;border-radius:12px;overflow:hidden;margin-top:12px}
.nota table{width:100%;border-collapse:collapse}
.nota th{font-family:'Bangers',Impact,sans-serif;font-weight:400;font-size:12px;letter-spacing:.1em;text-align:left;padding:5px 8px;border-bottom:2px solid #000}
.nota td{padding:6px 8px;border-bottom:1.2px dashed #000;vertical-align:top}
.nota tr:last-child td{border-bottom:0}
.nota td b{font-weight:800;font-size:13.5px}
.nota td small{display:inline-block;font-size:8.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;border:1px solid #000;border-radius:99px;padding:0 7px;margin-top:2px}
.nota td i{display:block;font-style:normal;font-size:11px;margin-top:3px;overflow-wrap:anywhere}
.nota td i s{text-decoration:none;font-family:'Bangers',Impact,sans-serif;letter-spacing:.08em;color:#1d4ed8;margin-right:4px}
.nota td i code{font-family:'Courier New',monospace;font-weight:700;font-size:11.5px}
.nota .g small{display:block;border:0;padding:0;margin:0;font-size:9px;letter-spacing:.04em;text-transform:none;font-weight:700}
.nota .r{text-align:right;white-space:nowrap}
.nota .c{text-align:center;white-space:nowrap}
.nota .tw{display:flex;justify-content:space-between;gap:16px;margin-top:10px;align-items:flex-start}
.nota .son{flex:1;font-size:12px;font-weight:600;border:1.5px dashed #000;border-radius:12px;padding:6px 10px}
.nota .son small{display:block;font-size:10.5px;margin-top:3px;font-weight:600}
.nota .tb{min-width:236px;border:2.5px solid #000;border-radius:12px;box-shadow:3px 3px 0 #000;overflow:hidden}
.nota .tb div{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:4px 10px;border-bottom:1.2px solid #000;font-size:12.5px;font-weight:700}
.nota .tb div:last-child{border-bottom:0}
.nota .tb .gt{font-family:'Bangers',Impact,sans-serif;font-weight:400;font-size:22px;letter-spacing:.05em}
.nota .gar{margin-top:10px;border-top:2px solid #000;padding-top:7px}
.nota .gh{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.nota .gh svg{width:22px;height:22px;flex:none}
.nota .gh b{font-family:'Bangers',Impact,sans-serif;font-weight:400;font-size:19px;letter-spacing:.06em;line-height:1}
.nota .gh b span{color:#d62839}
.nota .gh small{margin-left:auto;font-size:9.5px;font-weight:700;color:#1d4ed8}
.nota .gar ol{margin:0;padding:0;list-style:none;counter-reset:c;columns:2;column-gap:20px;font-size:8.5px;line-height:1.24;text-align:justify}
.nota .gar li{counter-increment:c;margin-bottom:3px;break-inside:avoid;padding-left:17px;position:relative}
.nota .gar li::before{content:counter(c);position:absolute;left:0;top:0;width:12px;height:12px;border:1.3px solid #000;border-radius:50%;text-align:center;font-size:7.5px;line-height:10px;font-weight:800}
.nota .gar li b{font-weight:800}
.nota .fir{display:flex;gap:46px;margin-top:20px}
.nota .fir div{flex:1;border-top:1.5px solid #000;text-align:center;padding-top:3px;font-family:'Bangers',Impact,sans-serif;font-size:11.5px;letter-spacing:.12em}
.nota .pie{display:flex;align-items:center;gap:12px;margin-top:9px;border-top:2px solid #000;padding-top:8px}
.nota .bub{position:relative;border:2px solid #000;border-radius:14px;padding:3px 12px;font-family:'Bangers',Impact,sans-serif;font-size:15px;letter-spacing:.06em;flex:none;line-height:1.1}
.nota .bub::after{content:"";position:absolute;right:-9px;bottom:5px;width:0;height:0;border-left:9px solid #000;border-top:5px solid transparent;border-bottom:5px solid transparent}
.nota .bub span{color:#d62839}
.nota .pie p{margin:0;flex:1;text-align:right;font-size:10px;font-weight:700;line-height:1.35}
.nota .pie p span{color:#1d4ed8}
`;
$('#nota-css').textContent=NOTA_CSS;
const WEB='<svg viewBox="0 0 48 48" fill="none" stroke="#000" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M24 3v42M4 13.5l40 21M4 34.5l40-21"/><polygon points="24,11 34,17 34,31 24,37 14,31 14,17"/><polygon points="24,5 40,14.5 40,33.5 24,43 8,33.5 8,14.5"/><circle cx="24" cy="24" r="3.4" fill="#d62839" stroke="#000" stroke-width="1.2"/></svg>';
const CORNER='<g fill="none" stroke="#000" stroke-width="1.3" stroke-linecap="round"><path d="M0 0L100 0M0 0L92 38M0 0L72 72M0 0L38 92M0 0L0 100"/><path d="M26 0Q21 21 0 26M50 0Q40 40 0 50M74 0Q58 58 0 74"/></g>';
const CORNERS='<svg class="cw l" viewBox="0 0 100 100" aria-hidden="true">'+CORNER+'</svg><svg class="cw r" viewBox="0 0 100 100" aria-hidden="true">'+CORNER+'</svg>';
const HANG='<svg class="hang" viewBox="0 0 40 90" aria-hidden="true"><line x1="20" y1="0" x2="20" y2="52" stroke="#000" stroke-width="1"/><g stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M14 58l-9-6M13 62l-10 1M13 66l-9 7M15 70l-6 9M26 58l9-6M27 62l10 1M27 66l9 7M25 70l6 9"/></g><ellipse cx="20" cy="66" rx="8" ry="9" fill="#000"/><circle cx="20" cy="54" r="5.5" fill="#000"/><circle cx="18" cy="53" r="1.6" fill="#fff"/><circle cx="22.5" cy="53" r="1.6" fill="#fff"/></svg>';
const SHIELD='<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/><path d="M8.5 12l2.5 2.5L16 9.5" stroke="#d62839" stroke-linecap="round"/></svg>';
function starPts(cx,cy,R,r,n){const p=[];for(let k=0;k<n*2;k++){const a=Math.PI*k/n-Math.PI/2,rad=k%2?r:R;p.push((cx+rad*Math.cos(a)).toFixed(1)+','+(cy+rad*Math.sin(a)).toFixed(1))}return p.join(' ')}
const BURST=starPts(58,52,49,37,14);
function condLines(flags,meses){
  return String(S.cfg.cond||COND0).split('\n').map(s=>s.trim()).filter(Boolean)
    .filter(l=>{const m=l.match(/^@(\w+)\s/);return !m||flags[m[1].toLowerCase()]})
    .map(l=>l.replace(/^@\w+\s+/,'').replace(/\{meses\}/g,meses));
}
function notaInner(v){
  const c=calc(v),cf=S.cfg,its=v.items||[],res=v.estado==='reservada';
  const arm=its.some(i=>i.cat==='PC armada');
  const meses=Math.max(0,...its.map(i=>n0(i.garantia)))||n0(cf.garantia)||12;
  const ent=Math.floor(c.total+1e-9),cent=Math.round((c.total-ent)*100);
  const tw=String(cf.tienda||'Spider Store').toUpperCase().split(' '),last=tw.pop();
  const rows=its.map(i=>{const g=gHasta(v,i);return '<tr><td class="c">'+n0(i.qty)+'</td><td><b>'+esc(i.desc)+'</b><br><small>'+esc(i.cat)+'</small>'+(i.serie?'<i><s>N.º DE SERIE</s><code>'+esc(i.serie)+'</code></i>':'')+'</td><td class="c g">'+(g?'<b style="font-size:12px">'+n0(i.garantia)+' meses</b><small>hasta '+esc(fmtD(g.hasta))+'</small>':'—')+'</td><td class="r">'+fmt(i.precio)+'</td><td class="r"><b style="font-size:13px">'+fmt(itemSub(i))+'</b></td></tr>'}).join('');
  const cl=condLines({reserva:res,armado:arm},meses).map(l=>{const m=l.match(/^(.{2,42}?\.)\s+(.*)$/);return '<li>'+(m?'<b>'+esc(m[1])+'</b> '+esc(m[2]):esc(l))+'</li>'}).join('');
  return '<div class="nota">'+CORNERS+HANG+
  '<div class="nh"><div class="nbrand">'+WEB+'<div><b>'+esc(tw.join(' '))+(tw.length?' ':'')+'<span>'+esc(last)+'</span></b><small>'+esc(cf.lema)+'</small></div></div>'+
  '<div class="nnum"><svg class="burst" viewBox="0 0 116 108" aria-hidden="true"><polygon points="'+BURST+'" transform="translate(3 3)" fill="none" stroke="#d62839" stroke-width="2.4"/><polygon points="'+BURST+'" fill="#fff" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/><text class="bt1" x="58" y="43" text-anchor="middle">NOTA DE VENTA</text><text class="bt2" x="58" y="68" text-anchor="middle">N.º '+pad4(v.num)+'</text></svg><span class="nd">'+esc(fmtD(v.fecha))+(v.hora?' · '+esc(v.hora):'')+'</span>'+(res?'<em>Reserva · bajo pedido</em>':'')+'</div></div>'+
  '<div class="info"><div><small>CLIENTE</small><span>'+esc(v.cliente||' ')+'</span></div><div><small>CI / NIT</small><span>'+esc(v.doc||' ')+'</span></div><div><small>FORMA DE PAGO</small><span>'+esc(v.metodo||' ')+'</span></div><div><small>ATENDIDO POR</small><span>'+esc(v.vendedor||' ')+'</span></div></div>'+
  '<div class="tbl"><table><thead><tr><th class="c" style="width:44px">CANT.</th><th>DESCRIPCIÓN</th><th class="c" style="width:98px">GARANTÍA</th><th class="r" style="width:88px">P. UNIT.</th><th class="r" style="width:96px">SUBTOTAL</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<div class="tw"><div class="son">Son: '+esc(cap(numLetras(ent)))+' '+pad2(cent)+'/100 bolivianos.'+(v.obs?'<small>Obs.: '+esc(v.obs)+'</small>':'')+'</div><div class="tb"><div class="gt"><span>TOTAL</span><span>'+fmt(c.total)+'</span></div>'+(res?'<div><span>A cuenta</span><span>'+fmt(c.cobrado)+'</span></div><div><span>Saldo</span><span>'+fmt(c.saldo)+'</span></div>':'')+'</div></div>'+
  '<div class="gar"><div class="gh">'+SHIELD+'<b>GARANTÍA <span>SPIDER STORE</span> · '+meses+' MESES</b><small>Lo que cubre y lo que no, clarito.</small></div><ol>'+cl+'</ol></div>'+
  '<div class="fir"><div>ENTREGUÉ CONFORME</div><div>RECIBÍ CONFORME</div></div>'+
  '<div class="pie"><div class="bub">¡Gracias por tu <span>compra</span>!</div><p>'+esc([cf.tel,cf.dir].filter(Boolean).join('  ·  '))+'<br>'+esc(cf.horario||'')+(cf.redes?'  ·  <span>'+esc(cf.redes)+'</span>':'')+'</p></div></div>';
}
function notaDoc(v){
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nota de venta '+pad4(v.num)+'</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap"><style>'+NOTA_CSS+
  'body{margin:0;background:#e6e6e6}.bar{text-align:center;padding:12px}.bar button{font:700 15px sans-serif;padding:10px 22px;border:2px solid #000;background:#fff;border-radius:10px;cursor:pointer}.nota{margin:0 auto 24px}'+
  '@media screen and (max-width:760px){.nota{width:auto;margin:0 8px 16px;padding:16px}.nota .info{grid-template-columns:1fr 1fr}.nota .gar ol{columns:1}.nota .tw{flex-direction:column}.nota .hang{display:none}.nota .nh{flex-wrap:wrap}}'+
  '@media print{@page{size:letter;margin:6mm}body{background:#fff}.bar{display:none}.nota{width:auto;margin:0}}'+
  '</style></head><body><div class="bar"><button onclick="window.print()">Imprimir o guardar como PDF</button></div>'+notaInner(v)+'</body></html>';
}
function fitNota(){
  const w=$('#nwrap'),s=$('#nscale');if(!w||!s||!s.firstElementChild)return;
  const sc=Math.min(1,w.clientWidth/720);s.style.transformOrigin='top left';s.style.transform='scale('+sc+')';w.style.height=(s.firstElementChild.offsetHeight*sc)+'px';
}
/* ===== PDF real de la nota (pdf-lib, sin red) ===== */
async function notaPdfBuild(v,FS){
  const {PDFDocument,StandardFonts,rgb}=PDFLib;
  const doc=await PDFDocument.create();
  doc.setTitle('Nota de venta '+pad4(v.num)+' - '+(S.cfg.tienda||'Spider Store'));
  doc.setProducer('Spider Store');doc.setCreator('Spider Store · Ventas');
  const F=await doc.embedFont(StandardFonts.Helvetica),B=await doc.embedFont(StandardFonts.HelveticaBold),O=await doc.embedFont(StandardFonts.HelveticaOblique),M=await doc.embedFont(StandardFonts.CourierBold);
  const PW=612,PH=792,MX=30,MT=28,MB=26,CW=PW-2*MX;
  const K=rgb(0,0,0),RED=rgb(.839,.157,.224),GR=rgb(.38,.38,.38),W=rgb(1,1,1),LG=rgb(.94,.94,.94);
  const okc=new Map();
  const clean=(s,f)=>{
    s=String(s==null?'':s).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ');
    let o='';for(const ch of s){const k=ch+(f===M?'m':'h');let r=okc.get(k);if(r===undefined){try{f.widthOfTextAtSize(ch,1);r=ch}catch(e){r='?'}okc.set(k,r)}o+=r}
    return o;
  };
  const wd=(s,f,sz,sp)=>f.widthOfTextAtSize(s,sz)+(sp||0)*s.length;
  let pg,y;
  const path=(d,o)=>pg.drawSvgPath(d,Object.assign({x:0,y:PH},o));
  const rr=(x,t,w,h,r)=>`M${x+r} ${t}H${x+w-r}Q${x+w} ${t} ${x+w} ${t+r}V${t+h-r}Q${x+w} ${t+h} ${x+w-r} ${t+h}H${x+r}Q${x} ${t+h} ${x} ${t+h-r}V${t+r}Q${x} ${t} ${x+r} ${t}Z`;
  const T=(s,x,by,o)=>{ /* by = línea base en coords PDF */
    o=o||{};const f=o.f||F,sz=o.sz||9;s=clean(s,f);if(!s)return 0;
    const sp=o.sp||0,w=wd(s,f,sz,sp)-(sp?sp:0);
    if(o.al==='r')x-=w;else if(o.al==='c')x-=w/2;
    if(!sp)pg.drawText(s,{x,y:by,size:sz,font:f,color:o.c||K});
    else{let cx=x;for(const ch of s){pg.drawText(ch,{x:cx,y:by,size:sz,font:f,color:o.c||K});cx+=f.widthOfTextAtSize(ch,sz)+sp}}
    return w;
  };
  const wrap=(s,f,sz,mw)=>{
    s=clean(s,f);const out=[];let cur='';
    for(const w0 of s.split(' ')){
      let w=w0;
      while(w&&wd(w,f,sz)>mw){let k=w.length;while(k>1&&wd(w.slice(0,k),f,sz)>mw)k--;if(cur){out.push(cur);cur=''}out.push(w.slice(0,k));w=w.slice(k)}
      if(!w)continue;
      const t=cur?cur+' '+w:w;
      if(wd(t,f,sz)<=mw)cur=t;else{out.push(cur);cur=w}
    }
    if(cur)out.push(cur);return out.length?out:[''];
  };
  const wrapRich=(segs,sz,mw)=>{
    const words=[];segs.forEach(sg=>clean(sg.t,sg.f).split(' ').filter(Boolean).forEach(w=>words.push({w,f:sg.f})));
    const sw=F.widthOfTextAtSize(' ',sz),lines=[];let cur=[],cw=0;
    words.forEach(o=>{const ww=o.f.widthOfTextAtSize(o.w,sz);
      if(cur.length&&cw+sw+ww>mw){lines.push(cur);cur=[];cw=0}
      o.x=cur.length?cw+sw:0;cw=o.x+ww;cur.push(o)});
    if(cur.length)lines.push(cur);return lines;
  };
  const dash=(x1,t,x2,o)=>pg.drawLine({start:{x:x1,y:PH-t},end:{x:x2,y:PH-t},thickness:o&&o.th||.6,color:o&&o.c||GR,dashArray:o&&o.solid?undefined:[2,2]});
  /* telaraña de esquina: (cx,cy)=esquina top-left coords, sx/sy=±1 */
  const webCorner=(cx,cy,sx,sy,L)=>{
    const angs=[0,.3,.62,.95,1.2,Math.PI/2].map(a=>a),R=[.28,.52,.78];
    angs.forEach(a=>{path(`M${cx} ${cy}L${cx+sx*L*Math.cos(a)} ${cy+sy*L*Math.sin(a)}`,{borderColor:GR,borderWidth:.5})});
    R.forEach(r=>{let d='';for(let i=0;i<angs.length-1;i++){const a1=angs[i],a2=angs[i+1],m=(a1+a2)/2,rr0=L*r;
      const p1=[cx+sx*rr0*Math.cos(a1),cy+sy*rr0*Math.sin(a1)],p2=[cx+sx*rr0*Math.cos(a2),cy+sy*rr0*Math.sin(a2)],pm=[cx+sx*rr0*.9*Math.cos(m),cy+sy*rr0*.9*Math.sin(m)];
      d+=(i?'':`M${p1[0]} ${p1[1]}`)+`Q${pm[0]} ${pm[1]} ${p2[0]} ${p2[1]}`}
      path(d,{borderColor:GR,borderWidth:.5})});
  };
  const frame=()=>{
    path(rr(14,14,PW-28,PH-28,10),{borderColor:K,borderWidth:1.6});
    path(rr(18,18,PW-36,PH-36,7),{borderColor:K,borderWidth:.5});
    webCorner(14,14,1,1,58);webCorner(PW-14,PH-14,-1,-1,58);
  };
  const newPage=()=>{pg=doc.addPage([PW,PH]);frame();y=PH-MT-6};
  const room=h=>y-h>=MB+4;
  newPage();

  /* ---- datos ---- */
  const c=calc(v),cf=S.cfg,its=v.items||[],res=v.estado==='reservada';
  const arm=its.some(i=>i.cat==='PC armada');
  const meses=Math.max(0,...its.map(i=>n0(i.garantia)))||n0(cf.garantia)||12;
  const ent=Math.floor(c.total+1e-9),cent=Math.round((c.total-ent)*100);
  const tw=String(cf.tienda||'Spider Store').toUpperCase().split(' '),last=tw.pop(),first=tw.join(' ');

  /* ---- encabezado ---- */
  const top=PH-y; /* top-coords */
  const wx=MX+24,wy=top+26;
  [[0,-24],[21,-12],[21,12],[0,24],[-21,12],[-21,-12]].forEach(p=>path(`M${wx} ${wy}L${wx+p[0]} ${wy+p[1]}`,{borderColor:K,borderWidth:1.2}));
  [8,15,22].forEach(r=>{let d='';for(let k=0;k<6;k++){const a=-Math.PI/2+k*Math.PI/3,px=wx+r*Math.cos(a)*(r===22?1:.95),py=wy+r*Math.sin(a)*(r===22?1:.95);d+=(k?'L':'M')+px+' '+py}path(d+'Z',{borderColor:K,borderWidth:r===22?1.2:.8})});
  const bx=MX+56,bsz=30;let bw=0;
  if(first){bw=T(first+' ',bx,y-34,{f:B,sz:bsz,sp:1.2})+4}
  T(last,bx+bw,y-34,{f:B,sz:bsz,sp:1.2,c:RED});
  T(cf.lema||'',bx+1,y-48,{f:B,sz:7.6,sp:1.1,c:GR});
  T(cf.tel||'',bx+1,y-60,{f:F,sz:7.4,c:GR});
  /* ráfaga */
  const bcx=PW-MX-54,bcy=top+50,pts=(R,r,n)=>{let d='';for(let k=0;k<n*2;k++){const a=Math.PI*k/n-Math.PI/2,rad=k%2?r:R;d+=(k?'L':'M')+(bcx+rad*Math.cos(a))+' '+(bcy+rad*Math.sin(a))}return d+'Z'};
  const burstD=pts(46,35,14);
  pg.drawSvgPath(burstD,{x:3,y:PH-3,borderColor:RED,borderWidth:1.6});
  path(burstD,{color:W,borderColor:K,borderWidth:1.8});
  T('NOTA DE VENTA',bcx,PH-(bcy-9),{f:B,sz:6.3,al:'c',sp:.2});
  T('N.º '+pad4(v.num),bcx,PH-(bcy+12),{f:B,sz:17.5,al:'c'});
  const dtx=fmtD(v.fecha)+(v.hora?' · '+v.hora:'');
  T(dtx,bcx-54,PH-(bcy-2),{f:B,sz:9.5,al:'r'});
  if(res)T('Reserva · bajo pedido',bcx-54,PH-(bcy+11),{f:O,sz:8.5,al:'r',c:RED});
  y=PH-(top+100);

  /* ---- datos del cliente ---- */
  const lab=[['CLIENTE',v.cliente],['CI / NIT',v.doc],['FORMA DE PAGO',v.metodo],['ATENDIDO POR',v.vendedor]];
  const gap=7,bw4=(CW-3*gap)/4,ih=30,it=PH-y;
  lab.forEach((l,k)=>{const x=MX+k*(bw4+gap);
    path(rr(x,it,bw4,ih,5),{color:LG,borderColor:K,borderWidth:.9});
    T(l[0],x+6,PH-(it+10),{f:B,sz:5.8,sp:.8,c:GR});
    let vs=9.5,val=clean(l[1]||' ',B);while(vs>6.5&&wd(val,B,vs)>bw4-12)vs-=.3;if(wd(val,B,vs)>bw4-12)val=wrap(val,B,vs,bw4-12)[0];T(val,x+6,PH-(it+23),{f:B,sz:vs});
  });
  y-=ih+10;

  /* ---- tabla ---- */
  const cols={q:36,g:86,p:64,s:74},dw=CW-cols.q-cols.g-cols.p-cols.s;
  const xq=MX,xd=MX+cols.q,xg=xd+dw,xp=xg+cols.g,xs=xp+cols.p;
  const tHead=()=>{const t=PH-y;
    path(rr(MX,t,CW,17,4),{color:K});
    T('CANT.',xq+cols.q/2,PH-(t+11.5),{f:B,sz:6.4,sp:.8,c:W,al:'c'});
    T('DESCRIPCIÓN',xd+6,PH-(t+11.5),{f:B,sz:6.4,sp:.8,c:W});
    T('GARANTÍA',xg+cols.g/2,PH-(t+11.5),{f:B,sz:6.4,sp:.8,c:W,al:'c'});
    T('P. UNIT.',xs-6,PH-(t+11.5),{f:B,sz:6.4,sp:.8,c:W,al:'r'});
    T('SUBTOTAL',MX+CW-6,PH-(t+11.5),{f:B,sz:6.4,sp:.8,c:W,al:'r'});
    y-=17+2;};
  tHead();
  its.forEach(i=>{
    const g=gHasta(v,i);
    const dl=wrap(i.desc||'',B,9.6,dw-12),sl=i.serie?wrap(i.serie,M,8.2,dw-12-40):[];
    const rh=Math.max(24,6+dl.length*11.5+9+(sl.length?4+sl.length*10:0));
    if(!room(rh+160)){newPage();tHead()}
    let by=y-6-8;
    dl.forEach(s=>{T(s,xd+6,by,{f:B,sz:9.6});by-=11.5});
    T(i.cat||'',xd+6,by+1,{f:F,sz:6.8,c:GR});by-=9;
    if(sl.length){by-=4;
      const lt=PH-(by+7);path(rr(xd+6,lt,36,9,2.5),{color:K});T('N.º SERIE',xd+24,by+1.6,{f:B,sz:5.2,al:'c',c:W,sp:.3});
      sl.forEach((s,k)=>{T(s,xd+46,by+(k?0:0),{f:M,sz:8.2});by-=10})}
    const mid=y-rh/2;
    T(String(n0(i.qty)),xq+cols.q/2,mid-3.5,{f:B,sz:10.5,al:'c'});
    if(g){T(n0(i.garantia)+' meses',xg+cols.g/2,mid+1,{f:B,sz:8.6,al:'c'});T('hasta '+fmtD(g.hasta),xg+cols.g/2,mid-8,{f:F,sz:6.6,al:'c',c:GR})}
    else T('—',xg+cols.g/2,mid-3,{f:F,sz:9,al:'c'});
    T(fmt(i.precio),xs-6,mid-3,{f:F,sz:8.8,al:'r'});
    T(fmt(itemSub(i)),MX+CW-6,mid-3.5,{f:B,sz:10,al:'r'});
    y-=rh;dash(MX,PH-y,MX+CW);
  });
  y-=10;

  /* ---- total ---- */
  const nl=res?3:1,tbw=186,tbh=22+(res?2*15:0);
  const son=wrap('Son: '+cap(numLetras(ent))+' '+pad2(cent)+'/100 bolivianos.',B,8.6,CW-tbw-20);
  const ob=v.obs?wrap('Obs.: '+v.obs,F,7.4,CW-tbw-20):[];
  const need=Math.max(tbh,son.length*11+ob.length*9+4);
  if(!room(need+330)){newPage()}
  const tt=PH-y;
  let sy=y-9;son.forEach(s=>{T(s,MX+2,sy,{f:B,sz:8.6});sy-=11});ob.forEach(s=>{T(s,MX+2,sy-1,{f:O,sz:7.4,c:GR});sy-=9});
  path(rr(PW-MX-tbw,tt,tbw,22,5),{color:K});
  T('TOTAL',PW-MX-tbw+10,PH-(tt+15),{f:B,sz:9,sp:1,c:W});T(fmt(c.total),PW-MX-8,PH-(tt+15.5),{f:B,sz:12.5,al:'r',c:W});
  if(res){
    [['A cuenta',c.cobrado],['Saldo',c.saldo]].forEach((r,k)=>{const ty=tt+22+(k+1)*14;T(r[0],PW-MX-tbw+10,PH-ty+1,{f:F,sz:8.8});T(fmt(r[1]),PW-MX-8,PH-ty+1,{f:B,sz:9,al:'r'});dash(PW-MX-tbw,ty+3,PW-MX-2)});
  }
  y-=need+12;

  /* ---- garantía ---- */
  const cl=condLines({reserva:res,armado:arm},meses).map(l=>{const m=l.match(/^(.{2,42}?\.)\s+(.*)$/);return m?[m[1],m[2]]:['',l]});
  const fs=FS,ld=FS*1.17,pad=8,cg=14,colW=(CW-2*pad-cg)/2,txW=colW-14;
  const blocks=cl.map((p,k)=>{const lines=wrapRich([{t:p[0]+(p[0]?' ':''),f:B},{t:p[1],f:F}],fs,txW);return {n:k+1,lines,h:lines.length*ld+3.2}});
  const tot=blocks.reduce((a,b)=>a+b.h,0);let acc=0,split=blocks.length;
  for(let k=0;k<blocks.length;k++){if(acc+blocks[k].h/2>=tot/2){split=k;break}acc+=blocks[k].h}
  const colA=blocks.slice(0,split),colB=blocks.slice(split);
  const hA=colA.reduce((a,b)=>a+b.h,0),hB=colB.reduce((a,b)=>a+b.h,0),bodyH=Math.max(hA,hB)+2*pad-3;
  const gh=24,footH=118;
  if(!room(gh+bodyH+footH)){newPage()}
  const gt=PH-y;
  /* cuerpo + cabecera garantía */
  path(rr(MX,gt+gh-4,CW,bodyH+4,5),{borderColor:K,borderWidth:1.1});
  path(rr(MX,gt,CW,gh,5),{color:K});
  const sx=MX+9,sy2=gt+4;
  path(`M${sx+8} ${sy2}L${sx+16} ${sy2+3}V${sy2+9}Q${sx+16} ${sy2+15} ${sx+8} ${sy2+18}Q${sx} ${sy2+15} ${sx} ${sy2+9}V${sy2+3}Z`,{color:W});
  path(`M${sx+4.2} ${sy2+9.2}L${sx+7.2} ${sy2+12}L${sx+12} ${sy2+6.2}`,{borderColor:RED,borderWidth:1.6});
  let hx=MX+32;
  hx+=T('GARANTÍA ',hx,PH-(gt+15.5),{f:B,sz:11,sp:.8,c:W});
  hx+=T('SPIDER STORE',hx,PH-(gt+15.5),{f:B,sz:11,sp:.8,c:rgb(1,.45,.5)});
  T(' · '+meses+' MESES',hx,PH-(gt+15.5),{f:B,sz:11,sp:.8,c:W});
  T('Lo que cubre y lo que no, clarito.',MX+CW-9,PH-(gt+15),{f:O,sz:7.6,al:'r',c:W});
  const drawCol=(arr,x0)=>{let cy=PH-(gt+gh+pad-1);
    arr.forEach(b=>{
      const ccx=x0+5.2,ccy=cy-ld*.5-1.2;
      pg.drawCircle({x:ccx,y:ccy,size:4.8,borderColor:K,borderWidth:.8,color:W});
      T(String(b.n),ccx,ccy-2,{f:B,sz:5.6,al:'c'});
      b.lines.forEach((ln,li)=>ln.forEach(o=>{pg.drawText(o.w,{x:x0+14+o.x,y:cy-ld*(li+1)+2.2,size:fs,font:o.f,color:K})}));
      cy-=b.h});};
  drawCol(colA,MX+pad);drawCol(colB,MX+pad+colW+cg);
  y-=gh+bodyH-4+16;

  /* ---- firmas ---- */
  if(!room(footH-10))newPage();
  y-=26;
  [[MX+CW*.25,'ENTREGUÉ CONFORME'],[MX+CW*.75,'RECIBÍ CONFORME']].forEach(s=>{dash(s[0]-82,PH-y,s[0]+82,{solid:true,c:K,th:.9});T(s[1],s[0],y-10,{f:B,sz:6.6,sp:1,al:'c',c:GR})});
  y-=24;
  /* ---- pie ---- */
  const bt=PH-y,bwid=150;
  path(rr(PW/2-bwid/2,bt,bwid,20,10),{color:W,borderColor:K,borderWidth:1.2});
  const t1='¡Gracias por tu ',t2='compra',t3='!',szb=10.5;
  const wTot=wd(clean(t1,B),B,szb)+wd(t2,B,szb)+wd(t3,B,szb);let px=PW/2-wTot/2;
  px+=T(t1,px,PH-(bt+13.8),{f:B,sz:szb});px+=T(t2,px,PH-(bt+13.8),{f:B,sz:szb,c:RED});T(t3,px,PH-(bt+13.8),{f:B,sz:szb});
  T([cf.tel,cf.dir].filter(Boolean).join('  ·  '),PW/2,PH-(bt+34),{f:F,sz:7.6,al:'c',c:GR});
  const l3=[cf.horario,cf.redes].filter(Boolean).join('  ·  ');
  if(l3)T(l3,PW/2,PH-(bt+44),{f:F,sz:7.6,al:'c',c:GR});
  return {bytes:await doc.save(),pages:doc.getPageCount()};
}
async function notaPdf(v){
  for(const fs of [7.3,7,6.7,6.45]){const r=await notaPdfBuild(v,fs);if(r.pages===1)return r.bytes}
  return (await notaPdfBuild(v,7.2)).bytes;
}

function waNumber(s){
  let d=String(s==null?'':s).replace(/\D/g,'');
  if(!d)return '';
  d=d.replace(/^00/,'');
  if(d.length===8)return '591'+d;
  return d.length>=10?d:'';
}
function waText(v){
  const cf=S.cfg,nom=String(v.cliente||'').trim().split(/\s+/)[0];
  return '¡Hola'+(nom?' '+nom:'')+'! Te envío tu nota de venta N.º '+pad4(v.num)+' de '+(cf.tienda||'Spider Store')+' en PDF, con el detalle y la garantía de tu compra. ¡Gracias por ser parte de la telaraña! 🕸️';
}
function waLink(v,tel){
  const n=waNumber(tel);
  return 'https://wa.me/'+n+'?text='+encodeURIComponent(waText(v));
}
function updateWa(){
  const t=$('#watel'),a=$('#wa'),hn=$('#wahint');if(!t||!a||!curNota)return;
  const n=waNumber(t.value);
  a.href=waLink(curNota,t.value);
  if(hn)hn.textContent=n?('Se abrirá el chat con +'+n.slice(0,3)+' '+n.slice(3)+'.'):(t.value.trim()?'Revisa el número: faltan dígitos.':'Sin número, WhatsApp te deja elegir el contacto.');
}
const canShareFiles=()=>{try{return !!(navigator.canShare&&navigator.canShare({files:[new File([new Uint8Array(1)],'a.pdf',{type:'application/pdf'})]}))}catch(e){return false}};
function openNota(v){
  curNota=v;curPdf=notaPdf(v).catch(()=>null);
  const sh=canShareFiles();
  modal('<div class="row between" style="margin-bottom:10px"><h2>Nota #'+pad4(v.num)+'</h2><button class="btn sm" data-act="close">Cerrar</button></div>'+
  '<div class="card" style="background:var(--bg)"><h3 style="margin-bottom:8px">Enviar al cliente</h3>'+
  '<label class="f"><span>Celular del cliente (WhatsApp)</span><input id="watel" inputmode="tel" autocomplete="off" placeholder="Ej. 730-94025" value="'+esc(v.tel||'')+'"></label>'+
  '<div class="row" style="margin-top:10px">'+(sh?'<button class="btn blue" id="pdfbtn" data-act="share-nota">Compartir PDF</button><button class="btn" data-act="dl-nota">Descargar PDF</button>':'<button class="btn blue" id="pdfbtn" data-act="dl-nota">Descargar PDF</button>')+'<a class="btn wa" id="wa" href="#" target="_blank" rel="noopener noreferrer">Abrir chat de WhatsApp</a></div>'+
  '<p class="mut small" id="wahint" style="margin-top:8px"></p>'+
  '<p class="mut small" style="margin-top:4px">'+(sh?'En el celular: toca «Compartir PDF», elige WhatsApp y luego el contacto; el archivo va adjunto. ':'Descarga el PDF, abre el chat con el botón verde y arrastra el archivo al chat (o usa el clip → Documento). ')+'WhatsApp no permite adjuntar archivos desde un enlace, por eso el PDF se envía con estos pasos.</p>'+
  '<div class="row" style="margin-top:6px"><button class="btn sm" data-act="copy-wa">Copiar saludo</button><button class="btn sm" data-act="dl-html">Versión para imprimir (HTML)</button></div></div>'+
  '<div class="nwrap" id="nwrap"><div id="nscale">'+notaInner(v)+'</div></div><div class="actions" style="justify-content:flex-start"><button class="btn" data-act="close">Listo</button></div>',true);
  updateWa();fitNota();setTimeout(fitNota,200);setTimeout(fitNota,800);
}
async function getPdf(){
  let b=await curPdf;if(!b)b=await notaPdf(curNota);return b;
}
async function downloadNota(){
  if(!curNota)return;
  try{const b=await getPdf();await saveFile('nota-de-venta-'+pad4(curNota.num)+'.pdf',b,'application/pdf');toast('PDF descargado')}
  catch(e){toast('No se pudo crear el PDF')}
}
async function shareNota(){
  if(!curNota)return;
  try{
    const b=await getPdf(),name='nota-de-venta-'+pad4(curNota.num)+'.pdf';
    const file=new File([b],name,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:'Nota de venta N.º '+pad4(curNota.num),text:waText(curNota)});return}
      catch(e){if(e&&e.name==='AbortError')return}
    }
    await saveFile(name,b,'application/pdf');toast('PDF descargado: adjúntalo en el chat');
  }catch(e){toast('No se pudo crear el PDF')}
}
async function downloadNotaHtml(){
  if(!curNota)return;
  await saveFile('nota-de-venta-'+pad4(curNota.num)+'.html',notaDoc(curNota),'text/html;charset=utf-8');toast('Nota lista');
}
window.addEventListener('resize',fitNota);

/* ===== eventos ===== */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,d=b.dataset;
  if(a==='nav')return go(d.v);
  if(a==='cuenta')return openCuenta();
  if(a==='logout')return doLogout();
  if(a==='af'){af=d.p;mounted=null;render();return}
  if(a==='mf'){mf=d.p;mounted=null;render();return}
  if(a==='user-meta'){const pf=perfil(d.id);if(!pf)return;
    modal('<h2>Meta diaria de '+esc(pf.nombre||pf.usuario)+'</h2><form id="mm"><label class="f"><span>Ganancia que debe generar por día (Bs)</span><input name="m" type="number" min="0" step="any" inputmode="decimal" required value="'+n0(pf.meta_diaria)+'"></label><div class="hint">Con 0 no se muestra meta. Él ve su avance y el total de ganancia, nunca los costos de cada producto.</div><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
    $('#mm').addEventListener('submit',ev=>{ev.preventDefault();const x=n0(ev.target.elements.m.value);if(x<0){toast('La meta no puede ser negativa');return}
      guard(async()=>{const r=await sb.from('perfiles').update({meta_diaria:x}).eq('id',d.id);if(r.error)throw r.error;await loadAll();mounted=null;render();closeModal();toast('Meta guardada')})});return}
  if(a==='ciclo-dia'){modal('<h2>Día de corte del pago</h2><form id="cd"><label class="f"><span>El ciclo mensual empieza el día</span><input name="d" type="number" min="1" max="28" step="1" inputmode="numeric" required value="'+cicloDia()+'"></label><div class="hint">Con 16, cada ciclo va del 16 de un mes al 15 del siguiente. Usa un día entre 1 y 28.</div><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
    $('#cd').addEventListener('submit',ev=>{ev.preventDefault();const x=Math.round(n0(ev.target.elements.d.value));if(x<1||x>28){toast('Escribe un día entre 1 y 28');return}guard(async()=>{await setCfg({cicloDia:x});mounted=null;render();closeModal();toast('Día de corte guardado')})});return}
  if(a==='user-com'){const pf=perfil(d.id);if(!pf)return;
    modal('<h2>Comisión de '+esc(pf.nombre||pf.usuario)+'</h2><form id="cm"><label class="f"><span>Porcentaje de la ganancia (%)</span><input name="pct" type="number" min="0" max="100" step="any" inputmode="decimal" required value="'+n0(pf.comision_pct)+'"></label><div class="hint">Se aplica a las ventas nuevas. Las que ya registró conservan el porcentaje con el que se hicieron.</div><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');
    $('#cm').addEventListener('submit',ev=>{ev.preventDefault();const x=n0(ev.target.elements.pct.value);if(x<0||x>100){toast('Escribe un porcentaje entre 0 y 100');return}
      guard(async()=>{const r=await sb.from('perfiles').update({comision_pct:x}).eq('id',d.id);if(r.error)throw r.error;await loadAll();mounted=null;render();closeModal();toast('Comisión guardada')})});return}
  if(a==='pay-com'){const r=comRows().find(x=>x.id===d.id);if(!r||!r.ids.length)return;
    modal('<h2>¿Marcar como pagada?</h2><p class="mut">Comisión de <b>'+esc(r.nombre)+'</b> por <b>'+fmt(r.porPagar)+'</b> ('+r.ids.length+' venta(s)). Esto solo lo registra; no mueve dinero.</p><div class="actions"><button class="btn" data-act="close">Cancelar</button><button class="btn ok" id="yes">Sí, ya la pagué</button></div>');
    $('#yes').addEventListener('click',()=>guard(async()=>{const u=await sb.from('ventas').update({comision_pagada:true,comision_pagada_en:new Date().toISOString()}).in('id',r.ids);if(u.error)throw u.error;await refresh(true);closeModal();toast('Comisión registrada como pagada')}));return}
  if(a==='open-mia')return openMia(d.id);
  if(a==='mi-costo'){closeModal();return openMiCosto(d.v,d.i)}
  if(a==='aprobar-costos')return guard(async()=>{const r=await sb.from('venta_items').update({costo_estado:'oficial'}).eq('venta_id',d.id).eq('costo_estado','revision');if(r.error)throw r.error;await refresh(true);closeModal();toast('Costos aprobados')});
  if(a==='ok-prov')return guard(async()=>{const r=await sb.from('proveedores').update({revisado:true}).eq('id',d.id);if(r.error)throw r.error;await refresh(true);closeModal();toast('Proveedor aprobado')});
  if(a==='aprobar')return guard(async()=>{await setAprob(d.id,'aprobada','');closeModal();toast('Venta aprobada')});
  if(a==='observar'){modal('<h2>Observar venta</h2><p class="mut" style="margin-bottom:10px">Deja una nota para recordar qué falta revisar.</p><form id="of"><label class="f"><span>Nota</span><input name="n" required placeholder="Ej. Falta confirmar el precio"></label><div class="actions"><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn pri">Guardar</button></div></form>');$('#of').addEventListener('submit',ev=>{ev.preventDefault();guard(async()=>{await setAprob(d.id,'observada',ev.target.elements.n.value.trim());closeModal();toast('Venta observada')})});return}
  if(a==='approve-all'){modal('<h2>¿Aprobar todas las pendientes?</h2><p class="mut">Se marcarán como aprobadas las '+pendAprob()+' venta(s) por aprobar. Asegúrate de haberlas revisado.</p><div class="actions"><button class="btn" data-act="close">Cancelar</button><button class="btn ok" id="yes">Sí, aprobar</button></div>');$('#yes').addEventListener('click',()=>guard(async()=>{await aprobarTodas();closeModal();toast('Ventas aprobadas')}));return}
  if(a==='new-user')return newUserForm();
  if(a==='user-pass')return askUserPass(d.id);
  if(a==='user-toggle'){const p=S.perfiles.find(x=>x.id===d.id);if(!p)return;return guard(async()=>{await adminUser({accion:'activo',id:p.id,activo:!p.activo});toast(p.activo?'Cuenta desactivada':'Cuenta activada')})}
  if(a==='user-role'){const p=S.perfiles.find(x=>x.id===d.id);if(!p)return;return guard(async()=>{await adminUser({accion:'rol',id:p.id,rol:p.rol==='admin'?'vendedor':'admin'});toast('Rol cambiado')})}
  if(a==='share-nota')return shareNota();
  if(a==='close')return closeModal();
  if(a==='add-item'){syncDraft();D.items.push(blankItem());mounted=null;render();const ds=document.querySelectorAll('#items [data-f=desc]');if(ds.length)ds[ds.length-1].focus();return}
  if(a==='rm-item'){syncDraft();const k=+b.closest('.item').dataset.i;D.items.splice(k,1);if(!D.items.length)D.items.push(blankItem());mounted=null;render();return}
  if(a==='save-sale')return saveSale();
  if(a==='vf'){vf=d.p;mounted=null;render();return}
  if(a==='rp'){rp=d.p;mounted=null;render();return}
  if(a==='open-venta')return openVenta(d.id);
  if(a==='show-nota'){const v=S.ventas.find(x=>x.id===d.id);if(v)openNota(v);return}
  if(a==='dl-nota')return downloadNota();
  if(a==='dl-html')return downloadNotaHtml();
  if(a==='copy-wa'){if(!curNota)return;try{navigator.clipboard.writeText(waText(curNota)).then(()=>toast('Mensaje copiado'),()=>toast('No se pudo copiar'))}catch(err){toast('No se pudo copiar')}return}
  if(a==='cobro')return openCobro(d.id);
  if(a==='del-venta')return confirmDel(d.id);
  if(a==='edit-venta'){const v=S.ventas.find(x=>x.id===d.id);if(!v)return;D=JSON.parse(JSON.stringify(v));D.cobrado=v.estado==='reservada'?v.cobrado:'';closeModal();view='vender';mounted=null;render();window.scrollTo(0,0);return}
  if(a==='assign'){closeModal();return openAssign(d.v,+d.i)}
  if(a==='ctab'){cTab=d.t;mounted=null;render();return}
  if(a==='new-prov')return provForm(null);
  if(a==='open-prov')return openProv(d.id);
  if(a==='edit-prov')return provForm(prov(d.id));
  if(a==='del-prov'){const p=prov(d.id);if(!p)return;modal('<h2>¿Eliminar a '+esc(p.nombre)+'?</h2><p class="mut">Las ventas conservan sus costos, pero el nombre del proveedor dejará de mostrarse.</p><div class="actions"><button class="btn" data-act="close">Cancelar</button><button class="btn pri" id="yes">Sí, eliminar</button></div>');$('#yes').addEventListener('click',()=>guard(async()=>{await delDoc('proveedores',d.id);closeModal();toast('Proveedor eliminado')}));return}
  if(a==='pay-item')return guard(async()=>{await payItems(d.p,{v:d.v,k:+d.i});toast('Marcado como pagado');setTimeout(()=>openProv(d.p),250)});
  if(a==='pay-all')return guard(async()=>{await payItems(d.p,null);toast('Deuda pagada');setTimeout(()=>openProv(d.p),250)});
  if(a==='csv')return exportCsv();
  if(a==='cond-reset'){setCfg({cond:''});mounted=null;render();toast('Texto restaurado')}
});
document.addEventListener('submit',e=>{
  if(e.target.id==='lf'){e.preventDefault();const el=e.target.elements;const b=e.target.querySelector('button');if(b)b.disabled=true;doLogin(el.u.value,el.p.value).finally(()=>{if(b)b.disabled=false})}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='watel'){updateWa();return}
  if(view==='vender'&&mounted==='vender'&&(t.closest('#items')||t.dataset.k)){syncDraft();updateTotals();return}
  if(t.id==='q'){q=t.value;const l=$('#vlist');if(l)l.innerHTML=listVentas()}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='ccsel'){cc=t.value==='todo'?'todo':+t.value;mounted=null;render();return}
  if(t.id==='watel'&&curNota){curNota.tel=t.value.trim();const sv=S.ventas.find(x=>x.id===curNota.id);if(sv&&sv.tel!==curNota.tel)guard(async()=>{await put('ventas',{...sv,tel:curNota.tel})});return}
  if(view==='vender'&&mounted==='vender'){
    if(t.dataset.k==='reserva'){syncDraft();const r=$('#resv');if(r)r.hidden=D.estado!=='reservada';if(D.estado==='reservada'&&!n0(D.cobrado)){const c=calc({items:D.items,estado:'entregada'});D.cobrado=Math.round(c.total/2*100)/100;const ci=$('[data-k=cobrado]');if(ci)ci.value=D.cobrado}updateTotals();return}
    if(t.dataset.f==='desc'){const row=t.closest('.item'),it=D.items[+row.dataset.i];syncDraft();const lp=lastInfo().price[norm(t.value)];if(it&&!n0(it.precio)&&lp){it.precio=lp;row.querySelector('[data-f=precio]').value=lp}updateTotals()}
  }
  if(view==='ajustes'&&t.dataset.c){const k=t.dataset.c;setCfg({[k]:k==='garantia'?n0(t.value):(k==='cond'&&t.value.trim()===COND0.trim()?'':t.value)});toast('Guardado')}
});
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(e.key==='Enter'&&t.dataset&&t.dataset.f==='serie'){
    e.preventDefault();
    const row=t.closest('.item'),qty=n0(row.querySelector('[data-f=qty]').value)||1;
    const list=t.value.split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean);
    if(list.length<qty){t.value=list.join(', ')+(list.length?', ':'')}
    else{t.value=list.join(', ');const nx=row.querySelector('[data-f=precio]');if(nx&&!n0(nx.value))nx.focus();else{const ad=$('[data-act=add-item]');if(ad)ad.focus()}}
    syncDraft();updateTotals();
  }
});
boot();
