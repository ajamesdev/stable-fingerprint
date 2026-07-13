import type { SignalValue } from '../types';

/** Installed browser plugins and their MIME types, sorted for stability. */
export function plugins(): SignalValue {
	const list = navigator.plugins;
	if (!list) {
		return [];
	}

	const result: string[] = [];
	for (let i = 0; i < list.length; i++) {
		const plugin = list[i];
		if (!plugin) {
			continue;
		}
		const mimes: string[] = [];
		for (let j = 0; j < plugin.length; j++) {
			const mime = plugin[j];
			if (mime) {
				mimes.push(`${mime.type}~${mime.suffixes}`);
			}
		}
		result.push(`${plugin.name}::${plugin.description}::${mimes.join(',')}`);
	}

	return result.sort();
}
