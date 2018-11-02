import {expect} from 'chai';
import './setup';

import {ToneRow} from '../src/ToneRow';
import {Tuning, TuningNomenclature, TuningTone} from '../src/Tuning';

describe('ToneRow', () => {
  const edo24 = new TuningNomenclature(
    new Tuning('24-tET', Tuning.intervalsEdo(24)),
    {
      'C': 0, 'D': 4, 'E': 8, 'F': 10, 'G': 14, 'A': 18, 'B': 22
    },
    {
      'n': 0, '#': 2, 'b': -2, '##': 4, 'bb': -4,
      '+': 1, '++': 3, 'bs': -1, 'bss': -3
    }
  );

  const row = ToneRow.fromPitches(edo24.tuning, [0, 8, 14, 22]);

  it('transposes', () => {
    expect(
      row.transpose(TuningTone.fromPitch(edo24.tuning, 4)).pitches
    ).to.eql([4, 12, 18, 26]);
  });

  it('inverts', () => {
    expect(
      row.invert(TuningTone.fromPitch(edo24.tuning, 12)).pitches
    ).to.eql([12, 4, -2, -10]);
  });

  it('reverses', () => {
    expect(
      row.reverse().pitches
    ).to.eql([22, 14, 8, 0]);
  });

  it('rotates', () => {
    expect(
      row.rotate(2).pitches
    ).to.eql([14, 22, 0, 8]);
    expect(
      row.rotate(7).pitches
    ).to.eql([22, 0, 8, 14]);
    expect(
      row.rotate(-3).pitches
    ).to.eql([8, 14, 22, 0]);
    expect(
      row.rotate(0).pitches
    ).to.eql([0, 8, 14, 22]);
  });

  it('monotonizes', () => {
    expect(
      row.rotate(2).monotonize().pitches
    ).to.eql([14, 22, 24, 32]);
    expect(
      row.rotate(2).monotonize(true).pitches
    ).to.eql([14, -2, -24, -40]);
  });

});
