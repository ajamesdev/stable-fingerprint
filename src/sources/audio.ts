import type { SignalValue } from '../types';

interface WebkitWindow {
	webkitOfflineAudioContext?: typeof OfflineAudioContext;
}

/** Audio fingerprint: render a fixed tone through a compressor offline (nothing
 * plays) and sum the tail. The DSP output differs slightly across platforms. */
export async function audio(): Promise<SignalValue> {
	const Ctor =
		window.OfflineAudioContext ?? (window as unknown as WebkitWindow).webkitOfflineAudioContext;
	if (!Ctor) {
		throw new Error('OfflineAudioContext is unavailable');
	}

	const context = new Ctor(1, 5000, 44100);

	const oscillator = context.createOscillator();
	oscillator.type = 'triangle';
	oscillator.frequency.value = 10000;

	const compressor = context.createDynamicsCompressor();
	compressor.threshold.value = -50;
	compressor.knee.value = 40;
	compressor.ratio.value = 12;
	compressor.attack.value = 0;
	compressor.release.value = 0.25;

	oscillator.connect(compressor);
	compressor.connect(context.destination);
	oscillator.start(0);

	const buffer = await context.startRendering();
	const channel = buffer.getChannelData(0);

	// tail of the buffer, where the compressor has settled
	let acc = 0;
	for (let i = 4500; i < channel.length; i++) {
		acc += Math.abs(channel[i] ?? 0);
	}

	return acc;
}
