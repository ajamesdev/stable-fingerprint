/**
 * Core type definitions shared across the library.
 *
 * A "source" is a single unit of signal collection (canvas, audio, screen …).
 * Each source produces a serialisable value which becomes a "component" once it
 * has been executed and timed. Components are hashed into a visitor id and fed
 * into the confidence scorer.
 */

/** Any value a source is allowed to return. Must be JSON-serialisable so it can be hashed deterministically. */
export type SignalValue =
	string | number | boolean | null | SignalValue[] | { [key: string]: SignalValue };

/** A source that ran successfully. */
export interface ComponentSuccess {
	value: SignalValue;
	/** Wall-clock time the source took, in milliseconds. */
	duration: number;
}

/** A source that threw or timed out. */
export interface ComponentError {
	error: string;
	duration: number;
}

export type Component = ComponentSuccess | ComponentError;

/** Map of source name -> collected component. */
export type Components = Record<string, Component>;

/** Narrowing helper: did this component collect a value? */
export function isSuccess(component: Component): component is ComponentSuccess {
	return (component as ComponentError).error === undefined;
}

/** A function that collects a single signal. May be sync or async, and may throw. */
export type Source<T extends SignalValue = SignalValue> = () => T | Promise<T>;

/** Registry entry describing a source and how it should be treated. */
export interface SourceDefinition {
	/** Stable, unique key used in the components map and as hash input. */
	name: string;
	/** The collector itself. */
	source: Source;
	/**
	 * Rough entropy this signal contributes, in bits. Used only for confidence
	 * scoring — it is a heuristic, not a measured value.
	 */
	entropy: number;
	/**
	 * Whether the signal is stable enough across sessions (and incognito) to be
	 * part of the visitor id. Volatile signals (e.g. storage/incognito state)
	 * are still reported but excluded from the hash.
	 */
	stableForId: boolean;
}

/** Confidence that the visitor id correctly identifies a returning visitor. */
export interface Confidence {
	/** 0..1, where 1 is highest confidence. */
	score: number;
	/** Human-readable explanation of the score. */
	comment: string;
}

/** The full result returned by `get()`. */
export interface FingerprintResult {
	/** Stable hashed identifier derived from the stable components. */
	visitorId: string;
	confidence: Confidence;
	/** Every component that was collected, including failures. */
	components: Components;
	/** Library version that produced this result. */
	version: string;
}
