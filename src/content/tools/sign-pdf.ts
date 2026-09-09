import type { ToolContent } from './types'

export const signPdf: ToolContent = {
  slug: 'sign-pdf',
  answer:
    'Sign PDF lets you draw, type or upload a signature, place it on any page, add today\'s date and download the signed file. It runs in your browser, so the document is never uploaded. The result is an electronic signature drawn into the page, not a certificate-based digital signature.',
  whatHeading: 'What is an electronic signature?',
  what: [
    {
      term: 'What is an electronic signature?',
      definition:
        'An electronic signature is any mark you make electronically to show you agree to a document: a drawn scribble, your typed name in a script font, or an image of your wet-ink signature. Under the US **ESIGN Act** and the EU **eIDAS** regulation, a simple electronic signature is legally recognised for most everyday agreements. This tool places that mark as an image in the page content of your PDF.',
    },
    {
      term: 'How is it different from a digital signature?',
      definition:
        'A digital signature is cryptographic: a certificate issued to you signs a hash of the file, and any later change breaks the seal. Standards such as **PAdES** define how that works inside a PDF. It proves who signed and that nothing changed since. This tool does not do that. It gives you a visible signature, which is what most leases, offer letters, consent forms and invoices ask for, but not a certificate or tamper seal.',
    },
  ],
  whyHeading: 'Why sign a PDF electronically?',
  why: [
    { h: 'Sign in a minute, from anywhere', x: 'No printer, no scanner, no app. Drop the file, draw with a mouse, finger or stylus, click once to place, and the signed PDF downloads.' },
    { h: 'Legally acceptable for most agreements', x: 'Simple electronic signatures are recognised under ESIGN, UETA and eIDAS for the vast majority of commercial and personal documents. If the other side sent a PDF and asked you to sign, this is usually all they need.' },
    { h: 'Your document stays private', x: 'The PDF and your signature are processed in the browser. Nothing is uploaded, and nothing is kept once you close the tab unless you choose to save a signature.' },
    { h: 'Place it exactly where it belongs', x: 'Click anywhere on the page to drop the signature, drag it to move, pull the corner to resize, and add as many as you need across pages, plus a date stamp beside it.' },
    { h: 'Reuse the same signature', x: 'Sign in and click Save signature to keep a drawn or typed version for the next document, so every file carries the same mark.' },
  ],
  howHeading: 'How to sign a PDF, step by step',
  how: [
    { h: 'Open Sign PDF and drop the file', x: 'Drop the PDF you need to sign. The first page renders; use the arrows above it to reach the page with the signature line.' },
    { h: 'Create your signature', x: 'Pick a tab: draw on the pad (Clear to start over), type your name and choose a script font, upload a PNG, JPEG or WebP of your handwritten signature, or pick a saved one.' },
    { h: 'Click the page to place it', x: 'Click where the signature should sit. Drag it to adjust, use the corner handle to resize, and the cross to remove it. Repeat on other pages if needed.' },
    { h: 'Add a date stamp', x: 'Click Insert today\'s date to drop the current date near the bottom right, then drag it next to your signature.' },
    { h: 'Click Sign & download', x: 'The button shows how many items you placed. The signed PDF downloads as `name-signed.pdf` with everything drawn into the pages.' },
  ],
  faqs: [
    {
      q: 'Is a drawn signature legally binding?',
      a: 'Generally yes. ESIGN and UETA in the US and eIDAS in the EU treat a simple electronic signature, drawn or typed, as valid for most contracts, forms and letters. Some documents, such as wills, certain property deeds and court filings, require a witnessed, notarised or certificate-based signature; check the rule for your document.',
    },
    {
      q: 'Does Sign PDF add a digital certificate?',
      a: 'No. It embeds your signature as an image in the page content. There is no certificate, no timestamp authority and no cryptographic seal, so a viewer will not show a signature-valid panel. For a certificate-based signature you need a PAdES-capable tool and an identity certificate.',
    },
    {
      q: 'Can someone remove my signature afterwards?',
      a: 'The signature is drawn into the page itself, not attached as a removable annotation, so it cannot be deleted with a click. Like any plain PDF content it can still be edited by someone determined. If tamper evidence matters, keep your own copy and consider a certificate-based signature.',
    },
    {
      q: 'Can I sign a PDF on my phone?',
      a: 'Yes. The drawing pad responds to touch, so you can sign with a finger or stylus in mobile Safari or Chrome, tap the page to place it and download the result. Typing your name is often quicker on a small screen.',
    },
    {
      q: 'Where are saved signatures stored?',
      a: 'Saved signatures are kept in your browser\'s local storage on the device you are using, tied to your signed-in account. They are not uploaded to a server. Clearing site data or switching browsers removes them.',
    },
  ],
  entities: ['Electronic signature', 'Digital signature', 'ESIGN Act', 'eIDAS', 'PAdES', 'UETA', 'Signature image'],
  keywords: ['sign pdf', 'sign pdf free', 'electronic signature pdf', 'draw signature on pdf', 'add signature to pdf online', 'esign pdf without upload', 'sign pdf on phone'],
  metaTitle: 'Sign PDF Free: Draw or Type an Electronic Signature',
  metaDescription: 'Sign PDF free: draw, type or upload your signature, place it on any page, add a date and download. Runs in your browser, no upload, no account needed.',
}
