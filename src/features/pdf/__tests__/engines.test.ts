import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { parseRanges, merge, split, rotate, deletePages, extractPages, watermark, pageNumbers, setMetadata, readMetadata, removeMetadata, reorganize } from '../engines'

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
