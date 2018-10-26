scalextric
----------

Musical structures from the ground up.

# Use cases

The pseudo-code below illustrates various desired uses of the library. It may not correspond
exactly to the functions and interfaces in the actual code. Nor should it be expected to be
rigorously correct code in its own right (because it's not).

## Construct diatonic chords of a given scale

```
// Regular 12-tone equal temperament used throughout
tuning = Tuning.intervalsEdo(12)

// Various scale constructions
majorC = Scale.fromIntervals(tuning, [ 2, 2, 1, 2, 2, 2, 1 ], 'C0')
majorD = Scale.fromTones(tuning, [ 2, 4, 6, 7, 9, 11, 13, 14 ])
majorE = Scale.fromName(tuning, 'E major')

// All the diatonic 7th chords of a scale
seventhChordsCmajor = majorC.eachTone.map(tone,
  Chord.fromIntervals([ 0, 2, 4, 6 ], tone)
)
seventhChordsCmajor.each(chord,
  print chord.name()
  print chord.spelling()
)
// output:
//
// Cmaj7 (C E G B)
// Dm7   (D F A C)
// Em7       .
// Fmaj7     .
// G7        .
// Am7
// Bm7b5
//

```
