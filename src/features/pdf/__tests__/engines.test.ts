import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import {
  parseRanges,
  merge,
  split,
  rotate,
  deletePages,
  extractPages,
  watermark,
  pageNumbers,
  setMetadata,
  readMetadata,
  removeMetadata,
  reorganize,
  crop,
  cropRect,
  toPoints,
  contentBoxFromLuma,
  itemsToMarkdown,
  modalHeight,
  headingLevel,
  escapeMd,
} from '../engines'
import type { MdItem, Rect } from '../engines'

async function pdfFile(name: string, pages: number) {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pages; i++) doc.addPage([200, 300])
  const bytes = await doc.save()
  return new File([bytes as BlobPart], name, { type: 'application/pdf' })
}
const pageCount = async (blob: Blob) => (await PDFDocument.load(await blob.arrayBuffer())).getPageCount()

describe('parseRanges', () => {
  it('parses mixed specs', () => {
    expect(parseRanges('1-3, 5, 8-', 10)).toEqual([0, 1, 2, 4, 7, 8, 9])
    expect(parseRanges('99', 3)).toEqual([])
    expect(parseRanges('2-2,2', 3)).toEqual([1])
  })
})

describe('pdf-lib engines', () => {
  it('merges in order', async () => {
    const [out] = await merge([await pdfFile('a.pdf', 3), await pdfFile('b.pdf', 2)])
    expect(await pageCount(out.blob)).toBe(5)
  })
  it('splits every page / every N / ranges', async () => {
    const f = await pdfFile('x.pdf', 5)
    expect((await split(f, { mode: 'single' })).length).toBe(5)
    expect((await split(f, { mode: 'every', every: 2 })).length).toBe(3)
    const r = await split(f, { mode: 'ranges', ranges: '1-2, 4-' })
    expect(r.length).toBe(2)
    expect(await pageCount(r[1].blob)).toBe(2)
    await expect(split(f, { mode: 'ranges', ranges: '' })).rejects.toThrow()
  })
  it('rotates, deletes, extracts, reorganizes', async () => {
    const f = await pdfFile('x.pdf', 4)
    const [rot] = await rotate(f, 90, '1')
    const doc = await PDFDocument.load(await rot.blob.arrayBuffer())
    expect(doc.getPage(0).getRotation().angle).toBe(90)
    expect(doc.getPage(1).getRotation().angle).toBe(0)
    expect(await pageCount((await deletePages(f, '2-3'))[0].blob)).toBe(2)
    await expect(deletePages(f, '1-4')).rejects.toThrow(/every page/)
    expect(await pageCount((await extractPages(f, '4'))[0].blob)).toBe(1)
    const [org] = await reorganize(f, [{ index: 3, rotation: 180 }, { index: 0, rotation: 0 }])
    const od = await PDFDocument.load(await org.blob.arrayBuffer())
    expect(od.getPageCount()).toBe(2)
    expect(od.getPage(0).getRotation().angle).toBe(180)
  })
  it('stamps watermark and page numbers without changing page count', async () => {
    const f = await pdfFile('x.pdf', 2)
    const [w] = await watermark(f, { text: 'DRAFT', size: 40, opacity: 0.3, rotation: 30, color: 'red', position: 'tile' })
    expect(await pageCount(w.blob)).toBe(2)
    const [n] = await pageNumbers(f, { position: 'bottom-center', format: 'n-of-total', size: 10, start: 1 })
    expect(await pageCount(n.blob)).toBe(2)
  })
  it('writes, reads and strips metadata', async () => {
    const f = await pdfFile('x.pdf', 1)
    const [m] = await setMetadata(f, { title: 'Hello', author: 'Ada', subject: 'S', keywords: 'a, b' })
    const mf = new File([await m.blob.arrayBuffer()], 'm.pdf')
    const meta = await readMetadata(mf)
    expect(meta.title).toBe('Hello')
    expect(meta.author).toBe('Ada')
    const [clean] = await removeMetadata(mf)
    const cm = await readMetadata(new File([await clean.blob.arrayBuffer()], 'c.pdf'))
    expect(cm.title).toBe('')
  })
})

// ---------------------------------------------------------------- crop
const boxesOf = async (blob: Blob): Promise<Rect[]> => {
  const doc = await PDFDocument.load(await blob.arrayBuffer())
  return doc.getPageIndices().map((i) => doc.getPage(i).getCropBox())
}
const asFile = async (blob: Blob, name = 'again.pdf') => new File([await blob.arrayBuffer()], name, { type: 'application/pdf' })
const noPages = { pages: '' }

