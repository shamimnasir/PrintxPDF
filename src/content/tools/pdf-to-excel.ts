import type { ToolContent } from './types'

export const pdfToExcel: ToolContent = {
  slug: 'pdf-to-excel',
  answer:
    'PDF to Excel turns the text of a PDF into an .xlsx workbook in your browser. Each page becomes a sheet, each line a row, and wide gaps or tabs split a line into cells. It is best-effort text extraction: ruled table borders are not detected. Nothing is uploaded.',
  whatHeading: 'What are PDF and XLSX?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) stores a page as positioned text, lines and images. A table in a PDF is just text runs and drawn rules that happen to line up; the file does not say which text belongs to which cell. That is why pulling a table out of a PDF is guesswork for every converter, and why this tool tells you plainly that it works from the spacing between words.',
    },
    {
      term: 'What is an XLSX file?',
      definition:
        'XLSX is the Excel workbook format defined by **Office Open XML** SpreadsheetML (ISO/IEC 29500): a ZIP archive of XML parts, one per worksheet, plus shared strings and styles. It opens in Microsoft Excel, Google Sheets, LibreOffice Calc and Numbers. Once your PDF text is in cells, you can sort, filter, sum and chart it, which is impossible in the PDF.',
    },
  ],
  whyHeading: 'Why convert PDF to Excel?',
  why: [
    { h: 'Get the numbers into cells', x: 'Bank statements, price lists and reports arrive as PDF. In a spreadsheet you can total a column, sort by date or filter by supplier in seconds.' },
    { h: 'Stop retyping', x: 'Even a rough grid saves the slow, error-prone job of copying figures by hand. Fix the odd misplaced cell instead of typing every one.' },
    { h: 'One sheet per page', x: 'Each PDF page lands on its own sheet named `Page 1`, `Page 2` and so on, so a long statement stays navigable.' },
    { h: 'Nothing leaves your computer', x: 'Text extraction and workbook building both run in the browser. Financial documents are never uploaded, and there is no account to sign up for.' },
  ],
  howHeading: 'How to convert PDF to Excel, step by step',
  how: [
    { h: 'Open PDF to Excel and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. The PDF is read locally with **pdf.js**.' },
    { h: 'Run PDF to Excel', x: 'There are no options. Click **Run PDF to Excel**. Each page is extracted as lines, and each line is split into cells wherever there are two or more spaces or a tab.' },
    { h: 'Download the .xlsx', x: 'The workbook downloads automatically, named after the PDF, with one sheet per page. A note under the result reminds you how the cells were split.' },
    { h: 'Clean up in Excel', x: 'Values arrive as text. Select the columns and use **Text to Columns** or **Convert to Number** so Excel treats figures as numbers. Delete header and footer rows you do not need.' },
  ],
  faqs: [
    { q: 'Will PDF to Excel detect my tables properly?', a: 'Not reliably. The tool cannot see ruled cell borders; it splits each line where the text has a gap of two or more spaces or a tab. Tables with generous spacing between columns come out well. Tightly packed tables, wrapped cells and merged headers need tidying by hand.' },
    { q: 'Why are my numbers stored as text?', a: 'Every cell is written as a text string, so Excel shows a small warning triangle and will not sum them yet. Select the column and choose **Convert to Number**, or use **Text to Columns** with the default settings, and Excel reinterprets the values.' },
    { q: 'Why is the workbook empty?', a: 'The PDF has no text layer, so it is a scan or an image export. Run [OCR PDF](/tools/ocr-pdf) first to recognise the characters, then convert the searchable copy. Handwriting and low-quality scans will still need manual checking.' },
    { q: 'Can I convert only one page?', a: 'The whole document is converted, but every page gets its own sheet, so just delete the sheets you do not need. Alternatively run [Extract Pages](/tools/extract-pages) first and convert the shorter PDF.' },
    { q: 'Is my PDF uploaded?', a: 'No. Extraction runs with pdf.js and the .xlsx is written with the SheetJS library, both inside your browser tab. Statements, invoices and payroll never reach a server, and nothing is kept after you close the page.' },
  ],
  entities: ['PDF', 'ISO 32000', 'XLSX', 'Office Open XML', 'ISO/IEC 29500', 'Microsoft Excel', 'Google Sheets', 'SheetJS'],
  keywords: ['pdf to excel', 'convert pdf to excel free', 'pdf to xlsx', 'pdf table to excel', 'pdf to excel online', 'extract data from pdf to excel', 'pdf to spreadsheet'],
  metaTitle: 'PDF to Excel: Convert PDF Text to XLSX Free',
  metaDescription: 'Convert PDF to Excel in your browser: one sheet per page, one row per line, cells split on wide gaps. Best-effort extraction, free, no upload, no sign-up.',
}
