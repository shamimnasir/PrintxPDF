// Dependency-free ZIP reader: EOCD → central directory → local headers.
// Supports store (0) and deflate (8, via DecompressionStream). ZIP64, encryption
// and every other method are reported with a clear message instead of garbage.

export class ZipError extends Error {
  code: 'not-zip' | 'truncated' | 'zip64' | 'encrypted' | 'method' | 'no-inflate' | 'crc' | 'corrupt'
  constructor(code: ZipError['code'], message: string) {
    super(message)
    this.name = 'ZipError'
    this.code = code
  }
}

export type ZipEntryInfo = {
  /** name exactly as stored (already decoded to a string) */
  name: string
  /** traversal-safe relative path, forward slashes, no `..`/drive/root */
  safeName: string
  isDir: boolean
  /** 0 = stored, 8 = deflate; anything else is unsupported */
  method: number
  compressedSize: number
  size: number
  crc32: number
  /** absolute offset of the local file header */
  localOffset: number
  utf8: boolean
  encrypted: boolean
  zip64: boolean
  /** DOS date/time turned into a Date (local time) */
  modified: Date
}

export type ZipListing = {
  entries: ZipEntryInfo[]
  comment: string
  /** notes worth surfacing in the UI (Latin-1 fallback, nested zips, ...) */
  notes: string[]
}

const SIG_LOCAL = 0x04034b50
const SIG_CENTRAL = 0x02014b50
const SIG_EOCD = 0x06054b50
const SIG_ZIP64_LOCATOR = 0x07064b50
const EOCD_MIN = 22
const MAX_COMMENT = 0xffff

const utf8Strict = new TextDecoder('utf-8', { fatal: true })
const latin1 = new TextDecoder('latin1')

/** Bit 11 set → UTF-8. Otherwise the spec says CP437; we try UTF-8 (what macOS/7-Zip write) and fall back to Latin-1. */
export function decodeName(bytes: Uint8Array, utf8Flag: boolean): { name: string; fallback: boolean } {
  if (utf8Flag) return { name: new TextDecoder('utf-8').decode(bytes), fallback: false }
  try {
    return { name: utf8Strict.decode(bytes), fallback: false }
  } catch {
    return { name: latin1.decode(bytes), fallback: true }
  }
}

