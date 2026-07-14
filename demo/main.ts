import Fingerprint, { isSuccess, sources, type FingerprintResult } from 'stable-fingerprint';

const resultEl = document.getElementById('result') as HTMLElement;
const componentsSection = document.getElementById('components') as HTMLElement;
const tableBody = document.querySelector('#components-table tbody') as HTMLElement;
const signalCount = document.getElementById('signal-count') as HTMLElement;
const footerVersion = document.getElementById('footer-version') as HTMLElement;

/** Truncate and stringify a signal value for the debug table. */
function preview(value: unknown): string {
	const text = typeof value === 'string' ? value : JSON.stringify(value);
	return text.length > 140 ? `${text.slice(0, 140)}…` : text;
}

/** Map a 0..1 score to a hue from red (0) to green (120). */
function scoreHue(score: number): number {
	return Math.round(score * 120);
}

function renderResult(result: FingerprintResult, elapsedMs: number): void {
	const { visitorId, confidence } = result;
	const percent = Math.round(confidence.score * 100);
	const colour = `hsl(${scoreHue(confidence.score)} 70% 45%)`;

	const incognitoComponent = result.components['incognito'];
	const incognito =
		incognitoComponent && isSuccess(incognitoComponent)
			? (incognitoComponent.value as { incognito: boolean | null }).incognito
			: null;
	const badgeBase = 'rounded-full px-2 py-0.5 text-xs font-semibold';
	const incognitoBadge =
		incognito === true
			? `<span class="${badgeBase} bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">incognito detected</span>`
			: incognito === false
				? `<span class="${badgeBase} bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">normal window</span>`
				: '';

	resultEl.removeAttribute('aria-busy');
	resultEl.innerHTML = `
		<div class="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
			Visitor ID ${incognitoBadge}
		</div>
		<div class="mt-2 mb-6 flex items-center gap-3">
			<code id="visitor-id" class="break-all font-mono text-xl font-semibold text-blue-600 sm:text-2xl dark:text-blue-400">${visitorId}</code>
			<button id="copy" title="Copy" class="shrink-0 cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:border-blue-500 dark:border-neutral-700">Copy</button>
		</div>
		<div>
			<div class="mb-1.5 flex justify-between text-sm">
				<span>Confidence</span>
				<span class="font-mono font-bold" style="color: ${colour}">${percent}%</span>
			</div>
			<div class="h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
				<div class="h-full rounded-full transition-[width] duration-500" style="width:${percent}%; background: ${colour}"></div>
			</div>
			<div class="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">${confidence.comment}</div>
		</div>
		<div class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">${Object.keys(result.components).length} signals in ${elapsedMs} ms</div>
	`;

	const copyButton = document.getElementById('copy') as HTMLButtonElement;
	copyButton.addEventListener('click', async () => {
		await navigator.clipboard.writeText(visitorId);
		copyButton.textContent = 'Copied';
		setTimeout(() => (copyButton.textContent = 'Copy'), 1200);
	});
}

function renderComponents(result: FingerprintResult): void {
	// registry order, so id-relevant signals lead and the table is stable
	const rows = sources
		.map((definition) => {
			const component = result.components[definition.name];
			if (!component) return '';
			const ok = isSuccess(component);
			const value = ok
				? preview(component.value)
				: `<span class="text-red-500">${(component as { error: string }).error}</span>`;
			return `
				<tr class="border-b border-neutral-100 align-top dark:border-neutral-800/70">
					<td class="whitespace-nowrap p-3 font-mono ${ok ? '' : 'text-orange-500'}">${definition.name}</td>
					<td class="wrap-break-word p-3 font-mono text-neutral-500 dark:text-neutral-400">${value}</td>
					<td class="p-3 text-right tabular-nums text-neutral-500">${component.duration}</td>
				</tr>`;
		})
		.join('');

	tableBody.innerHTML = rows;
	signalCount.textContent = `(${sources.length})`;
	componentsSection.classList.remove('hidden');

	const copyJson = document.getElementById('copy-json') as HTMLButtonElement;
	copyJson.addEventListener('click', async () => {
		await navigator.clipboard.writeText(JSON.stringify(result.components, null, 2));
		copyJson.textContent = 'Copied';
		setTimeout(() => (copyJson.textContent = 'Copy debug JSON'), 1200);
	});
}

async function main(): Promise<void> {
	try {
		const start = performance.now();
		const agent = await Fingerprint.load();
		const result = await agent.get();
		const elapsed = Math.round(performance.now() - start);

		footerVersion.textContent = `stable-fingerprint v${result.version}`;
		renderResult(result, elapsed);
		renderComponents(result);
	} catch (error) {
		resultEl.removeAttribute('aria-busy');
		resultEl.innerHTML = `<div class="text-red-500">Failed to compute fingerprint: ${String(error)}</div>`;
	}
}

void main();
