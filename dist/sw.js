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
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

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
    "revision": "aa64e2a2ec3d5930b80154c5ff19ac81"
  }, {
    "url": "pwa-512x512.png",
    "revision": "dfabb0826464234196508f50c82ba4c3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "e93d1b2ef00e870bcc528a64cf254c1f"
  }, {
    "url": "index.html",
    "revision": "f723f2cf1f2b3e0fef25ef3646100952"
  }, {
    "url": "icon.svg",
    "revision": "100db9b0aec1c7c52f95824ba8f2a733"
  }, {
    "url": "favicon.png",
    "revision": "c48568c4b5a6df7bf2c0bc060531dba0"
  }, {
    "url": "favicon.ico",
    "revision": "b0a0ce0b545bba4ac7cfe0b6ecf350c1"
  }, {
    "url": "download.html",
    "revision": "e39dca1f6ea7cdb8bb9f8534aa6a7e89"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "e5986937e92f3e84bb6c0fdf6e2f3177"
  }, {
    "url": "assets/index-gGiQlODn.css",
    "revision": null
  }, {
    "url": "assets/index-CV-mxxGW.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "e5986937e92f3e84bb6c0fdf6e2f3177"
  }, {
    "url": "favicon.ico",
    "revision": "b0a0ce0b545bba4ac7cfe0b6ecf350c1"
  }, {
    "url": "pwa-192x192.png",
    "revision": "e93d1b2ef00e870bcc528a64cf254c1f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "dfabb0826464234196508f50c82ba4c3"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "aa64e2a2ec3d5930b80154c5ff19ac81"
  }, {
    "url": "manifest.webmanifest",
    "revision": "9c179612996508a46fb555515df92abe"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
