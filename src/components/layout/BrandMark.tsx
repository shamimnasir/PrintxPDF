/** The compact PrintxPDF mark, shared by the header and footer. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="PrintxPDF mark"
    >
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path d="M18 10h22l10 10v34H18z" fill="var(--brand-paper, #fff)" />
      <path d="M40 10v12h12" fill="none" stroke="var(--brand-blue, #2b5bff)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M25 28h15a6 6 0 0 1 0 12H25zM25 40v10" fill="none" stroke="var(--brand-blue, #2b5bff)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m42 43 8 8m0-8-8 8" stroke="var(--brand-red, #ff3b1f)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
