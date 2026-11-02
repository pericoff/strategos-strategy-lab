/* STRATEGOS STRATEGY LAB · Informes estratégicos de cierre de ronda.
   Fuente: resultados publicados de cada empresa; sin nuevas tablas ni API.
   La interpretación del modelo es opcional y no modifica informes o notas. */
const StrategosReports=(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const fmt=v=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(n(v));
  const money=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n(v));
  const history=t=>(Array.isArray(t?.history)?t.history:[]).filter(h=>Number.isInteger(Number(h.round))&&Number(h.round)>=1&&Number(h.round)<=4).sort((a,b)=>n(a.round)-n(b.round));
  const tone=(good,bad)=>good?'fortaleza':bad?'riesgo':'atención';
  function build(t,round){
    const rows=history(t),r=rows.find(x=>n(x.round)===n(round));if(!r)return null;
    const prev=rows.find(x=>n(x.round)===n(round)-1);
    const sales=n(r.sales),operating=n(r.operating),cash=n(r.cash),share=n(r.share),circular=n(r.circular),quality=n(r.quality),score=n(r.score);
    const arr=[];
    const add=(title,status,fact,recommendation)=>arr.push({title,status,fact,recommendation});
    add('Rentabilidad',tone(operating>0,operating<0),
      'Resultado operativo: '+money(operating)+'.'+(prev?' Variación respecto a la ronda anterior: '+money(operating-n(prev.operating))+'.':''),
      operating<0?'Revisar el margen por unidad, el volumen y los costes fijos antes de aprobar nuevas inversiones.':'Verificar que las ventas y el margen puedan mantenerse sin depender de una sola ronda.');
    add('Liquidez',tone(cash>=100000,cash<50000),
      'Tesorería final de la ronda: '+money(cash)+'.',
      cash<50000?'Proteger la liquidez y respetar la reserva mínima de 15.000 € del simulador.':'Comparar el rendimiento esperado de cada inversión con el efectivo disponible.');
    add('Competitividad',tone(share>=25,share<15),
      'Ventas: '+fmt(sales)+' unidades; cuota observada: '+fmt(share)+' %. '+(prev?'Cambio de ventas: '+fmt(sales-n(prev.sales))+' unidades.':''),
      share<15?'Examinar la propuesta de valor, el precio y el marketing antes de decidir.':'Evaluar si la cuota conseguida es sostenible con la capacidad y la estrategia comercial.');
    add('Sostenibilidad',tone(circular>=70,circular<50),
      'Circularidad: '+fmt(circular)+'/100. Calidad: '+fmt(quality)+'/100.'+
      (r.emissions!=null?' Emisiones estimadas: '+fmt(r.emissions)+' kg CO₂e.':''),
      circular<50?'Explorar la recuperación de materiales y la inversión ambiental sin ignorar sus costes.':'Comprobar que la mejora ambiental se combina con calidad técnica y rentabilidad.');
    const strengths=arr.filter(x=>x.status==='fortaleza').map(x=>x.title);
    const risks=arr.filter(x=>x.status==='riesgo').map(x=>x.title);
    return {team:String(t.name||'Empresa'),round:n(r.round),score,observations:arr,
      synthesis:'La empresa obtuvo '+fmt(score)+'/100 puntos en la ronda '+n(r.round)+
      '. Fortalezas identificadas: '+(strengths.join(', ')||'ninguna señal destacada según los umbrales formativos')+
      '. Aspectos de riesgo: '+(risks.join(', ')||'no se detectan alertas críticas según los umbrales formativos')+'.',
      questions:['¿Qué decisión explica mejor el resultado de la ronda y qué evidencias lo respaldan?',
        '¿Qué sacrificios existen entre rentabilidad, crecimiento y circularidad?',
        '¿Qué hipótesis comprobaríais antes de la siguiente ronda?']
    };
  }
  const label=t=>esc(t.name);
  function shell(t,slot,forTeacher=false){
    const rows=history(t);
    if(!rows.length)return '<div class="card"><h3>Informe estratégico</h3><p class="muted">Se generará automáticamente cuando el profesor publique la primera ronda.</p></div>';
    const id='strategos-report-'+slot;
    return '<section class="card strategos-report-shell" id="'+id+'"><span class="tag">STRATEGOS STRATEGY LAB · INFORME DE CIERRE</span><h2>Informe estratégico · '+label(t)+'</h2>'+
      '<p class="muted">Diagnóstico automático elaborado exclusivamente con resultados publicados de esta empresa. No modifica la evaluación.</p>'+
      '<div class="flex"><label for="'+id+'-round">Ronda publicada</label><select id="'+id+'-round" class="strategos-round-select">'+
      rows.map(r=>'<option value="'+esc(r.round)+'">Ronda '+esc(r.round)+'</option>').join('')+'</select></div>'+
      '<div id="'+id+'-body"></div>'+
      '<div class="flex strategos-report-actions"><button type="button" class="secondary strategos-print">Imprimir o guardar como PDF</button>'+
      '<button type="button" class="strategos-report-ai">Ampliar interpretación con IA</button></div>'+
      '<p class="muted">El informe base se calcula sin coste. La ampliación mediante IA requiere conexión y consume créditos de API. '+(forTeacher?'Disponible solo en el panel autenticado del profesor.':'Solo se envían al proveedor los datos de tu equipo.')+'</p>'+
      '<div class="strategos-report-ai-output" aria-live="polite"></div></section>';
  }
  function reportBody(t,round){
    const report=build(t,round);if(!report)return '<p>Sin resultados para esta ronda.</p>';
    return '<div class="strategos-report-printable"><h3>Ronda '+report.round+' · '+esc(report.team)+'</h3>'+
      '<div class="grid"><div class="kpi">Puntuación<b>'+fmt(report.score)+'/100</b></div>'+
      '<div class="kpi">Diagnósticos<b>4 dimensiones</b></div></div>'+
      '<p>'+esc(report.synthesis)+'</p>'+
      '<div class="strategos-report-dimensions">'+report.observations.map(x=>
        '<article><div class="flex"><h3>'+esc(x.title)+'</h3><span class="strategos-report-status status-'+esc(x.status)+'">'+esc(x.status)+'</span></div>'+
        '<p><strong>Dato observado:</strong> '+esc(x.fact)+'</p><p><strong>Línea de análisis:</strong> '+esc(x.recommendation)+'</p></article>'
      ).join('')+'</div><h3>Preguntas para el debate</h3><ol>'+
      report.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ol>'+
      '<p class="muted">Informe docente basado en reglas y umbrales orientativos. Las relaciones causales deben contrastarse; los indicadores son ficticios y no constituyen predicciones.</p></div>';
  }
  function attach(root,t,code){
    const select=root.querySelector('.strategos-round-select'),body=root.querySelector('[id$="-body"]'),out=root.querySelector('.strategos-report-ai-output');
    if(!select||!body)return;
    select.value=String(history(t).at(-1).round);
    const refresh=()=>{body.innerHTML=reportBody(t,select.value);out.textContent='';};
    select.onchange=refresh;refresh();
    root.querySelector('.strategos-print').onclick=()=>{
      document.querySelectorAll('.strategos-report-shell').forEach(el=>el.classList.remove('strategos-print-target'));
      root.classList.add('strategos-print-target');
      const clear=()=>{root.classList.remove('strategos-print-target');window.removeEventListener('afterprint',clear);};
      window.addEventListener('afterprint',clear,{once:true});
      window.print();
    };
    root.querySelector('.strategos-report-ai').onclick=async e=>{
      if(!code){out.textContent='Para solicitar interpretación generativa, accede con un código de equipo válido.';return;}
      const button=e.currentTarget;button.disabled=true;out.textContent='Elaborando interpretación con IA…';
      try{
        const r=build(t,select.value);
        const question='Elabora un informe ejecutivo pedagógico sobre la RONDA '+r.round+
          ' de mi empresa. Analiza rentabilidad, liquidez, competitividad y sostenibilidad; distingue hechos, hipótesis y recomendaciones para la próxima ronda. Utiliza exclusivamente los resultados publicados.';
        const result=await CBCSync.advisor(code,question);
        out.textContent=String(result?.answer||'El asesor no devolvió contenido.');
      }catch(err){out.textContent='No se pudo generar la interpretación: '+err.message;}
      finally{button.disabled=false;}
    };
  }
  function student(t){return shell(t,'student');}
  function professor(teams){
    const available=teams.filter(t=>history(t).length);
    if(!available.length)return '';
    return '<div class="card"><h2>Informes estratégicos de cierre</h2><p class="muted">Vista docente: selecciona una empresa. Cada informe utiliza exclusivamente sus propios resultados publicados.</p>'+
      '<label for="strategos-teacher-team">Empresa</label><select id="strategos-teacher-team">'+available.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select>'+
      '<div id="strategos-teacher-report"></div></div>';
  }
  function bindStudent(t,code){const root=document.getElementById('strategos-report-student');if(root)attach(root,t,code);}
  function bindTeacher(teams){
    const sel=document.getElementById('strategos-teacher-team'),host=document.getElementById('strategos-teacher-report');
    if(!sel||!host)return;
    const load=()=>{
      const t=teams.find(x=>String(x.id)===sel.value);
      if(!t)return;
      host.innerHTML=shell(t,'teacher',true);
      const root=host.querySelector('.strategos-report-shell');
      if(root)attach(root,t,t.code);
    };
    sel.onchange=load;load();
  }
  return {student,professor,bindStudent,bindTeacher,build};
})();
