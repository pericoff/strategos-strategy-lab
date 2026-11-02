# STRATEGOS STRATEGY LAB
**Laboratorio de Dirección Estratégica y Toma de Decisiones — Universidad de Jaén**

Aplicación web independiente para utilizar en docencia los **Temas 2, 3, 4 y 5** de Organización y Dirección de Empresas. Se parte de la infraestructura funcional de STRATEGOS IA, pero el código y el estado de la partida se mantienen aislados. **Se comparte exclusivamente el proyecto Supabase con STRATEGOS IA, pero las tablas, las funciones y las partidas de Strategy Lab utilizan el prefijo `ssl_*`, sin tocar `cbc_*`.**

## Estado de la primera versión (noviembre de 2026)

**Cambio posterior:** se ha eliminado el Canvas exclusivamente de STRATEGOS STRATEGY LAB. El alumnado entra directamente al Plan estratégico, no necesita completar una propuesta de nueve bloques y la puntuación final usa las cuatro rondas. No se han borrado datos previos del servidor, para preservar partidas históricas y no alterar los otros simuladores.


- Base HTML del alumnado y profesor, lógica económica de cuatro rondas sin Canvas y con evaluación por media de rondas, en repositorio propio.
- Nuevo **cuaderno estratégico** (`strategy-lab.js`), organizado por tema y ronda; seis campos orientados al análisis aplicado por ronda.
- Persistencia independiente por equipo y ronda: RPC `cbc_save_strategy` incluida en `supabase/setup.sql`, autorizada mediante código del equipo, sin editar rondas cerradas.
- Vista de revisión docente de los análisis estratégicos. La RPC `cbc_student_state` oculta los análisis de los demás equipos.
- Calculadora de factores ponderados y comparador de criterios de incertidumbre (Laplace, optimista, Wald, Hurwicz y Savage), con resultados deterministas.
- Guion de cuatro rondas y manual de alumnado alineados con los temas 2–5.
- El asesor de IA (`strategos-advisor`) está adaptado para tratar preguntas de estrategia, pero **no estará disponible hasta que se configure un proyecto Supabase nuevo y una Edge Function propia.**
- El Canvas ha sido eliminado de las pantallas, del requisito de entrega y de la clasificación. **La puntuación final es el promedio de las cuatro rondas (100 % simulación)**. Los análisis del cuaderno estratégico se revisan de forma formativa; una posible rúbrica docente independiente se diseñaría por separado.
- **Los enlaces a los cinco vídeos de STRATEGOS IA no se han copiado**; se pueden producir nuevos vídeos específicos de los cuatro temas.

## Coherencia entre objetivos y estrategias: Tema 3 → Tema 4 (implementada)

- En la **ronda 2** cada equipo define **dos objetivos SMART estructurados**: descripción, dimensión (rentabilidad, crecimiento, supervivencia u objetivo socioeconómico), indicador calculado realmente por el simulador, meta numérica, condición mínima/máxima, fecha de cumplimiento (ronda 3 o 4) y justificación de relevancia/viabilidad.
- Los indicadores disponibles son: cuota de mercado, resultado operativo, tesorería, calidad, circularidad y unidades vendidas. **No se ofrecen Re, RFP ni apalancamiento como indicadores calculados**, porque el motor actual no simula balances ni deuda de forma adecuada para ello.
- En la **ronda 3** se exige justificar para **cada objetivo** la aportación de la estrategia competitiva y las decisiones de gestión, así como un posible conflicto o renuncia. La elección requiere también evidencias del Tema 2 (DAFO, cinco fuerzas, análisis interno).
- La interfaz impide enviar decisiones en la ronda 2 si falta la formulación verificable de los objetivos, y en la ronda 3 si faltan los vínculos documentados. **La evaluación semántica de la pertinencia de los objetivos y los argumentos sigue en manos del profesor**; el sistema solo comprueba estructura, cuantificación y longitud.
- Al publicarse resultados de las rondas 3 y 4, el alumnado ve el valor observado frente a la meta. La puntuación y la nota actuales no se alteran por este indicador. Una meta alcanzada en una ronda anterior al plazo no significa necesariamente cumplimiento sostenido.

**Compatibilidad con partidas anteriores:** una partida que ya pasó la ronda 2 sin objetivos estructurados necesitará una nueva partida de prueba para recorrer el flujo completo; no se fabrican objetivos retrospectivos. **No es necesario ejecutar SQL adicional** porque la información se almacena en el cuaderno JSON ya existente mediante `ssl_save_strategy`.

