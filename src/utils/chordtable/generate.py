# Generate a JSON chord table from the MMA - Musical Midi Accompaniment source.
import chordtable
import json

print(json.dumps([
  (lambda k, v: {
    'tones': v[0],
    'annotations': [{
      'label': 'label',
      'value': k
    },{
      'label': 'description',
      'value': v[2]
    }]
  })(k, v) for k, v in chordtable.chordlist.items()
], indent=4, ensure_ascii=False))
