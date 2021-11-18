(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Scalextric"] = factory();
	else
		root["Scalextric"] = factory();
})(this, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/fraction.js/fraction.js":
/*!**********************************************!*\
  !*** ./node_modules/fraction.js/fraction.js ***!
  \**********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * @license Fraction.js v4.1.2 23/05/2021
 * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
 *
 * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/


/**
 *
 * This class offers the possibility to calculate fractions.
 * You can pass a fraction in different formats. Either as array, as double, as string or as an integer.
 *
 * Array/Object form
 * [ 0 => <nominator>, 1 => <denominator> ]
 * [ n => <nominator>, d => <denominator> ]
 *
 * Integer form
 * - Single integer value
 *
 * Double form
 * - Single double value
 *
 * String form
 * 123.456 - a simple double
 * 123/456 - a string fraction
 * 123.'456' - a double with repeating decimal places
 * 123.(456) - synonym
 * 123.45'6' - a double with repeating last place
 * 123.45(6) - synonym
 *
 * Example:
 *
 * var f = new Fraction("9.4'31'");
 * f.mul([-4, 3]).div(4.9);
 *
 */

(function(root) {

  "use strict";

  // Maximum search depth for cyclic rational numbers. 2000 should be more than enough.
  // Example: 1/7 = 0.(142857) has 6 repeating decimal places.
  // If MAX_CYCLE_LEN gets reduced, long cycles will not be detected and toString() only gets the first 10 digits
  var MAX_CYCLE_LEN = 2000;

  // Parsed data to avoid calling "new" all the time
  var P = {
    "s": 1,
    "n": 0,
    "d": 1
  };

  function createError(name) {

    function errorConstructor() {
      var temp = Error.apply(this, arguments);
      temp['name'] = this['name'] = name;
      this['stack'] = temp['stack'];
      this['message'] = temp['message'];
    }

    /**
     * Error constructor
     *
     * @constructor
     */
    function IntermediateInheritor() { }
    IntermediateInheritor.prototype = Error.prototype;
    errorConstructor.prototype = new IntermediateInheritor();

    return errorConstructor;
  }

  var DivisionByZero = Fraction['DivisionByZero'] = createError('DivisionByZero');
  var InvalidParameter = Fraction['InvalidParameter'] = createError('InvalidParameter');

  function assign(n, s) {

    if (isNaN(n = parseInt(n, 10))) {
      throwInvalidParam();
    }
    return n * s;
  }

  function throwInvalidParam() {
    throw new InvalidParameter();
  }

  function factorize(num) {

    var factors = {};

    var n = num;
    var i = 2;
    var s = 4;

    while (s <= n) {

      while (n % i === 0) {
        n /= i;
        factors[i] = (factors[i] || 0) + 1;
      }
      s += 1 + 2 * i++;
    }

    if (n !== num) {
      if (n > 1)
      factors[n] = (factors[n] || 0) + 1;
    } else {
      factors[num] = (factors[num] || 0) + 1;
    }
    return factors;
  }

  var parse = function(p1, p2) {

    var n = 0, d = 1, s = 1;
    var v = 0, w = 0, x = 0, y = 1, z = 1;

    var A = 0, B = 1;
    var C = 1, D = 1;

    var N = 10000000;
    var M;

    if (p1 === undefined || p1 === null) {
      /* void */
    } else if (p2 !== undefined) {
      n = p1;
      d = p2;
      s = n * d;
    } else
      switch (typeof p1) {

        case "object":
          {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n *= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throwInvalidParam();
            }
            s = n * d;
            break;
          }
        case "number":
          {
            if (p1 < 0) {
              s = p1;
              p1 = -p1;
            }

            if (p1 % 1 === 0) {
              n = p1;
            } else if (p1 > 0) { // check for != 0, scale would become NaN (log(0)), which converges really slow

              if (p1 >= 1) {
                z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                p1 /= z;
              }

              // Using Farey Sequences
              // http://www.johndcook.com/blog/2010/10/20/best-rational-approximation/

              while (B <= N && D <= N) {
                M = (A + C) / (B + D);

                if (p1 === M) {
                  if (B + D <= N) {
                    n = A + C;
                    d = B + D;
                  } else if (D > B) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                  break;

                } else {

                  if (p1 > M) {
                    A += C;
                    B += D;
                  } else {
                    C += A;
                    D += B;
                  }

                  if (B > N) {
                    n = C;
                    d = D;
                  } else {
                    n = A;
                    d = B;
                  }
                }
              }
              n *= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
        case "string":
          {
            B = p1.match(/\d+|./g);

            if (B === null)
              throwInvalidParam();

            if (B[A] === '-') {// Check for minus sign at the beginning
              s = -1;
              A++;
            } else if (B[A] === '+') {// Check for plus sign at the beginning
              A++;
            }

            if (B.length === A + 1) { // Check if it's just a simple number "1234"
              w = assign(B[A++], s);
            } else if (B[A + 1] === '.' || B[A] === '.') { // Check if it's a decimal number

              if (B[A] !== '.') { // Handle 0.5 and .5
                v = assign(B[A++], s);
              }
              A++;

              // Check for decimal places
              if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
                w = assign(B[A], s);
                y = Math.pow(10, B[A].length);
                A++;
              }

              // Check for repeating places
              if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
                x = assign(B[A + 1], s);
                z = Math.pow(10, B[A + 1].length) - 1;
                A += 3;
              }

            } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A += 3;
            } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A += 5;
            }

            if (B.length <= A) { // Check for more tokens on the stack
              d = y * z;
              s = /* void */
              n = x + d * v + z * w;
              break;
            }

            /* Fall through on error */
          }
        default:
          throwInvalidParam();
      }

    if (d === 0) {
      throw new DivisionByZero();
    }

    P["s"] = s < 0 ? -1 : 1;
    P["n"] = Math.abs(n);
    P["d"] = Math.abs(d);
  };

  function modpow(b, e, m) {

    var r = 1;
    for (; e > 0; b = (b * b) % m, e >>= 1) {

      if (e & 1) {
        r = (r * b) % m;
      }
    }
    return r;
  }


  function cycleLen(n, d) {

    for (; d % 2 === 0;
      d /= 2) {
    }

    for (; d % 5 === 0;
      d /= 5) {
    }

    if (d === 1) // Catch non-cyclic numbers
      return 0;

    // If we would like to compute really large numbers quicker, we could make use of Fermat's little theorem:
    // 10^(d-1) % d == 1
    // However, we don't need such large numbers and MAX_CYCLE_LEN should be the capstone,
    // as we want to translate the numbers to strings.

    var rem = 10 % d;
    var t = 1;

    for (; rem !== 1; t++) {
      rem = rem * 10 % d;

      if (t > MAX_CYCLE_LEN)
        return 0; // Returning 0 here means that we don't print it as a cyclic number. It's likely that the answer is `d-1`
    }
    return t;
  }


  function cycleStart(n, d, len) {

    var rem1 = 1;
    var rem2 = modpow(10, len, d);

    for (var t = 0; t < 300; t++) { // s < ~log10(Number.MAX_VALUE)
      // Solve 10^s == 10^(s+t) (mod d)

      if (rem1 === rem2)
        return t;

      rem1 = rem1 * 10 % d;
      rem2 = rem2 * 10 % d;
    }
    return 0;
  }

  function gcd(a, b) {

    if (!a)
      return b;
    if (!b)
      return a;

    while (1) {
      a %= b;
      if (!a)
        return b;
      b %= a;
      if (!b)
        return a;
    }
  };

  /**
   * Module constructor
   *
   * @constructor
   * @param {number|Fraction=} a
   * @param {number=} b
   */
  function Fraction(a, b) {

    if (!(this instanceof Fraction)) {
      return new Fraction(a, b);
    }

    parse(a, b);

    a = gcd(P["d"], P["n"]); // Abuse variable a

    this["s"] = P["s"];
    this["n"] = P["n"] / a;
    this["d"] = P["d"] / a;
  }

  Fraction.prototype = {

    "s": 1,
    "n": 0,
    "d": 1,

    /**
     * Calculates the absolute value
     *
     * Ex: new Fraction(-4).abs() => 4
     **/
    "abs": function() {

      return new Fraction(this["n"], this["d"]);
    },

    /**
     * Inverts the sign of the current fraction
     *
     * Ex: new Fraction(-4).neg() => 4
     **/
    "neg": function() {

      return new Fraction(-this["s"] * this["n"], this["d"]);
    },

    /**
     * Adds two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
     **/
    "add": function(a, b) {

      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Subtracts two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
     **/
    "sub": function(a, b) {

      parse(a, b);
      return new Fraction(
        this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Multiplies two rational numbers
     *
     * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
     **/
    "mul": function(a, b) {

      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["n"],
        this["d"] * P["d"]
      );
    },

    /**
     * Divides two rational numbers
     *
     * Ex: new Fraction("-17.(345)").inverse().div(3)
     **/
    "div": function(a, b) {

      parse(a, b);
      return new Fraction(
        this["s"] * P["s"] * this["n"] * P["d"],
        this["d"] * P["n"]
      );
    },

    /**
     * Clones the actual object
     *
     * Ex: new Fraction("-17.(345)").clone()
     **/
    "clone": function() {
      return new Fraction(this);
    },

    /**
     * Calculates the modulo of two rational numbers - a more precise fmod
     *
     * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
     **/
    "mod": function(a, b) {

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return new Fraction(NaN);
      }

      if (a === undefined) {
        return new Fraction(this["s"] * this["n"] % this["d"], 1);
      }

      parse(a, b);
      if (0 === P["n"] && 0 === this["d"]) {
        Fraction(0, 0); // Throw DivisionByZero
      }

      /*
       * First silly attempt, kinda slow
       *
       return that["sub"]({
       "n": num["n"] * Math.floor((this.n / this.d) / (num.n / num.d)),
       "d": num["d"],
       "s": this["s"]
       });*/

      /*
       * New attempt: a1 / b1 = a2 / b2 * q + r
       * => b2 * a1 = a2 * b1 * q + b1 * b2 * r
       * => (b2 * a1 % a2 * b1) / (b1 * b2)
       */
      return new Fraction(
        this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]),
        P["d"] * this["d"]
      );
    },

    /**
     * Calculates the fractional gcd of two rational numbers
     *
     * Ex: new Fraction(5,8).gcd(3,7) => 1/56
     */
    "gcd": function(a, b) {

      parse(a, b);

      // gcd(a / b, c / d) = gcd(a, c) / lcm(b, d)

      return new Fraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
    },

    /**
     * Calculates the fractional lcm of two rational numbers
     *
     * Ex: new Fraction(5,8).lcm(3,7) => 15
     */
    "lcm": function(a, b) {

      parse(a, b);

      // lcm(a / b, c / d) = lcm(a, c) / gcd(b, d)

      if (P["n"] === 0 && this["n"] === 0) {
        return new Fraction;
      }
      return new Fraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
    },

    /**
     * Calculates the ceil of a rational number
     *
     * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
     **/
    "ceil": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Calculates the floor of a rational number
     *
     * Ex: new Fraction('4.(3)').floor() => (4 / 1)
     **/
    "floor": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Rounds a rational numbers
     *
     * Ex: new Fraction('4.(3)').round() => (4 / 1)
     **/
    "round": function(places) {

      places = Math.pow(10, places || 0);

      if (isNaN(this["n"]) || isNaN(this["d"])) {
        return new Fraction(NaN);
      }
      return new Fraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Gets the inverse of the fraction, means numerator and denominator are exchanged
     *
     * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
     **/
    "inverse": function() {

      return new Fraction(this["s"] * this["d"], this["n"]);
    },

    /**
     * Calculates the fraction to some rational exponent, if possible
     *
     * Ex: new Fraction(-1,2).pow(-3) => -8
     */
    "pow": function(a, b) {

      parse(a, b);

      // Trivial case when exp is an integer

      if (P['d'] === 1) {

        if (P['s'] < 0) {
          return new Fraction(Math.pow(this['s'] * this["d"], P['n']), Math.pow(this["n"], P['n']));
        } else {
          return new Fraction(Math.pow(this['s'] * this["n"], P['n']), Math.pow(this["d"], P['n']));
        }
      }

      // Negative roots become complex
      //     (-a/b)^(c/d) = x
      // <=> (-1)^(c/d) * (a/b)^(c/d) = x
      // <=> (cos(pi) + i*sin(pi))^(c/d) * (a/b)^(c/d) = x         # rotate 1 by 180°
      // <=> (cos(c*pi/d) + i*sin(c*pi/d)) * (a/b)^(c/d) = x       # DeMoivre's formula in Q ( https://proofwiki.org/wiki/De_Moivre%27s_Formula/Rational_Index )
      // From which follows that only for c=0 the root is non-complex. c/d is a reduced fraction, so that sin(c/dpi)=0 occurs for d=1, which is handled by our trivial case.
      if (this['s'] < 0) return null;

      // Now prime factor n and d
      var N = factorize(this['n']);
      var D = factorize(this['d']);

      // Exponentiate and take root for n and d individually
      var n = 1;
      var d = 1;
      for (var k in N) {
        if (k === '1') continue;
        if (k === '0') {
          n = 0;
          break;
        }
        N[k]*= P['n'];

        if (N[k] % P['d'] === 0) {
          N[k]/= P['d'];
        } else return null;
        n*= Math.pow(k, N[k]);
      }

      for (var k in D) {
        if (k === '1') continue;
        D[k]*= P['n'];

        if (D[k] % P['d'] === 0) {
          D[k]/= P['d'];
        } else return null;
        d*= Math.pow(k, D[k]);
      }

      if (P['s'] < 0) {
        return new Fraction(d, n);
      }
      return new Fraction(n, d);
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "equals": function(a, b) {

      parse(a, b);
      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"]; // Same as compare() === 0
    },

    /**
     * Check if two rational numbers are the same
     *
     * Ex: new Fraction(19.6).equals([98, 5]);
     **/
    "compare": function(a, b) {

      parse(a, b);
      var t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
      return (0 < t) - (t < 0);
    },

    "simplify": function(eps) {

      // First naive implementation, needs improvement

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return this;
      }

      var cont = this['abs']()['toContinued']();

      eps = eps || 0.001;

      function rec(a) {
        if (a.length === 1)
          return new Fraction(a[0]);
        return rec(a.slice(1))['inverse']()['add'](a[0]);
      }

      for (var i = 0; i < cont.length; i++) {
        var tmp = rec(cont.slice(0, i + 1));
        if (tmp['sub'](this['abs']())['abs']().valueOf() < eps) {
          return tmp['mul'](this['s']);
        }
      }
      return this;
    },

    /**
     * Check if two rational numbers are divisible
     *
     * Ex: new Fraction(19.6).divisible(1.5);
     */
    "divisible": function(a, b) {

      parse(a, b);
      return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
    },

    /**
     * Returns a decimal representation of the fraction
     *
     * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
     **/
    'valueOf': function() {

      return this["s"] * this["n"] / this["d"];
    },

    /**
     * Returns a string-fraction representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
     **/
    'toFraction': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str += '-';
      }

      if (d === 1) {
        str += n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          str += " ";
          n %= d;
        }

        str += n;
        str += '/';
        str += d;
      }
      return str;
    },

    /**
     * Returns a latex representation of a Fraction object
     *
     * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
     **/
    'toLatex': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str += '-';
      }

      if (d === 1) {
        str += n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str += whole;
          n %= d;
        }

        str += "\\frac{";
        str += n;
        str += '}{';
        str += d;
        str += '}';
      }
      return str;
    },

    /**
     * Returns an array of continued fraction elements
     *
     * Ex: new Fraction("7/8").toContinued() => [0,1,7]
     */
    'toContinued': function() {

      var t;
      var a = this['n'];
      var b = this['d'];
      var res = [];

      if (isNaN(a) || isNaN(b)) {
        return res;
      }

      do {
        res.push(Math.floor(a / b));
        t = a % b;
        a = b;
        b = t;
      } while (a !== 1);

      return res;
    },

    /**
     * Creates a string representation of a fraction with all digits
     *
     * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
     **/
    'toString': function(dec) {

      var g;
      var N = this["n"];
      var D = this["d"];

      if (isNaN(N) || isNaN(D)) {
        return "NaN";
      }

      dec = dec || 15; // 15 = decimal places when no repetation

      var cycLen = cycleLen(N, D); // Cycle length
      var cycOff = cycleStart(N, D, cycLen); // Cycle start

      var str = this['s'] === -1 ? "-" : "";

      str += N / D | 0;

      N %= D;
      N *= 10;

      if (N)
        str += ".";

      if (cycLen) {

        for (var i = cycOff; i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += "(";
        for (var i = cycLen; i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
        str += ")";
      } else {
        for (var i = dec; N && i--;) {
          str += N / D | 0;
          N %= D;
          N *= 10;
        }
      }
      return str;
    }
  };

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return Fraction;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}

})(this);


