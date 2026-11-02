-- INSTALACIÓN SEGURA EN EL SUPABASE COMPARTIDO DE STRATEGOS IA.
-- Este script crea ÚNICAMENTE recursos ssl_* (Strategy Lab).
-- NO cambia tablas, datos, credenciales ni funciones cbc_* de STRATEGOS IA.
-- Puede usarse la misma cuenta Auth del profesor; autorizada por ssl_teachers.
-- Ejecutar solo este setup.sql, no las migraciones cbc_* heredadas.

-- STRATEGOS STRATEGY LAB - Supabase (ejecutar en SQL Editor)
-- ANTES DE EJECUTAR: sustituye profesor@TU-DOMINIO.es por el email con el
-- que crearás/iniciarás sesión en Authentication > Users.
-- Nunca publiques claves secret/service_role en GitHub.
create table if not exists public.ssl_teachers (
  email text primary key
);
insert into public.ssl_teachers(email) values (lower('pnunez@ujaen.es'))
on conflict do nothing;

create table if not exists public.ssl_game (
  id integer primary key check (id = 1),
  version bigint not null default 1,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.ssl_teachers enable row level security;
alter table public.ssl_game enable row level security;
revoke all on public.ssl_teachers from anon, authenticated;
revoke all on public.ssl_game from anon, authenticated;

create or replace function public.ssl_is_teacher()
returns boolean language sql stable security definer set search_path = ''
as $$
 select auth.role() = 'authenticated'
   and lower(coalesce((auth.jwt() ->> 'email'), '')) in
       (select t.email from public.ssl_teachers as t);
$$;

create or replace function public.ssl_new_state()
returns jsonb language sql volatile security definer set search_path = ''
as $$
 select jsonb_build_object(
  'round',1,'phase','decisions','event','normal',
  'teams',(
   select jsonb_agg(jsonb_build_object(
    'id', n, 'name', (array['Strategy Alpha','Strategy Beta','Strategy Gamma','Strategy Delta'])[n],
    'code', upper(substr(md5(gen_random_uuid()::text),1,8)),
    'active',true,'cash',250000,'capacity',12500,'quality',50,
    'eco',50,'market',50,'tech',50,'last',null,
    'history','[]'::jsonb,'decision',null,'submitted',false
   ) order by n) from generate_series(1,4) n
  ),
  'results','[]'::jsonb,'log','[]'::jsonb
 );
$$;
insert into public.ssl_game(id, state) values (1, public.ssl_new_state())
on conflict(id) do nothing;

create or replace function public.ssl_ping()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.ssl_game where id=1); $$;

create or replace function public.ssl_teacher_state()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype;
begin
 if not public.ssl_is_teacher() then raise exception 'Acceso de profesor no autorizado'; end if;
 select * into g from public.ssl_game where id=1;
 return jsonb_build_object('state',g.state,'version',g.version);
end $$;

create or replace function public.ssl_student_state(p_code text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype; my_id int; filtered jsonb; my_code text;
begin
 my_code:=upper(trim(coalesce(p_code,'')));
 select * into g from public.ssl_game where id=1;
 select (x->>'id')::int into my_id
 from jsonb_array_elements(g.state->'teams') x
 where x->>'code'=my_code and coalesce((x->>'active')::boolean,true)
 limit 1;
 if my_id is null then raise exception 'Código de equipo no válido o inactivo'; end if;
 select jsonb_agg(
   case when (x->>'id')::int=my_id
      then x
      else (x-'code'-'decision'-'idea'-'last'-'history'-'canvasGrade'-'strategy') ||
           jsonb_build_object('code','','decision',null,'history','[]'::jsonb,'last',null,
             'canvasGrade', case when x->'canvasGrade'->'scores' is not null
                  then jsonb_build_object('scores',x->'canvasGrade'->'scores')
                  else null end)
   end order by (x->>'id')::int
 ) into filtered from jsonb_array_elements(g.state->'teams') x;
 return jsonb_build_object('version',g.version,'state',
    jsonb_set(g.state,'{teams}',filtered));
end $$;

create or replace function public.ssl_submit_decision(
 p_code text, p_round integer, p_decision jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype; n int; t jsonb; k text; val numeric;
        invest numeric:=0; max_invest numeric;
begin
 if jsonb_typeof(p_decision)<>'object' then raise exception 'Decisión inválida'; end if;
 perform 1 from public.ssl_game where id=1 for update;
 select * into g from public.ssl_game where id=1;
 if (g.state->>'round')::int <> p_round or g.state->>'phase'<>'decisions'
   then raise exception 'La ronda ya no admite entregas'; end if;
 select (x.ordinality-1)::integer, x.team into n,t
 from jsonb_array_elements(g.state->'teams') with ordinality as x(team,ordinality)
 where upper(x.team->>'code')=upper(trim(coalesce(p_code,'')))
 limit 1;
 if n is null then raise exception 'Código no válido'; end if;
 if coalesce((t->>'active')::boolean,true)=false then raise exception 'Equipo inactivo'; end if;
 if (t->>'submitted')::boolean then raise exception 'Este equipo ya entregó'; end if;
 foreach k in array array['price','production','capacityInv','rdInv','ecoInv','marketingInv','recycled']
 loop
   if jsonb_typeof(p_decision->k)<>'number'
      then raise exception 'Falta el campo numérico %',k; end if;
   val:=(p_decision->>k)::numeric;
   if val<>trunc(val) then raise exception 'Solo se admiten valores enteros'; end if;
   if k='price' and (val<20 or val>90) then raise exception 'Precio fuera de rango'; end if;
   if k='production' and (val<0 or val>25000) then raise exception 'Producción fuera de rango'; end if;
   if k='recycled' and (val<0 or val>90) then raise exception 'Porcentaje fuera de rango'; end if;
   if k in ('capacityInv','rdInv','ecoInv','marketingInv') then
     if val<0 or val>100000 then raise exception 'Inversión fuera de rango'; end if;
     invest:=invest+val;
   end if;
 end loop;
 max_invest:=least(150000,greatest(0,(t->>'cash')::numeric-15000));
 if invest>max_invest then raise exception 'Inversión superior al presupuesto disponible'; end if;
 g.state:=jsonb_set(g.state, array['teams',n::text],
        t||jsonb_build_object('decision',p_decision,'submitted',true));
 update public.ssl_game set state=g.state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true,'round',p_round);
end $$;

create or replace function public.ssl_save_idea(p_code text,p_idea jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype; n int; t jsonb;
begin
 if jsonb_typeof(p_idea)<>'object' or length(p_idea::text)>40000
 then raise exception 'Propuesta no válida'; end if;
 perform 1 from public.ssl_game where id=1 for update;
 select * into g from public.ssl_game where id=1;
 if (g.state->>'round')::int<>1 or g.state->>'phase'<>'decisions'
   then raise exception 'El Canvas está cerrado'; end if;
 select (x.ordinality-1)::integer, x.team into n,t
 from jsonb_array_elements(g.state->'teams') with ordinality as x(team,ordinality)
 where upper(x.team->>'code')=upper(trim(coalesce(p_code,'')))
   and coalesce((x.team->>'active')::boolean,true)
 limit 1;
 if n is null then raise exception 'Código de equipo no válido'; end if;
 g.state:=jsonb_set(g.state,array['teams',n::text],t||jsonb_build_object('idea',p_idea));
 update public.ssl_game set state=g.state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.ssl_teacher_save(p_state jsonb,p_version bigint)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype;
begin
 if not public.ssl_is_teacher() then raise exception 'Solo el profesor puede modificar la partida'; end if;
 if jsonb_typeof(p_state)<>'object' or jsonb_array_length(p_state->'teams')<>4
   then raise exception 'Formato de partida inválido'; end if;
 select * into g from public.ssl_game where id=1 for update;
 if g.version<>p_version then raise exception 'La partida cambió: actualiza el panel antes de repetir'; end if;
 update public.ssl_game set state=p_state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true,'version',g.version+1);
end $$;

create or replace function public.ssl_reset()
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
 if not public.ssl_is_teacher() then raise exception 'Solo el profesor puede reiniciar'; end if;
 update public.ssl_game set state=public.ssl_new_state(),version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true);
