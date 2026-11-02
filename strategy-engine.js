/* Motor de ventaja competitiva · Tema 4.
   Coeficientes didácticos, no estimaciones empíricas. Solo se activa desde ronda 3.
   Estrategia declarada en la ficha de ronda 3, sin acceso a datos de otros equipos. */
const StrategyEngine=(()=>{
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
 const names={cost:'Liderazgo en costes',differentiate:'Diferenciación',focus:'Enfoque / segmentación'};
 const allowed=Object.keys(names);
 function choice(t,round){
  if(Number(round)<3)return null;
  const c=t?.strategy?.['3']?.competitiveChoice;
  return allowed.includes(c)?c:null;
 }
 
 /* Conexión formativa Tema 2 → Tema 4. Se reutilizan únicamente evidencias
    redactadas por el equipo en la ronda 1, sin análisis semántico automático. */
 const evidenceDefinitions=[
   {key:'swot',label:'DAFO · Oportunidad o amenaza',source:'swot',question:'¿Qué oportunidad o amenaza concreta del DAFO explica la elección de esta estrategia?'},
   {key:'forces',label:'Cinco fuerzas · Presión competitiva',source:'forces',question:'¿Qué fuerza competitiva condiciona el posicionamiento elegido?'},
   {key:'internal',label:'Cadena de valor o capacidad distintiva',source:'internal',question:'¿Qué capacidad o actividad interna permite sostener la estrategia?'}
 ];
 function evidenceStatus(t){
   const first=t?.strategy?.['1']||{},third=t?.strategy?.['3']||{},links=third.evidenceLinks||{};
   const items=evidenceDefinitions.map(spec=>{
     const source=String(first[spec.source]||'').trim(),citation=String(links[spec.key]?.citation||'').trim(),
       reasoning=String(links[spec.key]?.reasoning||'').trim();
     const sourceExists=source.length>=30;
     const traceable=sourceExists && citation.length>=15 &&
       source.toLocaleLowerCase('es').includes(citation.toLocaleLowerCase('es'));
     return {...spec,sourceExists,traceable,reasoned:reasoning.length>=40,
       ready:traceable&&reasoning.length>=40};
   });
   return {items,ready:items.every(x=>x.ready),completed:items.filter(x=>x.ready).length};
 }


 /* Tema 3 → Tema 4: dos objetivos cuantificables, con indicadores que el
    motor económico calcula realmente. La pertinencia sigue siendo docente. */
 const objectiveMetrics={
  share:{label:'Cuota de mercado (%)',min:0,max:100,key:'share',unit:'%'},
  operating:{label:'Resultado operativo (€)',min:-1000000,max:2000000,key:'operating',unit:'€'},
  cash:{label:'Tesorería (€)',min:-1000000,max:2000000,key:'cash',unit:'€'},
  quality:{label:'Calidad (0–100)',min:0,max:100,key:'quality',unit:'/100'},
  circular:{label:'Circularidad (0–100)',min:0,max:100,key:'circular',unit:'/100'},
  sales:{label:'Unidades vendidas',min:0,max:50000,key:'sales',unit:'ud.'}
 };
 const objectiveKinds={
  profitability:'Rentabilidad',
  growth:'Crecimiento',
  survival:'Supervivencia',
  socioeconomic:'Objetivo socioeconómico'
 };
 function objectivesStatus(t){
  const second=t?.strategy?.['2']||{},third=t?.strategy?.['3']||{};
  const goals=Array.isArray(second.smartObjectives)?second.smartObjectives:[];
  const links=Array.isArray(third.objectiveLinks)?third.objectiveLinks:[];
  const items=[0,1].map(i=>{
    const g=goals[i]||{},link=links[i]||{},metric=objectiveMetrics[g.metric];
    const target=Number(g.target),deadline=Number(g.deadline);
    const defined=!!metric && !!objectiveKinds[g.kind] && String(g.title||'').trim().length>=25 &&
      String(g.relevance||'').trim().length>=40 &&
      g.target!=='' && g.target!==null && g.target!==undefined &&
      Number.isFinite(target)&&target>=metric.min&&target<=metric.max &&
      (g.direction==='atLeast'||g.direction==='atMost') && [3,4].includes(deadline);
    const linked=defined && String(link.action||'').trim().length>=50 &&
      String(link.tradeoff||'').trim().length>=35;
    return {index:i,goal:g,link,defined,linked,metric:metric||null};
  });
  return {items,defined:items.every(x=>x.defined),linked:items.every(x=>x.linked),
    definedCount:items.filter(x=>x.defined).length,linkedCount:items.filter(x=>x.linked).length};
 }
 function objectiveProgress(t,r){
  const goals=objectivesStatus(t).items,round=Number(r);
  const history=Array.isArray(t?.history)?t.history:[];
  const row=history.find(x=>Number(x.round)===round) || (round===4?t?.last:null);
  return goals.map(x=>{
    if(!x.defined||!row||!Number.isFinite(Number(row[x.metric.key])))
      return {...x,observed:null,met:null};
    const observed=Number(row[x.metric.key]),target=Number(x.goal.target);
    return {...x,observed,met:x.goal.direction==='atLeast'?observed>=target:observed<=target};
  });
 }

 function factors(t,d,p,round){
  const strategy=choice(t,round);
  const baseline={strategy:null,label:'Sin estrategia declarada',variable:p.variable,attraction:1,marketCeiling:1,coherence:null,message:'No se ha registrado una estrategia competitiva válida.'};
  if(!strategy)return baseline;
  const budget=Math.max(1,d.rdInv+d.marketingInv+d.capacityInv+d.ecoInv);
  let variable=p.variable,attraction=1,marketCeiling=1,coherence=0,reason='';
  if(strategy==='cost'){
    // La escala y la inversión en capacidad aportan eficiencia; el precio bajo atrae demanda.
    const scale=clamp((d.production/Math.max(1,p.capacity)),0,1);
    const investmentFit=clamp(d.capacityInv/20000,0,1);
    coherence=clamp(0.55*scale+0.25*investmentFit+0.20*clamp((55-d.price)/25,0,1),0,1);
    variable=Math.max(1,p.variable-(0.75+2.0*coherence));
    attraction=1+0.10*coherence;
    reason='Economías de escala y eficiencia reducen coste unitario; precios altos debilitan la captación de clientes sensibles al precio.';
  }else if(strategy==='differentiate'){
    const innovation=clamp(d.rdInv/25000,0,1),marketing=clamp(d.marketingInv/20000,0,1);
    coherence=clamp(0.60*innovation+0.25*marketing+0.15*clamp((d.price-40)/25,0,1),0,1);
    variable=p.variable+0.9+1.0*coherence;
    attraction=1+0.50*coherence;
    reason='Calidad, I+D y marca elevan el valor percibido, pero la diferenciación exige inversión y aumenta el coste unitario.';
  }else if(strategy==='focus'){
    const specialization=clamp(d.rdInv/18000,0,1),marketing=clamp(d.marketingInv/12000,0,1);
    coherence=clamp(0.55*specialization+0.45*marketing,0,1);
    variable=p.variable+1.2;
    attraction=1+0.75*coherence;
    marketCeiling=0.22;
    reason='La especialización aumenta la atracción dentro de un nicho, pero limita la clientela potencial al 22 % del mercado total.';
  }
  return {strategy,label:names[strategy],variable,attraction,marketCeiling,coherence:+(100*coherence).toFixed(1),message:reason};
 }
 return {choice,factors,names,evidenceDefinitions,evidenceStatus,objectiveMetrics,objectiveKinds,objectivesStatus,objectiveProgress};
})();