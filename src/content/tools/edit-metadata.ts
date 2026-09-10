import type { ToolContent } from './types'

export const editMetadata: ToolContent = {
  slug: 'edit-metadata',
  answer:
    'Edit Metadata changes the hidden details saved inside a PDF: its title, author, subject and keywords. The current values load from the file, you change what you need, and the updated PDF downloads. It runs in your browser, so nothing is uploaded, and it is free with no account.',
  whatHeading: 'What is PDF metadata?',
  what: [
    {
      term: 'What is PDF metadata?',
      definition:
        'Metadata is the hidden details saved inside a file, as opposed to what is printed on its pages: the title a PDF app shows in its window bar, the author, a subject line, keywords, the program that made it and the dates it was created and last changed. Search engines, file managers and document systems read these details to name, sort and find PDFs, so a file with a proper title behaves better everywhere it goes.',
    },
    {
      term: 'Where are these details stored?',
      definition:
        'In two places. The first is a simple list of details that has been part of PDF from the start, and it is what nearly every PDF app and operating system reads. Newer files may also carry a second, more detailed block used by design and publishing programs. This tool writes the first list. If a file has the second block, it is left as it is, so a few design programs may still show the old values.',
    },
  ],
  whyHeading: 'Why edit PDF metadata?',
  why: [
    { h: 'Show a real title, not a file name', x: 'Browsers, Google search results and PDF apps with tabs display the saved title. `Q3-final-v7.pdf` becomes "Quarterly Report, Q3 2026".' },
    { h: 'Get credit, or fix the wrong name', x: 'Files exported from shared templates often carry someone else\'s name as author. Set your own, or your organisation\'s.' },
    { h: 'Make PDFs easy to find', x: 'Desktop search, document systems and website search look at the subject and keywords. Good values make the file show up for the words people actually type.' },
    { h: 'Tidy before publishing', x: 'A PDF going onto a website or into a submission portal should carry a clean, correct title and author. It is the first thing a reviewer\'s PDF app shows.' },
    { h: 'Private, in your browser', x: 'The file is read and rewritten on your device. Nothing is uploaded.' },
  ],
  howHeading: 'How to edit PDF metadata, step by step',
  how: [
    { h: 'Open Edit Metadata and drop your PDF', x: 'The tool reads the file and fills Title, Author, Subject and Keywords with whatever is already saved.' },
    { h: 'Change the fields', x: 'Edit any of the four. Separate keywords with commas. Leave a field empty to clear it.' },
    { h: 'Click Run Edit Metadata', x: 'The "last changed" date is set to now and the file downloads as `name-meta.pdf`.' },
    { h: 'Check the result', x: 'Open the file in [PDF Reader](/tools/pdf-reader); the top bar shows the new title and author.' },
  ],
  faqs: [
    {
      q: 'Why does my browser tab still show the file name?',
      a: 'Some PDF apps prefer the file name unless the PDF asks them to display the title. Most desktop apps, Google and file managers do use the title. If a design program saved a second, more detailed block of details with the old title, a few programs will read that instead; export again from that program to update it.',
    },
    {
      q: 'Can I edit the creating program or the dates?',
      a: 'Not here. Those details describe the software and history of the file. Running the tool sets the "last changed" date to the current time. To blank every detail including the dates, use [Remove Metadata](/tools/remove-metadata).',
    },
    {
      q: 'Does Google use PDF metadata?',
      a: 'Yes, for the title. Google shows the PDF\'s saved title as the headline in search results when it is present and sensible. Keywords and subject carry little or no weight in Google rankings, but they help search on your own computer and inside document systems.',
    },
    {
      q: 'Is the file changed in any other way?',
      a: 'No. Pages, text, pictures, links and fillable fields are untouched. The file is saved again with the new details, so the size may shift by a few bytes.',
    },
  ],
  entities: ['PDF metadata', 'Document title', 'Author', 'Subject', 'Keywords', 'PDF properties', 'Google Search'],
  keywords: ['edit pdf metadata', 'change pdf title', 'change pdf author', 'pdf metadata editor free', 'edit pdf properties online', 'add keywords to pdf'],
  metaTitle: 'Edit PDF Metadata: Title, Author, Subject, Keywords',
  metaDescription: 'Edit PDF metadata free: change the hidden title, author, subject and keywords inside a PDF so apps and search show the right name. In your browser, no upload.',
}
