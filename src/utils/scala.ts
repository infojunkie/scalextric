import { Tuning } from '../Tuning';
import { Interval } from '../Interval';

const SCALA_VERSION = 'Scale archive, Scala version 92, May 2024';

/**
 * Convert a Scala scale definition to a Tuning.
 * @param scala: Scala scale definition
 * @returns tuning object
 */
export function tuningFromScala(scala: string, source: string = SCALA_VERSION): Tuning {
  let countLines = 0;
  let commentLines = 0;
  let numberIntervals = 0;
  let label = '';
  const intervals: Interval[] = [];
  const comments: string[] = [];
  (scala + '\r\n').match(/^.*[\n\r]{1,2}|$/gm)?.forEach(line => {
    if (line.indexOf('!') !== 0) {
      if (countLines === 0) {
        // First non-commented line is description
        label = line.trim();
      } else if (countLines === 1) {
        // Second non-commented line is the number of intervals
        numberIntervals = parseInt(line);
      } else {
        // All other non-commented lines are interval values
        const interval = line.trim();
        if (interval.length > 0) {
          intervals.push(intervalFromScala(interval));
        }
      }
      countLines++;
    } else {
      const comment = line.substring(1).trim();
      if (comment.length > 0 && commentLines > 0) {
        comments.push(comment);
      }
      commentLines++;
    }
  });

  if (intervals.length !== numberIntervals) {
    throw new Error(`[tuningFromScala] Error in Scala format: expecting ${numberIntervals} intervals but got ${intervals.length} instead.`);
  }

  return new Tuning(
    [Interval.fromRatio('1/1'), ...intervals],
    label ? {
      label,
      description: comments.join('\r\n'),
      source
    } : undefined
  );
}

/**
 * Parse a Scala interval value and return it as as Interval
 * @param string Interval in any of the valid interval Scala format
 * @returns interval object
 */
function intervalFromScala(interval: string): Interval {
  let result: Interval;

  interval = interval.split(' ')[0];

  if (interval.indexOf('/') > 0) {
    // Ratio notation
    result = Interval.fromRatio(interval);
  } else if (interval.indexOf('.') > 0) {
    // Cent notation
    result = Interval.fromCents(parseFloat(interval));
  } else {
    // Integer notation
    result = Interval.fromRatio(interval);
  }

  if (result.ratio.compare(0) < 0) {
    throw new Error(`[tuningFromScala] Error in Scala format: got negative ratio ${interval} as interval`);
  }

  return result;
}
