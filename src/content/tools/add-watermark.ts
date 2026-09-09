import type { ToolContent } from './types'

export const addWatermark: ToolContent = {
  slug: 'add-watermark',
  answer:
    'Add Watermark stamps text such as CONFIDENTIAL or DRAFT across the pages of a PDF. Choose the position, font size, opacity, rotation, colour and which pages to mark, then download the result. It runs in your browser, so the file is never uploaded, and it is free.',
  whatHeading: 'What is a PDF watermark?',
  what: [
    {
      term: 'What is a PDF watermark?',
      definition:
        'A watermark is text or an image laid over the content of a page to label it: a status such as DRAFT, a warning such as CONFIDENTIAL, or an owner\'s name. In a PDF it is drawn into the page\'s **content stream**, so it prints, appears in every viewer and travels with the file. This tool adds text watermarks in bold Helvetica; it does not add logos or images.',
    },
    {
      term: 'How is a watermark different from a stamp annotation?',
      definition:
        'A stamp annotation sits on top of the page as a separate object that a viewer can hide or delete. A watermark drawn into the content stream is part of the page itself. That makes it far harder to strip, which is the point when the label is meant to survive forwarding. Keep the unmarked original if you will need a clean copy later.',
    },
  ],
  whyHeading: 'Why add a watermark to a PDF?',
  why: [
    { h: 'Stop drafts being mistaken for finals', x: 'A diagonal DRAFT across every page removes any doubt about which version someone is reading, before it gets signed or quoted.' },
    { h: 'Label confidential material', x: 'A CONFIDENTIAL or INTERNAL mark reminds everyone who opens the file how it may be shared, and supports a confidentiality claim if it leaks.' },
    { h: 'Trace copies', x: 'Put the recipient\'s name or a copy number in the watermark and each copy is identifiable, which discourages unauthorised forwarding.' },
    { h: 'Protect samples and proofs', x: 'Send a client a proof marked SAMPLE or NOT FOR DISTRIBUTION and keep the clean version until the work is approved.' },
    { h: 'Nothing is uploaded', x: 'The stamping happens in your browser. Sensitive papers are the ones that need marking, and they stay on your machine.' },
  ],
  howHeading: 'How to add a watermark to a PDF, step by step',
  how: [
    { h: 'Open Add Watermark and drop your PDF', x: 'Drop one PDF. The options appear on the right.' },
    { h: 'Type the text', x: 'The default is CONFIDENTIAL. Replace it with DRAFT, SAMPLE, a name or anything else.' },
    { h: 'Choose position and style', x: 'Position: Center, Tiled, Top or Bottom. Then set Font size (12 to 160), Opacity (5% to 100%), Rotation (-90 to 90 degrees) and Color: Grey, Red, Blue or Black.' },
    { h: 'Pick the pages', x: 'Leave Pages blank to mark every page, or enter ranges such as `1, 3-5`.' },
    { h: 'Click Run Add Watermark', x: 'The stamped file downloads as `name-watermarked.pdf`.' },
  ],
  faqs: [
    {
      q: 'Can I remove the watermark later?',
      a: 'Not with this tool. The text is drawn into the page content, so it is part of the page rather than a removable layer. Keep your unmarked original. If you only need to hide it on some pages, [Redact PDF](/tools/redact-pdf) can cover it, at the cost of rasterising those pages.',
    },
    {
      q: 'Can I watermark with a logo or image?',
      a: 'Add Watermark is text only. To place a logo or image on pages, use [Edit PDF](/tools/edit-pdf), which lets you add an image, position it and flatten it into the file.',
    },
    {
      q: 'Will the watermark cover my text?',
      a: 'At the default 25% opacity, grey, rotated 35 degrees, the page reads clearly through the mark. Raise the opacity for a stronger warning or lower it for a lighter one. The Tiled position repeats the text across the page for full coverage.',
    },
    {
      q: 'Can I watermark only some pages?',
      a: 'Yes. Enter a page list such as `1` for the cover or `2-10` in the Pages field. Leave it blank to stamp every page. Ranges that match no page are reported instead of silently ignored.',
    },
    {
      q: 'Is it free and private?',
      a: 'Yes. The tool runs in your browser with no upload, no account and no limit on how many files you stamp. The original file on your disk is never modified; you always get a new copy.',
    },
  ],
  entities: ['Watermark', 'PDF content stream', 'Helvetica Bold', 'Stamp annotation', 'Opacity', 'Confidential marking'],
  keywords: ['add watermark to pdf', 'watermark pdf free', 'pdf watermark online', 'add confidential watermark to pdf', 'draft watermark pdf', 'watermark pdf without upload'],
  metaTitle: 'Add Watermark to PDF: Stamp Text on Every Page, Free',
  metaDescription: 'Add a watermark to PDF free: stamp CONFIDENTIAL, DRAFT or any text with your choice of size, opacity, rotation, colour and pages, in your browser, no upload.',
}
