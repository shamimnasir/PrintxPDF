/**
 * The conversion registry: which kinds exist, what they accept, what extra multipart fields
 * they carry and which codes the container can answer with. Deliberately free of Workers
 * imports so it can be unit-tested under plain node.
 *
 * Kept in step with `KINDS` in container/server.py and `CONVERT_KINDS` in src/lib/api.ts.
 */

export const KINDS = ['ppt-to-pdf', 'pdf-to-ppt', 'epub-to-pdf', 'mobi-to-pdf', 'protect-pdf', 'unlock-pdf', 'pdf-to-pdfa', 'ebook-converter'] as const
export type Kind = (typeof KINDS)[number]

export function isKind(v: string): v is Kind {
  return (KINDS as readonly string[]).includes(v)
}

/**
 * What each conversion accepts. The container is the authority: it re-checks the extension
 * *and* the magic bytes, and still accepts a file whose name has no usable extension when the
 * bytes match one allowed type. This table documents the contract and names the accepted
 * types; it is not a second gate, so that magic-byte fallback keeps working.
 */
export const KIND_INPUT_EXTS: Record<Kind, readonly string[]> = {
  'ppt-to-pdf': ['.ppt', '.pptx', '.pps', '.ppsx', '.odp'],
  'pdf-to-ppt': ['.pdf'],
  'epub-to-pdf': ['.epub'],
  'mobi-to-pdf': ['.mobi', '.azw', '.azw3', '.prc'],
  'protect-pdf': ['.pdf'],
  'unlock-pdf': ['.pdf'],
  'pdf-to-pdfa': ['.pdf'],
  'ebook-converter': ['.epub', '.mobi', '.azw', '.azw3', '.prc', '.fb2', '.txt'],
}

/**
 * Extra multipart fields a conversion understands. The Worker never parses the body — it
 * streams it straight through — so these ride along untouched and the container reads them.
 */
export const KIND_FIELDS: Partial<Record<Kind, readonly string[]>> = {
  'protect-pdf': ['password', 'ownerPassword', 'permissions'],
  'unlock-pdf': ['password'],
  'pdf-to-pdfa': ['level'],
  /** `to` is the target format: epub | mobi | azw3 | fb2 | txt (default epub) */
  'ebook-converter': ['to'],
}

/**
 * Codes the container may answer with. The Worker passes its `{error, code}` envelope
 * through untouched, so this is what a client can see on top of the Worker's own codes
 * (too_large, quota_exceeded, rate_limited, invalid_token, subscription_inactive, …).
 */
export const CONTAINER_ERROR_CODES = [
  'wrong_password',
  'password_required',
  'already_encrypted',
  'unsupported_media_type',
  'drm_protected',
  'conversion_failed',
  'bad_request',
  'timeout',
  'busy',
] as const
