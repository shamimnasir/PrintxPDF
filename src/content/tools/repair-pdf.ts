import type { ToolContent } from './types'

export const repairPdf: ToolContent = {
  slug: 'repair-pdf',
  answer:
    'Repair PDF re-parses a damaged PDF in your browser, tolerating broken objects, and writes it back with a fresh cross-reference table and a clean trailer. It fixes files that a reader refuses to open because of structural damage. It is best effort: content that is truly missing cannot be recovered.',
  whatHeading: 'What is a corrupted PDF?',
  what: [
    {
      term: 'How PDFs get damaged',
      definition:
        'A PDF is a set of numbered objects followed by an index, the cross-reference table, that records the byte offset of each one, and a trailer that points to the index. Any of those can break: a download cut off before the end, a transfer that altered line endings, an editor that crashed mid-save, or a tool that wrote the offsets wrongly. The content may be intact while the index is wrong, and a strict reader then reports that the file is damaged and stops.',
    },
    {
      term: 'What the repair does',
      definition:
        'Instead of trusting the index, the tool **reads the file object by object**, skipping any it cannot make sense of rather than giving up, and rebuilds the page tree from what it finds. It then writes a new file with a correct cross-reference table and trailer. Object streams are expanded, which also helps older readers. Because the pages are written from the parsed content, this is best effort: damage inside a page or an image cannot be invented back.',
    },
  ],
  whyHeading: 'Why repair a PDF in the browser?',
  why: [
    { h: 'Open a damaged file again', x: 'When a reader says the file is damaged, the cause is usually the index, not the pages. Rebuilding the index is often all it takes.' },
    { h: 'Rescue a truncated download', x: 'A file cut off part-way often still holds every page that made it. Repair recovers those pages into a file that opens normally.' },
    { h: 'Make a strict viewer happy', x: 'Files that open in one app but fail in another usually have a sloppy structure. A clean rewrite fixes the difference.' },
    { h: 'Keep a broken contract private', x: 'A damaged file is still a confidential file. The rebuild happens inside the tab and nothing is uploaded.' },
    { h: 'Nothing to install, free', x: 'No desktop app, no account, no quota. Drop the file, run, download.' },
  ],
  howHeading: 'How to repair a PDF, step by step',
  how: [
    { h: 'Open Repair PDF and drop the damaged file.', x: 'Drag the PDF onto the drop zone or click to browse. There are no options to set: the parser decides what it can recover.' },
    { h: 'Click Run Repair PDF.', x: 'The file is read leniently in your browser. Invalid objects are skipped rather than stopping the whole job, and the pages that parse are collected.' },
    { h: 'Read the note and download.', x: 'On success the Ready list says how many pages were rebuilt with a fresh cross-reference table, and `name-repaired.pdf` downloads. If the file is too broken to parse at all, you get an error that says so instead of a blank PDF.' },
    { h: 'Check the pages.', x: 'Open the result in [PDF Reader](/tools/pdf-reader). If pages are blank or missing, the damage was in the content rather than the structure and this tool cannot restore it; go back to the source that produced the file.' },
  ],
  faqs: [
    {
      q: 'What kinds of damage can Repair PDF fix?',
      a: 'Structural damage: a wrong or missing cross-reference table, a bad trailer, a missing end-of-file marker, objects with invalid syntax, and files a strict reader rejects. It cannot restore content that is not there, such as a truncated page stream, a corrupt image, or a page lost when the file was cut short.',
    },
    {
      q: 'Why does the repaired file show blank pages?',
      a: 'The structure was rebuilt, but the drawing instructions for those pages, or the fonts and images they reference, were damaged or missing. A blank page is what remains once unreadable content is skipped. The only real fix is to re-export the PDF from the application or scanner that made it.',
    },
    {
      q: 'Will repairing change how the document looks?',
      a: 'No. Page content is written out as it was parsed, so text, images and layout are unchanged. The file may grow slightly because object streams are expanded for compatibility; run [Compress PDF](/tools/compress-pdf) on Light afterwards if size matters, which is lossless.',
    },
    {
      q: 'Can it repair a password-protected PDF?',
      a: 'Only the structure. The encryption is left in place and the page content stays encrypted, so if the password was lost the pages are still unreadable. If you know the password, remove it first with [Unlock PDF](/tools/unlock-pdf), then repair the unlocked file.',
    },
    {
      q: 'What if the tool says it could not parse the file?',
      a: 'Then not enough of the object structure survived for a rebuild, which usually means the file is mostly missing or is not actually a PDF, for example an HTML error page saved with a .pdf name. Try downloading or exporting it again from the original source.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'PDF cross-reference table', 'PDF trailer', 'pdf-lib', 'Adobe Acrobat'],
  keywords: ['repair pdf', 'fix corrupted pdf', 'repair pdf online free', 'pdf file is damaged and could not be repaired', 'recover damaged pdf', 'fix pdf that will not open', 'repair pdf without uploading'],
  metaTitle: 'Repair PDF Online Free | Fix a Damaged File',
  metaDescription: 'Repair a corrupted PDF in your browser, free: the file is re-parsed and rebuilt with a fresh cross-reference table. Best effort, and nothing is uploaded.',
}
