/* STRATEGOS STRATEGY LAB · Cuaderno de Dirección Estratégica.
   Actividades basadas en los temas 2-5. Se guardan en Supabase
   mediante cbc_save_strategy; cada equipo solo accede a su propia ficha. */
const StrategyLab=(()=>{
  const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const topics=[
    {title:'Entorno y diagnóstico',theme:'Tema 2 · Empresa, empresario y entorno',
      purpose:'Analiza el entorno genérico y específico, los recursos internos y la posición competitiva.',
      fields:[
        ['environment','Entorno genérico (político-legal, económico, social y tecnológico)','Identifica al menos dos factores relevantes y explica por qué pueden afectar al negocio.'],
        ['forces','Cinco fuerzas competitivas','Examina rivalidad, entrantes, sustitutivos, poder de clientes y poder de proveedores.'],
        ['internal','Cadena de valor y capacidades distintivas','¿Qué actividades generan valor? ¿Qué recursos serían valiosos, escasos y difíciles de imitar?'],
        ['swot','DAFO argumentado','Diferencia fortalezas y debilidades internas de oportunidades y amenazas externas.'],
        ['responsibility','Responsabilidad social y economía circular','¿Qué compromisos concretos asumiría la empresa para reducir externalidades?'],
        ['priority','Prioridad estratégica del diagnóstico','Señala una decisión prioritaria y vincúlala a una evidencia de tu análisis.']
      ]},
    {title:'Misión, objetivos y creación de valor',theme:'Tema 3 · Objetivos empresariales',
      purpose:'Construye objetivos coherentes, medibles y compatibles con los grupos de interés.',
      fields:[
        ['mission','Misión: razón de ser','¿Quiénes somos, qué hacemos y para quién?'],
        ['vision','Visión y valores','Describe la posición deseada y los valores que deben guiar las decisiones.'],
        ['smart','Objetivos SMART','Formula dos metas específicas, medibles, alcanzables, relevantes y delimitadas en el tiempo.'],
        ['levels','Coherencia entre niveles de objetivos','Relaciona objetivo estratégico, objetivo funcional y objetivo operativo.'],
        ['stakeholders','Grupos de interés y posibles conflictos','Considera trabajadores, accionistas, clientes, proveedores y sociedad.'],
        ['finance','Rentabilidad, crecimiento y supervivencia','Explica qué combinación priorizarías. Diferencia Re, RFP y efectos del endeudamiento si procede.']
      ]},
    {title:'Formulación de la estrategia competitiva',theme:'Tema 4 · Estrategia empresarial',
      purpose:'Elige cómo competir y justifica la coherencia entre posicionamiento, recursos y decisiones.',
      fields:[
        ['scope','Ámbito competitivo y mercado objetivo','Delimita clientes, necesidades satisfechas y tecnologías empleadas.'],
        ['strategy','Estrategia competitiva seleccionada','Elige liderazgo en costes, diferenciación o enfoque y explica por qué.'],
        ['resources','Recursos y capacidades necesarios','¿Qué inversión o capacidad hace creíble la estrategia?'],
        ['alignment','Alineación con precio, I+D, marketing y operaciones','Explica qué decisiones reales tomarás y cómo encajan con la estrategia declarada.'],
        ['risks','Riesgo de incoherencia estratégica','¿Qué tendría que pasar para quedar atrapado entre estrategias?'],
        ['implementation','Implantación y control','Define responsables, un indicador de progreso y una acción correctiva.']
      ]},
    {title:'Decisiones bajo riesgo e incertidumbre',theme:'Tema 5 · Dirección y métodos de decisión',
      purpose:'Justifica alternativas mediante factores ponderados, árboles y criterios de incertidumbre.',
      fields:[
        ['problem','Problema y alternativas','Expón una elección relevante (tecnología, planta, proveedor o mercado) y al menos dos alternativas.'],
        ['certainty','Decisión en certeza: factores ponderados','Especifica factores, pesos y puntuaciones. Comprueba la coherencia del criterio.'],
        ['risk','Decisión bajo riesgo: árbol','Identifica estados de la naturaleza, probabilidades y resultados por alternativa.'],
        ['uncertainty','Decisión en incertidumbre','Contrasta Laplace, optimista, Wald, Hurwicz y Savage. Explica qué criterio elegirías y por qué.'],
        ['choice','Decisión final y justificación','Argumenta tu elección teniendo en cuenta objetivos, tolerancia al riesgo y restricciones.'],
        ['reflection','Reflexión sobre los resultados','¿Qué aprendiste de las decisiones de rondas anteriores y qué cambiarías?']
      ]}
  ];
  const roundName=r=>topics[Math.max(0,Math.min(3,Number(r)-1))];
  function fieldset(topic,entry,readOnly){
    return topic.fields.map(([key,title,tip])=>
      '<div class="strategy-field"><label for="strategy-'+safe(key)+'">'+safe(title)+'</label>'+
      '<p class="muted">'+safe(tip)+'</p><textarea id="strategy-'+safe(key)+'" name="'+safe(key)+'" rows="4" maxlength="1800"'+(readOnly?' readonly':'')+'>'+safe(entry?.[key]||'')+'</textarea></div>').join('');
  }
  function view(team,game){
    const r=Number(game.round)||1,topic=roundName(r),entry=team?.strategy?.[String(r)]||{},done=topic.fields.filter(([k])=>String(entry[k]||'').trim().length>=30).length;
    const locked=game.phase!=='decisions';
    return '<section class="card strategy-workbook"><span class="tag">CUADERNO ESTRATÉGICO · '+safe(topic.theme)+'</span>'+
     '<h2>Ronda '+r+' · '+safe(topic.title)+'</h2><p>'+safe(topic.purpose)+'</p>'+
     '<p class="muted">Avance: '+done+'/'+topic.fields.length+' apartados desarrollados. Las preguntas exigen justificar y aplicar los conceptos, no copiar definiciones.</p>'+
     (locked?'<p class="alert">Esta ronda está cerrada; puedes consultar tus respuestas, pero no modificarlas hasta la próxima ronda.</p>':'')+
     '<form id="strategy-form">'+fieldset(topic,entry,locked)+
     (locked?'':'<button type="submit">Guardar mi análisis estratégico</button>')+
     '<p id="strategy-save-feedback" aria-live="polite" class="muted"></p></form>'+
     '<div class="strategy-methods"><h3>Herramientas de decisión</h3><p class="muted">Utiliza las calculadoras para comprobar alternativas. Los resultados no sustituyen tu justificación.</p>'+
     '<button type="button" id="strategy-tool-weight" class="secondary">Factores ponderados</button>'+
     '<button type="button" id="strategy-tool-uncertain" class="secondary">Criterios de incertidumbre</button>'+
     '<div id="strategy-tool-output"></div></div>'+
     '<details><summary>Consultar el guion de las cuatro rondas</summary>'+
     topics.map((x,i)=>'<p><b>Ronda '+(i+1)+' · '+safe(x.title)+'</b>: '+safe(x.theme)+'</p>').join('')+
     '</details></section>';
  }
  function teacher(teams,game){
    const r=Number(game.round)||1,topic=roundName(r);
    return '<section class="card strategy-teacher"><h2>Cuaderno estratégico · '+safe(topic.theme)+'</h2><p class="muted">Revisión docente de los análisis entregados por los equipos. Este cuaderno es una evidencia formativa y no cambia automáticamente las notas.</p>'+
     '<label for="strategy-teacher-select">Empresa</label><select id="strategy-teacher-select">'+
     teams.filter(t=>t.active!==false).map(t=>'<option value="'+safe(t.id)+'">'+safe(t.name)+'</option>').join('')+'</select>'+
     '<label for="strategy-teacher-round">Ronda</label><select id="strategy-teacher-round">'+
     topics.map((x,i)=>'<option value="'+(i+1)+'"'+(i+1===r?' selected':'')+'>Ronda '+(i+1)+' · '+safe(x.title)+'</option>').join('')+'</select>'+
     '<div id="strategy-teacher-content"></div></section>';
  }
  function bindStudent(code,team,game){
    const form=document.getElementById('strategy-form');
    if(form&&!form.querySelector('[readonly]')){
      form.onsubmit=async e=>{
       e.preventDefault();
       const button=form.querySelector('button[type="submit"]'),status=document.getElementById('strategy-save-feedback');
       const entry=Object.fromEntries(roundName(game.round).fields.map(([k])=>[k,String(new FormData(form).get(k)||'').trim()]));
       button.disabled=true;status.textContent='Guardando en Supabase…';
       try{await CBCSync.rpc('cbc_save_strategy',{p_code:code,p_round:Number(game.round),p_entry:entry});
         team.strategy=team.strategy||{};team.strategy[String(game.round)]=entry;
         status.textContent='Análisis estratégico guardado para la ronda '+game.round+'.';
       }catch(err){status.textContent='No se pudo guardar: '+err.message;}
       finally{button.disabled=false;}
      };
    }
    const weighted=document.getElementById('strategy-tool-weight'),uncertain=document.getElementById('strategy-tool-uncertain'),output=document.getElementById('strategy-tool-output');
    if(weighted)weighted.onclick=()=>{output.innerHTML=weightedTool();bindWeighted(output);};
    if(uncertain)uncertain.onclick=()=>{output.innerHTML=uncertaintyTool();bindUncertainty(output);};
  }
  function bindTeacher(teams){
    const selector=document.getElementById('strategy-teacher-select'),round=document.getElementById('strategy-teacher-round'),host=document.getElementById('strategy-teacher-content');
    if(!selector||!round||!host)return;
    const render=()=>{
      const t=teams.find(x=>String(x.id)===selector.value),r=Number(round.value),topic=roundName(r),entry=t?.strategy?.[String(r)]||{};
      host.innerHTML='<h3>'+safe(t?.name||'')+' · Ronda '+r+'</h3>'+
       topic.fields.map(([key,label])=>'<div class="strategy-reviewed"><strong>'+safe(label)+'</strong><p>'+safe(entry[key]||'Sin entregar')+'</p></div>').join('');
    };
    selector.onchange=render;round.onchange=render;render();
  }
  function weightedTool(){return '<div class="strategy-calculator"><h3>Factores ponderados</h3><p>Introduce los pesos (cualquier escala positiva) y la valoración de dos alternativas.</p>'+
    '<table><thead><tr><th>Factor</th><th>Peso</th><th>Alternativa A</th><th>Alternativa B</th></tr></thead><tbody>'+
    [['Coste',4,8,5],['Calidad',3,6,9],['Plazo',2,7,6]].map(([name,w,a,b],i)=>'<tr><td>'+name+'</td><td><input type="number" id="strategy-w'+i+'" value="'+w+'" min="0" max="100" step=".1"></td><td><input type="number" id="strategy-a'+i+'" value="'+a+'" min="0" max="100" step=".1"></td><td><input type="number" id="strategy-b'+i+'" value="'+b+'" min="0" max="100" step=".1"></td></tr>').join('')+
    '</tbody></table><button type="button" id="strategy-calc-weight">Calcular</button><p id="strategy-weight-result" aria-live="polite"></p></div>';}
  function bindWeighted(root){root.querySelector('#strategy-calc-weight').onclick=()=>{
    let a=0,b=0,sum=0;
    for(let i=0;i<3;i++){
      const w=Number(root.querySelector('#strategy-w'+i).value),av=Number(root.querySelector('#strategy-a'+i).value),bv=Number(root.querySelector('#strategy-b'+i).value);
      if(![w,av,bv].every(Number.isFinite)||w<0||av<0||bv<0)return root.querySelector('#strategy-weight-result').textContent='Revisa los valores.';
      a+=w*av;b+=w*bv;sum+=w;
    }
    root.querySelector('#strategy-weight-result').textContent=sum>0?'Puntuación A: '+(a/sum).toFixed(2)+' · B: '+(b/sum).toFixed(2)+'. Mejor valor ponderado: '+(a===b?'empate':a>b?'A':'B')+'.':'Introduce al menos un peso positivo.';
  };}
  function uncertaintyTool(){return '<div class="strategy-calculator"><h3>Decisiones bajo incertidumbre</h3><p>Ejemplo de dos estados de la naturaleza sin probabilidades conocidas (valores didácticos).</p>'+
    '<table><thead><tr><th>Alternativa</th><th>Demanda alta</th><th>Demanda baja</th></tr></thead><tbody>'+
    '<tr><td>Producción alta</td><td>100</td><td>-50</td></tr><tr><td>Producción media</td><td>60</td><td>20</td></tr><tr><td>Producción baja</td><td>30</td><td>25</td></tr></tbody></table>'+
    '<label for="strategy-criterion">Criterio</label><select id="strategy-criterion"><option value="laplace">Laplace</option><option value="optimistic">Optimista</option><option value="wald">Wald</option><option value="hurwicz">Hurwicz</option><option value="savage">Savage</option></select>'+
    '<label for="strategy-alpha">Coeficiente de optimismo α (Hurwicz)</label><input id="strategy-alpha" type="number" min="0" max="1" step=".1" value=".6">'+
    '<button type="button" id="strategy-calc-uncertain">Comparar alternativas</button><p id="strategy-uncertain-result" aria-live="polite"></p></div>';}
  function calculateUncertainty(criterion,alpha){
    const rows=[[100,-50],[60,20],[30,25]],bestByState=[100,25];
    return rows.map(([high,low],i)=>{
      const score=criterion==='laplace'?(high+low)/2:criterion==='optimistic'?high:
        criterion==='wald'?Math.min(high,low):criterion==='hurwicz'?alpha*Math.max(high,low)+(1-alpha)*Math.min(high,low):
        Math.max(bestByState[0]-high,bestByState[1]-low);
      return {name:['Producción alta','Producción media','Producción baja'][i],score};
    });
  }
  function bindUncertainty(root){root.querySelector('#strategy-calc-uncertain').onclick=()=>{
    const criterion=root.querySelector('#strategy-criterion').value,alpha=Number(root.querySelector('#strategy-alpha').value),out=root.querySelector('#strategy-uncertain-result');
    if(!Number.isFinite(alpha)||alpha<0||alpha>1){out.textContent='Introduce un α entre 0 y 1.';return;}
    const results=calculateUncertainty(criterion,alpha),s=results.map(x=>x.score),target=criterion==='savage'?Math.min(...s):Math.max(...s);
    out.textContent=results.map(x=>x.name+': '+x.score.toFixed(1)).join(' · ')+'. Elección: '+results.filter(x=>x.score===target).map(x=>x.name).join(' / ')+'.';
  };}
  return {view,teacher,bindStudent,bindTeacher,topics,calculateUncertainty};
})();
