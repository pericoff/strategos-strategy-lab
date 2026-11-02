-- Ejecuta este script en Supabase SQL Editor para corregir códigos largos.
-- No reinicia la partida, ni borra las decisiones, Canvas o resultados.
-- Los códigos existentes de 8 caracteres se mantienen; los largos cambian.
-- Los nuevos códigos sustituyen a los antiguos: avisa a los equipos.
begin;

-- Actualizar la función en la BASE DE DATOS (no solo en GitHub)
create or replace function public.cbc_new_state()
returns jsonb language sql volatile security definer set search_path = ''
as $$
 select jsonb_build_object(
  'round',1,'phase','decisions','event','normal',
  'teams',(
   select jsonb_agg(jsonb_build_object(
    'id', n, 'name', (array['CircularBuild','EcoMaterial','ReBuild','GreenTech'])[n],
    'code', upper(substr(md5(gen_random_uuid()::text),1,8)),
    'active',true,'cash',250000,'capacity',12500,'quality',50,
    'eco',50,'market',50,'tech',50,'last',null,
    'history','[]'::jsonb,'decision',null,'submitted',false
   ) order by n) from generate_series(1,4) n
  ),
  'results','[]'::jsonb,'log','[]'::jsonb
 );
$$;

-- Actualizar solo las credenciales demasiado largas de la partida actual.
update public.cbc_game
set state = jsonb_set(
  state,
  '{teams}',
  (
    select jsonb_agg(
      case
        when length(coalesce(team->>'code','')) > 8
          then jsonb_set(team, '{code}', to_jsonb(upper(substr(md5(gen_random_uuid()::text),1,8))))
        else team
      end
      order by ordinality
    )
    from jsonb_array_elements(state->'teams') with ordinality as teams(team, ordinality)
  )
),
version = version + 1,
updated_at = now()
where id=1
and exists (
  select 1 from jsonb_array_elements(state->'teams') as t(team)
  where length(coalesce(t.team->>'code','')) > 8
);

commit;

-- Devuelve los códigos de acceso reales, ya guardados en la base de datos:
select team->>'name' as equipo, team->>'code' as codigo,
       length(team->>'code') as caracteres
from public.cbc_game,
lateral jsonb_array_elements(state->'teams') team;
