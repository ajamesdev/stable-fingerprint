import { describe, expect, it } from 'vitest';
import { x64hash128 } from './x64hash';

describe('x64hash128', () => {
	it('hashes the empty string to all zeros (seed 0)', () => {
		expect(x64hash128('')).toBe('00000000000000000000000000000000');
	});

	it('matches the canonical MurmurHash3 x64 128 reference vector', () => {
		expect(x64hash128('Hello, world!', 123)).toBe('8743acad421c8c73d373c3f5f19732fd');
	});

	it('is deterministic', () => {
		expect(x64hash128('fingerprint')).toBe(x64hash128('fingerprint'));
	});

	it('produces a 32-character lowercase hex string', () => {
		const hash = x64hash128('some arbitrary input value');
		expect(hash).toMatch(/^[0-9a-f]{32}$/);
	});

	it('changes completely when the input changes by one bit (avalanche)', () => {
		const a = x64hash128('fingerprint');
		const b = x64hash128('fingerprinu'); // 't' -> 'u'
		expect(a).not.toBe(b);
		// Expect a large hamming distance between the two hashes.
		const differingHexDigits = [...a].filter((ch, i) => ch !== b[i]).length;
		expect(differingHexDigits).toBeGreaterThan(20);
	});

	it('produces different hashes for different seeds', () => {
		expect(x64hash128('fingerprint', 1)).not.toBe(x64hash128('fingerprint', 2));
	});

	it('handles inputs longer than one 16-byte block', () => {
		const long = 'x'.repeat(200);
		expect(x64hash128(long)).toMatch(/^[0-9a-f]{32}$/);
		expect(x64hash128(long)).toBe(x64hash128(long));
	});

	it('handles multi-byte UTF-8 characters', () => {
		expect(x64hash128('☕️🔒')).toMatch(/^[0-9a-f]{32}$/);
	});
});
