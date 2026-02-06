const CACHE_NAME = 'soufai-system-v2026';

// قائمة الملفات والمكتبات لتخزينها للعمل أوفلاين
const assetsToCache = [
  './',
  'index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// مرحلة التثبيت: حفظ الملفات
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => self.skipWaiting())
  );
});

// مرحلة التنشيط: تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
    )).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات: تقديم الملفات من الكاش عند فقدان الإنترنت
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // استثناء روابط جوجل شيت لضمان المزامنة الحية عند توفر النت
        if (event.request.url.includes('script.google.com')) return networkResponse;
        
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('index.html');
        }
    })
  );
});
