scalextric
----------

Like Unicode, but for music. Ish.

![GitHub Build Status](https://github.com/infojunkie/scalextric/workflows/Test/badge.svg)

"Ladies and gentlemen, many songs have been written, and this is one of them." — Cannonball Adderley, via [Mo' Horizons, "Yes Baby Yes (Sally Said)"](https://www.youtube.com/watch?v=fhnTkj0GQUE)

Music is probably humanity's most important endeavour. It enfolds the sum of our collective knowledge about space, time, mathematics, physics, psychology, spirituality, love, and all other essential questions. It's not surprising, then, that the Internet abounds with software that attempts to capture glimpses of this all-encompassing system.

More specifically, though, the Internet abounds with _mainstream Western_ music software, i.e. based on the contemporary Western music practice of [12-tet tuning](https://en.wikipedia.org/wiki/12_equal_temperament), nomenclature, instrumentation, repertoire, etc. As a person with a multicultural background, I find this bias highly limiting, both to my own musical growth, as well as to the free spread of worldwide musical cultures - which are providing endless inspiration (and I'm being very charitable here) for the Western music industry in its continuous quest for novelty and profit.

This repo is my modest attempt at providing a rational, ontological foundation to build music software that can express not only mainstream Western music, but also other musics that go beyond the former's boundaries and assumptions. I call this approach "music internationalization" (in code, `music-i18n`), and I've been thinking, [writing](https://blog.karimratib.me/2018/01/05/music-l10n.html), [coding](https://github.com/users/infojunkie/projects/3) and [experimenting](https://musescore.com/user/55682/sets/2178286) about it for a few years now.

# General approach

In this ontological approach, the atomic unit is not the note, but the **interval**. An interval is a ratio of frequencies, and it is the building block for a **tuning**, which represents a sequence of intervals that can generate **tones** given a base frequency. A tone is _still_ not a note: it has no duration; it is an abstract object, just like the ideal point.

Out of tone sequences, we create **tone rows** which can be non-repeating sequences like **scales**, or repeating like **chords**.

In order to communicate about music, we need to give human names to the tones, the intervals, etc. This is where **solmization** comes in. The same tuning can be represented by several solmizations, depending on the music culture we are expressing. Internally, we represent tone steps in [Scientific Pitch Notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation) in order to facilitate exchange with other music systems like MusicXML.

Eventually, we want to inject time into the mix, to express **notes**, **beats** and higher-level time-bound objects. It's a slow process that requires that the abstractions perfectly snap into place. I don't expect to be done soon :sweat_smile:
