#!/usr/bin/env python3
"""Pure-function tests for container/server.py: multipart field parsing, the qpdf argument
lists, the permission and PDF/A level mappings, field validation and password scrubbing.

Nothing here shells out, so it runs anywhere python3 does:  python3 -m unittest discover -s container
The vitest suite (test/convert.test.ts) runs this file too, so `npx vitest run` covers it.
"""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server  # noqa: E402


def multipart(parts, boundary='BOUND'):
    """parts: list of (name, filename or None, bytes value). Returns the raw body."""
    out = b''
    for name, filename, value in parts:
        disp = f'form-data; name="{name}"'
        if filename is not None:
            disp += f'; filename="{filename}"'
        out += f'--{boundary}\r\nContent-Disposition: {disp}\r\n\r\n'.encode() + value + b'\r\n'
    return out + f'--{boundary}--\r\n'.encode()


class Multipart(unittest.TestCase):
    def parse(self, body, boundary=b'BOUND'):
        with tempfile.TemporaryDirectory() as d:
            body_path = os.path.join(d, 'body.bin')
            dest = os.path.join(d, 'file.bin')
            with open(body_path, 'wb') as f:
                f.write(body)
            name, fields = server.parse_multipart(body_path, boundary, dest)
            data = None
            if os.path.exists(dest):
                with open(dest, 'rb') as fh:
                    data = fh.read()
            return name, fields, data

    def test_file_plus_text_fields(self):
        body = multipart([
            ('file', 'a.pdf', b'%PDF-1.4\nbytes\r\nhere'),
            ('password', None, b'hunter2'),
            ('permissions', None, b'no-print'),
        ])
        name, fields, data = self.parse(body)
        self.assertEqual(name, 'a.pdf')
        self.assertEqual(fields, {'password': 'hunter2', 'permissions': 'no-print'})
        # byte-exact, including the CRLF inside the payload
        self.assertEqual(data, b'%PDF-1.4\nbytes\r\nhere')

    def test_fields_before_file(self):
        body = multipart([('level', None, b'2b'), ('file', 'x.pdf', b'%PDF-')])
        name, fields, data = self.parse(body)
        self.assertEqual((name, fields, data), ('x.pdf', {'level': '2b'}, b'%PDF-'))

    def test_empty_and_unicode_field_values(self):
        body = multipart([('file', 'x.pdf', b'%PDF-'), ('password', None, ''.encode()),
                          ('ownerPassword', None, 'pässwörd☂'.encode())])
        _, fields, _ = self.parse(body)
        self.assertEqual(fields['password'], '')
        self.assertEqual(fields['ownerPassword'], 'pässwörd☂')

    def test_filename_star_and_no_name_attribute(self):
        body = (b'--BOUND\r\nContent-Disposition: form-data; name="file"; '
                b"filename*=utf-8''caf%C3%A9.pdf\r\n\r\n%PDF-\r\n--BOUND--\r\n")
        name, fields, data = self.parse(body)
        self.assertEqual(name, 'café.pdf')
        self.assertEqual(fields, {})

    def test_oversized_field_is_dropped_not_buffered(self):
        body = multipart([('file', 'x.pdf', b'%PDF-'),
                          ('password', None, b'x' * (server.MAX_FIELD_BYTES + 1))])
        _, fields, _ = self.parse(body)
        self.assertNotIn('password', fields)

    def test_no_file_part(self):
        body = multipart([('password', None, b'p')])
        name, fields, _ = self.parse(body)
        self.assertIsNone(name)
        self.assertEqual(fields, {'password': 'p'})

    def test_part_name_does_not_match_inside_filename(self):
        self.assertIsNone(server.part_name('Content-Disposition: form-data; filename="a.pdf"'))
        self.assertEqual(server.part_name('Content-Disposition: form-data; name="level"'), 'level')


class PermissionMapping(unittest.TestCase):
    def test_exactly_the_four_client_choices(self):
        self.assertEqual(sorted(server.PERMISSION_FLAGS), ['all', 'no-copy', 'no-print', 'no-print-copy'])

    def test_flags(self):
        self.assertEqual(server.PERMISSION_FLAGS['all'], ())
        self.assertEqual(server.PERMISSION_FLAGS['no-print'], ('--print=none',))
        self.assertEqual(server.PERMISSION_FLAGS['no-copy'], ('--extract=n',))
        self.assertEqual(server.PERMISSION_FLAGS['no-print-copy'], ('--print=none', '--extract=n'))

    def test_accessibility_is_never_disabled(self):
        for flags in server.PERMISSION_FLAGS.values():
            self.assertNotIn('--accessibility=n', flags)


