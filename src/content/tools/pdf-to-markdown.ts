import type { ToolContent } from './types'

export const pdfToMarkdown: ToolContent = {
  slug: 'pdf-to-markdown',
  answer:
    'PDF to Markdown turns a PDF into a clean .md file in your browser. Markdown is a plain-text way of writing headings and lists that notes apps and AI tools understand. Bigger text becomes headings, bullets become lists, and broken lines are joined into paragraphs. Nothing is uploaded.',
  whatHeading: 'What are PDF and Markdown?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'A PDF records where each line of text sits on the page and how big it is, but not whether it is a heading, a list item or normal text. A converter has to work that out from the layout: lines noticeably bigger than the rest are probably headings, and lines starting with a bullet are list items. This tool does exactly that, and it needs real text in the PDF, not a scanned picture.',
    },
    {
      term: 'What is Markdown?',
      definition:
        'Markdown is plain text with a few simple marks: `#` for a heading, `-` for a bullet, `1.` for a numbered list, `**bold**` and `_italic_`. It is easy to read as it is and turns cleanly into a web page. Notes apps such as Obsidian and Notion, GitHub and most AI tools read it directly, which makes it the best format for text you plan to edit, keep track of or paste into a prompt.',
    },
  ],
  whyHeading: 'Why convert PDF to Markdown?',
  why: [
    { h: 'Paste into notes and wikis', x: 'Obsidian, Notion and GitHub wikis are built around Markdown. A converted PDF drops in with its headings and lists intact instead of as a wall of text.' },
    { h: 'Better input for AI tools', x: 'AI assistants read Markdown structure well. Headings and lists give a prompt more meaning than raw text, and the file is far smaller than the PDF.' },
    { h: 'Track changes like a document history', x: 'Plain text is easy to compare. Put a policy or a specification in a shared folder or code repository and see exactly what changed between versions.' },
    { h: 'Keep the outline, lose the clutter', x: 'You keep the shape of the document, its headings, lists and paragraphs, and lose the fonts, columns and page decoration you did not want anyway.' },
    { h: 'Private and offline', x: 'The text is read in your browser. Internal reports and unpublished drafts are never uploaded.' },
  ],
  howHeading: 'How to convert PDF to Markdown, step by step',
  how: [
    { h: 'Open PDF to Markdown and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. The PDF is read on your own computer.' },
    { h: 'Decide how headings are found', x: 'Under **Options**, leave **Headings** on **Detect from font size** to turn lines set noticeably bigger than the normal text into `#`, `##` or `###` headings. Choose **Plain paragraphs only** for a flat document.' },
    { h: 'Choose page breaks', x: 'Set **Page breaks** to **One continuous document** to join pages into flowing text, or **Rule (---) between pages** to keep a dividing line where each page ended.' },
    { h: 'Run PDF to Markdown', x: 'Click **Run PDF to Markdown**. The progress bar names each page as it is read.' },
    { h: 'Download the .md file', x: 'The file downloads on its own, named after the PDF. Open it in any text editor, or paste it straight into your notes.' },
  ],
  faqs: [
    { q: 'How does PDF to Markdown decide what is a heading?', a: 'It measures the text size most of the document uses, then compares every line to it. Lines about 1.6 times the normal size become `#`, about 1.35 times `##`, and about 1.15 times `###`. Documents whose headings are only bold at the same size will come out as plain paragraphs.' },
    { q: 'Are lists, links and bold kept?', a: 'Bullet marks and `1.` or `a)` markers become Markdown list items, and broken lines are joined back together. Bold and italic are not detected. Links are not converted: a web address written out in the text survives as text, but link text that hides its address loses it.' },
    { q: 'Why is the Markdown file empty?', a: 'The PDF has no real text, only a picture of the page, which means it was scanned or saved as images. The tool says so under the result. Run [OCR PDF](/tools/ocr-pdf) first. OCR turns a picture of text into real text you can search and copy. Then convert that copy.' },
    { q: 'Will tables come across?', a: 'No. Table cells arrive as lines of text, not as a Markdown table. For table data, try [PDF to Excel](/tools/pdf-to-excel), which splits lines on wide gaps into cells, then paste the cells into a Markdown table by hand or with an editor add-on.' },
    { q: 'Is my PDF uploaded?', a: 'No. The text is read and the Markdown is put together inside your browser tab. Nothing reaches our servers, and there is no account or history to clear afterwards.' },
  ],
  entities: ['PDF', 'Markdown', 'GitHub', 'Obsidian', 'Notion', 'Plain text'],
  keywords: ['pdf to markdown', 'convert pdf to markdown free', 'pdf to md', 'pdf to markdown online', 'pdf to markdown for obsidian', 'pdf to markdown with headings', 'pdf to text for ai'],
  metaTitle: 'PDF to Markdown: Convert PDF to Clean .md Free',
  metaDescription: 'Convert PDF to Markdown in your browser: headings from text size, real lists, clean paragraphs, ready for Obsidian, GitHub or an AI prompt. Free, no upload.',
}
