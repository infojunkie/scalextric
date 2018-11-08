import {expect} from 'chai';
import './setup';

import * as fs from 'fs';
import {Tuning} from '../src/Tuning';
import {MusicSystem, TuningMap} from '../src/MusicSystem';

describe('MusicSystem', () => {
  const edo24 = new Tuning('24-tET', Tuning.intervalsEdo(24));
});
