# Generate a JSON chord table from the MMA - Musical Midi Accompaniment source.
import chordtable
import json

print(json.dumps([
  (lambda k, v: {
    'tones': v[0],
    'tuning': 12,   # 12-tET is the reference for the tones above
    'annotations': [{
      'name': 'label',
      'value': k
    },{
      'name': 'description',
      'value': v[2]
    }]
  })(k, v) for k, v in chordtable.chordlist.items()
], indent=4, ensure_ascii=False))
