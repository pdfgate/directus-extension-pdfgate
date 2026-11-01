import { defineOperationApp } from '@directus/extensions-sdk';

const PAGE_SIZE_OPTIONS = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'ledger', 'tabloid', 'legal', 'letter'];
const ORIENTATION_OPTIONS = ['portrait', 'landscape'];
const MEDIA_TYPE_OPTIONS = ['screen', 'print'];

const choices = (values: string[]) => values.map((value) => ({ text: value, value }));

export default defineOperationApp({
	id: 'pdfgate-generate-pdf',
	name: 'PDFGate: Generate PDF',
	icon: 'picture_as_pdf',
	description: 'Render a PDF from a URL or HTML with the PDFGate API.',
	overview: ({ url, html, pageSizeType, orientation }) => [
		{
			label: 'Source',
			text: url ? String(url) : html ? 'HTML content' : 'Not set',
		},
		{
			label: 'Page',
			text: `${pageSizeType || 'a4'} ${orientation || 'portrait'}`,
		},
	],
	options: [
		{
			field: 'apiKey',
			name: 'PDFGate API Key',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				required: true,
				options: {
					masked: true,
					placeholder: 'live_... or test_...',
				},
				note: 'Create a key in the PDFGate dashboard. Keys starting with `test_` use the sandbox API for testing, keys starting with `live_` use the production API.',
			},
		},
		{
			field: 'url',
			name: 'URL',
			type: 'string',
			meta: {
				width: 'full',
				interface: 'input',
				options: {
					placeholder: 'https://example.com/invoices/123',
				},
				note: 'Public URL whose rendered content is converted to PDF. Required when HTML Content is empty.',
			},
		},
		{
			field: 'html',
			name: 'HTML Content',
			type: 'text',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'htmlmixed',
					placeholder: '<html><body><h1>Invoice #123</h1></body></html>',
				},
				note: 'Raw HTML converted to PDF. Required when URL is empty. Supports Flow data like `{{ $trigger.payload.html }}`.',
			},
		},
		{
			field: 'pageSizeType',
			name: 'Page Size',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: choices(PAGE_SIZE_OPTIONS),
					allowNone: true,
					placeholder: 'a4',
				},
			},
		},
		{
			field: 'orientation',
			name: 'Orientation',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: choices(ORIENTATION_OPTIONS),
					allowNone: true,
					placeholder: 'portrait',
				},
			},
		},
		{
			field: 'printBackground',
			name: 'Print Backgrounds',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Include background colours and images',
				},
			},
		},
		{
			field: 'enableFormFields',
			name: 'Enable Fillable Form Fields',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: 'Turn HTML inputs into PDF form fields',
				},
			},
		},
		{
			field: 'header',
			name: 'Header HTML',
			type: 'text',
			meta: {
				width: 'half',
				interface: 'input-code',
				options: {
					language: 'htmlmixed',
					placeholder: '<div style="font-size:10px">Acme Inc.</div>',
				},
				note: 'Rendered on every page. Set Margin Top so the header has room.',
			},
		},
		{
			field: 'footer',
			name: 'Footer HTML',
			type: 'text',
			meta: {
				width: 'half',
				interface: 'input-code',
				options: {
					language: 'htmlmixed',
					placeholder: '<div style="font-size:10px">Page <span class="pageNumber"></span></div>',
				},
				note: 'Rendered on every page. Set Margin Bottom so the footer has room.',
			},
		},
		{
			field: 'marginTop',
			name: 'Margin Top',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: { placeholder: '20px' },
			},
		},
		{
			field: 'marginBottom',
			name: 'Margin Bottom',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: { placeholder: '20px' },
			},
		},
		{
			field: 'marginLeft',
			name: 'Margin Left',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: { placeholder: '20px' },
			},
		},
		{
			field: 'marginRight',
			name: 'Margin Right',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: { placeholder: '20px' },
			},
		},
		{
			field: 'preSignedUrlExpiresIn',
			name: 'Pre-Signed URL Expiry (seconds)',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: '3600',
					min: 60,
					max: 86400,
				},
				note: 'Set it to receive a `fileUrl` download link in the response. Requires document storage to be enabled in the PDFGate dashboard.',
			},
		},
		{
			field: 'emulateMediaType',
			name: 'Emulate Media Type',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'select-dropdown',
				options: {
					choices: choices(MEDIA_TYPE_OPTIONS),
					allowNone: true,
				},
			},
		},
		{
			field: 'waitForSelector',
			name: 'Wait For CSS Selector',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: { placeholder: '#invoice-total' },
				note: 'Selector that must appear before capture.',
			},
		},
		{
			field: 'delay',
			name: 'Render Delay (milliseconds)',
			type: 'integer',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: '2000',
					min: 0,
					max: 20000,
				},
			},
		},
		{
			field: 'scale',
			name: 'Page Scale',
			type: 'float',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: '1',
					min: 0.1,
					max: 2,
					step: 0.1,
				},
			},
		},
		{
			field: 'metadata',
			name: 'Metadata',
			type: 'json',
			meta: {
				width: 'half',
				interface: 'input-code',
				options: {
					language: 'json',
					placeholder: '{"customerId": "123"}',
				},
				note: 'Key-value pairs stored with the document.',
			},
		},
		{
			field: 'additionalOptions',
			name: 'Additional Options',
			type: 'json',
			meta: {
				width: 'full',
				interface: 'input-code',
				options: {
					language: 'json',
					placeholder: '{"css": ".no-print { display: none; }", "timeout": 60000}',
				},
				note: 'Any other Generate PDF parameter as JSON, merged into the request. See https://pdfgate.com/documentation/generate-pdf',
			},
		},
	],
});
