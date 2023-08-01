import { expect } from 'chai';
import './setup';
import * as fs from 'fs';
import { ToneRow } from '../src/ToneRow';
import { Tuning, Tone } from '../src/Tuning';
import { tuningFromScala } from '../src/utils/scala';
import { arrayEqual, arrayRange } from '../src/utils/helpers';

describe('ToneRow', () => {
  const edo24 = Tuning.fromEdo(24);
  const row = ToneRow.fromPitches(edo24, [0, 8, 14, 22]);

  it('transposes', () => {
    expect(
      row.transpose(Tone.fromPitch(edo24, 4)).pitches
    ).to.eql([4, 12, 18, 26]);
  });

  it('inverts', () => {
    expect(
      row.invert(Tone.fromPitch(edo24, 12)).pitches
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

describe('Chords experiment', () => {
  const chords = JSON.parse(fs.readFileSync(`data/chords.json`, 'utf8'));
  const edo12 = Tuning.fromEdo(12);

  it('makes tone rows from chords', () => {
    const chord1 = chords.find(chord => chord.annotations.find(a => a.label === 'label' && a.value === '7#5b9'))
    const test1 = ToneRow.fromPitches(edo12, chord1.tones, chord1.annotations);
    expect(test1.pitches).to.eql([0, 4, 8, 10, 13]);
    const chord2 = chords.find(chord => arrayEqual(chord.tones, [0, 4, 8, 10, 13], (a,b) => a-b))
    const test2 = ToneRow.fromPitches(edo12, chord2.tones, chord2.annotations);
    expect(test2.annotations.find(a => a.label === 'label')?.value).to.equal('aug7b9');
  })
});

describe('Arabic/Turkish maqam experiment', () => {
  const quarter = Tuning.fromEdo(24);
  const kommah = Tuning.fromEdo(53);
  const ederer = tuningFromScala(fs.readFileSync(`test/data/ederer.scl`, 'utf8'));
  const rastQuarter = ToneRow.fromPitches(quarter, [0, 4, 7, 10, 14]);
  const rastKommah = ToneRow.fromPitches(kommah, [0, 9, 17, 22, 31]);
  const rastEderer = ToneRow.fromPitches(ederer, [0, 6, 11, 14, 20]);

  it('computes ratio differences', () => {
    arrayRange(5).forEach(i => {
      console.log(rastQuarter.tuning.tune(rastQuarter.tones[i]).cents);
      console.log(rastKommah.tuning.tune(rastKommah.tones[i]).cents);
      console.log(rastEderer.tuning.tune(rastEderer.tones[i]).cents);
    });
  });
});
