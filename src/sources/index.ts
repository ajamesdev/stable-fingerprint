import type { SourceDefinition } from '../types';

/**
 * The ordered registry of every signal source.
 *
 * Order matters: the visitor id is derived from the stable components in this
 * exact sequence, so appending new sources at the end keeps existing ids
 * stable. Individual sources are added in subsequent commits.
 */
export const sources: SourceDefinition[] = [];
