const CACHE='telc-voll-20260926-user-spec-v5';
const CORE=['/','/dashboard.html','/contact.html','/assets/app.css','/assets/app.js','/assets/i18n.js','/manifest.webmanifest','/assets/favicon-light.svg','/assets/favicon-dark.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET'||e.request.url.includes('/api/')) return; e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request))); });
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>cs[0]?cs[0].focus():clients.openWindow('/dashboard.html')))});