## Trazabilidad pedagógica Tema 2 → Tema 4 (implementada)

La **ronda 3** integra ahora el diagnóstico de la **ronda 1** con la formulación de la estrategia competitiva:

1. El equipo elige liderazgo en costes, diferenciación o enfoque.
2. Cita fragmentos **literales** previamente guardados en su ronda 1, procedentes del **DAFO**, las **cinco fuerzas competitivas** y el **análisis interno de cadena de valor y capacidades distintivas**.
3. Redacta una justificación propia (mínimo 40 caracteres por vínculo), conectando cada evidencia con su estrategia.
4. El formulario verifica que las citas están efectivamente contenidas en el diagnóstico anterior y que las tres justificaciones están presentes. El apartado **Decisiones** de la ronda 3 permanece bloqueado en la interfaz hasta que el plan esté guardado y los vínculos sean verificables.
5. El profesor consulta las tres referencias junto con las justificaciones y valora su pertinencia académica. **La comprobación de trazabilidad textual no es evaluación semántica ni garantiza la calidad del razonamiento.**

**Atención para partidas en curso:** si un equipo no guardó en la ronda 1 su DAFO, cinco fuerzas o análisis interno, no podrá inventar después una cita histórica. Para pruebas, utiliza una partida nueva completando primero el Tema 2, o consulta con el profesor una excepción didáctica. El bloqueo forma parte de la interfaz y no es una autorización adicional de seguridad en el backend; el profesor debe supervisar las entregas. Este cambio no requiere migración SQL ni altera el modelo de calificación.

## Motor competitivo del Tema 4 (implementado)

Desde la **ronda 3** cada equipo debe escoger y justificar una de las siguientes estrategias en **Plan estratégico** antes de enviar decisiones. La elección se mantiene para las rondas 3 y 4.

- **Liderazgo en costes**: la utilización de capacidad, la inversión productiva y el precio refuerzan la eficiencia; el coste variable se reduce dentro de límites.
- **Diferenciación**: invertir en I+D y comercialización aumenta el atractivo y el valor percibido, a cambio de un coste unitario superior.
- **Enfoque / segmentación**: la especialización en I+D y marketing mejora la atracción de un nicho, con un límite explícito del **22 %** de demanda del mercado por ronda.
- **Coherencia**: se genera un indicador explicativo (0–100) calculado con reglas deterministas, visible en los resultados y en el panel del profesor. No determina por sí solo la calificación.
- **Puntuación**: se mantiene la distribución pedagógica actual del simulador, pero se amplía el rango normalizado de rentabilidad para evitar saturación prematura. Las distintas estrategias tienen efectos a través de los costes, las ventas y los resultados reales simulados.

Los coeficientes son **hipótesis didácticas** del modelo, no estimaciones empíricas del sector industrial. No existe estrategia universalmente vencedora. El motor económico y los resultados de STRATEGOS IA original no cambian.

**No se requiere SQL adicional** para este cambio: la ficha de estrategia ya utiliza la RPC `ssl_save_strategy` del proyecto compartido. Conviene probarlo con una partida nueva antes de usarlo en el aula.

## Contenidos docentes incluidos

| Ronda | Tema | Actividades |
|---|---|---|
| 1 | Tema 2: Empresa, empresario y entorno | Entorno genérico, cinco fuerzas, cadena de valor, capacidades, DAFO, RSC y economía circular |
| 2 | Tema 3: Objetivos | Misión, visión, objetivos SMART, niveles de objetivos, grupos de interés, rentabilidad y creación de valor |
| 3 | Tema 4: Estrategia empresarial | Liderazgo en costes, diferenciación, enfoque, coherencia entre estrategia, recursos e implantación |
| 4 | Tema 5: Dirección y decisiones | Factores ponderados, árboles de decisión, decisión bajo incertidumbre, Laplace, Wald, Hurwicz y Savage |

**Nota curricular:** el Tema 5 incluye árboles de decisión basados en riesgo y probabilidad; la primera versión ofrece el comparador de incertidumbre y ejemplos ponderados. La herramienta gráfica de construcción de árboles queda pendiente. Tampoco se ha implantado todavía cálculo explícito de Re, RFP o apalancamiento dentro del motor económico.

## Activación SIN un nuevo proyecto Supabase (opción para el plan gratuito)