class QpdfArgs(unittest.TestCase):
    def test_protect_args_shape(self):
        # positional form: --encrypt <user> <owner> <bits> [restrictions] -- in out
        args = server.protect_args('u', 'o', 'no-print-copy', '/w/in.pdf', '/w/out.pdf')
        self.assertEqual(args, ['--encrypt', 'u', 'o', '256',
                                '--print=none', '--extract=n', '--', '/w/in.pdf', '/w/out.pdf'])

    def test_protect_args_per_permission(self):
        shape = lambda p: server.protect_args('u', 'o', p, 'i', 'x')[4:-3]  # noqa: E731
        self.assertEqual(shape('all'), [])
        self.assertEqual(shape('no-print'), ['--print=none'])
        self.assertEqual(shape('no-copy'), ['--extract=n'])
        self.assertEqual(shape('no-print-copy'), ['--print=none', '--extract=n'])

    def test_protect_args_separator_precedes_the_filenames(self):
        args = server.protect_args('u', 'o', 'all', 'in.pdf', 'out.pdf')
        self.assertEqual(args[args.index('--') + 1:], ['in.pdf', 'out.pdf'])

    def test_args_are_one_per_line_so_awkward_passwords_survive(self):
        for pw in ('a pass phrase', '--not-an-option', 'ünïcode ☂', '"quoted"'):
            args = server.protect_args(pw, pw, 'all', 'in.pdf', 'out.pdf')
            self.assertEqual('\n'.join(args).split('\n')[1], pw)

    def test_unlock_args(self):
        self.assertEqual(server.unlock_args('pw', 'i', 'o'), ['--password=pw', '--decrypt', 'i', 'o'])
        self.assertEqual(server.unlock_args('', 'i', 'o'), ['--decrypt', 'i', 'o'])


class LevelMapping(unittest.TestCase):
    def test_levels(self):
        self.assertEqual(server.PDFA_VERSIONS, {'1b': 1, '2b': 2, '3b': 3})

    def test_filter_options_json(self):
        self.assertEqual(server.pdfa_filter_options('2b'),
                         '{"SelectPdfVersion":{"type":"long","value":2}}')

    def test_default_and_normalisation(self):
        self.assertEqual(server.validate_level({}), '1b')
        self.assertEqual(server.validate_level({'level': ' 3B '}), '3b')

    def test_bad_level(self):
        with self.assertRaises(server.HttpError) as cm:
            server.validate_level({'level': '4b'})
        self.assertEqual((cm.exception.status, cm.exception.code), (400, 'bad_request'))


class PdfaConformance(unittest.TestCase):
    def test_a_becomes_b_without_changing_the_byte_count(self):
        blob = b'head<pdfaid:part>1</pdfaid:part><pdfaid:conformance>A</pdfaid:conformance>tail'
        out = server.downgrade_conformance(blob)
        self.assertIn(b'<pdfaid:conformance>B</pdfaid:conformance>', out)
        self.assertNotIn(b'<pdfaid:conformance>A</pdfaid:conformance>', out)
        self.assertEqual(len(out), len(blob))  # xref offsets must not shift

    def test_b_is_left_alone_and_the_part_is_never_touched(self):
        blob = b'<pdfaid:part>2</pdfaid:part><pdfaid:conformance>B</pdfaid:conformance>'
        self.assertEqual(server.downgrade_conformance(blob), blob)
        blob1 = b'<pdfaid:part>1</pdfaid:part><pdfaid:conformance>A</pdfaid:conformance>'
        self.assertIn(b'<pdfaid:part>1</pdfaid:part>', server.downgrade_conformance(blob1))

    def test_unrelated_capital_a_is_untouched(self):
        blob = b'A stream mentioning A/conformance A everywhere'
        self.assertEqual(server.downgrade_conformance(blob), blob)


class FieldValidation(unittest.TestCase):
    def test_missing_password_is_password_required(self):
        for fields in ({}, {'password': ''}):
            with self.assertRaises(server.HttpError) as cm:
                server.validate_protect_fields(fields)
            self.assertEqual((cm.exception.status, cm.exception.code), (400, 'password_required'))

    def test_owner_defaults_to_user_password(self):
        self.assertEqual(server.validate_protect_fields({'password': 'u'}), ('u', 'u', 'all'))
        self.assertEqual(server.validate_protect_fields({'password': 'u', 'ownerPassword': 'o'}),
                         ('u', 'o', 'all'))

    def test_permissions_default_and_reject(self):
        self.assertEqual(server.validate_protect_fields({'password': 'u', 'permissions': 'no-copy'})[2], 'no-copy')
        with self.assertRaises(server.HttpError) as cm:
            server.validate_protect_fields({'password': 'u', 'permissions': 'no-everything'})
        self.assertEqual(cm.exception.code, 'bad_request')

    def test_password_length_cap(self):
        with self.assertRaises(server.HttpError) as cm:
            server.validate_protect_fields({'password': 'x' * (server.MAX_PASSWORD_LEN + 1)})
        self.assertEqual(cm.exception.code, 'bad_request')


