import type { ToolContent } from './types'

export const comparePdf: ToolContent = {
  slug: 'compare-pdf',
  answer:
    'Compare PDFs shows exactly what changed between two versions. Both files are rendered page by page and compared pixel by pixel; anything that moved is tinted, unchanged content fades to grey, and a percentage tells you how much differs. Download the diff as a PDF. Runs in your browser, free.',
  whatHeading: 'What is a PDF comparison?',
  what: [
    {
      term: 'What is a PDF comparison?',
      definition:
        'A comparison puts two versions of a document against each other and marks what differs. This tool does a **visual diff**: each page of both files is drawn to the same width, and the two bitmaps are compared pixel by pixel. Where the pixels differ beyond a tolerance you set, the diff view paints the accent colour; where they match, the page fades to light grey so changes stand out. A percentage of differing pixels is shown for each page.',
    },
    {
      term: 'Visual diff versus text diff',
      definition:
        'A text diff extracts the words from both files and lists inserted and deleted sentences. It is precise for prose but blind to layout, images, stamps and scans. A visual diff sees everything that renders: a moved logo, a changed figure, a new signature, an edit in a scanned page with no text layer. The trade-off is sensitivity: a one-line insertion reflows the rest of the page and the whole column shows as changed.',
    },
  ],
  whyHeading: 'Why compare two PDFs?',
  why: [
    { h: 'Proof before you sign', x: 'A counterparty sends back the "same" contract. Compare it to the version you approved and every altered clause lights up, including changes in tables and footers a text diff would not catch.' },
    { h: 'Works on scans and images', x: 'Nothing needs a text layer. Compare a scanned signed copy against the original, or two versions of a floor plan or chart.' },
    { h: 'Catch silent production changes', x: 'Reprints, regenerated reports and re-exported designs can shift in ways nobody mentioned. Pixels do not lie.' },
    { h: 'Keep a record', x: 'The downloadable diff PDF is a page-by-page picture of what changed, ready to attach to an email or a file note.' },
    { h: 'Never uploaded', x: 'Both files are rendered and compared in your browser.' },
  ],
  howHeading: 'How to compare two PDFs, step by step',
  how: [
    { h: 'Open Compare PDFs and drop both files', x: 'Drop two PDFs, the old version first and the new one second. They appear as A and B.' },
    { h: 'Step through the pages', x: 'Use the arrows above the view. The badge shows what percentage of pixels differ on the current page.' },
    { h: 'Switch views', x: 'Which version to show lets you flip between A, B and Diff. In Diff, changed pixels are tinted and unchanged content is faded.' },
    { h: 'Adjust the tolerance', x: 'The Tolerance slider (0 to 90 per colour channel) sets how different a pixel must be to count. Raise it to ignore anti-aliasing noise, lower it to catch faint changes.' },
    { h: 'Click Download the diff as PDF', x: 'One image page per page of the longer file, with the changes tinted, saved as `A-vs-B-diff.pdf`.' },
  ],
  faqs: [
    {
      q: 'Is this a text comparison?',
      a: 'No. It compares rendered pixels, not extracted words, so it sees images, layout, stamps and scans, but it cannot list which sentence changed. For word-level diffs, export both files with [PDF to Text](/tools/pdf-to-text) and compare the text files in a diff tool.',
    },
    {
      q: 'Why does the whole page show as changed?',
      a: 'Usually because content reflowed: an added line pushes everything below it down, and every shifted pixel counts. Different page sizes or rotation have the same effect. Check the A and B views; if the pages line up visually, raise the tolerance to suppress anti-aliasing noise.',
    },
    {
      q: 'What happens when the files have different page counts?',
      a: 'Pages past the end of the shorter file are compared against a blank sheet, so they show as entirely changed, and a notice tells you which file the page exists in. The diff PDF has one page per page of the longer file.',
    },
    {
      q: 'Does it work on scanned PDFs?',
      a: 'Yes. Because the comparison is visual, a scan needs no text layer. Two scans of the same paper will differ slightly in position and noise, so raise the tolerance and expect a small background percentage even where nothing changed.',
    },
    {
      q: 'Is the diff PDF editable?',
      a: 'No. It is a visual record: each page is an image with the changes tinted. Use it as evidence or a review aid, and keep both originals for editing.',
    },
  ],
  entities: ['Visual diff', 'Pixel comparison', 'Document version control', 'Tolerance threshold', 'Anti-aliasing', 'Rendered page'],
  keywords: ['compare pdf', 'compare two pdfs', 'pdf diff', 'compare pdf files free', 'find differences between two pdfs', 'compare pdf versions online', 'visual pdf comparison'],
  metaTitle: 'Compare PDFs: Highlight Every Change Between Versions',
  metaDescription: 'Compare two PDFs free: both versions render in your browser and every changed pixel is highlighted, with a diff PDF to download. Works on scans too.',
}
