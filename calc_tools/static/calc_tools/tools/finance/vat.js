/**
 * VAT: price with and without tax.
 */

import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'amount', type: 'number', default: 1000, min: -1e13, max: 1e13, step: 1, label: { cs: 'Částka', en: 'Amount' } },
  {
    id: 'direction', type: 'select', default: 'without', label: { cs: 'Částka je', en: 'The amount is' },
    options: [
      { value: 'without', label: { cs: 'bez DPH', en: 'without VAT' } },
      { value: 'with', label: { cs: 's DPH', en: 'with VAT' } },
    ],
  },
  {
    id: 'rate', type: 'select', default: '21', label: { cs: 'Sazba DPH', en: 'VAT rate' },
    options: [
      { value: '21', label: { cs: '21 % (základní)', en: '21 % (standard, CZ)' } },
      { value: '12', label: { cs: '12 % (snížená)', en: '12 % (reduced, CZ)' } },
      { value: '0', label: { cs: '0 %', en: '0 %' } },
      { value: 'custom', label: { cs: 'jiná', en: 'other' } },
    ],
  },
  { id: 'customRate', type: 'number', default: 20, min: 0, max: 100, step: 0.5, unit: '%', label: { cs: 'Jiná sazba', en: 'Other rate' } },
];

const outputs = [
  { id: 'net', label: { cs: 'Bez DPH', en: 'Without VAT' }, precision: 2 },
  { id: 'vat', label: { cs: 'DPH', en: 'VAT' }, precision: 2 },
  { id: 'gross', label: { cs: 'S DPH', en: 'With VAT' }, precision: 2 },
];

export default {
  id: 'vat',
  kind: 'calculator',
  category: 'finance',
  tags: ['finance'],
  name: { cs: 'DPH (s daní ⇄ bez daně)', en: 'VAT (with ⇄ without tax)' },
  description: {
    cs: 'Výpočet DPH a ceny s daní z ceny bez daně, nebo naopak ceny bez daně z ceny s daní. České sazby jsou od roku 2024 21 % a 12 %. Výsledky nejsou zaokrouhlené; zaokrouhlení daně na dokladu určuje zákon o DPH.',
    en: 'Works out VAT and the gross price from the net price, or the net price from the gross. Czech rates are 21 % and 12 % since 2024. Results are not rounded; rounding of the tax on an invoice is set by VAT law.',
  },
  keywords: {
    cs: ['dph', 'daň z přidané hodnoty', 's dph', 'bez dph', 'sazba dph', 'cena s daní', 'koeficient dph'],
    en: ['vat', 'value added tax', 'sales tax', 'gross', 'net', 'vat rate', 'price with tax'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { amount, direction } = read.values;
    const rate = read.values.rate === 'custom' ? read.values.customRate : Number(read.values.rate);
    const net = direction === 'without' ? amount : amount / (1 + rate / 100);
    const gross = direction === 'with' ? amount : amount * (1 + rate / 100);
    return { values: { net, vat: gross - net, gross }, warnings: [] };
  },
  references: [{ title: 'Zákon č. 235/2004 Sb., o dani z přidané hodnoty, § 47 – sazby daně' }],
};
