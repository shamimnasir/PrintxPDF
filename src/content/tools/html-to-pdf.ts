import type { ToolContent } from './types'

export const htmlToPdf: ToolContent = {
  slug: 'html-to-pdf',
  answer:
    'HTML to PDF turns a web page file (.html), or code you paste into the box, into an A4 or Letter PDF in your browser. The page is laid out with the same clean paper styling as the PrintxPDF web page printer, ready to send or print. Nothing is uploaded.',
  whatHeading: 'What are HTML and PDF?',
  what: [
    {
      term: 'HTML: the code behind a web page',
      definition:
        'HTML is the plain-text code every web page is written in. Simple labels in the code say which part is a heading, a paragraph, a table or a picture, and the browser draws the page from them. A web page has no page size and no page breaks of its own; it just scrolls. Turning it into a document means deciding where each sheet of paper begins and ends.',
    },
    {
      term: 'PDF: fixed pages that print the same everywhere',
      definition:
        'A PDF is the opposite of a web page: fixed pages, fixed positions, and the same result on every screen and printer. That is why invoices, reports and saved articles end up as PDF. Converting HTML to PDF takes content that flows and commits it to numbered pages of a known size, ready to print, attach or file away.',
    },
  ],
  whyHeading: 'Why convert HTML to PDF?',
  why: [
    { h: 'Turn generated code into a document', x: 'Invoices, reports and email templates are often produced as HTML. A PDF is what the customer, the accountant and the archive actually want.' },
    { h: 'Print with sensible margins', x: 'Browser print dialogs add headers, footers and odd scaling. This tool lays the content out on clean A4 or Letter pages with readable margins and nothing extra.' },
    { h: 'Paste, do not save', x: 'You do not need a file. Paste a piece of HTML straight into the box and run the conversion, handy for snippets from a website editor, an email or a code editor.' },
    { h: 'Nothing leaves your browser', x: 'The code is cleaned of anything that could run and drawn in a hidden area inside the tab. Internal documents and unpublished drafts are never uploaded.' },
  ],
  howHeading: 'How to convert HTML to PDF, step by step',
  how: [
    { h: 'Open HTML to PDF and add your page', x: 'Drop an .html or .htm file onto the drop zone, or paste HTML code into the **...or paste HTML here** box above it. A file takes priority if you provide both.' },
    { h: 'Choose the page size', x: 'Under **Options**, set **Page size** to A4 or Letter. Content flows onto as many pages as it needs.' },
    { h: 'Run HTML to PDF', x: 'Click **Run HTML to PDF**. The code is cleaned of scripts, style sheets and embedded frames, laid out on paper-sized pages and drawn.' },
    { h: 'Download and check', x: 'The PDF downloads automatically, named after the file (or `document.pdf` for pasted code). Use **Open in a new tab** to check page breaks before sending.' },
  ],
  faqs: [
    { q: 'Will my styling be applied?', a: 'Styling written directly on an element (the `style` attribute) is kept. Style sheets, whether inside the file or linked, are removed for safety, and scripts never run. The tool applies its own readable fonts and spacing, so a page keeps its structure (headings, lists, tables, pictures) but not a custom design.' },
    { q: 'Will pictures in the HTML show up?', a: 'Pictures with a full `https://` web address load if the site that hosts them allows it. Pictures with a short relative path cannot be found, because there is no website around the file. Pictures embedded directly in the code as data always work.' },
    { q: 'Can I select text in the resulting PDF?', a: 'No. The laid-out page is turned into a picture before it is placed in the PDF, so the text cannot be selected and links cannot be clicked. If you need a searchable copy, run the file through [OCR PDF](/tools/ocr-pdf), which turns a picture of text back into real text.' },
    { q: 'Can I convert a live web page by address?', a: 'This tool takes a file or pasted code, not a web address. To save a live web page, open it in your browser, choose Save Page As and save the complete HTML, or copy the page source and paste it into the box.' },
    { q: 'Is anything uploaded?', a: 'No. Cleaning, layout and drawing all happen in your browser tab, with no server involved. There is no account, no queue and no copy of your code anywhere but your own computer.' },
  ],
  entities: ['HTML', 'Web page', 'CSS', 'PDF', 'A4', 'Letter'],
  keywords: ['html to pdf', 'convert html to pdf free', 'html file to pdf', 'html to pdf online', 'html to pdf converter', 'save html as pdf', 'html to pdf a4'],
  metaTitle: 'HTML to PDF: Convert HTML Files or Pasted Code to PDF Free',
  metaDescription: 'Convert HTML to PDF in your browser. Drop an .html file or paste the code, pick A4 or Letter, and download clean pages. Free, no sign-up, nothing uploaded.',
}
