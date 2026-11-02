-- CORRECCION DEL GUARDADO DE CANVAS Y DECISIONES
-- Ejecutar en Supabase > SQL Editor > New query > Run
-- No borra ninguna partida, entrega, resultado ni código.
-- Resuelve: "path element at position 2 is null".
begin;

create or replace function public.cbc_submit_decision(
 p_code text, p_round integer, p_decision jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.cbc_game%rowtype; n int; t jsonb; k text; val numeric;
        invest numeric:=0; max_invest numeric;
begin
 if jsonb_typeof(p_decision)<>'object' then raise exception 'Decisión inválida'; end if;
 perform 1 from public.cbc_game where id=1 for update;
 select * into g from public.cbc_game where id=1;
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
 update public.cbc_game set state=g.state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true,'round',p_round);
end $$;

create or replace function public.cbc_save_idea(p_code text,p_idea jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.cbc_game%rowtype; n int; t jsonb;
begin
 if jsonb_typeof(p_idea)<>'object' or length(p_idea::text)>40000
 then raise exception 'Propuesta no válida'; end if;
 perform 1 from public.cbc_game where id=1 for update;
 select * into g from public.cbc_game where id=1;
 if (g.state->>'round')::int<>1 or g.state->>'phase'<>'decisions'
   then raise exception 'El Canvas está cerrado'; end if;
 select (x.ordinality-1)::integer, x.team into n,t
 from jsonb_array_elements(g.state->'teams') with ordinality as x(team,ordinality)
 where upper(x.team->>'code')=upper(trim(coalesce(p_code,'')))
   and coalesce((x.team->>'active')::boolean,true)
 limit 1;
 if n is null then raise exception 'Código de equipo no válido'; end if;
 g.state:=jsonb_set(g.state,array['teams',n::text],t||jsonb_build_object('idea',p_idea));
 update public.cbc_game set state=g.state,version=version+1,updated_at=now() where id=1;
 return jsonb_build_object('ok',true);
end $$;

commit;
