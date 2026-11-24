-- 004: comisiones. perfiles.comision_pct (% de la ganancia), ventas.comision_pct (copia al vender),
-- ventas.comision_pagada / comision_pagada_en. Ya aplicada en la base actual.
alter table public.perfiles add column if not exists comision_pct numeric not null default 0;
alter table public.perfiles drop constraint if exists perfiles_comision_pct_chk;
alter table public.perfiles add constraint perfiles_comision_pct_chk check (comision_pct >= 0 and comision_pct <= 100);
alter table public.ventas add column if not exists comision_pct numeric;
alter table public.ventas add column if not exists comision_pagada boolean not null default false;
alter table public.ventas add column if not exists comision_pagada_en timestamptz;
create or replace function public.ventas_antes_de_insertar_com() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.comision_pct is null then
    select case when rol = 'vendedor' then comision_pct else 0 end into new.comision_pct
      from public.perfiles where id = new.vendedor_id;
  end if;
  return new;
end $$;
drop trigger if exists ventas_antes_de_insertar_com on public.ventas;
create trigger ventas_antes_de_insertar_com before insert on public.ventas
  for each row execute function public.ventas_antes_de_insertar_com();
revoke all on function public.ventas_antes_de_insertar_com() from public, anon, authenticated;
