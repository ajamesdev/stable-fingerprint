import { describe, expect, it } from 'vitest';
import { scoreConfidence } from './confidence';
import type { Component, SourceDefinition } from './types';

const defs: SourceDefinition[] = [
	{ name: 'canvas', source: () => 0, entropy: 10, role: 'volatile' },
	{ name: 'webgl', source: () => 0, entropy: 10, role: 'volatile' },
	{ name: 'screen', source: () => 0, entropy: 4, role: 'core' },
	{ name: 'media', source: () => 0, entropy: 4, role: 'report' }
];

const ok = (): Component => ({ value: 1, duration: 0 });
const bad = (): Component => ({ error: 'x', duration: 0 });

describe('scoreConfidence', () => {
	it('caps at 0.99 when every scored signal is collected', () => {
		const result = scoreConfidence({ canvas: ok(), webgl: ok(), screen: ok() }, defs);
		expect(result.score).toBe(0.99);
	});

	it('is zero when nothing was collected', () => {
		const result = scoreConfidence({ canvas: bad(), webgl: bad(), screen: bad() }, defs);
		expect(result.score).toBe(0);
	});

	it('weights by entropy - losing canvas costs more than losing screen', () => {
		const withoutCanvas = scoreConfidence({ canvas: bad(), webgl: ok(), screen: ok() }, defs);
		const withoutScreen = scoreConfidence({ canvas: ok(), webgl: ok(), screen: bad() }, defs);
		expect(withoutCanvas.score).toBeLessThan(withoutScreen.score);
	});

	it('ignores report-only signals (media does not affect the score)', () => {
		const withMedia = scoreConfidence(
			{ canvas: ok(), webgl: ok(), screen: ok(), media: ok() },
			defs
		);
		const withoutMedia = scoreConfidence({ canvas: ok(), webgl: ok(), screen: ok() }, defs);
		expect(withMedia.score).toBe(withoutMedia.score);
	});

	it('is monotonic - more collected never lowers the score', () => {
		const one = scoreConfidence({ canvas: ok(), webgl: bad(), screen: bad() }, defs);
		const two = scoreConfidence({ canvas: ok(), webgl: ok(), screen: bad() }, defs);
		expect(two.score).toBeGreaterThanOrEqual(one.score);
	});
});
