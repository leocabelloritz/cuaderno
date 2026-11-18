/* RECUPERA — informes clínicos descriptivos por ciclo */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const fmtDate=d=>d.toLocaleDateString('es-CL',{day:'2-digit',month:'2-digit',year:'numeric'});
const fmtTime=d=>d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false});
const toDate=s=>new Date(s);
const text=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtStamp=v=>{const d=toDate(v);return Number.isNaN(d.getTime())?'-':fmtDate(d)+' '+fmtTime(d)};
const getData=()=>window.RECUPERA_REPORT_DATA?.()||{measures:[],sos:[],takes:[],meds:[]};
function range(){
  const days=Number($('cycleDays').value)||1;
  const value=$('cycleEnd').value;
  const end=value?new Date(value+'T23:59:59.999'):new Date();
  if(!value)end.setHours(23,59,59,999);
  const start=new Date(end);start.setHours(0,0,0,0);start.setDate(start.getDate()-days+1);
  return {days,start,end};
}
function build(){
  const data=getData(),period=range(),from=period.start.getTime(),to=period.end.getTime();
  const inside=v=>{const n=toDate(v).getTime();return Number.isFinite(n)&&n>=from&&n<=to};
  const medMap=new Map((data.meds||[]).map(m=>[m.id,m]));
  const m=(data.measures||[]).filter(x=>inside(x.at)).sort((a,b)=>a.at.localeCompare(b.at));
  const s=(data.sos||[]).filter(x=>inside(x.at)).sort((a,b)=>a.at.localeCompare(b.at));
  const t=(data.takes||[]).filter(x=>inside(x.at)).sort((a,b)=>a.at.localeCompare(b.at));
  const events=[
    ...m.map(x=>({at:x.at,kind:'Medición',title:'SpO₂ '+x.spo+'% · Pulso '+x.pulse+' lpm',detail:[x.symptom||'Síntoma no informado',x.note||''].filter(Boolean).join(' · ')})),
    ...s.map(x=>({at:x.at,kind:'Rescate SOS',title:'Fenoterol · '+x.dose+' inhalación(es)',detail:x.note||'Sin motivo consignado'})),
    ...t.map(x=>{const med=medMap.get(x.medId);const name=x.medName||med?.name||'Medicamento';const dose=med?.dose||'Dosis no disponible';return {at:x.at,kind:'Medicamento',title:name+' · '+dose,detail:'Marcado tomado a las '+fmtTime(toDate(x.at))+' · horario indicado: '+(x.time||'no disponible')};})
  ].sort((a,b)=>a.at.localeCompare(b.at)||a.kind.localeCompare(b.kind));
  const avg=(arr,key)=>arr.length?(arr.reduce((sum,x)=>sum+Number(x[key]),0)/arr.length).toFixed(1):'—';
  return {...period,m,s,t,events,avgSpo:avg(m,'spo'),avgPulse:avg(m,'pulse'),minSpo:m.length?Math.min(...m.map(x=>Number(x.spo))):'—'};
}
function render(){
  const r=build();
  $('cycleDates').textContent=fmtDate(r.start)+' — '+fmtDate(r.end);
  $('cycleSummary').innerHTML=[
    ['Mediciones',r.m.length],['SpO₂ media',r.avgSpo==='—'?'—':r.avgSpo+'%'],['Pulso medio',r.avgPulse==='—'?'—':r.avgPulse+' lpm'],
    ['SpO₂ mínima',r.minSpo==='—'?'—':r.minSpo+'%'],['Tomas marcadas',r.t.length],['Usos SOS',r.s.length]
  ].map(([label,v])=>'<div class="cycleStat"><span>'+text(label)+'</span><strong>'+text(v)+'</strong></div>').join('');
  if(!r.events.length){$('cycleEvents').innerHTML='<p class="small">Sin registros en este período. Puedes generar el informe igualmente.</p>';return;}
  let previous='';
  $('cycleEvents').innerHTML=r.events.map(e=>{const day=fmtDate(toDate(e.at));const heading=previous===day?'':'<div class="cycleDay">'+text(day)+'</div>';previous=day;return heading+
    '<div class="cycleEvent"><time>'+text(fmtTime(toDate(e.at)))+'</time><div><b>'+text(e.kind)+'</b><strong>'+text(e.title)+'</strong><small>'+text(e.detail||'')+'</small></div></div>';
  }).join('');
}
function jsPDFLoad(){
  if(window.jspdf?.jsPDF)return Promise.resolve(window.jspdf.jsPDF);
  return new Promise((resolve,reject)=>{
    const tag=document.createElement('script');tag.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js';
    tag.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(Error('No se pudo iniciar el generador PDF'));
    tag.onerror=()=>reject(Error('No se pudo cargar el generador PDF. Comprueba tu conexión.'));
    document.head.appendChild(tag);
  });
}
function createPDF(jsPDF,r){
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  const W=210,margin=16,right=W-margin;let y=18,page=1;
  const lineColor=[208,210,215],dark=[31,34,39],light=[110,116,126];
  function heading(){doc.setFillColor(24,26,30);doc.rect(0,0,W,12,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(245,245,247);doc.text('RECUPERA  /  INFORME DE SEGUIMIENTO',margin,8);doc.setTextColor(...dark);}
  function foot(){doc.setDrawColor(...lineColor);doc.line(margin,285,right,285);doc.setTextColor(...light);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('Registros declarados por el usuario · No reemplaza una evaluación médica',margin,290);doc.text(String(page),right,290,{align:'right'});}
  function newPage(){foot();doc.addPage();page++;y=20;heading();}
  function space(height){if(y+height>277)newPage()}
  function write(content,opts={}){
    const size=opts.size||10,weight=opts.bold?'bold':'normal';
    doc.setFont('helvetica',weight);doc.setFontSize(size);doc.setTextColor(...(opts.dim?light:dark));
    const lines=doc.splitTextToSize(String(content||'—'),opts.width||178);
    const lh=size*.47;
    space(lines.length*lh+2);doc.text(lines,margin+(opts.indent||0),y);y+=lines.length*lh+2;
  }
  heading();y=21;write('Informe por período',{size:20,bold:true});write(fmtDate(r.start)+' al '+fmtDate(r.end)+' · '+r.days+' día(s)',{size:11,dim:true});
  write('Generado: '+fmtStamp(new Date().toISOString()),{size:9,dim:true});y+=3;
  doc.setDrawColor(...lineColor);doc.line(margin,y,right,y);y+=7;
  write('RESUMEN DEL CICLO',{size:11,bold:true});
  write('Mediciones: '+r.m.length+'    SpO₂ media: '+(r.avgSpo==='—'?'—':r.avgSpo+'%')+'    SpO₂ mínima: '+(r.minSpo==='—'?'—':r.minSpo+'%'),{size:10});
  write('Pulso medio: '+(r.avgPulse==='—'?'—':r.avgPulse+' lpm')+'    Medicamentos marcados: '+r.t.length+'    Usos SOS: '+r.s.length,{size:10});y+=6;
  write('CRONOLOGÍA DE REGISTROS',{size:11,bold:true});
  if(!r.events.length)write('No se registraron mediciones, tomas ni usos SOS durante este período.',{dim:true});
  let lastDate='';
  for(const event of r.events){
    const day=fmtDate(toDate(event.at));
    if(day!==lastDate){space(13);y+=3;write(day,{size:11,bold:true});lastDate=day;}
    const title=fmtTime(toDate(event.at))+'   '+event.kind.toUpperCase()+'  ·  '+event.title;
    space(11);write(title,{size:9,bold:true});
    if(event.detail)write(event.detail,{size:9,dim:true});y+=2;
  }
  y+=4;space(17);write('Notas sobre la interpretación',{size:10,bold:true});
  write('Este informe muestra únicamente lo registrado. Un medicamento marcado indica una confirmación de toma, no una administración verificada. Una toma no marcada no demuestra que haya sido omitida.',{size:9,dim:true});
  foot();
  const end=r.end.toISOString().slice(0,10);
  doc.save('RECUPERA_informe_'+r.days+'d_'+end+'.pdf');
}
async function download(){
  const btn=$('cyclePdf'),message=$('cycleMessage');
  btn.disabled=true;btn.textContent='Preparando PDF…';message.textContent='';
  try{const ctor=await jsPDFLoad();createPDF(ctor,build());message.textContent='PDF generado. Puedes abrirlo o guardarlo desde Descargas.';}
  catch(err){message.textContent='No se pudo generar el PDF: '+err.message}
  finally{btn.disabled=false;btn.textContent='Descargar PDF';}
}
function init(){
  if(!$('cycleDays'))return;
  const now=new Date(),pad=n=>String(n).padStart(2,'0');
  $('cycleEnd').value=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
  $('cycleEnd').max=$('cycleEnd').value;
  $('cycleDays').addEventListener('change',render);$('cycleEnd').addEventListener('change',render);
  $('cyclePdf').addEventListener('click',download);
  document.querySelectorAll('[data-tab]').forEach(t=>t.addEventListener('click',()=>{if(t.dataset.tab==='dashboard')setTimeout(render,0)}));
  window.addEventListener('focus',render);
  window.addEventListener('recupera:change',render);
  render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();