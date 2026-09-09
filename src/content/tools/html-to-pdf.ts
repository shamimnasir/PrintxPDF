import type { ToolContent } from './types'

export const htmlToPdf: ToolContent = {
  slug: 'html-to-pdf',
  answer:
    'HTML to PDF turns an .html file, or markup you paste into the box, into an A4 or Letter PDF in your browser. The page is laid out with the same clean paper styling as the PrintxPDF web-page printer, ready to send or print. Nothing is uploaded.',
  whatHeading: 'What are HTML and PDF?',
  what: [
    {
      term: 'What is HTML?',
      definition:
        'HTML (HyperText Markup Language) is the plain-text language web pages are written in, maintained today as the WHATWG living standard. Tags such as `<h1>`, `<p>`, `<table>` and `<img>` describe the structure of a page; CSS describes how it looks; JavaScript adds behaviour. HTML has no page size or page breaks of its own, so turning it into a document means deciding where each sheet begins and ends.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) is the opposite of a web page: fixed pages, fixed positions, identical output on every screen and printer. That is why invoices, reports and saved articles end up as PDF. Converting HTML to PDF takes flowing content and commits it to numbered pages of a known size, ready to print, attach or archive.',
    },
  ],
  whyHeading: 'Why convert HTML to PDF?',
  why: [
    { h: 'Turn generated markup into a document', x: 'Invoices, reports and email templates are often produced as HTML. A PDF is what the customer, the accountant and the archive actually want.' },
    { h: 'Print with sensible margins', x: 'Browser print dialogs add headers, footers and odd scaling. This tool lays the content out on clean A4 or Letter pages with readable margins and nothing extra.' },
    { h: 'Paste, do not save', x: 'You do not need a file. Paste a fragment of HTML straight into the box and run the conversion, handy for snippets from a CMS, an email or a code editor.' },
    { h: 'Nothing leaves your browser', x: 'The markup is sanitised and rendered in a hidden frame inside the tab. Internal documents and unpublished drafts are never uploaded.' },
  ],
  howHeading: 'How to convert HTML to PDF, step by step',
  how: [
    { h: 'Open HTML to PDF and add your markup', x: 'Drop an .html or .htm file onto the drop zone, or paste HTML into the **...or paste HTML here** box above it. A file takes priority if you provide both.' },
    { h: 'Choose the page size', x: 'Under **Options**, set **Page size** to A4 or Letter. Content flows onto as many pages as it needs.' },
    { h: 'Run HTML to PDF', x: 'Click **Run HTML to PDF**. The markup is cleaned of scripts, styles and frames, laid out on paper-sized pages and rendered.' },
    { h: 'Download and check', x: 'The PDF downloads automatically, named after the file (or `document.pdf` for pasted markup). Use **Open in a new tab** to check page breaks before sending.' },
  ],
  faqs: [
    { q: 'Will my CSS be applied?', a: 'Inline `style` attributes on elements are kept. `<style>` blocks and linked stylesheets are removed for safety, and scripts never run. The tool applies its own readable typography, so a page keeps its structure (headings, lists, tables, images) but not a bespoke design.' },
    { q: 'Will images in the HTML show up?', a: 'Images with a full `https://` URL load if the hosting server allows cross-origin requests; images with relative paths cannot be found, because there is no website around the file. Images embedded as data URIs always work.' },
    { q: 'Can I select text in the resulting PDF?', a: 'No. The laid-out page is rendered to an image before it is placed in the PDF, so the text is not selectable and links are not clickable. Run the file through [OCR PDF](/tools/ocr-pdf) if you need a searchable copy.' },
    { q: 'Can I convert a live web page by URL?', a: 'This tool takes a file or pasted markup, not a URL. To save a web page, open it in your browser, choose Save Page As and save the complete HTML, or copy the page source and paste it into the box.' },
    { q: 'Is anything uploaded?', a: 'No. Sanitising, layout and rendering all happen in your browser tab, with no server involved. There is no account, no queue and no copy of your markup anywhere but your own computer.' },
  ],
  entities: ['HTML', 'WHATWG', 'CSS', 'PDF', 'ISO 32000', 'html2canvas', 'DOMPurify'],
  keywords: ['html to pdf', 'convert html to pdf free', 'html file to pdf', 'html to pdf online', 'html to pdf converter', 'save html as pdf', 'html to pdf a4'],
  metaTitle: 'HTML to PDF: Convert HTML Files or Markup to PDF Free',
  metaDescription: 'Convert HTML to PDF in your browser. Drop an .html file or paste markup, pick A4 or Letter, and download clean pages. Free, no sign-up, nothing uploaded.',
}
