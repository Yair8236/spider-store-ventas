-- =====================================================================
-- Spider Store - Sistema de ventas
-- Base de datos (Supabase / Postgres) con roles: admin y vendedor.
-- Los permisos se aplican en la base (RLS), no solo en la pantalla.
-- Solo ASCII a proposito, para que no se vean caracteres raros.
-- =====================================================================

-- 0) Limpieza de lo anterior (tablas y funciones viejas del esquema public)
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('drop table if exists public.%I cascade', r.tablename);
  end loop;
  for r in
    select p.oid::regprocedure as f
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    begin
      execute 'drop function if exists ' || r.f || ' cascade';
    exception when others then null;
    end;
  end loop;
end $$;

-- 1) Tablas -----------------------------------------------------------
create table public.perfiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  nombre  text not null default '',
  usuario text not null default '',
  rol     text not null default 'vendedor' check (rol in ('admin', 'vendedor')),
  activo  boolean not null default true,
  creado  timestamptz not null default now()
);

create table public.config (
  id          int primary key default 1 check (id = 1),
  datos       jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

create table public.proveedores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (length(trim(nombre)) > 0),
  telefono   text not null default '',
  ciudad     text not null default '',
  nota       text not null default '',
  creado_por uuid default auth.uid() references auth.users(id) on delete set null,
  creado     timestamptz not null default now()
);

create table public.ventas (
  id              uuid primary key default gen_random_uuid(),
  num             bigint generated always as identity unique,
  fecha           date not null default ((now() at time zone 'America/La_Paz')::date),
  hora            text not null default '',
  cliente         text not null default '',
  doc             text not null default '',
  tel             text not null default '',
  metodo          text not null default 'Efectivo',
  vendedor        text not null default '',
  vendedor_id     uuid references auth.users(id) on delete set null,
  estado          text not null default 'entregada' check (estado in ('entregada', 'reservada')),
  cobrado         numeric(12,2) not null default 0 check (cobrado >= 0),
  obs             text not null default '',
  aprobacion      text not null default 'pendiente' check (aprobacion in ('pendiente', 'aprobada', 'observada')),
  aprobada_por    uuid references auth.users(id) on delete set null,
  aprobada_en     timestamptz,
  nota_admin      text not null default '',
  creado          timestamptz not null default now(),
  actualizado     timestamptz not null default now()
);

create table public.venta_items (
  id        uuid primary key default gen_random_uuid(),
  venta_id  uuid not null references public.ventas(id) on delete cascade,
  orden     int not null default 0,
  cat       text not null default 'Otro',
  descr     text not null check (length(trim(descr)) > 0),
  serie     text not null default '',
  qty       int not null default 1 check (qty > 0),
  precio    numeric(12,2) not null default 0 check (precio >= 0),
  garantia  int not null default 0 check (garantia >= 0),
  costo     numeric(12,2) not null default 0 check (costo >= 0),
  prov_id   uuid references public.proveedores(id) on delete set null,
  pago      text not null default 'pagado' check (pago in ('pagado', 'debo', 'propio')),
  liquidado boolean not null default false
);

create index ventas_fecha_idx        on public.ventas (fecha desc);
create index ventas_aprobacion_idx   on public.ventas (aprobacion);
create index venta_items_venta_idx   on public.venta_items (venta_id);
create index venta_items_serie_idx   on public.venta_items (serie);

-- 2) Funciones de apoyo ----------------------------------------------
create function public.es_activo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activo)
$$;

create function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activo and p.rol = 'admin')
$$;

create function public.ventas_antes_de_actualizar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.actualizado := now();
  if new.aprobacion is distinct from old.aprobacion then
    new.aprobada_por := auth.uid();
    new.aprobada_en  := now();
  end if;
  return new;
end $$;

create trigger ventas_before_update before update on public.ventas
  for each row execute function public.ventas_antes_de_actualizar();

