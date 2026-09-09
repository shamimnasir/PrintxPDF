import { Link } from 'react-router-dom'
import { useSiteConfig } from '../../admin/useSiteConfig'
import { authorPath } from '../../lib/seo'
import { Avatar } from './Avatar'

const LABEL: Record<string, string> = { linkedin: 'LinkedIn', x: 'X', github: 'GitHub', website: 'Website' }

/** Credibility block under a guide: who wrote it, and where to read more of them. */
export function AuthorBox() {
  const cfg = useSiteConfig()
  const a = cfg.author
  const links = Object.entries(a.links).filter(([, v]) => v)
  return (
    <aside className="author-box">
      <Avatar src={a.photo} name={a.name} size={72} />
      <div className="author-box-body">
        <span className="label">Written by</span>
        <h3>
          <Link to={authorPath(a)}>{a.name}</Link>
        </h3>
        <p className="author-box-title">{a.title}</p>
        {a.bio && <p>{a.bio}</p>}
        <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to={authorPath(a)} className="btn btn-sm">
            All guides by {a.name.split(' ')[0]}
          </Link>
          {links.map(([k, v]) => (
            <a key={k} href={v} className="btn btn-sm btn-ghost" rel="me noopener" target="_blank">
              {LABEL[k] || k}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
