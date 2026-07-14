import type { Component, Source } from '../types';
import { now, roundMs } from './timing';

/** Default per-source time budget in milliseconds. */
export const DEFAULT_SOURCE_TIMEOUT = 1000;

/** Reject `promise` if it has not settled within `ms` milliseconds. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`Timed out after ${ms}ms`));
		}, ms);

		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

/** Normalise anything a source might throw into a readable string. */
function describeError(error: unknown): string {
	if (error instanceof Error) {
		return error.message || error.name;
	}
	if (typeof error === 'string') {
		return error;
	}
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
}

/**
 * Run a single source safely: time it, enforce a timeout, and never throw.
 *
 * The result is always a {@link Component} - a success carrying the collected
 * value, or an error carrying the reason. This isolation is what lets the agent
 * collect dozens of signals concurrently without a single failure (a blocked
 * API, a browser that lacks a feature) aborting the whole fingerprint.
 */
export async function safeRun(
	source: Source,
	timeoutMs: number = DEFAULT_SOURCE_TIMEOUT
): Promise<Component> {
	const start = now();
	try {
		// Wrap in Promise.resolve so synchronous throws are also caught here.
		const value = await withTimeout(Promise.resolve().then(source), timeoutMs);
		return { value, duration: roundMs(now() - start) };
	} catch (error) {
		return { error: describeError(error), duration: roundMs(now() - start) };
	}
}
