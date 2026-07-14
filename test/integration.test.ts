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

	it('keeps the id stable when a volatile signal is randomized (privacy browsers)', async () => {
		let session = 0;
		const defs: SourceDefinition[] = [
			{ name: 'platform', source: () => 'device-hardware', entropy: 10, role: 'core' },
			// stands in for canvas/WebGL/audio under Firefox private / Brave farbling
			{ name: 'canvas', source: () => `noise-${session++}`, entropy: 10, role: 'volatile' }
		];

		const agent = await load({ sources: defs });
		const first = await agent.get();
		const second = await agent.get(); // the volatile value has now changed

		expect(first.components['canvas']).not.toEqual(second.components['canvas']);
		expect(first.visitorId).toBe(second.visitorId);
	});

	it('changes the id when a core signal changes', async () => {
		const make = (platform: string): SourceDefinition[] => [
			{ name: 'platform', source: () => platform, entropy: 10, role: 'core' }
		];

		const a = await (await load({ sources: make('MacIntel') })).get();
		const b = await (await load({ sources: make('Win32') })).get();
		expect(a.visitorId).not.toBe(b.visitorId);
	});
});
