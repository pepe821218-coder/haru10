// 하루10 영어회화 — 오프라인 캐시. 앱을 고치면 VERSION 숫자를 올리세요.
const VERSION = "haru10-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 앱 화면: 인터넷이 되면 최신본, 안 되면 저장본
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put("./index.html", cp)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  // 글꼴 등: 저장본 먼저, 뒤에서 갱신
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
