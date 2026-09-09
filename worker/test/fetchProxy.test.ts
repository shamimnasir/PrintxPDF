import { describe, expect, it } from 'vitest'
import { validateTarget } from '../src/fetchProxy'

describe('validateTarget', () => {
  it('accepts public http(s) URLs', () => {
    expect(validateTarget('https://example.com/a?b=1').hostname).toBe('example.com')
    expect(validateTarget('http://example.com:80/').hostname).toBe('example.com')
  })

  it('rejects everything else', () => {
    const bad = [
      null, '', 'ftp://example.com', 'file:///etc/passwd', 'javascript:alert(1)',
      'http://localhost/', 'http://foo.localhost/', 'http://printer.local/', 'http://metadata.google.internal/',
      'http://127.0.0.1/', 'http://10.1.2.3/', 'http://172.16.0.1/', 'http://192.168.1.1/', 'http://169.254.169.254/latest/',
      'http://0.0.0.0/', 'http://100.64.0.1/', 'http://2130706433/', 'http://[::1]/', 'http://[fd00::1]/', 'http://[fe80::1]/',
      'http://example.com:8080/', 'http://user:pw@example.com/',
    ]
    for (const url of bad) expect(() => validateTarget(url), String(url)).toThrow()
  })
})
