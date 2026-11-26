// Service worker minimo: solo muestra avisos del chat (push). No guarda nada en cache.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { x: e.data ? e.data.text() : '' }; }
  const t = d.n || 'Chat Spider Store';
  e.waitUntil((async () => {
    const cl = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visible = cl.some(c => c.visibilityState === 'visible');
    await self.registration.showNotification(t, { body: d.x || 'Mensaje nuevo', tag: 'spider-chat', renotify: true, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [150, 80, 150] });
    if (visible) { // la app ya avisa por dentro: no dejar duplicado
      setTimeout(async () => { (await self.registration.getNotifications({ tag: 'spider-chat' })).forEach(n => n.close()); }, 1200);
    }
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => (l.length ? l[0].focus() : self.clients.openWindow('./'))));
});
