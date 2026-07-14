import type { Components, SourceDefinition } from './types';
import { safeRun } from './util/safeRun';

/**
 * Run every source definition concurrently and collect the results into a
 * {@link Components} map keyed by source name.
 *
 * Sources run in parallel because they are independent and mostly I/O- or
 * device-bound; running them serially would needlessly add up their latencies.
 * Failures are contained by {@link safeRun}, so the returned map always has one
 * entry per definition - either a value or an error.
 */
export async function collectComponents(
	definitions: SourceDefinition[],
	timeoutMs?: number
): Promise<Components> {
	const entries = await Promise.all(
		definitions.map(async (definition) => {
			const component = await safeRun(definition.source, timeoutMs);
			return [definition.name, component] as const;
		})
	);

	return Object.fromEntries(entries);
}
