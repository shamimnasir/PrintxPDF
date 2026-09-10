import type { ToolContent } from './types'

export const editPdf: ToolContent = {
  slug: 'edit-pdf',
  answer:
    'Edit PDF lets you add text, place PNG or JPG pictures, draw boxes and draw freehand on any page of a PDF, then saves them into the file. It puts new things on top of the existing page; the original text is not retyped or moved. Free, in your browser, nothing uploaded.',
  whatHeading: 'What does editing a PDF mean?',
  what: [
    {
      term: 'Why a PDF is not like a Word file',
      definition:
        'A PDF is a fixed-layout format: every letter is pinned to a spot on the page, and the file often carries only the letters it actually uses from each typeface. Retyping a paragraph in place would need the full typeface and a reshuffle of everything after it, which PDF was never built for. This tool takes the practical route: it draws new text, pictures, boxes and freehand lines straight onto the page, exactly where you put them.',
    },
    {
      term: 'Adding on top versus removing for good',
      definition:
        'Everything you add sits on top of the existing page. A filled box over a price hides it on screen and in print, but the original text is still in the file and can be selected or copied out from underneath. That makes this tool right for filling in blanks, marking up drafts, adding a logo or a stamp, and wrong for removing anything sensitive. For that, [Redact PDF](/tools/redact-pdf) blacks out the area and permanently removes the words.',
    },
  ],
  whyHeading: 'Why edit a PDF in the browser?',
  why: [
    { h: 'Fill in a form that has no fillable fields', x: 'Scanned or plain forms cannot be typed into by a PDF app. Click where the answer goes, type it, and download a file that looks filled.' },
    { h: 'Add a logo or stamp', x: 'Place a PNG or JPG, drag it into position, resize it from the corner, and it becomes part of the page.' },
    { h: 'Mark up a draft', x: 'Highlight a clause with a see-through box, circle a figure by hand, add a note in red. Nothing to install.' },
    { h: 'Edits are written into the page', x: 'Items are drawn into the page itself, not attached as removable notes, so every PDF app shows them and nobody can switch them off.' },
    { h: 'Private and free', x: 'The PDF and the pictures you place stay in the tab. No upload, no account, no watermark.' },
  ],
  howHeading: 'How to edit a PDF, step by step',
  how: [
    { h: 'Open Edit PDF and drop your file.', x: 'Drag one PDF onto the drop zone. The first page appears in the editor; use the arrows beside Page 1 / N to move through the document.' },
    { h: 'Pick a tool from the toolbar.', x: 'The toolbar offers **Select and move**, **Add text**, **Place an image**, **Draw a rectangle**, **Freehand ink** and **Erase**. The panel on the right sets the style for new items: text size from 6 to 72 pt, colour, Bold, Filled rectangles, line width, and how see-through a rectangle is.' },
    { h: 'Click the page to add an item.', x: 'With Add text, click where the words go; a New text item appears and you edit its wording in the panel. For a picture, choose a PNG or JPG under Image to place, then click the page. For a rectangle, drag out the shape. For freehand ink, draw with the mouse or a finger.' },
    { h: 'Adjust or remove.', x: 'Switch to Select and move to drag any item, or drag the corner square of a picture or rectangle to resize it. The panel shows the selected item and a Delete this item button; Erase deletes whatever you click. Undo, or Ctrl/Cmd+Z, steps back through the last forty changes.' },
    { h: 'Click Save & download.', x: 'The button shows how many items will be written. They are drawn into the page and `name-edited.pdf` downloads. Your original file is unchanged, so keep it if you may want to edit again.' },
  ],
  faqs: [
    {
      q: 'Can I edit the existing text in a PDF?',
      a: 'Not in place. This tool adds things on top of the page; it does not retype or move what is already there. A common workaround is a filled white box over the old wording with new text on top, bearing in mind the old text remains in the file. To rewrite a document properly, convert it with [PDF to Word](/tools/pdf-to-word), edit, and export again.',
    },
    {
      q: 'Which typefaces can I use?',
      a: 'One clean, standard typeface, regular or bold, at any size from 6 to 72 pt and in any colour. Other typefaces are not available, so text you add will not exactly match a document set in, say, Times or Calibri. The one we use is built into every PDF app, which is why it shows reliably everywhere.',
    },
    {
      q: 'Are the edits permanent?',
      a: 'Yes. Text, pictures, boxes and freehand lines are drawn into the page of the downloaded file rather than attached as removable notes, so every PDF app shows them and they cannot be hidden or deleted from a reader. Your original is untouched, so edit a copy if you may need the clean version.',
    },
    {
      q: 'Can I add a picture such as a logo or a signature?',
      a: 'Yes. Choose a PNG or JPG under Image to place, click the page to drop it, then drag it into position and resize it from the corner. See-through areas in a PNG stay see-through, which suits logos and signature scans. For drawing or typing a signature and adding a date, [Sign PDF](/tools/sign-pdf) is built for that.',
    },
    {
      q: 'Does covering text with a box remove it?',
      a: 'No. The box is painted over the text, but the text is still in the file and can be selected, searched or copied out. For anything confidential, use [Redact PDF](/tools/redact-pdf), which blacks out the area and permanently removes the words underneath.',
    },
  ],
  entities: ['PDF', 'Edit PDF', 'Add text to PDF', 'PNG', 'JPEG', 'Annotation', 'Adobe Acrobat'],
  keywords: ['edit pdf', 'edit pdf online free', 'add text to pdf', 'add image to pdf', 'write on a pdf', 'edit pdf without uploading', 'draw on pdf'],
  metaTitle: 'Edit PDF Online Free | Add Text, Pictures, Shapes',
  metaDescription: 'Edit a PDF in your browser, free: add text, pictures, boxes and freehand drawing to any page and save them into the file. Nothing is uploaded or stored.',
}
