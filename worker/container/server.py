#!/usr/bin/env python3
"""PrintxPDF converter service (runs inside the Cloudflare Container).

Python 3 stdlib only. LibreOffice handles PPT<->PDF and PDF->PDF/A, Calibre handles
EPUB/MOBI->PDF, qpdf handles PDF encrypt/decrypt. One job at a time: the Worker-side
Durable Object leases an instance before it sends work here, and the non-blocking lock
below is the last line of defence.

Passwords arrive as multipart text fields. They are never written to disk, never placed
on a command line (qpdf reads its whole argument list from stdin via `@-`, so nothing
shows up in /proc/*/cmdline) and never logged: `scrub()` masks them in any captured
output before it is logged or returned to the client.
"""
import json
import mmap
import os
import re
import shutil
import signal
import subprocess
import tempfile
import threading
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get('PORT', '8080'))
JOB_TIMEOUT = int(os.environ.get('JOB_TIMEOUT_SEC', '120'))
MAX_BYTES = int(os.environ.get('MAX_BYTES', str(100 * 1024 * 1024)))
LO_PROFILE = os.environ.get('LO_PROFILE', '/opt/lo-profile')
WORK_ROOT = os.environ.get('WORK_ROOT', '/tmp/pxp-jobs')
CHUNK = 1 << 20

PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
KINDS = {
    'ppt-to-pdf':  {'in': ('.ppt', '.pptx', '.pps', '.ppsx', '.odp'), 'out': 'pdf',  'mime': 'application/pdf'},
    'pdf-to-ppt':  {'in': ('.pdf',),                                  'out': 'pptx', 'mime': PPTX_MIME},
    'epub-to-pdf': {'in': ('.epub',),                                 'out': 'pdf',  'mime': 'application/pdf'},
    'mobi-to-pdf': {'in': ('.mobi', '.azw', '.azw3', '.prc'),         'out': 'pdf',  'mime': 'application/pdf'},
    'protect-pdf': {'in': ('.pdf',),                                  'out': 'pdf',  'mime': 'application/pdf'},
    'unlock-pdf':  {'in': ('.pdf',),                                  'out': 'pdf',  'mime': 'application/pdf'},
    'pdf-to-pdfa': {'in': ('.pdf',),                                  'out': 'pdf',  'mime': 'application/pdf'},
    # output format is chosen per request by the `to` field; 'out'/'mime' here are the defaults
    'ebook-converter': {'in': ('.epub', '.mobi', '.azw', '.azw3', '.prc', '.fb2', '.txt'), 'out': 'epub', 'mime': 'application/epub+zip'},
}

# Calibre targets the ebook converter may write, with the MIME type sent back for each
EBOOK_TARGETS = {
    'epub': 'application/epub+zip',
    'mobi': 'application/x-mobipocket-ebook',
    'azw3': 'application/vnd.amazon.mobi8-ebook',
    'fb2': 'application/xml',
    'txt': 'text/plain; charset=utf-8',
}
ZIP_EXTS = ('.pptx', '.ppsx', '.odp', '.epub')
OLE_EXTS = ('.ppt', '.pps')
MOBI_EXTS = ('.mobi', '.azw', '.azw3', '.prc')

# Which qpdf restriction flags each client-facing permission choice maps to, for 256-bit
# (AES-256, R6) encryption. Anything not listed keeps qpdf's permissive default, so `all`
# is the empty tuple. Accessibility extraction is deliberately never disabled.
PERMISSION_FLAGS = {
    'all':           (),
    'no-print':      ('--print=none',),
    'no-copy':       ('--extract=n',),
    'no-print-copy': ('--print=none', '--extract=n'),
}
# LibreOffice PDF export: SelectPdfVersion 1/2/3 == PDF/A-1b / PDF/A-2b / PDF/A-3b.
PDFA_VERSIONS = {'1b': 1, '2b': 2, '3b': 3}
MAX_FIELD_BYTES = 8192
MAX_PASSWORD_LEN = 500

JOB_LOCK = threading.Lock()


def log(*parts):
    print(time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), *parts, flush=True)


class HttpError(Exception):
    def __init__(self, status, code, message, headers=None, extra=None):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message
        self.headers = headers or {}
        self.extra = extra or {}


