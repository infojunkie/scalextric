import { toXML } from 'jstoxml';
import { ToneRow } from './ToneRow';
import { Tuning, TuningTone } from './Tuning';
import { TuningNotation } from './TuningNotation';
import { Annotation } from './utils/Annotation';

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

  static notes = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
  }

  static accidentalValues = {
    '#': 1,
    'b': -1,
  }

  static accidentalNames = {
    '#': 'sharp',
    'b': 'flat',
  }

  static noteTypes = {
    8: 'eighth',
    4: 'quarter',
    2: 'half',
    1: 'whole',
  }

  private options: object;
  private tuning: Tuning;
  private tuningNotation: TuningNotation;

  constructor(private title: string, private objects: ToneRow[], options = {}) {
    this.options = Object.assign({}, MusicXML.defaultOptions, options);
    this.tuning = new Tuning(Tuning.intervalsEdo(12));
    this.tuningNotation = TuningNotation.fromNotesAccidentalsCombination(
      this.tuning,
      MusicXML.notes,
      MusicXML.accidentalValues
    );
  }

  convert(): string {
    return toXML(this.convertDocument(), {
      header: `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      `.trim(),
      indent: '  '
    });
  }

  private convertDocument(): object {
    return {
      'score-partwise': [{
        'work': {
          'work-title': this.title
        }
      }, {
        'identification': [{
          'encoding': [{
            'software': '@infojunkie/scalextric'
          }, {
            'encoding-date': MusicXML.convertDate(new Date())
          }, {
            _name: 'supports',
            _attrs: { 'element': 'accidental', 'type': 'no' }
          }, {
            _name: 'supports',
            _attrs: { 'element': 'transpose', 'type': 'no' }
          }, {
            _name: 'supports',
            _attrs: { 'attribute': 'new-page', 'element': 'print', 'type': 'yes', 'value': 'yes' }
          }, {
            _name: 'supports',
            _attrs: { 'attribute': 'new-system', 'element': 'print', 'type': 'yes', 'value': 'yes' }
          }]
        }]
      }, {
        'defaults': {
          'scaling': {
            'millimeters': 7,
            'tenths': 40
          }
        }
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
    return this.objects.reduce((measures, object, objectIndex) => {
      // Start new measure.
      let measure = this.convertMeasure(measures.length + 1);
      measures.push(measure);

      // New system if needed.
      if (objectIndex > 0) {
        measure['_content'].push({
          _name: 'print',
          _attrs: { 'new-system': 'yes' }
        })
      }

      // Add object label if any.
      const labels = Annotation.findByLabel('label', object.annotations);
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
        measure['_content'].push(this.convertNote(tone));

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

  private convertNote(tone: TuningTone): object {
    const target = this.tuning.nearest(tone.tune);
    const name = this.tuningNotation.name(target.tone)[0];
    const step = name[0];
    const { accidental, alter } = (name[1] in MusicXML.accidentalValues) ? {
      accidental: MusicXML.accidentalNames[name[1]],
      alter: MusicXML.accidentalValues[name[1]],
    } : {
      accidental: null,
      alter: 0,
    };
    const octave = name[name.length-1];
    const cents = target.difference.cents;
    return {
      _name: 'note',
      _content: [{
        _name: 'pitch',
        _content: [{
          'step': step
        }, {
          'alter': alter + (Math.round(cents * 10) / 1000)
        }, {
          'octave': octave
        }]
      }, {
        'duration': this.options['divisions'],
      }, {
        'type': MusicXML.noteTypes[this.options['time']['beatType']],
      }, {
        ...(accidental && { 'accidental': accidental })
      }],
    }
  }

  // Date in yyyy-mm-dd
  // https://stackoverflow.com/a/50130338/209184
  private static convertDate(date): string {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
  }
}
