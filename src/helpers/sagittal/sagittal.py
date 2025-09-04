#!/usr/bin/env python3
"""
sagittal.py

A command-line tool to process the Sagittal SMuFL Map CSV into a JSON structure that can be used by scalextric.

Usage:
- Download the original ODS file at https://sagittal.org/Sagittal-SMuFL-Map.ods
- Convert to CSV: `soffice --headless --convert-to csv:"Text - txt - csv (StarCalc)":44,34,76 /path/to/Sagittal-SMuFL-Map.ods`
- Call this script: `python sagittal.py /path/to/Sagittal-SMuFL-Map.csv > /path/to/Sagittal-SMuFL-Map.json`

JSON Schema:

[{
  'category': 'xx',
  'unicode': {
    'character': 'xx',
    'code_point': 'U+xx'
  },
  'sagitype': {
    'long': {
      'revo_pure': 'xx',
      'evo_mixed': {
        'comma': 'xx',
        'sharp_flat': 'xx'
      },
    },
    'short': {
      'evo_mixed': {
        'comma': 'xx',
        'sharp_flat': 'xx'
      },
    },
  },
  'pitch': {
    'description': {
      'sharp_flat': 'xx',
      'commatic_alteration': 'xx',
      'direction': 'xx'
    },
    'cents': 0.0,
    'ratio': {
      'numerator': 0,
      'denominator': 0
    },
    'prime_count_vector': {
      '2': 0,
      '3': 0,
      '5': 0,
      '7': 0,
      '11': 0,
      '13': 0,
      '17': 0,
      '19': 0,
      '23': 0,
      '29': 0,
      '31': 0,
      '37': 0
    },
  },
  'ji_pitches': {
    '3^-2': '0/0',
    '3^-1': '0/0',
    '3^0': '0/0',
    '3^1': '0/0',
    '3^2': '0/0'
  },
  'notation_membership': {
    'prime_factor': 0,
    '12_relative_fractions': 'xx',
    '12_relative_cents': 0.0,
    'edo_degrees': {
      '17': 0,
      '19': 0,
      '22': 0,
      '27': 0,
      '29': 0,
      '31': 0,
      '34': 0,
      '39': 0,
      '41': 0,
      '43': 0,
      '46': 0,
      '50': 0,
      '53': 0,
      '60': 0,
      '72': 0,
      '96': 0
    }
  },
  'sagispeak': {
    'simple': {
      'spelling': 'xx',
      'ipa_1': 'xx',
      'ipa_2': 'xx',
      'ipa_3': 'xx',
      'ipa_4': 'xx'
    },
    'alternative': {
      'spelling': 'xx',
      'ipa_1': 'xx',
      'ipa_2': 'xx',
      'ipa_3': 'xx',
      'ipa_4': 'xx'
    },
    'sharp_flat': 'xx'
  },
  'symbol': {
    'symbol_or_accent': 'symbol|accent',
    'shaft_count': 0
  },
  'smufl': {
    'glyph_name': 'xx',
    'description': 'xx'
  },
  'glyph_description': {
    'graphical': 'xx',
    'heraldic': 'xx'
  }
}, ...]
"""

import csv
import itertools
import sys
import json

def str_or_none(cell):
  if not cell:
    return None
  else:
    return str(cell)

def float_or_none(cell):
  if not cell:
    return None
  else:
    return float(cell)

def int_or_none(cell):
  if not cell:
    return None
  else:
    return int(float(cell))

with open(sys.argv[1], 'r') as file:
  map = csv.reader(file, delimiter=',')
  headers = []
  entries = []
  category = ''
  for row in itertools.islice(map, 4):
    headers.append(row)
  for row in map:
    if not row[0]:
      category = row[3]
    else:
      entries.append({
        'range': category,
        'unicode': {
          'character': str_or_none(row[0]),
          'code_point': str_or_none(row[1])
        },
        'sagitype': {
          'long': {
            'revo_pure': str_or_none(row[2]),
            'evo_mixed': {
              'comma': str_or_none(row[3]),
              'sharp_flat': str_or_none(row[4])
            },
          },
          'short': {
            'evo_mixed': {
              'comma': str_or_none(row[5]),
              'sharp_flat': str_or_none(row[6])
            },
          },
        },
        'pitch': {
          'description': {
            'sharp_flat': str_or_none(row[7]),
            'commatic_alteration': str_or_none(row[8]),
            'direction': str_or_none(row[9])
          },
          'cents': float_or_none(row[10]),
          'ratio': {
            'numerator': int_or_none(row[11]),
            'denominator': int_or_none(row[12])
          },
          'prime_count_vector': {
            '2': int_or_none(row[13]),
            '3': int_or_none(row[14]),
            '5': int_or_none(row[15]),
            '7': int_or_none(row[16]),
            '11': int_or_none(row[17]),
            '13': int_or_none(row[18]),
            '17': int_or_none(row[19]),
            '19': int_or_none(row[20]),
            '23': int_or_none(row[21]),
            '29': int_or_none(row[22]),
            '31': int_or_none(row[23]),
            '37': int_or_none(row[24])
          },
        },
        'ji_pitches': {
          '3^-2': str_or_none(row[25]),
          '3^-1': str_or_none(row[26]),
          '3^0': str_or_none(row[27]),
          '3^1': str_or_none(row[28]),
          '3^2': str_or_none(row[29])
        },
        'notation_membership': {
          'prime_factor': None if not row[30] else int(float(row[30])) if '⁻¹' not in row[30] else -1 * int(float(row[30][:-2])),
          '12_relative_fractions': str_or_none(row[31]),
          '12_relative_cents': float_or_none(row[32]),
          'edo_degrees': {
            '17': int_or_none(row[33]),
            '19': int_or_none(row[34]),
            '22': int_or_none(row[35]),
            '27': int_or_none(row[36]),
            '29': int_or_none(row[37]),
            '31': int_or_none(row[38]),
            '34': int_or_none(row[39]),
            '39': int_or_none(row[40]),
            '41': int_or_none(row[41]),
            '43': int_or_none(row[42]),
            '46': int_or_none(row[43]),
            '50': int_or_none(row[44]),
            '53': int_or_none(row[45]),
            '60': int_or_none(row[46]),
            '72': int_or_none(row[47]),
            '96': int_or_none(row[48])
          }
        },
        'sagispeak': {
          'simple': {
            'spelling': str_or_none(row[49]),
            'ipa_1': str_or_none(row[50]),
            'ipa_2': str_or_none(row[51]),
            'ipa_3': str_or_none(row[52]),
            'ipa_4': str_or_none(row[53])
          },
          'alternative': {
            'spelling': str_or_none(row[54]),
            'ipa_1': str_or_none(row[55]),
            'ipa_2': str_or_none(row[56]),
            'ipa_3': None,
            'ipa_4': None
          },
          'sharp_flat': str_or_none(row[57])
        },
        'symbol': {
          'symbol_or_accent': str_or_none(row[58]),
          'shaft_count': int_or_none(row[59])
        },
        'smufl': {
          'glyph_name': str_or_none(row[60]),
          'description': str_or_none(row[61])
        },
        'glyph_description': {
          'graphical': str_or_none(row[62]),
          'heraldic': str_or_none(row[63])
        }
      })
  print(json.dumps(entries))
