/**
 * Doppler effect for sound.
 */

import { emptyResult, readInputs } from '../../core/tool.js';
import { soundInAir } from './speed-of-sound.js';

/**
 * Observed frequency; speeds are positive towards the other party.
 * @param {number} frequency Hz
 * @param {number} sound speed of sound, m/s
 * @param {number} source m/s towards the observer
 * @param {number} observer m/s towards the source
 */
export function dopplerFrequency(frequency, sound, source, observer) {
  return frequency * (sound + observer) / (sound - source);
}

const inputs = [
  { id: 'frequency', type: 'number', default: 440, min: 0.001, max: 1e9, step: 1, unit: 'Hz', label: { cs: 'Vysílaná frekvence', en: 'Emitted frequency' } },
  { id: 'source', type: 'number', default: 100, min: -1e4, max: 1e4, step: 1, unit: 'km/h', label: { cs: 'Rychlost zdroje k pozorovateli (− od něj)', en: 'Source speed towards the observer (− away)' } },
  { id: 'observer', type: 'number', default: 0, min: -1e4, max: 1e4, step: 1, unit: 'km/h', label: { cs: 'Rychlost pozorovatele ke zdroji (− od něj)', en: 'Observer speed towards the source (− away)' } },
  { id: 'temperature', type: 'number', default: 20, min: -100, max: 500, step: 1, unit: '°C', label: { cs: 'Teplota vzduchu', en: 'Air temperature' } },
];

const outputs = [
  { id: 'approaching', label: { cs: 'Slyšená frekvence', en: 'Heard frequency' }, unit: 'Hz', significant: 6 },
  { id: 'receding', label: { cs: 'Slyšená frekvence po minutí (směry obráceně)', en: 'Heard frequency after passing (directions reversed)' }, unit: 'Hz', significant: 6 },
  { id: 'semitones', label: { cs: 'Rozdíl tónů mezi příjezdem a odjezdem', en: 'Pitch difference between approach and departure' }, unit: { cs: 'půltónů', en: 'semitones' }, significant: 4 },
];

export default {
  id: 'doppler',
  kind: 'calculator',
  category: 'physics-waves',
  tags: ['physics'],
  name: { cs: 'Dopplerův jev', en: 'Doppler effect' },
  description: {
    cs: 'Jakou frekvenci slyší pozorovatel, když se zdroj zvuku nebo on sám pohybuje: f′ = f · (c + v_poz) / (c − v_zdr). Siréna přijíždějícího auta zní výš, po minutí níž. Rychlost zvuku se bere podle teploty vzduchu. Rychlosti blížící se rychlosti zvuku dávají rázovou vlnu.',
    en: 'The frequency an observer hears when the sound source or the observer moves: f′ = f · (c + v_obs) / (c − v_src). The siren of an approaching car sounds higher, lower after it passes. The speed of sound follows the air temperature. Speeds near the speed of sound give a shock wave.',
  },
  keywords: {
    cs: ['dopplerův jev', 'doppler', 'frekvence', 'siréna', 'zvuk', 'pohyb zdroje', 'výška tónu'],
    en: ['doppler effect', 'doppler', 'frequency shift', 'siren', 'sound', 'moving source', 'pitch'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { frequency, temperature } = read.values;
    const source = read.values.source / 3.6;
    const observer = read.values.observer / 3.6;
    const sound = soundInAir(temperature);
    if (Math.abs(source) >= sound || Math.abs(observer) >= sound) {
      return emptyResult(outputs, [{ cs: 'Rychlost dosahuje rychlosti zvuku; vzorec už neplatí.', en: 'The speed reaches the speed of sound; the formula no longer holds.' }]);
    }
    const approaching = dopplerFrequency(frequency, sound, source, observer);
    const receding = dopplerFrequency(frequency, sound, -source, -observer);
    return { values: { approaching, receding, semitones: 12 * Math.log2(approaching / receding) }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – the Doppler effect' }],
};
