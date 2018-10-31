import * as fs from 'fs';
import {expect} from 'chai';
import './setup';
import {Tuning, TuningNomenclature} from '../src/Tuning';
import {tuningFromScala} from '../src/scala';

describe('Tuning', () => {
  const edo12 = new TuningNomenclature(
    '12-tET',
    Tuning.intervalsEdo(12),
    {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    },
    {
      'n': 0, '#': 1, 'b': -1, '##': 2, 'bb': -3
    }
  );
  const edo24 = new TuningNomenclature(
    '24-tET',
    Tuning.intervalsEdo(24),
    {
      'C': 0, 'D': 4, 'E': 8, 'F': 10, 'G': 14, 'A': 18, 'B': 22
    },
    {
      'n': 0, '#': 2, 'b': -2, '##': 4, 'bb': -4,
      '+': 1, '++': 3, 'bs': -1, 'bss': -3
    }
  );
  const pyth12 = tuningFromScala(fs.readFileSync(`test/pyth_12.scl`, 'utf8'));

  it('parses notes in a tuning', () => {
    expect(['C0', 'D0', 'Ebs0', 'F0', 'G0'].map(note => edo24.parse(note).tone)).to.eql([0, 4, 7, 10, 14]);
  });

  it('computes tuning differences', () => {
    expect(pyth12.difference(edo12).map(i => i.cents)).to.be.clsTo([
      0,
      -13.685,
      -3.91,
      5.865,
      -7.82,
      1.955,
      -11.73,
      -1.955,
      -15.64,
      -5.865,
      3.91,
      -9.775,
      0
    ], 0.00005);
  });
});
