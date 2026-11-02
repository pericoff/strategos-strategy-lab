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

## Contenidos docentes incluidos

| Ronda | Tema | Actividades |
|---|---|---|
| 1 | Tema 2: Empresa, empresario y entorno | Entorno genérico, cinco fuerzas, cadena de valor, capacidades, DAFO, RSC y economía circular |
| 2 | Tema 3: Objetivos | Misión, visión, objetivos SMART, niveles de objetivos, grupos de interés, rentabilidad y creación de valor |
| 3 | Tema 4: Estrategia empresarial | Liderazgo en costes, diferenciación, enfoque, coherencia entre estrategia, recursos e implantación |
| 4 | Tema 5: Dirección y decisiones | Factores ponderados, árboles de decisión, decisión bajo incertidumbre, Laplace, Wald, Hurwicz y Savage |

**Nota curricular:** el Tema 5 incluye árboles de decisión basados en riesgo y probabilidad; la primera versión ofrece el comparador de incertidumbre y ejemplos ponderados. La herramienta gráfica de construcción de árboles queda pendiente. Tampoco se ha implantado todavía cálculo explícito de Re, RFP o apalancamiento dentro del motor económico.

## Activación independiente: pasos necesarios

1. Entra en [Supabase](https://supabase.com/dashboard/projects) y **crea un proyecto NUEVO** para STRATEGOS STRATEGY LAB. No uses los datos ni las claves de STRATEGOS IA.
2. Ejecuta **[supabase/setup.sql](supabase/setup.sql)** una vez en el SQL Editor de ese proyecto nuevo. Crea la partida, tablas, roles de profesor, códigos de equipos y funciones de guardado del cuaderno estratégico. Importante: **el archivo `setup.sql` de este repositorio es distinto del de STRATEGOS IA**.
3. En **Authentication → Users**, crea el usuario docente indicado en `supabase/setup.sql` (actualmente `pnunez@ujaen.es`) y define una contraseña propia para este proyecto.
4. En el nuevo Supabase, copia la **Project URL** y la clave pública **Publishable Key**. Edita `sync.js` y sustituye `const base='';` y `const key='';`. **No pegues claves privadas ni claves service_role en GitHub**.
5. En GitHub Settings → Pages selecciona **Deploy from a branch → main → /(root)**.
6. Comprueba el acceso docente, los códigos, el guardado de los análisis por equipo, los cálculos y una ronda completa con datos ficticios.
7. Opcional: despliega `supabase/functions/strategos-advisor/index.ts` en **Edge Functions**, configura el secreto `OPENAI_API_KEY` directamente en el nuevo Supabase y adapta/valida las autorizaciones. No publiques este secreto en GitHub. La facturación del proveedor es independiente.

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
