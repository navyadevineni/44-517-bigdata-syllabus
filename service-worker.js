/**
 *  @fileOverview Provides an asynchronous service worker to manage application behavior.
 *
 * Service workers are capable of intercepting and adjusting all requests
 * before they are sent and after they return.
 *
 * Services workers can manage caching files to improve performance,
 * provide offline app experiences, enable 'home page' installation on devices,
 * and provide push notifications to your users.
 *
 * - Service worker will download (upon page access, every 24 hours)
 * - Will install (if new) and yield the install event
 * - Yields activate event after pages load and old service worker is no longer used
 *
 * Use Chrome Dev Tools / Application to clear storage.
 *
 * Use Chrome Dev Tools / Application / ServiceWorker to debug.
 * Check "update on reload" to force service worker update on page reload.
 *
 * Use Chrome Dev Tools / Lighthouse to evaluate.
 *
 * JSDoc comments are written in Markdown.
 *
 * Use shorter cache times during active development.
 *
 * @author  Denise Case
 *
 * @requires EXTERNAL:@link{https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js}
 */

// eslint-disable-next-line no-undef
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js',
);

if (workbox) {
  // console.log('Service worker Workbox loaded', workbox.routing);

  const appName = '44-517-bigdata-syllabus';
  const appVersion = 'v1';
  const maxAge10MinInSeconds = 10 * 60;
  const maxAge1DayInSeconds = 1 * 24 * 60 * 60;
  const httpReponseOk = 200; // good

  // test Regular Expressions at https://regexr.com/
  const reStatic = /\.(?:js|css|html)$/;
  const reImages = /\.(?:png|gif|jpg|jpeg|webp|svg)$/;
  const reCdnFont = /https:\/\/fonts\.googleapis\.com\/.*css*/;
  const reCdnStyles = /https:\/\/cdnjs\.cloudflare\.com\/.*\.css$/;
  const reCdnFontAwesome = /https:\/\/use\.fontawesome\.com\/.*css$/;

  // set a prefix & suffix so local host caches remain unique
  workbox.core.setCacheNameDetails({
    prefix: appName,
    suffix: appVersion,
    precache: 'pre-cache',
    runtime: 'runtime-cache',
  });

  const precacheCacheName = workbox.core.cacheNames.precache;

  // CDN Fonts:
  // use stale cached files while downloading new for next time
  // set the max age of the cached files

  workbox.routing.registerRoute(
    reCdnFont,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: precacheCacheName,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          maxAgeSeconds: maxAge10MinInSeconds,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [httpReponseOk],
        }),
      ],
    }),
  );

  // CDN styles:
  // use stale cached files while downloading new for next time
  // set the max age of the cached files

  workbox.routing.registerRoute(
    reCdnStyles,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: precacheCacheName,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          maxAgeSeconds: maxAge1DayInSeconds,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [httpReponseOk],
        }),
      ],
    }),
  );

  // Fontawesome:
  // use stale cached files while downloading new for next time
  // set the max age of the cached files

  workbox.routing.registerRoute(
    reCdnFontAwesome,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: precacheCacheName,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          maxAgeSeconds: maxAge1DayInSeconds,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [httpReponseOk],
        }),
      ],
    }),
  );

  // Static assets:
  // use stale cached files while downloading new for next time
  // set the max age of the cached files

  workbox.routing.registerRoute(
    reStatic,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: precacheCacheName,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          maxAgeSeconds: maxAge10MinInSeconds,
        }),
      ],
    }),
  );

  // Images:
  // use stale cached files while downloading new for next time
  // set the max age of the cached files
  // use different cache for images

  workbox.routing.registerRoute(
    reImages,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: `${precacheCacheName}-images`,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          maxAgeSeconds: maxAge10MinInSeconds,
        }),
      ],
    }),
  );

  // Define a common handler if any of the fetching methods fail

  workbox.routing.setCatchHandler(({ event }) => {
    console.error(`Error: ${event.error}`);
    if (event.request.mode === 'navigate') {
      return caches.match('/error-page.html');
    }
    return Response.error();
  });

  // respond with 200 (ok) even when offline

  this.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(precacheCacheName)
        .then((cache) =>
          cache.addAll([
            'index.html',
            'init-outline.js',
            'init-outcomes.js',
            'styles/case-syllabus.css',
            'scripts/case-syllabus.js',
            'scripts/active-checks.js',
            'custom-elements/nw-syllabus-footer.js',
            'custom-elements/nw-syllabus-header.js',
            'custom-elements/nw-syllabus-nw-standard.js',
            'custom-elements/nw-syllabus-outcomes-list.js',
            'custom-elements/nw-syllabus-outline.js',
            'custom-elements/nw-syllabus-professor.js',
            'custom-elements/nw-syllabus-professor-standard.js',
            'custom-elements/nw-syllabus-schedule.js',
          ]),
        )
        .catch((error) => {
          console.error(`Error in install event: ${error} `);
        }),
    );
  });

  this.addEventListener('fetch', (event) => {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
        .catch((error) => {
          console.error(`Error on fetch: ${error} `);
        }),
    );
  });
} else {
  console.error('Error: Workbox did not load.');
}
