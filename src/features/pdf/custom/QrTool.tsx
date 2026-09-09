import { useEffect, useState } from 'react'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob } from '../../../lib/download'
import { qrPdf, qrPng, qrSvg } from '../engines'

type Kind = 'url' | 'text' | 'wifi' | 'email' | 'sms' | 'phone' | 'vcard'

// hoisted so typing does not remount the input and lose focus
function Input({ k, label, placeholder, type = 'text', f, set }: { k: string; label: string; placeholder?: string; type?: string; f: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="field" style={{ margin: 0 }}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={f[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </div>
  )
}

export default function QrTool() {
  const { toast } = useToast()
  const [kind, setKind] = useState<Kind>('url')
  const [f, setF] = useState<Record<string, string>>({ url: 'https://', text: '', ssid: '', pass: '', enc: 'WPA', email: '', subject: '', body: '', phone: '', sms: '', name: '', org: '', tel: '', vmail: '', site: '' })
  const [dark, setDark] = useState('#0b0b0f')
  const [light, setLight] = useState('#ffffff')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(2)
  const [preview, setPreview] = useState('')
  const [tooLong, setTooLong] = useState(false)

  const set = (k: string, v: string) => setF((o) => ({ ...o, [k]: v }))

  const payload = (() => {
    switch (kind) {
      case 'url':
        return f.url
      case 'text':
        return f.text
      case 'wifi':
        return `WIFI:T:${f.enc};S:${f.ssid};P:${f.pass};;`
      case 'email':
        return `mailto:${f.email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(f.body)}`
      case 'sms':
        return `SMSTO:${f.phone}:${f.sms}`
      case 'phone':
        return `tel:${f.phone}`
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${f.name}\nFN:${f.name}\nORG:${f.org}\nTEL:${f.tel}\nEMAIL:${f.vmail}\nURL:${f.site}\nEND:VCARD`
    }
  })()

  useEffect(() => {
    if (!payload || payload === 'https://') {
      setPreview('')
      return
    }
    let alive = true
    let url = ''
    qrPng(payload, { size: 320, dark, light, margin })
      .then((b) => {
        if (!alive) return
        url = URL.createObjectURL(b)
        setPreview(url)
        setTooLong(false)
      })
      .catch(() => alive && setTooLong(true)) // payload exceeds QR capacity (~2.9k chars)
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [payload, dark, light, margin])

  const dl = async (fmt: 'png' | 'svg' | 'pdf') => {
    if (!payload) return toast('Fill in the content first', 'error')
    try {
      if (fmt === 'png') downloadBlob(await qrPng(payload, { size, dark, light, margin }), 'qr-code.png')
      if (fmt === 'svg') downloadBlob(new Blob([await qrSvg(payload, { dark, light, margin })], { type: 'image/svg+xml' }), 'qr-code.svg')
      if (fmt === 'pdf') downloadBlob(await qrPdf(payload, kind === 'url' ? f.url : kind), 'qr-code.pdf')
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <div className="tool-grid">
      <div className="card stack">
        <div className="tabs">
          {(['url', 'text', 'wifi', 'email', 'sms', 'phone', 'vcard'] as Kind[]).map((k) => (
            <button key={k} className={`tab ${kind === k ? 'active' : ''}`} onClick={() => setKind(k)}>
              {k}
            </button>
          ))}
        </div>
        {kind === 'url' && <Input k="url" label="Web address" placeholder="https://example.com" f={f} set={set} />}
        {kind === 'text' && (
          <div className="field" style={{ margin: 0 }}>
            <label className="label">Text</label>
            <textarea className="textarea" style={{ minHeight: 100 }} value={f.text} onChange={(e) => set('text', e.target.value)} />
          </div>
        )}
        {kind === 'wifi' && (
          <>
            <Input k="ssid" label="Network name (SSID)" f={f} set={set} />
            <Input k="pass" label="Password" f={f} set={set} />
            <div className="field" style={{ margin: 0 }}>
              <label className="label">Security</label>
              <select className="select" value={f.enc} onChange={(e) => set('enc', e.target.value)}>
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open</option>
              </select>
            </div>
          </>
        )}
        {kind === 'email' && (
          <>
            <Input k="email" label="To" placeholder="someone@example.com" f={f} set={set} />
            <Input k="subject" label="Subject" f={f} set={set} />
            <Input k="body" label="Message" f={f} set={set} />
          </>
        )}
        {kind === 'sms' && (
          <>
            <Input k="phone" label="Phone number" f={f} set={set} />
            <Input k="sms" label="Message" f={f} set={set} />
          </>
        )}
        {kind === 'phone' && <Input k="phone" label="Phone number" placeholder="+1 555 0100" f={f} set={set} />}
        {kind === 'vcard' && (
          <>
            <Input k="name" label="Full name" f={f} set={set} />
            <Input k="org" label="Organisation" f={f} set={set} />
            <Input k="tel" label="Phone" f={f} set={set} />
            <Input k="vmail" label="Email" f={f} set={set} />
            <Input k="site" label="Website" f={f} set={set} />
          </>
        )}
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div>
            <label className="label">Dark</label>
            <input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="input" style={{ height: 48, padding: 4 }} />
          </div>
          <div>
            <label className="label">Light</label>
            <input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="input" style={{ height: 48, padding: 4 }} />
          </div>
        </div>
        <div className="grid grid-2" style={{ gap: '1rem' }}>
          <div>
            <label className="label">PNG size · {size}px</label>
            <input type="range" min={128} max={2048} step={64} value={size} onChange={(e) => setSize(+e.target.value)} style={{ width: '100%', accentColor: 'var(--ink)' }} />
          </div>
          <div>
            <label className="label">Quiet zone · {margin}</label>
            <input type="range" min={0} max={8} value={margin} onChange={(e) => setMargin(+e.target.value)} style={{ width: '100%', accentColor: 'var(--ink)' }} />
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="qr-preview">
          {tooLong ? <span className="alarm" style={{ fontWeight: 700 }}>Too much content for one QR code. Shorten it.</span> : preview ? <img src={preview} alt="QR code preview" /> : <span className="muted">Preview appears here</span>}
        </div>
        <button className="btn btn-acid btn-block" onClick={() => dl('png')}>
          Download PNG
        </button>
        <button className="btn btn-block" onClick={() => dl('svg')}>
          Download SVG
        </button>
        <button className="btn btn-ink btn-block" onClick={() => dl('pdf')}>
          Print-ready PDF
        </button>
        <pre className="code" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{payload || ', '}</pre>
      </div>
    </div>
  )
}
