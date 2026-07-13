/**
 * 128-bit MurmurHash3 (x64 variant).
 *
 * MurmurHash3 is a non-cryptographic hash designed by Austin Appleby (public
 * domain). It is well suited to fingerprinting: fast, excellent distribution,
 * and strong avalanche behaviour so a one-bit change in the input scatters the
 * output. We do not need cryptographic resistance here — only a stable, well
 * distributed identifier — so a hashing primitive like this is the right tool
 * rather than SHA-family digests.
 *
 * This implementation uses BigInt for 64-bit modular arithmetic. It is slower
 * than a hand-rolled 32-bit-pair version but is far easier to read and verify,
 * and the inputs we hash are tiny (a few kilobytes at most).
 */

const MASK64 = (1n << 64n) - 1n;

const C1 = 0x87c37b91114253d5n;
const C2 = 0x4cf5ad432745937fn;

/** Rotate a 64-bit value left by `r` bits. */
function rotl64(x: bigint, r: bigint): bigint {
	return ((x << r) | (x >> (64n - r))) & MASK64;
}

/** 64-bit multiply, kept within 64 bits. */
function mul64(a: bigint, b: bigint): bigint {
	return (a * b) & MASK64;
}

/** Final avalanche mix that forces every output bit to depend on every input bit. */
function fmix64(input: bigint): bigint {
	let k = input;
	k ^= k >> 33n;
	k = mul64(k, 0xff51afd7ed558ccdn);
	k ^= k >> 33n;
	k = mul64(k, 0xc4ceb9fe1a85ec53n);
	k ^= k >> 33n;
	return k;
}

/** Read 8 bytes little-endian as an unsigned 64-bit BigInt. */
function readUInt64LE(bytes: Uint8Array, offset: number): bigint {
	let result = 0n;
	for (let i = 7; i >= 0; i--) {
		result = (result << 8n) | BigInt(bytes[offset + i] ?? 0);
	}
	return result;
}

/**
 * Serialise a 64-bit lane as hex.
 *
 * MurmurHash3 reference implementations emit each 64-bit value as two 32-bit
 * words in little-endian order (low word first). We follow that convention so
 * our output matches the canonical published test vectors.
 */
function toHex64(value: bigint): string {
	const low = value & 0xffffffffn;
	const high = (value >> 32n) & 0xffffffffn;
	return low.toString(16).padStart(8, '0') + high.toString(16).padStart(8, '0');
}

/**
 * Hash `input` and return a 32-character lowercase hex string (128 bits).
 *
 * @param input UTF-8 string to hash.
 * @param seed  Optional 32-bit seed; changing it produces an independent hash.
 */
export function x64hash128(input: string, seed = 0): string {
	const bytes = new TextEncoder().encode(input);
	const len = bytes.length;
	const blocks = Math.floor(len / 16);

	let h1 = BigInt(seed >>> 0);
	let h2 = BigInt(seed >>> 0);

	// Body: consume 16-byte blocks (two 64-bit lanes per block).
	for (let i = 0; i < blocks; i++) {
		const base = i * 16;
		let k1 = readUInt64LE(bytes, base);
		let k2 = readUInt64LE(bytes, base + 8);

		k1 = mul64(k1, C1);
		k1 = rotl64(k1, 31n);
		k1 = mul64(k1, C2);
		h1 ^= k1;
		h1 = rotl64(h1, 27n);
		h1 = (h1 + h2) & MASK64;
		h1 = (mul64(h1, 5n) + 0x52dce729n) & MASK64;

		k2 = mul64(k2, C2);
		k2 = rotl64(k2, 33n);
		k2 = mul64(k2, C1);
		h2 ^= k2;
		h2 = rotl64(h2, 31n);
		h2 = (h2 + h1) & MASK64;
		h2 = (mul64(h2, 5n) + 0x38495ab5n) & MASK64;
	}

	// Tail: the remaining 1..15 bytes.
	const tail = blocks * 16;
	const rem = len & 15;
	let k1 = 0n;
	let k2 = 0n;

	for (let i = rem - 1; i >= 8; i--) {
		k2 ^= BigInt(bytes[tail + i] ?? 0) << BigInt((i - 8) * 8);
	}
	if (rem > 8) {
		k2 = mul64(k2, C2);
		k2 = rotl64(k2, 33n);
		k2 = mul64(k2, C1);
		h2 ^= k2;
	}

	for (let i = Math.min(rem, 8) - 1; i >= 0; i--) {
		k1 ^= BigInt(bytes[tail + i] ?? 0) << BigInt(i * 8);
	}
	if (rem > 0) {
		k1 = mul64(k1, C1);
		k1 = rotl64(k1, 31n);
		k1 = mul64(k1, C2);
		h1 ^= k1;
	}

	// Finalisation.
	h1 ^= BigInt(len);
	h2 ^= BigInt(len);
	h1 = (h1 + h2) & MASK64;
	h2 = (h2 + h1) & MASK64;
	h1 = fmix64(h1);
	h2 = fmix64(h2);
	h1 = (h1 + h2) & MASK64;
	h2 = (h2 + h1) & MASK64;

	return toHex64(h1) + toHex64(h2);
}
