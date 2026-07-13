import { afterEach, describe, expect, it } from 'vitest';
import { incognito } from './incognito';

describe('incognito', () => {
	const original = Object.getOwnPropertyDescriptor(navigator, 'storage');

	afterEach(() => {
		if (original) {
			Object.defineProperty(navigator, 'storage', original);
		} else {
			delete (navigator as { storage?: unknown }).storage;
		}
	});

	const mockQuota = (quota: number): void => {
		Object.defineProperty(navigator, 'storage', {
			configurable: true,
			value: { estimate: async () => ({ quota }) }
		});
	};

	it('always resolves to a value and never throws', async () => {
		const value = await incognito();
		expect(value).toHaveProperty('incognito');
		expect(value).toHaveProperty('method');
	});

	it('flags a sharply capped quota as incognito', async () => {
		mockQuota(200 * 1024 * 1024); // 200 MB
		const value = (await incognito()) as { incognito: boolean; method: string };
		expect(value.incognito).toBe(true);
		expect(value.method).toBe('storage-quota');
	});

	it('treats a large quota as a normal window', async () => {
		mockQuota(50 * 1024 * 1024 * 1024); // 50 GB
		const value = (await incognito()) as { incognito: boolean };
		expect(value.incognito).toBe(false);
	});

	it('reports null when the storage API is unavailable', async () => {
		delete (navigator as { storage?: unknown }).storage;
		const value = (await incognito()) as { incognito: boolean | null; method: string };
		expect(value.incognito).toBeNull();
		expect(value.method).toBe('unavailable');
	});
});
