import type { SignalValue } from '../types';

/** Preferred UI language and the full ordered language list. */
export function languages(): SignalValue {
	return {
		language: navigator.language ?? ''
	};
}
