import assert from './assert';
import { describe, it } from 'node:test';
import * as fs from 'fs';
import { tuningFromScala } from '../src/utils/scala';

describe('Scala', () => {
  const tolerance = 0.00005;

  it('parses Scala scales', () => {
    const tuning = tuningFromScala(fs.readFileSync(`test/data/pyth_12.scl`, 'utf8'));
    assert.ok(!!tuning.metadata?.label);
    assert.strictEqual(tuning.steps, 12);
    assert.closeTo(tuning.intervals.map(i => i.ratio.valueOf()), [
      1,
      2187/2048,
      9/8,
      32/27,
      81/64,
      4/3,
      729/512,
      3/2,
      6561/4096,
      27/16,
      16/9,
      243/128,
      2/1
    ], tolerance);
  });

  it('parses Scala scales with cents', () => {
    const tuning = tuningFromScala(fs.readFileSync(`test/data/10-29.scl`, 'utf8'));
    assert.strictEqual(tuning.steps, 10);
    assert.closeTo(tuning.intervals.map(i => i.cents), [
      0,
      124.13793,
      248.27586,
      372.41379,
      455.17241,
      579.31034,
      703.44828,
      827.58621,
      951.72414,
      1075.86207,
      1200
    ], tolerance);
  });

  it('parses Scala comments', () => {
    const tuning = tuningFromScala(fs.readFileSync(`test/data/ederer.scl`, 'utf8'));
    assert.deepStrictEqual(tuning.metadata, {
      label: 'Just intonation for Turkish-Arabic scales by Eric Ederer',
      description: 'Eric Ederer - Makam & Beyond: A Progressive Approach to Near Eastern Music Theory (2015)',
      source: 'Scale archive, Scala version 92, May 2024'
    });
  });

  it('rejects bad Scala scales', () => {
    assert.throws(() => { tuningFromScala(fs.readFileSync(`test/data/bad1.scl`, 'utf8')); });
    assert.throws(() => { tuningFromScala(fs.readFileSync(`test/data/bad2.scl`, 'utf8')); });
  });
});
