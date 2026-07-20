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

/** Ordered registry - the id is built from the `core` components in this order,
 * so new sources are appended. `entropy` feeds the confidence score; `role` gates
 * whether a signal is part of the id (see {@link SourceRole}). */
export const sources: SourceDefinition[] = [
	// randomized/spoofed by privacy browsers, so kept out of the id and used only
	// to boost confidence. Firefox private mode randomizes canvas/WebGL/audio and
	// under-reports hardwareConcurrency, so `hardware` lives here too.
	{ name: 'canvas', source: canvas, entropy: 10, role: 'volatile' },
	{ name: 'webgl', source: webgl, entropy: 10, role: 'volatile' },
	{ name: 'audio', source: audio, entropy: 6, role: 'volatile' },
	{ name: 'hardware', source: hardware, entropy: 4, role: 'volatile' },
	// randomization-proof signals that form the stable id
	{ name: 'fonts', source: fonts, entropy: 6, role: 'core' },
	{ name: 'screen', source: screen, entropy: 4, role: 'core' },
	{ name: 'timezone', source: timezone, entropy: 6, role: 'core' },
	{ name: 'languages', source: languages, entropy: 4, role: 'core' },
	{ name: 'platform', source: platform, entropy: 8, role: 'core' },
	{ name: 'plugins', source: plugins, entropy: 3, role: 'core' },
	{ name: 'math', source: math, entropy: 3, role: 'core' },
	// reported diagnostics only - never part of the id
	{ name: 'media', source: media, entropy: 4, role: 'report' }
];
