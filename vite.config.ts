import { defineConfig, type Plugin } from 'vite';
import { createHash } from 'node:crypto';

function serviceWorker(): Plugin {
  return {
    name: 'versioned-service-worker',
    generateBundle(_, bundle) {
      const files = Object.values(bundle).map((entry) => `/${entry.fileName}`);
      const fingerprint = createHash('sha256').update(Object.values(bundle).map((entry) => entry.type === 'chunk' ? entry.code : String(entry.source)).join('')).digest('hex').slice(0, 12);
      const shell = ['/', '/demo', '/app', '/privacy', '/terms', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg', ...files];
      const source = `const CACHE = 'renewal-ledger-${fingerprint}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const oldCaches = (await caches.keys()).filter(name => name.startsWith('renewal-ledger-') && name !== CACHE);
  const isUpdate = oldCaches.length > 0;
  await Promise.all(oldCaches.map(name => caches.delete(name)));
  await self.clients.claim();
  if (isUpdate) for (const client of await self.clients.matchAll({ type: 'window' })) client.postMessage({ type: 'APP_UPDATE_READY', version: CACHE });
})()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request, { ignoreVary: true }).then(cached => cached || caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    }
  };
}

export default defineConfig({
  plugins: [serviceWorker()],
  build: {
    target: 'es2022', sourcemap: false,
    rollupOptions: { output: { entryFileNames: 'assets/[name]-[hash].js', chunkFileNames: 'assets/[name]-[hash].js', assetFileNames: 'assets/[name]-[hash][extname]' } }
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] }
});
