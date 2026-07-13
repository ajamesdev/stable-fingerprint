import { x64hash128 } from '../hash/x64hash';
import type { SignalValue } from '../types';

/** Canvas fingerprint: draw text + shapes and hash the pixels. Identical draw
 * calls rasterise differently per GPU/driver/OS/font. */
export function canvas(): SignalValue {
	const element = document.createElement('canvas');
	const context = element.getContext('2d');
	if (!context) {
		throw new Error('2D canvas context is unavailable');
	}

	element.width = 240;
	element.height = 60;

	// winding rule support varies between engines
	context.rect(0, 0, 10, 10);
	context.rect(2, 2, 6, 6);
	const supportsWinding = context.isPointInPath(5, 5, 'evenodd') === false;

	// text: fonts + emoji
	context.textBaseline = 'alphabetic';
	context.fillStyle = '#f60';
	context.fillRect(100, 1, 62, 20);
	context.fillStyle = '#069';
	context.font = '11pt "Arial"';
	context.fillText('Fingerprint \u{1F512} 0123', 2, 15);
	context.fillStyle = 'rgba(102, 204, 0, 0.7)';
	context.font = '18pt "Arial"';
	context.fillText('Fingerprint \u{1F512} 0123', 4, 45);
	const textHash = x64hash128(element.toDataURL());

	// geometry: gradients, blending, curves
	context.globalCompositeOperation = 'multiply';
	const shapes: Array<[string, number, number]> = [
		['#f0f', 40, 40],
		['#0ff', 80, 40],
		['#ff0', 60, 80]
	];
	for (const [colour, cx, cy] of shapes) {
		context.fillStyle = colour;
		context.beginPath();
		context.arc(cx, cy, 40, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	}
	context.fillStyle = '#f9c';
	context.arc(60, 60, 60, 0, Math.PI * 2, true);
	context.arc(60, 60, 20, 0, Math.PI * 2, true);
	context.fill('evenodd');
	const geometryHash = x64hash128(element.toDataURL());

	return {
		winding: supportsWinding,
		text: textHash,
		geometry: geometryHash
	};
}
