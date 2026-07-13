import { collectComponents } from './agent';
import { scoreConfidence } from './confidence';
import { x64hash128 } from './hash/x64hash';
import { sources as defaultSources } from './sources';
import { stableStringify } from './util/stableStringify';
import { isSuccess, type Components, type FingerprintResult, type SourceDefinition } from './types';
import { version as VERSION } from '../package.json';

export interface LoadOptions {
	/** Override the source list (defaults to the built-in registry). */
	sources?: SourceDefinition[];
	/** Per-source timeout in milliseconds. */
	timeout?: number;
}

export interface Agent {
	/** Collect signals and produce a fingerprint. */
	get(): Promise<FingerprintResult>;
}

/** Build the hash input from the successful, id-relevant components, in
 * registry order. Volatile signals (storage, dark mode …) are excluded, which
 * is what keeps the id stable across incognito. */
function buildIdInput(components: Components, definitions: SourceDefinition[]): string {
	const parts: string[] = [];
	for (const definition of definitions) {
		if (!definition.stableForId) {
			continue;
		}
		const component = components[definition.name];
		if (component && isSuccess(component)) {
			parts.push(`${definition.name}:${stableStringify(component.value)}`);
		}
	}
	return parts.join('|');
}

/** Prepare an agent. Call this early (e.g. on page load) so the first `get()`
 * is fast; collection itself happens in `get()`. */
export function load(options: LoadOptions = {}): Promise<Agent> {
	const definitions = options.sources ?? defaultSources;

	const agent: Agent = {
		async get(): Promise<FingerprintResult> {
			const components = await collectComponents(definitions, options.timeout);
			const visitorId = x64hash128(buildIdInput(components, definitions));
			const confidence = scoreConfidence(components, definitions);
			return { visitorId, confidence, components, version: VERSION };
		}
	};

	return Promise.resolve(agent);
}

export { VERSION };
export type {
	FingerprintResult,
	Components,
	Component,
	Confidence,
	SourceDefinition
} from './types';

export default { load };
