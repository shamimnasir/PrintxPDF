import type { ToolContent } from './types'

export const pdfToPdfa: ToolContent = {
  slug: 'pdf-to-pdfa',
  answer:
    'PDF to PDF/A turns an ordinary PDF into PDF/A, a long-term archive version of PDF that courts and archives ask for. Fonts are packed inside and the file is marked as PDF/A-1b, 2b or 3b. Our converter rebuilds each page, so check the result. Free for 5 files a month.',
  whatHeading: 'What are PDF and PDF/A?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'A PDF is the fixed-layout file everyone reads. An everyday PDF may borrow fonts from the computer that made it instead of carrying them inside, and may contain passwords, scripts or links to things outside the file. All of that is fine for a file you open today, and a problem for a file that must still open correctly in 2050.',
    },
    {
      term: 'What is PDF/A?',
      definition:
        'PDF/A is a long-term archive version of PDF. It bans anything that depends on the outside world: every font must be packed inside, colours must be fully described, and passwords, scripts and outside links are not allowed. PDF/A-1 is the strictest and oldest, PDF/A-2 allows more modern features such as see-through layers, and PDF/A-3 lets the file carry attachments. The letter b means the pages will always look the same.',
    },
  ],
  whyHeading: 'Why convert PDF to PDF/A?',
  why: [
    { h: 'Meet a requirement', x: 'Courts, online filing sites, public archives, universities and many tenders ask for PDF/A by name. A proper PDF/A file is accepted; a plain PDF is sent back.' },
    { h: 'Still readable decades from now', x: 'With fonts and colour details inside the file, nothing depends on software or fonts that may not exist later. That is the whole point of the format.' },
    { h: 'Pick the version the recipient wants', x: 'PDF/A-1b works with the oldest checkers, 2b is the sensible default for almost every archive, and 3b is needed when the PDF must carry an attachment such as an electronic invoice.' },
    { h: 'No software to install', x: 'Desktop tools that write PDF/A are expensive or awkward. Here you drop the file, choose the version, and our converter does the work.' },
  ],
  howHeading: 'How to convert PDF to PDF/A, step by step',
  how: [
    { h: 'Open PDF to PDF/A and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. Password-protected files are refused; remove the password with [Unlock PDF](/tools/unlock-pdf) first.' },
    { h: 'Choose the version', x: 'Under **Options**, set **Conformance** to **PDF/A-2b** unless you were asked for something else. Pick **1b** only when a site demands it by name, and **3b** when the file must carry attachments.' },
    { h: 'Run PDF to PDF/A', x: 'Click **Run PDF to PDF/A**. The file is sent over a secure connection, converted on our server, and sent back. The progress bar shows the upload and the conversion.' },
    { h: 'Download and check the pages', x: 'The PDF/A downloads on its own. Open it and compare a few pages with the original: our converter rebuilds each page, so check that nothing has moved before you file it.' },
  ],
  faqs: [
    { q: 'Will the PDF/A look exactly like my original?', a: 'Usually close, not always identical. Our converter opens the PDF and saves it again, so simple text documents come through cleanly, while files with unusual fonts, complex drawings, forms or see-through effects can show small shifts in spacing or layout. Always check the result before submitting it.' },
    { q: 'Is the output checked as valid PDF/A?', a: 'The file is marked with its version and carries its fonts and colour details, but we do not run a separate checker on it. If your archive or court requires a checking report, run the file through a PDF/A checking tool before you submit it.' },
    { q: 'Which version should I choose: 1b, 2b or 3b?', a: 'Choose 2b unless told otherwise; it is the modern default and accepts more kinds of content than 1b. Choose 1b only when a site asks for PDF/A-1 by name. Choose 3b when the PDF must carry an attachment, for example an electronic invoice inside a PDF.' },
    { q: 'Is my file stored on the server?', a: 'No. It is sent over a secure connection, converted, sent back and deleted the moment the job finishes; nothing is logged or kept. The free plan allows 5 server conversions a month with no sign-up, files up to 100 MB. Pro raises that to 300.' },
    { q: 'Why is a password-protected PDF rejected?', a: 'PDF/A does not allow passwords, and a locked file cannot be read for conversion anyway. Run it through [Unlock PDF](/tools/unlock-pdf) with the password you were given, then convert the unlocked copy.' },
  ],
  entities: ['PDF/A', 'PDF', 'Archive format', 'Long-term preservation', 'Court e-filing', 'PDF/A-2b'],
  keywords: ['pdf to pdf/a', 'convert pdf to pdf/a', 'pdf/a converter online', 'pdf/a-2b', 'pdf/a-1b', 'archive pdf format', 'pdf to pdfa free'],
  metaTitle: 'PDF to PDF/A: Convert to the Long-Term Archive Format',
  metaDescription: 'Convert PDF to PDF/A-1b, 2b or 3b for courts and archives. Fonts packed inside, no sign-up needed. Free for 5 files a month, deleted right after the job.',
}
