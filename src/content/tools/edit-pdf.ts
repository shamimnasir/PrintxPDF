import type { ToolContent } from './types'

export const editPdf: ToolContent = {
  slug: 'edit-pdf',
  answer:
    'Edit PDF lets you add text, place PNG or JPG images, draw rectangles and freehand ink on any page of a PDF, and saves them into the file. It stamps new content onto the existing page; the original text is not retyped or reflowed. Free, in your browser, nothing uploaded.',
  whatHeading: 'What does editing a PDF mean?',
  what: [
    {
      term: 'Why a PDF is not a word processor file',
      definition:
        'A PDF is a fixed-layout format: text is stored as positioned runs of glyphs, often in a subset font that contains only the letters used. Retyping a paragraph in place needs the full font and a reflow of everything after it, which the format was never built for. This tool takes the practical route and does **overlay editing**: it draws new text in Helvetica, images, rectangles and ink straight into the page content, exactly where you put them.',
    },
    {
      term: 'Overlay editing versus redaction',
      definition:
        'Everything you add sits on top of the existing page. A filled rectangle over a price hides it on screen and in print, but the original text is still in the file and can be selected or extracted underneath. That makes this tool right for filling in blanks, annotating drafts, adding a logo or a stamp, and wrong for removing anything sensitive. For that, [Redact PDF](/tools/redact-pdf) rasterises the area so the words are gone.',
    },
  ],
  whyHeading: 'Why edit a PDF in the browser?',
  why: [
    { h: 'Fill in a flat form', x: 'Scanned or flat forms cannot be typed into by a reader. Click where the answer goes, type it, and download a file that looks filled.' },
    { h: 'Add a logo or stamp', x: 'Place a PNG or JPG, drag it into position, resize it from the corner, and it becomes part of the page.' },
    { h: 'Mark up a draft', x: 'Highlight a clause with a semi-transparent rectangle, circle a figure in ink, add a note in red. Nothing to install.' },
    { h: 'Edits are written into the page', x: 'Items are drawn into the content stream, not stored as annotations, so every viewer shows them and nobody can toggle them off.' },
    { h: 'Private and free', x: 'The PDF and the images you place stay in the tab. No upload, no account, no watermark.' },
  ],
  howHeading: 'How to edit a PDF, step by step',
  how: [
    { h: 'Open Edit PDF and drop your file.', x: 'Drag one PDF onto the drop zone. The first page renders in the editor; use the arrows beside Page 1 / N to move through the document.' },
    { h: 'Pick a tool from the toolbar.', x: 'The toolbar offers **Select and move**, **Add text**, **Place an image**, **Draw a rectangle**, **Freehand ink** and **Erase**. The panel on the right sets the style for new items: text size from 6 to 72 pt, colour, Bold, Filled rectangles, stroke and ink width, and rectangle opacity.' },
    { h: 'Click the page to add an item.', x: 'With Add text, click where the words go; a New text item appears and you edit its wording in the panel. For an image, choose a PNG or JPG under Image to place, then click the page. For a rectangle, drag out the shape. For ink, draw with the mouse or a finger.' },
    { h: 'Adjust or remove.', x: 'Switch to Select and move to drag any item, or drag the corner square of an image or rectangle to resize it. The panel shows the selected item and a Delete this item button; Erase deletes whatever you click. Undo, or Ctrl/Cmd+Z, steps back through the last forty changes.' },
    { h: 'Click Save & download.', x: 'The button shows how many items will be written. They are drawn into the page content and `name-edited.pdf` downloads. Your original file is unchanged, so keep it if you may want to edit again.' },
  ],
  faqs: [
    {
      q: 'Can I edit the existing text in a PDF?',
      a: 'Not in place. This tool adds content on top of the page; it does not retype or reflow what is already there. A common workaround is a filled white rectangle over the old wording with new text on top, bearing in mind the old text remains in the file. To rewrite a document properly, convert it with [PDF to Word](/tools/pdf-to-word), edit, and export again.',
    },
    {
      q: 'Which fonts can I use?',
      a: 'Helvetica, regular or bold, at any size from 6 to 72 pt and in any colour. Other fonts are not embedded, so text you add will not match a document set in, say, Times or Calibri exactly. Helvetica is one of the standard fonts every PDF reader must support, which is why it renders reliably everywhere.',
    },
    {
      q: 'Are the edits permanent?',
      a: 'Yes. Text, images, rectangles and ink are drawn into the page content of the downloaded file rather than attached as annotations, so every viewer shows them and they cannot be hidden or deleted from a reader. Your original is untouched, so edit a copy if you may need the clean version.',
    },
    {
      q: 'Can I add an image such as a logo or a signature?',
      a: 'Yes. Choose a PNG or JPG under Image to place, click the page to drop it, then drag it into position and resize it from the corner. PNG transparency is preserved, which suits logos and signature scans. For drawing or typing a signature and adding a date, [Sign PDF](/tools/sign-pdf) is built for that.',
    },
    {
      q: 'Does covering text with a rectangle remove it?',
      a: 'No. The rectangle is painted over the text, but the text is still in the file and can be selected, searched or extracted. For anything confidential, use [Redact PDF](/tools/redact-pdf), which rasterises the covered area so the underlying words are genuinely removed.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'Helvetica', 'PNG', 'JPEG', 'pdf-lib', 'PDF.js', 'Adobe Acrobat'],
  keywords: ['edit pdf', 'edit pdf online free', 'add text to pdf', 'add image to pdf', 'write on a pdf', 'edit pdf without uploading', 'draw on pdf'],
  metaTitle: 'Edit PDF Online Free | Add Text, Images, Shapes',
  metaDescription: 'Edit a PDF in your browser, free: add text, images, rectangles and freehand ink to any page and save them into the file. Nothing is uploaded or stored.',
}