/** Strips `..`, `.`, empty segments, drive letters and leading slashes so a hostile name cannot escape a folder. */
export function sanitizeZipPath(name: string): string {
  const parts = name
    .replace(/\\/g, '/')
    .replace(/^[a-zA-Z]:/, '')
    .split('/')
    .map((p) => p.trim())
    .filter((p) => p && p !== '.' && p !== '..')
    // eslint-disable-next-line no-control-regex
    .map((p) => p.replace(/[\x00-\x1f<>:"|?*]/g, '_'))
  return parts.join('/') || 'unnamed'
}

export function baseName(path: string) {
  const i = path.lastIndexOf('/')
  return i === -1 ? path : path.slice(i + 1)
}

export function canInflate() {
  return typeof DecompressionStream === 'function'
}

function dosDate(time: number, date: number) {
  return new Date(1980 + (date >> 9), ((date >> 5) & 15) - 1, date & 31, time >> 11, (time >> 5) & 63, (time & 31) * 2)
}

let crcTable: Uint32Array | null = null
export function crc32(buf: Uint8Array) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function findEocd(dv: DataView, len: number): number {
  const floor = Math.max(0, len - EOCD_MIN - MAX_COMMENT)
  for (let i = len - EOCD_MIN; i >= floor; i--) {
    if (dv.getUint32(i, true) !== SIG_EOCD) continue
    const commentLen = dv.getUint16(i + 20, true)
    // the record must end exactly at the buffer end (a comment may follow it)
    if (i + EOCD_MIN + commentLen === len) return i
  }
  return -1
}

/** Parses the directory only; entry bytes are read on demand by `readZipEntry`. */
export function listZip(bytes: Uint8Array): ZipListing {
  const len = bytes.byteLength
  if (len < EOCD_MIN) throw new ZipError('truncated', 'This file is too small to be a ZIP archive.')
  const dv = new DataView(bytes.buffer, bytes.byteOffset, len)
  const eocd = findEocd(dv, len)
  if (eocd === -1) {
    const looksZip = dv.getUint32(0, true) === SIG_LOCAL
    throw new ZipError(
      looksZip ? 'truncated' : 'not-zip',
      looksZip ? 'The end of this ZIP is missing. The file looks truncated or is still being written.' : 'This is not a ZIP archive.',
    )
  }
  const diskEntries = dv.getUint16(eocd + 8, true)
  const totalEntries = dv.getUint16(eocd + 10, true)
  const cdSize = dv.getUint32(eocd + 12, true)
  const cdOffset = dv.getUint32(eocd + 16, true)
  const commentLen = dv.getUint16(eocd + 20, true)
  const comment = latin1.decode(bytes.subarray(eocd + 22, eocd + 22 + commentLen))

  const hasZip64Locator = eocd >= 20 && dv.getUint32(eocd - 20, true) === SIG_ZIP64_LOCATOR
  if (hasZip64Locator || totalEntries === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    throw new ZipError('zip64', 'This is a ZIP64 archive (over 4 GB or 65,535 files), which this tool cannot open in the browser.')
  }
  if (diskEntries !== totalEntries) throw new ZipError('zip64', 'Multi-disk (spanned) ZIP archives are not supported.')
  if (cdOffset + cdSize > eocd) throw new ZipError('truncated', 'The ZIP central directory points outside the file. The archive is truncated or corrupt.')

  const entries: ZipEntryInfo[] = []
  const notes = new Set<string>()
  let p = cdOffset
  for (let n = 0; n < totalEntries; n++) {
    if (p + 46 > eocd || dv.getUint32(p, true) !== SIG_CENTRAL) {
      throw new ZipError('corrupt', `Central directory entry ${n + 1} of ${totalEntries} is damaged.`)
    }
    const flags = dv.getUint16(p + 8, true)
    const method = dv.getUint16(p + 10, true)
    const time = dv.getUint16(p + 12, true)
    const date = dv.getUint16(p + 14, true)
    const crc = dv.getUint32(p + 16, true)
    const compressedSize = dv.getUint32(p + 20, true)
    const size = dv.getUint32(p + 24, true)
    const nameLen = dv.getUint16(p + 28, true)
    const extraLen = dv.getUint16(p + 30, true)
    const cmtLen = dv.getUint16(p + 32, true)
    const localOffset = dv.getUint32(p + 42, true)
    const nameStart = p + 46
    if (nameStart + nameLen + extraLen + cmtLen > eocd) throw new ZipError('truncated', 'A file name runs past the end of the archive.')
    const utf8 = (flags & 0x0800) !== 0
    const decoded = decodeName(bytes.subarray(nameStart, nameStart + nameLen), utf8)
    if (decoded.fallback) notes.add('Some file names had no UTF-8 flag and were decoded as Latin-1; accented characters may look wrong.')
    const name = decoded.name
    const zip64 = compressedSize === 0xffffffff || size === 0xffffffff || localOffset === 0xffffffff || hasZip64Extra(dv, nameStart + nameLen, extraLen)
    const safeName = sanitizeZipPath(name)
    if (safeName !== name.replace(/\/+$/, '') && !name.endsWith('/')) notes.add('Some entry paths contained ".." or absolute paths and were renamed to stay inside one folder.')
    if (/\.zip$/i.test(name)) notes.add('This archive contains another ZIP. Download it, then open it with this tool to see inside.')
    entries.push({
      name,
      safeName,
      isDir: name.endsWith('/') && size === 0,
      method,
      compressedSize,
      size,
      crc32: crc,
      localOffset,
      utf8,
      encrypted: (flags & 0x0001) !== 0,
      zip64,
      modified: dosDate(time, date),
    })
    p = nameStart + nameLen + extraLen + cmtLen
  }
  return { entries, comment, notes: [...notes] }
}

function hasZip64Extra(dv: DataView, start: number, extraLen: number) {
  let q = start
  const end = start + extraLen
  while (q + 4 <= end) {
    const id = dv.getUint16(q, true)
    const sz = dv.getUint16(q + 2, true)
    if (id === 0x0001) return true
    q += 4 + sz
  }
  return false
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (!canInflate()) {
    throw new ZipError('no-inflate', 'This browser lacks DecompressionStream, which is needed for compressed entries. Try a current Chrome, Edge, Firefox or Safari 16.4+.')
  }
  const src = new ReadableStream<Uint8Array<ArrayBuffer>>({
    start(c) {
      c.enqueue(data as Uint8Array<ArrayBuffer>)
      c.close()
    },
  })
  const reader = src.pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.byteLength
  }
  const out = new Uint8Array(total)
  let o = 0
  for (const c of chunks) {
    out.set(c, o)
    o += c.byteLength
  }
  return out
}

/** Returns the uncompressed bytes of one entry, verified against its CRC-32. */
export async function readZipEntry(bytes: Uint8Array, entry: ZipEntryInfo): Promise<Uint8Array> {
  if (entry.encrypted) throw new ZipError('encrypted', `"${baseName(entry.safeName)}" is password-protected. Encrypted entries cannot be opened here.`)
  if (entry.zip64) throw new ZipError('zip64', `"${baseName(entry.safeName)}" uses ZIP64 fields, which this tool cannot read.`)
  if (entry.method !== 0 && entry.method !== 8) {
    throw new ZipError('method', `"${baseName(entry.safeName)}" uses compression method ${entry.method}. Only stored and deflated entries are supported.`)
  }
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const lo = entry.localOffset
  if (lo + 30 > bytes.byteLength || dv.getUint32(lo, true) !== SIG_LOCAL) throw new ZipError('corrupt', `The local header for "${baseName(entry.safeName)}" is missing.`)
  const nameLen = dv.getUint16(lo + 26, true)
  const extraLen = dv.getUint16(lo + 28, true)
  const start = lo + 30 + nameLen + extraLen
  const end = start + entry.compressedSize
  if (end > bytes.byteLength) throw new ZipError('truncated', `The data for "${baseName(entry.safeName)}" runs past the end of the file.`)
  const raw = bytes.subarray(start, end)
  const out = entry.method === 0 ? raw : await inflateRaw(raw)
  if (out.byteLength !== entry.size) throw new ZipError('corrupt', `"${baseName(entry.safeName)}" decompressed to ${out.byteLength} bytes, expected ${entry.size}.`)
  if (entry.size > 0 && crc32(out) !== entry.crc32) throw new ZipError('crc', `"${baseName(entry.safeName)}" failed its CRC check; the archive is corrupt.`)
  // copy so callers never hold the whole archive alive through a subarray view
  return entry.method === 0 ? out.slice() : out
}

/** Convenience: parse once, then read entries lazily. */
export function openZip(bytes: Uint8Array) {
  const listing = listZip(bytes)
  return { ...listing, read: (entry: ZipEntryInfo) => readZipEntry(bytes, entry) }
}
