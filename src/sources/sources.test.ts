import { afterEach, describe, expect, it } from 'vitest';
import { collectComponents } from '../agent';
import { screen } from './screen';
import { sources } from './index';

describe('source registry', () => {
	it('has unique names', () => {
		const names = sources.map((s) => s.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('marks every device/rendering source as stable for the id', () => {
		expect(sources.every((s) => s.stableForId)).toBe(true);
	});

	it('collects one component per source without throwing', async () => {
		// In jsdom, canvas/webgl/audio are unavailable, so several sources will
		// error — the point is that collection still returns one entry each.
		const components = await collectComponents(sources);
		expect(Object.keys(components).sort()).toEqual(sources.map((s) => s.name).sort());
	});
});

describe('screen source', () => {
	const original = {
		width: Object.getOwnPropertyDescriptor(window.screen, 'width'),
		height: Object.getOwnPropertyDescriptor(window.screen, 'height')
	};

	afterEach(() => {
		if (original.width) Object.defineProperty(window.screen, 'width', original.width);
		if (original.height) Object.defineProperty(window.screen, 'height', original.height);
	});

	it('normalises resolution to largest dimension first (orientation-proof)', () => {
		Object.defineProperty(window.screen, 'width', { value: 1080, configurable: true });
		Object.defineProperty(window.screen, 'height', { value: 1920, configurable: true });

		const value = screen() as { resolution: [number, number] };
		expect(value.resolution).toEqual([1920, 1080]);
	});
});
