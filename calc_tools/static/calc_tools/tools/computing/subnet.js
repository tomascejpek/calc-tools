/**
 * IPv4 subnet calculator: network, broadcast, host range and masks from CIDR.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

/**
 * Parses a dotted IPv4 address into an unsigned 32-bit number.
 * @param {string} text
 * @returns {number | null}
 */
export function parseIpv4(text) {
  const parts = text.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^(0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)) return null;
  return parts.reduce((acc, part) => acc * 256 + Number(part), 0);
}

/** @param {number} value unsigned 32-bit */
export function ipv4Text(value) {
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
}

/**
 * Prefix length of a contiguous netmask, or null.
 * @param {number} mask
 */
export function prefixOfMask(mask) {
  for (let prefix = 0; prefix <= 32; prefix++) if (maskOfPrefix(prefix) === mask) return prefix;
  return null;
}

/** @param {number} prefix 0–32 */
export function maskOfPrefix(prefix) {
  return prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix));
}

/**
 * @param {number} address
 * @param {number} prefix
 */
export function subnet(address, prefix) {
  const mask = maskOfPrefix(prefix);
  const size = 2 ** (32 - prefix);
  const network = address - (address % size);
  const broadcast = network + size - 1;
  // /31 point-to-point links (RFC 3021) and /32 single hosts use every address
  const hosts = prefix >= 31 ? size : size - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return { mask, network, broadcast, hosts, first, last, wildcard: 2 ** 32 - 1 - mask };
}

/** Private and special ranges: network, prefix, name. */
const SPECIAL = [
  ['10.0.0.0', 8, { cs: 'soukromá (RFC 1918)', en: 'private (RFC 1918)' }],
  ['172.16.0.0', 12, { cs: 'soukromá (RFC 1918)', en: 'private (RFC 1918)' }],
  ['192.168.0.0', 16, { cs: 'soukromá (RFC 1918)', en: 'private (RFC 1918)' }],
  ['100.64.0.0', 10, { cs: 'sdílená CGNAT (RFC 6598)', en: 'shared CGNAT (RFC 6598)' }],
  ['127.0.0.0', 8, { cs: 'loopback', en: 'loopback' }],
  ['169.254.0.0', 16, { cs: 'link-local (APIPA)', en: 'link-local (APIPA)' }],
  ['224.0.0.0', 4, { cs: 'multicast', en: 'multicast' }],
];

const inputs = [
  {
    id: 'address', type: 'text', default: '192.168.1.130/26', maxLength: 40, pattern: /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2}|\s+\d{1,3}(\.\d{1,3}){3})?$/,
    hint: { cs: 'Adresa s prefixem (192.168.1.10/24) nebo s maskou (192.168.1.10 255.255.255.0).', en: 'An address with a prefix (192.168.1.10/24) or a mask (192.168.1.10 255.255.255.0).' },
    label: { cs: 'IPv4 adresa a maska', en: 'IPv4 address and mask' },
  },
];

const outputs = [
  { id: 'network', type: 'text', label: { cs: 'Adresa sítě', en: 'Network address' } },
  { id: 'broadcast', type: 'text', label: { cs: 'Broadcast', en: 'Broadcast' } },
  { id: 'range', type: 'text', label: { cs: 'Rozsah adres hostitelů', en: 'Host range' } },
  { id: 'hosts', label: { cs: 'Počet adres pro hostitele', en: 'Usable host addresses' }, precision: 0 },
  { id: 'mask', type: 'text', label: { cs: 'Maska', en: 'Netmask' } },
  { id: 'wildcard', type: 'text', label: { cs: 'Wildcard maska', en: 'Wildcard mask' } },
  { id: 'kind', type: 'text', label: { cs: 'Typ adresy', en: 'Address type' } },
];

export default {
  id: 'subnet',
  kind: 'calculator',
  category: 'computing',
  tags: ['computing'],
  name: { cs: 'IP subnet kalkulačka (CIDR, maska)', en: 'IP subnet calculator (CIDR, netmask)' },
  description: {
    cs: 'Z IPv4 adresy s prefixem (CIDR, např. /24) nebo s maskou spočítá adresu sítě, broadcast, rozsah adres pro zařízení, jejich počet, masku, wildcard masku a zda jde o soukromou adresu. Sítě /31 a /32 se počítají podle RFC 3021 bez adresy sítě a broadcastu. IPv6 zatím nepodporuje.',
    en: 'From an IPv4 address with a prefix (CIDR, e.g. /24) or a mask it works out the network address, broadcast, host range, number of hosts, netmask, wildcard mask and whether the address is private. /31 and /32 networks follow RFC 3021 without network and broadcast addresses. IPv6 is not supported yet.',
  },
  keywords: {
    cs: ['subnet', 'podsíť', 'ip adresa', 'maska sítě', 'cidr', 'broadcast', 'ipv4', 'síť', 'prefix'],
    en: ['subnet calculator', 'subnet', 'ip address', 'netmask', 'cidr', 'broadcast', 'ipv4', 'network', 'prefix'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const [addressText, rest] = read.values.address.split(/\/|\s+/);
    const address = parseIpv4(addressText);
    let prefix = 24;
    if (rest !== undefined && read.values.address.includes('/')) {
      prefix = Number(rest);
    } else if (rest !== undefined) {
      const mask = parseIpv4(rest);
      const fromMask = mask === null ? null : prefixOfMask(mask);
      if (fromMask === null) return emptyResult(outputs, [{ cs: 'Maska není souvislá (např. 255.255.255.0).', en: 'The mask is not contiguous (e.g. 255.255.255.0).' }]);
      prefix = fromMask;
    }
    if (address === null || prefix > 32) return emptyResult(outputs, [{ cs: 'Neplatná IPv4 adresa nebo prefix.', en: 'Invalid IPv4 address or prefix.' }]);
    const net = subnet(address, prefix);
    const special = SPECIAL.find(([base, length]) => subnet(address, /** @type {number} */ (length)).network === parseIpv4(/** @type {string} */ (base)));
    const text = (/** @type {string} */ value) => ({ cs: value, en: value });
    return {
      values: {
        network: text(`${ipv4Text(net.network)}/${prefix}`),
        broadcast: text(ipv4Text(net.broadcast)),
        range: text(`${ipv4Text(net.first)} – ${ipv4Text(net.last)}`),
        hosts: net.hosts,
        mask: text(ipv4Text(net.mask)),
        wildcard: text(ipv4Text(net.wildcard)),
        kind: special ? /** @type {any} */ (special[2]) : { cs: 'veřejná', en: 'public' },
      },
      warnings: rest === undefined ? [{ cs: 'Bez prefixu se počítá s /24.', en: 'Without a prefix /24 is assumed.' }] : [],
    };
  },
  references: [
    { title: 'RFC 4632: Classless Inter-domain Routing (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632' },
    { title: 'RFC 1918: Address Allocation for Private Internets; RFC 3021: 31-bit prefixes', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
  ],
};
