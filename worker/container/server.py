#!/usr/bin/env python3
"""PrintxPDF converter service (runs inside the Cloudflare Container).

Python 3 stdlib only. LibreOffice handles PPT<->PDF, Calibre handles EPUB/MOBI->PDF.
One job at a time: the Worker-side Durable Object leases an instance before it sends
work here, and the non-blocking lock below is the last line of defence.
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
}
ZIP_EXTS = ('.pptx', '.ppsx', '.odp', '.epub')
OLE_EXTS = ('.ppt', '.pps')
MOBI_EXTS = ('.mobi', '.azw', '.azw3', '.prc')

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
    if ext in ZIP_EXTS:
        return head[:4] == b'PK\x03\x04'
    if ext in OLE_EXTS:
        return head[:8] == b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'
    if ext == '.pdf':
        return b'%PDF' in head
    if ext in MOBI_EXTS:
        return head[60:68] in (b'BOOKMOBI', b'TEXtREAd')
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


def multipart_boundary(content_type):
    m = re.search(r'boundary="?([^";]+)"?', content_type or '', re.I)
    return m.group(1).encode('latin-1') if m else None


def extract_file_part(body_path, boundary, dest):
    """Copy the first part carrying filename= into dest without slurping the body. Returns the name or None."""
    marker = b'--' + boundary
    size = os.path.getsize(body_path)
    if size == 0:
        return None
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
            m = FILENAME_RE.search(headers)
            if m:
                if m.group(1):
                    name = urllib.parse.unquote(m.group(1).strip())
                else:
                    name = (m.group(2) if m.group(2) is not None else m.group(3) or '').strip().replace('\\"', '"')
                with open(dest, 'wb') as out:
                    i = data_start
                    while i < data_end:
                        j = min(i + CHUNK, data_end)
                        out.write(mm[i:j])
                        i = j
                return name or 'file'
            if nxt == -1:
                break
            pos = nxt + 2
    return None


# ---------------------------------------------------------------- conversion

def run(cmd, cwd, env, timeout):
    """Run cmd in its own process group; SIGKILL the whole group on timeout."""
    p = subprocess.Popen(cmd, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                         stdout=subprocess.PIPE, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        out, _ = p.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(p.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        p.communicate()
        raise HttpError(504, 'timeout', f'Conversion exceeded {timeout}s')
    return p.returncode, out.decode('utf-8', 'replace')


def convert(kind, src, work):
    spec = KINDS[kind]
    env = dict(os.environ, HOME=work, TMPDIR=work)
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
            if ctype.lower().startswith('multipart/form-data'):
                boundary = multipart_boundary(ctype)
                if not boundary:
                    raise HttpError(400, 'bad_request', 'multipart/form-data without boundary')
                name = extract_file_part(body_path, boundary, src_tmp)
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
            out_path, mime, out_ext = convert(kind, src, work)
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
