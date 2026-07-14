import type { SignalValue } from '../types';

/** Best-effort private/incognito detection. This is inherently approximate and
 * browser/version specific, so we use the most reliable public signal - storage
 * quota, which Chromium and Firefox cap sharply in private mode - and report a
 * nullable result rather than pretending certainty. Never feeds the id. */
export async function incognito(): Promise<SignalValue> {
	const storage = navigator.storage;
	if (storage && typeof storage.estimate === 'function') {
		const { quota } = await storage.estimate();
		if (typeof quota === 'number') {
			// Normal-mode quota scales with free disk (typically many GB); private
			// mode is capped far lower. ~1.2 GB is a pragmatic dividing line.
			return {
				incognito: quota < 1_200_000_000,
				method: 'storage-quota',
				quotaMB: Math.round(quota / (1024 * 1024))
			};
		}
	}
	return { incognito: null, method: 'unavailable' };
}
