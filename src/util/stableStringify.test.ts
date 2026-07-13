import { describe, expect, it } from 'vitest';
import { stableStringify } from './stableStringify';

describe('stableStringify', () => {
	it('sorts object keys so insertion order does not matter', () => {
		expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
	});

	it('recurses into nested objects and arrays', () => {
		expect(stableStringify({ x: [1, { c: 3, a: 4 }] })).toBe('{"x":[1,{"a":4,"c":3}]}');
	});

	it('serialises primitives', () => {
		expect(stableStringify('a')).toBe('"a"');
		expect(stableStringify(5)).toBe('5');
		expect(stableStringify(null)).toBe('null');
		expect(stableStringify(true)).toBe('true');
	});
});
