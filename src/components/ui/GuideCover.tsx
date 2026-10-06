import { guideCoverAlt, guideCoverUrl } from './guideCoverUtils'

export function GuideCover({
  locale = 'en',
  compact = false,
  topic,
  title,
}: {
  locale?: string
  compact?: boolean
  topic: string
  title: string
}) {
  return (
    <figure className={`guide-cover${compact ? ' guide-cover-compact' : ''}`}>
      <img
        src={guideCoverUrl(topic)}
        alt={guideCoverAlt(locale, topic, title)}
        lang={locale}
        width="1200"
        height="800"
        loading="lazy"
        decoding="async"
      />
    </figure>
  )
}
