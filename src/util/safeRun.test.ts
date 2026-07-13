import { describe, expect, it, vi } from 'vitest';
import { isSuccess } from '../types';
import { safeRun } from './safeRun';

describe('safeRun', () => {
	it('returns the value and a duration for a synchronous source', async () => {
		const component = await safeRun(() => 42);
		expect(isSuccess(component)).toBe(true);
		if (isSuccess(component)) {
			expect(component.value).toBe(42);
		}
		expect(component.duration).toBeGreaterThanOrEqual(0);
	});

	it('awaits asynchronous sources', async () => {
		const component = await safeRun(async () => 'ok');
		expect(isSuccess(component) && component.value).toBe('ok');
	});

	it('captures a synchronous throw instead of rejecting', async () => {
		const component = await safeRun(() => {
			throw new Error('boom');
		});
		expect(isSuccess(component)).toBe(false);
		if (!isSuccess(component)) {
			expect(component.error).toContain('boom');
		}
	});

	it('captures a rejected promise', async () => {
		const component = await safeRun(async () => {
			throw new Error('nope');
		});
		expect(isSuccess(component)).toBe(false);
		if (!isSuccess(component)) {
			expect(component.error).toContain('nope');
		}
	});

	it('times out a source that never settles', async () => {
		vi.useFakeTimers();
		const pending = safeRun(() => new Promise<number>(() => undefined), 50);
		await vi.advanceTimersByTimeAsync(60);
		const component = await pending;
		vi.useRealTimers();

		expect(isSuccess(component)).toBe(false);
		if (!isSuccess(component)) {
			expect(component.error).toMatch(/timed out/i);
		}
	});
});
