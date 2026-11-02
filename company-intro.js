/* STRATEGOS STRATEGY LAB · Fase 0: constitución de empresa.
   Utiliza la ficha 'idea' existente y la RPC aislada ssl_save_idea (alias cbc_save_idea).
   No crea ni utiliza un Business Model Canvas. */
const CompanyIntro=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const fields=[
  {key:'title',label:'Nombre comercial de la empresa',hint:'Elige un nombre original y reconocible.',min:3,max:90},
  {key:'pitch',label:'¿Qué empresa habéis creado?',hint:'Explica brevemente qué producto industrial o elemento constructivo vais a fabricar y qué necesidad resuelve.',min:40,max:700},
  {key:'customers',label:'¿Quiénes serán vuestros clientes?',hint:'Identifica clientes o usuarios y describe sus necesidades.',min:30,max:700},
  {key:'value',label:'¿Por qué os comprarían?',hint:'Explica vuestra idea inicial de valor: coste, calidad, innovación, servicio o sostenibilidad. Aún no tenéis que elegir la estrategia competitiva definitiva.',min:40,max:800}
 ];
 const data=t=>t?.idea||{};
 function complete(t){const d=data(t);return fields.every(f=>String(d[f.key]||'').trim().length>=f.min&&String(d[f.key]||'').trim().length<=f.max);}
 function label(t){return complete(t)?String(data(t).title).trim():String(t?.name||'Empresa');}
 function view(t,game){
  const d=data(t),locked=game.round!==1||game.phase!=='decisions',done=complete(t);
  return '<section class="card" id="company-intro"><span class="tag">FASE 0 · ANTES DEL TEMA 2</span>'+
   '<h2>Cread vuestra empresa</h2>'+
   '<p>En esta simulación no representáis a una empresa ya existente: <b>sois el equipo fundador</b> de una empresa industrial ficticia. Durante las cuatro rondas tomaréis decisiones por ella. Antes de analizar el entorno o hacer un DAFO, decidid qué fabricará, a quién venderá y qué valor propone.</p>'+
   '<p>El mercado del simulador es común: empresas que ofrecen un <b>elemento constructivo o componente industrial de función comparable</b>. Podéis idear vuestra marca y producto concreto, pero todas competirán con las mismas reglas de precio, producción, calidad, innovación e impacto ambiental.</p>'+
   '<p><b>Recursos iniciales:</b> 250.000 € de tesorería y capacidad de 12.500 unidades por ronda. No se trata de un Canvas: es una ficha de constitución de empresa.</p>'+
   (done?'<p class="alert"><b>Empresa creada:</b> '+esc(d.title)+'. Esta identidad se utilizará durante el juego.</p>':'<p class="alert">Primero debéis guardar esta ficha para desbloquear el diagnóstico estratégico de la ronda 1.</p>')+
   (locked?'<p class="muted">Ficha en modo consulta: solo se edita en la primera ronda, antes del cierre.</p>':'')+
   '<form id="company-form">'+fields.map(f=>'<div class="strategy-field"><label for="company-'+f.key+'">'+esc(f.label)+'</label><p class="muted">'+esc(f.hint)+'</p>'+
    (f.key==='title'?'<input type="text"':'<textarea rows="3"')+' id="company-'+f.key+'" name="'+f.key+'" maxlength="'+f.max+'" '+(locked?'readonly':'required')+'>'+ (f.key==='title'?'':esc(d[f.key]||''))+(f.key==='title'?'>':'</textarea>')+
    '</div>').join('')+
   (locked?'':'<button type="submit">Guardar empresa y comenzar el diagnóstico</button>')+
   '<p id="company-feedback" aria-live="polite" class="muted"></p></form>'+
   (done?'<button type="button" id="company-continue" class="secondary">Continuar al Plan estratégico (Tema 2 → Tema 5)</button>':'')+
   '</section>';
 }
 // Fix input value separately to preserve all characters escaped and use a single valid tag.
 function render(t,game){
  const html=view(t,game);
  const d=data(t);
  return html.replace(/(<input type="text" id="company-title" name="title" maxlength="90" [^>]*?)><\/div>/,
   (full,opening)=>opening+' value="'+esc(d.title||'')+'"></div>');
 }
 function bind(code,t,game,refresh){
  const continueButton=document.getElementById('company-continue');
  if(continueButton)continueButton.onclick=()=>refresh('strategy');
  const form=document.getElementById('company-form');
  if(!form||game.round!==1||game.phase!=='decisions')return;
  form.onsubmit=async ev=>{
    ev.preventDefault();const input=new FormData(form),payload={};
    for(const f of fields){
      const v=String(input.get(f.key)||'').trim();
      if(v.length<f.min||v.length>f.max){document.getElementById('company-feedback').textContent='Revisa '+f.label.toLowerCase()+': entre '+f.min+' y '+f.max+' caracteres.';return;}
      payload[f.key]=v;
    }
    const b=form.querySelector('button[type="submit"]'),feedback=document.getElementById('company-feedback');b.disabled=true;feedback.textContent='Guardando empresa en Supabase…';
    try{await CBCSync.rpc('cbc_save_idea',{p_code:code,p_idea:payload});
      t.idea=payload;feedback.textContent='Empresa creada y guardada correctamente.';
      await refresh('strategy',true);
    }catch(err){feedback.textContent='No se ha guardado: '+err.message;b.disabled=false;}
  };
 }
 function teacherPanel(teams){
  return '<section class="card"><h3>Empresas creadas · Fase 0</h3><p>La ficha de empresa precede al DAFO de la ronda 1. Los equipos eligen su actividad dentro del mismo mercado industrial simulado.</p>'+
   '<table><thead><tr><th>Equipo</th><th>Empresa</th><th>Producto o actividad</th><th>Estado</th></tr></thead><tbody>'+
   teams.filter(t=>t.active!==false).map(t=>'<tr><td>'+esc(t.name)+'</td><td>'+esc(data(t).title||'Pendiente')+'</td><td>'+esc(data(t).pitch||'Sin definir')+'</td><td>'+(complete(t)?'Creada':'Pendiente')+'</td></tr>').join('')+'</tbody></table></section>';
 }
 return {render,bind,complete,label,teacherPanel,fields};
})();