import type { ToolContent } from './types'

export const excelToPdf: ToolContent = {
  slug: 'excel-to-pdf',
  answer:
    'Excel to PDF turns an .xlsx, .xls or .csv spreadsheet into a PDF in your browser. Each sheet becomes its own section with the sheet name as a heading, and rows and columns are drawn as a table on A4 pages. Values are kept, styling is simplified. Nothing is uploaded.',
  whatHeading: 'What are XLSX and PDF?',
  what: [
    {
      term: 'XLSX, XLS and CSV: three kinds of spreadsheet file',
      definition:
        'XLSX is the file Excel saves by default today. It holds every sheet in the workbook, plus the formulas, styles and cell values. XLS is the older Excel format from before 2007 and holds the same kind of thing in an older way. CSV is the simplest of the three: plain text with one row per line and commas between the cells, with no colours, no formulas and only one sheet. This tool reads all three.',
    },
    {
      term: 'PDF: a page that cannot be resorted',
      definition:
        'A PDF is a fixed page. Each page has a set size and every item on it sits in a set place, so it prints and displays the same everywhere. A spreadsheet saved as a PDF cannot be recalculated, resorted or quietly edited by the person who receives it. That is exactly what you want when you send a price list, a statement or a report for the record.',
    },
  ],
  whyHeading: 'Why convert Excel to PDF?',
  why: [
    { h: 'Share numbers that cannot be edited', x: 'A PDF price list or expense report is read-only for the recipient. Nobody can nudge a cell, hide a column or break a formula before forwarding it.' },
    { h: 'Print without surprises', x: 'Spreadsheets print unpredictably. The PDF lays each sheet out on A4 pages so what you preview is what comes out of the printer.' },
    { h: 'Open without Excel', x: 'Not everyone has Excel or wants to open a workbook from an unknown sender. A PDF opens in any browser or phone.' },
    { h: 'Keep the workbook private', x: 'The file is read and drawn inside your browser tab. Payroll, budgets and customer lists are never uploaded to a server.' },
  ],
  howHeading: 'How to convert Excel to PDF, step by step',
  how: [
    { h: 'Open Excel to PDF and drop your spreadsheet', x: 'Drag an .xlsx, .xls or .csv file onto the drop zone, or click to choose it from your computer.' },
    { h: 'Run Excel to PDF', x: 'There are no options to set. Click **Run Excel to PDF**. The workbook is read, then each sheet is laid out as a table with its name as a heading.' },
    { h: 'Download the PDF', x: 'The PDF downloads automatically, named after the workbook. Each sheet starts on a new page, in the order the sheets appear in Excel.' },
    { h: 'Check wide sheets', x: 'Pages are A4 portrait. A sheet with many columns is shrunk to fit the page width and may be small. For a readable print, split very wide sheets into narrower ones in Excel first, or hide columns you do not need.' },
  ],
  faqs: [
    { q: 'Will Excel to PDF keep my formulas?', a: 'The PDF shows the last calculated value of each formula cell, as saved by Excel, not the formula itself. If a workbook was saved without recalculating, the values may be out of date: press F9 in Excel and save before converting.' },
    { q: 'Does it keep colours, borders and charts?', a: 'No. Cell values, merged cells and the row and column grid are drawn as a plain table. Fill colours, fonts, colour rules, charts, pictures and comments are not carried over. For a styled export, use the built-in PDF export in Excel or Google Sheets.' },
    { q: 'Can I select or search text in the PDF?', a: 'No. Each page is saved as a picture of the table, so the text cannot be selected or searched. If you need a searchable copy, run the result through [OCR PDF](/tools/ocr-pdf), which turns a picture of text back into real text.' },
    { q: 'Does it convert every sheet in the workbook?', a: 'Yes. Every sheet becomes its own section with the sheet name as a heading and a page break before the next sheet. Hidden sheets are included as well. If you want only one sheet, copy it into a new workbook first.' },
    { q: 'Is my spreadsheet uploaded?', a: 'No. The workbook is read inside your browser and the PDF is built there too. Nothing leaves your computer, and there is no account or file history to clear.' },
  ],
  entities: ['Microsoft Excel', 'XLSX', 'XLS', 'CSV', 'PDF', 'Google Sheets', 'A4'],
  keywords: ['excel to pdf', 'convert excel to pdf free', 'xlsx to pdf', 'csv to pdf', 'excel to pdf online', 'spreadsheet to pdf converter', 'xls to pdf'],
  metaTitle: 'Excel to PDF: Convert XLSX, XLS or CSV to PDF Free',
  metaDescription: 'Convert Excel to PDF in your browser. Every sheet becomes a titled table on A4 pages, values intact and read-only. Free, no sign-up, nothing uploaded.',
}
