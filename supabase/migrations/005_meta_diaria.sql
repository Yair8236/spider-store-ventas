-- 005: meta diaria de ganancia por vendedor y mi_resumen() (totales por dia, sin costos por producto).
-- Ya aplicada en la base actual. Ver la definicion vigente en Supabase.
alter table public.perfiles add column if not exists meta_diaria numeric not null default 0;
alter table public.perfiles drop constraint if exists perfiles_meta_diaria_chk;
alter table public.perfiles add constraint perfiles_meta_diaria_chk check (meta_diaria >= 0);
