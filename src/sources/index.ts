import type { SourceDefinition } from '../types';
import { audio } from './audio';
import { canvas } from './canvas';
import { fonts } from './fonts';
import { hardware } from './hardware';
import { languages } from './languages';
import { math } from './math';
import { media } from './media';
import { platform } from './platform';
import { plugins } from './plugins';
import { screen } from './screen';
import { timezone } from './timezone';
import { webgl } from './webgl';

/** Ordered registry — the id is built from the stable components in this order,
 * so new sources are appended. `entropy` feeds scoring; `stableForId` gates the id. */
export const sources: SourceDefinition[] = [
	{ name: 'canvas', source: canvas, entropy: 10, stableForId: true },
	{ name: 'webgl', source: webgl, entropy: 10, stableForId: true },
	{ name: 'audio', source: audio, entropy: 6, stableForId: true },
	{ name: 'fonts', source: fonts, entropy: 6, stableForId: true },
	{ name: 'screen', source: screen, entropy: 4, stableForId: true },
	{ name: 'timezone', source: timezone, entropy: 6, stableForId: true },
	{ name: 'languages', source: languages, entropy: 4, stableForId: true },
	{ name: 'platform', source: platform, entropy: 8, stableForId: true },
	{ name: 'hardware', source: hardware, entropy: 4, stableForId: true },
	{ name: 'plugins', source: plugins, entropy: 3, stableForId: true },
	{ name: 'math', source: math, entropy: 3, stableForId: true },
	// user-toggleable (dark mode, reduced motion …) so reported but not in the id
	{ name: 'media', source: media, entropy: 4, stableForId: false }
];