/***/ }),

/***/ "./src/Interval.ts":
/*!*************************!*\
  !*** ./src/Interval.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Interval = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
const fraction_js_1 = (0, tslib_1.__importDefault)(__webpack_require__(/*! fraction.js */ "./node_modules/fraction.js/fraction.js"));
/**
 * INTERVALS
 *
 * The interval is the basic building block of music.
 * It is the difference in pitch between two sounds.
 *
 * It can be represented as:
 * - a frequency ratio
 * - a number of cents (1/100 of an equally tempered semitone)
 * - a number of savarts (https://en.wikipedia.org/wiki/Savart)
 * - ...and more
 *
 * It can also be named, depending on the nomenclature being used.
 *
 */
class Interval {
    constructor(ratio) {
        this.ratio = ratio;
    }
    get cents() { return 1200 * Math.log2(this.ratio.valueOf()); }
    get savarts() { return 1000 * Math.log10(this.ratio.valueOf()); }
    difference(reference) { return new Interval(this.ratio.div(reference.ratio)); }
    static fromRatio(ratio) { return new Interval(new fraction_js_1.default(ratio)); }
    static fromCents(cents) { return new Interval(new fraction_js_1.default(Math.pow(2, cents / 1200))); }
    static fromSavarts(savarts) { return new Interval(new fraction_js_1.default(Math.pow(10, savarts / 1000))); }
    static compare(a, b) { return a.ratio.compare(b.ratio); }
}
exports.Interval = Interval;
Interval.JND = Interval.fromCents(5); // https://en.wikipedia.org/wiki/Just-noticeable_difference


/***/ }),

/***/ "./src/Tuning.ts":
/*!***********************!*\
  !*** ./src/Tuning.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TuningTone = exports.Tuning = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
const fraction_js_1 = (0, tslib_1.__importDefault)(__webpack_require__(/*! fraction.js */ "./node_modules/fraction.js/fraction.js"));
const Helpers = (0, tslib_1.__importStar)(__webpack_require__(/*! ./utils/Helpers */ "./src/utils/Helpers.ts"));
const Interval_1 = __webpack_require__(/*! ./Interval */ "./src/Interval.ts");
/**
 * TUNING SYSTEM
 *
 * Given a reference tone and a target tone, a tuning returns the ratio between them.
 *
 * The fundamental interval is 2/1 between the base tone and its octave.
 * Other tones subdivide the octave interval. A finite number of tones N make up the tuning.
 * Tones are indexed according to their rank in the ordered sequence of ratios
 * tone 0 => ratio 1 (unison)
 * tone 1 => ratio 1.abc (first interval)
 * tone 2 => ratio 1.def (second interval)
 * ...
 * tone N-2 => ratio 1.xyz (next-to-last interval)
 * tone N-1 => ratio 2 (octave)
 *
 * Tones can extend beyond the octave
 * e.g. tone N+1 is equivalent to tone 1, but one octave higher.
 * In addition to representing a tone as above, we can represent it by its "generator":
 * - its pitch class pc ∈ [0, N-1]
 * - its octave o ∈ ℤ
 * such that t = pc(t) + N * o(t)
 */
class Tuning {
    /**
     * CONSTRUCTOR
     *
     * @param intervals: tuning intervals
     * The intervals will be guaranteed to be sorted.
     * The first interval will be _guaranteed_ to be the unison.
     * The last interval will be _assumed_ to be the repeater (e.g. 2/1 the octave).
     * @param annotations: notes about the tuning
     */
    constructor(intervals, annotations = []) {
        this.intervals = intervals;
        this.annotations = annotations;
        this.intervals.sort(Interval_1.Interval.compare);
        if (this.intervals[0].ratio.valueOf() != 1) {
            this.intervals = [new Interval_1.Interval(new fraction_js_1.default(1)), ...this.intervals];
        }
    }
    /**
     * Create a tuning from ratios or cents.
     *
     * @param intervals: an array of ratios expressed as strings, or cents expressed as numbers
     * @param annotations: as per constructor
     * @returns tuning object
     */
    static fromIntervals(intervals, annotations = []) {
        return new Tuning(intervals.map(interval => {
            if (typeof interval == 'string') {
                return new Interval_1.Interval(new fraction_js_1.default(interval));
            }
            else {
                return Interval_1.Interval.fromCents(interval);
            }
        }), annotations);
    }
    get transposable() {
        if (this._transposable !== undefined)
            return this._transposable;
        const first = this.intervals[1].difference(this.intervals[0]);
        return (this._transposable = this.intervals.slice(1).every((v, i) => {
            const next = v.difference(this.intervals[i]);
            const diff = new Interval_1.Interval(Helpers.flipFraction(next.difference(first).ratio, true));
            return diff.ratio.compare(Interval_1.Interval.JND.ratio) < 0;
        }));
    }
    /**
     * STEPS OF A TUNING
     *
     * @returns count of tones in the tuning
     */
    get steps() {
        return this.intervals.length - 1;
    }
    /**
     * OCTAVE OF A TUNING
     *
     * @returns the last interval in the tuning, which is considered to be the octave
     */
    get octave() {
        return this.intervals[this.steps];
    }
    /**
     * TUNE A TONE
     *
     * @param tone: tone to be tuned
     * @returns frequency ratio of the tone with respect to root tone
     */
    tune(tone) {
        // Get the ratio difference between the target tone and the root tone, raised to the difference in octave.
        // The octave is always the last tone as per the definition of the `intervals` array.
        return new Interval_1.Interval(this.intervals[tone.pitchClass].ratio.mul(this.octave.ratio.pow(tone.octave)));
    }
    /**
     * NEAREST TONE
     * Find the nearest tone given an interval and return difference
     *
     * @param interval: target interval
     * @returns nearest tone, interval and difference from the target
     */
    nearest(interval) {
        // Bring the interval to the base octave.
        const octave = Math.floor(Math.log(interval.ratio.valueOf()) / Math.log(this.octave.ratio.valueOf()));
        const base = new Interval_1.Interval(interval.ratio.div(this.octave.ratio.pow(octave)));
        // Search through the intervals to locate the nearest.
        const n = Helpers.binarySearch(this.intervals, base, Interval_1.Interval.compare);
        if (n >= 0) {
            // Exact match: return the pitch at the right octave.
            return {
                tone: new TuningTone(this, n, octave),
                interval,
                difference: new Interval_1.Interval(new fraction_js_1.default(1))
            };
        }
        else {
            // Partial match: find real nearest between insertion point and previous.
            // We're guaranteed to find a previous value because the first value is always unison.
            const m = ~n;
            const lower = Math.abs(this.intervals[m - 1].difference(base).cents);
            const upper = Math.abs(this.intervals[m].difference(base).cents);
            const nearest = lower < upper ? m - 1 : m;
            const nearestTone = new TuningTone(this, nearest, octave);
            const nearestInterval = this.tune(nearestTone);
            return {
                tone: nearestTone,
                interval: nearestInterval,
                difference: nearestInterval.difference(interval)
            };
        }
    }
    /**
     * EQUAL DIVISIONS OF THE OCTAVE.
     *
     * Generate an intervals array based on equal divisions of the octave.
     * The intervals are calculated in cents, because they will be converted to ratios
     * inside the Tuning constructor.
     */
    static intervalsEdo(divisions) {
        return Array.from(Array(divisions + 1)).map((_, i) => {
            return Interval_1.Interval.fromCents(1200 / divisions * i);
        });
    }
}
exports.Tuning = Tuning;
/**
 * Tone in a tuning.
 */
class TuningTone {
    constructor(tuning, pitchClass, octave) {
        this.tuning = tuning;
        this.pitchClass = pitchClass;
        this.octave = octave;
    }
    get pitch() {
        return this.pitchClass + this.octave * this.tuning.steps;
    }
    static fromPitch(tuning, pitch) {
        return new TuningTone(tuning, Helpers.mod(pitch, tuning.steps), Math.floor(pitch / tuning.steps));
    }
}
exports.TuningTone = TuningTone;


/***/ }),

/***/ "./src/TuningNotation.ts":
/*!*******************************!*\
  !*** ./src/TuningNotation.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TuningNotation = void 0;
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
const Tuning_1 = __webpack_require__(/*! ./Tuning */ "./src/Tuning.ts");
const Helpers = (0, tslib_1.__importStar)(__webpack_require__(/*! ./utils/Helpers */ "./src/utils/Helpers.ts"));
const Bimap_1 = __webpack_require__(/*! ./utils/Bimap */ "./src/utils/Bimap.ts");
/**
 * NOMENCLATURE SYSTEM
 *
 * To name notes, we use a common representation based on Scientific Pitch Notation (SPN):
 * - Standard note letters C, D, E, F, G, A, B
 * - An extensible set of accidentals
 * - The octave specification
 *
 * We define a tuning notation map that defines how notes and accidentals map to tuning tones/pitches.
 */
class TuningNotation {
    /**
     * CONSTRUCTOR
     *
     * @param tuning: the tuning being notated
     * @param map: the notation map that maps every note letter + accidental combination to the tuning tone
     *        - different note names that map to the same index (e.g. C# = Db => 1) should have separate entries
     *        - don't include octave numbers
     */
    constructor(tuning, map) {
        this.tuning = tuning;
        this.map = map;
        this.regex = new RegExp('^(' + Array.from(this.map.keys()).map(Helpers.escapeRegExp).join('|') + ')' +
            '(-?\\d)$', 'i');
    }
    /**
     * BUILD A MAP BY COMBINING NOTES AND ACCIDENTALS
     *
     * @param tuning: as per constructor
     * @param notes: map of note letters to tone indexes:
     * ```
     * {
     *   'C': 0,
     *   'D': 2,
     *   'E': 4,
     *   'F': 5,
     *   'G': 7,
     *   'A': 9,
     *   'B': 11,
     * }
     * @param accidentals: map of note accidentals to tone increments:
     * ```
     * {
     *   '#': +1,
     *   'b': -1,
     *   'n':  0,
     * }
     * ```
     */
    static fromNotesAccidentalsCombination(tuning, notes, accidentals) {
        const map = new Bimap_1.Multimap();
        Object.keys(notes).forEach(note => {
            map.set(`${note}`, notes[note]);
            Object.keys(accidentals).forEach(accidental => {
                map.set(`${note}${accidental}`, Helpers.mod(notes[note] + accidentals[accidental], tuning.steps));
            });
        });
        return new TuningNotation(tuning, map);
    }
    /**
     * NAME A TONE
     *
     * @param tone: tone to be named
     * @returns array of strings representing the enharmonic namings of the tone
     */
    name(tone) {
        return [...this.map.getKey(tone.pitchClass)].map(n => `${n}${tone.octave}`);
    }
    /**
     * PARSE A NOTE
     *
     * @param note: target note in scientific pitch notation
     * @returns tone generator
     */
    parse(note) {
        const match = this.regex.exec(note);
        if (!match) {
            throw new Error(`[TuningNotation.parse] Could not parse note ${note}`);
        }
        return new Tuning_1.TuningTone(this.tuning, this.map.get(match[1]), parseInt(match[2], 10));
    }
}
exports.TuningNotation = TuningNotation;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
(0, tslib_1.__exportStar)(__webpack_require__(/*! ./Tuning */ "./src/Tuning.ts"), exports);
(0, tslib_1.__exportStar)(__webpack_require__(/*! ./TuningNotation */ "./src/TuningNotation.ts"), exports);
(0, tslib_1.__exportStar)(__webpack_require__(/*! ./Interval */ "./src/Interval.ts"), exports);


/***/ }),

/***/ "./src/utils/Bimap.ts":
/*!****************************!*\
  !*** ./src/utils/Bimap.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Multimap = exports.Bimap = void 0;
/**
 * Bimap without duplicates.
 */
class Bimap {
    constructor() {
        this.keyValueMap = new Map();
        this.valueKeyMap = new Map();
        this[_a] = this.keyValueMap[Symbol.iterator];
        this.entries = () => this.keyValueMap.entries();
        this.keys = () => this.keyValueMap.keys();
        this.values = () => this.keyValueMap.values();
        this.get = (a) => this.keyValueMap.get(a);
        this.getKey = (b) => this.valueKeyMap.get(b);
        this.getValue = (a) => this.get(a);
        this.set = (key, value) => {
            // Make sure no duplicates. Our conflict scenario is handled by deleting potential duplicates, in favour of the current arguments
            this.delete(key);
            this.deleteValue(value);
            this.keyValueMap.set(key, value);
            this.valueKeyMap.set(value, key);
            return this;
        };
        this.setKey = (value, key) => this.set(key, value);
        this.setValue = (key, value) => this.set(key, value);
        this.clear = () => {
            this.keyValueMap.clear();
            this.valueKeyMap.clear();
        };
        this.delete = (key) => {
            if (this.has(key)) {
                const value = this.keyValueMap.get(key);
                this.keyValueMap.delete(key);
                this.valueKeyMap.delete(value);
                return true;
            }
            return false;
        };
        this.deleteKey = (key) => this.delete(key);
        this.deleteValue = (value) => {
            if (this.hasValue(value)) {
                return this.delete(this.valueKeyMap.get(value));
            }
            return false;
        };
        this.forEach = (callbackfn, thisArg) => {
            this.keyValueMap.forEach((value, key) => {
                callbackfn.apply(thisArg, [value, key, this]);
            });
        };
        this.has = (key) => this.keyValueMap.has(key);
        this.hasKey = (key) => this.has(key);
        this.hasValue = (value) => this.valueKeyMap.has(value);
        this.inspect = () => {
            let str = 'Bimap {';
            let entry = 0;
            this.forEach((value, key) => {
                entry++;
                str += '' + key.toString() + ' => ' + value.toString() + '';
                if (entry < this.size) {
                    str += ', ';
                }
            });
            str += '}';
            return str;
        };
    }
    get size() {
        return this.keyValueMap.size;
    }
}
exports.Bimap = Bimap;
Symbol.toStringTag, _a = Symbol.iterator;
/**
 * Bimap with multiple values per key.
 */
class Multimap {
    constructor() {
        this.keyValueMap = new Map();
        this.valueKeyMap = new Map();
        this[_b] = this.keyValueMap[Symbol.iterator];
        this.entries = () => this.keyValueMap.entries();
        this.keys = () => this.keyValueMap.keys();
        this.values = () => this.keyValueMap.values();
        this.get = (a) => this.keyValueMap.get(a);
        this.getKey = (b) => this.valueKeyMap.get(b);
        this.getValue = (a) => this.get(a);
        this.set = (key, value) => {
            this.delete(key);
            this.keyValueMap.set(key, value);
            const keys = this.valueKeyMap.get(value) || [];
            this.valueKeyMap.set(value, [...keys, key]);
            return this;
        };
        this.setKey = (value, key) => this.set(key, value);
        this.setValue = (key, value) => this.set(key, value);
        this.clear = () => {
            this.keyValueMap.clear();
            this.valueKeyMap.clear();
        };
        this.delete = (key) => {
            if (this.has(key)) {
                const value = this.keyValueMap.get(key);
                this.keyValueMap.delete(key);
                const keys = this.valueKeyMap.get(value).filter(k => k !== key);
                if (keys.length > 0) {
                    this.valueKeyMap.set(value, keys);
                }
                else {
                    this.valueKeyMap.delete(value);
                }
                return true;
            }
            return false;
        };
        this.deleteKey = (key) => this.delete(key);
        this.deleteValue = (value) => {
            if (this.hasValue(value)) {
                this.valueKeyMap.get(value).forEach(key => { this.delete(key); });
                return true;
            }
            return false;
        };
        this.forEach = (callbackfn, thisArg) => {
            this.keyValueMap.forEach((value, key) => {
                callbackfn.apply(thisArg, [value, key, this]);
            });
        };
        this.has = (key) => this.keyValueMap.has(key);
        this.hasKey = (key) => this.has(key);
        this.hasValue = (value) => this.valueKeyMap.has(value);
        this.inspect = () => {
            let str = 'Multimap {';
            let entry = 0;
            this.forEach((value, key) => {
                entry++;
                str += '' + key.toString() + ' => ' + value.toString() + '';
                if (entry < this.size) {
                    str += ', ';
                }
            });
            str += '}';
            return str;
        };
    }
    get size() {
        return this.keyValueMap.size;
    }
}
exports.Multimap = Multimap;
Symbol.toStringTag, _b = Symbol.iterator;


/***/ }),

