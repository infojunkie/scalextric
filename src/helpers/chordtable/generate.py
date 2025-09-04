#!/usr/bin/env python3
"""
generate.py

A command-line tool to generate a JSON chord table from the MMA - Musical Midi Accompaniment chordtable.py source.
"""

import chordtable
import json

print(json.dumps([
  (lambda k, v: {
    'tones': v[0],
    'metadata': {
      'label': k,
      'description': v[2]
    }
  })(k, v) for k, v in chordtable.chordlist.items()
], indent=4, ensure_ascii=False))
