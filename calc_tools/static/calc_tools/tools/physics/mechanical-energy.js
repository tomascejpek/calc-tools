/**
 * Kinetic and potential energy.
 */

import { G0 } from '../../core/physics.js';
import { emptyResult, readInputs } from '../../core/tool.js';

const inputs = [
  { id: 'mass', type: 'number', default: 1000, min: 0, max: 1e12, step: 1, unit: 'kg', label: { cs: 'Hmotnost', en: 'Mass' } },
  { id: 'speed', type: 'number', default: 50, min: 0, max: 3e8, step: 1, unit: 'km/h', label: { cs: 'Rychlost', en: 'Speed' } },
  { id: 'height', type: 'number', default: 10, min: -1e6, max: 1e6, step: 1, unit: 'm', label: { cs: 'Výška', en: 'Height' } },
  { id: 'g', type: 'number', default: G0, min: 0.01, max: 1000, step: 0.01, unit: 'm/s²', label: { cs: 'Tíhové zrychlení g', en: 'Gravity g' } },
];

const outputs = [
  { id: 'kinetic', label: { cs: 'Kinetická energie ½mv²', en: 'Kinetic energy ½mv²' }, unit: 'kJ', significant: 6 },
  { id: 'potential', label: { cs: 'Potenciální energie mgh', en: 'Potential energy mgh' }, unit: 'kJ', significant: 6 },
  { id: 'total', label: { cs: 'Celková mechanická energie', en: 'Total mechanical energy' }, unit: 'kJ', significant: 6 },
  { id: 'equivalentHeight', label: { cs: 'Výška se stejnou energií jako rychlost', en: 'Height with the same energy as the speed' }, unit: 'm', significant: 6 },
];

export default {
  id: 'mechanical-energy',
  kind: 'calculator',
  category: 'physics-mechanics',
  tags: ['physics'],
  name: { cs: 'Kinetická a potenciální energie', en: 'Kinetic and potential energy' },
  description: {
    cs: 'Kinetická energie Ek = ½mv² a polohová energie Ep = mgh. Ukáže i výšku, ze které by těleso volným pádem nabralo zadanou rychlost: auto v 50 km/h nese stejnou energii jako po pádu z asi 9,8 m.',
    en: 'Kinetic energy Ek = ½mv² and potential energy Ep = mgh. Also shows the height from which a free fall would reach the given speed: a car at 50 km/h carries the same energy as after a fall of about 9.8 m.',
  },
  keywords: {
    cs: ['kinetická energie', 'potenciální energie', 'polohová energie', 'pohybová energie', 'mechanická energie', 'joule'],
    en: ['kinetic energy', 'potential energy', 'mechanical energy', 'energy', 'joule'],
  },
  inputs,
  outputs,
  compute(values) {
    const read = readInputs(inputs, values);
    if (!read.ok) return emptyResult(outputs, read.warnings);
    const { mass, height, g } = read.values;
    const v = read.values.speed / 3.6;
    const kinetic = mass * v * v / 2 / 1000;
    const potential = mass * g * height / 1000;
    return { values: { kinetic, potential, total: kinetic + potential, equivalentHeight: v * v / (2 * g) }, warnings: [] };
  },
  references: [{ title: 'Halliday, D., Resnick, R., Walker, J.: Fundamentals of Physics – kinetic and potential energy' }],
};
