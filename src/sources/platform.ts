import type { SignalValue } from '../types';

interface UABrand {
	brand: string;
	version: string;
}

interface UAData {
	platform?: string;
	mobile?: boolean;
	brands?: UABrand[];
}

/** Strip version numbers from a user-agent string so the id survives browser
 * auto-updates. "Firefox/152.0" and "Firefox/153.0" normalise to the same thing,
 * keeping the OS + browser-family structure that actually identifies a device. */
export function normalizeUserAgent(ua: string): string {
	return ua
		.replace(/\d+(?:[._]\d+)*/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Chrome's UA-CH deliberately includes a randomised "GREASE" brand to stop
 * sites depending on the list; drop it so it can't poison the id. */
function isGreaseBrand(brand: string): boolean {
	return /not.?a.?brand/i.test(brand);
}

/** Navigator platform and user-agent, normalised for stability across browser
 * updates (versions removed) and UA-CH brands reduced to their stable names. */
export function platform(): SignalValue {
	const nav = navigator;
	const result: Record<string, SignalValue> = {
		platform: nav.platform ?? '',
		vendor: nav.vendor ?? '',
		engine: nav.product ?? '',
		ua: normalizeUserAgent(nav.userAgent ?? '')
	};

	const uaData = (nav as Navigator & { userAgentData?: UAData }).userAgentData;
	if (uaData) {
		result.uaPlatform = uaData.platform ?? '';
		result.mobile = !!uaData.mobile;
		if (Array.isArray(uaData.brands)) {
			// brand names only - versions bump on every update, and GREASE is random
			result.brands = uaData.brands
				.map((b) => b.brand)
				.filter((brand) => !isGreaseBrand(brand))
				.sort();
		}
	}

	return result;
}
