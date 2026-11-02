-- Ejecutar una sola vez en Supabase SQL Editor.
-- Protege las calificaciones y observaciones de cada equipo.
-- No altera ni borra partida, Canvas, resultados ni claves.
create or replace function public.cbc_student_state(p_code text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.cbc_game%rowtype; my_id int; filtered jsonb; my_code text;
begin
 my_code:=upper(trim(coalesce(p_code,'')));
 select * into g from public.cbc_game where id=1;
 select (x->>'id')::int into my_id
 from jsonb_array_elements(g.state->'teams') x
 where x->>'code'=my_code and coalesce((x->>'active')::boolean,true)
 limit 1;
 if my_id is null then raise exception 'Código de equipo no válido o inactivo'; end if;
 select jsonb_agg(
   case when (x->>'id')::int=my_id
      then x
      else (x-'code'-'decision'-'idea'-'last'-'history'-'canvasGrade') ||
           jsonb_build_object('code','','decision',null,'history','[]'::jsonb,'last',null,
             'canvasGrade', case when x->'canvasGrade'->'scores' is not null
                  then jsonb_build_object('scores',x->'canvasGrade'->'scores')
                  else null end)
   end order by (x->>'id')::int
 ) into filtered from jsonb_array_elements(g.state->'teams') x;
 return jsonb_build_object('version',g.version,'state',
    jsonb_set(g.state,'{teams}',filtered));
end $$;

