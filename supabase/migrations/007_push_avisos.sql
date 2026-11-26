-- Avisos push: se guarda SOLO la direccion de envio de cada dispositivo (no los mensajes).
create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sub jsonb not null,
  creado timestamptz not null default now()
);
alter table public.push_subs enable row level security;
create policy push_subs_propias_sel on public.push_subs for select to authenticated using (user_id = auth.uid());
create policy push_subs_propias_ins on public.push_subs for insert to authenticated with check (user_id = auth.uid() and public.es_activo());
create policy push_subs_propias_upd on public.push_subs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_subs_propias_del on public.push_subs for delete to authenticated using (user_id = auth.uid());
-- Llaves VAPID: tabla sin politicas (solo la funcion con llave de servicio puede leerla).
create table if not exists public.push_config (id int primary key default 1, pub text not null, priv text not null);
alter table public.push_config enable row level security;
