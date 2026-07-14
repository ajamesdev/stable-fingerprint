import type { SignalValue } from '../types';

const BASE_FONTS = ['monospace', 'sans-serif', 'serif'] as const;

/** Cross-platform mix; the installed subset is what differs between machines. */
const PROBE_FONTS = [
	'Arial',
	'Arial Black',
	'Calibri',
	'Cambria',
	'Comic Sans MS',
	'Consolas',
	'Courier New',
	'Georgia',
	'Helvetica Neue',
	'Impact',
	'Lucida Console',
	'Menlo',
	'Monaco',
	'Palatino',
	'Segoe UI',
	'Tahoma',
	'Times New Roman',
	'Trebuchet MS',
	'Ubuntu',
	'Verdana'
] as const;

const TEST_STRING = 'mmmmmmmmmmlli';
const TEST_SIZE = '72px';

/** Installed-font detection: measure a string in each generic fallback, then as
 * `"<font>", <fallback>` - installed fonts shift the metrics, others don't. */
export function fonts(): SignalValue {
	const body = document.body;
	if (!body) {
		throw new Error('document.body is unavailable');
	}

	const holder = document.createElement('div');
	holder.style.position = 'absolute';
	holder.style.left = '-9999px';
	holder.style.visibility = 'hidden';
	body.appendChild(holder);

	const makeSpan = (fontFamily: string): HTMLSpanElement => {
		const span = document.createElement('span');
		span.style.position = 'absolute';
		span.style.fontSize = TEST_SIZE;
		span.style.fontFamily = fontFamily;
		span.textContent = TEST_STRING;
		holder.appendChild(span);
		return span;
	};

	try {
		const baseline: Record<string, { width: number; height: number }> = {};
		for (const base of BASE_FONTS) {
			const span = makeSpan(base);
			baseline[base] = { width: span.offsetWidth, height: span.offsetHeight };
		}

		const detected: string[] = [];
		for (const font of PROBE_FONTS) {
			const shifted = BASE_FONTS.some((base) => {
				const span = makeSpan(`"${font}", ${base}`);
				const ref = baseline[base];
				return (
					!!ref && (span.offsetWidth !== ref.width || span.offsetHeight !== ref.height)
				);
			});
			if (shifted) {
				detected.push(font);
			}
		}

		return detected;
	} finally {
		body.removeChild(holder);
	}
}