describe('cropRect geometry', () => {
  const box: Rect = { x: 0, y: 0, width: 200, height: 300 }

  it('subtracts margins from the right sides in points', () => {
    const r = cropRect(box, 0, 'margins', { top: 10, right: 20, bottom: 30, left: 40 }, 'pt')
    expect(r).toEqual({ x: 40, y: 30, width: 140, height: 260 })
  })

  it('converts mm and percent per side', () => {
    expect(toPoints(10, 'mm', 0)).toBeCloseTo(28.3465, 3)
    expect(toPoints(10, 'percent', 200)).toBe(20)
    expect(toPoints(10, 'pt', 999)).toBe(10)
    // 10% of a 200pt width is 20pt, 10% of a 300pt height is 30pt
    const pct = cropRect(box, 0, 'margins', { top: 10, right: 10, bottom: 10, left: 10 }, 'percent')
    expect(pct).toEqual({ x: 20, y: 30, width: 160, height: 240 })
    const mm = cropRect(box, 0, 'margins', { top: 0, right: 0, bottom: 0, left: 10 }, 'mm')
    expect(mm.x).toBeCloseTo(28.3465, 3)
    expect(mm.width).toBeCloseTo(200 - 28.3465, 3)
  })

  it('keeps "top" visual on a rotated page', () => {
    // /Rotate 90 shows the page turned clockwise: the visual top is the unrotated left edge
    const r = cropRect(box, 90, 'margins', { top: 10, right: 20, bottom: 30, left: 40 }, 'pt')
    expect(r).toEqual({ x: 10, y: 40, width: 160, height: 240 })
  })

  it('reads region edges from the top-left corner', () => {
    const r = cropRect(box, 0, 'box', { left: 20, top: 30, right: 120, bottom: 230 }, 'pt')
    expect(r).toEqual({ x: 20, y: 70, width: 100, height: 200 })
  })

  it('refuses to erase the page', () => {
    expect(() => cropRect(box, 0, 'margins', { top: 200, right: 0, bottom: 200, left: 0 }, 'pt')).toThrow(/erase/)
    expect(() => cropRect(box, 0, 'box', { left: 50, top: 10, right: 50, bottom: 90 }, 'pt')).toThrow(/Region/)
  })
})

describe('crop', () => {
  it('shrinks the crop box by the margins given', async () => {
    const [out] = await crop(await pdfFile('x.pdf', 1), { mode: 'margins', top: 10, right: 20, bottom: 30, left: 40, unit: 'pt', ...noPages })
    expect((await boxesOf(out.blob))[0]).toEqual({ x: 40, y: 30, width: 140, height: 260 })
  })

  it('composes when applied twice', async () => {
    const once = (await crop(await pdfFile('x.pdf', 1), { mode: 'margins', top: 10, right: 10, bottom: 10, left: 10, unit: 'pt', ...noPages }))[0]
    const twice = (await crop(await asFile(once.blob), { mode: 'margins', top: 10, right: 10, bottom: 10, left: 10, unit: 'pt', ...noPages }))[0]
    expect((await boxesOf(once.blob))[0]).toEqual({ x: 10, y: 10, width: 180, height: 280 })
    expect((await boxesOf(twice.blob))[0]).toEqual({ x: 20, y: 20, width: 160, height: 260 })
  })

  it('throws, naming the page, when the margins exceed it', async () => {
    await expect(crop(await pdfFile('x.pdf', 2), { mode: 'margins', top: 100, right: 0, bottom: 250, left: 0, unit: 'pt', ...noPages })).rejects.toThrow(/erase page 1/)
    await expect(crop(await pdfFile('x.pdf', 1), { mode: 'margins', top: 60, right: 0, bottom: 60, left: 0, unit: 'percent', ...noPages })).rejects.toThrow(/erase/)
  })

  it('only touches the pages asked for', async () => {
    const [out] = await crop(await pdfFile('x.pdf', 3), { mode: 'margins', top: 10, right: 10, bottom: 10, left: 10, unit: 'pt', pages: '2' })
    const boxes = await boxesOf(out.blob)
    expect(boxes[0]).toEqual({ x: 0, y: 0, width: 200, height: 300 })
    expect(boxes[1]).toEqual({ x: 10, y: 10, width: 180, height: 280 })
    expect(boxes[2]).toEqual({ x: 0, y: 0, width: 200, height: 300 })
    await expect(crop(await pdfFile('x.pdf', 3), { mode: 'margins', top: 1, right: 1, bottom: 1, left: 1, unit: 'pt', pages: '9' })).rejects.toThrow(/page range/)
  })
})

