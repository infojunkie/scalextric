import assert from 'node:assert';
import { describe, it } from 'node:test';
import { Tuning } from '../src/index';

describe('Scalextric', () => {
  it('accesses Tuning module', () => {
    const edo12 = Tuning.fromEdo(12);
    assert(edo12.transposable);
  });
});
