import { describe, expect, it } from 'vitest';
import { normalizeUserAgent } from './platform';

describe('normalizeUserAgent', () => {
	it('is identical across Firefox version bumps', () => {
		const v152 =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0';
		const v153 =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0';
		expect(normalizeUserAgent(v152)).toBe(normalizeUserAgent(v153));
	});

	it('is identical across Chrome version bumps', () => {
		const c120 =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
		const c121 =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36';
		expect(normalizeUserAgent(c120)).toBe(normalizeUserAgent(c121));
	});

	it('still distinguishes different browsers and platforms', () => {
		const firefoxWin = normalizeUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:152.0) Gecko/20100101 Firefox/152.0'
		);
		const chromeMac = normalizeUserAgent(
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		);
		expect(firefoxWin).not.toBe(chromeMac);
	});
});
