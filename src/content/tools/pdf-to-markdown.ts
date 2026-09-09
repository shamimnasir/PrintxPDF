import type { ToolContent } from './types'

export const pdfToMarkdown: ToolContent = {
  slug: 'pdf-to-markdown',
  answer:
    'PDF to Markdown converts a PDF into a clean .md file in your browser. Headings are inferred from font size, bullets and numbered items become Markdown lists, and wrapped lines are joined back into paragraphs. The result is ready for notes, a repository or an AI prompt. Nothing is uploaded.',
  whatHeading: 'What are PDF and Markdown?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) records where each run of text sits on the page and in what size, but not whether it is a heading, a list item or body copy. A converter has to work that structure out from the geometry: lines set noticeably larger than the rest are probably headings, lines beginning with a bullet character are list items. This tool does exactly that, and needs a text layer to do it.',
    },
    {
      term: 'What is Markdown?',
      definition:
        'Markdown is plain text with lightweight markup: `#` for headings, `-` for bullets, `1.` for numbered lists, `**bold**` and `_italic_`. It was designed to be readable as-is and to convert cleanly to HTML, and it is standardised by the **CommonMark** specification. GitHub, Obsidian, Notion, static-site generators and most AI tools read it natively, which makes it the best format for text you plan to edit, version or paste into a prompt.',
    },
  ],
  whyHeading: 'Why convert PDF to Markdown?',
  why: [
    { h: 'Paste into notes and wikis', x: 'Obsidian, Notion and GitHub wikis are Markdown-native. A converted PDF drops in with its headings and lists intact instead of as a wall of text.' },
    { h: 'Better input for AI tools', x: 'Language models read Markdown structure well. Headings and lists give a prompt more signal than raw text, and the file is far smaller than the PDF.' },
    { h: 'Version it like code', x: 'Plain text diffs cleanly. Put a specification or policy in a repository and see exactly what changed between versions.' },
    { h: 'Structure without the layout baggage', x: 'You keep the outline of the document, headings, lists, paragraphs, and lose the fonts, columns and page furniture you did not want anyway.' },
    { h: 'Private and offline', x: 'Extraction runs with **pdf.js** in your browser. Internal reports and unpublished drafts are never uploaded.' },
  ],
  howHeading: 'How to convert PDF to Markdown, step by step',
  how: [
    { h: 'Open PDF to Markdown and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. The PDF is read locally.' },
    { h: 'Decide how headings are detected', x: 'Under **Options**, leave **Headings** on **Detect from font size** to turn lines set noticeably larger than the body text into `#`, `##` or `###`. Choose **Plain paragraphs only** for a flat document.' },
    { h: 'Choose page breaks', x: 'Set **Page breaks** to **One continuous document** to join pages into flowing text, or **Rule (---) between pages** to keep a horizontal rule where each page ended.' },
    { h: 'Run PDF to Markdown', x: 'Click **Run PDF to Markdown**. The progress bar names each page as it is read.' },
    { h: 'Download the .md file', x: 'The file downloads automatically, named after the PDF. Open it in any editor, or paste it straight into your notes.' },
  ],
  faqs: [
    { q: 'How does PDF to Markdown decide what is a heading?', a: 'It measures the text height most of the document is set in, then compares every line to it. Lines about 1.6 times the body size become `#`, about 1.35 times `##`, and about 1.15 times `###`. Documents whose headings use bold at the same size will come out as plain paragraphs.' },
    { q: 'Are lists, links and bold kept?', a: 'Bullet characters and `1.` or `a)` markers become Markdown list items, and wrapped lines are rejoined. Bold and italic are not detected. Hyperlinks are not converted: a URL written out in the text survives as text, but link text that hides its address loses it.' },
    { q: 'Why is the Markdown file empty?', a: 'The PDF has no text layer, so it is a scan or an image export, and the tool says so under the result. Run [OCR PDF](/tools/ocr-pdf) first to make it searchable, then convert the OCR output.' },
    { q: 'Will tables come across?', a: 'No. Table cells arrive as lines of text, not as a Markdown table. For tabular data, try [PDF to Excel](/tools/pdf-to-excel), which splits lines on wide gaps into cells, then paste the cells into a Markdown table by hand or with an editor plugin.' },
    { q: 'Is my PDF uploaded?', a: 'No. The text is extracted and the Markdown assembled inside your browser tab with pdf.js. Nothing reaches a server, and there is no account or history to clear afterwards.' },
  ],
  entities: ['PDF', 'ISO 32000', 'Markdown', 'CommonMark', 'GitHub', 'Obsidian', 'pdf.js'],
  keywords: ['pdf to markdown', 'convert pdf to markdown free', 'pdf to md', 'pdf to markdown online', 'pdf to markdown for obsidian', 'pdf to markdown with headings', 'pdf to text for ai'],
  metaTitle: 'PDF to Markdown: Convert PDF to Clean .md Free',
  metaDescription: 'Convert PDF to Markdown in your browser: headings from font size, real lists, clean paragraphs, ready for Obsidian, GitHub or an AI prompt. Free, no upload.',
}
