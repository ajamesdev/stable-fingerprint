import { isSuccess, type Components, type Confidence, type SourceDefinition } from './types';

/** Short explanation to accompany a score. */
function describe(score: number): string {
	if (score >= 0.9) return 'high — rich, distinctive signal set';
	if (score >= 0.6) return 'good — most identifying signals available';
	if (score >= 0.3) return 'moderate — several signals missing';
	return 'low — very limited signal set';
}

/**
 * Confidence that the visitor id is distinctive, as the fraction of expected
 * identifying entropy actually collected. Only id-relevant (`stableForId`)
 * signals count, weighted by their entropy, so losing canvas/WebGL costs far
 * more than losing a minor signal. Capped just below 1 — a fingerprint is never
 * a certainty.
 */
export function scoreConfidence(
	components: Components,
	definitions: SourceDefinition[]
): Confidence {
	const stable = definitions.filter((definition) => definition.stableForId);
	const total = stable.reduce((sum, definition) => sum + definition.entropy, 0);
	const collected = stable.reduce((sum, definition) => {
		const component = components[definition.name];
		return sum + (component && isSuccess(component) ? definition.entropy : 0);
	}, 0);

	const coverage = total > 0 ? collected / total : 0;
	const score = Math.round(Math.min(coverage, 1) * 0.99 * 100) / 100;

	return { score, comment: describe(score) };
}
