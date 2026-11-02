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

  function evidenceOptions(source,current){
    const text=String(source||'').trim();
    const segments=text.split(/(?<=[.!?])\s+|\n+/).map(x=>x.trim()).filter(x=>x.length>=15);
    if(!segments.length&&text.length>=15)segments.push(text);
    if(text.length>=15&&!segments.includes(text))segments.unshift(text);
    if(current&&!segments.includes(current))segments.push(current);
    return segments.slice(0,30).map(x=>'<option value="'+safe(x)+'"'+(current===x?' selected':'')+'>'+safe(x.length>130?x.slice(0,130)+'…':x)+'</option>').join('');
  }
  function evidencePanel(team,entry,readOnly){
    const earlier=team?.strategy?.['1']||{},linked=entry?.evidenceLinks||{};
    const status=StrategyEngine.evidenceStatus({...team,strategy:{...(team?.strategy||{}),'3':entry||{}}});
    return '<section class="strategy-evidence"><h3>Conexión del Tema 2 con el Tema 4</h3>'+
      '<p>Selecciona un fragmento literal del DAFO, las cinco fuerzas y el análisis interno de la primera ronda. Explica cómo cada evidencia respalda la estrategia elegida. El profesor revisará la calidad del razonamiento.</p>'+
      '<p class="muted">Referencias justificadas: '+status.completed+'/3.</p>'+
      StrategyEngine.evidenceDefinitions.map(spec=>{
        const source=String(earlier[spec.source]||'').trim(),link=linked[spec.key]||{};
        return '<div class="strategy-field"><h4>'+safe(spec.label)+'</h4>'+
          '<p class="muted">'+safe(spec.question)+'</p>'+
          (source.length>=30?
           '<details><summary>Consultar mi diagnóstico del Tema 2</summary><p class="strategy-source">'+safe(source)+'</p></details>'+
           '<label for="evidence-cite-'+spec.key+'">Fragmento de la ronda 1</label>'+
           '<select id="evidence-cite-'+spec.key+'" name="evidence_cite_'+spec.key+'"'+(readOnly?' disabled':'')+'><option value="">Seleccionar un fragmento…</option>'+evidenceOptions(source,String(link.citation||''))+'</select>'
           :'<p class="alert">No hay un diagnóstico previo en la ronda 1. Consulta al profesor; no se fabricará una referencia histórica.</p>')+
          '<label for="evidence-reason-'+spec.key+'">Justificación estratégica</label>'+
          '<textarea id="evidence-reason-'+spec.key+'" name="evidence_reason_'+spec.key+'" rows="3" maxlength="1100"'+(readOnly?' readonly':'')+'>'+safe(link.reasoning||'')+'</textarea></div>';
       }).join('')+'</section>';
  }

  function objectivesPanel(entry,readOnly){
    const goals=Array.isArray(entry?.smartObjectives)?entry.smartObjectives:[];
    return '<section class="strategy-objectives"><h3>Objetivos SMART medibles · Tema 3</h3>'+
      '<p>Define dos objetivos específicos, medibles, alcanzables, relevantes y con plazo. Sus indicadores se contrastarán con resultados reales del simulador. Rentabilidad económica (Re), financiera (RFP) y apalancamiento siguen en los apuntes teóricos, pero no están calculados por el motor actual.</p>'+
      [0,1].map(i=>{
        const g=goals[i]||{};
        return '<div class="strategy-field"><h4>Objetivo '+(i+1)+'</h4>'+
          '<label>Formulación específica</label><textarea name="objective_title_'+i+'" maxlength="240" rows="2"'+(readOnly?' readonly':'')+'>'+safe(g.title||'')+'</textarea>'+
          '<label>Dimensión del objetivo</label><select name="objective_kind_'+i+'"'+(readOnly?' disabled':'')+'>'+
          '<option value="">Seleccionar…</option>'+Object.entries(StrategyEngine.objectiveKinds).map(([k,v])=>
            '<option value="'+k+'"'+(g.kind===k?' selected':'')+'>'+safe(v)+'</option>').join('')+'</select>'+
          '<label>Indicador verificable</label><select name="objective_metric_'+i+'"'+(readOnly?' disabled':'')+'>'+
          '<option value="">Seleccionar…</option>'+Object.entries(StrategyEngine.objectiveMetrics).map(([k,v])=>
            '<option value="'+k+'"'+(g.metric===k?' selected':'')+'>'+safe(v.label)+'</option>').join('')+'</select>'+
          '<label>Condición a alcanzar</label><select name="objective_direction_'+i+'"'+(readOnly?' disabled':'')+'>'+
          '<option value="atLeast"'+(g.direction==='atLeast'?' selected':'')+'>Alcanzar al menos</option>'+
          '<option value="atMost"'+(g.direction==='atMost'?' selected':'')+'>No superar</option></select>'+
          '<label>Valor objetivo</label><input type="number" step="any" name="objective_target_'+i+'" value="'+safe(g.target??'')+'"'+(readOnly?' readonly':'')+'>'+
          '<label>Plazo de cumplimiento</label><select name="objective_deadline_'+i+'"'+(readOnly?' disabled':'')+'>'+
          '<option value="3"'+(Number(g.deadline)===3?' selected':'')+'>Hasta la ronda 3</option>'+
          '<option value="4"'+(Number(g.deadline)===4?' selected':'')+'>Hasta la ronda 4</option></select>'+
          '<label>Relevancia y viabilidad</label><textarea name="objective_relevance_'+i+'" rows="3" maxlength="900"'+(readOnly?' readonly':'')+'>'+safe(g.relevance||'')+'</textarea>'+
          '</div>';
      }).join('')+'</section>';
  }
  function objectiveLinksPanel(team,entry,readOnly){
    const goals=StrategyEngine.objectivesStatus(team).items,links=Array.isArray(entry?.objectiveLinks)?entry.objectiveLinks:[];
    return '<section class="strategy-objectives"><h3>Coherencia Tema 3 → Tema 4</h3>'+
      '<p>Explica cómo la estrategia competitiva y las decisiones de precio, producción e inversión contribuirán a los dos objetivos SMART de la ronda 2. También debes identificar un posible conflicto entre objetivos y recursos.</p>'+
      goals.map((item,i)=>{
        const g=item.goal,link=links[i]||{};
        return '<div class="strategy-field"><h4>Objetivo '+(i+1)+'</h4>'+
          (item.defined?'<p><b>'+safe(g.title)+'</b></p>'+
             '<p class="muted">'+safe(StrategyEngine.objectiveMetrics[g.metric]?.label||'')+
             ' · '+(g.direction==='atMost'?'No superar ':'Alcanzar al menos ')+safe(g.target)+' · Plazo: ronda '+safe(g.deadline)+'</p>':
             '<p class="alert">Este objetivo no está definido de forma verificable en la ronda 2. Consulta al profesor; no es posible inventar un objetivo anterior.</p>')+
          '<label>Acciones concretas de la estrategia que contribuirán al objetivo</label>'+
          '<textarea name="objective_action_'+i+'" rows="3" maxlength="1100"'+(readOnly?' readonly':'')+'>'+safe(link.action||'')+'</textarea>'+
          '<label>Riesgo, conflicto o renuncia que hay que gestionar</label>'+
          '<textarea name="objective_tradeoff_'+i+'" rows="3" maxlength="1100"'+(readOnly?' readonly':'')+'>'+safe(link.tradeoff||'')+'</textarea></div>';
      }).join('')+'</section>';
  }
  function fieldset(topic,entry,readOnly,round){
    return (Number(round)===3?'<div class="strategy-field"><label for="strategy-competitiveChoice">Estrategia competitiva que aplicará la empresa</label><p class="muted">Selecciona una de las tres estrategias del Tema 4. La elección se utilizará en el motor de mercado de esta ronda y de la ronda 4. Debes justificarla en los apartados siguientes.</p><select id="strategy-competitiveChoice" name="competitiveChoice" required '+(readOnly?'disabled':'')+'><option value="">Seleccionar estrategia…</option>'+Object.entries(StrategyEngine.names).map(([k,v])=>'<option value="'+k+'"'+(entry?.competitiveChoice===k?' selected':'')+'>'+safe(v)+'</option>').join('')+'</select></div>':'')+topic.fields.map(([key,title,tip])=>
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
     '<form id="strategy-form">'+fieldset(topic,entry,locked,r)+(r===2?objectivesPanel(entry,locked):'')+(r===3?evidencePanel(team,entry,locked)+objectiveLinksPanel(team,entry,locked):'')+
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
       const input=new FormData(form);const entry=Object.fromEntries(roundName(game.round).fields.map(([k])=>[k,String(input.get(k)||'').trim()]));
       if(Number(game.round)===2){
         entry.smartObjectives=[0,1].map(i=>({
           title:String(input.get('objective_title_'+i)||'').trim(),
           kind:String(input.get('objective_kind_'+i)||''),
           metric:String(input.get('objective_metric_'+i)||''),
           direction:String(input.get('objective_direction_'+i)||''),
           target:String(input.get('objective_target_'+i)||'').trim(),
           deadline:Number(input.get('objective_deadline_'+i)),
           relevance:String(input.get('objective_relevance_'+i)||'').trim()
         }));
         const check=StrategyEngine.objectivesStatus({...team,strategy:{...(team.strategy||{}),'2':entry}});
         if(!check.defined){status.textContent='Completa dos objetivos SMART: formulación, dimensión, indicador, valor, plazo y justificación de viabilidad.';return;}
       }
       if(Number(game.round)===3){entry.competitiveChoice=String(input.get('competitiveChoice')||'');if(!StrategyEngine.names[entry.competitiveChoice]){status.textContent='Selecciona una estrategia competitiva válida.';return;}
       entry.evidenceLinks=Object.fromEntries(StrategyEngine.evidenceDefinitions.map(spec=>[spec.key,{
         citation:String(input.get('evidence_cite_'+spec.key)||'').trim(),
         reasoning:String(input.get('evidence_reason_'+spec.key)||'').trim()
       }]));
       const audit=StrategyEngine.evidenceStatus({...team,strategy:{...(team.strategy||{}),'3':entry}});
       if(!audit.ready){status.textContent='Completa tres vínculos trazables con el Tema 2 y justifica cada uno con al menos 40 caracteres.';return;}
       entry.objectiveLinks=[0,1].map(i=>({
         action:String(input.get('objective_action_'+i)||'').trim(),
         tradeoff:String(input.get('objective_tradeoff_'+i)||'').trim()
       }));
       const alignment=StrategyEngine.objectivesStatus({...team,strategy:{...(team.strategy||{}),'3':entry}});
       if(!alignment.linked){status.textContent='Faltan los dos objetivos SMART de la ronda 2, o su relación con la estrategia y los conflictos de recursos.';return;}
       }
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
      host.innerHTML='<h3>'+safe(t?.name||'')+' · Ronda '+r+'</h3>'+(r===3?'<p><b>Estrategia declarada:</b> '+safe(StrategyEngine.names[entry.competitiveChoice]||'Sin seleccionar')+'</p>'+StrategyEngine.evidenceStatus(t||{}).items.map(item=>{
       const link=entry.evidenceLinks?.[item.key]||{};
       return '<div class="strategy-reviewed"><strong>'+safe(item.label)+'</strong>'+
       '<p>Trazabilidad: '+(item.ready?'referencia localizada y justificada':'incompleta')+'</p>'+
       '<p><b>Cita Tema 2:</b> '+safe(link.citation||'Sin referencia')+'</p>'+
       '<p><b>Justificación:</b> '+safe(link.reasoning||'Sin justificar')+'</p></div>';
     }).join(''):'')+
       (r===2?StrategyEngine.objectivesStatus(t||{}).items.map((item,i)=>
         '<div class="strategy-reviewed"><strong>Objetivo SMART '+(i+1)+'</strong>'+
         '<p>'+safe(item.goal.title||'Sin definir')+'</p>'+
         '<p>Tipo: '+safe(StrategyEngine.objectiveKinds[item.goal.kind]||'Sin definir')+
         ' · Indicador: '+safe(item.metric?.label||'Sin definir')+
         ' · Meta: '+safe(item.goal.target??'')+
         ' · Ronda: '+safe(item.goal.deadline??'')+'</p>'+
         '<p>Viabilidad: '+safe(item.goal.relevance||'Sin justificar')+'</p>'+
         '<p>Verificación estructural: '+(item.defined?'completa':'pendiente')+'</p></div>').join(''):'')+
       (r===3?StrategyEngine.objectivesStatus(t||{}).items.map((item,i)=>{
         const link=entry.objectiveLinks?.[i]||{};
         return '<div class="strategy-reviewed"><strong>Objetivo SMART '+(i+1)+' → estrategia</strong>'+
         '<p>'+safe(item.goal.title||'No definido')+'</p>'+
         '<p>Acciones: '+safe(link.action||'Sin justificar')+'</p>'+
         '<p>Conflictos: '+safe(link.tradeoff||'Sin analizar')+'</p>'+
         '<p>Vinculación: '+(item.linked?'documentada':'incompleta')+'</p></div>';
        }).join(''):'')+
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
