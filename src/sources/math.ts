import type { SignalValue } from '../types';

/** Results of transcendental ops that differ subtly between JS engines and the
 * platform math library they bind to. Stringified to preserve full precision. */
export function math(): SignalValue {
	const ops: Record<string, number> = {
		acos: Math.acos(0.123),
		acosh: Math.acosh(1e300),
		asinh: Math.asinh(1),
		atanh: Math.atanh(0.5),
		cbrt: Math.cbrt(100),
		cosh: Math.cosh(10),
		expm1: Math.expm1(1),
		sinh: Math.sinh(1),
		tan: Math.tan(-1e300),
		tanh: Math.tanh(0.123),
		sin: Math.sin(1e12),
		cos: Math.cos(1e13),
		pow: Math.pow(Math.PI, -100)
	};

	const out: Record<string, string> = {};
	for (const key of Object.keys(ops)) {
		out[key] = String(ops[key]);
	}
	return out;
}
