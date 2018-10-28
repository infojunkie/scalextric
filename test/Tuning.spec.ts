import {expect} from 'chai';
import {Tuning, TuningNomenclature, TuningTone} from '../src/Tuning';
import '../src/Helpers';

describe('Tuning', () => {
  const edo24 = new TuningNomenclature(
    '24-tET',
    Tuning.intervalsEdo(24),
    new TuningTone(0,0,0),
    {
      'C': 0, 'D': 4, 'E': 8, 'F': 10, 'G': 14, 'A': 18, 'B': 22
    },
    {
      'n': 0, '#': 2, 'b': -2, '##': 4, 'bb': -4,
      '+': 1, '++': 3, 'bs': -1, 'bss': -3
    }
  );

  it('parses notes in a tuning', () => {
    expect(['C0', 'D0', 'Ebs0', 'F0', 'G0'].map(note => edo24.parse(note).tone)).to.eql([0, 4, 7, 10, 14]);
  });
});
