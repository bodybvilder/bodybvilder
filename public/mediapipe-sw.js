/**
 * BODYBVILDER — MediaPipe Asset Cache Service Worker
 *
 * Intercepts fetch requests for MediaPipe WASM/model files and caches them
 * permanently in CacheStorage. After the first download, ALL subsequent
 * requests are served instantly from cache — no network needed.
 *
 * Cache version: bump CACHE_VER to force re-download after a MediaPipe update.
 */

const CACHE_VER  = 'mp-v1';
const MP_VERSION = '0.5.1675469404';
const CDN_BASE   = `https://unpkg.com/@mediapipe/pose@${MP_VERSION}`;

// Files to cache on first access
const MP_FILES = [
  'pose.js',
  'pose_web.binarypb',
  'pose_landmark_lite.tflite',
  'pose_solution_wasm_bin.js',
  'pose_solution_simd_wasm_bin.js',
  'pose_solution_packed_assets_loader.js',
  'pose_solution_packed_assets.data',
  'pose_solution_simd_wasm_bin.data',
];

// Build a Set of URLs this SW should intercept
const MP_URLS = new Set(MP_FILES.map(f => `${CDN_BASE}/${f}`));

self.addEventListener('install', (e) => {
  // Activate immediately — don't wait for old SW to die
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  // Take control of all clients immediately
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete old cache versions
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k)))
      ),
    ])
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Only intercept MediaPipe CDN requests
  if (!MP_URLS.has(url)) return;

  e.respondWith(
    caches.open(CACHE_VER).then(async (cache) => {
      // Check cache first
      const cached = await cache.match(url);
      if (cached) return cached;

      // Not cached — fetch from CDN and cache for next time
      try {
        const response = await fetch(e.request);
        if (response.ok) {
          // Clone before consuming (response body can only be read once)
          cache.put(url, response.clone());
        }
        return response;
      } catch (err) {
        // Network error and not cached — nothing we can do
        throw err;
      }
    })
  );
});
