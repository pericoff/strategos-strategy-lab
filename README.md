# STRATEGOS STRATEGY LAB
**Laboratorio de Dirección Estratégica y Toma de Decisiones — Universidad de Jaén**

Aplicación web independiente para utilizar en docencia los **Temas 2, 3, 4 y 5** de Organización y Dirección de Empresas. Se parte de la infraestructura funcional de STRATEGOS IA, pero el código y el estado de la partida se mantienen aislados. **No conectar al Supabase de STRATEGOS IA ni al de Circular Business Challenge 2.**

## Estado de la primera versión (noviembre de 2026)

- Base HTML del alumnado y profesor, lógica económica de cuatro rondas y evaluación Canvas del simulador original, en repositorio propio.
- Nuevo **cuaderno estratégico** (`strategy-lab.js`), organizado por tema y ronda; seis campos orientados al análisis aplicado por ronda.
- Persistencia independiente por equipo y ronda: RPC `cbc_save_strategy` incluida en `supabase/setup.sql`, autorizada mediante código del equipo, sin editar rondas cerradas.
- Vista de revisión docente de los análisis estratégicos. La RPC `cbc_student_state` oculta los análisis de los demás equipos.
- Calculadora de factores ponderados y comparador de criterios de incertidumbre (Laplace, optimista, Wald, Hurwicz y Savage), con resultados deterministas.
- Guion de cuatro rondas y manual de alumnado alineados con los temas 2–5.
- El asesor de IA (`strategos-advisor`) está adaptado para tratar preguntas de estrategia, pero **no estará disponible hasta que se configure un proyecto Supabase nuevo y una Edge Function propia.**
- El motor económico heredado y la ponderación **80 % simulación / 20 % Canvas** se mantienen provisionalmente. Las fichas estratégicas se revisan de forma formativa y no alteran automáticamente la nota; diseñar un baremo estratégico específico es una fase posterior.
- **Los enlaces a los cinco vídeos de STRATEGOS IA no se han copiado**; se pueden producir nuevos vídeos específicos de los cuatro temas.

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
