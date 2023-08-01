import { toXML } from 'jstoxml';
import { ToneRowSolmized } from './ToneRow';
import { Tuning, Tone } from './Tuning';
import { Solmization } from './Solmization';
import { Annotation } from './utils/Annotation';
import pkg from '../package.json';

const MUSICXML_VERSION = '4.0';

/**
 * Export various Scalextric objects to as a MusicXML document.
 */
export class MusicXML {
  static defaultOptions = {
    'divisions': 768,
    'time': {
      'beats': 4,
      'beatType': 4
    },
  }

  static accidentals = {
    '#': 'sharp',
    '♯': 'sharp',
    '\uE262': 'sharp',

    'n': 'natural',
    '♮': 'natural',
    '\uE261': 'natural',

    'b': 'flat',
    '♭': 'flat',
    '\uE260': 'flat',

    'x': 'double-sharp',
    '𝄪': 'double-sharp',
    '\uE263': 'double-sharp',

    '##': 'sharp-sharp',
    '♯♯': 'sharp-sharp',
    '\uE269': 'sharp-sharp',

    'bb': 'flat-flat',
    '♭♭': 'flat-flat',
    '𝄫': 'flat-flat',
    '\uE264': 'flat-flat',

    'n#': 'natural-sharp',
    '♮♯': 'natural-sharp',
    '\uE268': 'natural-sharp',

    'nb': 'natural-flat',
    '♮♭': 'natural-flat',
    '\uE267': 'natural-flat',

    '#x': 'triple-sharp',
    '♯𝄪': 'triple-sharp',
    '\uE265': 'triple-sharp',

    'bbb': 'triple-flat',
    '♭♭♭': 'triple-flat',
    '\uE266': 'triple-flat',

    // Stein-Zimmermann accidentals (24-EDO)
    '\uE280': 'quarter-flat',
    '\uE282': 'quarter-sharp',
    '\uE281': 'three-quarters-flat',
    '\uE283': 'three-quarters-sharp',

    // Gould arrow quartertone accidentals (24-EDO)
    '\uE275': 'sharp-down',
    '\uE274': 'sharp-up',
    '\uE273': 'natural-down',
    '\uE272': 'natural-up',
    '\uE271': 'flat-down',
    '\uE270': 'flat-up',
    '\uE277': 'double-sharp-down',
    '\uE276': 'double-sharp-up',
    '\uE279': 'flat-flat-down',
    '\uE278': 'flat-flat-up',
    '\uE27A': 'arrow-down',
    '\uE27B': 'arrow-up',

    // Arel-Ezgi-Uzdilek (AEU) accidentals
    '\uE446': 'slash-quarter-sharp',
    '\uE447': 'slash-sharp',
    '\uE442': 'slash-flat',
    '\uE440': 'double-slash-flat',
    '\uE443': 'quarter-flat',
    '\uE444': 'quarter-sharp',
    '\uE441': 'flat',
    '\uE445': 'sharp',

    // Turkish folk music accidentals
    '\uE450': 'sharp-1',
    '\uE451': 'sharp-2',
    '\uE452': 'sharp-3',
    '\uE453': 'sharp-5',
    '\uE454': 'flat-1',
    '\uE455': 'flat-2',
    '\uE456': 'flat-3',
    '\uE457': 'flat-4',

    // Persian accidentals
    '\uE461': 'sori',
    '\uE460': 'koron',
  }

  static durations = {
    8: 'eighth',
    4: 'quarter',
    2: 'half',
    1: 'whole',
  }

  private options: object;
  private reference: Solmization;

  constructor(
    private title: string,
    private objects: ToneRowSolmized[],
    options = {}
  ) {
    this.options = Object.assign({}, MusicXML.defaultOptions, options);
    this.reference = new Solmization(Tuning.fromEdo(12), {
      'C': 0,
      'D': 2,
      'E': 4,
      'F': 5,
      'G': 7,
      'A': 9,
      'B': 11,
    }, {});
  }

  convert(): string {
    return toXML(this.convertDocument(), {
      header: `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML ${MUSICXML_VERSION} Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      `.trim(),
      indent: '  '
    });
  }

  private convertDocument(): object {
    return {
      _name: 'score-partwise',
      _attrs: { 'version': MUSICXML_VERSION },
      _content: [{
        'work': {
          'work-title': this.title
        }
      }, {
        'identification': [{
          'encoding': [{
            'software': `@infojunkie/scalextric ${pkg.version}`
          }, {
            'encoding-date': MusicXML.convertDate(new Date())
          }]
        }]
      }, {
        'part-list': {
          _name: 'score-part',
          _attrs: { 'id': 'P1' },
          _content: {
            _name: 'part-name',
            _attrs: { 'print-object': 'no' },
            _content: this.title
          }
        }
      }, {
        _name: 'part',
        _attrs: { 'id': 'P1' },
        _content: this.convertObjects()
      }]
    }
  }

