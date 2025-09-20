import { Tuning } from '../Tuning';
import { Interval } from '../Interval';

const SCALA_VERSION = 'Scale archive, Scala version 93, January 2025';

/**
 * Convert a Scala scale definition to a Tuning.
 * @see https://www.huygens-fokker.org/scala/scl_format.html
 *
 * @param scala Scala scale definition
 * @param source Source string, defaults to latest Scala archive version
 * @returns Tuning instance
 */
export function tuningFromScala(scala: string, source: string = SCALA_VERSION): Tuning {
  let scalaLines = 0;
  let commentLines = 0;
  let numberIntervals = 0;
  let name = '';
  let label: string;
  const intervals: Interval[] = [];
  const intervalComments: string[] = [];
  const comments: string[] = [];
  (scala + '\r\n').match(/^.*[\n\r]{1,2}|$/gm)?.map(line => line.trim()).filter(line => line.length > 0).forEach(line => {
    if (line.indexOf('!') !== 0) {
      if (scalaLines === 0) {
        // First non-commented line is label (short description).
        label = line;
      } else if (scalaLines === 1) {
        // Second non-commented line is the number of intervals.
        numberIntervals = parseInt(line);
      } else {
        // All other non-commented lines are interval values.
        const { interval, comment } = intervalFromScala(line);
        intervals.push(interval);
        intervalComments.push(comment);
      }
      scalaLines++;
    } else {
      const comment = line.substring(1).trim();
      if (comment.length > 0) {
        if (commentLines > 0) {
          comments.push(comment);
        }
        else {
          name = comment.replace(/\.a?scl$/, '');
        }
      }
      commentLines++;
    }
  });

  if (intervals.length !== numberIntervals) {
    throw new Error(`[tuningFromScala] Error in Scala format: Expecting ${numberIntervals} intervals but got ${intervals.length} instead.`);
  }

  return new Tuning(
    [Interval.fromRatio('1/1'), ...intervals],
    {
      name,
      label,
      description: comments.join('\r\n'),
      source,
      ...(intervalComments.some(i => i !== undefined) && {
          intervals: [undefined, ...intervalComments]
      })
    }
  );
}

/**
 * Parse a Scala interval value and return it as as Interval
 * @param input Interval line in any of the valid interval Scala formats (ratio / cent / integer), optionally followed by "! Comment".
 * @returns Parsed structure {interval: Interval, comment: string | undefined}
 */
function intervalFromScala(input: string): {interval: Interval, comment: string | undefined} {
  const [interval, comment] = input.split('!').map(i => i.trim());
  let result: Interval;

  if (interval.indexOf('/') > 0) {
    // Ratio notation
    result = Interval.fromRatio(interval);
  } else if (interval.indexOf('.') > 0) {
    // Cent notation
    result = Interval.fromCents(parseFloat(interval), interval);
  } else {
    // Integer notation
    result = Interval.fromRatio(interval);
  }

  if (result.ratio.compare(0) < 0) {
    throw new Error(`[tuningFromScala] Error in Scala format: Found negative ratio ${interval} as interval`);
  }

  return { interval: result, comment };
}
