// 디에듀 PWA 최소 서비스워커.
// 범위: 오프라인 안내 페이지와 아이콘만 precache, 내비게이션만 network-first(+오프라인 안내).
// /api/* 와 POST 등 비-GET 요청은 절대 가로채지 않는다.
//
// v2 (2026-10-02): v1 은 오프라인 폴백으로 설치 당시의 '/' HTML 을 내줬다. 그 HTML 은 옛 빌드의
// CSS·JS 해시를 가리켜, 앱을 연 순간 네트워크가 한 번만 끊겨도 옛 화면(스크립트 미기동)이 떴다.
// 이제 앱 HTML 은 캐시하지 않는다. 캐시 이름을 바꿔 activate 에서 v1 캐시(옛 HTML)를 지운다.
const CACHE_VERSION = 'dedu-pwa-v2';
const OFFLINE_URL = '/offline.html';
const APP_SHELL = [
  OFFLINE_URL,
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 앱을 여는 순간의 일시적 끊김(와이파이·LTE 전환 등)은 한 번 더 시도해 넘긴다.
const fetchNavigation = (request) =>
  fetch(request).catch(() => wait(800).then(() => fetch(request)));

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET 이외(POST/PUT/DELETE 등)는 절대 가로채지 않는다.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API 요청은 캐시하지 않고 그대로 통과.
  if (url.pathname.startsWith('/api/')) return;

  // 내비게이션 요청만 network-first. 끝내 실패하면 앱 HTML 이 아니라 오프라인 안내를 낸다.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetchNavigation(request).catch(() =>
        caches
          .match(OFFLINE_URL)
          .then(
            (offline) =>
              offline ||
              new Response('오프라인입니다. 연결 후 다시 열어 주세요.', {
                status: 503,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
              })
          )
      )
    );
    return;
  }

  // 그 외 요청은 서비스워커가 개입하지 않는다 (기본 네트워크 동작).
});