end $$;

revoke all on function public.ssl_new_state() from public,anon,authenticated;
revoke all on function public.ssl_is_teacher() from public,anon,authenticated;
revoke all on function public.ssl_ping() from public,anon,authenticated;
revoke all on function public.ssl_teacher_state() from public,anon,authenticated;
revoke all on function public.ssl_student_state(text) from public,anon,authenticated;
revoke all on function public.ssl_submit_decision(text,integer,jsonb) from public,anon,authenticated;
revoke all on function public.ssl_save_idea(text,jsonb) from public,anon,authenticated;
revoke all on function public.ssl_teacher_save(jsonb,bigint) from public,anon,authenticated;
revoke all on function public.ssl_reset() from public,anon,authenticated;
grant execute on function public.ssl_ping() to anon,authenticated;
grant execute on function public.ssl_student_state(text) to anon,authenticated;
grant execute on function public.ssl_submit_decision(text,integer,jsonb) to anon,authenticated;
grant execute on function public.ssl_save_idea(text,jsonb) to anon,authenticated;
grant execute on function public.ssl_teacher_state() to authenticated;
grant execute on function public.ssl_teacher_save(jsonb,bigint) to authenticated;
grant execute on function public.ssl_reset() to authenticated;

-- STRATEGOS STRATEGY LAB · Cuaderno de cuatro rondas, separado por equipo
-- Esta RPC no permite editar datos de otros equipos ni rondas cerradas.
create or replace function public.ssl_save_strategy(
 p_code text, p_round integer, p_entry jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.ssl_game%rowtype; n int; t jsonb; old_record jsonb;
begin
 if p_round is null or p_round<1 or p_round>4
    or jsonb_typeof(p_entry)<>'object'
    or length(p_entry::text)>20000
    or (select count(*) from jsonb_object_keys(p_entry))>12
 then raise exception 'Análisis estratégico no válido'; end if;
 perform 1 from public.ssl_game where id=1 for update;
 select * into g from public.ssl_game where id=1;
 if (g.state->>'round')::int<>p_round or g.state->>'phase'<>'decisions'
 then raise exception 'La ronda está cerrada'; end if;
 select (x.ordinality-1)::int,x.team into n,t
 from jsonb_array_elements(g.state->'teams') with ordinality as x(team,ordinality)
 where upper(x.team->>'code')=upper(trim(coalesce(p_code,'')))
 and coalesce((x.team->>'active')::boolean,true) limit 1;
 if n is null then raise exception 'Código de equipo no válido'; end if;
 old_record:=case when jsonb_typeof(t->'strategy')='object' then t->'strategy'
   else '{}'::jsonb end;
 t:=jsonb_set(t,'{strategy}',old_record || jsonb_build_object(p_round::text,p_entry));
 g.state:=jsonb_set(g.state,array['teams',n::text],t);
 update public.ssl_game
 set state=g.state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.ssl_save_strategy(text,integer,jsonb) from public,anon,authenticated;
grant execute on function public.ssl_save_strategy(text,integer,jsonb) to anon,authenticated;
