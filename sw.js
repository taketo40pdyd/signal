/* Signal Service Worker
   - アプリ本体(同一オリジン)だけをキャッシュします。映像(HLS)など外部への通信には一切介入しません。
   - index.html などを更新して公開したら、VERSION を上げてください(古いキャッシュが入れ替わります)。 */
const VERSION = "signal-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || request.headers.has("range")) return;

  if (request.mode === "navigate") {
    /* ページ本体: ネットワーク優先、つながらないときだけ保存済みを表示 */
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(VERSION).then((cache) => cache.put("index.html", copy));
        return response;
      }).catch(() => caches.match("index.html").then((hit) => hit || caches.match("./")))
    );
    return;
  }
  /* 画像・マニフェストなど: 保存済みを先に返し、裏で更新 */
  event.respondWith(
    caches.match(request).then((hit) => {
      const fresh = fetch(request).then((response) => {
        if (response.ok) { const copy = response.clone(); caches.open(VERSION).then((cache) => cache.put(request, copy)); }
        return response;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
