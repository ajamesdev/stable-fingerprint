import { describe, expect, it } from 'vitest';
import Fingerprint, { load } from '../src/index';
import type { SourceDefinition } from '../src/types';

describe('load / get', () => {
	it('produces a 32-char hex visitor id, a confidence score and components', async () => {
		const agent = await load();
		const result = await agent.get();

		expect(result.visitorId).toMatch(/^[0-9a-f]{32}$/);
		expect(result.confidence.score).toBeGreaterThanOrEqual(0);
		expect(result.confidence.score).toBeLessThanOrEqual(1);
		expect(result.version).toBe('0.1.0');
		expect(Object.keys(result.components).length).toBeGreaterThan(0);
	});

	it('is stable across repeated calls', async () => {
		const agent = await load();
		const first = await agent.get();
		const second = await agent.get();
		expect(first.visitorId).toBe(second.visitorId);
	});

	it('default export exposes load()', () => {
		expect(typeof Fingerprint.load).toBe('function');
	});

	it('ignores volatile signals, so the id survives an incognito-style change', async () => {
		let session = 0;
		const defs: SourceDefinition[] = [
			{ name: 'stable', source: () => 'device-hardware', entropy: 10, stableForId: true },
			// stands in for a storage/session signal that incognito would reset
			{
				name: 'volatile',
				source: () => `session-${session++}`,
				entropy: 5,
				stableForId: false
			}
		];

		const agent = await load({ sources: defs });
		const first = await agent.get();
		const second = await agent.get(); // the volatile value has now changed

		expect(first.components['volatile']).not.toEqual(second.components['volatile']);
		expect(first.visitorId).toBe(second.visitorId);
	});
});
