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
 return {choice,factors,names};
})();