# ---------------------------------------------------------------- input validation

def magic_matches(path, ext):
    with open(path, 'rb') as f:
        head = f.read(1024)
    if ext == '.epub':
        # EPUB (OCF) requires a STORED 'mimetype' entry first, so 'application/epub+zip' sits at a
        # fixed offset right after the 30-byte local header + 8-byte name. Plain 'PK' would also
        # accept .pptx/.docx and hand Calibre a deck it cannot read.
        return head[:4] == b'PK\x03\x04' and head[30:38] == b'mimetype' and b'application/epub+zip' in head[38:80]
    if ext in ZIP_EXTS:
        return head[:4] == b'PK\x03\x04'
    if ext in OLE_EXTS:
        return head[:8] == b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'
    if ext == '.pdf':
        return b'%PDF' in head
    if ext in MOBI_EXTS:
        return head[60:68] in (b'BOOKMOBI', b'TEXtREAd')
    if ext == '.fb2':
        return b'<FictionBook' in head or head.lstrip().startswith(b'<?xml')
    if ext == '.txt':
        # text: decodes as UTF-8 (BOM tolerated) and carries no NUL bytes
        if b'\x00' in head:
            return False
        try:
            head.decode('utf-8-sig')
            return True
        except UnicodeDecodeError:
            return len(head) > 0 and head[-1] >= 0x80  # cut mid-multibyte sequence at the 1 KiB edge
    return False


def resolve_ext(name, path, allowed):
    """Extension allow-list + magic bytes. Returns the extension to use, or None (415)."""
    ext = os.path.splitext(name)[1].lower()
    if ext in allowed:
        return ext if magic_matches(path, ext) else None
    # No usable extension: accept only when the bytes unambiguously match one allowed type.
    for cand in allowed:
        if magic_matches(path, cand):
            return cand
    return None


def decode_name(name):
    """Header values arrive latin-1 decoded; recover raw UTF-8 and percent-encoding."""
    try:
        name = name.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    if '%' in name:
        try:
            name = urllib.parse.unquote(name)
        except Exception:
            pass
    return name


def sanitize_base(name):
    base = os.path.basename(name.replace('\\', '/'))
    base = os.path.splitext(base)[0]
    base = re.sub(r'[\x00-\x1f\x7f"\\/:*?<>|]+', ' ', base)
    base = re.sub(r'\s+', ' ', base).strip(' .')
    return base[:120] or 'converted'


def content_disposition(base, ext):
    full = f'{base}.{ext}'
    ascii_name = full.encode('ascii', 'replace').decode('ascii').replace('?', '_')
    return f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{urllib.parse.quote(full, safe='')}"


# ---------------------------------------------------------------- multipart (mmap scan)

FILENAME_RE = re.compile(
    r'''filename\*=(?:utf-8|iso-8859-1)'[^']*'([^;\r\n]+)|filename="((?:[^"\\]|\\.)*)"|filename=([^;\r\n]+)''',
    re.I,
)
# `\b` keeps this from matching the `name=` inside `filename=`.
FIELD_NAME_RE = re.compile(r'''\bname="((?:[^"\\]|\\.)*)"|\bname=([^;\r\n]+)''', re.I)


def multipart_boundary(content_type):
    m = re.search(r'boundary="?([^";]+)"?', content_type or '', re.I)
    return m.group(1).encode('latin-1') if m else None


def part_filename(headers):
    m = FILENAME_RE.search(headers)
    if not m:
        return None
    if m.group(1):
        return urllib.parse.unquote(m.group(1).strip()) or 'file'
    raw = (m.group(2) if m.group(2) is not None else m.group(3) or '').strip()
    return raw.replace('\\"', '"') or 'file'


def part_name(headers):
    m = FIELD_NAME_RE.search(headers)
    if not m:
        return None
    raw = (m.group(1) if m.group(1) is not None else m.group(2) or '').strip()
    return raw.replace('\\"', '"') or None


