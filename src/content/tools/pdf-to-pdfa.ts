import type { ToolContent } from './types'

export const pdfToPdfa: ToolContent = {
  slug: 'pdf-to-pdfa',
  answer:
    'PDF to PDF/A converts an ordinary PDF into the ISO 19005 archival format, fonts embedded, declared as PDF/A-1b, 2b or 3b. It runs on our server through LibreOffice, which re-lays out each page, so check complex files. Free for 5 files a month, deleted after the job.',
  whatHeading: 'What are PDF and PDF/A?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) is the fixed-layout format everyone reads. An everyday PDF may reference fonts installed on the author\'s machine rather than embedding them, carry encryption, JavaScript or external links, and use device-dependent colour. All of that is fine for a file you open today, and a liability for a file that must still open correctly in 2050.',
    },
    {
      term: 'What is PDF/A?',
      definition:
        'PDF/A is the archival profile of PDF, standardised as **ISO 19005**. It forbids anything that depends on the outside world: every font must be embedded, colours must be defined through an ICC output intent, encryption, JavaScript and external content are banned, and metadata lives in XMP. PDF/A-1 (2005) is the strictest, PDF/A-2 (2011) adds JPEG 2000, transparency and layers, PDF/A-3 (2012) allows attachments of any type. The **b** level guarantees visual reproduction; **a** adds accessibility tagging.',
    },
  ],
  whyHeading: 'Why convert PDF to PDF/A?',
  why: [
    { h: 'Meet a requirement', x: 'Courts, e-filing portals, public archives, universities and many tenders ask for PDF/A by name. A conforming file is accepted; a plain PDF is bounced.' },
    { h: 'Still readable decades from now', x: 'With fonts and colour profiles inside the file, nothing depends on software or fonts that may not exist later. That is the whole point of the standard.' },
    { h: 'Pick the level the recipient wants', x: 'PDF/A-1b has the widest support with old validators, 2b is the sensible default for almost every archive, and 3b is required when the PDF must carry an attachment such as an XML e-invoice.' },
    { h: 'No software to install', x: 'Desktop tools that write PDF/A are expensive or awkward. Here you drop the file, choose the level, and the server does the work.' },
  ],
  howHeading: 'How to convert PDF to PDF/A, step by step',
  how: [
    { h: 'Open PDF to PDF/A and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. Password-protected files are refused; remove the password with [Unlock PDF](/tools/unlock-pdf) first.' },
    { h: 'Choose the conformance level', x: 'Under **Options**, set **Conformance** to **PDF/A-2b** unless you were asked for something else. Pick **1b** only when a system demands it by name, and **3b** when the file must carry attachments.' },
    { h: 'Run PDF to PDF/A', x: 'Click **Run PDF to PDF/A**. The file is sent over HTTPS, converted by LibreOffice on our server, and returned. The progress bar shows the upload and the conversion.' },
    { h: 'Download and check the pages', x: 'The PDF/A downloads automatically. Open it and compare a few pages with the original: the converter re-lays out the content, so check that nothing has shifted before you file it.' },
  ],
  faqs: [
    { q: 'Will the PDF/A look exactly like my original?', a: 'Usually close, not always identical. The server imports the PDF into LibreOffice and exports it again, so simple text documents come through cleanly, while files with unusual fonts, complex vector graphics, forms or transparency can show small shifts in spacing or layout. Always check the result before submitting it.' },
    { q: 'Is the output validated as PDF/A?', a: 'The file declares its conformance level and embeds fonts and an ICC output intent, but we do not run a validator on it. If your archive or court requires a validation report, check the file with a tool such as veraPDF before you submit it.' },
    { q: 'Which level should I choose: 1b, 2b or 3b?', a: 'Choose 2b unless told otherwise; it is the modern default and accepts more source content than 1b. Choose 1b only when a portal asks for PDF/A-1 by name. Choose 3b when the PDF must carry an attachment, for example an XML invoice inside a PDF.' },
    { q: 'Is my file stored on the server?', a: 'No. It is sent over HTTPS, converted, returned and deleted the moment the job finishes; nothing is logged or kept. The free plan allows 5 server conversions a month with no sign-up, files up to 100 MB. Pro raises that to 300.' },
    { q: 'Why is a password-protected PDF rejected?', a: 'PDF/A forbids encryption, and an encrypted file cannot be read for conversion anyway. Run it through [Unlock PDF](/tools/unlock-pdf) with the password you were given, then convert the unlocked copy.' },
  ],
  entities: ['PDF/A', 'ISO 19005', 'PDF', 'ISO 32000', 'LibreOffice', 'ICC profile', 'XMP', 'veraPDF'],
  keywords: ['pdf to pdf/a', 'convert pdf to pdf/a', 'pdf/a converter online', 'pdf/a-2b', 'pdf/a-1b', 'archive pdf format', 'pdf to pdfa free'],
  metaTitle: 'PDF to PDF/A: Convert to ISO 19005 Archive Format',
  metaDescription: 'Convert PDF to PDF/A-1b, 2b or 3b for courts and archives. Fonts embedded, ICC output intent, no sign-up. Free for 5 files a month, deleted after the job.',
}
