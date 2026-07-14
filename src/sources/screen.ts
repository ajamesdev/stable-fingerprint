import type { SignalValue } from '../types';

/** Physical display, not the viewport - unchanged on resize or in a new tab.
 * Resolution is stored largest-first so rotation doesn't change the id.
 * devicePixelRatio is intentionally excluded: it tracks browser zoom, which
 * incognito resets, so it would destabilise the id. */
export function screen(): SignalValue {
	const s = window.screen;
	const width = s.width;
	const height = s.height;

	return {
		resolution: [Math.max(width, height), Math.min(width, height)],
		colorDepth: s.colorDepth,
		pixelDepth: s.pixelDepth
	};
}
