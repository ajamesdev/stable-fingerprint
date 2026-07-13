import { afterEach, describe, expect, it } from 'vitest';
import { collectComponents } from '../agent';
import { isSuccess } from '../types';
import { languages } from './languages';
import { math } from './math';
import { screen } from './screen';
import { sources } from './index';

describe('source registry', () => {
	it('has unique names', () => {
		const names = sources.map((s) => s.name);
		expect(new Set(names).size).toBe(names.length);
	});

	it('only excludes user-toggleable / diagnostic signals from the id', () => {
		const volatile = sources.filter((s) => !s.stableForId).map((s) => s.name);
		expect(volatile).toEqual(['media', 'incognito']);
	});

	it('collects one component per source without throwing', async () => {
		// In jsdom, canvas/webgl/audio are unavailable, so several sources will
		// error — the point is that collection still returns one entry each.
		const components = await collectComponents(sources);
		expect(Object.keys(components).sort()).toEqual(sources.map((s) => s.name).sort());
	});
});

describe('environment sources', () => {
	it('reads the preferred languages', () => {
		const value = languages() as { language: string; languages: string[] };
		expect(typeof value.language).toBe('string');
		expect(Array.isArray(value.languages)).toBe(true);
	});

	it('math ops are deterministic within an engine', () => {
		expect(math()).toEqual(math());
	});

	it('every environment source resolves to a value in node/jsdom', async () => {
		const names = ['timezone', 'languages', 'platform', 'hardware', 'plugins', 'math', 'media'];
		const defs = sources.filter((s) => names.includes(s.name));
		const components = await collectComponents(defs);
		for (const name of names) {
			const component = components[name];
			expect(component && isSuccess(component)).toBe(true);
		}
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
