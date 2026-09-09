import type { ToolContent } from './types'

export const excelToPdf: ToolContent = {
  slug: 'excel-to-pdf',
  answer:
    'Excel to PDF converts an .xlsx, .xls or .csv spreadsheet into a PDF in your browser. Every sheet becomes its own section, headed by the sheet name, with rows and columns drawn as a table on A4 pages. Cell values are kept, styling is simplified. Nothing is uploaded.',
  whatHeading: 'What are XLSX and PDF?',
  what: [
    {
      term: 'What is an XLSX file?',
      definition:
        'XLSX is the Microsoft Excel workbook format introduced with Excel 2007, defined by **Office Open XML** SpreadsheetML (ISO/IEC 29500). The file is a ZIP archive of XML parts: one per worksheet, plus shared strings, styles and formulas. The older **.xls** format is a binary container, and **.csv** is plain text with comma-separated values and no formatting at all. This tool reads all three.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) is a fixed-layout format: each page has a set size and every element a set position, so the document prints and displays identically everywhere. A spreadsheet saved as PDF cannot be recalculated or resorted by the reader, which is exactly what you want when sending a price list, a statement or a report for the record.',
    },
  ],
  whyHeading: 'Why convert Excel to PDF?',
  why: [
    { h: 'Share numbers that cannot be edited', x: 'A PDF price list or expense report is read-only for the recipient. Nobody can nudge a cell, hide a column or break a formula before forwarding it.' },
    { h: 'Print without surprises', x: 'Spreadsheets print unpredictably. The PDF lays each sheet out on A4 pages so what you preview is what comes out of the printer.' },
    { h: 'Open without Excel', x: 'Not everyone has Excel or wants to open a workbook from an unknown sender. A PDF opens in any browser or phone.' },
    { h: 'Keep the workbook private', x: 'The file is parsed and drawn inside your browser tab. Payroll, budgets and customer lists are never uploaded to a server.' },
  ],
  howHeading: 'How to convert Excel to PDF, step by step',
  how: [
    { h: 'Open Excel to PDF and drop your spreadsheet', x: 'Drag an .xlsx, .xls or .csv file onto the drop zone, or click to choose it from your computer.' },
    { h: 'Run Excel to PDF', x: 'There are no options to set. Click **Run Excel to PDF**. The workbook is read, then each sheet is laid out as a table with its name as a heading.' },
    { h: 'Download the PDF', x: 'The PDF downloads automatically, named after the workbook. Each sheet starts on a new page, in the order the sheets appear in Excel.' },
    { h: 'Check wide sheets', x: 'Pages are A4 portrait. A sheet with many columns is scaled to the page width and may be small. For a readable print, split very wide sheets into narrower ones in Excel first, or hide columns you do not need.' },
  ],
  faqs: [
    { q: 'Will Excel to PDF keep my formulas?', a: 'The PDF shows the last calculated value of each formula cell, as saved by Excel, not the formula itself. If a workbook was saved without recalculating, the values may be stale: press F9 in Excel and save before converting.' },
    { q: 'Does it keep colours, borders and charts?', a: 'No. Cell values, merged cells and the row and column grid are drawn as a plain table. Fill colours, fonts, conditional formatting, charts, images and comments are not carried over. For a styled export, use Excel or Google Sheets built-in PDF export.' },
    { q: 'Can I select or search text in the PDF?', a: 'No. Each page is rendered as an image, so the text is not selectable. If you need a searchable copy, run the result through [OCR PDF](/tools/ocr-pdf) to add a text layer.' },
    { q: 'Does it convert every sheet in the workbook?', a: 'Yes. Every worksheet becomes its own section with the sheet name as a heading and a page break before the next sheet. Hidden sheets are included as well. If you want only one sheet, copy it into a new workbook first.' },
    { q: 'Is my spreadsheet uploaded?', a: 'No. The workbook is read with the SheetJS library inside your browser and the PDF is generated there too. Nothing leaves your computer, and there is no account or file history to clear.' },
  ],
  entities: ['Microsoft Excel', 'XLSX', 'Office Open XML', 'ISO/IEC 29500', 'CSV', 'PDF', 'ISO 32000', 'SheetJS'],
  keywords: ['excel to pdf', 'convert excel to pdf free', 'xlsx to pdf', 'csv to pdf', 'excel to pdf online', 'spreadsheet to pdf converter', 'xls to pdf'],
  metaTitle: 'Excel to PDF: Convert XLSX, XLS or CSV to PDF Free',
  metaDescription: 'Convert Excel to PDF in your browser. Every sheet becomes a titled table on A4 pages, values intact and read-only. Free, no sign-up, nothing uploaded.',
}
