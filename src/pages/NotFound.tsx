import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  useSeo({ title: 'Page not found | PrintxPDF', description: 'This page does not exist. Head back to the PrintxPDF home page to find the print tool, PDF tool or guide you were looking for.', path: '/404', noindex: true })
  return (
    <div className="container section center">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 20vw, 12rem)', lineHeight: 1 }}>404</div>
      <h2>We could not find that page. It may have moved or been removed.</h2>
      <Link to="/" className="btn btn-acid btn-lg">
        Back home
      </Link>
    </div>
  )
}
