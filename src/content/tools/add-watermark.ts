import type { ToolContent } from './types'

export const addWatermark: ToolContent = {
  slug: 'add-watermark',
  answer:
    'Add Watermark stamps words such as CONFIDENTIAL or DRAFT across the pages of a PDF. You choose where the text sits, how big and how see-through it is, its angle, colour and pages. It runs in your browser, so your file is never uploaded, and it is free.',
  whatHeading: 'What is a PDF watermark?',
  what: [
    {
      term: 'What is a PDF watermark?',
      definition:
        'A watermark is text laid over a page to label it: a status such as DRAFT, a warning such as CONFIDENTIAL, or an owner\'s name. This tool draws the words straight into the page itself, so they print, show up in every PDF app and travel with the file wherever it goes. It adds text in a bold, clean typeface. It does not add logos or pictures.',
    },
    {
      term: 'Why is a drawn-in watermark better than a sticker?',
      definition:
        'Some apps add a watermark as a separate sticker that floats on top of the page. Anyone with a PDF app can hide or delete that sticker. A watermark drawn into the page is part of the page, like ink on paper. That makes it much harder to strip off, which is the whole point when the label needs to survive being forwarded. Keep your unmarked original in case you need a clean copy later.',
    },
  ],
  whyHeading: 'Why add a watermark to a PDF?',
  why: [
    { h: 'Stop drafts being mistaken for finals', x: 'A diagonal DRAFT across every page removes any doubt about which version someone is reading, before it gets signed or quoted.' },
    { h: 'Label confidential material', x: 'A CONFIDENTIAL or INTERNAL mark reminds everyone who opens the file how it may be shared, and backs you up if it leaks.' },
    { h: 'Trace copies', x: 'Put the recipient\'s name or a copy number in the watermark and each copy can be told apart, which discourages people passing it on.' },
    { h: 'Protect samples and proofs', x: 'Send a client a proof marked SAMPLE or NOT FOR DISTRIBUTION and keep the clean version until the work is approved.' },
    { h: 'Nothing is uploaded', x: 'The stamping happens in your browser. Sensitive papers are the ones that need marking, and they stay on your computer.' },
  ],
  howHeading: 'How to add a watermark to a PDF, step by step',
  how: [
    { h: 'Open Add Watermark and drop your PDF', x: 'Drop one PDF. The options appear on the right.' },
    { h: 'Type the text', x: 'The default is CONFIDENTIAL. Replace it with DRAFT, SAMPLE, a name or anything else.' },
    { h: 'Choose position and style', x: 'Position: Center, Tiled, Top or Bottom. Then set Font size (12 to 160), Opacity (5% to 100%, where a lower number is more see-through), Rotation (-90 to 90 degrees) and Color: Grey, Red, Blue or Black.' },
    { h: 'Pick the pages', x: 'Leave Pages blank to mark every page, or type page numbers such as `1, 3-5`.' },
    { h: 'Click Run Add Watermark', x: 'The stamped file downloads as `name-watermarked.pdf`.' },
  ],
  faqs: [
    {
      q: 'Can I remove the watermark later?',
      a: 'Not with this tool. The text is drawn into the page, so it is part of the page rather than a layer you can peel off. Keep your unmarked original. If you only need to hide it on some pages, [Redact PDF](/tools/redact-pdf) can black it out, but those pages then become pictures.',
    },
    {
      q: 'Can I watermark with a logo or image?',
      a: 'Add Watermark is text only. To place a logo or picture on pages, use [Edit PDF](/tools/edit-pdf), which lets you add an image, move it into position and save it into the file.',
    },
    {
      q: 'Will the watermark cover my text?',
      a: 'At the default 25% opacity, grey, turned 35 degrees, the page reads clearly through the mark. Raise the opacity for a stronger warning or lower it for a lighter one. The Tiled position repeats the text across the page for full coverage.',
    },
    {
      q: 'Can I watermark only some pages?',
      a: 'Yes. Type a page list such as `1` for the cover or `2-10` in the Pages field. Leave it blank to stamp every page. If you type a page that does not exist, the tool tells you instead of quietly skipping it.',
    },
    {
      q: 'Is it free and private?',
      a: 'Yes. The tool runs in your browser with no upload, no account and no limit on how many files you stamp. The original file on your computer is never changed; you always get a new copy.',
    },
  ],
  entities: ['Watermark', 'PDF', 'Draft watermark', 'Confidential marking', 'Opacity', 'Page stamp'],
  keywords: ['add watermark to pdf', 'watermark pdf free', 'pdf watermark online', 'add confidential watermark to pdf', 'draft watermark pdf', 'watermark pdf without upload'],
  metaTitle: 'Add Watermark to PDF: Stamp Text on Every Page, Free',
  metaDescription: 'Add a watermark to a PDF free: stamp CONFIDENTIAL, DRAFT or any text and set the size, see-through level, angle, colour and pages. In your browser, no upload.',
}
