import type { ToolContent } from './types'

export const comparePdf: ToolContent = {
  slug: 'compare-pdf',
  answer:
    'Compare PDFs shows you exactly what changed between two versions of a document. Both files are drawn page by page and checked dot by dot. Changes are coloured in, unchanged parts fade to grey, and a percentage shows how much differs. Download the result as a PDF. Free, no upload.',
  whatHeading: 'What is a PDF comparison?',
  what: [
    {
      term: 'What is a PDF comparison?',
      definition:
        'A comparison puts two versions of a document side by side and marks what is different. This tool compares the way the pages look: each page of both files is drawn at the same size, and the two pictures are checked dot by dot. Where the dots differ by more than the amount you allow, the change is painted in colour. Where they match, the page fades to light grey so changes stand out. Each page shows a percentage of how much differs.',
    },
    {
      term: 'Comparing how pages look versus comparing the words',
      definition:
        'A word comparison pulls the text out of both files and lists the sentences that were added or removed. It is precise for prose but blind to layout, pictures, stamps and scans. Comparing how the pages look catches everything you can see: a moved logo, a changed chart, a new signature, an edit on a scanned page. The trade-off is that it is sensitive. Adding one line pushes everything below it down, so a whole column can show as changed.',
    },
  ],
  whyHeading: 'Why compare two PDFs?',
  why: [
    { h: 'Check before you sign', x: 'The other side sends back the "same" contract. Compare it to the version you approved and every altered clause lights up, including changes in tables and footers a word comparison would miss.' },
    { h: 'Works on scans and pictures', x: 'The pages do not need real text inside them. Compare a scanned signed copy against the original, or two versions of a floor plan or chart.' },
    { h: 'Catch silent changes', x: 'Reprints, regenerated reports and re-exported designs can shift in ways nobody mentioned. The dots on the page do not lie.' },
    { h: 'Keep a record', x: 'The downloadable comparison PDF is a page-by-page picture of what changed, ready to attach to an email or a file note.' },
    { h: 'Never uploaded', x: 'Both files are drawn and compared in your browser.' },
  ],
  howHeading: 'How to compare two PDFs, step by step',
  how: [
    { h: 'Open Compare PDFs and drop both files', x: 'Drop two PDFs, the old version first and the new one second. They appear as A and B.' },
    { h: 'Step through the pages', x: 'Use the arrows above the view. The badge shows what percentage of the current page is different.' },
    { h: 'Switch views', x: 'Which version to show lets you flip between A, B and Diff. Diff means the differences view: changed parts are coloured and unchanged parts are faded.' },
    { h: 'Adjust the tolerance', x: 'The Tolerance slider (0 to 90) sets how different a dot must be before it counts. Raise it to ignore tiny noise from slightly fuzzy edges, lower it to catch faint changes.' },
    { h: 'Click Download the diff as PDF', x: 'You get one picture page for every page of the longer file, with the changes coloured in, saved as `A-vs-B-diff.pdf`.' },
  ],
  faqs: [
    {
      q: 'Does it compare the words or the look of the page?',
      a: 'The look of the page. It compares the drawn pages dot by dot, not the words, so it sees pictures, layout, stamps and scans, but it cannot list which sentence changed. For a word-by-word comparison, export both files with [PDF to Text](/tools/pdf-to-text) and compare the two text files.',
    },
    {
      q: 'Why does the whole page show as changed?',
      a: 'Usually because the content shifted: an added line pushes everything below it down, and every moved dot counts. Different page sizes or a rotated page have the same effect. Check the A and B views; if the pages line up by eye, raise the tolerance to hide the tiny noise.',
    },
    {
      q: 'What happens when the files have different page counts?',
      a: 'Pages past the end of the shorter file are compared against a blank sheet, so they show as entirely changed, and a notice tells you which file the page exists in. The comparison PDF has one page for every page of the longer file.',
    },
    {
      q: 'Does it work on scanned PDFs?',
      a: 'Yes. Because the comparison is by eye rather than by words, a scan does not need any real text inside it. Two scans of the same paper will differ slightly in position and speckle, so raise the tolerance and expect a small background percentage even where nothing changed.',
    },
    {
      q: 'Can I edit the comparison PDF?',
      a: 'No. It is a visual record: each page is a picture with the changes coloured in. Use it as evidence or a review aid, and keep both originals for editing.',
    },
  ],
  entities: ['PDF comparison', 'Document versions', 'Visual difference', 'Tolerance', 'Scanned PDF', 'Contract review'],
  keywords: ['compare pdf', 'compare two pdfs', 'pdf diff', 'compare pdf files free', 'find differences between two pdfs', 'compare pdf versions online', 'visual pdf comparison'],
  metaTitle: 'Compare PDFs: Highlight Every Change Between Versions',
  metaDescription: 'Compare two PDFs free: both versions are drawn in your browser and every changed spot is coloured in, with a comparison PDF to download. Works on scans too.',
}
