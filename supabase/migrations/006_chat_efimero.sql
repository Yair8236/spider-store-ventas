-- Chat efimero: usa Realtime Broadcast/Presence (canal privado 'spider-chat').
-- No crea tablas: los mensajes nunca se guardan en la base de datos.
create policy chat_leer on realtime.messages for select to authenticated
  using (realtime.topic() = 'spider-chat' and realtime.messages.extension in ('broadcast','presence') and public.es_activo());
create policy chat_escribir on realtime.messages for insert to authenticated
  with check (realtime.topic() = 'spider-chat' and realtime.messages.extension in ('broadcast','presence') and public.es_activo());