  /**
   * Convert tone rows to MusicXML measures.
   *
   * - Each tone row starts a new measure
   * - Convert each tone in the tone row to a quarter-tone
   * - Open a new measure as needed
   * - When the tone row is complete:
   *   - Fill the current measure with rests
   *   - Close with a section barline
   *   - Start a new system
   *
   * @returns array of measures.
   */
  private convertObjects(): object[] {
    return this.objects.reduce((measures, object, indesx) => {
      // Start new measure.
      let measure = this.convertMeasure(measures.length + 1);
      measures.push(measure);

      // New system if needed.
      if (indesx > 0) {
        measure['_content'].push({
          _name: 'print',
          _attrs: { 'new-system': 'yes' }
        })
      }

      // First measure attributes.
      if (indesx === 0) {
        measure['_content'].push({
          'attributes': [{
            'divisions': this.options['divisions']
          }, {
            'key': [{
              'fifths': 0
            }, {
              'mode': 'major'
            }]
          }, {
            'time': [{
              'beats': this.options['time']['beats']
            }, {
              'beat-type': this.options['time']['beatType']
            }]
          }, {
            'clef': [{
              'sign': 'G'
            }, {
              'line': 2
            }]
          }]
        });
      }

      // Add object label if any.
      const labels = Annotation.findByLabel('label', object.annotations);
      console.log(labels);
      if (labels) {
        measure['_content'].push({
          _name: 'direction',
          _attrs: { 'placement': 'above' },
          _content: [{
            'direction-type': [{
              'words': labels[0]
            }]
          }],
        });
      }

      // Loop on tones.
      let beat = 0;
      object.tones.forEach((tone, toneIndex) => {
        measure['_content'].push(this.convertNote(tone, object));

        // Add new measure if needed.
        beat = (beat + 1) % this.options['time']['beats'];
        if (beat === 0 && toneIndex < object.tones.length - 1) {
          measure = this.convertMeasure(measures.length + 1);
          measures.push(measure);
        }
      });

      // // Add remaining rests to the last measure.
      // if (beat > 0) while (beat++ < this.options['time']['beats']) {
      //   measure['_content'].push({
      //     _name: 'note',
      //     _content: [{
      //       _name: 'rest',
      //     }, {
      //       'duration': this.options['divisions'],
      //     }, {
      //       'type': MusicXML.noteTypes[this.options['time']['beatType']],
      //     }]
      //   })
      // }

      // Close the bar with a section barline.
      measure['_content'].push(this.convertBar('right', 'light-light'));

      return measures;
    }, []);
  }

  private convertBar(location: string, style: string): object {
    return {
      _name: 'barline',
      _attrs: { 'location': location },
      _content: [{
        'bar-style': style
      }]
    }
  }

  private convertMeasure(number: number): object {
    return {
      _name: 'measure',
      _attrs: { 'number': number },
      _content: [],
    }
  }

  private convertNote(tone: Tone, object: ToneRowSolmized): object {
    const name = object.solmization.name(tone)[0];
    const step = name[0];
    const accidental = this.convertAccidental(name.slice(1, -1));
    const octave = name[name.length-1];

    // Generate a pitch alteration as compared to the reference tuning.
    const reference = this.reference.parse(`${step}${octave}`);
    const cents = tone.tune.difference(reference.tune).cents;

    return {
      _name: 'note',
      _content: [{
        _name: 'pitch',
        _content: [{
          'step': step
        }, {
          'alter': Math.round(cents * 100) / 10000
        }, {
          'octave': octave
        }]
      }, {
        'duration': this.options['divisions'],
      }, {
        'type': MusicXML.durations[this.options['time']['beatType']],
      }, {
        ...(accidental && accidental !== 'other' && { 'accidental': accidental })
      }, {
        ...(accidental && accidental === 'other' && {
          _name: 'accidental',
          _content: accidental,
          _attrs: { 'smufl': name.slice(1, -1) }
       })
      }],
    }
  }

  private convertAccidental(accidental): string {
    if (!accidental.length) return null;
    if (accidental in MusicXML.accidentals) {
      return MusicXML.accidentals[accidental];
    }
    return 'other';
  }

  // Date in yyyy-mm-dd
  // https://stackoverflow.com/a/50130338/209184
  private static convertDate(date): string {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }
}
