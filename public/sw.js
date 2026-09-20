// 디에듀 PWA 최소 서비스워커.
// 범위: 앱 셸 소수만 precache, 내비게이션만 network-first(+오프라인 폴백).
// /api/* 와 POST 등 비-GET 요청은 절대 가로채지 않는다.
const CACHE_VERSION = 'dedu-pwa-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // precache 실패는 설치를 막지 않는다 (보수적 동작).
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET 이외(POST/PUT/DELETE 등)는 절대 가로채지 않는다.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API 요청은 캐시하지 않고 그대로 통과.
  if (url.pathname.startsWith('/api/')) return;

  // 내비게이션 요청만 network-first + 오프라인 폴백.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () => caches.match('/') ?? caches.match(request)
      )
    );
    return;
  }

  // 그 외 요청은 서비스워커가 개입하지 않는다 (기본 네트워크 동작).
});
