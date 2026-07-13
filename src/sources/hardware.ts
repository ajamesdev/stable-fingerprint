import type { SignalValue } from '../types';

/** CPU core count, coarse memory hint, and touch capability. */
export function hardware(): SignalValue {
	const nav = navigator as Navigator & { deviceMemory?: number };
	return {
		hardwareConcurrency: nav.hardwareConcurrency ?? 0,
		deviceMemory: nav.deviceMemory ?? 0,
		maxTouchPoints: nav.maxTouchPoints ?? 0,
		touch: 'ontouchstart' in window
	};
}