describe('contentBoxFromLuma', () => {
  const bitmap = (w: number, h: number, fill: [number, number, number, number]) => {
    const d = new Uint8ClampedArray(w * h * 4)
    for (let i = 0; i < w * h; i++) d.set(fill, i * 4)
    return d
  }
  const paint = (d: Uint8ClampedArray, w: number, x: number, y: number, px: [number, number, number, number]) => d.set(px, (y * w + x) * 4)

  it('finds the ink and reports null for a blank page', () => {
    const white = bitmap(10, 10, [255, 255, 255, 255])
    expect(contentBoxFromLuma(white, 10, 10)).toBeNull()
    expect(contentBoxFromLuma(bitmap(10, 10, [0, 0, 0, 0]), 10, 10)).toBeNull() // transparent counts as blank
    const d = bitmap(10, 10, [255, 255, 255, 255])
    for (let y = 3; y < 6; y++) for (let x = 2; x < 5; x++) paint(d, 10, x, y, [0, 0, 0, 255])
    expect(contentBoxFromLuma(d, 10, 10)).toEqual({ left: 2, top: 3, right: 5, bottom: 6 })
  })

  it('ignores paper-coloured noise but keeps faint grey', () => {
    const d = bitmap(6, 6, [250, 250, 250, 255]) // slightly off-white paper, inside the tolerance
    expect(contentBoxFromLuma(d, 6, 6)).toBeNull()
    paint(d, 6, 4, 1, [180, 180, 180, 255])
    expect(contentBoxFromLuma(d, 6, 6)).toEqual({ left: 4, top: 1, right: 5, bottom: 2 })
  })
})

// ---------------------------------------------------------------- markdown
const mdLine = (str: string, y: number, height = 10, x = 50): MdItem => ({ str, x, y, width: str.length * height * 0.5, height })

const PAGE: MdItem[] = [
  mdLine('Chapter One', 700, 20),
  mdLine('A paragraph that is hyphen-', 660),
  mdLine('ated across two lines.', 648),
  mdLine('It also has a * star and _under_ scores.', 636),
  mdLine('Sub heading', 606, 14),
  mdLine('• First bullet', 580),
  mdLine('• Second bullet', 568),
  mdLine('1. Numbered item', 542),
  mdLine('Small print', 520, 7),
]

describe('pdf → markdown reconstruction', () => {
  it('picks the body height by how many characters use it', () => {
    expect(modalHeight(PAGE)).toBe(10)
    expect(modalHeight([])).toBe(12)
  })

  it('grades headings against the body height', () => {
    expect(headingLevel(20, 10)).toBe(1)
    expect(headingLevel(14, 10)).toBe(2)
    expect(headingLevel(11.5, 10)).toBe(3)
    expect(headingLevel(10, 10)).toBe(0)
  })

  it('escapes what markdown would otherwise eat', () => {
    expect(escapeMd('a * b _c_ `d` e|f')).toBe('a \\* b \\_c\\_ \\`d\\` e\\|f')
    expect(escapeMd('#5 in the list')).toBe('\\#5 in the list')
  })

  it('builds headings, lists, joined hyphens and escaped body text', () => {
    const md = itemsToMarkdown(PAGE, modalHeight(PAGE), true)
    expect(md).toContain('# Chapter One')
    expect(md).toContain('## Sub heading')
    expect(md).toContain('A paragraph that is hyphenated across two lines.')
    expect(md).toContain('has a \\* star and \\_under\\_ scores.')
    expect(md).toContain('- First bullet\n- Second bullet')
    expect(md).toContain('1. Numbered item')
    expect(md).toContain('Small print')
    expect(md).not.toContain('•')
  })

  it('leaves every line as body text when headings are off', () => {
    const md = itemsToMarkdown(PAGE, modalHeight(PAGE), false)
    expect(md).not.toContain('#')
    expect(md).toContain('Chapter One')
  })

  it('joins runs on one baseline and keeps the words apart', () => {
    const md = itemsToMarkdown([{ str: 'Hello', x: 50, y: 700, width: 30, height: 10 }, { str: 'world', x: 84, y: 700, width: 30, height: 10 }], 10, true)
    expect(md).toBe('Hello world')
  })
})
