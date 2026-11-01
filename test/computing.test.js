import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { calculate, getTool } from '../calc_tools/static/calc_tools/index.js';
import { crc32, md5, sha1, sha256, utf8 } from '../calc_tools/static/calc_tools/core/hash.js';
import { ipv4Text, parseIpv4, prefixOfMask } from '../calc_tools/static/calc_tools/tools/computing/subnet.js';
import { hslToRgb, parseColor } from '../calc_tools/static/calc_tools/tools/computing/color.js';
import { contrastRatio } from '../calc_tools/static/calc_tools/tools/computing/contrast.js';
import { base64Decode, base64Encode } from '../calc_tools/static/calc_tools/tools/computing/encoding.js';
import { invalid, near } from './helpers.js';

/**
 * @param {string} id
 * @param {Record<string, any>} [values]
 */
function run(id, values = {}) {
  return calculate(getTool(id), values);
}

/** @param {any} text */
const cs = (text) => text.cs;

describe('core hash', () => {
  test('official test vectors (FIPS 180-4, RFC 1321, CRC-32 check value)', () => {
    assert.equal(sha256(utf8('')), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    assert.equal(sha256(utf8('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
    assert.equal(sha1(utf8('abc')), 'a9993e364706816aba3e25717850c26c9cd0d89d');
    assert.equal(md5(utf8('The quick brown fox jumps over the lazy dog')), '9e107d9d372bb6826bd81d3542a419d6');
    assert.equal(crc32(utf8('123456789')), 'cbf43926');
  });

  test('same as Node crypto for UTF-8 and block edges', () => {
    for (const text of ['příliš žluťoučký kůň', '😀', 'x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'x'.repeat(1000)]) {
      for (const [name, fn] of /** @type {[string, (b: Uint8Array) => string][]} */ ([['sha256', sha256], ['sha1', sha1], ['md5', md5]])) {
        assert.equal(fn(utf8(text)), createHash(name).update(text, 'utf8').digest('hex'), `${name} ${text.length}`);
      }
    }
  });
});

describe('transfer-time', () => {
  test('4.7 GB at 100 Mb/s with 10 % overhead: 6:58', () => {
    const result = run('transfer-time').values;
    near(result.seconds, 4.7e9 * 8 / 90e6, 1e-9);
    assert.equal(cs(result.time), '6:58');
    near(result.megabytesPerSecond, 11.25, 1e-12);
  });

  test('100 Mb/s is 12.5 MB/s; binary units', () => {
    near(run('transfer-time', { overhead: 0 }).values.megabytesPerSecond, 12.5, 1e-12);
    near(run('transfer-time', { size: 1, sizeUnit: 'GiB', speed: 1, speedUnit: 'GBps', overhead: 0 }).values.seconds, 2 ** 30 / 1e9, 1e-12);
  });

  test('zero size and invalid input', () => {
    assert.equal(run('transfer-time', { size: 0 }).values.seconds, 0);
    invalid(run('transfer-time', { speed: 0 }));
    invalid(run('transfer-time', { sizeUnit: 'floppy' }));
  });
});

describe('media-size', () => {
  test('90 minutes at 8 Mb/s: 5.4 GB; Full HD is 16:9 and 2.07 Mpx', () => {
    const result = run('media-size').values;
    near(result.gigabytes, 5.4, 1e-12);
    assert.match(cs(result.aspect), /^16:9/);
    near(result.megapixels, 2.0736, 1e-12);
  });

  test('uncompressed image and video', () => {
    near(run('media-size', { mode: 'image', width: 4000, height: 3000 }).values.megabytes, 36, 1e-12);
    near(run('media-size', { mode: 'raw', duration: 1 }).values.gigabytes, 1920 * 1080 * 3 * 25 * 60 / 1e9, 1e-12);
  });

  test('fractional pixels and invalid input', () => {
    invalid(run('media-size', { width: 10.5 }));
    invalid(run('media-size', { bitrate: 0 }));
  });
});

describe('subnet', () => {
  test('192.168.1.130/26: network .128, broadcast .191, 62 hosts', () => {
    const result = run('subnet').values;
    assert.equal(cs(result.network), '192.168.1.128/26');
    assert.equal(cs(result.broadcast), '192.168.1.191');
    assert.equal(result.hosts, 62);
    assert.equal(cs(result.mask), '255.255.255.192');
    assert.equal(cs(result.kind), 'soukromá (RFC 1918)');
  });

  test('netmask notation, /31, /32 and public addresses', () => {
    assert.equal(cs(run('subnet', { address: '10.20.30.40 255.255.0.0' }).values.network), '10.20.0.0/16');
    assert.equal(run('subnet', { address: '192.168.0.1/31' }).values.hosts, 2);
    assert.equal(run('subnet', { address: '8.8.8.8/32' }).values.kind.en, 'public');
    assert.equal(ipv4Text(/** @type {number} */ (parseIpv4('255.255.255.255'))), '255.255.255.255');
    assert.equal(prefixOfMask(/** @type {number} */ (parseIpv4('255.255.255.0'))), 24);
  });

  test('invalid addresses, masks and prefixes', () => {
    invalid(run('subnet', { address: '256.1.1.1/8' }));
    invalid(run('subnet', { address: '1.2.3.4 255.0.255.0' }));
    invalid(run('subnet', { address: '1.2.3.4/33' }));
    invalid(run('subnet', { address: '01.2.3.4/8' }));
    assert.equal(run('subnet', { address: '10.0.0.1' }).warnings.length, 1);
  });
});

describe('color', () => {
  test('#3366cc = rgb(51, 102, 204) = hsl(220, 60%, 50%)', () => {
    const result = run('color').values;
    assert.equal(cs(result.rgb), 'rgb(51, 102, 204)');
    assert.equal(cs(result.hsl), 'hsl(220, 60%, 50%)');
    assert.equal(cs(result.cmyk), '75 %, 50 %, 0 %, 20 %');
  });

  test('short hex, rgb() and hsl() input round-trip', () => {
    assert.equal(cs(run('color', { color: '#36c' }).values.hex), '#3366cc');
    assert.equal(cs(run('color', { color: 'hsl(0, 100%, 50%)' }).values.hex), '#ff0000');
    assert.deepEqual(hslToRgb(120, 1, 0.25), [0, 128, 0]);
    assert.deepEqual(parseColor('rgb(0, 0, 0)'), [0, 0, 0]);
  });

  test('out of range and invalid input', () => {
    invalid(run('color', { color: 'rgb(300, 0, 0)' }));
    invalid(run('color', { color: '#ggg' }));
    invalid(run('color', { color: 'red' }));
  });
});

describe('contrast', () => {
  test('#767676 on white is 4.54 : 1 and passes AA; #777 fails', () => {
    const result = run('contrast').values;
    near(result.ratio, 4.54, 0.01);
    assert.equal(result.normal.en, 'passes AA, not AAA');
    assert.equal(run('contrast', { text: '#777' }).values.normal.en, 'fails AA');
  });

  test('black on white is 21 : 1; the order does not matter', () => {
    near(contrastRatio([0, 0, 0], [255, 255, 255]), 21, 1e-12);
    near(contrastRatio([255, 255, 255], [0, 0, 0]), 21, 1e-12);
  });

  test('same colours are 1 : 1; invalid input', () => {
    assert.equal(run('contrast', { text: '#fff' }).values.ratio, 1);
    invalid(run('contrast', { background: 'white' }));
  });
});

describe('encoding', () => {
  test('Base64 of UTF-8 text round-trips', () => {
    assert.equal(base64Encode('Dobrý den, světe!'), 'RG9icsO9IGRlbiwgc3bEm3RlIQ==');
    assert.equal(base64Decode('RG9icsO9IGRlbiwgc3bEm3RlIQ=='), 'Dobrý den, světe!');
    assert.equal(cs(run('encoding', { operation: 'base64Decode', text: 'YWJj' }).values.result), 'abc');
    assert.equal(base64Encode('???'), 'Pz8/');
    assert.equal(base64Decode('Pz8_'), '???', 'URL-safe alphabet');
    assert.equal(base64Decode('YQ'), 'a', 'missing padding');
  });

  test('URL and hex encoding', () => {
    assert.equal(cs(run('encoding', { operation: 'urlEncode', text: 'a b&c=č' }).values.result), 'a%20b%26c%3D%C4%8D');
    assert.equal(cs(run('encoding', { operation: 'urlDecode', text: 'a+b%20c' }).values.result), 'a b c');
    assert.equal(cs(run('encoding', { operation: 'hexEncode', text: 'Ž' }).values.result), 'c5bd');
    assert.equal(cs(run('encoding', { operation: 'hexDecode', text: 'c5:bd' }).values.result), 'Ž');
  });

  test('invalid encodings are reported, markup is returned as plain text', () => {
    invalid(run('encoding', { operation: 'base64Decode', text: '***' }));
    invalid(run('encoding', { operation: 'urlDecode', text: '%E0%A4%A' }));
    invalid(run('encoding', { operation: 'hexDecode', text: 'ff' }), 'not valid UTF-8');
    assert.equal(cs(run('encoding', { operation: 'urlDecode', text: '%3Cscript%3E' }).values.result), '<script>');
  });
});

describe('hash', () => {
  test('"abc": SHA-256 ba7816bf…, MD5 900150983c…', () => {
    const result = run('hash').values;
    assert.equal(cs(result.sha256), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    assert.equal(cs(result.md5), '900150983cd24fb0d6963f7d28e17f72');
    assert.equal(result.bytes, 3);
  });

  test('upper case and UTF-8 length', () => {
    assert.equal(cs(run('hash', { case: 'upper' }).values.crc32), '352441C2');
    assert.equal(run('hash', { text: 'čaj' }).values.bytes, 4);
  });

  test('empty text is hashed as empty; invalid input', () => {
    assert.equal(cs(run('hash', { text: '' }).values.sha256), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    assert.equal(cs(run('encoding', { text: '' }).values.result), '');
    invalid(run('hash', { case: 'mixed' }));
  });
});
