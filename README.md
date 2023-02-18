scalextric
----------

Like Unicode CLDR, but for music.

![GitHub Build Status](https://github.com/infojunkie/scalextric/workflows/Test/badge.svg)

"Ladies and gentlemen, many songs have been written, and this is one of them." — Cannonball Adderley, via [Mo' Horizons, "Yes Baby Yes (Sally Said)"](https://www.youtube.com/watch?v=fhnTkj0GQUE)

Music is probably humanity's most important endeavour. It enfolds the sum of our collective knowledge about space, time, mathematics, physics, psychology, spirituality, love, and all other essential questions. It's not surprising, then, that the Internet abounds with software that attempts to capture glimpses of this all-encompassing system.

More specifically, though, the Internet abounds with _mainstream Western_ music software, i.e. based on the contemporary Western music practice of [12-tet tuning](https://en.wikipedia.org/wiki/12_equal_temperament), nomenclature, instrumentation, repertoire, etc. As a person with a multicultural background, I find this bias highly limiting, both to my own musical growth, as well as to the free spread of worldwide musical cultures - which are providing endless inspiration (and I'm being very charitable here) for the Western music industry in its continuous quest for novelty and profit.

This repo is my modest attempt at providing a rational, ontological foundation to build music systems that can express not only mainstream Western music, but also other musics that go beyond the former's boundaries and assumptions. I call this approach "music internationalization" (in code, `music-i18n`), and I've been thinking, [writing](https://blog.karimratib.me/2018/01/05/music-l10n.html), [coding](https://github.com/users/infojunkie/projects/3) and [arranging](https://musescore.com/user/55682/sets/2178286) around it for a few years now.

# General approach

In this ontological approach, the atomic unit is not the note, but the **interval**. An interval is a ratio of frequencies, and it is the building block for a **tuning**, which represents a sequence of intervals that can generate **tones** given a base frequency. A tone is _still_ not a note: it has no duration; it is a mathematical object, just like the ideal point.

In order to represent a tuning in the real world, we need to give human names to the tones, the intervals, etc. This is where **tuning notation** comes in. The same tuning can be represented by several notations, depending on the music culture we are expressing.

Eventually, we want to reach **notes**, **scales**, **chords**, and all the familiar musical objects - while preserving the localizable structure above. It's a slow process that requires that the abstractions perfectly snap into place. I don't expect to be done soon :sweat_smile:
