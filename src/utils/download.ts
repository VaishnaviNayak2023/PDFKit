/** Store-only ZIP (no compression) for bundling multiple local outputs. */

function crc32(data: Uint8Array): number {
  let crc = ~0
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return ~crc >>> 0
}

function u16(n: number): Uint8Array {
  return new Uint8Array([n & 255, (n >>> 8) & 255])
}

function u32(n: number): Uint8Array {
  return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255])
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

export async function zipFiles(
  files: Array<{ name: string; data: Uint8Array | Blob | ArrayBuffer }>
): Promise<Blob> {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name.replace(/\\/g, '/'))
    let data: Uint8Array
    if (file.data instanceof Uint8Array) data = file.data
    else if (file.data instanceof ArrayBuffer) data = new Uint8Array(file.data)
    else data = new Uint8Array(await file.data.arrayBuffer())

    const crc = crc32(data)
    const local = concat([
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data
    ])
    locals.push(local)

    const central = concat([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes
    ])
    centrals.push(central)
    offset += local.length
  }

  const centralDir = concat(centrals)
  const end = concat([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0)
  ])

  return new Blob([concat([...locals, centralDir, end])], { type: 'application/zip' })
}

export function downloadBlob(data: Blob | Uint8Array | ArrayBuffer, filename: string, mime = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 8000)
}

export function toUint8(data: Uint8Array | ArrayBuffer | Blob): Promise<Uint8Array> | Uint8Array {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  return data.arrayBuffer().then(buf => new Uint8Array(buf))
}
