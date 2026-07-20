# stable-fingerprint

> Identify a returning browser with no cookies and no storage - just the device underneath it.

[![CI](https://github.com/ajamesdev/stable-fingerprint/actions/workflows/ci.yml/badge.svg)](https://github.com/ajamesdev/stable-fingerprint/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/stable-fingerprint)](https://www.npmjs.com/package/stable-fingerprint)
[![npm downloads](https://img.shields.io/npm/dm/stable-fingerprint)](https://www.npmjs.com/package/stable-fingerprint)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

Browsers leak a surprising amount about the machine underneath them: the GPU, the
installed fonts, the audio stack, the screen. `stable-fingerprint` reads those signals
on the client, hashes the stable ones into a `visitorId`, and tells you how
confident it is. No cookies, no localStorage, nothing to clear.

```ts
import Fingerprint from 'stable-fingerprint';

const fp = await Fingerprint.load();
const { visitorId, confidence } = await fp.get();
// visitorId  -> "5d01727c86dcd5b7e4d6d6ecbd8b3382"
// confidence -> { score: 0.99 }
```

The id is the same in a normal window and an incognito window, survives browser
zoom, and survives browser auto-updates. Try the
[live demo](https://ajamesdev.github.io/stable-fingerprint/), or run
`npm run demo` locally for a per-signal debug view.

## Install

```sh
npm install stable-fingerprint
```

## API

`load(options?)` prepares an agent; call it early so the first `get()` is fast.

- `options.sources` - override the built-in signal registry
- `options.timeout` - per-source timeout in ms (default 1000)

`agent.get()` returns:

```ts
interface FingerprintResult {
	visitorId: string; // 32-char hex hash
	confidence: { score: number };
	components: Record<string, { value; duration } | { error; duration }>;
	version: string;
}
```

Under the hood the id is a MurmurHash3 x64 128-bit hash of the `core` components,
serialized deterministically (object keys sorted) so ordering never affects it.

## Scope

This is a per-browser fingerprint. Same browser gives the same id across
sessions, incognito, zoom and updates. Different browsers or devices are treated
as different identities, which is correct: even `Math.atanh` returns a different
last digit across JavaScript engines. Linking across browsers or devices needs
server-side signals (IP, TLS/JA4) that a client library cannot see.

## Development

```sh
npm i && npm test   # the whole dev loop
npm run demo        # interactive demo
npm run build       # ESM + CJS + types
```

## Roadmap

- [x] Stable per-browser id with confidence scoring
- [x] Randomization-proof core, resilient to private mode
- [x] Interactive demo with a per-signal debug view
- [ ] Optional persistence layer for faster repeat lookups
- [ ] Server-side signal (IP) for cross-browser linking

## Releasing

Publishing is automated with GitHub Actions using npm trusted publishing (OIDC),
so no npm token is stored in the repo. One-time setup on npmjs.com: on the
package's Settings -> Trusted Publishers, add GitHub Actions with this repository
and the workflow file `release.yml`.

```sh
npm version patch      # bump the version, commit, and create a v* tag
git push --follow-tags # triggers the workflow, which publishes to npm
```

Pushes to `main` never publish - only version tags do.

## License

[MIT](./LICENSE)
