/** High-resolution monotonic clock when available, falling back to wall time. */
export function now(): number {
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		return performance.now();
	}
	return Date.now();
}

/** Round a millisecond duration to two decimal places for tidy reporting. */
export function roundMs(ms: number): number {
	return Math.round(ms * 100) / 100;
}
