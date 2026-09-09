// Store-only ZIP writer. Everything we archive is already compressed (PDF, JPEG, PNG),
// so deflate would add a dependency to save almost nothing.

let table: number[] | null = null
function crcTable() {
  if (table) return table
  table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
}

function crc32(buf: Uint8Array) {
  const t = crcTable()
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

/** DOS date/time, which is what the ZIP header stores. */
function dosStamp(d = new Date()) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
  return { time, date }
}

export type ZipEntry = { name: string; data: Uint8Array }

export function zipStore(files: ZipEntry[], mime = 'application/zip'): Blob {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  const { time, date } = dosStamp()
  let offset = 0

  const seen = new Set<string>()
  for (const f of files) {
    // duplicate names make some extractors silently drop entries
    let name = f.name
    let n = 2
    while (seen.has(name)) {
      const dot = f.name.lastIndexOf('.')
      name = dot === -1 ? `${f.name} (${n})` : `${f.name.slice(0, dot)} (${n})${f.name.slice(dot)}`
      n++
    }
    seen.add(name)

    const nameBytes = enc.encode(name)
    const crc = crc32(f.data)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // UTF-8 filenames
    local.setUint16(8, 0, true) // stored
    local.setUint16(10, time, true)
    local.setUint16(12, date, true)
    local.setUint32(14, crc, true)
    local.setUint32(18, f.data.length, true)
    local.setUint32(22, f.data.length, true)
    local.setUint16(26, nameBytes.length, true)
    local.setUint16(28, 0, true)
    parts.push(new Uint8Array(local.buffer), nameBytes, f.data)

    const cd = new DataView(new ArrayBuffer(46))
    cd.setUint32(0, 0x02014b50, true)
    cd.setUint16(4, 20, true)
    cd.setUint16(6, 20, true)
    cd.setUint16(8, 0x0800, true)
    cd.setUint16(10, 0, true)
    cd.setUint16(12, time, true)
    cd.setUint16(14, date, true)
    cd.setUint32(16, crc, true)
    cd.setUint32(20, f.data.length, true)
    cd.setUint32(24, f.data.length, true)
    cd.setUint16(28, nameBytes.length, true)
    cd.setUint16(30, 0, true)
    cd.setUint16(32, 0, true)
    cd.setUint16(34, 0, true)
    cd.setUint16(36, 0, true)
    cd.setUint32(38, 0, true)
    cd.setUint32(42, offset, true)
    central.push(new Uint8Array(cd.buffer), nameBytes)
    offset += 30 + nameBytes.length + f.data.length
  }

  const cdSize = central.reduce((n, p) => n + p.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(4, 0, true)
  end.setUint16(6, 0, true)
  end.setUint16(8, files.length, true)
  end.setUint16(10, files.length, true)
  end.setUint32(12, cdSize, true)
  end.setUint32(16, offset, true)
  end.setUint16(20, 0, true)

  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: mime })
}

export async function zipBlobs(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const entries = await Promise.all(files.map(async (f) => ({ name: f.name, data: new Uint8Array(await f.blob.arrayBuffer()) })))
  return zipStore(entries)
}