def parse_multipart(body_path, boundary, dest):
    """Walk every part without slurping the body.

    The first part carrying `filename=` is copied byte-exactly into `dest`; every other
    part that has a `name=` and no filename is decoded as a small UTF-8 text field.
    Returns (filename or None, {field: value}).
    """
    marker = b'--' + boundary
    fields = {}
    name = None
    size = os.path.getsize(body_path)
    if size == 0:
        return None, fields
    with open(body_path, 'rb') as f, mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as mm:
        pos = mm.find(marker)
        while pos != -1:
            pos += len(marker)
            if mm[pos:pos + 2] == b'--':
                break  # closing delimiter
            hdr_end = mm.find(b'\r\n\r\n', pos)
            if hdr_end == -1:
                break
            headers = mm[pos:hdr_end].decode('latin-1', 'replace')
            data_start = hdr_end + 4
            nxt = mm.find(b'\r\n' + marker, data_start)
            data_end = size if nxt == -1 else nxt
            fname = part_filename(headers)
            if fname is not None and name is None:
                name = fname
                with open(dest, 'wb') as out:
                    i = data_start
                    while i < data_end:
                        j = min(i + CHUNK, data_end)
                        out.write(mm[i:j])
                        i = j
            elif fname is None:
                field = part_name(headers)
                if field and data_end - data_start <= MAX_FIELD_BYTES:
                    fields[field] = mm[data_start:data_end].decode('utf-8', 'replace')
            if nxt == -1:
                break
            pos = nxt + 2
    return name, fields


# ---------------------------------------------------------------- conversion

