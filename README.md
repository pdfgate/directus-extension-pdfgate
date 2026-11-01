# @pdfgate/directus-extension-pdfgate

Generate PDFs from HTML or a URL inside Directus Flows with the [PDFGate HTML to PDF API](https://pdfgate.com/api/html-to-pdf).

This extension adds a **PDFGate: Generate PDF** operation to Directus Flows. Point it at a public URL or pass HTML built from your Flow data, and it returns a stored PDF document with an optional download link. Use it for invoices, reports, contracts, certificates and any other document your Directus data describes.

The extension runs in the Directus extension sandbox, so it installs from the Marketplace on any Directus project without changing the `MARKETPLACE_TRUST` setting. It only talks to `api.pdfgate.com` and `api-sandbox.pdfgate.com`.

## Installation

### From the Marketplace

In Directus, open **Settings → Marketplace**, search for **PDFGate** and click **Install**.

### With npm (self-hosted)

```bash
npm install @pdfgate/directus-extension-pdfgate
```

Then restart Directus. See the [Directus documentation](https://directus.com/docs/self-hosting/including-extensions) for details on including extensions in self-hosted projects.

## Requirements

- Directus 10.10 or newer.
- A PDFGate API key. Create one in the [PDFGate dashboard](https://dashboard.pdfgate.com) under **Settings**.
  - Keys starting with `test_` use the sandbox API at `https://api-sandbox.pdfgate.com`. Sandbox requests are meant for testing and are not charged on a paid PDFGate plan.
  - Keys starting with `live_` use the production API at `https://api.pdfgate.com`.

The operation picks the API host from the key prefix.

## Usage

1. Create a Flow with any trigger, for example **Event Hook** on `items.create` of your `invoices` collection, or a **Webhook** trigger.
2. Add the **PDFGate: Generate PDF** operation.
3. Paste your API key and set either **URL** or **HTML Content**. Both fields accept Flow data, so you can write HTML such as:

```html
<html>
  <body>
    <h1>Invoice {{ $trigger.payload.number }}</h1>
    <p>Total: {{ $trigger.payload.total }} EUR</p>
  </body>
</html>
```

4. Set **Pre-Signed URL Expiry** if you want a `fileUrl` in the response, for example to email the PDF or store the link on the item.
5. Chain further operations. The response is available to later operations as `{{ $last }}` or under the operation key, for example `{{ generate_pdf.fileUrl }}`.

### Options

| Option | Description |
| --- | --- |
| PDFGate API Key | Required. `test_` keys use the sandbox, `live_` keys use production. |
| URL | Public URL to render. Required when HTML Content is empty. |
| HTML Content | Raw HTML to render. Required when URL is empty. |
| Page Size | `a0` to `a6`, `ledger`, `tabloid`, `legal` or `letter`. Default `a4`. |
| Orientation | `portrait` or `landscape`. |
| Print Backgrounds | Include background colours and images. |
| Enable Fillable Form Fields | Turn HTML inputs into interactive PDF form fields. See the [form field reference](https://pdfgate.com/documentation/pdf-fillable-form-fields). |
| Header HTML, Footer HTML | Rendered on every page. Set the matching margin so they have room. |
| Margin Top, Bottom, Left, Right | CSS lengths such as `20px`, `1cm` or `0.5in`. |
| Pre-Signed URL Expiry | Seconds the returned `fileUrl` stays valid, between `60` and `86400`. Requires document storage to be enabled in the PDFGate dashboard. |
| Emulate Media Type | `screen` or `print`. |
| Wait For CSS Selector | Selector that must appear before capture. |
| Render Delay | Extra wait in milliseconds before capture, up to `20000`. |
| Page Scale | Between `0.1` and `2`. |
| Metadata | JSON object stored with the document and returned on later reads. |
| Additional Options | JSON object with any other [Generate PDF parameter](https://pdfgate.com/documentation/generate-pdf), for example `css`, `javascript`, `timeout`, `pageRanges`, `viewport` or `httpHeaders`. |

### Response

The operation resolves with the PDFGate document object:

```json
{
  "id": "6ae6e3dfa7feda8dd17ced98",
  "status": "completed",
  "type": "from_html",
  "size": 13181,
  "metadata": { "source": "directus" },
  "fileUrl": "https://api.pdfgate.com/file/open/...",
  "createdAt": "2026-11-01T07:01:51.456Z",
  "expiresAt": "2027-02-01T07:01:51.456Z"
}
```

`fileUrl` is only present when **Pre-Signed URL Expiry** is set. The `id` can be used with the other PDFGate API endpoints to compress, watermark, protect, flatten or e-sign the document.

### Errors

The operation rejects when a required option is missing or when PDFGate returns an error, with a message that names the HTTP status and the likely cause. Connect the operation's reject path to a **Log to Console** or **Send Notification** operation to see it.

## Development

```bash
npm install
npm run dev      # rebuild on change
npm run build    # production build into dist/
npm run validate # check the extension manifest
```

To test locally, mount the project folder into a Directus container under `/directus/extensions/directus-extension-pdfgate` and create a Flow with the operation.

## License

MIT
