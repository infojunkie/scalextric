import assert from './assert';
import { describe, it } from 'node:test';
import * as fs from 'fs';
import { solmizationFromAbleton } from '../src/io/ableton';

describe('Ableton', () => {
  it('parses Ableton tunings', () => {
    const solmization = solmizationFromAbleton(fs.readFileSync(`test/data/rast.ascl`, 'utf8'));
    assert.deepStrictEqual(solmization.notes, {
      'C': 0, 'D♭': 1, 'D': 2, 'E♭': 3, 'E1/2♭': 4, 'F': 5, 'F♯': 6, 'G': 7, 'A♭': 8, 'A': 9, 'B♭': 10, 'B1/2♭':11
    });
    assert.closeTo(solmization.tuning.intervals[0].cents, 0);
    assert.closeTo(solmization.tuning.intervals[1].cents, 128);
    assert.ok(solmization.tuning.metadata?.source?.indexOf('Inside Arabic Music') === 0);
    assert.closeTo(solmization.tuning.metadata?.reference?.frequency, 261.6256);
    assert.strictEqual(solmization.tuning.metadata.name, 'Rast 1 - Egypt mid 20th');
    assert.deepStrictEqual(solmization.tuning.metadata.intervals, [
      undefined,
      'D♭ for Saba Dalanshin A',
      'D Pythagorean',
      'E♭ super low for Nahawand',
      'E1/2♭ on the low end, Egyptian 1960s - reference composition "YamSaharni" by Sayyed Mekkawi for Umm Kulthum',
      'F Pythagorean',
      'F♯ for Nikriz C',
      'G Pythagorean',
      'A♭ for Hijaz G',
      'A Pythagorean',
      'B♭ lower than Pythagorean',
      'B1/2♭ relatively Higher than the E1/2♭',
      undefined
    ]);
  });
});
