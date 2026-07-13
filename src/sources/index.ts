import type { SourceDefinition } from '../types';
import { audio } from './audio';
import { canvas } from './canvas';
import { fonts } from './fonts';
import { screen } from './screen';
import { webgl } from './webgl';

/** Ordered registry — the id is built from the stable components in this order,
 * so new sources are appended. `entropy` feeds scoring; `stableForId` gates the id. */
export const sources: SourceDefinition[] = [
	{ name: 'canvas', source: canvas, entropy: 10, stableForId: true },
	{ name: 'webgl', source: webgl, entropy: 10, stableForId: true },
	{ name: 'audio', source: audio, entropy: 6, stableForId: true },
	{ name: 'fonts', source: fonts, entropy: 6, stableForId: true },
	{ name: 'screen', source: screen, entropy: 4, stableForId: true }
];
