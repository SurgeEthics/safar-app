/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "safar-logo.svg",
    "revision": "ebd7642024b539b469d5faeabcd03e3c"
  }, {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "06c9b3ee14ed28a77812eb17fe29377e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "pwa-192x192.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "index.html",
    "revision": "0ec993e280f7fbaa438405d185635aee"
  }, {
    "url": "favicon.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "favicon.ico",
    "revision": "32540fda3ab26029108ea72620821a38"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "assets/index-CmCmZWI2.css",
    "revision": null
  }, {
    "url": "assets/index-BuK1Ngq5.js",
    "revision": null
  }, {
    "url": "assets/aistudio/image_b6f81972.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_a095f77e.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_9088a0a7.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_71970538.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_44a79acc.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_22581970.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_182d28ee.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_061214_05fcbc11.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_051844_e6e58068.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_051727_3fb6d8a8.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_051402_89228004.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_040035_51a4884e.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_040010_314cf8cb.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-26_032925_ee775d5f.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-23_232850_f4cae9c4.png",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_2026-10-23_232446_27a15e0f.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "favicon.ico",
    "revision": "32540fda3ab26029108ea72620821a38"
  }, {
    "url": "pwa-192x192.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "pwa-512x512.png",
    "revision": "10930b3255605e1f7a619514cdd80246"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "06c9b3ee14ed28a77812eb17fe29377e"
  }, {
    "url": "manifest.webmanifest",
    "revision": "28884cb39ce6d01034507bc3e2dc82ea"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/.*\.zip$/, /^\/api\/.*/]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
