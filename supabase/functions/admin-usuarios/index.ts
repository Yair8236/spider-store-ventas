// Edge Function: administracion de cuentas (solo el rol admin puede usarla).
// Crea usuarios, cambia claves, activa/desactiva cuentas y cambia el rol.
// Usa la llave de servicio, que NUNCA sale al navegador.
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    });
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const { data: u, error: ue } = await admin.auth.getUser(token);
    if (ue || !u?.user) return json({ error: 'No autorizado' }, 401);
    const { data: me } = await admin.from('perfiles').select('rol,activo').eq('id', u.user.id).single();
    if (!me || !me.activo || me.rol !== 'admin') return json({ error: 'Solo el administrador puede hacer esto' }, 403);

    const b = await req.json();
    const accion = String(b.accion || '');

    if (accion === 'crear') {
      const usuario = String(b.usuario || '').trim().toLowerCase();
      const nombre = String(b.nombre || '').trim().slice(0, 80);
      const rol = b.rol === 'admin' ? 'admin' : 'vendedor';
      const clave = String(b.clave || '');
      if (!/^[a-z0-9._@+-]{3,60}$/.test(usuario)) return json({ error: 'Usuario invalido (3 a 60 letras, numeros, punto o guion)' }, 400);
      if (clave.length < 8) return json({ error: 'La clave debe tener al menos 8 caracteres' }, 400);
      if (!nombre) return json({ error: 'Escribe el nombre de la persona' }, 400);
      const email = usuario.includes('@') ? usuario : usuario + '@spiderstore.app';
      const { data: c, error: ce } = await admin.auth.admin.createUser({ email, password: clave, email_confirm: true });
      if (ce || !c?.user) return json({ error: ce?.message?.includes('already') ? 'Ese usuario ya existe' : (ce?.message || 'No se pudo crear') }, 400);
      const { error: pe } = await admin.from('perfiles').insert({ id: c.user.id, nombre, usuario, rol });
      if (pe) { await admin.auth.admin.deleteUser(c.user.id); return json({ error: pe.message }, 400); }
      return json({ ok: true, id: c.user.id });
    }

    const id = String(b.id || '');
    if (!id) return json({ error: 'Falta el usuario' }, 400);

    if (accion === 'clave') {
      const clave = String(b.clave || '');
      if (clave.length < 8) return json({ error: 'La clave debe tener al menos 8 caracteres' }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { password: clave });
      return error ? json({ error: error.message }, 400) : json({ ok: true });
    }
    if (accion === 'activo') {
      if (id === u.user.id) return json({ error: 'No puedes desactivar tu propia cuenta' }, 400);
      const activo = !!b.activo;
      const { error } = await admin.from('perfiles').update({ activo }).eq('id', id);
      if (error) return json({ error: error.message }, 400);
      await admin.auth.admin.updateUserById(id, { ban_duration: activo ? 'none' : '876000h' });
      return json({ ok: true });
    }
    if (accion === 'rol') {
      if (id === u.user.id) return json({ error: 'No puedes cambiar tu propio rol' }, 400);
      const rol = b.rol === 'admin' ? 'admin' : 'vendedor';
      const { error } = await admin.from('perfiles').update({ rol }).eq('id', id);
      return error ? json({ error: error.message }, 400) : json({ ok: true });
    }
    return json({ error: 'Accion desconocida' }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