/***/ "./src/utils/Helpers.ts":
/*!******************************!*\
  !*** ./src/utils/Helpers.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayRange = exports.mod = exports.arrayUnique = exports.arrayEqual = exports.binarySearch = exports.flipFraction = exports.primes = exports.escapeRegExp = void 0;
/**
 * Escape a string to be used in regular expression.
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
 *
 * @param str: string to escape
 * @returns escaped, RegExp-ready string
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
exports.escapeRegExp = escapeRegExp;
/**
 * Get primes up to a given integer.
 * https://stackoverflow.com/a/12287599/209184
 * Uses the Sieve of Eratosthenes https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
 *
 * @param max: number to reach
 * @returns all primes up to max
 */
function primes(max) {
    const sieve = [], primes = [];
    for (let i = 2; i <= max; ++i) {
        if (!sieve[i]) {
            // i has not been marked -- it is prime
            primes.push(i);
            for (let j = i << 1; j <= max; j += i) {
                sieve[j] = true;
            }
        }
    }
    return primes;
}
exports.primes = primes;
/**
 * Ensure a |fraction| < 1 or > 1.
 */
function flipFraction(f, greaterThanOne = false) {
    return greaterThanOne ?
        (f.abs().compare(1) < 0 ? f.inverse() : f) :
        (f.abs().compare(1) > 0 ? f.inverse() : f);
}
exports.flipFraction = flipFraction;
/**
 * Binary search in an array.
 * https://stackoverflow.com/a/29018745/209184
 *
 * @param ar: elements array that is sorted
 * @param el: target element
 * @param comp: comparison function (a,b) => n with
 *        n > 0 if a > b
 *        n < 0 if a < b
 *        n = 0 if a = b
 * @returns index m >= 0 if match is found, m < 0 if not found with insertion point = -m-1.
 */
function binarySearch(ar, el, comp) {
    let m = 0;
    let n = ar.length - 1;
    while (m <= n) {
        const k = (n + m) >> 1;
        const cmp = comp(el, ar[k]);
        if (cmp > 0) {
            m = k + 1;
        }
        else if (cmp < 0) {
            n = k - 1;
        }
        else {
            return k;
        }
    }
    return ~m;
}
exports.binarySearch = binarySearch;
/**
 * Check array equality.
 * https://stackoverflow.com/q/7837456/209184
 */
function arrayEqual(ar1, ar2, comp) {
    return (ar1.length === ar2.length &&
        ar1.every((value, index) => comp(value, ar2[index]) === 0));
}
exports.arrayEqual = arrayEqual;
/**
 * Return array with unique values.
 * https://stackoverflow.com/a/17903018/209184
 */
function arrayUnique(ar) {
    return [...new Set(ar)];
}
exports.arrayUnique = arrayUnique;
/**
 * Always-positive Modulo function. The built-in % operator computes the Remainder.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 * https://stackoverflow.com/a/17323608/209184
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}
exports.mod = mod;
/**
 * Array range.
 * https://stackoverflow.com/a/10050831/209184
 */
function arrayRange(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}
exports.arrayRange = arrayRange;


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__values": () => (/* binding */ __values),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet)
/* harmony export */ });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}

