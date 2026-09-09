import { useState } from 'react'

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/**
 * Author portrait. Falls back to initials when there is no photo set, or when the file is
 * missing or fails to load, so a byline never renders as a broken image.
 */
export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size, flex: `0 0 ${size}px` }
  if (!src || failed) {
    return (
      <span className="avatar avatar-fallback" style={{ ...style, fontSize: Math.round(size * 0.38) }} aria-hidden>
        {initialsOf(name)}
      </span>
    )
  }
  return <img className="avatar" src={src} alt={name} width={size} height={size} style={style} loading="lazy" decoding="async" onError={() => setFailed(true)} />
}
