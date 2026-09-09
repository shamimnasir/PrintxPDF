/** Renders the site name, highlighting the "x" when the name has one (PrintxPDF). */
export function Wordmark({ name }: { name: string }) {
  const clean = name.trim() || 'PrintxPDF'
  const m = clean.match(/^(.*?)x(pdf.*)$/i)
  if (!m) return <span>{clean}</span>
  return (
    <span>
      {m[1]}
      <span className="x">x</span>
      {m[2]}
    </span>
  )
}

export const initial = (name: string) => (name.trim() || 'P').charAt(0).toUpperCase()
