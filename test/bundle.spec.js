import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Tuning } from '../build/scalextric.js';

describe('Scalextric bundle', () => {
  it('accesses Tuning module', () => {
    const edo12 = Tuning.fromEdo(12);
    assert.ok(edo12.transposable);
  });
});
