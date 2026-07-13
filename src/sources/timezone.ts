import type { SignalValue } from '../types';

/** IANA time-zone name plus the standard-time (DST-independent) UTC offset. */
export function timezone(): SignalValue {
	let zone = '';
	try {
		zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
	} catch {
		zone = '';
	}

	// max of Jan/Jul offsets is the standard-time offset, so DST doesn't flip it
	const year = new Date().getFullYear();
	const jan = new Date(year, 0, 1).getTimezoneOffset();
	const jul = new Date(year, 6, 1).getTimezoneOffset();

	return { zone, offset: Math.max(jan, jul) };
}
