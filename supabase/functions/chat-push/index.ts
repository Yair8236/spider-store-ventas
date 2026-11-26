// Edge Function: avisos push del chat. NO guarda mensajes: el texto solo pasa de largo.
// acciones: 'key' (devuelve la llave publica VAPID) y 'enviar' (avisa a los demas dispositivos).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u?.user) return json({ error: 'No autorizado' }, 401);
    const { data: me } = await admin.from('perfiles').select('nombre,activo').eq('id', u.user.id).single();
    if (!me || !me.activo) return json({ error: 'Cuenta inactiva' }, 403);

    // llaves VAPID: se generan una sola vez y quedan en la tabla push_config (sin acceso desde el navegador)
    let { data: cfg } = await admin.from('push_config').select('pub,priv').eq('id', 1).maybeSingle();
    if (!cfg) {
      const k = webpush.generateVAPIDKeys();
      await admin.from('push_config').insert({ id: 1, pub: k.publicKey, priv: k.privateKey });
      ({ data: cfg } = await admin.from('push_config').select('pub,priv').eq('id', 1).single());
    }
    const b = await req.json().catch(() => ({}));
    if (b.accion === 'key') return json({ key: cfg!.pub });

    if (b.accion === 'enviar') {
      const x = String(b.x || '').trim().slice(0, 140);
      if (!x) return json({ error: 'Vacio' }, 400);
      webpush.setVapidDetails('mailto:spiderstore@spiderstore.app', cfg!.pub, cfg!.priv);
      const { data: subs } = await admin.from('push_subs').select('endpoint,sub,user_id').neq('user_id', u.user.id);
      const payload = JSON.stringify({ n: me.nombre || 'Chat', x });
      const dead: string[] = [];
      await Promise.all((subs || []).map(async (s) => {
        try { await webpush.sendNotification(s.sub, payload, { TTL: 1800, urgency: 'high' }); }
        catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) dead.push(s.endpoint); }
      }));
      if (dead.length) await admin.from('push_subs').delete().in('endpoint', dead);
      return json({ ok: true, enviados: (subs || []).length - dead.length });
    }
    return json({ error: 'Accion desconocida' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
