/* STRATEGOS STRATEGY LAB · Analista formativo y asesor estratégico.
   El diagnóstico local usa solamente datos de la empresa autenticada.
   La modalidad generativa requiere la Edge Function strategos-advisor. */
const StrategosAdvisor=(()=>{
  const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const eur=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(num(v));
  const fmt=v=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(num(v));
  function observations(t){
    const history=Array.isArray(t?.history)?t.history:[];
    if(!history.length)return ['Todavía no hay rondas publicadas para tu empresa. Revisa tu diagnóstico, los objetivos SMART y el presupuesto de inversión antes de decidir.','Las recomendaciones se basarán en los resultados de tu equipo cuando el profesor publique la primera ronda.'];
    const last=history[history.length-1],prev=history[history.length-2],out=[];
    const cash=num(t.cash),profit=num(last.operating),sales=num(last.sales),share=num(last.share),capacity=num(t.capacity);
    if(profit<0)out.push('La última ronda registró un resultado operativo negativo ('+eur(profit)+'). Revisa margen, costes y volumen antes de aumentar la inversión.');
    else out.push('La última ronda obtuvo un resultado operativo de '+eur(profit)+'. Evalúa si este resultado es sostenible antes de ampliar capacidad.');
    if(cash<50000)out.push('La tesorería disponible es '+eur(cash)+'. Prioriza liquidez y conserva el mínimo de 15.000 € exigido por el simulador.');
    if(capacity>0&&sales/capacity<0.6)out.push('Tus ventas equivalen al '+fmt(sales/capacity*100)+' % de la capacidad. Investiga si conviene ajustar producción, precio o promoción antes de ampliar instalaciones.');
    if(capacity>0&&sales/capacity>0.94)out.push('Tu capacidad está muy utilizada. Considera si una ampliación de capacidad sería rentable, teniendo en cuenta la inversión y la demanda potencial.');
    if(prev){let delta=sales-num(prev.sales);out.push('Las unidades vendidas '+(delta>=0?'aumentaron ':'disminuyeron ')+fmt(Math.abs(delta))+' respecto a la ronda anterior. Contrasta esta evolución con el precio, la capacidad y el contexto del mercado.');}
    if(Number.isFinite(Number(last.circular))&&num(last.circular)<55)out.push('La circularidad obtenida es '+fmt(last.circular)+'/100. Examina la materia recuperada y la inversión ambiental, sin comprometer la viabilidad económica.');
    if(share<15)out.push('La cuota observada es '+fmt(share)+' %. Revisa tu propuesta de valor, calidad y atractivo comercial.');
    return out.slice(0,5);
  }
  function view(t,game){
    const history=Array.isArray(t?.history)?t.history:[],last=history[history.length-1];
    const status=last?'Diagnóstico de la ronda '+html(last.round):'Preparación de la primera ronda';
    return '<section class="card strategos-advisor"><span class="tag">STRATEGOS STRATEGY LAB · ANÁLISIS FORMATIVO</span><h2>Analista y asesor estratégico</h2><p class="muted">Tu empresa: '+html(t.name)+'. Los diagnósticos solo usan tus datos y resultados publicados. No se muestran decisiones privadas de otros equipos.</p><h3>'+status+'</h3>'+
      (last?'<div class="grid"><div class="kpi">Ventas<b>'+fmt(last.sales)+' ud.</b></div><div class="kpi">Resultado operativo<b>'+eur(last.operating)+'</b></div><div class="kpi">Tesorería<b>'+eur(t.cash)+'</b></div></div>':'')+
      '<ul class="strategos-findings">'+observations(t).map(x=>'<li>'+html(x)+'</li>').join('')+'</ul>'+
      '<div class="strategos-chat"><h3>Pregunta al asesor IA</h3><p class="muted">Puedes pedir una explicación de los resultados, identificar riesgos o comparar alternativas estratégicas. No proporciona decisiones automáticas ni predice la estrategia de los rivales.</p><label for="strategos-question">Tu pregunta</label><textarea id="strategos-question" maxlength="400" rows="3" placeholder="Ej.: ¿Qué debería analizar antes de invertir más en capacidad?"></textarea><button id="strategos-ask" type="button">Consultar al asesor IA</button><div id="strategos-answer" class="strategos-answer" role="status" aria-live="polite"></div><p class="muted">La modalidad generativa necesita activar la función segura de Supabase. Tu pregunta y los resultados de tu equipo se enviarán al proveedor de IA al utilizarla.</p></div></section>';
  }
  function bind(code){
    const button=document.getElementById('strategos-ask');if(!button)return;
    button.onclick=async()=>{
      const q=document.getElementById('strategos-question').value.trim(),output=document.getElementById('strategos-answer');
      if(!q){output.textContent='Escribe una pregunta para consultar al asesor.';return;}
      if(!code){output.textContent='Accede con tu propio código de equipo para utilizar el asesor generativo.';return;}
      button.disabled=true;output.textContent='Consultando al asesor…';
      try{
        const response=await CBCSync.advisor(code,q);
        if(!response?.answer)throw Error('La respuesta del modelo está vacía.');
        output.textContent=String(response.answer);
      }catch(e){output.textContent='Asesor generativo no disponible: '+e.message+' El diagnóstico anterior sigue disponible sin IA.';}
      finally{button.disabled=false;}
    };
  }
  return {view,bind,observations};
})();
