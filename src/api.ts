/// <reference types="@directus/extensions/api.d.ts" />
import { request } from 'directus:api';
import type { SandboxOperationConfig } from 'directus:api';

const PRODUCTION_BASE_URL = 'https://api.pdfgate.com';
const SANDBOX_BASE_URL = 'https://api-sandbox.pdfgate.com';

type Options = {
	apiKey?: string;
	url?: string;
	html?: string;
	pageSizeType?: string;
	orientation?: string;
	printBackground?: boolean;
	enableFormFields?: boolean;
	header?: string;
	footer?: string;
	marginTop?: string;
	marginBottom?: string;
	marginLeft?: string;
	marginRight?: string;
	preSignedUrlExpiresIn?: number | string;
	emulateMediaType?: string;
	waitForSelector?: string;
	delay?: number | string;
	scale?: number | string;
	metadata?: unknown;
	additionalOptions?: unknown;
};

const isBlank = (value: unknown): boolean => value === undefined || value === null || value === '';

function omitBlank(obj: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(Object.entries(obj).filter(([, value]) => !isBlank(value)));
}

function parseObject(value: unknown, label: string): Record<string, unknown> | undefined {
	if (isBlank(value)) return undefined;
	let parsed: unknown = value;
	if (typeof value === 'string') {
		try {
			parsed = JSON.parse(value);
		} catch {
			throw new Error(`${label} must be a valid JSON object.`);
		}
	}
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		throw new Error(`${label} must be a valid JSON object.`);
	}
	return parsed as Record<string, unknown>;
}

function toNumber(value: unknown, label: string, min?: number, max?: number): number | undefined {
	if (isBlank(value)) return undefined;
	const num = Number(value);
	if (Number.isNaN(num)) throw new Error(`${label} must be a number.`);
	if ((min !== undefined && num < min) || (max !== undefined && num > max)) {
		throw new Error(`${label} must be between ${min} and ${max}.`);
	}
	return num;
}

function buildRequestBody(options: Options): Record<string, unknown> {
	if (isBlank(options.url) && isBlank(options.html)) {
		throw new Error('Either URL or HTML Content must be provided.');
	}

	const body: Record<string, unknown> = {
		...parseObject(options.additionalOptions, 'Additional Options'),
		jsonResponse: true,
		...omitBlank({
			url: options.url,
			html: options.html,
			pageSizeType: options.pageSizeType,
			orientation: options.orientation,
			printBackground: options.printBackground,
			enableFormFields: options.enableFormFields,
			header: options.header,
			footer: options.footer,
			preSignedUrlExpiresIn: toNumber(options.preSignedUrlExpiresIn, 'Pre-Signed URL Expiry', 60, 86400),
			emulateMediaType: options.emulateMediaType,
			waitForSelector: options.waitForSelector,
			delay: toNumber(options.delay, 'Render Delay', 0, 20000),
			scale: toNumber(options.scale, 'Page Scale', 0.1, 2),
			metadata: parseObject(options.metadata, 'Metadata'),
		}),
	};

	const margin = omitBlank({
		top: options.marginTop,
		bottom: options.marginBottom,
		left: options.marginLeft,
		right: options.marginRight,
	});
	if (Object.keys(margin).length) body.margin = margin;

	return body;
}

function errorMessage(data: unknown): string {
	if (typeof data === 'string') return data;
	if (data && typeof data === 'object') {
		const record = data as Record<string, unknown>;
		const message = record.message ?? record.error;
		if (Array.isArray(message)) return message.join(', ');
		if (typeof message === 'string') return message;
		return JSON.stringify(data);
	}
	return '';
}

const STATUS_HINTS: Record<string, string> = {
	'400': 'PDFGate rejected the request. Check the URL, HTML and option values.',
	'401': 'PDFGate rejected the API key. Check the PDFGate API Key option.',
	'402': 'The PDFGate account has no remaining quota or an unpaid plan.',
	'403': 'The API key is not allowed to perform this operation.',
	'404': 'The requested resource was not found on PDFGate.',
	'408': 'PDFGate timed out while rendering the page. Lower the page complexity or raise the timeout option.',
	'422': 'PDFGate could not process the request. Check the option values.',
	'429': 'PDFGate rate limit reached. Retry later.',
};

function describeFailure(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	const match = message.match(/status code (\d{3})/);
	const status = match ? match[1] : undefined;
	const hint = status ? STATUS_HINTS[status] : undefined;
	if (status && hint) return `PDFGate API responded with ${status}. ${hint}`;
	if (status) return `PDFGate API responded with ${status}.`;
	return `PDFGate API request failed: ${message}`;
}

const operation: SandboxOperationConfig = {
	id: 'pdfgate-generate-pdf',
	handler: async (options: Options) => {
		const apiKey = String(options.apiKey ?? '').trim();
		if (!apiKey) throw new Error('PDFGate API Key is required.');

		const body = buildRequestBody(options);
		const baseUrl = apiKey.startsWith('test_') ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;

		let response;
		try {
			response = await request(`${baseUrl}/v1/generate/pdf`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body,
			});
		} catch (error) {
			// The sandbox request helper throws on non-2xx responses and only exposes the message.
			throw new Error(describeFailure(error));
		}

		if (response.status < 200 || response.status >= 300) {
			const detail = errorMessage(response.data);
			throw new Error(`PDFGate API responded with ${response.status} ${response.statusText}${detail ? `: ${detail}` : ''}`);
		}

		return response.data;
	},
};

export default operation;
