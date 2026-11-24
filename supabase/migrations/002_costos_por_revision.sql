-- 002: costos propuestos por vendedores quedan "por revision" hasta que el admin los apruebe.
-- Ejecutar DESPUES de schema.sql en una base nueva. En la base actual ya esta aplicada.
alter table public.venta_items add column if not exists costo_estado text not null default 'sin_costo';
alter table public.venta_items drop constraint if exists venta_items_costo_estado_chk;
alter table public.venta_items add constraint venta_items_costo_estado_chk check (costo_estado in ('sin_costo','revision','oficial'));
update public.venta_items set costo_estado = 'oficial'
 where costo_estado = 'sin_costo' and costo > 0 and (pago = 'propio' or prov_id is not null);

alter table public.proveedores add column if not exists revisado boolean not null default true;
create or replace function public.proveedores_antes_de_insertar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then new.revisado := false; end if;
  if new.creado_por is null then new.creado_por := auth.uid(); end if;
  return new;
end $$;
drop trigger if exists proveedores_antes_de_insertar on public.proveedores;
create trigger proveedores_antes_de_insertar before insert on public.proveedores
  for each row execute function public.proveedores_antes_de_insertar();
revoke all on function public.proveedores_antes_de_insertar() from public, anon, authenticated;
-- registrar_venta(p jsonb) tambien se actualizo: guarda costo, proveedor y pago por producto
-- (vendedor => 'revision', administrador => 'oficial'). Ver la version vigente en Supabase.
