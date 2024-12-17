import { describe, it } from 'node:test';
import * as fs from 'fs';
import { MusicXML } from '../src/MusicXML';
import { ToneRow, ToneRowSolmized } from '../src/ToneRow';
import { Tuning } from '../src/Tuning';
import { Solmization } from '../src/Solmization';
import { tuningFromScala } from '../src/utils/scala';
import { validateXMLWithXSD } from 'validate-with-xmllint';
import { Annotation } from '../src/utils/Annotation';

describe('MusicXML', () => {
  it('exports valid files', async () => {
    const quarter = Tuning.fromEdo(24);
    const kommah = Tuning.fromEdo(53);
    const ederer = tuningFromScala(fs.readFileSync(`test/data/ederer.scl`, 'utf8'));
    const rastQuarter = ToneRowSolmized.fromToneRow(
      ToneRow.fromPitchClasses(quarter, [0, 4, 7, 10, 14], 4, [new Annotation('label', '24-TET (Arabic standard tuning)')]),
      new Solmization(quarter, {
        'C': 0,
        'D': 4,
        'E': 8,
        'F': 10,
        'G': 14,
        'A': 18,
        'B': 22,
      }, {
        '\uE280': -1,
        '\uE282': +1,
      })
    );
    const rastKommah = ToneRowSolmized.fromToneRow(
      ToneRow.fromPitchClasses(kommah, [0, 9, 17, 22, 31], 4, [new Annotation('label', '53-TET (Holdrian comma tuning)')]),
      new Solmization(kommah, {
        'C': 0,
        'D': 9,
        'E': 18,
        'F': 22,
        'G': 31,
        'A': 40,
        'B': 49,
      }, {
        '\uE280': -1,
        '\uE282': +1,
      })
    );
    const rastEderer = ToneRowSolmized.fromToneRow(
      ToneRow.fromPitchClasses(ederer, [0, 6, 11, 14, 20], 4, [new Annotation('label', 'Ederer tuning')]),
      new Solmization(ederer, {
        'C': 0,
        'D': 6,
        'E': 12,
        'F': 14,
        'G': 20,
        'A': 26,
        'B': 32,
      }, {
        '\uE280': -1,
        '\uE282': +1,
      })
    );
    const mxml = new MusicXML('Rast tetrachord in multiple tunings', [rastQuarter, rastKommah, rastEderer]);
    const xml = mxml.convert();
    await validateXMLWithXSD(xml, 'test/data/musicxml.xsd');
    fs.writeFileSync(`test/output/rast-tetrachord.musicxml`, xml);
  });
});
