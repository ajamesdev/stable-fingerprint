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

/** Navigator platform and user-agent details, including UA-CH when available. */
export function platform(): SignalValue {
	const nav = navigator;
	const result: Record<string, SignalValue> = {
		platform: nav.platform ?? '',
		userAgent: nav.userAgent ?? '',
		vendor: nav.vendor ?? '',
		product: nav.product ?? ''
	};

	const uaData = (nav as Navigator & { userAgentData?: UAData }).userAgentData;
	if (uaData) {
		result.uaPlatform = uaData.platform ?? '';
		result.mobile = !!uaData.mobile;
		if (Array.isArray(uaData.brands)) {
			result.brands = uaData.brands.map((b) => `${b.brand} ${b.version}`).sort();
		}
	}

	return result;
}