-- 3) Registrar venta (lo usan vendedor y admin). El vendedor NO puede leer ventas;
--    esta funcion inserta y devuelve solo el numero de nota.
create function public.registrar_venta(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_num bigint; v_nombre text; v_admin boolean;
  v_total numeric := 0; v_cobrado numeric; v_estado text;
  v_fecha date; v_hora text; it jsonb; k int := 0;
begin
  if not public.es_activo() then raise exception 'Sin permiso'; end if;
  v_admin := public.es_admin();
  if jsonb_typeof(p->'items') <> 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception 'La venta no tiene productos';
  end if;
  if jsonb_array_length(p->'items') > 60 then raise exception 'Demasiados productos'; end if;

  for it in select * from jsonb_array_elements(p->'items') loop
    if length(trim(coalesce(it->>'desc', ''))) = 0 then raise exception 'Falta la descripcion de un producto'; end if;
    if coalesce((it->>'qty')::int, 1) < 1 then raise exception 'Cantidad invalida'; end if;
    if coalesce((it->>'precio')::numeric, -1) < 0 then raise exception 'Precio invalido'; end if;
    v_total := v_total + coalesce((it->>'qty')::int, 1) * (it->>'precio')::numeric;
  end loop;

  v_estado := case when p->>'estado' = 'reservada' then 'reservada' else 'entregada' end;
  v_cobrado := case when v_estado = 'reservada'
                    then least(greatest(coalesce((p->>'cobrado')::numeric, 0), 0), v_total)
                    else v_total end;

  -- Fecha y hora las pone el servidor (hora de La Paz). Solo el admin puede fijar otra fecha.
  v_fecha := (now() at time zone 'America/La_Paz')::date;
  if v_admin and (p->>'fecha') ~ '^\d{4}-\d{2}-\d{2}$' then v_fecha := (p->>'fecha')::date; end if;
  v_hora := to_char(now() at time zone 'America/La_Paz', 'HH24:MI');

  select nombre into v_nombre from public.perfiles where id = auth.uid();

  insert into public.ventas (fecha, hora, cliente, doc, tel, metodo, vendedor, vendedor_id,
                             estado, cobrado, obs, aprobacion, aprobada_por, aprobada_en)
  values (v_fecha, v_hora,
          left(coalesce(p->>'cliente', ''), 120), left(coalesce(p->>'doc', ''), 40),
          left(coalesce(p->>'tel', ''), 40),
          case when p->>'metodo' in ('Efectivo', 'QR', 'Transferencia', 'Mixto') then p->>'metodo' else 'Efectivo' end,
          case when v_admin then coalesce(nullif(left(coalesce(p->>'vendedor', ''), 80), ''), v_nombre, '')
               else coalesce(v_nombre, '') end,
          auth.uid(), v_estado, v_cobrado, left(coalesce(p->>'obs', ''), 300),
          case when v_admin then 'aprobada' else 'pendiente' end,
          case when v_admin then auth.uid() end,
          case when v_admin then now() end)
  returning id, num into v_id, v_num;

  for it in select * from jsonb_array_elements(p->'items') loop
    insert into public.venta_items (venta_id, orden, cat, descr, serie, qty, precio, garantia)
    values (v_id, k, left(coalesce(it->>'cat', 'Otro'), 60), left(trim(it->>'desc'), 200),
            left(coalesce(it->>'serie', ''), 400),
            coalesce((it->>'qty')::int, 1), (it->>'precio')::numeric,
            greatest(coalesce((it->>'garantia')::int, 0), 0));
    k := k + 1;
  end loop;

  return jsonb_build_object('id', v_id, 'num', v_num, 'fecha', v_fecha, 'hora', v_hora,
                            'aprobacion', case when v_admin then 'aprobada' else 'pendiente' end);
end $$;

-- 4) Seguridad por filas (RLS) ---------------------------------------
alter table public.perfiles     enable row level security;
alter table public.config       enable row level security;
alter table public.proveedores  enable row level security;
alter table public.ventas       enable row level security;
alter table public.venta_items  enable row level security;

-- perfiles: cada uno ve el suyo; el admin ve y administra todos
create policy perfiles_ver     on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy perfiles_admin_w on public.perfiles for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- config: todos los usuarios activos leen (la nota la necesita); solo admin escribe
create policy config_ver   on public.config for select to authenticated using (public.es_activo());
create policy config_admin on public.config for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- proveedores: vendedor y admin ven y AGREGAN; solo admin modifica o borra
create policy prov_ver      on public.proveedores for select to authenticated using (public.es_activo());
create policy prov_agregar  on public.proveedores for insert to authenticated with check (public.es_activo());
create policy prov_editar   on public.proveedores for update to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy prov_borrar   on public.proveedores for delete to authenticated using (public.es_admin());

-- ventas e items: SOLO admin (el vendedor registra por registrar_venta y no puede leer)
create policy ventas_admin on public.ventas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy items_admin  on public.venta_items for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- 5) Permisos de ejecucion y acceso -----------------------------------
revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from public, anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.es_activo(), public.es_admin(), public.registrar_venta(jsonb) to authenticated;

-- 6) Datos iniciales ---------------------------------------------------
insert into public.config (id, datos) values (1, jsonb_build_object(
  'tienda', 'Spider Store',
  'lema', U&'Hardware \00B7 Computadoras \00B7 Consolas',
  'tel', U&'730-94025 \00B7 758-77929',
  'dir', U&'Uyustus, La Paz \2014 Bolivia',
  'horario', U&'Lunes a s\00E1bado, de 13:00 a 20:00',
  'redes', 'TikTok @spiderstoredx',
  'vendedor', '', 'garantia', 12, 'cond', ''));

-- 7) Tiempo real (el admin ve las ventas en cuanto entran)
do $$ begin
  begin alter publication supabase_realtime add table public.ventas;      exception when others then null; end;
  begin alter publication supabase_realtime add table public.venta_items; exception when others then null; end;
  begin alter publication supabase_realtime add table public.proveedores; exception when others then null; end;
  begin alter publication supabase_realtime add table public.config;      exception when others then null; end;
end $$;
