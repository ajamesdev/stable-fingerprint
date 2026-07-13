import type { SignalValue } from '../types';

/** Deterministic JSON: object keys are sorted so the output never depends on
 * insertion order. Used to build a stable hash input from component values. */
export function stableStringify(value: SignalValue): string {
	if (value === null || typeof value !== 'object') {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`;
	}
	const keys = Object.keys(value).sort();
	return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key] as SignalValue)}`).join(',')}}`;
}
