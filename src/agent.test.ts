import { describe, expect, it } from 'vitest';
import { collectComponents } from './agent';
import { isSuccess, type SourceDefinition } from './types';

describe('collectComponents', () => {
	it('collects every source keyed by name, isolating failures', async () => {
		const definitions: SourceDefinition[] = [
			{ name: 'good', source: () => 1, entropy: 1, role: 'core' },
			{
				name: 'bad',
				source: () => {
					throw new Error('x');
				},
				entropy: 1,
				role: 'core'
			}
		];

		const components = await collectComponents(definitions);

		expect(Object.keys(components)).toEqual(['good', 'bad']);

		const good = components['good'];
		const bad = components['bad'];
		expect(good && isSuccess(good)).toBe(true);
		expect(bad && !isSuccess(bad)).toBe(true);
	});

	it('returns an empty map for no definitions', async () => {
		expect(await collectComponents([])).toEqual({});
	});
});
