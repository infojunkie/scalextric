import { expect } from 'chai';
import './setup';
import * as fs from 'fs';
import { MusicXML } from '../src/MusicXML';
import { ToneRow } from '../src/ToneRow';
import { Tuning } from '../src/Tuning';
import { tuningFromScala } from '../src/utils/scala';
import { validateXMLWithXSD } from 'validate-with-xmllint';
import { Annotation } from '../src/utils/Annotation';

describe('MusicXML', () => {
  it('exports valid files', async () => {
    const quarter = new Tuning(Tuning.intervalsEdo(24));
    const kommah = new Tuning(Tuning.intervalsEdo(53));
    const ederer = tuningFromScala(fs.readFileSync(`test/data/ederer.scl`, 'utf8'));
    const rastQuarter = ToneRow.fromPitchClasses(quarter, [0, 4, 7, 10, 14], 4, [new Annotation('label', '24-TET (Arabic standard tuning)')]);
    const rastKommah = ToneRow.fromPitchClasses(kommah, [0, 9, 17, 22, 31], 4, [new Annotation('label', '53-TET (Holdrian comma tuning)')]);
    const rastEderer = ToneRow.fromPitchClasses(ederer, [0, 6, 11, 14, 20], 4, [new Annotation('label', 'Ederer tuning')]);
    const mxml = new MusicXML('Rast tetrachord in multiple tunings', [rastQuarter, rastKommah, rastEderer]);
    const xml = mxml.convert();
    await validateXMLWithXSD(xml, 'test/data/musicxml.xsd');
    fs.writeFileSync(`test/output/rast-tetrachord.musicxml`, xml);
  });
});