function __exportStar(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUVBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkVBQTZFO0FBQzdFLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0JBQXNCLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFD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RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7VUVOQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9ub2RlX21vZHVsZXMvZnJhY3Rpb24uanMvZnJhY3Rpb24uanMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy9JbnRlcnZhbC50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL1R1bmluZy50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL1R1bmluZ05vdGF0aW9uLnRzIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy91dGlscy9CaW1hcC50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL3V0aWxzL0hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJTY2FsZXh0cmljXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlNjYWxleHRyaWNcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCIvKipcbiAqIEBsaWNlbnNlIEZyYWN0aW9uLmpzIHY0LjEuMiAyMy8wNS8yMDIxXG4gKiBodHRwczovL3d3dy54YXJnLm9yZy8yMDE0LzAzL3JhdGlvbmFsLW51bWJlcnMtaW4tamF2YXNjcmlwdC9cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEsIFJvYmVydCBFaXNlbGUgKHJvYmVydEB4YXJnLm9yZylcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxuICoqL1xuXG5cbi8qKlxuICpcbiAqIFRoaXMgY2xhc3Mgb2ZmZXJzIHRoZSBwb3NzaWJpbGl0eSB0byBjYWxjdWxhdGUgZnJhY3Rpb25zLlxuICogWW91IGNhbiBwYXNzIGEgZnJhY3Rpb24gaW4gZGlmZmVyZW50IGZvcm1hdHMuIEVpdGhlciBhcyBhcnJheSwgYXMgZG91YmxlLCBhcyBzdHJpbmcgb3IgYXMgYW4gaW50ZWdlci5cbiAqXG4gKiBBcnJheS9PYmplY3QgZm9ybVxuICogWyAwID0+IDxub21pbmF0b3I+LCAxID0+IDxkZW5vbWluYXRvcj4gXVxuICogWyBuID0+IDxub21pbmF0b3I+LCBkID0+IDxkZW5vbWluYXRvcj4gXVxuICpcbiAqIEludGVnZXIgZm9ybVxuICogLSBTaW5nbGUgaW50ZWdlciB2YWx1ZVxuICpcbiAqIERvdWJsZSBmb3JtXG4gKiAtIFNpbmdsZSBkb3VibGUgdmFsdWVcbiAqXG4gKiBTdHJpbmcgZm9ybVxuICogMTIzLjQ1NiAtIGEgc2ltcGxlIGRvdWJsZVxuICogMTIzLzQ1NiAtIGEgc3RyaW5nIGZyYWN0aW9uXG4gKiAxMjMuJzQ1NicgLSBhIGRvdWJsZSB3aXRoIHJlcGVhdGluZyBkZWNpbWFsIHBsYWNlc1xuICogMTIzLig0NTYpIC0gc3lub255bVxuICogMTIzLjQ1JzYnIC0gYSBkb3VibGUgd2l0aCByZXBlYXRpbmcgbGFzdCBwbGFjZVxuICogMTIzLjQ1KDYpIC0gc3lub255bVxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogdmFyIGYgPSBuZXcgRnJhY3Rpb24oXCI5LjQnMzEnXCIpO1xuICogZi5tdWwoWy00LCAzXSkuZGl2KDQuOSk7XG4gKlxuICovXG5cbihmdW5jdGlvbihyb290KSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gTWF4aW11bSBzZWFyY2ggZGVwdGggZm9yIGN5Y2xpYyByYXRpb25hbCBudW1iZXJzLiAyMDAwIHNob3VsZCBiZSBtb3JlIHRoYW4gZW5vdWdoLlxuICAvLyBFeGFtcGxlOiAxLzcgPSAwLigxNDI4NTcpIGhhcyA2IHJlcGVhdGluZyBkZWNpbWFsIHBsYWNlcy5cbiAgLy8gSWYgTUFYX0NZQ0xFX0xFTiBnZXRzIHJlZHVjZWQsIGxvbmcgY3ljbGVzIHdpbGwgbm90IGJlIGRldGVjdGVkIGFuZCB0b1N0cmluZygpIG9ubHkgZ2V0cyB0aGUgZmlyc3QgMTAgZGlnaXRzXG4gIHZhciBNQVhfQ1lDTEVfTEVOID0gMjAwMDtcblxuICAvLyBQYXJzZWQgZGF0YSB0byBhdm9pZCBjYWxsaW5nIFwibmV3XCIgYWxsIHRoZSB0aW1lXG4gIHZhciBQID0ge1xuICAgIFwic1wiOiAxLFxuICAgIFwiblwiOiAwLFxuICAgIFwiZFwiOiAxXG4gIH07XG5cbiAgZnVuY3Rpb24gY3JlYXRlRXJyb3IobmFtZSkge1xuXG4gICAgZnVuY3Rpb24gZXJyb3JDb25zdHJ1Y3RvcigpIHtcbiAgICAgIHZhciB0ZW1wID0gRXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHRlbXBbJ25hbWUnXSA9IHRoaXNbJ25hbWUnXSA9IG5hbWU7XG4gICAgICB0aGlzWydzdGFjayddID0gdGVtcFsnc3RhY2snXTtcbiAgICAgIHRoaXNbJ21lc3NhZ2UnXSA9IHRlbXBbJ21lc3NhZ2UnXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFcnJvciBjb25zdHJ1Y3RvclxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICovXG4gICAgZnVuY3Rpb24gSW50ZXJtZWRpYXRlSW5oZXJpdG9yKCkgeyB9XG4gICAgSW50ZXJtZWRpYXRlSW5oZXJpdG9yLnByb3RvdHlwZSA9IEVycm9yLnByb3RvdHlwZTtcbiAgICBlcnJvckNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IG5ldyBJbnRlcm1lZGlhdGVJbmhlcml0b3IoKTtcblxuICAgIHJldHVybiBlcnJvckNvbnN0cnVjdG9yO1xuICB9XG5cbiAgdmFyIERpdmlzaW9uQnlaZXJvID0gRnJhY3Rpb25bJ0RpdmlzaW9uQnlaZXJvJ10gPSBjcmVhdGVFcnJvcignRGl2aXNpb25CeVplcm8nKTtcbiAgdmFyIEludmFsaWRQYXJhbWV0ZXIgPSBGcmFjdGlvblsnSW52YWxpZFBhcmFtZXRlciddID0gY3JlYXRlRXJyb3IoJ0ludmFsaWRQYXJhbWV0ZXInKTtcblxuICBmdW5jdGlvbiBhc3NpZ24obiwgcykge1xuXG4gICAgaWYgKGlzTmFOKG4gPSBwYXJzZUludChuLCAxMCkpKSB7XG4gICAgICB0aHJvd0ludmFsaWRQYXJhbSgpO1xuICAgIH1cbiAgICByZXR1cm4gbiAqIHM7XG4gIH1cblxuICBmdW5jdGlvbiB0aHJvd0ludmFsaWRQYXJhbSgpIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFBhcmFtZXRlcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmFjdG9yaXplKG51bSkge1xuXG4gICAgdmFyIGZhY3RvcnMgPSB7fTtcblxuICAgIHZhciBuID0gbnVtO1xuICAgIHZhciBpID0gMjtcbiAgICB2YXIgcyA9IDQ7XG5cbiAgICB3aGlsZSAocyA8PSBuKSB7XG5cbiAgICAgIHdoaWxlIChuICUgaSA9PT0gMCkge1xuICAgICAgICBuIC89IGk7XG4gICAgICAgIGZhY3RvcnNbaV0gPSAoZmFjdG9yc1tpXSB8fCAwKSArIDE7XG4gICAgICB9XG4gICAgICBzICs9IDEgKyAyICogaSsrO1xuICAgIH1cblxuICAgIGlmIChuICE9PSBudW0pIHtcbiAgICAgIGlmIChuID4gMSlcbiAgICAgIGZhY3RvcnNbbl0gPSAoZmFjdG9yc1tuXSB8fCAwKSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZhY3RvcnNbbnVtXSA9IChmYWN0b3JzW251bV0gfHwgMCkgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gZmFjdG9ycztcbiAgfVxuXG4gIHZhciBwYXJzZSA9IGZ1bmN0aW9uKHAxLCBwMikge1xuXG4gICAgdmFyIG4gPSAwLCBkID0gMSwgcyA9IDE7XG4gICAgdmFyIHYgPSAwLCB3ID0gMCwgeCA9IDAsIHkgPSAxLCB6ID0gMTtcblxuICAgIHZhciBBID0gMCwgQiA9IDE7XG4gICAgdmFyIEMgPSAxLCBEID0gMTtcblxuICAgIHZhciBOID0gMTAwMDAwMDA7XG4gICAgdmFyIE07XG5cbiAgICBpZiAocDEgPT09IHVuZGVmaW5lZCB8fCBwMSA9PT0gbnVsbCkge1xuICAgICAgLyogdm9pZCAqL1xuICAgIH0gZWxzZSBpZiAocDIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbiA9IHAxO1xuICAgICAgZCA9IHAyO1xuICAgICAgcyA9IG4gKiBkO1xuICAgIH0gZWxzZVxuICAgICAgc3dpdGNoICh0eXBlb2YgcDEpIHtcblxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgaWYgKFwiZFwiIGluIHAxICYmIFwiblwiIGluIHAxKSB7XG4gICAgICAgICAgICAgIG4gPSBwMVtcIm5cIl07XG4gICAgICAgICAgICAgIGQgPSBwMVtcImRcIl07XG4gICAgICAgICAgICAgIGlmIChcInNcIiBpbiBwMSlcbiAgICAgICAgICAgICAgICBuICo9IHAxW1wic1wiXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoMCBpbiBwMSkge1xuICAgICAgICAgICAgICBuID0gcDFbMF07XG4gICAgICAgICAgICAgIGlmICgxIGluIHAxKVxuICAgICAgICAgICAgICAgIGQgPSBwMVsxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93SW52YWxpZFBhcmFtKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzID0gbiAqIGQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZiAocDEgPCAwKSB7XG4gICAgICAgICAgICAgIHMgPSBwMTtcbiAgICAgICAgICAgICAgcDEgPSAtcDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwMSAlIDEgPT09IDApIHtcbiAgICAgICAgICAgICAgbiA9IHAxO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwMSA+IDApIHsgLy8gY2hlY2sgZm9yICE9IDAsIHNjYWxlIHdvdWxkIGJlY29tZSBOYU4gKGxvZygwKSksIHdoaWNoIGNvbnZlcmdlcyByZWFsbHkgc2xvd1xuXG4gICAgICAgICAgICAgIGlmIChwMSA+PSAxKSB7XG4gICAgICAgICAgICAgICAgeiA9IE1hdGgucG93KDEwLCBNYXRoLmZsb29yKDEgKyBNYXRoLmxvZyhwMSkgLyBNYXRoLkxOMTApKTtcbiAgICAgICAgICAgICAgICBwMSAvPSB6O1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gVXNpbmcgRmFyZXkgU2VxdWVuY2VzXG4gICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuam9obmRjb29rLmNvbS9ibG9nLzIwMTAvMTAvMjAvYmVzdC1yYXRpb25hbC1hcHByb3hpbWF0aW9uL1xuXG4gICAgICAgICAgICAgIHdoaWxlIChCIDw9IE4gJiYgRCA8PSBOKSB7XG4gICAgICAgICAgICAgICAgTSA9IChBICsgQykgLyAoQiArIEQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHAxID09PSBNKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoQiArIEQgPD0gTikge1xuICAgICAgICAgICAgICAgICAgICBuID0gQSArIEM7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBCICsgRDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRCA+IEIpIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IEM7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBEO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IEE7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBCO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICBpZiAocDEgPiBNKSB7XG4gICAgICAgICAgICAgICAgICAgIEEgKz0gQztcbiAgICAgICAgICAgICAgICAgICAgQiArPSBEO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgQyArPSBBO1xuICAgICAgICAgICAgICAgICAgICBEICs9IEI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmIChCID4gTikge1xuICAgICAgICAgICAgICAgICAgICBuID0gQztcbiAgICAgICAgICAgICAgICAgICAgZCA9IEQ7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuID0gQTtcbiAgICAgICAgICAgICAgICAgICAgZCA9IEI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG4gKj0gejtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNOYU4ocDEpIHx8IGlzTmFOKHAyKSkge1xuICAgICAgICAgICAgICBkID0gbiA9IE5hTjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEIgPSBwMS5tYXRjaCgvXFxkK3wuL2cpO1xuXG4gICAgICAgICAgICBpZiAoQiA9PT0gbnVsbClcbiAgICAgICAgICAgICAgdGhyb3dJbnZhbGlkUGFyYW0oKTtcblxuICAgICAgICAgICAgaWYgKEJbQV0gPT09ICctJykgey8vIENoZWNrIGZvciBtaW51cyBzaWduIGF0IHRoZSBiZWdpbm5pbmdcbiAgICAgICAgICAgICAgcyA9IC0xO1xuICAgICAgICAgICAgICBBKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEJbQV0gPT09ICcrJykgey8vIENoZWNrIGZvciBwbHVzIHNpZ24gYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgICAgICAgICBBKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChCLmxlbmd0aCA9PT0gQSArIDEpIHsgLy8gQ2hlY2sgaWYgaXQncyBqdXN0IGEgc2ltcGxlIG51bWJlciBcIjEyMzRcIlxuICAgICAgICAgICAgICB3ID0gYXNzaWduKEJbQSsrXSwgcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEJbQSArIDFdID09PSAnLicgfHwgQltBXSA9PT0gJy4nKSB7IC8vIENoZWNrIGlmIGl0J3MgYSBkZWNpbWFsIG51bWJlclxuXG4gICAgICAgICAgICAgIGlmIChCW0FdICE9PSAnLicpIHsgLy8gSGFuZGxlIDAuNSBhbmQgLjVcbiAgICAgICAgICAgICAgICB2ID0gYXNzaWduKEJbQSsrXSwgcyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgQSsrO1xuXG4gICAgICAgICAgICAgIC8vIENoZWNrIGZvciBkZWNpbWFsIHBsYWNlc1xuICAgICAgICAgICAgICBpZiAoQSArIDEgPT09IEIubGVuZ3RoIHx8IEJbQSArIDFdID09PSAnKCcgJiYgQltBICsgM10gPT09ICcpJyB8fCBCW0EgKyAxXSA9PT0gXCInXCIgJiYgQltBICsgM10gPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICAgICAgdyA9IGFzc2lnbihCW0FdLCBzKTtcbiAgICAgICAgICAgICAgICB5ID0gTWF0aC5wb3coMTAsIEJbQV0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBBKys7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgcmVwZWF0aW5nIHBsYWNlc1xuICAgICAgICAgICAgICBpZiAoQltBXSA9PT0gJygnICYmIEJbQSArIDJdID09PSAnKScgfHwgQltBXSA9PT0gXCInXCIgJiYgQltBICsgMl0gPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICAgICAgeCA9IGFzc2lnbihCW0EgKyAxXSwgcyk7XG4gICAgICAgICAgICAgICAgeiA9IE1hdGgucG93KDEwLCBCW0EgKyAxXS5sZW5ndGgpIC0gMTtcbiAgICAgICAgICAgICAgICBBICs9IDM7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChCW0EgKyAxXSA9PT0gJy8nIHx8IEJbQSArIDFdID09PSAnOicpIHsgLy8gQ2hlY2sgZm9yIGEgc2ltcGxlIGZyYWN0aW9uIFwiMTIzLzQ1NlwiIG9yIFwiMTIzOjQ1NlwiXG4gICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBXSwgcyk7XG4gICAgICAgICAgICAgIHkgPSBhc3NpZ24oQltBICsgMl0sIDEpO1xuICAgICAgICAgICAgICBBICs9IDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEJbQSArIDNdID09PSAnLycgJiYgQltBICsgMV0gPT09ICcgJykgeyAvLyBDaGVjayBmb3IgYSBjb21wbGV4IGZyYWN0aW9uIFwiMTIzIDEvMlwiXG4gICAgICAgICAgICAgIHYgPSBhc3NpZ24oQltBXSwgcyk7XG4gICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBICsgMl0sIHMpO1xuICAgICAgICAgICAgICB5ID0gYXNzaWduKEJbQSArIDRdLCAxKTtcbiAgICAgICAgICAgICAgQSArPSA1O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoQi5sZW5ndGggPD0gQSkgeyAvLyBDaGVjayBmb3IgbW9yZSB0b2tlbnMgb24gdGhlIHN0YWNrXG4gICAgICAgICAgICAgIGQgPSB5ICogejtcbiAgICAgICAgICAgICAgcyA9IC8qIHZvaWQgKi9cbiAgICAgICAgICAgICAgbiA9IHggKyBkICogdiArIHogKiB3O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogRmFsbCB0aHJvdWdoIG9uIGVycm9yICovXG4gICAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93SW52YWxpZFBhcmFtKCk7XG4gICAgICB9XG5cbiAgICBpZiAoZCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IERpdmlzaW9uQnlaZXJvKCk7XG4gICAgfVxuXG4gICAgUFtcInNcIl0gPSBzIDwgMCA/IC0xIDogMTtcbiAgICBQW1wiblwiXSA9IE1hdGguYWJzKG4pO1xuICAgIFBbXCJkXCJdID0gTWF0aC5hYnMoZCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbW9kcG93KGIsIGUsIG0pIHtcblxuICAgIHZhciByID0gMTtcbiAgICBmb3IgKDsgZSA+IDA7IGIgPSAoYiAqIGIpICUgbSwgZSA+Pj0gMSkge1xuXG4gICAgICBpZiAoZSAmIDEpIHtcbiAgICAgICAgciA9IChyICogYikgJSBtO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gY3ljbGVMZW4obiwgZCkge1xuXG4gICAgZm9yICg7IGQgJSAyID09PSAwO1xuICAgICAgZCAvPSAyKSB7XG4gICAgfVxuXG4gICAgZm9yICg7IGQgJSA1ID09PSAwO1xuICAgICAgZCAvPSA1KSB7XG4gICAgfVxuXG4gICAgaWYgKGQgPT09IDEpIC8vIENhdGNoIG5vbi1jeWNsaWMgbnVtYmVyc1xuICAgICAgcmV0dXJuIDA7XG5cbiAgICAvLyBJZiB3ZSB3b3VsZCBsaWtlIHRvIGNvbXB1dGUgcmVhbGx5IGxhcmdlIG51bWJlcnMgcXVpY2tlciwgd2UgY291bGQgbWFrZSB1c2Ugb2YgRmVybWF0J3MgbGl0dGxlIHRoZW9yZW06XG4gICAgLy8gMTBeKGQtMSkgJSBkID09IDFcbiAgICAvLyBIb3dldmVyLCB3ZSBkb24ndCBuZWVkIHN1Y2ggbGFyZ2UgbnVtYmVycyBhbmQgTUFYX0NZQ0xFX0xFTiBzaG91bGQgYmUgdGhlIGNhcHN0b25lLFxuICAgIC8vIGFzIHdlIHdhbnQgdG8gdHJhbnNsYXRlIHRoZSBudW1iZXJzIHRvIHN0cmluZ3MuXG5cbiAgICB2YXIgcmVtID0gMTAgJSBkO1xuICAgIHZhciB0ID0gMTtcblxuICAgIGZvciAoOyByZW0gIT09IDE7IHQrKykge1xuICAgICAgcmVtID0gcmVtICogMTAgJSBkO1xuXG4gICAgICBpZiAodCA+IE1BWF9DWUNMRV9MRU4pXG4gICAgICAgIHJldHVybiAwOyAvLyBSZXR1cm5pbmcgMCBoZXJlIG1lYW5zIHRoYXQgd2UgZG9uJ3QgcHJpbnQgaXQgYXMgYSBjeWNsaWMgbnVtYmVyLiBJdCdzIGxpa2VseSB0aGF0IHRoZSBhbnN3ZXIgaXMgYGQtMWBcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGN5Y2xlU3RhcnQobiwgZCwgbGVuKSB7XG5cbiAgICB2YXIgcmVtMSA9IDE7XG4gICAgdmFyIHJlbTIgPSBtb2Rwb3coMTAsIGxlbiwgZCk7XG5cbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IDMwMDsgdCsrKSB7IC8vIHMgPCB+bG9nMTAoTnVtYmVyLk1BWF9WQUxVRSlcbiAgICAgIC8vIFNvbHZlIDEwXnMgPT0gMTBeKHMrdCkgKG1vZCBkKVxuXG4gICAgICBpZiAocmVtMSA9PT0gcmVtMilcbiAgICAgICAgcmV0dXJuIHQ7XG5cbiAgICAgIHJlbTEgPSByZW0xICogMTAgJSBkO1xuICAgICAgcmVtMiA9IHJlbTIgKiAxMCAlIGQ7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2NkKGEsIGIpIHtcblxuICAgIGlmICghYSlcbiAgICAgIHJldHVybiBiO1xuICAgIGlmICghYilcbiAgICAgIHJldHVybiBhO1xuXG4gICAgd2hpbGUgKDEpIHtcbiAgICAgIGEgJT0gYjtcbiAgICAgIGlmICghYSlcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgICBiICU9IGE7XG4gICAgICBpZiAoIWIpXG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogTW9kdWxlIGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge251bWJlcnxGcmFjdGlvbj19IGFcbiAgICogQHBhcmFtIHtudW1iZXI9fSBiXG4gICAqL1xuICBmdW5jdGlvbiBGcmFjdGlvbihhLCBiKSB7XG5cbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRnJhY3Rpb24pKSB7XG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKGEsIGIpO1xuICAgIH1cblxuICAgIHBhcnNlKGEsIGIpO1xuXG4gICAgYSA9IGdjZChQW1wiZFwiXSwgUFtcIm5cIl0pOyAvLyBBYnVzZSB2YXJpYWJsZSBhXG5cbiAgICB0aGlzW1wic1wiXSA9IFBbXCJzXCJdO1xuICAgIHRoaXNbXCJuXCJdID0gUFtcIm5cIl0gLyBhO1xuICAgIHRoaXNbXCJkXCJdID0gUFtcImRcIl0gLyBhO1xuICB9XG5cbiAgRnJhY3Rpb24ucHJvdG90eXBlID0ge1xuXG4gICAgXCJzXCI6IDEsXG4gICAgXCJuXCI6IDAsXG4gICAgXCJkXCI6IDEsXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBhYnNvbHV0ZSB2YWx1ZVxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbigtNCkuYWJzKCkgPT4gNFxuICAgICAqKi9cbiAgICBcImFic1wiOiBmdW5jdGlvbigpIHtcblxuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbih0aGlzW1wiblwiXSwgdGhpc1tcImRcIl0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZlcnRzIHRoZSBzaWduIG9mIHRoZSBjdXJyZW50IGZyYWN0aW9uXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKC00KS5uZWcoKSA9PiA0XG4gICAgICoqL1xuICAgIFwibmVnXCI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKC10aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdLCB0aGlzW1wiZFwiXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oe246IDIsIGQ6IDN9KS5hZGQoXCIxNC45XCIpID0+IDQ2NyAvIDMwXG4gICAgICoqL1xuICAgIFwiYWRkXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0gKyBQW1wic1wiXSAqIHRoaXNbXCJkXCJdICogUFtcIm5cIl0sXG4gICAgICAgIHRoaXNbXCJkXCJdICogUFtcImRcIl1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1YnRyYWN0cyB0d28gcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbih7bjogMiwgZDogM30pLmFkZChcIjE0LjlcIikgPT4gLTQyNyAvIDMwXG4gICAgICoqL1xuICAgIFwic3ViXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0gLSBQW1wic1wiXSAqIHRoaXNbXCJkXCJdICogUFtcIm5cIl0sXG4gICAgICAgIHRoaXNbXCJkXCJdICogUFtcImRcIl1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGxpZXMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCItMTcuKDM0NSlcIikubXVsKDMpID0+IDU3NzYgLyAxMTFcbiAgICAgKiovXG4gICAgXCJtdWxcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oXG4gICAgICAgIHRoaXNbXCJzXCJdICogUFtcInNcIl0gKiB0aGlzW1wiblwiXSAqIFBbXCJuXCJdLFxuICAgICAgICB0aGlzW1wiZFwiXSAqIFBbXCJkXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGVzIHR3byByYXRpb25hbCBudW1iZXJzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiLTE3LigzNDUpXCIpLmludmVyc2UoKS5kaXYoMylcbiAgICAgKiovXG4gICAgXCJkaXZcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oXG4gICAgICAgIHRoaXNbXCJzXCJdICogUFtcInNcIl0gKiB0aGlzW1wiblwiXSAqIFBbXCJkXCJdLFxuICAgICAgICB0aGlzW1wiZFwiXSAqIFBbXCJuXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgdGhlIGFjdHVhbCBvYmplY3RcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCItMTcuKDM0NSlcIikuY2xvbmUoKVxuICAgICAqKi9cbiAgICBcImNsb25lXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbih0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgbW9kdWxvIG9mIHR3byByYXRpb25hbCBudW1iZXJzIC0gYSBtb3JlIHByZWNpc2UgZm1vZFxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5tb2QoWzcsIDhdKSA9PiAoMTMvMykgJSAoNy84KSA9ICg1LzYpXG4gICAgICoqL1xuICAgIFwibW9kXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgaWYgKGlzTmFOKHRoaXNbJ24nXSkgfHwgaXNOYU4odGhpc1snZCddKSkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKE5hTik7XG4gICAgICB9XG5cbiAgICAgIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbih0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICUgdGhpc1tcImRcIl0sIDEpO1xuICAgICAgfVxuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIGlmICgwID09PSBQW1wiblwiXSAmJiAwID09PSB0aGlzW1wiZFwiXSkge1xuICAgICAgICBGcmFjdGlvbigwLCAwKTsgLy8gVGhyb3cgRGl2aXNpb25CeVplcm9cbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIEZpcnN0IHNpbGx5IGF0dGVtcHQsIGtpbmRhIHNsb3dcbiAgICAgICAqXG4gICAgICAgcmV0dXJuIHRoYXRbXCJzdWJcIl0oe1xuICAgICAgIFwiblwiOiBudW1bXCJuXCJdICogTWF0aC5mbG9vcigodGhpcy5uIC8gdGhpcy5kKSAvIChudW0ubiAvIG51bS5kKSksXG4gICAgICAgXCJkXCI6IG51bVtcImRcIl0sXG4gICAgICAgXCJzXCI6IHRoaXNbXCJzXCJdXG4gICAgICAgfSk7Ki9cblxuICAgICAgLypcbiAgICAgICAqIE5ldyBhdHRlbXB0OiBhMSAvIGIxID0gYTIgLyBiMiAqIHEgKyByXG4gICAgICAgKiA9PiBiMiAqIGExID0gYTIgKiBiMSAqIHEgKyBiMSAqIGIyICogclxuICAgICAgICogPT4gKGIyICogYTEgJSBhMiAqIGIxKSAvIChiMSAqIGIyKVxuICAgICAgICovXG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIChQW1wiZFwiXSAqIHRoaXNbXCJuXCJdKSAlIChQW1wiblwiXSAqIHRoaXNbXCJkXCJdKSxcbiAgICAgICAgUFtcImRcIl0gKiB0aGlzW1wiZFwiXVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZnJhY3Rpb25hbCBnY2Qgb2YgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oNSw4KS5nY2QoMyw3KSA9PiAxLzU2XG4gICAgICovXG4gICAgXCJnY2RcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcblxuICAgICAgLy8gZ2NkKGEgLyBiLCBjIC8gZCkgPSBnY2QoYSwgYykgLyBsY20oYiwgZClcblxuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihnY2QoUFtcIm5cIl0sIHRoaXNbXCJuXCJdKSAqIGdjZChQW1wiZFwiXSwgdGhpc1tcImRcIl0pLCBQW1wiZFwiXSAqIHRoaXNbXCJkXCJdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZnJhY3Rpb25hbCBsY20gb2YgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oNSw4KS5sY20oMyw3KSA9PiAxNVxuICAgICAqL1xuICAgIFwibGNtXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG5cbiAgICAgIC8vIGxjbShhIC8gYiwgYyAvIGQpID0gbGNtKGEsIGMpIC8gZ2NkKGIsIGQpXG5cbiAgICAgIGlmIChQW1wiblwiXSA9PT0gMCAmJiB0aGlzW1wiblwiXSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWN0aW9uO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihQW1wiblwiXSAqIHRoaXNbXCJuXCJdLCBnY2QoUFtcIm5cIl0sIHRoaXNbXCJuXCJdKSAqIGdjZChQW1wiZFwiXSwgdGhpc1tcImRcIl0pKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgY2VpbCBvZiBhIHJhdGlvbmFsIG51bWJlclxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5jZWlsKCkgPT4gKDUgLyAxKVxuICAgICAqKi9cbiAgICBcImNlaWxcIjogZnVuY3Rpb24ocGxhY2VzKSB7XG5cbiAgICAgIHBsYWNlcyA9IE1hdGgucG93KDEwLCBwbGFjZXMgfHwgMCk7XG5cbiAgICAgIGlmIChpc05hTih0aGlzW1wiblwiXSkgfHwgaXNOYU4odGhpc1tcImRcIl0pKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTmFOKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTWF0aC5jZWlsKHBsYWNlcyAqIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gLyB0aGlzW1wiZFwiXSksIHBsYWNlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGZsb29yIG9mIGEgcmF0aW9uYWwgbnVtYmVyXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKCc0LigzKScpLmZsb29yKCkgPT4gKDQgLyAxKVxuICAgICAqKi9cbiAgICBcImZsb29yXCI6IGZ1bmN0aW9uKHBsYWNlcykge1xuXG4gICAgICBwbGFjZXMgPSBNYXRoLnBvdygxMCwgcGxhY2VzIHx8IDApO1xuXG4gICAgICBpZiAoaXNOYU4odGhpc1tcIm5cIl0pIHx8IGlzTmFOKHRoaXNbXCJkXCJdKSkge1xuICAgICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKE5hTik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKE1hdGguZmxvb3IocGxhY2VzICogdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdKSwgcGxhY2VzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm91bmRzIGEgcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5yb3VuZCgpID0+ICg0IC8gMSlcbiAgICAgKiovXG4gICAgXCJyb3VuZFwiOiBmdW5jdGlvbihwbGFjZXMpIHtcblxuICAgICAgcGxhY2VzID0gTWF0aC5wb3coMTAsIHBsYWNlcyB8fCAwKTtcblxuICAgICAgaWYgKGlzTmFOKHRoaXNbXCJuXCJdKSB8fCBpc05hTih0aGlzW1wiZFwiXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihOYU4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihNYXRoLnJvdW5kKHBsYWNlcyAqIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gLyB0aGlzW1wiZFwiXSksIHBsYWNlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGludmVyc2Ugb2YgdGhlIGZyYWN0aW9uLCBtZWFucyBudW1lcmF0b3IgYW5kIGRlbm9taW5hdG9yIGFyZSBleGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oWy0zLCA0XSkuaW52ZXJzZSgpID0+IC00IC8gM1xuICAgICAqKi9cbiAgICBcImludmVyc2VcIjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24odGhpc1tcInNcIl0gKiB0aGlzW1wiZFwiXSwgdGhpc1tcIm5cIl0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBmcmFjdGlvbiB0byBzb21lIHJhdGlvbmFsIGV4cG9uZW50LCBpZiBwb3NzaWJsZVxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbigtMSwyKS5wb3coLTMpID0+IC04XG4gICAgICovXG4gICAgXCJwb3dcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcblxuICAgICAgLy8gVHJpdmlhbCBjYXNlIHdoZW4gZXhwIGlzIGFuIGludGVnZXJcblxuICAgICAgaWYgKFBbJ2QnXSA9PT0gMSkge1xuXG4gICAgICAgIGlmIChQWydzJ10gPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihNYXRoLnBvdyh0aGlzWydzJ10gKiB0aGlzW1wiZFwiXSwgUFsnbiddKSwgTWF0aC5wb3codGhpc1tcIm5cIl0sIFBbJ24nXSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTWF0aC5wb3codGhpc1sncyddICogdGhpc1tcIm5cIl0sIFBbJ24nXSksIE1hdGgucG93KHRoaXNbXCJkXCJdLCBQWyduJ10pKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBOZWdhdGl2ZSByb290cyBiZWNvbWUgY29tcGxleFxuICAgICAgLy8gICAgICgtYS9iKV4oYy9kKSA9IHhcbiAgICAgIC8vIDw9PiAoLTEpXihjL2QpICogKGEvYileKGMvZCkgPSB4XG4gICAgICAvLyA8PT4gKGNvcyhwaSkgKyBpKnNpbihwaSkpXihjL2QpICogKGEvYileKGMvZCkgPSB4ICAgICAgICAgIyByb3RhdGUgMSBieSAxODDCsFxuICAgICAgLy8gPD0+IChjb3MoYypwaS9kKSArIGkqc2luKGMqcGkvZCkpICogKGEvYileKGMvZCkgPSB4ICAgICAgICMgRGVNb2l2cmUncyBmb3JtdWxhIGluIFEgKCBodHRwczovL3Byb29md2lraS5vcmcvd2lraS9EZV9Nb2l2cmUlMjdzX0Zvcm11bGEvUmF0aW9uYWxfSW5kZXggKVxuICAgICAgLy8gRnJvbSB3aGljaCBmb2xsb3dzIHRoYXQgb25seSBmb3IgYz0wIHRoZSByb290IGlzIG5vbi1jb21wbGV4LiBjL2QgaXMgYSByZWR1Y2VkIGZyYWN0aW9uLCBzbyB0aGF0IHNpbihjL2RwaSk9MCBvY2N1cnMgZm9yIGQ9MSwgd2hpY2ggaXMgaGFuZGxlZCBieSBvdXIgdHJpdmlhbCBjYXNlLlxuICAgICAgaWYgKHRoaXNbJ3MnXSA8IDApIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBOb3cgcHJpbWUgZmFjdG9yIG4gYW5kIGRcbiAgICAgIHZhciBOID0gZmFjdG9yaXplKHRoaXNbJ24nXSk7XG4gICAgICB2YXIgRCA9IGZhY3Rvcml6ZSh0aGlzWydkJ10pO1xuXG4gICAgICAvLyBFeHBvbmVudGlhdGUgYW5kIHRha2Ugcm9vdCBmb3IgbiBhbmQgZCBpbmRpdmlkdWFsbHlcbiAgICAgIHZhciBuID0gMTtcbiAgICAgIHZhciBkID0gMTtcbiAgICAgIGZvciAodmFyIGsgaW4gTikge1xuICAgICAgICBpZiAoayA9PT0gJzEnKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGsgPT09ICcwJykge1xuICAgICAgICAgIG4gPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIE5ba10qPSBQWyduJ107XG5cbiAgICAgICAgaWYgKE5ba10gJSBQWydkJ10gPT09IDApIHtcbiAgICAgICAgICBOW2tdLz0gUFsnZCddO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIG4qPSBNYXRoLnBvdyhrLCBOW2tdKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgayBpbiBEKSB7XG4gICAgICAgIGlmIChrID09PSAnMScpIGNvbnRpbnVlO1xuICAgICAgICBEW2tdKj0gUFsnbiddO1xuXG4gICAgICAgIGlmIChEW2tdICUgUFsnZCddID09PSAwKSB7XG4gICAgICAgICAgRFtrXS89IFBbJ2QnXTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICBkKj0gTWF0aC5wb3coaywgRFtrXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChQWydzJ10gPCAwKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oZCwgbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKG4sIGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oMTkuNikuZXF1YWxzKFs5OCwgNV0pO1xuICAgICAqKi9cbiAgICBcImVxdWFsc1wiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuICAgICAgcmV0dXJuIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSA9PT0gUFtcInNcIl0gKiBQW1wiblwiXSAqIHRoaXNbXCJkXCJdOyAvLyBTYW1lIGFzIGNvbXBhcmUoKSA9PT0gMFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oMTkuNikuZXF1YWxzKFs5OCwgNV0pO1xuICAgICAqKi9cbiAgICBcImNvbXBhcmVcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHZhciB0ID0gKHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSAtIFBbXCJzXCJdICogUFtcIm5cIl0gKiB0aGlzW1wiZFwiXSk7XG4gICAgICByZXR1cm4gKDAgPCB0KSAtICh0IDwgMCk7XG4gICAgfSxcblxuICAgIFwic2ltcGxpZnlcIjogZnVuY3Rpb24oZXBzKSB7XG5cbiAgICAgIC8vIEZpcnN0IG5haXZlIGltcGxlbWVudGF0aW9uLCBuZWVkcyBpbXByb3ZlbWVudFxuXG4gICAgICBpZiAoaXNOYU4odGhpc1snbiddKSB8fCBpc05hTih0aGlzWydkJ10pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udCA9IHRoaXNbJ2FicyddKClbJ3RvQ29udGludWVkJ10oKTtcblxuICAgICAgZXBzID0gZXBzIHx8IDAuMDAxO1xuXG4gICAgICBmdW5jdGlvbiByZWMoYSkge1xuICAgICAgICBpZiAoYS5sZW5ndGggPT09IDEpXG4gICAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihhWzBdKTtcbiAgICAgICAgcmV0dXJuIHJlYyhhLnNsaWNlKDEpKVsnaW52ZXJzZSddKClbJ2FkZCddKGFbMF0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRtcCA9IHJlYyhjb250LnNsaWNlKDAsIGkgKyAxKSk7XG4gICAgICAgIGlmICh0bXBbJ3N1YiddKHRoaXNbJ2FicyddKCkpWydhYnMnXSgpLnZhbHVlT2YoKSA8IGVwcykge1xuICAgICAgICAgIHJldHVybiB0bXBbJ211bCddKHRoaXNbJ3MnXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgZGl2aXNpYmxlXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKDE5LjYpLmRpdmlzaWJsZSgxLjUpO1xuICAgICAqL1xuICAgIFwiZGl2aXNpYmxlXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gISghKFBbXCJuXCJdICogdGhpc1tcImRcIl0pIHx8ICgodGhpc1tcIm5cIl0gKiBQW1wiZFwiXSkgJSAoUFtcIm5cIl0gKiB0aGlzW1wiZFwiXSkpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGRlY2ltYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGZyYWN0aW9uXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMTAwLic5MTgyMydcIikudmFsdWVPZigpID0+IDEwMC45MTgyMzkxODIzOTE4M1xuICAgICAqKi9cbiAgICAndmFsdWVPZic6IGZ1bmN0aW9uKCkge1xuXG4gICAgICByZXR1cm4gdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nLWZyYWN0aW9uIHJlcHJlc2VudGF0aW9uIG9mIGEgRnJhY3Rpb24gb2JqZWN0XG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMS4nMydcIikudG9GcmFjdGlvbigpID0+IFwiNCAxLzNcIlxuICAgICAqKi9cbiAgICAndG9GcmFjdGlvbic6IGZ1bmN0aW9uKGV4Y2x1ZGVXaG9sZSkge1xuXG4gICAgICB2YXIgd2hvbGUsIHN0ciA9IFwiXCI7XG4gICAgICB2YXIgbiA9IHRoaXNbXCJuXCJdO1xuICAgICAgdmFyIGQgPSB0aGlzW1wiZFwiXTtcbiAgICAgIGlmICh0aGlzW1wic1wiXSA8IDApIHtcbiAgICAgICAgc3RyICs9ICctJztcbiAgICAgIH1cblxuICAgICAgaWYgKGQgPT09IDEpIHtcbiAgICAgICAgc3RyICs9IG47XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlmIChleGNsdWRlV2hvbGUgJiYgKHdob2xlID0gTWF0aC5mbG9vcihuIC8gZCkpID4gMCkge1xuICAgICAgICAgIHN0ciArPSB3aG9sZTtcbiAgICAgICAgICBzdHIgKz0gXCIgXCI7XG4gICAgICAgICAgbiAlPSBkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyICs9IG47XG4gICAgICAgIHN0ciArPSAnLyc7XG4gICAgICAgIHN0ciArPSBkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGxhdGV4IHJlcHJlc2VudGF0aW9uIG9mIGEgRnJhY3Rpb24gb2JqZWN0XG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMS4nMydcIikudG9MYXRleCgpID0+IFwiXFxmcmFjezR9ezN9XCJcbiAgICAgKiovXG4gICAgJ3RvTGF0ZXgnOiBmdW5jdGlvbihleGNsdWRlV2hvbGUpIHtcblxuICAgICAgdmFyIHdob2xlLCBzdHIgPSBcIlwiO1xuICAgICAgdmFyIG4gPSB0aGlzW1wiblwiXTtcbiAgICAgIHZhciBkID0gdGhpc1tcImRcIl07XG4gICAgICBpZiAodGhpc1tcInNcIl0gPCAwKSB7XG4gICAgICAgIHN0ciArPSAnLSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChkID09PSAxKSB7XG4gICAgICAgIHN0ciArPSBuO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAoZXhjbHVkZVdob2xlICYmICh3aG9sZSA9IE1hdGguZmxvb3IobiAvIGQpKSA+IDApIHtcbiAgICAgICAgICBzdHIgKz0gd2hvbGU7XG4gICAgICAgICAgbiAlPSBkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyICs9IFwiXFxcXGZyYWN7XCI7XG4gICAgICAgIHN0ciArPSBuO1xuICAgICAgICBzdHIgKz0gJ317JztcbiAgICAgICAgc3RyICs9IGQ7XG4gICAgICAgIHN0ciArPSAnfSc7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbnRpbnVlZCBmcmFjdGlvbiBlbGVtZW50c1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbihcIjcvOFwiKS50b0NvbnRpbnVlZCgpID0+IFswLDEsN11cbiAgICAgKi9cbiAgICAndG9Db250aW51ZWQnOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHQ7XG4gICAgICB2YXIgYSA9IHRoaXNbJ24nXTtcbiAgICAgIHZhciBiID0gdGhpc1snZCddO1xuICAgICAgdmFyIHJlcyA9IFtdO1xuXG4gICAgICBpZiAoaXNOYU4oYSkgfHwgaXNOYU4oYikpIHtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH1cblxuICAgICAgZG8ge1xuICAgICAgICByZXMucHVzaChNYXRoLmZsb29yKGEgLyBiKSk7XG4gICAgICAgIHQgPSBhICUgYjtcbiAgICAgICAgYSA9IGI7XG4gICAgICAgIGIgPSB0O1xuICAgICAgfSB3aGlsZSAoYSAhPT0gMSk7XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBmcmFjdGlvbiB3aXRoIGFsbCBkaWdpdHNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCIxMDAuJzkxODIzJ1wiKS50b1N0cmluZygpID0+IFwiMTAwLig5MTgyMylcIlxuICAgICAqKi9cbiAgICAndG9TdHJpbmcnOiBmdW5jdGlvbihkZWMpIHtcblxuICAgICAgdmFyIGc7XG4gICAgICB2YXIgTiA9IHRoaXNbXCJuXCJdO1xuICAgICAgdmFyIEQgPSB0aGlzW1wiZFwiXTtcblxuICAgICAgaWYgKGlzTmFOKE4pIHx8IGlzTmFOKEQpKSB7XG4gICAgICAgIHJldHVybiBcIk5hTlwiO1xuICAgICAgfVxuXG4gICAgICBkZWMgPSBkZWMgfHwgMTU7IC8vIDE1ID0gZGVjaW1hbCBwbGFjZXMgd2hlbiBubyByZXBldGF0aW9uXG5cbiAgICAgIHZhciBjeWNMZW4gPSBjeWNsZUxlbihOLCBEKTsgLy8gQ3ljbGUgbGVuZ3RoXG4gICAgICB2YXIgY3ljT2ZmID0gY3ljbGVTdGFydChOLCBELCBjeWNMZW4pOyAvLyBDeWNsZSBzdGFydFxuXG4gICAgICB2YXIgc3RyID0gdGhpc1sncyddID09PSAtMSA/IFwiLVwiIDogXCJcIjtcblxuICAgICAgc3RyICs9IE4gLyBEIHwgMDtcblxuICAgICAgTiAlPSBEO1xuICAgICAgTiAqPSAxMDtcblxuICAgICAgaWYgKE4pXG4gICAgICAgIHN0ciArPSBcIi5cIjtcblxuICAgICAgaWYgKGN5Y0xlbikge1xuXG4gICAgICAgIGZvciAodmFyIGkgPSBjeWNPZmY7IGktLTspIHtcbiAgICAgICAgICBzdHIgKz0gTiAvIEQgfCAwO1xuICAgICAgICAgIE4gJT0gRDtcbiAgICAgICAgICBOICo9IDEwO1xuICAgICAgICB9XG4gICAgICAgIHN0ciArPSBcIihcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IGN5Y0xlbjsgaS0tOykge1xuICAgICAgICAgIHN0ciArPSBOIC8gRCB8IDA7XG4gICAgICAgICAgTiAlPSBEO1xuICAgICAgICAgIE4gKj0gMTA7XG4gICAgICAgIH1cbiAgICAgICAgc3RyICs9IFwiKVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IGRlYzsgTiAmJiBpLS07KSB7XG4gICAgICAgICAgc3RyICs9IE4gLyBEIHwgMDtcbiAgICAgICAgICBOICU9IEQ7XG4gICAgICAgICAgTiAqPSAxMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmVbXCJhbWRcIl0pIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEZyYWN0aW9uO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYWN0aW9uLCBcIl9fZXNNb2R1bGVcIiwgeyAndmFsdWUnOiB0cnVlIH0pO1xuICAgIEZyYWN0aW9uWydkZWZhdWx0J10gPSBGcmFjdGlvbjtcbiAgICBGcmFjdGlvblsnRnJhY3Rpb24nXSA9IEZyYWN0aW9uO1xuICAgIG1vZHVsZVsnZXhwb3J0cyddID0gRnJhY3Rpb247XG4gIH0gZWxzZSB7XG4gICAgcm9vdFsnRnJhY3Rpb24nXSA9IEZyYWN0aW9uO1xuICB9XG5cbn0pKHRoaXMpO1xuIiwiaW1wb3J0IEZyYWN0aW9uIGZyb20gJ2ZyYWN0aW9uLmpzJztcblxuLyoqXG4gKiBJTlRFUlZBTFNcbiAqXG4gKiBUaGUgaW50ZXJ2YWwgaXMgdGhlIGJhc2ljIGJ1aWxkaW5nIGJsb2NrIG9mIG11c2ljLlxuICogSXQgaXMgdGhlIGRpZmZlcmVuY2UgaW4gcGl0Y2ggYmV0d2VlbiB0d28gc291bmRzLlxuICpcbiAqIEl0IGNhbiBiZSByZXByZXNlbnRlZCBhczpcbiAqIC0gYSBmcmVxdWVuY3kgcmF0aW9cbiAqIC0gYSBudW1iZXIgb2YgY2VudHMgKDEvMTAwIG9mIGFuIGVxdWFsbHkgdGVtcGVyZWQgc2VtaXRvbmUpXG4gKiAtIGEgbnVtYmVyIG9mIHNhdmFydHMgKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NhdmFydClcbiAqIC0gLi4uYW5kIG1vcmVcbiAqXG4gKiBJdCBjYW4gYWxzbyBiZSBuYW1lZCwgZGVwZW5kaW5nIG9uIHRoZSBub21lbmNsYXR1cmUgYmVpbmcgdXNlZC5cbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIEludGVydmFsIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJhdGlvOiBGcmFjdGlvbikge31cbiAgZ2V0IGNlbnRzKCk6IG51bWJlciB7IHJldHVybiAxMjAwICogTWF0aC5sb2cyKHRoaXMucmF0aW8udmFsdWVPZigpKTsgfVxuICBnZXQgc2F2YXJ0cygpOiBudW1iZXIgeyByZXR1cm4gMTAwMCAqIE1hdGgubG9nMTAodGhpcy5yYXRpby52YWx1ZU9mKCkpOyB9XG4gIGRpZmZlcmVuY2UocmVmZXJlbmNlOiBJbnRlcnZhbCk6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbCh0aGlzLnJhdGlvLmRpdihyZWZlcmVuY2UucmF0aW8pKTsgfVxuICBzdGF0aWMgZnJvbVJhdGlvKHJhdGlvOiBzdHJpbmcpOiBJbnRlcnZhbCB7IHJldHVybiBuZXcgSW50ZXJ2YWwobmV3IEZyYWN0aW9uKHJhdGlvKSk7IH1cbiAgc3RhdGljIGZyb21DZW50cyhjZW50czogbnVtYmVyKTogSW50ZXJ2YWwgeyByZXR1cm4gbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbihNYXRoLnBvdygyLCBjZW50cyAvIDEyMDApKSk7IH1cbiAgc3RhdGljIGZyb21TYXZhcnRzKHNhdmFydHM6IG51bWJlcik6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oTWF0aC5wb3coMTAsIHNhdmFydHMgLyAxMDAwKSkpOyB9XG4gIHN0YXRpYyBjb21wYXJlKGE6IEludGVydmFsLCBiOiBJbnRlcnZhbCk6IG51bWJlciB7IHJldHVybiBhLnJhdGlvLmNvbXBhcmUoYi5yYXRpbyk7IH1cbiAgc3RhdGljIEpORDogSW50ZXJ2YWwgPSBJbnRlcnZhbC5mcm9tQ2VudHMoNSk7IC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0p1c3Qtbm90aWNlYWJsZV9kaWZmZXJlbmNlXG59XG4iLCJpbXBvcnQgRnJhY3Rpb24gZnJvbSAnZnJhY3Rpb24uanMnO1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3V0aWxzL0hlbHBlcnMnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbiB9IGZyb20gJy4vdXRpbHMvQW5ub3RhdGlvbic7XG5pbXBvcnQgeyBJbnRlcnZhbCB9IGZyb20gJy4vSW50ZXJ2YWwnO1xuXG4vKipcbiAqIFRVTklORyBTWVNURU1cbiAqXG4gKiBHaXZlbiBhIHJlZmVyZW5jZSB0b25lIGFuZCBhIHRhcmdldCB0b25lLCBhIHR1bmluZyByZXR1cm5zIHRoZSByYXRpbyBiZXR3ZWVuIHRoZW0uXG4gKlxuICogVGhlIGZ1bmRhbWVudGFsIGludGVydmFsIGlzIDIvMSBiZXR3ZWVuIHRoZSBiYXNlIHRvbmUgYW5kIGl0cyBvY3RhdmUuXG4gKiBPdGhlciB0b25lcyBzdWJkaXZpZGUgdGhlIG9jdGF2ZSBpbnRlcnZhbC4gQSBmaW5pdGUgbnVtYmVyIG9mIHRvbmVzIE4gbWFrZSB1cCB0aGUgdHVuaW5nLlxuICogVG9uZXMgYXJlIGluZGV4ZWQgYWNjb3JkaW5nIHRvIHRoZWlyIHJhbmsgaW4gdGhlIG9yZGVyZWQgc2VxdWVuY2Ugb2YgcmF0aW9zXG4gKiB0b25lIDAgPT4gcmF0aW8gMSAodW5pc29uKVxuICogdG9uZSAxID0+IHJhdGlvIDEuYWJjIChmaXJzdCBpbnRlcnZhbClcbiAqIHRvbmUgMiA9PiByYXRpbyAxLmRlZiAoc2Vjb25kIGludGVydmFsKVxuICogLi4uXG4gKiB0b25lIE4tMiA9PiByYXRpbyAxLnh5eiAobmV4dC10by1sYXN0IGludGVydmFsKVxuICogdG9uZSBOLTEgPT4gcmF0aW8gMiAob2N0YXZlKVxuICpcbiAqIFRvbmVzIGNhbiBleHRlbmQgYmV5b25kIHRoZSBvY3RhdmVcbiAqIGUuZy4gdG9uZSBOKzEgaXMgZXF1aXZhbGVudCB0byB0b25lIDEsIGJ1dCBvbmUgb2N0YXZlIGhpZ2hlci5cbiAqIEluIGFkZGl0aW9uIHRvIHJlcHJlc2VudGluZyBhIHRvbmUgYXMgYWJvdmUsIHdlIGNhbiByZXByZXNlbnQgaXQgYnkgaXRzIFwiZ2VuZXJhdG9yXCI6XG4gKiAtIGl0cyBwaXRjaCBjbGFzcyBwYyDiiIggWzAsIE4tMV1cbiAqIC0gaXRzIG9jdGF2ZSBvIOKIiCDihKRcbiAqIHN1Y2ggdGhhdCB0ID0gcGModCkgKyBOICogbyh0KVxuICovXG5leHBvcnQgY2xhc3MgVHVuaW5nIHtcbiAgLyoqXG4gICAqIENPTlNUUlVDVE9SXG4gICAqXG4gICAqIEBwYXJhbSBpbnRlcnZhbHM6IHR1bmluZyBpbnRlcnZhbHNcbiAgICogVGhlIGludGVydmFscyB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gYmUgc29ydGVkLlxuICAgKiBUaGUgZmlyc3QgaW50ZXJ2YWwgd2lsbCBiZSBfZ3VhcmFudGVlZF8gdG8gYmUgdGhlIHVuaXNvbi5cbiAgICogVGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBiZSBfYXNzdW1lZF8gdG8gYmUgdGhlIHJlcGVhdGVyIChlLmcuIDIvMSB0aGUgb2N0YXZlKS5cbiAgICogQHBhcmFtIGFubm90YXRpb25zOiBub3RlcyBhYm91dCB0aGUgdHVuaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW50ZXJ2YWxzOiBJbnRlcnZhbFtdLCBwdWJsaWMgYW5ub3RhdGlvbnM6IEFubm90YXRpb25bXSA9IFtdKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMuc29ydChJbnRlcnZhbC5jb21wYXJlKTtcbiAgICBpZiAodGhpcy5pbnRlcnZhbHNbMF0ucmF0aW8udmFsdWVPZigpICE9IDEpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW25ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oMSkpLCAuLi50aGlzLmludGVydmFsc107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHR1bmluZyBmcm9tIHJhdGlvcyBvciBjZW50cy5cbiAgICpcbiAgICogQHBhcmFtIGludGVydmFsczogYW4gYXJyYXkgb2YgcmF0aW9zIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBvciBjZW50cyBleHByZXNzZWQgYXMgbnVtYmVyc1xuICAgKiBAcGFyYW0gYW5ub3RhdGlvbnM6IGFzIHBlciBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJucyB0dW5pbmcgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgZnJvbUludGVydmFscyhpbnRlcnZhbHM6IChudW1iZXJ8c3RyaW5nKVtdLCBhbm5vdGF0aW9uczogQW5ub3RhdGlvbltdID0gW10pOiBUdW5pbmcge1xuICAgIHJldHVybiBuZXcgVHVuaW5nKGludGVydmFscy5tYXAoaW50ZXJ2YWwgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbihpbnRlcnZhbCkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbC5mcm9tQ2VudHMoaW50ZXJ2YWwpO1xuICAgICAgfVxuICAgIH0pLCBhbm5vdGF0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogSVMgQSBUVU5JTkcgVFJBTlNQT1NBQkxFP1xuICAgKlxuICAgKiBBIHR1bmluZyBpcyBmdWxseSB0cmFuc3Bvc2FibGUgaWYgYWxsIG9mIGl0cyBpbnRlcnZhbCBkaWZmZXJlbmNlcyBhcmUgZXF1YWwuXG4gICAqIFdlIHdpbGwgY29uc2lkZXIgZXF1YWxpdHkgdG8gYmUgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgXCJqdXN0IG5vdGljZWFibGVcIiBpbnRlcnZhbCAoNSBjZW50cykuXG4gICAqL1xuICBwcml2YXRlIF90cmFuc3Bvc2FibGU6IGJvb2xlYW47XG4gIGdldCB0cmFuc3Bvc2FibGUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3RyYW5zcG9zYWJsZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5fdHJhbnNwb3NhYmxlO1xuXG4gICAgY29uc3QgZmlyc3Q6IEludGVydmFsID0gdGhpcy5pbnRlcnZhbHNbMV0uZGlmZmVyZW5jZSh0aGlzLmludGVydmFsc1swXSk7XG4gICAgcmV0dXJuICh0aGlzLl90cmFuc3Bvc2FibGUgPSB0aGlzLmludGVydmFscy5zbGljZSgxKS5ldmVyeSgodiwgaSkgPT4ge1xuICAgICAgY29uc3QgbmV4dDogSW50ZXJ2YWwgPSB2LmRpZmZlcmVuY2UodGhpcy5pbnRlcnZhbHNbaV0pO1xuICAgICAgY29uc3QgZGlmZjogSW50ZXJ2YWwgPSBuZXcgSW50ZXJ2YWwoSGVscGVycy5mbGlwRnJhY3Rpb24obmV4dC5kaWZmZXJlbmNlKGZpcnN0KS5yYXRpbywgdHJ1ZSkpO1xuICAgICAgcmV0dXJuIGRpZmYucmF0aW8uY29tcGFyZShJbnRlcnZhbC5KTkQucmF0aW8pIDwgMDtcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogU1RFUFMgT0YgQSBUVU5JTkdcbiAgICpcbiAgICogQHJldHVybnMgY291bnQgb2YgdG9uZXMgaW4gdGhlIHR1bmluZ1xuICAgKi9cbiAgZ2V0IHN0ZXBzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWxzLmxlbmd0aCAtIDE7XG4gIH1cblxuICAvKipcbiAgICogT0NUQVZFIE9GIEEgVFVOSU5HXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBsYXN0IGludGVydmFsIGluIHRoZSB0dW5pbmcsIHdoaWNoIGlzIGNvbnNpZGVyZWQgdG8gYmUgdGhlIG9jdGF2ZVxuICAgKi9cbiAgZ2V0IG9jdGF2ZSgpOiBJbnRlcnZhbCB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWxzW3RoaXMuc3RlcHNdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRVTkUgQSBUT05FXG4gICAqXG4gICAqIEBwYXJhbSB0b25lOiB0b25lIHRvIGJlIHR1bmVkXG4gICAqIEByZXR1cm5zIGZyZXF1ZW5jeSByYXRpbyBvZiB0aGUgdG9uZSB3aXRoIHJlc3BlY3QgdG8gcm9vdCB0b25lXG4gICAqL1xuICB0dW5lKHRvbmU6IFR1bmluZ1RvbmUpOiBJbnRlcnZhbCB7XG4gICAgLy8gR2V0IHRoZSByYXRpbyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHRhcmdldCB0b25lIGFuZCB0aGUgcm9vdCB0b25lLCByYWlzZWQgdG8gdGhlIGRpZmZlcmVuY2UgaW4gb2N0YXZlLlxuICAgIC8vIFRoZSBvY3RhdmUgaXMgYWx3YXlzIHRoZSBsYXN0IHRvbmUgYXMgcGVyIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBgaW50ZXJ2YWxzYCBhcnJheS5cbiAgICByZXR1cm4gbmV3IEludGVydmFsKFxuICAgICAgdGhpcy5pbnRlcnZhbHNbdG9uZS5waXRjaENsYXNzXS5yYXRpby5tdWwodGhpcy5vY3RhdmUucmF0aW8ucG93KHRvbmUub2N0YXZlKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5FQVJFU1QgVE9ORVxuICAgKiBGaW5kIHRoZSBuZWFyZXN0IHRvbmUgZ2l2ZW4gYW4gaW50ZXJ2YWwgYW5kIHJldHVybiBkaWZmZXJlbmNlXG4gICAqXG4gICAqIEBwYXJhbSBpbnRlcnZhbDogdGFyZ2V0IGludGVydmFsXG4gICAqIEByZXR1cm5zIG5lYXJlc3QgdG9uZSwgaW50ZXJ2YWwgYW5kIGRpZmZlcmVuY2UgZnJvbSB0aGUgdGFyZ2V0XG4gICAqL1xuICBuZWFyZXN0KGludGVydmFsOiBJbnRlcnZhbCk6IHt0b25lOiBUdW5pbmdUb25lLCBpbnRlcnZhbDogSW50ZXJ2YWwsIGRpZmZlcmVuY2U6IEludGVydmFsfSB7XG4gICAgLy8gQnJpbmcgdGhlIGludGVydmFsIHRvIHRoZSBiYXNlIG9jdGF2ZS5cbiAgICBjb25zdCBvY3RhdmUgPSBNYXRoLmZsb29yKE1hdGgubG9nKGludGVydmFsLnJhdGlvLnZhbHVlT2YoKSkgLyBNYXRoLmxvZyh0aGlzLm9jdGF2ZS5yYXRpby52YWx1ZU9mKCkpKTtcbiAgICBjb25zdCBiYXNlID0gbmV3IEludGVydmFsKGludGVydmFsLnJhdGlvLmRpdih0aGlzLm9jdGF2ZS5yYXRpby5wb3cob2N0YXZlKSkpO1xuXG4gICAgLy8gU2VhcmNoIHRocm91Z2ggdGhlIGludGVydmFscyB0byBsb2NhdGUgdGhlIG5lYXJlc3QuXG4gICAgY29uc3QgbiA9IEhlbHBlcnMuYmluYXJ5U2VhcmNoKHRoaXMuaW50ZXJ2YWxzLCBiYXNlLCBJbnRlcnZhbC5jb21wYXJlKTtcbiAgICBpZiAobiA+PSAwKSB7XG4gICAgICAvLyBFeGFjdCBtYXRjaDogcmV0dXJuIHRoZSBwaXRjaCBhdCB0aGUgcmlnaHQgb2N0YXZlLlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9uZTogbmV3IFR1bmluZ1RvbmUodGhpcywgbiwgb2N0YXZlKSxcbiAgICAgICAgaW50ZXJ2YWwsXG4gICAgICAgIGRpZmZlcmVuY2U6IG5ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oMSkpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFBhcnRpYWwgbWF0Y2g6IGZpbmQgcmVhbCBuZWFyZXN0IGJldHdlZW4gaW5zZXJ0aW9uIHBvaW50IGFuZCBwcmV2aW91cy5cbiAgICAgIC8vIFdlJ3JlIGd1YXJhbnRlZWQgdG8gZmluZCBhIHByZXZpb3VzIHZhbHVlIGJlY2F1c2UgdGhlIGZpcnN0IHZhbHVlIGlzIGFsd2F5cyB1bmlzb24uXG4gICAgICBjb25zdCBtID0gfm47XG4gICAgICBjb25zdCBsb3dlciA9IE1hdGguYWJzKHRoaXMuaW50ZXJ2YWxzW20tMV0uZGlmZmVyZW5jZShiYXNlKS5jZW50cyk7XG4gICAgICBjb25zdCB1cHBlciA9IE1hdGguYWJzKHRoaXMuaW50ZXJ2YWxzW21dLmRpZmZlcmVuY2UoYmFzZSkuY2VudHMpO1xuICAgICAgY29uc3QgbmVhcmVzdCA9IGxvd2VyIDwgdXBwZXIgPyBtLTEgOiBtO1xuICAgICAgY29uc3QgbmVhcmVzdFRvbmUgPSBuZXcgVHVuaW5nVG9uZSh0aGlzLCBuZWFyZXN0LCBvY3RhdmUpO1xuICAgICAgY29uc3QgbmVhcmVzdEludGVydmFsID0gdGhpcy50dW5lKG5lYXJlc3RUb25lKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvbmU6IG5lYXJlc3RUb25lLFxuICAgICAgICBpbnRlcnZhbDogbmVhcmVzdEludGVydmFsLFxuICAgICAgICBkaWZmZXJlbmNlOiBuZWFyZXN0SW50ZXJ2YWwuZGlmZmVyZW5jZShpbnRlcnZhbClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRVFVQUwgRElWSVNJT05TIE9GIFRIRSBPQ1RBVkUuXG4gICAqXG4gICAqIEdlbmVyYXRlIGFuIGludGVydmFscyBhcnJheSBiYXNlZCBvbiBlcXVhbCBkaXZpc2lvbnMgb2YgdGhlIG9jdGF2ZS5cbiAgICogVGhlIGludGVydmFscyBhcmUgY2FsY3VsYXRlZCBpbiBjZW50cywgYmVjYXVzZSB0aGV5IHdpbGwgYmUgY29udmVydGVkIHRvIHJhdGlvc1xuICAgKiBpbnNpZGUgdGhlIFR1bmluZyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIHN0YXRpYyBpbnRlcnZhbHNFZG8oZGl2aXNpb25zOiBudW1iZXIpOiBJbnRlcnZhbFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShBcnJheShkaXZpc2lvbnMgKyAxKSkubWFwKChfLCBpKSA9PiB7XG4gICAgICByZXR1cm4gSW50ZXJ2YWwuZnJvbUNlbnRzKDEyMDAgLyBkaXZpc2lvbnMgKiBpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIFRvbmUgaW4gYSB0dW5pbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBUdW5pbmdUb25lIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR1bmluZzogVHVuaW5nLCBwdWJsaWMgcGl0Y2hDbGFzczogbnVtYmVyLCBwdWJsaWMgb2N0YXZlOiBudW1iZXIpIHt9XG5cbiAgZ2V0IHBpdGNoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGl0Y2hDbGFzcyArIHRoaXMub2N0YXZlICogdGhpcy50dW5pbmcuc3RlcHM7XG4gIH1cblxuICBzdGF0aWMgZnJvbVBpdGNoKHR1bmluZzogVHVuaW5nLCBwaXRjaDogbnVtYmVyKTogVHVuaW5nVG9uZSB7XG4gICAgcmV0dXJuIG5ldyBUdW5pbmdUb25lKHR1bmluZywgSGVscGVycy5tb2QocGl0Y2gsIHR1bmluZy5zdGVwcyksIE1hdGguZmxvb3IocGl0Y2ggLyB0dW5pbmcuc3RlcHMpKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVHVuaW5nLCBUdW5pbmdUb25lIH0gZnJvbSAnLi9UdW5pbmcnO1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3V0aWxzL0hlbHBlcnMnO1xuaW1wb3J0IHsgTXVsdGltYXAgfSBmcm9tICcuL3V0aWxzL0JpbWFwJztcblxuLyoqXG4gKiBOT01FTkNMQVRVUkUgU1lTVEVNXG4gKlxuICogVG8gbmFtZSBub3Rlcywgd2UgdXNlIGEgY29tbW9uIHJlcHJlc2VudGF0aW9uIGJhc2VkIG9uIFNjaWVudGlmaWMgUGl0Y2ggTm90YXRpb24gKFNQTik6XG4gKiAtIFN0YW5kYXJkIG5vdGUgbGV0dGVycyBDLCBELCBFLCBGLCBHLCBBLCBCXG4gKiAtIEFuIGV4dGVuc2libGUgc2V0IG9mIGFjY2lkZW50YWxzXG4gKiAtIFRoZSBvY3RhdmUgc3BlY2lmaWNhdGlvblxuICpcbiAqIFdlIGRlZmluZSBhIHR1bmluZyBub3RhdGlvbiBtYXAgdGhhdCBkZWZpbmVzIGhvdyBub3RlcyBhbmQgYWNjaWRlbnRhbHMgbWFwIHRvIHR1bmluZyB0b25lcy9waXRjaGVzLlxuICovXG5leHBvcnQgY2xhc3MgVHVuaW5nTm90YXRpb24ge1xuICByZWdleDogUmVnRXhwO1xuXG4gIC8qKlxuICAgKiBDT05TVFJVQ1RPUlxuICAgKlxuICAgKiBAcGFyYW0gdHVuaW5nOiB0aGUgdHVuaW5nIGJlaW5nIG5vdGF0ZWRcbiAgICogQHBhcmFtIG1hcDogdGhlIG5vdGF0aW9uIG1hcCB0aGF0IG1hcHMgZXZlcnkgbm90ZSBsZXR0ZXIgKyBhY2NpZGVudGFsIGNvbWJpbmF0aW9uIHRvIHRoZSB0dW5pbmcgdG9uZVxuICAgKiAgICAgICAgLSBkaWZmZXJlbnQgbm90ZSBuYW1lcyB0aGF0IG1hcCB0byB0aGUgc2FtZSBpbmRleCAoZS5nLiBDIyA9IERiID0+IDEpIHNob3VsZCBoYXZlIHNlcGFyYXRlIGVudHJpZXNcbiAgICogICAgICAgIC0gZG9uJ3QgaW5jbHVkZSBvY3RhdmUgbnVtYmVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHR1bmluZzogVHVuaW5nLCBwdWJsaWMgbWFwOiBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj4pIHtcbiAgICB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICdeKCcgKyBBcnJheS5mcm9tKHRoaXMubWFwLmtleXMoKSkubWFwKEhlbHBlcnMuZXNjYXBlUmVnRXhwKS5qb2luKCd8JykgKyAnKScgK1xuICAgICAgJygtP1xcXFxkKSQnLFxuICAgICAgJ2knXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCVUlMRCBBIE1BUCBCWSBDT01CSU5JTkcgTk9URVMgQU5EIEFDQ0lERU5UQUxTXG4gICAqXG4gICAqIEBwYXJhbSB0dW5pbmc6IGFzIHBlciBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gbm90ZXM6IG1hcCBvZiBub3RlIGxldHRlcnMgdG8gdG9uZSBpbmRleGVzOlxuICAgKiBgYGBcbiAgICoge1xuICAgKiAgICdDJzogMCxcbiAgICogICAnRCc6IDIsXG4gICAqICAgJ0UnOiA0LFxuICAgKiAgICdGJzogNSxcbiAgICogICAnRyc6IDcsXG4gICAqICAgJ0EnOiA5LFxuICAgKiAgICdCJzogMTEsXG4gICAqIH1cbiAgICogQHBhcmFtIGFjY2lkZW50YWxzOiBtYXAgb2Ygbm90ZSBhY2NpZGVudGFscyB0byB0b25lIGluY3JlbWVudHM6XG4gICAqIGBgYFxuICAgKiB7XG4gICAqICAgJyMnOiArMSxcbiAgICogICAnYic6IC0xLFxuICAgKiAgICduJzogIDAsXG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZnJvbU5vdGVzQWNjaWRlbnRhbHNDb21iaW5hdGlvbihcbiAgICB0dW5pbmc6IFR1bmluZyxcbiAgICBub3Rlczoge1tub3RlOiBzdHJpbmddOiBudW1iZXJ9LFxuICAgIGFjY2lkZW50YWxzOiB7W2FjY2lkZW50YWw6IHN0cmluZ106IG51bWJlcn1cbiAgKTogVHVuaW5nTm90YXRpb24ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChub3RlID0+IHtcbiAgICAgIG1hcC5zZXQoYCR7bm90ZX1gLCBub3Rlc1tub3RlXSk7XG4gICAgICBPYmplY3Qua2V5cyhhY2NpZGVudGFscykuZm9yRWFjaChhY2NpZGVudGFsID0+IHtcbiAgICAgICAgbWFwLnNldChgJHtub3RlfSR7YWNjaWRlbnRhbH1gLCBIZWxwZXJzLm1vZChub3Rlc1tub3RlXSArIGFjY2lkZW50YWxzW2FjY2lkZW50YWxdLCB0dW5pbmcuc3RlcHMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXcgVHVuaW5nTm90YXRpb24odHVuaW5nLCBtYXApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5BTUUgQSBUT05FXG4gICAqXG4gICAqIEBwYXJhbSB0b25lOiB0b25lIHRvIGJlIG5hbWVkXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIHN0cmluZ3MgcmVwcmVzZW50aW5nIHRoZSBlbmhhcm1vbmljIG5hbWluZ3Mgb2YgdGhlIHRvbmVcbiAgICovXG4gIG5hbWUodG9uZTogVHVuaW5nVG9uZSk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gWy4uLnRoaXMubWFwLmdldEtleSh0b25lLnBpdGNoQ2xhc3MpXS5tYXAobiA9PiBgJHtufSR7dG9uZS5vY3RhdmV9YCk7XG4gIH1cblxuICAvKipcbiAgICogUEFSU0UgQSBOT1RFXG4gICAqXG4gICAqIEBwYXJhbSBub3RlOiB0YXJnZXQgbm90ZSBpbiBzY2llbnRpZmljIHBpdGNoIG5vdGF0aW9uXG4gICAqIEByZXR1cm5zIHRvbmUgZ2VuZXJhdG9yXG4gICAqL1xuICBwYXJzZShub3RlOiBzdHJpbmcpOiBUdW5pbmdUb25lIHtcbiAgICBjb25zdCBtYXRjaCA9IHRoaXMucmVnZXguZXhlYyhub3RlKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFtUdW5pbmdOb3RhdGlvbi5wYXJzZV0gQ291bGQgbm90IHBhcnNlIG5vdGUgJHtub3RlfWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFR1bmluZ1RvbmUodGhpcy50dW5pbmcsIHRoaXMubWFwLmdldChtYXRjaFsxXSksIHBhcnNlSW50KG1hdGNoWzJdLCAxMCkpO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL1R1bmluZyc7XG5leHBvcnQgKiBmcm9tICcuL1R1bmluZ05vdGF0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vSW50ZXJ2YWwnO1xuIiwiLyoqXG4gKiBCSURJUkVDVElPTkFMIE1BUFxuICpcbiAqIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vVGhvbWFzUm9vbmV5L3R5cGVkLWJpLWRpcmVjdGlvbmFsLW1hcFxuICovXG5leHBvcnQgaW50ZXJmYWNlIElCaW1hcDxLLCBWPiBleHRlbmRzIE1hcDxLLCBWPiB7XG4gIHJlYWRvbmx5IHNpemU6IG51bWJlcjsgLy8gcmV0dXJucyB0aGUgdG90YWwgbnVtYmVyIG9mIGVsZW1lbnRzXG4gIGdldDogKGtleTogSykgPT4gViB8IHVuZGVmaW5lZDsgLy8gcmV0dXJucyBhIHNwZWNpZmllZCBlbGVtZW50XG4gIGdldEtleTogKHZhbHVlOiBWKSA9PiBLIHwgS1tdIHwgdW5kZWZpbmVkOyAvLyByZXR1cm5zIGEgc3BlY2lmaWVkIGVsZW1lbnRcbiAgZ2V0VmFsdWU6IChrZXk6IEspID0+IFYgfCB1bmRlZmluZWQ7IC8vIHJldHVybnMgYSBzcGVjaWZpZWQgZWxlbWVudFxuICBzZXQ6IChrZXk6IEssIHZhbHVlOiBWKSA9PiB0aGlzOyAvLyBhZGRzIG9yIHVwZGF0ZXMgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgbG9va2VkIHVwIHZpYSB0aGUgc3BlY2lmaWVkIGtleVxuICBzZXRWYWx1ZTogKGtleTogSywgdmFsdWU6IFYpID0+IHRoaXM7IC8vIGFkZHMgb3IgdXBkYXRlcyB0aGUga2V5IG9mIGFuIGVsZW1lbnQgbG9va2VkIHVwIHZpYSB0aGUgc3BlY2lmaWVkIHZhbHVlXG4gIHNldEtleTogKHZhbHVlOiBWLCBrZXk6IEspID0+IHRoaXM7IC8vIGFkZHMgb3IgdXBkYXRlcyB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBsb29rZWQgdXAgdmlhIHRoZSBzcGVjaWZpZWQga2V5XG4gIGNsZWFyOiAoKSA9PiB2b2lkOyAvLyByZW1vdmVzIGFsbCBlbGVtZW50c1xuICBkZWxldGU6IChrZXk6IEspID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IGV4aXN0ZWQgYW5kIGhhcyBiZWVuIHJlbW92ZWQsIG9yIGZhbHNlIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0LlxuICBkZWxldGVLZXk6IChrZXk6IEspID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IGV4aXN0ZWQgYW5kIGhhcyBiZWVuIHJlbW92ZWQsIG9yIGZhbHNlIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0LlxuICBkZWxldGVWYWx1ZTogKHZhbHVlOiBWKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCBleGlzdGVkIGFuZCBoYXMgYmVlbiByZW1vdmVkLCBvciBmYWxzZSBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdC5cbiAgZm9yRWFjaDogKFxuICAgIGNhbGxiYWNrZm46ICh2YWx1ZTogViwga2V5OiBLLCBtYXA6IElCaW1hcDxLLCBWPikgPT4gdm9pZCxcbiAgICB0aGlzQXJnPzogYW55XG4gICkgPT4gdm9pZDsgLy8gZXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIG9uY2UgZm9yIGVhY2gga2V5IG9mIHRoZSBtYXBcbiAgaGFzOiAoa2V5OiBLKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGV4aXN0czsgb3RoZXJ3aXNlIGZhbHNlLlxuICBoYXNLZXk6IChrZXk6IEspID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBrZXkgZXhpc3RzOyBvdGhlcndpc2UgZmFsc2UuXG4gIGhhc1ZhbHVlOiAodmFsdWU6IFYpID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCB2YWx1ZSBleGlzdHM7IG90aGVyd2lzZSBmYWxzZS5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ106ICdNYXAnOyAvLyBBbnl0aGluZyBpbXBsZW1lbnRpbmcgTWFwIG11c3QgYWx3YXlzIGhhdmUgdG9TdHJpbmdUYWcgZGVjbGFyZWQgdG8gYmUgJ01hcCcuIEkgY29uc2lkZXIgdGhpcyBhIGxpdHRsZSBzaWxseS5cbiAgaW5zcGVjdDogKCkgPT4gc3RyaW5nOyAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gaW5zcGVjdCBjdXJyZW50IGNvbnRlbnRzIGFzIGEgc3RyaW5nXG59XG5cbi8qKlxuICogQmltYXAgd2l0aG91dCBkdXBsaWNhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgQmltYXA8SywgVj4gaW1wbGVtZW50cyBJQmltYXA8SywgVj4ge1xuICBwcm90ZWN0ZWQga2V5VmFsdWVNYXA6IE1hcDxLLCBWPiA9IG5ldyBNYXA8SywgVj4oKTtcbiAgcHJvdGVjdGVkIHZhbHVlS2V5TWFwOiBNYXA8ViwgSz4gPSBuZXcgTWFwPFYsIEs+KCk7XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5rZXlWYWx1ZU1hcC5zaXplO1xuICB9XG5cbiAgcHVibGljIFtTeW1ib2wudG9TdHJpbmdUYWddOiAnTWFwJztcbiAgcHVibGljIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4gPSB0aGlzLmtleVZhbHVlTWFwW1N5bWJvbC5pdGVyYXRvcl07XG5cbiAgcHVibGljIGVudHJpZXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+ID0+IHRoaXMua2V5VmFsdWVNYXAuZW50cmllcygpO1xuICBwdWJsaWMga2V5cyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPEs+ID0+IHRoaXMua2V5VmFsdWVNYXAua2V5cygpO1xuICBwdWJsaWMgdmFsdWVzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Vj4gPT4gdGhpcy5rZXlWYWx1ZU1hcC52YWx1ZXMoKTtcblxuICBwdWJsaWMgZ2V0ID0gKGE6IEspOiBWIHwgdW5kZWZpbmVkID0+IHRoaXMua2V5VmFsdWVNYXAuZ2V0KGEpO1xuICBwdWJsaWMgZ2V0S2V5ID0gKGI6IFYpOiBLIHwgdW5kZWZpbmVkID0+IHRoaXMudmFsdWVLZXlNYXAuZ2V0KGIpO1xuICBwdWJsaWMgZ2V0VmFsdWUgPSAoYTogSyk6IFYgfCB1bmRlZmluZWQgPT4gdGhpcy5nZXQoYSk7XG4gIHB1YmxpYyBzZXQgPSAoa2V5OiBLLCB2YWx1ZTogVik6IHRoaXMgPT4ge1xuICAgIC8vIE1ha2Ugc3VyZSBubyBkdXBsaWNhdGVzLiBPdXIgY29uZmxpY3Qgc2NlbmFyaW8gaXMgaGFuZGxlZCBieSBkZWxldGluZyBwb3RlbnRpYWwgZHVwbGljYXRlcywgaW4gZmF2b3VyIG9mIHRoZSBjdXJyZW50IGFyZ3VtZW50c1xuICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgdGhpcy5kZWxldGVWYWx1ZSh2YWx1ZSk7XG5cbiAgICB0aGlzLmtleVZhbHVlTWFwLnNldChrZXksIHZhbHVlKTtcbiAgICB0aGlzLnZhbHVlS2V5TWFwLnNldCh2YWx1ZSwga2V5KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwdWJsaWMgc2V0S2V5ID0gKHZhbHVlOiBWLCBrZXk6IEspOiB0aGlzID0+IHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICBwdWJsaWMgc2V0VmFsdWUgPSAoa2V5OiBLLCB2YWx1ZTogVik6IHRoaXMgPT4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIHB1YmxpYyBjbGVhciA9ICgpOiB2b2lkID0+IHtcbiAgICB0aGlzLmtleVZhbHVlTWFwLmNsZWFyKCk7XG4gICAgdGhpcy52YWx1ZUtleU1hcC5jbGVhcigpO1xuICB9O1xuICBwdWJsaWMgZGVsZXRlID0gKGtleTogSyk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMua2V5VmFsdWVNYXAuZ2V0KGtleSkgYXMgVjtcbiAgICAgIHRoaXMua2V5VmFsdWVNYXAuZGVsZXRlKGtleSk7XG4gICAgICB0aGlzLnZhbHVlS2V5TWFwLmRlbGV0ZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBwdWJsaWMgZGVsZXRlS2V5ID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5kZWxldGUoa2V5KTtcbiAgcHVibGljIGRlbGV0ZVZhbHVlID0gKHZhbHVlOiBWKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHRoaXMuaGFzVmFsdWUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxldGUodGhpcy52YWx1ZUtleU1hcC5nZXQodmFsdWUpIGFzIEspO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIHB1YmxpYyBmb3JFYWNoID0gKFxuICAgIGNhbGxiYWNrZm46ICh2YWx1ZTogViwga2V5OiBLLCBtYXA6IElCaW1hcDxLLCBWPikgPT4gdm9pZCxcbiAgICB0aGlzQXJnPzogYW55XG4gICk6IHZvaWQgPT4ge1xuICAgIHRoaXMua2V5VmFsdWVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY2FsbGJhY2tmbi5hcHBseSh0aGlzQXJnLCBbdmFsdWUsIGtleSwgdGhpc10pO1xuICAgIH0pO1xuICB9O1xuICBwdWJsaWMgaGFzID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5oYXMoa2V5KTtcbiAgcHVibGljIGhhc0tleSA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMuaGFzKGtleSk7XG4gIHB1YmxpYyBoYXNWYWx1ZSA9ICh2YWx1ZTogVik6IGJvb2xlYW4gPT4gdGhpcy52YWx1ZUtleU1hcC5oYXModmFsdWUpO1xuICBwdWJsaWMgaW5zcGVjdCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBzdHIgPSAnQmltYXAgeyc7XG4gICAgbGV0IGVudHJ5ID0gMDtcbiAgICB0aGlzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGVudHJ5Kys7XG4gICAgICBzdHIgKz0gJycgKyBrZXkudG9TdHJpbmcoKSArICcgPT4gJyArIHZhbHVlLnRvU3RyaW5nKCkgKyAnJztcbiAgICAgIGlmIChlbnRyeSA8IHRoaXMuc2l6ZSkge1xuICAgICAgICBzdHIgKz0gJywgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzdHIgKz0gJ30nO1xuICAgIHJldHVybiBzdHI7XG4gIH07XG59XG5cbi8qKlxuICogQmltYXAgd2l0aCBtdWx0aXBsZSB2YWx1ZXMgcGVyIGtleS5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpbWFwPEssIFY+IGltcGxlbWVudHMgSUJpbWFwPEssIFY+IHtcbiAgcHJvdGVjdGVkIGtleVZhbHVlTWFwOiBNYXA8SywgVj4gPSBuZXcgTWFwPEssIFY+KCk7XG4gIHByb3RlY3RlZCB2YWx1ZUtleU1hcDogTWFwPFYsIEtbXT4gPSBuZXcgTWFwPFYsIEtbXT4oKTtcblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmtleVZhbHVlTWFwLnNpemU7XG4gIH1cblxuICBwdWJsaWMgW1N5bWJvbC50b1N0cmluZ1RhZ106ICdNYXAnO1xuICBwdWJsaWMgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiA9IHRoaXMua2V5VmFsdWVNYXBbU3ltYm9sLml0ZXJhdG9yXTtcblxuICBwdWJsaWMgZW50cmllcyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5lbnRyaWVzKCk7XG4gIHB1YmxpYyBrZXlzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Sz4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5rZXlzKCk7XG4gIHB1YmxpYyB2YWx1ZXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxWPiA9PiB0aGlzLmtleVZhbHVlTWFwLnZhbHVlcygpO1xuXG4gIHB1YmxpYyBnZXQgPSAoYTogSyk6IFYgfCB1bmRlZmluZWQgPT4gdGhpcy5rZXlWYWx1ZU1hcC5nZXQoYSk7XG4gIHB1YmxpYyBnZXRLZXkgPSAoYjogVik6IEtbXSB8IHVuZGVmaW5lZCA9PiB0aGlzLnZhbHVlS2V5TWFwLmdldChiKTtcbiAgcHVibGljIGdldFZhbHVlID0gKGE6IEspOiBWIHwgdW5kZWZpbmVkID0+IHRoaXMuZ2V0KGEpO1xuICBwdWJsaWMgc2V0ID0gKGtleTogSywgdmFsdWU6IFYpOiB0aGlzID0+IHtcbiAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgIHRoaXMua2V5VmFsdWVNYXAuc2V0KGtleSwgdmFsdWUpO1xuXG4gICAgY29uc3Qga2V5cyA9IHRoaXMudmFsdWVLZXlNYXAuZ2V0KHZhbHVlKSB8fCBbXTtcbiAgICB0aGlzLnZhbHVlS2V5TWFwLnNldCh2YWx1ZSwgWy4uLmtleXMsIGtleV0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHB1YmxpYyBzZXRLZXkgPSAodmFsdWU6IFYsIGtleTogSyk6IHRoaXMgPT4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIHB1YmxpYyBzZXRWYWx1ZSA9IChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyA9PiB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgcHVibGljIGNsZWFyID0gKCk6IHZvaWQgPT4ge1xuICAgIHRoaXMua2V5VmFsdWVNYXAuY2xlYXIoKTtcbiAgICB0aGlzLnZhbHVlS2V5TWFwLmNsZWFyKCk7XG4gIH07XG4gIHB1YmxpYyBkZWxldGUgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5rZXlWYWx1ZU1hcC5nZXQoa2V5KSBhcyBWO1xuICAgICAgdGhpcy5rZXlWYWx1ZU1hcC5kZWxldGUoa2V5KTtcbiAgICAgIGNvbnN0IGtleXMgPSB0aGlzLnZhbHVlS2V5TWFwLmdldCh2YWx1ZSkuZmlsdGVyKGsgPT4gayAhPT0ga2V5KTtcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy52YWx1ZUtleU1hcC5zZXQodmFsdWUsIGtleXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52YWx1ZUtleU1hcC5kZWxldGUodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgcHVibGljIGRlbGV0ZUtleSA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMuZGVsZXRlKGtleSk7XG4gIHB1YmxpYyBkZWxldGVWYWx1ZSA9ICh2YWx1ZTogVik6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLmhhc1ZhbHVlKHZhbHVlKSkge1xuICAgICAgdGhpcy52YWx1ZUtleU1hcC5nZXQodmFsdWUpLmZvckVhY2goa2V5ID0+IHsgdGhpcy5kZWxldGUoa2V5KTsgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBwdWJsaWMgZm9yRWFjaCA9IChcbiAgICBjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBJQmltYXA8SywgVj4pID0+IHZvaWQsXG4gICAgdGhpc0FyZz86IGFueVxuICApOiB2b2lkID0+IHtcbiAgICB0aGlzLmtleVZhbHVlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNhbGxiYWNrZm4uYXBwbHkodGhpc0FyZywgW3ZhbHVlLCBrZXksIHRoaXNdKTtcbiAgICB9KTtcbiAgfTtcbiAgcHVibGljIGhhcyA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMua2V5VmFsdWVNYXAuaGFzKGtleSk7XG4gIHB1YmxpYyBoYXNLZXkgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmhhcyhrZXkpO1xuICBwdWJsaWMgaGFzVmFsdWUgPSAodmFsdWU6IFYpOiBib29sZWFuID0+IHRoaXMudmFsdWVLZXlNYXAuaGFzKHZhbHVlKTtcbiAgcHVibGljIGluc3BlY3QgPSAoKTogc3RyaW5nID0+IHtcbiAgICBsZXQgc3RyID0gJ011bHRpbWFwIHsnO1xuICAgIGxldCBlbnRyeSA9IDA7XG4gICAgdGhpcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBlbnRyeSsrO1xuICAgICAgc3RyICs9ICcnICsga2V5LnRvU3RyaW5nKCkgKyAnID0+ICcgKyB2YWx1ZS50b1N0cmluZygpICsgJyc7XG4gICAgICBpZiAoZW50cnkgPCB0aGlzLnNpemUpIHtcbiAgICAgICAgc3RyICs9ICcsICc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc3RyICs9ICd9JztcbiAgICByZXR1cm4gc3RyO1xuICB9O1xufVxuIiwiaW1wb3J0IEZyYWN0aW9uIGZyb20gJ2ZyYWN0aW9uLmpzJztcblxuLyoqXG4gKiBFc2NhcGUgYSBzdHJpbmcgdG8gYmUgdXNlZCBpbiByZWd1bGFyIGV4cHJlc3Npb24uXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL1JlZ3VsYXJfRXhwcmVzc2lvbnNcbiAqXG4gKiBAcGFyYW0gc3RyOiBzdHJpbmcgdG8gZXNjYXBlXG4gKiBAcmV0dXJucyBlc2NhcGVkLCBSZWdFeHAtcmVhZHkgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7IC8vICQmIG1lYW5zIHRoZSB3aG9sZSBtYXRjaGVkIHN0cmluZ1xufVxuXG4vKipcbiAqIEdldCBwcmltZXMgdXAgdG8gYSBnaXZlbiBpbnRlZ2VyLlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEyMjg3NTk5LzIwOTE4NFxuICogVXNlcyB0aGUgU2lldmUgb2YgRXJhdG9zdGhlbmVzIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NpZXZlX29mX0VyYXRvc3RoZW5lc1xuICpcbiAqIEBwYXJhbSBtYXg6IG51bWJlciB0byByZWFjaFxuICogQHJldHVybnMgYWxsIHByaW1lcyB1cCB0byBtYXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW1lcyhtYXg6IG51bWJlcik6IG51bWJlcltdIHtcbiAgY29uc3Qgc2lldmU6IGJvb2xlYW5bXSA9IFtdLCBwcmltZXM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGkgPSAyOyBpIDw9IG1heDsgKytpKSB7XG4gICAgaWYgKCFzaWV2ZVtpXSkge1xuICAgICAgLy8gaSBoYXMgbm90IGJlZW4gbWFya2VkIC0tIGl0IGlzIHByaW1lXG4gICAgICBwcmltZXMucHVzaChpKTtcbiAgICAgIGZvciAobGV0IGogPSBpIDw8IDE7IGogPD0gbWF4OyBqICs9IGkpIHtcbiAgICAgICAgICBzaWV2ZVtqXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwcmltZXM7XG59XG5cbi8qKlxuICogRW5zdXJlIGEgfGZyYWN0aW9ufCA8IDEgb3IgPiAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxpcEZyYWN0aW9uKGY6IEZyYWN0aW9uLCBncmVhdGVyVGhhbk9uZSA9IGZhbHNlKTogRnJhY3Rpb24ge1xuICByZXR1cm4gZ3JlYXRlclRoYW5PbmUgP1xuICAgIChmLmFicygpLmNvbXBhcmUoMSkgPCAwID8gZi5pbnZlcnNlKCkgOiBmKSA6XG4gICAgKGYuYWJzKCkuY29tcGFyZSgxKSA+IDAgPyBmLmludmVyc2UoKSA6IGYpIDtcbn1cblxuLyoqXG4gKiBCaW5hcnkgc2VhcmNoIGluIGFuIGFycmF5LlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI5MDE4NzQ1LzIwOTE4NFxuICpcbiAqIEBwYXJhbSBhcjogZWxlbWVudHMgYXJyYXkgdGhhdCBpcyBzb3J0ZWRcbiAqIEBwYXJhbSBlbDogdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSBjb21wOiBjb21wYXJpc29uIGZ1bmN0aW9uIChhLGIpID0+IG4gd2l0aFxuICogICAgICAgIG4gPiAwIGlmIGEgPiBiXG4gKiAgICAgICAgbiA8IDAgaWYgYSA8IGJcbiAqICAgICAgICBuID0gMCBpZiBhID0gYlxuICogQHJldHVybnMgaW5kZXggbSA+PSAwIGlmIG1hdGNoIGlzIGZvdW5kLCBtIDwgMCBpZiBub3QgZm91bmQgd2l0aCBpbnNlcnRpb24gcG9pbnQgPSAtbS0xLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluYXJ5U2VhcmNoPFQ+KGFyOiBSZWFkb25seUFycmF5PFQ+LCBlbDogVCwgY29tcDogKGE6IFQsIGI6IFQpID0+IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBtID0gMDtcbiAgbGV0IG4gPSBhci5sZW5ndGggLSAxO1xuICB3aGlsZSAobSA8PSBuKSB7XG4gICAgY29uc3QgayA9IChuICsgbSkgPj4gMTtcbiAgICBjb25zdCBjbXAgPSBjb21wKGVsLCBhcltrXSk7XG4gICAgaWYgKGNtcCA+IDApIHtcbiAgICAgIG0gPSBrICsgMTtcbiAgICB9IGVsc2UgaWYgKGNtcCA8IDApIHtcbiAgICAgIG4gPSBrIC0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGs7XG4gICAgfVxuICB9XG4gIHJldHVybiB+bTtcbn1cblxuLyoqXG4gKiBDaGVjayBhcnJheSBlcXVhbGl0eS5cbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcS83ODM3NDU2LzIwOTE4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlFcXVhbDxUPihhcjE6IFJlYWRvbmx5QXJyYXk8VD4sIGFyMjogUmVhZG9ubHlBcnJheTxUPiwgY29tcDogKGE6IFQsIGI6IFQpID0+IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGFyMS5sZW5ndGggPT09IGFyMi5sZW5ndGggJiZcbiAgICBhcjEuZXZlcnkoKHZhbHVlLCBpbmRleCkgPT4gY29tcCh2YWx1ZSwgYXIyW2luZGV4XSkgPT09IDApXG4gICk7XG59XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IHdpdGggdW5pcXVlIHZhbHVlcy5cbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNzkwMzAxOC8yMDkxODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5VW5pcXVlPFQ+KGFyOiBSZWFkb25seUFycmF5PFQ+KTogUmVhZG9ubHlBcnJheTxUPiB7XG4gIHJldHVybiBbLi4ubmV3IFNldChhcildO1xufVxuXG4vKipcbiAqIEFsd2F5cy1wb3NpdGl2ZSBNb2R1bG8gZnVuY3Rpb24uIFRoZSBidWlsdC1pbiAlIG9wZXJhdG9yIGNvbXB1dGVzIHRoZSBSZW1haW5kZXIuXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9PcGVyYXRvcnMvUmVtYWluZGVyXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTczMjM2MDgvMjA5MTg0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb2QobjogbnVtYmVyLCBtOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gKChuICUgbSkgKyBtKSAlIG07XG59XG5cbi8qKlxuICogQXJyYXkgcmFuZ2UuXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTAwNTA4MzEvMjA5MTg0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheVJhbmdlKHNpemU6IG51bWJlciwgc3RhcnRBdCA9IDApOiBSZWFkb25seUFycmF5PG51bWJlcj4ge1xuICByZXR1cm4gWy4uLkFycmF5KHNpemUpLmtleXMoKV0ubWFwKGkgPT4gaSArIHN0YXJ0QXQpO1xufVxuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY3JlYXRlQmluZGluZyhvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSByZXN1bHRba10gPSBtb2Rba107XHJcbiAgICByZXN1bHQuZGVmYXVsdCA9IG1vZDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==