class ErrorCodeMapping(unittest.TestCase):
    """qpdf --requires-password: 0 = another password is needed, 2 = not encrypted,
    3 = encrypted and the supplied password was right."""

    def test_wrong_password(self):
        err = server.unlock_error(0, 'guess')
        self.assertEqual((err.status, err.code), (400, 'wrong_password'))

    def test_password_required(self):
        err = server.unlock_error(0, '')
        self.assertEqual((err.status, err.code), (400, 'password_required'))

    def test_correct_password_and_plain_pdf_carry_on(self):
        self.assertIsNone(server.unlock_error(3, 'right'))
        self.assertIsNone(server.unlock_error(2, ''))


class Scrub(unittest.TestCase):
    def test_masks_every_secret(self):
        self.assertEqual(server.scrub('failed for s3cret / own3r', ('s3cret', 'own3r')),
                         'failed for *** / ***')

    def test_empty_secret_is_not_a_wildcard(self):
        self.assertEqual(server.scrub('abc', ('', None)), 'abc')


class Kinds(unittest.TestCase):
    def test_new_kinds_registered_as_pdf_in_pdf_out(self):
        for kind in ('protect-pdf', 'unlock-pdf', 'pdf-to-pdfa'):
            self.assertEqual(server.KINDS[kind]['in'], ('.pdf',))
            self.assertEqual(server.KINDS[kind]['mime'], 'application/pdf')
            self.assertEqual(server.KINDS[kind]['out'], 'pdf')


if __name__ == '__main__':
    unittest.main(verbosity=2)


class EbookTarget(unittest.TestCase):
    def test_default_and_whitelist(self):
        self.assertEqual(server.validate_to({}), 'epub')
        self.assertEqual(server.validate_to({'to': 'MOBI'}), 'mobi')
        self.assertEqual(server.validate_to({'to': '.azw3'}), 'azw3')
        for bad in ('pdf', 'exe', '../mobi', ''):
            if bad == '':
                self.assertEqual(server.validate_to({'to': ''}), 'epub')
                continue
            with self.assertRaises(server.HttpError) as cm:
                server.validate_to({'to': bad})
            self.assertEqual(cm.exception.code, 'bad_request')

    def test_ebook_kind_registered_with_every_target_mime(self):
        spec = server.KINDS['ebook-converter']
        self.assertEqual(spec['out'], 'epub')
        for ext in ('.epub', '.mobi', '.azw3', '.fb2', '.txt'):
            self.assertIn(ext, spec['in'])
        for to in ('epub', 'mobi', 'azw3', 'fb2', 'txt'):
            self.assertIn(to, server.EBOOK_TARGETS)

    def test_fb2_and_txt_magic(self):
        import tempfile, os
        with tempfile.TemporaryDirectory() as d:
            fb2 = os.path.join(d, 'a.fb2'); open(fb2, 'wb').write(b'<?xml version="1.0"?><FictionBook>')
            txt = os.path.join(d, 'a.txt'); open(txt, 'wb').write('plain text with caf\u00e9'.encode('utf-8'))
            bin_ = os.path.join(d, 'b.txt'); open(bin_, 'wb').write(b'MZ\x00\x00binary')
            self.assertTrue(server.magic_matches(fb2, '.fb2'))
            self.assertTrue(server.magic_matches(txt, '.txt'))
            self.assertFalse(server.magic_matches(bin_, '.txt'))


class EpubMagic(unittest.TestCase):
    def test_epub_needs_the_stored_mimetype_entry_not_just_pk(self):
        import tempfile, os, zipfile
        with tempfile.TemporaryDirectory() as d:
            good = os.path.join(d, 'g.epub')
            z = zipfile.ZipFile(good, 'w')
            z.writestr(zipfile.ZipInfo('mimetype'), 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
            z.writestr('x.txt', 'x'); z.close()
            deck = os.path.join(d, 'd.epub')
            z = zipfile.ZipFile(deck, 'w'); z.writestr('[Content_Types].xml', '<Types/>'); z.close()
            self.assertTrue(server.magic_matches(good, '.epub'))
            self.assertFalse(server.magic_matches(deck, '.epub'))
