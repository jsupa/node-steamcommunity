# Steam Community for Node.js
[![npm version](https://img.shields.io/npm/v/steamcommunity.svg)](https://npmjs.com/package/steamcommunity)
[![npm downloads](https://img.shields.io/npm/dm/steamcommunity.svg)](https://npmjs.com/package/steamcommunity)
[![license](https://img.shields.io/npm/l/steamcommunity.svg)](https://github.com/DoctorMcKay/node-steamcommunity/blob/master/LICENSE)
[![paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=N36YVAT42CZ4G&item_name=node%2dsteamcommunity&currency_code=USD)

This module provides an easy interface for the Steam Community website. This module can be used to simply login to
steamcommunity.com for use with other libraries, or to interact with steamcommunity.com.

**Have a question about the module or coding in general? *Do not create a GitHub issue.* GitHub issues are for feature
requests and bug reports. Instead, post in the [dedicated forum](https://dev.doctormckay.com/forum/8-node-steamcommunity/).
Such issues may be ignored!**

# 🔄 v3.51.0 — Migration to impit

The deprecated `request` package has been replaced with **[impit](https://npmjs.com/package/impit)**, a modern HTTP library with native fetch API, browser TLS fingerprint emulation, and built-in SOCKS/HTTP proxy support.

## What Changed

| v3.50.x (old) | v3.51.0 (new) |
|---|---|
| `request` package | [`impit`](https://npmjs.com/package/impit) + [`tough-cookie`](https://npmjs.com/package/tough-cookie) |
| `Request.jar()`, `Request.cookie()` | `tough-cookie` `CookieJar` / `Cookie.parse()` |
| `Request.defaults({...})` | `new Impit({...})` constructor |
| `options.request` (inject custom instance) | `options.impit` (inject custom Impit instance) |
| `options.proxy` via request agent | `options.proxy` → impit `proxyUrl` (native HTTP/HTTPS/SOCKS4/SOCKS5) |
| Node.js `>=4.0.0` | Node.js `>=18.0.0` (impit requires native `fetch`) |
| No TypeScript types | Full `.d.ts` type definitions included |

## Breaking Changes

### 1. `steamCommunity.request` is gone

The old `request` instance was exposed as `steamCommunity.request`. It no longer exists.

```js
// ❌ OLD (broken in v3.51.0)
steamCommunity.request.get(url, (err, response, body) => { ... });
steamCommunity.request.post({url, form: {...}}, callback);

// ✅ NEW — use httpRequest/httpRequestGet/httpRequestPost (powered by impit)
steamCommunity.httpRequestGet({uri: url}, (err, response, body) => { ... });
steamCommunity.httpRequestPost({uri: url, form: {...}}, callback);
```

### 2. Injecting a custom HTTP client

```js
// ❌ OLD
const community = new SteamCommunity({request: myCustomRequestInstance});

// ✅ NEW
const { Impit } = require('impit');
const myImpit = new Impit({browser: 'firefox', http3: true});
const community = new SteamCommunity({impit: myImpit});
```

### 3. Proxy configuration

```js
// ❌ OLD — proxy configured on the request instance
const request = require('request').defaults({proxy: 'http://...'});
const community = new SteamCommunity({request});

// ✅ NEW — proxy is a direct constructor option (impit natively handles it)
const community = new SteamCommunity({proxy: 'http://user:pass@host:3128'});
// or SOCKS5:
const community = new SteamCommunity({proxy: 'socks5://127.0.0.1:9050'});
```

### 4. Node.js version

impit requires Node.js 18+ (native `fetch` support).

## New Features

- **TypeScript types** — `index.d.ts` included. Auto-discovered via `"types"` in package.json. Covers all 80+ methods, 9 enums, 7 classes, and 11 typed events.
- **SOCKS proxy support** — impit natively supports SOCKS4/SOCKS5 proxies via `options.proxy`.
- **Browser TLS fingerprinting** — inject a custom Impit instance with `{browser: 'chrome'}` or `{browser: 'firefox'}` for TLS fingerprint emulation.
- **`encoding: null`** — still returns a raw Buffer for binary data (images), bridged via `response.arrayBuffer()`.
- **`formData` multipart uploads** — avatar uploads and file uploads work via a built-in multipart body builder.

## Publish

```bash
npm run publish:dry      # Preview what will be published
npm run publish:public   # Publish to npm
```

# Documentation

Documentation is available on the [GitHub wiki](https://github.com/DoctorMcKay/node-steamcommunity/wiki).

# Support

Report bugs on the [issue tracker](https://github.com/DoctorMcKay/node-steamcommunity/issues) or ask questions
on the [dedicated forum](https://dev.doctormckay.com/forum/8-node-steamcommunity/).