STRATEGOS STRATEGY LAB puede compartir el **mismo proyecto Supabase** que STRATEGOS IA, pero **no las mismas tablas, funciones ni partidas**. Los nombres se diferencian de forma estricta:

| Uso | STRATEGOS IA existente | STRATEGOS STRATEGY LAB |
|---|---|---|
| Partida | `public.cbc_game` | `public.ssl_game` |
| Profesor autorizado | `public.cbc_teachers` | `public.ssl_teachers` |
| Funciones RPC | `cbc_*` | `ssl_*` |
| Función de IA | `strategos-advisor` | `strategy-lab-advisor` |
| Acceso del alumnado | códigos propios | códigos nuevos |
| Usuario de profesor | cuenta Supabase existente | puede usar la misma cuenta Auth |

**Pasos:**

1. Abre el **mismo proyecto Supabase que ya utilizas para STRATEGOS IA**.
2. En **SQL Editor → New query**, pega y ejecuta **únicamente [supabase/setup.sql](supabase/setup.sql) DE ESTE REPOSITORIO**. Se crean recursos `ssl_*` y códigos propios de equipos. **Nunca ejecutes el setup.sql de STRATEGOS IA para activar Strategy Lab**, porque actuaría sobre `cbc_*`.
3. Comprueba en **Table Editor** que existan **ambas** tablas `cbc_game` (original, intacta) y `ssl_game` (nueva).
4. El archivo `sync.js` de Strategy Lab ya está configurado con **la URL y la clave pública del Supabase compartido**. Solo se permite llamar a RPC `ssl_*` desde esta instancia.
5. El profesor puede usar la misma dirección de correo y contraseña de Supabase Auth, si el correo aparece en `ssl_teachers`. La sesión del navegador tiene nombre separado.
6. En GitHub abre **Settings → Pages → Deploy from a branch → main → /(root)**.
7. Comprueba que la simulación nueva genera sus propios códigos, guarda análisis en las cuatro rondas y no altera la original.
8. Para activar el asesor generativo, despliega una **segunda Edge Function** llamada `strategy-lab-advisor` usando [supabase/functions/strategy-lab-advisor/index.ts](supabase/functions/strategy-lab-advisor/index.ts). **No sobrescribas `strategos-advisor`**, que sigue atendiendo la simulación original. La nueva función utiliza `ssl_student_state`. El mismo secreto `OPENAI_API_KEY` del proyecto puede ser accesible para ambas funciones, pero el consumo de API será compartido y debes vigilar el presupuesto.

**Advertencia:** los archivos SQL adicionales heredados en `supabase/` (`acortar-codigos.sql`, `reparar-guardado.sql`, `privacidad-evaluacion-canvas.sql`) no están adaptados al prefijo `ssl_`. **No los ejecutes** en el proyecto compartido: podrían modificar la aplicación original. Solo el `setup.sql` actual está preparado para instalar el laboratorio sin interferir.

**Límites:** el proyecto compartido suma los límites de almacenamiento, tráfico, Edge Functions y consumo de recursos de ambas aplicaciones. Esta separación es lógica, no equivale a aislamiento completo de infraestructura ni a disponer de cuotas independientes.

## Enlaces previstos cuando GitHub Pages esté activo

- Alumnado: https://pericoff.github.io/strategos-strategy-lab/
- Profesorado: https://pericoff.github.io/strategos-strategy-lab/profesor.html
- Manual: https://pericoff.github.io/strategos-strategy-lab/guia-alumnado.html

## Diseño y seguridad

El cuaderno del alumno se guarda mediante RPC con una transacción de actualización y se muestra exclusivamente al equipo que introduce su código. El panel docente accede al estado completo mediante autenticación. La información estratégica no se remite al modelo de IA hasta que se habilite la nueva Edge Function y un equipo realice expresamente una consulta. La lógica económica existente es didáctica, no predictiva, y sus supuestos deben explicarse al alumnado.

## Repositorios independientes

- **Circular Business Challenge 2**: `pericoff/circular-business-uja-2` (sin cambios).
- **STRATEGOS IA**: `pericoff/STRATEGOS-IA` (sin cambios).
- **STRATEGOS STRATEGY LAB**: `pericoff/strategos-strategy-lab` (este proyecto).

## Fuente docente

Los contenidos se han diseñado a partir de los PDF facilitados por el docente: **TEMA 2 F.pdf, TEMA 3 F.pdf, TEMA 4 F.pdf y TEMA 5 F.pdf**. Las actividades son aplicaciones y contextualizaciones didácticas de dichos materiales.
