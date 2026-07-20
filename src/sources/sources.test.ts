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

	it('keeps randomized and diagnostic signals out of the id', () => {
		const byRole = (role: string) => sources.filter((s) => s.role === role).map((s) => s.name);
		// randomized/spoofed by privacy browsers (canvas/webgl/audio, and Firefox's
		// hardwareConcurrency), so id-excluded
		expect(byRole('volatile')).toEqual(['canvas', 'webgl', 'audio', 'hardware']);
		expect(byRole('report')).toEqual(['media']);
		// the id is built only from the randomization-proof core
		expect(byRole('core')).toEqual([
			'fonts',
			'screen',
			'timezone',
			'languages',
			'platform',
			'plugins',
			'math'
		]);
	});

	it('collects one component per source without throwing', async () => {
		// In jsdom, canvas/webgl/audio are unavailable, so several sources will
		// error - the point is that collection still returns one entry each.
		const components = await collectComponents(sources);
		expect(Object.keys(components).sort()).toEqual(sources.map((s) => s.name).sort());
	});
});

describe('environment sources', () => {
	it('reads the preferred language', () => {
		const value = languages() as { language: string };
		expect(typeof value.language).toBe('string');
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
