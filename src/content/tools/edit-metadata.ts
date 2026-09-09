import type { ToolContent } from './types'

export const editMetadata: ToolContent = {
  slug: 'edit-metadata',
  answer:
    'Edit Metadata sets the title, author, subject and keywords stored inside a PDF. The current values load from the file, you change what you need, and the updated PDF downloads. It runs in your browser, so nothing is uploaded, and it is free with no account.',
  whatHeading: 'What is PDF metadata?',
  what: [
    {
      term: 'What is PDF metadata?',
      definition:
        'Metadata is information about the document rather than its content: the title a viewer shows in its window bar, the author, a subject line, keywords, the software that created it and the creation and modification dates. Search engines, file managers and document systems read these fields to name, sort and index PDFs, so a file with a proper title behaves better everywhere it goes.',
    },
    {
      term: 'Where is metadata stored in a PDF?',
      definition:
        'Two places. The document information dictionary (the **Info dictionary**) is the original mechanism from the PDF specification and is what nearly every viewer and operating system reads. Newer files may also carry an **XMP** packet, an XML block used by design and publishing tools. This tool writes the Info dictionary. An existing XMP packet is left as it is, so a few XMP-first applications may still show the old values.',
    },
  ],
  whyHeading: 'Why edit PDF metadata?',
  why: [
    { h: 'Show a real title, not a file name', x: 'Browsers, Google search results and tabbed viewers display the metadata title. `Q3-final-v7.pdf` becomes "Quarterly Report, Q3 2026".' },
    { h: 'Get credit, or fix the wrong name', x: 'Files exported from shared templates often carry someone else\'s name as author. Set your own, or your organisation\'s.' },
    { h: 'Make PDFs findable', x: 'Desktop search, document management systems and site search index the subject and keywords. Good values make the file surface for the queries people actually type.' },
    { h: 'Tidy before publishing', x: 'A PDF going onto a website or into a submission portal should carry a clean, correct title and author. It is the first thing a reviewer\'s viewer shows.' },
    { h: 'Private, in your browser', x: 'The file is read and rewritten on your device. Nothing is uploaded.' },
  ],
  howHeading: 'How to edit PDF metadata, step by step',
  how: [
    { h: 'Open Edit Metadata and drop your PDF', x: 'The tool reads the file and fills Title, Author, Subject and Keywords with whatever is already stored.' },
    { h: 'Change the fields', x: 'Edit any of the four. Separate keywords with commas. Leave a field empty to clear it.' },
    { h: 'Click Run Edit Metadata', x: 'The modification date is set to now and the file downloads as `name-meta.pdf`.' },
    { h: 'Check the result', x: 'Open the file in [PDF Reader](/tools/pdf-reader); the top bar shows the new title and author.' },
  ],
  faqs: [
    {
      q: 'Why does my browser tab still show the file name?',
      a: 'Some viewers prefer the file name unless the PDF asks them to display the title. Most desktop viewers, Google and file managers do use the title field. If a design app wrote an XMP packet with the old title, a few applications will read that instead; re-export from that app to update it.',
    },
    {
      q: 'Can I edit the creator, producer or dates?',
      a: 'Not here. Those fields describe the software and history of the file. Running the tool sets the modification date to the current time. To blank every field including the dates, use [Remove Metadata](/tools/remove-metadata).',
    },
    {
      q: 'Does Google use PDF metadata?',
      a: 'Yes, for the title. Google shows the PDF\'s title field as the headline in search results when it is present and sensible. Keywords and subject carry little or no ranking weight, but they help internal and desktop search.',
    },
    {
      q: 'Is the file changed in any other way?',
      a: 'No. Pages, text, images, links and form fields are untouched. The file is re-saved with the new Info dictionary, so the size may shift by a few bytes.',
    },
  ],
  entities: ['PDF metadata', 'Info dictionary', 'XMP', 'Document title', 'Author field', 'Keywords', 'ISO 32000'],
  keywords: ['edit pdf metadata', 'change pdf title', 'change pdf author', 'pdf metadata editor free', 'edit pdf properties online', 'add keywords to pdf'],
  metaTitle: 'Edit PDF Metadata: Title, Author, Subject, Keywords',
  metaDescription: 'Edit PDF metadata free: change the title, author, subject and keywords inside a PDF so viewers and search show the right name, in your browser, no upload.',
}