def run(cmd, cwd, env, timeout, stdin_data=None):
    """Run cmd in its own process group; SIGKILL the whole group on timeout."""
    p = subprocess.Popen(cmd, cwd=cwd, env=env,
                         stdin=subprocess.PIPE if stdin_data is not None else subprocess.DEVNULL,
                         stdout=subprocess.PIPE, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        out, _ = p.communicate(input=stdin_data, timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(p.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        p.communicate()
        raise HttpError(504, 'timeout', f'Conversion exceeded {timeout}s')
    return p.returncode, out.decode('utf-8', 'replace')


def scrub(text, secrets):
    """Mask every secret that could have leaked into captured output before it is logged."""
    for s in secrets:
        if s:
            text = text.replace(s, '***')
    return text


def qpdf(args, work, env, secrets=(), timeout=None):
    """Run qpdf with its whole argument list piped through stdin (`@-`).

    qpdf reads one argument per line from stdin, so passwords never appear in
    /proc/<pid>/cmdline, in `ps` output, or in a temporary file.
    Docs: https://qpdf.readthedocs.io/en/stable/cli.html (@filename arguments)
    """
    payload = ('\n'.join(args) + '\n').encode('utf-8')
    rc, text = run(['qpdf', '@-'], work, env, timeout or JOB_TIMEOUT, stdin_data=payload)
    return rc, scrub(text, secrets)


def qpdf_encryption_state(src, work, env, password=None):
    """qpdf --requires-password: 0 = a (different) password is needed, 2 = not encrypted,
    3 = encrypted and the supplied password is correct. Anything else is a real error."""
    args = ([f'--password={password}'] if password else []) + ['--requires-password', src]
    rc, text = qpdf(args, work, env, secrets=(password,))
    return rc, text


def protect_args(user, owner, perms, src, out_path):
    """The qpdf argument list for `protect-pdf`, one argument per line when fed to `qpdf @-`.

    `--encrypt user-password owner-password key-length [restrictions] --`, the positional
    form. The named `--user-password=`/`--owner-password=`/`--bits=` spelling in the current
    manual (https://qpdf.readthedocs.io/en/stable/cli.html#option-encrypt) only exists from
    qpdf 11.7; Debian bookworm ships 11.3.0, which rejects it. The positional form works on
    both, and because `@-` gives one argument per line a password may contain anything at
    all, including spaces and leading dashes. The trailing `--` is required either way.
    """
    return ['--encrypt', user, owner, '256', *PERMISSION_FLAGS[perms], '--', src, out_path]


def unlock_args(pw, src, out_path):
    return ([f'--password={pw}'] if pw else []) + ['--decrypt', src, out_path]


def pdfa_filter_options(level):
    return json.dumps({'SelectPdfVersion': {'type': 'long', 'value': PDFA_VERSIONS[level]}},
                      separators=(',', ':'))


CONFORMANCE_A = b'<pdfaid:conformance>A</pdfaid:conformance>'
CONFORMANCE_B = b'<pdfaid:conformance>B</pdfaid:conformance>'


def downgrade_conformance(data):
    """Rewrite a PDF/A `a` conformance claim to `b`.

    LibreOffice 7.4 always exports tagged PDF (UseTaggedPDF=false is ignored), so
    SelectPdfVersion=1 comes out declaring PDF/A-1**a** even though the client asked for 1b.
    Every PDF/A-*a* file also satisfies the corresponding *b* level (a = b + tagging and
    Unicode mapping), so declaring `B` is a weaker claim that the file certainly meets,
    where `A` asserts an accessibility conformance a PDF-in / Draw-rebuilt structure tree
    cannot honestly promise. `A` and `B` are the same length and PDF/A requires the
    document XMP stream to be stored uncompressed and unfiltered, so this is a byte-for-byte
    substitution that leaves every xref offset intact.
    """
    return data.replace(CONFORMANCE_A, CONFORMANCE_B)


def validate_protect_fields(fields):
    """(user, owner, permissions) or an HttpError with a code the client already understands."""
    user = fields.get('password') or ''
    if not user:
        raise HttpError(400, 'password_required', 'A password is required to protect this PDF')
    owner = fields.get('ownerPassword') or user
    if len(user) > MAX_PASSWORD_LEN or len(owner) > MAX_PASSWORD_LEN:
        raise HttpError(400, 'bad_request', f'Password must be at most {MAX_PASSWORD_LEN} characters')
    perms = fields.get('permissions') or 'all'
    if perms not in PERMISSION_FLAGS:
        raise HttpError(400, 'bad_request', f'permissions must be one of {", ".join(sorted(PERMISSION_FLAGS))}')
    return user, owner, perms


def validate_to(fields):
    """Target format for the ebook converter, or an HttpError."""
    to = (fields.get('to') or 'epub').strip().lower().lstrip('.')
    if to not in EBOOK_TARGETS:
        raise HttpError(400, 'bad_request', f'to must be one of {", ".join(sorted(EBOOK_TARGETS))}')
    return to


def validate_level(fields):
    level = (fields.get('level') or '1b').strip().lower()
    if level not in PDFA_VERSIONS:
        raise HttpError(400, 'bad_request', f'level must be one of {", ".join(sorted(PDFA_VERSIONS))}')
    return level


def unlock_error(rc, password):
    """qpdf --requires-password rc -> the HttpError to raise, or None to carry on."""
    if rc != 0:
        return None
    if password:
        return HttpError(400, 'wrong_password', 'That password did not open this PDF')
    return HttpError(400, 'password_required', 'This PDF needs a password to open')


def op_protect(src, work, env, fields):
    user, owner, perms = validate_protect_fields(fields)
    # --is-encrypted: 0 = encrypted, 2 = not encrypted. Refuse rather than double-encrypt.
    rc, _ = run(['qpdf', '--is-encrypted', src], work, env, JOB_TIMEOUT)
    if rc == 0:
        raise HttpError(400, 'already_encrypted', 'This PDF is already password-protected')
    out_path = os.path.join(work, 'out.pdf')
    rc, text = qpdf(protect_args(user, owner, perms, src, out_path), work, env, secrets=(user, owner))
    if rc not in (0, 3) or not os.path.isfile(out_path) or os.path.getsize(out_path) == 0:
        log(f'protect-pdf failed rc={rc}: {text[-400:]!r}')
        raise HttpError(500, 'conversion_failed', 'Could not protect this PDF',
                        extra={'detail': text[-800:], 'exit': rc})
    log(f'protect-pdf ok permissions={perms} owner_supplied={bool(fields.get("ownerPassword"))}')
    return out_path


def op_unlock(src, work, env, fields):
    pw = fields.get('password') or ''
    if len(pw) > MAX_PASSWORD_LEN:
        raise HttpError(400, 'bad_request', f'Password must be at most {MAX_PASSWORD_LEN} characters')
    rc, _ = qpdf_encryption_state(src, work, env, pw or None)
    err = unlock_error(rc, pw)
    if err:
        raise err
    # rc 2 means "not encrypted" but is also qpdf's generic error code, so let --decrypt
    # be the judge: it succeeds on a plain PDF and fails on a genuinely broken one.
    out_path = os.path.join(work, 'out.pdf')
    rc2, text = qpdf(unlock_args(pw, src, out_path), work, env, secrets=(pw,))
    if rc2 not in (0, 3) or not os.path.isfile(out_path) or os.path.getsize(out_path) == 0:
        log(f'unlock-pdf failed rc={rc2}: {text[-400:]!r}')
        raise HttpError(500, 'conversion_failed', 'Could not read this PDF',
                        extra={'detail': text[-800:], 'exit': rc2})
    log(f'unlock-pdf ok was_encrypted={rc == 3}')
    return out_path


def op_pdfa(src, work, env, fields):
    level = validate_level(fields)
    rc, _ = run(['qpdf', '--is-encrypted', src], work, env, JOB_TIMEOUT)
    if rc == 0:
        raise HttpError(400, 'password_required', 'This PDF is password-protected; unlock it first')
    profile = os.path.join(work, 'lo-profile')
    shutil.copytree(LO_PROFILE, profile, symlinks=True)
    outdir = os.path.join(work, 'pdfa')
    os.makedirs(outdir, exist_ok=True)
    filter_opts = pdfa_filter_options(level)
    cmd = ['soffice', f'-env:UserInstallation=file://{profile}', '--headless', '--norestore',
           '--nologo', '--nolockcheck', '--infilter=impress_pdf_import',
           '--convert-to', f'pdf:draw_pdf_Export:{filter_opts}', '--outdir', outdir, src]
    rc, text = run(cmd, work, env, JOB_TIMEOUT)
    out_path = os.path.join(outdir, os.path.splitext(os.path.basename(src))[0] + '.pdf')
    if rc != 0 or not os.path.isfile(out_path) or os.path.getsize(out_path) == 0:
        log(f'pdf-to-pdfa failed rc={rc}: {text[-400:]!r}')
        raise HttpError(500, 'conversion_failed', 'Could not convert this PDF to PDF/A',
                        extra={'detail': text[-800:], 'exit': rc})
    with open(out_path, 'rb') as f:
        data = f.read()
    fixed = downgrade_conformance(data)
    downgraded = fixed != data
    if downgraded:
        with open(out_path, 'wb') as f:
            f.write(fixed)
    log(f'pdf-to-pdfa ok level={level} conformance_downgraded={downgraded}')
    return out_path


def convert(kind, src, work, fields):
    spec = KINDS[kind]
    env = dict(os.environ, HOME=work, TMPDIR=work)
    if kind == 'protect-pdf':
        return op_protect(src, work, env, fields), spec['mime'], spec['out']
    if kind == 'unlock-pdf':
        return op_unlock(src, work, env, fields), spec['mime'], spec['out']
    if kind == 'pdf-to-pdfa':
        return op_pdfa(src, work, env, fields), spec['mime'], spec['out']
    if kind == 'ebook-converter':
        to = validate_to(fields)
        out_path = os.path.join(work, 'out.' + to)
        env['QTWEBENGINE_CHROMIUM_FLAGS'] = '--no-sandbox --disable-gpu --disable-dev-shm-usage'
        # no PDF layout flags here: Calibre reflows between ebook containers, so the reader decides the page
        cmd = ['xvfb-run', '-a', 'ebook-convert', src, out_path]
        rc, text = run(cmd, work, env, JOB_TIMEOUT)
        ok = rc == 0 and os.path.isfile(out_path) and os.path.getsize(out_path) > 0
        if not ok:
            tail = text[-800:]
            log(f'{kind} -> {to} failed rc={rc}: {tail!r}')
            if 'DRM' in text:
                raise HttpError(415, 'drm_protected', 'This book is DRM-protected and cannot be converted', extra={'detail': tail})
            raise HttpError(500, 'conversion_failed', 'Conversion failed', extra={'detail': tail, 'exit': rc})
        return out_path, EBOOK_TARGETS[to], to
    if kind in ('ppt-to-pdf', 'pdf-to-ppt'):
        profile = os.path.join(work, 'lo-profile')
        shutil.copytree(LO_PROFILE, profile, symlinks=True)
        cmd = ['soffice', f'-env:UserInstallation=file://{profile}', '--headless', '--norestore', '--nologo', '--nolockcheck']
        if kind == 'pdf-to-ppt':
            cmd += ['--infilter=impress_pdf_import', '--convert-to', 'pptx:Impress MS PowerPoint 2007 XML']
        else:
            cmd += ['--convert-to', 'pdf:impress_pdf_Export']
        cmd += ['--outdir', work, src]
        out_path = os.path.join(work, 'input.' + spec['out'])
    else:
        out_path = os.path.join(work, 'out.pdf')
        env['QTWEBENGINE_CHROMIUM_FLAGS'] = '--no-sandbox --disable-gpu --disable-dev-shm-usage'
        cmd = ['xvfb-run', '-a', 'ebook-convert', src, out_path,
               '--paper-size', 'a4',
               '--pdf-page-margin-left', '54', '--pdf-page-margin-right', '54',
               '--pdf-page-margin-top', '54', '--pdf-page-margin-bottom', '54',
               '--pdf-default-font-size', '16',
               '--pdf-serif-family', 'DejaVu Serif', '--pdf-sans-family', 'DejaVu Sans',
               '--pdf-page-numbers', '--preserve-cover-aspect-ratio']
    rc, text = run(cmd, work, env, JOB_TIMEOUT)
    ok = rc == 0 and os.path.isfile(out_path) and os.path.getsize(out_path) > 0
    if not ok:
        tail = text[-800:]
        log(f'{kind} failed rc={rc}: {tail!r}')
        if 'DRM' in text:
            raise HttpError(415, 'drm_protected', 'This book is DRM-protected and cannot be converted', extra={'detail': tail})
        raise HttpError(500, 'conversion_failed', 'Conversion failed', extra={'detail': tail, 'exit': rc})
    return out_path, spec['mime'], spec['out']


# ---------------------------------------------------------------- HTTP

class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    server_version = 'pxp-converter/1.0'
    sys_version = ''

    def log_message(self, fmt, *args):
        log(self.address_string(), fmt % args)

    def send_json(self, status, payload, headers=None):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header('content-type', 'application/json; charset=utf-8')
        self.send_header('content-length', str(len(body)))
        self.send_header('cache-control', 'no-store')
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, err):
        payload = {'error': err.message, 'code': err.code}
        payload.update(err.extra)
        self.send_json(err.status, payload, err.headers)

    def read_body_to(self, dest):
        te = (self.headers.get('transfer-encoding') or '').lower()
        cl = self.headers.get('content-length')
        total = 0
        with open(dest, 'wb') as out:
            if 'chunked' in te:
                while True:
                    line = self.rfile.readline(1024)
                    if not line:
                        raise HttpError(400, 'bad_request', 'Malformed chunked body')
                    try:
                        size = int(line.split(b';', 1)[0].strip() or b'0', 16)
                    except ValueError:
                        raise HttpError(400, 'bad_request', 'Malformed chunk size')
                    if size == 0:
                        while True:  # optional trailers, then the final CRLF
                            trailer = self.rfile.readline(65536)
                            if trailer in (b'\r\n', b'\n', b''):
                                break
                        break
                    total += size
                    if total > MAX_BYTES:
                        raise HttpError(413, 'too_large', f'File exceeds {MAX_BYTES} bytes')
                    remaining = size
                    while remaining:
                        chunk = self.rfile.read(min(remaining, CHUNK))
                        if not chunk:
                            raise HttpError(400, 'bad_request', 'Truncated chunked body')
                        out.write(chunk)
                        remaining -= len(chunk)
                    self.rfile.readline(1024)  # CRLF that terminates the chunk
            elif cl is not None:
                try:
                    n = int(cl)
                except ValueError:
                    raise HttpError(400, 'bad_request', 'Bad Content-Length')
                if n > MAX_BYTES:
                    raise HttpError(413, 'too_large', f'File exceeds {MAX_BYTES} bytes')
                remaining = n
                while remaining:
                    chunk = self.rfile.read(min(remaining, CHUNK))
                    if not chunk:
                        raise HttpError(400, 'bad_request', 'Truncated body')
                    out.write(chunk)
                    remaining -= len(chunk)
                total = n
            else:
                raise HttpError(411, 'length_required', 'Content-Length required')
        return total

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        if path in ('/', '/ping', '/health'):
            return self.send_json(200, {'ok': True, 'busy': JOB_LOCK.locked()})
        self.close_connection = True
        self.send_error_json(HttpError(404, 'not_found', 'Not found'))

    def do_POST(self):
        path = urllib.parse.urlsplit(self.path).path
        m = re.fullmatch(r'/convert/([a-z0-9-]+)', path)
        if not m or m.group(1) not in KINDS:
            self.close_connection = True
            return self.send_error_json(HttpError(404, 'not_found', 'Unknown conversion'))
        kind = m.group(1)
        if not JOB_LOCK.acquire(blocking=False):
            self.close_connection = True
            return self.send_error_json(HttpError(503, 'busy', 'Converter is busy',
                                                  headers={'retry-after': '10', 'x-pxp-busy': '1'}))
        work = None
        started = time.monotonic()
        try:
            os.makedirs(WORK_ROOT, exist_ok=True)
            work = tempfile.mkdtemp(prefix='job-', dir=WORK_ROOT)
            body_path = os.path.join(work, 'body.bin')
            self.read_body_to(body_path)
            ctype = self.headers.get('content-type') or ''
            spec = KINDS[kind]
            src_tmp = os.path.join(work, 'upload.bin')
            name = None
            fields = {}
            if ctype.lower().startswith('multipart/form-data'):
                boundary = multipart_boundary(ctype)
                if not boundary:
                    raise HttpError(400, 'bad_request', 'multipart/form-data without boundary')
                name, fields = parse_multipart(body_path, boundary, src_tmp)
                if name is None:
                    raise HttpError(400, 'bad_request', 'No file part in upload')
                os.unlink(body_path)
            else:
                os.rename(body_path, src_tmp)
            header_name = self.headers.get('x-file-name')
            if header_name:
                name = header_name
            name = decode_name(name or 'file')
            if os.path.getsize(src_tmp) == 0:
                raise HttpError(400, 'bad_request', 'Empty file')
            ext = resolve_ext(name, src_tmp, spec['in'])
            if ext is None:
                raise HttpError(415, 'unsupported_media_type', f'{kind} accepts {", ".join(spec["in"])}')
            src = os.path.join(work, 'input' + ext)
            os.rename(src_tmp, src)
            in_size = os.path.getsize(src)
            out_path, mime, out_ext = convert(kind, src, work, fields)
            size = os.path.getsize(out_path)
            self.send_response(200)
            self.send_header('content-type', mime)
            self.send_header('content-length', str(size))
            self.send_header('content-disposition', content_disposition(sanitize_base(name), out_ext))
            self.send_header('cache-control', 'no-store')
            self.send_header('x-pxp-elapsed-ms', str(int((time.monotonic() - started) * 1000)))
            self.end_headers()
            with open(out_path, 'rb') as f:
                shutil.copyfileobj(f, self.wfile, CHUNK)
            log(f'{kind} ok name={name!r} in={in_size} out={size} {int((time.monotonic() - started) * 1000)}ms')
        except HttpError as e:
            self.close_connection = True
            log(f'{kind} {e.status} {e.code}: {e.message}')
            self.send_error_json(e)
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
            log(f'{kind} client disconnected')
        except Exception as e:  # noqa: BLE001 - never leak a traceback to the client
            self.close_connection = True
            log(f'{kind} internal error: {e!r}')
            self.send_error_json(HttpError(500, 'internal', 'Internal error'))
        finally:
            JOB_LOCK.release()
            if work:
                shutil.rmtree(work, ignore_errors=True)


def main():
    os.makedirs(WORK_ROOT, exist_ok=True)
    server = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    server.daemon_threads = True

    def stop(*_):
        log('shutting down')
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    log(f'listening on :{PORT} job_timeout={JOB_TIMEOUT}s max_bytes={MAX_BYTES}')
    server.serve_forever()


if __name__ == '__main__':
    main()
