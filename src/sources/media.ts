import type { SignalValue } from '../types';

/** CSS media features reflecting OS/display preferences (reported, not in the id
 * - several of these are user-toggleable). */
export function media(): SignalValue {
	const match = (query: string): boolean =>
		typeof matchMedia === 'function' && matchMedia(query).matches;

	// return the first matching option, else a fallback
	const pick = (feature: string, options: string[], fallback: string): string => {
		for (const option of options) {
			if (match(`(${feature}: ${option})`)) {
				return option;
			}
		}
		return fallback;
	};

	return {
		colorScheme: match('(prefers-color-scheme: dark)') ? 'dark' : 'light',
		reducedMotion: match('(prefers-reduced-motion: reduce)'),
		contrast: pick('prefers-contrast', ['more', 'less', 'custom'], 'no-preference'),
		forcedColors: match('(forced-colors: active)'),
		invertedColors: match('(inverted-colors: inverted)'),
		colorGamut: pick('color-gamut', ['rec2020', 'p3', 'srgb'], 'unknown'),
		hdr: match('(dynamic-range: high)')
	};
}
