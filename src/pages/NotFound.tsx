import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  useSeo({ title: 'Page not found | PrintxPDF', description: 'That page does not exist.', path: '/404', noindex: true })
  return (
    <div className="container section center">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 20vw, 12rem)', lineHeight: 1 }}>404</div>
      <h2>That page got deleted. Probably in Delete mode.</h2>
      <Link to="/" className="btn btn-acid btn-lg">
        Back home
      </Link>
    </div>
  )
}
