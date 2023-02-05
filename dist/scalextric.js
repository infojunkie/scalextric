(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Scalextric"] = factory();
	else
		root["Scalextric"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/fraction.js/fraction.js":
/*!**********************************************!*\
  !*** ./node_modules/fraction.js/fraction.js ***!
  \**********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * @license Fraction.js v4.2.0 05/03/2022
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

  function assign(n, s) {

    if (isNaN(n = parseInt(n, 10))) {
      throw Fraction['InvalidParameter'];
    }
    return n * s;
  }

  // Creates a new Fraction internally without the need of the bulky constructor
  function newFraction(n, d) {

    if (d === 0) {
      throw Fraction['DivisionByZero'];
    }

    var f = Object.create(Fraction.prototype);
    f["s"] = n < 0 ? -1 : 1;

    n = n < 0 ? -n : n;

    var a = gcd(n, d);

    f["n"] = n / a;
    f["d"] = d / a;
    return f;
  }

  function factorize(num) {

    var factors = {};

    var n = num;
    var i = 2;
    var s = 4;

    while (s <= n) {

      while (n % i === 0) {
        n/= i;
        factors[i] = (factors[i] || 0) + 1;
      }
      s+= 1 + 2 * i++;
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

      if (n % 1 !== 0 || d % 1 !== 0) {
        throw Fraction['NonIntegerParameter'];
      }

    } else
      switch (typeof p1) {

        case "object":
          {
            if ("d" in p1 && "n" in p1) {
              n = p1["n"];
              d = p1["d"];
              if ("s" in p1)
                n*= p1["s"];
            } else if (0 in p1) {
              n = p1[0];
              if (1 in p1)
                d = p1[1];
            } else {
              throw Fraction['InvalidParameter'];
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
                p1/= z;
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
                    A+= C;
                    B+= D;
                  } else {
                    C+= A;
                    D+= B;
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
              n*= z;
            } else if (isNaN(p1) || isNaN(p2)) {
              d = n = NaN;
            }
            break;
          }
        case "string":
          {
            B = p1.match(/\d+|./g);

            if (B === null)
              throw Fraction['InvalidParameter'];

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
                A+= 3;
              }

            } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
              w = assign(B[A], s);
              y = assign(B[A + 2], 1);
              A+= 3;
            } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
              v = assign(B[A], s);
              w = assign(B[A + 2], s);
              y = assign(B[A + 4], 1);
              A+= 5;
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
          throw Fraction['InvalidParameter'];
      }

    if (d === 0) {
      throw Fraction['DivisionByZero'];
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
      d/= 2) {
    }

    for (; d % 5 === 0;
      d/= 5) {
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
      a%= b;
      if (!a)
        return b;
      b%= a;
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

    parse(a, b);

    if (this instanceof Fraction) {
      a = gcd(P["d"], P["n"]); // Abuse variable a
      this["s"] = P["s"];
      this["n"] = P["n"] / a;
      this["d"] = P["d"] / a;
    } else {
      return newFraction(P['s'] * P['n'], P['d']);
    }
  }

  Fraction['DivisionByZero'] = new Error("Division by Zero");
  Fraction['InvalidParameter'] = new Error("Invalid argument");
  Fraction['NonIntegerParameter'] = new Error("Parameters must be integer");

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

      return newFraction(this["n"], this["d"]);
    },

    /**
     * Inverts the sign of the current fraction
     *
     * Ex: new Fraction(-4).neg() => 4
     **/
    "neg": function() {

      return newFraction(-this["s"] * this["n"], this["d"]);
    },

    /**
     * Adds two rational numbers
     *
     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
     **/
    "add": function(a, b) {

      parse(a, b);
      return newFraction(
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
      return newFraction(
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
      return newFraction(
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
      return newFraction(
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
      return newFraction(this['s'] * this['n'], this['d']);
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
        return newFraction(this["s"] * this["n"] % this["d"], 1);
      }

      parse(a, b);
      if (0 === P["n"] && 0 === this["d"]) {
        throw Fraction['DivisionByZero'];
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
      return newFraction(
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

      return newFraction(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
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
        return newFraction(0, 1);
      }
      return newFraction(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
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
      return newFraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
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
      return newFraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
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
      return newFraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
    },

    /**
     * Gets the inverse of the fraction, means numerator and denominator are exchanged
     *
     * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
     **/
    "inverse": function() {

      return newFraction(this["s"] * this["d"], this["n"]);
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
          return newFraction(Math.pow(this['s'] * this["d"], P['n']), Math.pow(this["n"], P['n']));
        } else {
          return newFraction(Math.pow(this['s'] * this["n"], P['n']), Math.pow(this["d"], P['n']));
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
        return newFraction(d, n);
      }
      return newFraction(n, d);
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

      if (isNaN(this['n']) || isNaN(this['d'])) {
        return this;
      }

      eps = eps || 0.001;

      var thisABS = this['abs']();
      var cont = thisABS['toContinued']();

      for (var i = 1; i < cont.length; i++) {

        var s = newFraction(cont[i - 1], 1);
        for (var k = i - 2; k >= 0; k--) {
          s = s['inverse']()['add'](cont[k]);
        }

        if (s['sub'](thisABS)['abs']().valueOf() < eps) {
          return s['mul'](this['s']);
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
     * Ex: new Fraction("1.'3'").toFraction(true) => "4 1/3"
     **/
    'toFraction': function(excludeWhole) {

      var whole, str = "";
      var n = this["n"];
      var d = this["d"];
      if (this["s"] < 0) {
        str+= '-';
      }

      if (d === 1) {
        str+= n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str+= whole;
          str+= " ";
          n%= d;
        }

        str+= n;
        str+= '/';
        str+= d;
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
        str+= '-';
      }

      if (d === 1) {
        str+= n;
      } else {

        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
          str+= whole;
          n%= d;
        }

        str+= "\\frac{";
        str+= n;
        str+= '}{';
        str+= d;
        str+= '}';
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

      var N = this["n"];
      var D = this["d"];

      if (isNaN(N) || isNaN(D)) {
        return "NaN";
      }

      dec = dec || 15; // 15 = decimal places when no repetation

      var cycLen = cycleLen(N, D); // Cycle length
      var cycOff = cycleStart(N, D, cycLen); // Cycle start

      var str = this['s'] < 0 ? "-" : "";

      str+= N / D | 0;

      N%= D;
      N*= 10;

      if (N)
        str+= ".";

      if (cycLen) {

        for (var i = cycOff; i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
        }
        str+= "(";
        for (var i = cycLen; i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
        }
        str+= ")";
      } else {
        for (var i = dec; N && i--;) {
          str+= N / D | 0;
          N%= D;
          N*= 10;
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
const fraction_js_1 = tslib_1.__importDefault(__webpack_require__(/*! fraction.js */ "./node_modules/fraction.js/fraction.js"));
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
const fraction_js_1 = tslib_1.__importDefault(__webpack_require__(/*! fraction.js */ "./node_modules/fraction.js/fraction.js"));
const helpers_1 = __webpack_require__(/*! ./utils/helpers */ "./src/utils/helpers.ts");
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
            const diff = new Interval_1.Interval((0, helpers_1.flipFraction)(next.difference(first).ratio, true));
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
        const n = (0, helpers_1.binarySearch)(this.intervals, base, Interval_1.Interval.compare);
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
        return new TuningTone(tuning, (0, helpers_1.mod)(pitch, tuning.steps), Math.floor(pitch / tuning.steps));
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
const Tuning_1 = __webpack_require__(/*! ./Tuning */ "./src/Tuning.ts");
const helpers_1 = __webpack_require__(/*! ./utils/helpers */ "./src/utils/helpers.ts");
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
        this.regex = new RegExp('^(' + Array.from(this.map.keys()).map(helpers_1.escapeRegExp).join('|') + ')' +
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
                map.set(`${note}${accidental}`, (0, helpers_1.mod)(notes[note] + accidentals[accidental], tuning.steps));
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
tslib_1.__exportStar(__webpack_require__(/*! ./Tuning */ "./src/Tuning.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./TuningNotation */ "./src/TuningNotation.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./Interval */ "./src/Interval.ts"), exports);


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

/***/ "./src/utils/helpers.ts":
/*!******************************!*\
  !*** ./src/utils/helpers.ts ***!
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
/* harmony export */   "__assign": () => (/* binding */ __assign),
/* harmony export */   "__asyncDelegator": () => (/* binding */ __asyncDelegator),
/* harmony export */   "__asyncGenerator": () => (/* binding */ __asyncGenerator),
/* harmony export */   "__asyncValues": () => (/* binding */ __asyncValues),
/* harmony export */   "__await": () => (/* binding */ __await),
/* harmony export */   "__awaiter": () => (/* binding */ __awaiter),
/* harmony export */   "__classPrivateFieldGet": () => (/* binding */ __classPrivateFieldGet),
/* harmony export */   "__classPrivateFieldSet": () => (/* binding */ __classPrivateFieldSet),
/* harmony export */   "__createBinding": () => (/* binding */ __createBinding),
/* harmony export */   "__decorate": () => (/* binding */ __decorate),
/* harmony export */   "__exportStar": () => (/* binding */ __exportStar),
/* harmony export */   "__extends": () => (/* binding */ __extends),
/* harmony export */   "__generator": () => (/* binding */ __generator),
/* harmony export */   "__importDefault": () => (/* binding */ __importDefault),
/* harmony export */   "__importStar": () => (/* binding */ __importStar),
/* harmony export */   "__makeTemplateObject": () => (/* binding */ __makeTemplateObject),
/* harmony export */   "__metadata": () => (/* binding */ __metadata),
/* harmony export */   "__param": () => (/* binding */ __param),
/* harmony export */   "__read": () => (/* binding */ __read),
/* harmony export */   "__rest": () => (/* binding */ __rest),
/* harmony export */   "__spread": () => (/* binding */ __spread),
/* harmony export */   "__spreadArrays": () => (/* binding */ __spreadArrays),
/* harmony export */   "__values": () => (/* binding */ __values)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CLGFBQWEsU0FBUztBQUN0QjtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLFdBQVc7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsV0FBVztBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxFQUFFOztBQUVWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkVBQTZFO0FBQzdFLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGlCQUFpQjs7QUFFdkM7QUFDQSw0QkFBNEIsUUFBUTtBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FB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QSIsInNvdXJjZXMiOlsid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9ub2RlX21vZHVsZXMvZnJhY3Rpb24uanMvZnJhY3Rpb24uanMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy9JbnRlcnZhbC50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL1R1bmluZy50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL1R1bmluZ05vdGF0aW9uLnRzIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy91dGlscy9CaW1hcC50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL3V0aWxzL2hlbHBlcnMudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJTY2FsZXh0cmljXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlNjYWxleHRyaWNcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCAoKSA9PiB7XG5yZXR1cm4gIiwiLyoqXG4gKiBAbGljZW5zZSBGcmFjdGlvbi5qcyB2NC4yLjAgMDUvMDMvMjAyMlxuICogaHR0cHM6Ly93d3cueGFyZy5vcmcvMjAxNC8wMy9yYXRpb25hbC1udW1iZXJzLWluLWphdmFzY3JpcHQvXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDIxLCBSb2JlcnQgRWlzZWxlIChyb2JlcnRAeGFyZy5vcmcpXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIFZlcnNpb24gMiBsaWNlbnNlcy5cbiAqKi9cblxuXG4vKipcbiAqXG4gKiBUaGlzIGNsYXNzIG9mZmVycyB0aGUgcG9zc2liaWxpdHkgdG8gY2FsY3VsYXRlIGZyYWN0aW9ucy5cbiAqIFlvdSBjYW4gcGFzcyBhIGZyYWN0aW9uIGluIGRpZmZlcmVudCBmb3JtYXRzLiBFaXRoZXIgYXMgYXJyYXksIGFzIGRvdWJsZSwgYXMgc3RyaW5nIG9yIGFzIGFuIGludGVnZXIuXG4gKlxuICogQXJyYXkvT2JqZWN0IGZvcm1cbiAqIFsgMCA9PiA8bm9taW5hdG9yPiwgMSA9PiA8ZGVub21pbmF0b3I+IF1cbiAqIFsgbiA9PiA8bm9taW5hdG9yPiwgZCA9PiA8ZGVub21pbmF0b3I+IF1cbiAqXG4gKiBJbnRlZ2VyIGZvcm1cbiAqIC0gU2luZ2xlIGludGVnZXIgdmFsdWVcbiAqXG4gKiBEb3VibGUgZm9ybVxuICogLSBTaW5nbGUgZG91YmxlIHZhbHVlXG4gKlxuICogU3RyaW5nIGZvcm1cbiAqIDEyMy40NTYgLSBhIHNpbXBsZSBkb3VibGVcbiAqIDEyMy80NTYgLSBhIHN0cmluZyBmcmFjdGlvblxuICogMTIzLic0NTYnIC0gYSBkb3VibGUgd2l0aCByZXBlYXRpbmcgZGVjaW1hbCBwbGFjZXNcbiAqIDEyMy4oNDU2KSAtIHN5bm9ueW1cbiAqIDEyMy40NSc2JyAtIGEgZG91YmxlIHdpdGggcmVwZWF0aW5nIGxhc3QgcGxhY2VcbiAqIDEyMy40NSg2KSAtIHN5bm9ueW1cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIHZhciBmID0gbmV3IEZyYWN0aW9uKFwiOS40JzMxJ1wiKTtcbiAqIGYubXVsKFstNCwgM10pLmRpdig0LjkpO1xuICpcbiAqL1xuXG4oZnVuY3Rpb24ocm9vdCkge1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8vIE1heGltdW0gc2VhcmNoIGRlcHRoIGZvciBjeWNsaWMgcmF0aW9uYWwgbnVtYmVycy4gMjAwMCBzaG91bGQgYmUgbW9yZSB0aGFuIGVub3VnaC5cbiAgLy8gRXhhbXBsZTogMS83ID0gMC4oMTQyODU3KSBoYXMgNiByZXBlYXRpbmcgZGVjaW1hbCBwbGFjZXMuXG4gIC8vIElmIE1BWF9DWUNMRV9MRU4gZ2V0cyByZWR1Y2VkLCBsb25nIGN5Y2xlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZCBhbmQgdG9TdHJpbmcoKSBvbmx5IGdldHMgdGhlIGZpcnN0IDEwIGRpZ2l0c1xuICB2YXIgTUFYX0NZQ0xFX0xFTiA9IDIwMDA7XG5cbiAgLy8gUGFyc2VkIGRhdGEgdG8gYXZvaWQgY2FsbGluZyBcIm5ld1wiIGFsbCB0aGUgdGltZVxuICB2YXIgUCA9IHtcbiAgICBcInNcIjogMSxcbiAgICBcIm5cIjogMCxcbiAgICBcImRcIjogMVxuICB9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbihuLCBzKSB7XG5cbiAgICBpZiAoaXNOYU4obiA9IHBhcnNlSW50KG4sIDEwKSkpIHtcbiAgICAgIHRocm93IEZyYWN0aW9uWydJbnZhbGlkUGFyYW1ldGVyJ107XG4gICAgfVxuICAgIHJldHVybiBuICogcztcbiAgfVxuXG4gIC8vIENyZWF0ZXMgYSBuZXcgRnJhY3Rpb24gaW50ZXJuYWxseSB3aXRob3V0IHRoZSBuZWVkIG9mIHRoZSBidWxreSBjb25zdHJ1Y3RvclxuICBmdW5jdGlvbiBuZXdGcmFjdGlvbihuLCBkKSB7XG5cbiAgICBpZiAoZCA9PT0gMCkge1xuICAgICAgdGhyb3cgRnJhY3Rpb25bJ0RpdmlzaW9uQnlaZXJvJ107XG4gICAgfVxuXG4gICAgdmFyIGYgPSBPYmplY3QuY3JlYXRlKEZyYWN0aW9uLnByb3RvdHlwZSk7XG4gICAgZltcInNcIl0gPSBuIDwgMCA/IC0xIDogMTtcblxuICAgIG4gPSBuIDwgMCA/IC1uIDogbjtcblxuICAgIHZhciBhID0gZ2NkKG4sIGQpO1xuXG4gICAgZltcIm5cIl0gPSBuIC8gYTtcbiAgICBmW1wiZFwiXSA9IGQgLyBhO1xuICAgIHJldHVybiBmO1xuICB9XG5cbiAgZnVuY3Rpb24gZmFjdG9yaXplKG51bSkge1xuXG4gICAgdmFyIGZhY3RvcnMgPSB7fTtcblxuICAgIHZhciBuID0gbnVtO1xuICAgIHZhciBpID0gMjtcbiAgICB2YXIgcyA9IDQ7XG5cbiAgICB3aGlsZSAocyA8PSBuKSB7XG5cbiAgICAgIHdoaWxlIChuICUgaSA9PT0gMCkge1xuICAgICAgICBuLz0gaTtcbiAgICAgICAgZmFjdG9yc1tpXSA9IChmYWN0b3JzW2ldIHx8IDApICsgMTtcbiAgICAgIH1cbiAgICAgIHMrPSAxICsgMiAqIGkrKztcbiAgICB9XG5cbiAgICBpZiAobiAhPT0gbnVtKSB7XG4gICAgICBpZiAobiA+IDEpXG4gICAgICAgIGZhY3RvcnNbbl0gPSAoZmFjdG9yc1tuXSB8fCAwKSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZhY3RvcnNbbnVtXSA9IChmYWN0b3JzW251bV0gfHwgMCkgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gZmFjdG9ycztcbiAgfVxuXG4gIHZhciBwYXJzZSA9IGZ1bmN0aW9uKHAxLCBwMikge1xuXG4gICAgdmFyIG4gPSAwLCBkID0gMSwgcyA9IDE7XG4gICAgdmFyIHYgPSAwLCB3ID0gMCwgeCA9IDAsIHkgPSAxLCB6ID0gMTtcblxuICAgIHZhciBBID0gMCwgQiA9IDE7XG4gICAgdmFyIEMgPSAxLCBEID0gMTtcblxuICAgIHZhciBOID0gMTAwMDAwMDA7XG4gICAgdmFyIE07XG5cbiAgICBpZiAocDEgPT09IHVuZGVmaW5lZCB8fCBwMSA9PT0gbnVsbCkge1xuICAgICAgLyogdm9pZCAqL1xuICAgIH0gZWxzZSBpZiAocDIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbiA9IHAxO1xuICAgICAgZCA9IHAyO1xuICAgICAgcyA9IG4gKiBkO1xuXG4gICAgICBpZiAobiAlIDEgIT09IDAgfHwgZCAlIDEgIT09IDApIHtcbiAgICAgICAgdGhyb3cgRnJhY3Rpb25bJ05vbkludGVnZXJQYXJhbWV0ZXInXTtcbiAgICAgIH1cblxuICAgIH0gZWxzZVxuICAgICAgc3dpdGNoICh0eXBlb2YgcDEpIHtcblxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgaWYgKFwiZFwiIGluIHAxICYmIFwiblwiIGluIHAxKSB7XG4gICAgICAgICAgICAgIG4gPSBwMVtcIm5cIl07XG4gICAgICAgICAgICAgIGQgPSBwMVtcImRcIl07XG4gICAgICAgICAgICAgIGlmIChcInNcIiBpbiBwMSlcbiAgICAgICAgICAgICAgICBuKj0gcDFbXCJzXCJdO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgwIGluIHAxKSB7XG4gICAgICAgICAgICAgIG4gPSBwMVswXTtcbiAgICAgICAgICAgICAgaWYgKDEgaW4gcDEpXG4gICAgICAgICAgICAgICAgZCA9IHAxWzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgRnJhY3Rpb25bJ0ludmFsaWRQYXJhbWV0ZXInXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgPSBuICogZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlmIChwMSA8IDApIHtcbiAgICAgICAgICAgICAgcyA9IHAxO1xuICAgICAgICAgICAgICBwMSA9IC1wMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHAxICUgMSA9PT0gMCkge1xuICAgICAgICAgICAgICBuID0gcDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHAxID4gMCkgeyAvLyBjaGVjayBmb3IgIT0gMCwgc2NhbGUgd291bGQgYmVjb21lIE5hTiAobG9nKDApKSwgd2hpY2ggY29udmVyZ2VzIHJlYWxseSBzbG93XG5cbiAgICAgICAgICAgICAgaWYgKHAxID49IDEpIHtcbiAgICAgICAgICAgICAgICB6ID0gTWF0aC5wb3coMTAsIE1hdGguZmxvb3IoMSArIE1hdGgubG9nKHAxKSAvIE1hdGguTE4xMCkpO1xuICAgICAgICAgICAgICAgIHAxLz0gejtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIFVzaW5nIEZhcmV5IFNlcXVlbmNlc1xuICAgICAgICAgICAgICAvLyBodHRwOi8vd3d3LmpvaG5kY29vay5jb20vYmxvZy8yMDEwLzEwLzIwL2Jlc3QtcmF0aW9uYWwtYXBwcm94aW1hdGlvbi9cblxuICAgICAgICAgICAgICB3aGlsZSAoQiA8PSBOICYmIEQgPD0gTikge1xuICAgICAgICAgICAgICAgIE0gPSAoQSArIEMpIC8gKEIgKyBEKTtcblxuICAgICAgICAgICAgICAgIGlmIChwMSA9PT0gTSkge1xuICAgICAgICAgICAgICAgICAgaWYgKEIgKyBEIDw9IE4pIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IEEgKyBDO1xuICAgICAgICAgICAgICAgICAgICBkID0gQiArIEQ7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEQgPiBCKSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBDO1xuICAgICAgICAgICAgICAgICAgICBkID0gRDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBBO1xuICAgICAgICAgICAgICAgICAgICBkID0gQjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgaWYgKHAxID4gTSkge1xuICAgICAgICAgICAgICAgICAgICBBKz0gQztcbiAgICAgICAgICAgICAgICAgICAgQis9IEQ7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBDKz0gQTtcbiAgICAgICAgICAgICAgICAgICAgRCs9IEI7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmIChCID4gTikge1xuICAgICAgICAgICAgICAgICAgICBuID0gQztcbiAgICAgICAgICAgICAgICAgICAgZCA9IEQ7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuID0gQTtcbiAgICAgICAgICAgICAgICAgICAgZCA9IEI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG4qPSB6O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc05hTihwMSkgfHwgaXNOYU4ocDIpKSB7XG4gICAgICAgICAgICAgIGQgPSBuID0gTmFOO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgQiA9IHAxLm1hdGNoKC9cXGQrfC4vZyk7XG5cbiAgICAgICAgICAgIGlmIChCID09PSBudWxsKVxuICAgICAgICAgICAgICB0aHJvdyBGcmFjdGlvblsnSW52YWxpZFBhcmFtZXRlciddO1xuXG4gICAgICAgICAgICBpZiAoQltBXSA9PT0gJy0nKSB7Ly8gQ2hlY2sgZm9yIG1pbnVzIHNpZ24gYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgICAgICAgICBzID0gLTE7XG4gICAgICAgICAgICAgIEErKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQltBXSA9PT0gJysnKSB7Ly8gQ2hlY2sgZm9yIHBsdXMgc2lnbiBhdCB0aGUgYmVnaW5uaW5nXG4gICAgICAgICAgICAgIEErKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKEIubGVuZ3RoID09PSBBICsgMSkgeyAvLyBDaGVjayBpZiBpdCdzIGp1c3QgYSBzaW1wbGUgbnVtYmVyIFwiMTIzNFwiXG4gICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBKytdLCBzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQltBICsgMV0gPT09ICcuJyB8fCBCW0FdID09PSAnLicpIHsgLy8gQ2hlY2sgaWYgaXQncyBhIGRlY2ltYWwgbnVtYmVyXG5cbiAgICAgICAgICAgICAgaWYgKEJbQV0gIT09ICcuJykgeyAvLyBIYW5kbGUgMC41IGFuZCAuNVxuICAgICAgICAgICAgICAgIHYgPSBhc3NpZ24oQltBKytdLCBzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBBKys7XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGRlY2ltYWwgcGxhY2VzXG4gICAgICAgICAgICAgIGlmIChBICsgMSA9PT0gQi5sZW5ndGggfHwgQltBICsgMV0gPT09ICcoJyAmJiBCW0EgKyAzXSA9PT0gJyknIHx8IEJbQSArIDFdID09PSBcIidcIiAmJiBCW0EgKyAzXSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgICAgICB3ID0gYXNzaWduKEJbQV0sIHMpO1xuICAgICAgICAgICAgICAgIHkgPSBNYXRoLnBvdygxMCwgQltBXS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIEErKztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIENoZWNrIGZvciByZXBlYXRpbmcgcGxhY2VzXG4gICAgICAgICAgICAgIGlmIChCW0FdID09PSAnKCcgJiYgQltBICsgMl0gPT09ICcpJyB8fCBCW0FdID09PSBcIidcIiAmJiBCW0EgKyAyXSA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgICAgICB4ID0gYXNzaWduKEJbQSArIDFdLCBzKTtcbiAgICAgICAgICAgICAgICB6ID0gTWF0aC5wb3coMTAsIEJbQSArIDFdLmxlbmd0aCkgLSAxO1xuICAgICAgICAgICAgICAgIEErPSAzO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQltBICsgMV0gPT09ICcvJyB8fCBCW0EgKyAxXSA9PT0gJzonKSB7IC8vIENoZWNrIGZvciBhIHNpbXBsZSBmcmFjdGlvbiBcIjEyMy80NTZcIiBvciBcIjEyMzo0NTZcIlxuICAgICAgICAgICAgICB3ID0gYXNzaWduKEJbQV0sIHMpO1xuICAgICAgICAgICAgICB5ID0gYXNzaWduKEJbQSArIDJdLCAxKTtcbiAgICAgICAgICAgICAgQSs9IDM7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEJbQSArIDNdID09PSAnLycgJiYgQltBICsgMV0gPT09ICcgJykgeyAvLyBDaGVjayBmb3IgYSBjb21wbGV4IGZyYWN0aW9uIFwiMTIzIDEvMlwiXG4gICAgICAgICAgICAgIHYgPSBhc3NpZ24oQltBXSwgcyk7XG4gICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBICsgMl0sIHMpO1xuICAgICAgICAgICAgICB5ID0gYXNzaWduKEJbQSArIDRdLCAxKTtcbiAgICAgICAgICAgICAgQSs9IDU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChCLmxlbmd0aCA8PSBBKSB7IC8vIENoZWNrIGZvciBtb3JlIHRva2VucyBvbiB0aGUgc3RhY2tcbiAgICAgICAgICAgICAgZCA9IHkgKiB6O1xuICAgICAgICAgICAgICBzID0gLyogdm9pZCAqL1xuICAgICAgICAgICAgICBuID0geCArIGQgKiB2ICsgeiAqIHc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBGYWxsIHRocm91Z2ggb24gZXJyb3IgKi9cbiAgICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgRnJhY3Rpb25bJ0ludmFsaWRQYXJhbWV0ZXInXTtcbiAgICAgIH1cblxuICAgIGlmIChkID09PSAwKSB7XG4gICAgICB0aHJvdyBGcmFjdGlvblsnRGl2aXNpb25CeVplcm8nXTtcbiAgICB9XG5cbiAgICBQW1wic1wiXSA9IHMgPCAwID8gLTEgOiAxO1xuICAgIFBbXCJuXCJdID0gTWF0aC5hYnMobik7XG4gICAgUFtcImRcIl0gPSBNYXRoLmFicyhkKTtcbiAgfTtcblxuICBmdW5jdGlvbiBtb2Rwb3coYiwgZSwgbSkge1xuXG4gICAgdmFyIHIgPSAxO1xuICAgIGZvciAoOyBlID4gMDsgYiA9IChiICogYikgJSBtLCBlID4+PSAxKSB7XG5cbiAgICAgIGlmIChlICYgMSkge1xuICAgICAgICByID0gKHIgKiBiKSAlIG07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cblxuICBmdW5jdGlvbiBjeWNsZUxlbihuLCBkKSB7XG5cbiAgICBmb3IgKDsgZCAlIDIgPT09IDA7XG4gICAgICBkLz0gMikge1xuICAgIH1cblxuICAgIGZvciAoOyBkICUgNSA9PT0gMDtcbiAgICAgIGQvPSA1KSB7XG4gICAgfVxuXG4gICAgaWYgKGQgPT09IDEpIC8vIENhdGNoIG5vbi1jeWNsaWMgbnVtYmVyc1xuICAgICAgcmV0dXJuIDA7XG5cbiAgICAvLyBJZiB3ZSB3b3VsZCBsaWtlIHRvIGNvbXB1dGUgcmVhbGx5IGxhcmdlIG51bWJlcnMgcXVpY2tlciwgd2UgY291bGQgbWFrZSB1c2Ugb2YgRmVybWF0J3MgbGl0dGxlIHRoZW9yZW06XG4gICAgLy8gMTBeKGQtMSkgJSBkID09IDFcbiAgICAvLyBIb3dldmVyLCB3ZSBkb24ndCBuZWVkIHN1Y2ggbGFyZ2UgbnVtYmVycyBhbmQgTUFYX0NZQ0xFX0xFTiBzaG91bGQgYmUgdGhlIGNhcHN0b25lLFxuICAgIC8vIGFzIHdlIHdhbnQgdG8gdHJhbnNsYXRlIHRoZSBudW1iZXJzIHRvIHN0cmluZ3MuXG5cbiAgICB2YXIgcmVtID0gMTAgJSBkO1xuICAgIHZhciB0ID0gMTtcblxuICAgIGZvciAoOyByZW0gIT09IDE7IHQrKykge1xuICAgICAgcmVtID0gcmVtICogMTAgJSBkO1xuXG4gICAgICBpZiAodCA+IE1BWF9DWUNMRV9MRU4pXG4gICAgICAgIHJldHVybiAwOyAvLyBSZXR1cm5pbmcgMCBoZXJlIG1lYW5zIHRoYXQgd2UgZG9uJ3QgcHJpbnQgaXQgYXMgYSBjeWNsaWMgbnVtYmVyLiBJdCdzIGxpa2VseSB0aGF0IHRoZSBhbnN3ZXIgaXMgYGQtMWBcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGN5Y2xlU3RhcnQobiwgZCwgbGVuKSB7XG5cbiAgICB2YXIgcmVtMSA9IDE7XG4gICAgdmFyIHJlbTIgPSBtb2Rwb3coMTAsIGxlbiwgZCk7XG5cbiAgICBmb3IgKHZhciB0ID0gMDsgdCA8IDMwMDsgdCsrKSB7IC8vIHMgPCB+bG9nMTAoTnVtYmVyLk1BWF9WQUxVRSlcbiAgICAgIC8vIFNvbHZlIDEwXnMgPT0gMTBeKHMrdCkgKG1vZCBkKVxuXG4gICAgICBpZiAocmVtMSA9PT0gcmVtMilcbiAgICAgICAgcmV0dXJuIHQ7XG5cbiAgICAgIHJlbTEgPSByZW0xICogMTAgJSBkO1xuICAgICAgcmVtMiA9IHJlbTIgKiAxMCAlIGQ7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2NkKGEsIGIpIHtcblxuICAgIGlmICghYSlcbiAgICAgIHJldHVybiBiO1xuICAgIGlmICghYilcbiAgICAgIHJldHVybiBhO1xuXG4gICAgd2hpbGUgKDEpIHtcbiAgICAgIGElPSBiO1xuICAgICAgaWYgKCFhKVxuICAgICAgICByZXR1cm4gYjtcbiAgICAgIGIlPSBhO1xuICAgICAgaWYgKCFiKVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtudW1iZXJ8RnJhY3Rpb249fSBhXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gYlxuICAgKi9cbiAgZnVuY3Rpb24gRnJhY3Rpb24oYSwgYikge1xuXG4gICAgcGFyc2UoYSwgYik7XG5cbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEZyYWN0aW9uKSB7XG4gICAgICBhID0gZ2NkKFBbXCJkXCJdLCBQW1wiblwiXSk7IC8vIEFidXNlIHZhcmlhYmxlIGFcbiAgICAgIHRoaXNbXCJzXCJdID0gUFtcInNcIl07XG4gICAgICB0aGlzW1wiblwiXSA9IFBbXCJuXCJdIC8gYTtcbiAgICAgIHRoaXNbXCJkXCJdID0gUFtcImRcIl0gLyBhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oUFsncyddICogUFsnbiddLCBQWydkJ10pO1xuICAgIH1cbiAgfVxuXG4gIEZyYWN0aW9uWydEaXZpc2lvbkJ5WmVybyddID0gbmV3IEVycm9yKFwiRGl2aXNpb24gYnkgWmVyb1wiKTtcbiAgRnJhY3Rpb25bJ0ludmFsaWRQYXJhbWV0ZXInXSA9IG5ldyBFcnJvcihcIkludmFsaWQgYXJndW1lbnRcIik7XG4gIEZyYWN0aW9uWydOb25JbnRlZ2VyUGFyYW1ldGVyJ10gPSBuZXcgRXJyb3IoXCJQYXJhbWV0ZXJzIG11c3QgYmUgaW50ZWdlclwiKTtcblxuICBGcmFjdGlvbi5wcm90b3R5cGUgPSB7XG5cbiAgICBcInNcIjogMSxcbiAgICBcIm5cIjogMCxcbiAgICBcImRcIjogMSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGFic29sdXRlIHZhbHVlXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKC00KS5hYnMoKSA9PiA0XG4gICAgICoqL1xuICAgIFwiYWJzXCI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24odGhpc1tcIm5cIl0sIHRoaXNbXCJkXCJdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW52ZXJ0cyB0aGUgc2lnbiBvZiB0aGUgY3VycmVudCBmcmFjdGlvblxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbigtNCkubmVnKCkgPT4gNFxuICAgICAqKi9cbiAgICBcIm5lZ1wiOiBmdW5jdGlvbigpIHtcblxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKC10aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdLCB0aGlzW1wiZFwiXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oe246IDIsIGQ6IDN9KS5hZGQoXCIxNC45XCIpID0+IDQ2NyAvIDMwXG4gICAgICoqL1xuICAgIFwiYWRkXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oXG4gICAgICAgIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSArIFBbXCJzXCJdICogdGhpc1tcImRcIl0gKiBQW1wiblwiXSxcbiAgICAgICAgdGhpc1tcImRcIl0gKiBQW1wiZFwiXVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3VidHJhY3RzIHR3byByYXRpb25hbCBudW1iZXJzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKHtuOiAyLCBkOiAzfSkuYWRkKFwiMTQuOVwiKSA9PiAtNDI3IC8gMzBcbiAgICAgKiovXG4gICAgXCJzdWJcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihcbiAgICAgICAgdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAqIFBbXCJkXCJdIC0gUFtcInNcIl0gKiB0aGlzW1wiZFwiXSAqIFBbXCJuXCJdLFxuICAgICAgICB0aGlzW1wiZFwiXSAqIFBbXCJkXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNdWx0aXBsaWVzIHR3byByYXRpb25hbCBudW1iZXJzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiLTE3LigzNDUpXCIpLm11bCgzKSA9PiA1Nzc2IC8gMTExXG4gICAgICoqL1xuICAgIFwibXVsXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oXG4gICAgICAgIHRoaXNbXCJzXCJdICogUFtcInNcIl0gKiB0aGlzW1wiblwiXSAqIFBbXCJuXCJdLFxuICAgICAgICB0aGlzW1wiZFwiXSAqIFBbXCJkXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXZpZGVzIHR3byByYXRpb25hbCBudW1iZXJzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiLTE3LigzNDUpXCIpLmludmVyc2UoKS5kaXYoMylcbiAgICAgKiovXG4gICAgXCJkaXZcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihcbiAgICAgICAgdGhpc1tcInNcIl0gKiBQW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0sXG4gICAgICAgIHRoaXNbXCJkXCJdICogUFtcIm5cIl1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb25lcyB0aGUgYWN0dWFsIG9iamVjdFxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbihcIi0xNy4oMzQ1KVwiKS5jbG9uZSgpXG4gICAgICoqL1xuICAgIFwiY2xvbmVcIjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24odGhpc1sncyddICogdGhpc1snbiddLCB0aGlzWydkJ10pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBtb2R1bG8gb2YgdHdvIHJhdGlvbmFsIG51bWJlcnMgLSBhIG1vcmUgcHJlY2lzZSBmbW9kXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKCc0LigzKScpLm1vZChbNywgOF0pID0+ICgxMy8zKSAlICg3LzgpID0gKDUvNilcbiAgICAgKiovXG4gICAgXCJtb2RcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBpZiAoaXNOYU4odGhpc1snbiddKSB8fCBpc05hTih0aGlzWydkJ10pKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTmFOKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbmV3RnJhY3Rpb24odGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAlIHRoaXNbXCJkXCJdLCAxKTtcbiAgICAgIH1cblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICBpZiAoMCA9PT0gUFtcIm5cIl0gJiYgMCA9PT0gdGhpc1tcImRcIl0pIHtcbiAgICAgICAgdGhyb3cgRnJhY3Rpb25bJ0RpdmlzaW9uQnlaZXJvJ107XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICAgKiBGaXJzdCBzaWxseSBhdHRlbXB0LCBraW5kYSBzbG93XG4gICAgICAgKlxuICAgICAgIHJldHVybiB0aGF0W1wic3ViXCJdKHtcbiAgICAgICBcIm5cIjogbnVtW1wiblwiXSAqIE1hdGguZmxvb3IoKHRoaXMubiAvIHRoaXMuZCkgLyAobnVtLm4gLyBudW0uZCkpLFxuICAgICAgIFwiZFwiOiBudW1bXCJkXCJdLFxuICAgICAgIFwic1wiOiB0aGlzW1wic1wiXVxuICAgICAgIH0pOyovXG5cbiAgICAgIC8qXG4gICAgICAgKiBOZXcgYXR0ZW1wdDogYTEgLyBiMSA9IGEyIC8gYjIgKiBxICsgclxuICAgICAgICogPT4gYjIgKiBhMSA9IGEyICogYjEgKiBxICsgYjEgKiBiMiAqIHJcbiAgICAgICAqID0+IChiMiAqIGExICUgYTIgKiBiMSkgLyAoYjEgKiBiMilcbiAgICAgICAqL1xuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIChQW1wiZFwiXSAqIHRoaXNbXCJuXCJdKSAlIChQW1wiblwiXSAqIHRoaXNbXCJkXCJdKSxcbiAgICAgICAgUFtcImRcIl0gKiB0aGlzW1wiZFwiXVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZnJhY3Rpb25hbCBnY2Qgb2YgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oNSw4KS5nY2QoMyw3KSA9PiAxLzU2XG4gICAgICovXG4gICAgXCJnY2RcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcblxuICAgICAgLy8gZ2NkKGEgLyBiLCBjIC8gZCkgPSBnY2QoYSwgYykgLyBsY20oYiwgZClcblxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKGdjZChQW1wiblwiXSwgdGhpc1tcIm5cIl0pICogZ2NkKFBbXCJkXCJdLCB0aGlzW1wiZFwiXSksIFBbXCJkXCJdICogdGhpc1tcImRcIl0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBmcmFjdGlvbmFsIGxjbSBvZiB0d28gcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbig1LDgpLmxjbSgzLDcpID0+IDE1XG4gICAgICovXG4gICAgXCJsY21cIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcblxuICAgICAgLy8gbGNtKGEgLyBiLCBjIC8gZCkgPSBsY20oYSwgYykgLyBnY2QoYiwgZClcblxuICAgICAgaWYgKFBbXCJuXCJdID09PSAwICYmIHRoaXNbXCJuXCJdID09PSAwKSB7XG4gICAgICAgIHJldHVybiBuZXdGcmFjdGlvbigwLCAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihQW1wiblwiXSAqIHRoaXNbXCJuXCJdLCBnY2QoUFtcIm5cIl0sIHRoaXNbXCJuXCJdKSAqIGdjZChQW1wiZFwiXSwgdGhpc1tcImRcIl0pKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgY2VpbCBvZiBhIHJhdGlvbmFsIG51bWJlclxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5jZWlsKCkgPT4gKDUgLyAxKVxuICAgICAqKi9cbiAgICBcImNlaWxcIjogZnVuY3Rpb24ocGxhY2VzKSB7XG5cbiAgICAgIHBsYWNlcyA9IE1hdGgucG93KDEwLCBwbGFjZXMgfHwgMCk7XG5cbiAgICAgIGlmIChpc05hTih0aGlzW1wiblwiXSkgfHwgaXNOYU4odGhpc1tcImRcIl0pKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTmFOKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihNYXRoLmNlaWwocGxhY2VzICogdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdKSwgcGxhY2VzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZmxvb3Igb2YgYSByYXRpb25hbCBudW1iZXJcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oJzQuKDMpJykuZmxvb3IoKSA9PiAoNCAvIDEpXG4gICAgICoqL1xuICAgIFwiZmxvb3JcIjogZnVuY3Rpb24ocGxhY2VzKSB7XG5cbiAgICAgIHBsYWNlcyA9IE1hdGgucG93KDEwLCBwbGFjZXMgfHwgMCk7XG5cbiAgICAgIGlmIChpc05hTih0aGlzW1wiblwiXSkgfHwgaXNOYU4odGhpc1tcImRcIl0pKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTmFOKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihNYXRoLmZsb29yKHBsYWNlcyAqIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gLyB0aGlzW1wiZFwiXSksIHBsYWNlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdW5kcyBhIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oJzQuKDMpJykucm91bmQoKSA9PiAoNCAvIDEpXG4gICAgICoqL1xuICAgIFwicm91bmRcIjogZnVuY3Rpb24ocGxhY2VzKSB7XG5cbiAgICAgIHBsYWNlcyA9IE1hdGgucG93KDEwLCBwbGFjZXMgfHwgMCk7XG5cbiAgICAgIGlmIChpc05hTih0aGlzW1wiblwiXSkgfHwgaXNOYU4odGhpc1tcImRcIl0pKSB7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oTmFOKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihNYXRoLnJvdW5kKHBsYWNlcyAqIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gLyB0aGlzW1wiZFwiXSksIHBsYWNlcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGludmVyc2Ugb2YgdGhlIGZyYWN0aW9uLCBtZWFucyBudW1lcmF0b3IgYW5kIGRlbm9taW5hdG9yIGFyZSBleGNoYW5nZWRcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oWy0zLCA0XSkuaW52ZXJzZSgpID0+IC00IC8gM1xuICAgICAqKi9cbiAgICBcImludmVyc2VcIjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbih0aGlzW1wic1wiXSAqIHRoaXNbXCJkXCJdLCB0aGlzW1wiblwiXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGZyYWN0aW9uIHRvIHNvbWUgcmF0aW9uYWwgZXhwb25lbnQsIGlmIHBvc3NpYmxlXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKC0xLDIpLnBvdygtMykgPT4gLThcbiAgICAgKi9cbiAgICBcInBvd1wiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuXG4gICAgICAvLyBUcml2aWFsIGNhc2Ugd2hlbiBleHAgaXMgYW4gaW50ZWdlclxuXG4gICAgICBpZiAoUFsnZCddID09PSAxKSB7XG5cbiAgICAgICAgaWYgKFBbJ3MnXSA8IDApIHtcbiAgICAgICAgICByZXR1cm4gbmV3RnJhY3Rpb24oTWF0aC5wb3codGhpc1sncyddICogdGhpc1tcImRcIl0sIFBbJ24nXSksIE1hdGgucG93KHRoaXNbXCJuXCJdLCBQWyduJ10pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3RnJhY3Rpb24oTWF0aC5wb3codGhpc1sncyddICogdGhpc1tcIm5cIl0sIFBbJ24nXSksIE1hdGgucG93KHRoaXNbXCJkXCJdLCBQWyduJ10pKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBOZWdhdGl2ZSByb290cyBiZWNvbWUgY29tcGxleFxuICAgICAgLy8gICAgICgtYS9iKV4oYy9kKSA9IHhcbiAgICAgIC8vIDw9PiAoLTEpXihjL2QpICogKGEvYileKGMvZCkgPSB4XG4gICAgICAvLyA8PT4gKGNvcyhwaSkgKyBpKnNpbihwaSkpXihjL2QpICogKGEvYileKGMvZCkgPSB4ICAgICAgICAgIyByb3RhdGUgMSBieSAxODDCsFxuICAgICAgLy8gPD0+IChjb3MoYypwaS9kKSArIGkqc2luKGMqcGkvZCkpICogKGEvYileKGMvZCkgPSB4ICAgICAgICMgRGVNb2l2cmUncyBmb3JtdWxhIGluIFEgKCBodHRwczovL3Byb29md2lraS5vcmcvd2lraS9EZV9Nb2l2cmUlMjdzX0Zvcm11bGEvUmF0aW9uYWxfSW5kZXggKVxuICAgICAgLy8gRnJvbSB3aGljaCBmb2xsb3dzIHRoYXQgb25seSBmb3IgYz0wIHRoZSByb290IGlzIG5vbi1jb21wbGV4LiBjL2QgaXMgYSByZWR1Y2VkIGZyYWN0aW9uLCBzbyB0aGF0IHNpbihjL2RwaSk9MCBvY2N1cnMgZm9yIGQ9MSwgd2hpY2ggaXMgaGFuZGxlZCBieSBvdXIgdHJpdmlhbCBjYXNlLlxuICAgICAgaWYgKHRoaXNbJ3MnXSA8IDApIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBOb3cgcHJpbWUgZmFjdG9yIG4gYW5kIGRcbiAgICAgIHZhciBOID0gZmFjdG9yaXplKHRoaXNbJ24nXSk7XG4gICAgICB2YXIgRCA9IGZhY3Rvcml6ZSh0aGlzWydkJ10pO1xuXG4gICAgICAvLyBFeHBvbmVudGlhdGUgYW5kIHRha2Ugcm9vdCBmb3IgbiBhbmQgZCBpbmRpdmlkdWFsbHlcbiAgICAgIHZhciBuID0gMTtcbiAgICAgIHZhciBkID0gMTtcbiAgICAgIGZvciAodmFyIGsgaW4gTikge1xuICAgICAgICBpZiAoayA9PT0gJzEnKSBjb250aW51ZTtcbiAgICAgICAgaWYgKGsgPT09ICcwJykge1xuICAgICAgICAgIG4gPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIE5ba10qPSBQWyduJ107XG5cbiAgICAgICAgaWYgKE5ba10gJSBQWydkJ10gPT09IDApIHtcbiAgICAgICAgICBOW2tdLz0gUFsnZCddO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIG4qPSBNYXRoLnBvdyhrLCBOW2tdKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgayBpbiBEKSB7XG4gICAgICAgIGlmIChrID09PSAnMScpIGNvbnRpbnVlO1xuICAgICAgICBEW2tdKj0gUFsnbiddO1xuXG4gICAgICAgIGlmIChEW2tdICUgUFsnZCddID09PSAwKSB7XG4gICAgICAgICAgRFtrXS89IFBbJ2QnXTtcbiAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICBkKj0gTWF0aC5wb3coaywgRFtrXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChQWydzJ10gPCAwKSB7XG4gICAgICAgIHJldHVybiBuZXdGcmFjdGlvbihkLCBuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihuLCBkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdHdvIHJhdGlvbmFsIG51bWJlcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKDE5LjYpLmVxdWFscyhbOTgsIDVdKTtcbiAgICAgKiovXG4gICAgXCJlcXVhbHNcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0gPT09IFBbXCJzXCJdICogUFtcIm5cIl0gKiB0aGlzW1wiZFwiXTsgLy8gU2FtZSBhcyBjb21wYXJlKCkgPT09IDBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdHdvIHJhdGlvbmFsIG51bWJlcnMgYXJlIHRoZSBzYW1lXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKDE5LjYpLmVxdWFscyhbOTgsIDVdKTtcbiAgICAgKiovXG4gICAgXCJjb21wYXJlXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICB2YXIgdCA9ICh0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0gLSBQW1wic1wiXSAqIFBbXCJuXCJdICogdGhpc1tcImRcIl0pO1xuICAgICAgcmV0dXJuICgwIDwgdCkgLSAodCA8IDApO1xuICAgIH0sXG5cbiAgICBcInNpbXBsaWZ5XCI6IGZ1bmN0aW9uKGVwcykge1xuXG4gICAgICBpZiAoaXNOYU4odGhpc1snbiddKSB8fCBpc05hTih0aGlzWydkJ10pKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBlcHMgPSBlcHMgfHwgMC4wMDE7XG5cbiAgICAgIHZhciB0aGlzQUJTID0gdGhpc1snYWJzJ10oKTtcbiAgICAgIHZhciBjb250ID0gdGhpc0FCU1sndG9Db250aW51ZWQnXSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNvbnQubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICB2YXIgcyA9IG5ld0ZyYWN0aW9uKGNvbnRbaSAtIDFdLCAxKTtcbiAgICAgICAgZm9yICh2YXIgayA9IGkgLSAyOyBrID49IDA7IGstLSkge1xuICAgICAgICAgIHMgPSBzWydpbnZlcnNlJ10oKVsnYWRkJ10oY29udFtrXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc1snc3ViJ10odGhpc0FCUylbJ2FicyddKCkudmFsdWVPZigpIDwgZXBzKSB7XG4gICAgICAgICAgcmV0dXJuIHNbJ211bCddKHRoaXNbJ3MnXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgZGl2aXNpYmxlXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKDE5LjYpLmRpdmlzaWJsZSgxLjUpO1xuICAgICAqL1xuICAgIFwiZGl2aXNpYmxlXCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG4gICAgICByZXR1cm4gISghKFBbXCJuXCJdICogdGhpc1tcImRcIl0pIHx8ICgodGhpc1tcIm5cIl0gKiBQW1wiZFwiXSkgJSAoUFtcIm5cIl0gKiB0aGlzW1wiZFwiXSkpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGRlY2ltYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGZyYWN0aW9uXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMTAwLic5MTgyMydcIikudmFsdWVPZigpID0+IDEwMC45MTgyMzkxODIzOTE4M1xuICAgICAqKi9cbiAgICAndmFsdWVPZic6IGZ1bmN0aW9uKCkge1xuXG4gICAgICByZXR1cm4gdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nLWZyYWN0aW9uIHJlcHJlc2VudGF0aW9uIG9mIGEgRnJhY3Rpb24gb2JqZWN0XG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMS4nMydcIikudG9GcmFjdGlvbih0cnVlKSA9PiBcIjQgMS8zXCJcbiAgICAgKiovXG4gICAgJ3RvRnJhY3Rpb24nOiBmdW5jdGlvbihleGNsdWRlV2hvbGUpIHtcblxuICAgICAgdmFyIHdob2xlLCBzdHIgPSBcIlwiO1xuICAgICAgdmFyIG4gPSB0aGlzW1wiblwiXTtcbiAgICAgIHZhciBkID0gdGhpc1tcImRcIl07XG4gICAgICBpZiAodGhpc1tcInNcIl0gPCAwKSB7XG4gICAgICAgIHN0cis9ICctJztcbiAgICAgIH1cblxuICAgICAgaWYgKGQgPT09IDEpIHtcbiAgICAgICAgc3RyKz0gbjtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgaWYgKGV4Y2x1ZGVXaG9sZSAmJiAod2hvbGUgPSBNYXRoLmZsb29yKG4gLyBkKSkgPiAwKSB7XG4gICAgICAgICAgc3RyKz0gd2hvbGU7XG4gICAgICAgICAgc3RyKz0gXCIgXCI7XG4gICAgICAgICAgbiU9IGQ7XG4gICAgICAgIH1cblxuICAgICAgICBzdHIrPSBuO1xuICAgICAgICBzdHIrPSAnLyc7XG4gICAgICAgIHN0cis9IGQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbGF0ZXggcmVwcmVzZW50YXRpb24gb2YgYSBGcmFjdGlvbiBvYmplY3RcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCIxLiczJ1wiKS50b0xhdGV4KCkgPT4gXCJcXGZyYWN7NH17M31cIlxuICAgICAqKi9cbiAgICAndG9MYXRleCc6IGZ1bmN0aW9uKGV4Y2x1ZGVXaG9sZSkge1xuXG4gICAgICB2YXIgd2hvbGUsIHN0ciA9IFwiXCI7XG4gICAgICB2YXIgbiA9IHRoaXNbXCJuXCJdO1xuICAgICAgdmFyIGQgPSB0aGlzW1wiZFwiXTtcbiAgICAgIGlmICh0aGlzW1wic1wiXSA8IDApIHtcbiAgICAgICAgc3RyKz0gJy0nO1xuICAgICAgfVxuXG4gICAgICBpZiAoZCA9PT0gMSkge1xuICAgICAgICBzdHIrPSBuO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAoZXhjbHVkZVdob2xlICYmICh3aG9sZSA9IE1hdGguZmxvb3IobiAvIGQpKSA+IDApIHtcbiAgICAgICAgICBzdHIrPSB3aG9sZTtcbiAgICAgICAgICBuJT0gZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cis9IFwiXFxcXGZyYWN7XCI7XG4gICAgICAgIHN0cis9IG47XG4gICAgICAgIHN0cis9ICd9eyc7XG4gICAgICAgIHN0cis9IGQ7XG4gICAgICAgIHN0cis9ICd9JztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgY29udGludWVkIGZyYWN0aW9uIGVsZW1lbnRzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiNy84XCIpLnRvQ29udGludWVkKCkgPT4gWzAsMSw3XVxuICAgICAqL1xuICAgICd0b0NvbnRpbnVlZCc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgdDtcbiAgICAgIHZhciBhID0gdGhpc1snbiddO1xuICAgICAgdmFyIGIgPSB0aGlzWydkJ107XG4gICAgICB2YXIgcmVzID0gW107XG5cbiAgICAgIGlmIChpc05hTihhKSB8fCBpc05hTihiKSkge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuXG4gICAgICBkbyB7XG4gICAgICAgIHJlcy5wdXNoKE1hdGguZmxvb3IoYSAvIGIpKTtcbiAgICAgICAgdCA9IGEgJSBiO1xuICAgICAgICBhID0gYjtcbiAgICAgICAgYiA9IHQ7XG4gICAgICB9IHdoaWxlIChhICE9PSAxKTtcblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIGZyYWN0aW9uIHdpdGggYWxsIGRpZ2l0c1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbihcIjEwMC4nOTE4MjMnXCIpLnRvU3RyaW5nKCkgPT4gXCIxMDAuKDkxODIzKVwiXG4gICAgICoqL1xuICAgICd0b1N0cmluZyc6IGZ1bmN0aW9uKGRlYykge1xuXG4gICAgICB2YXIgTiA9IHRoaXNbXCJuXCJdO1xuICAgICAgdmFyIEQgPSB0aGlzW1wiZFwiXTtcblxuICAgICAgaWYgKGlzTmFOKE4pIHx8IGlzTmFOKEQpKSB7XG4gICAgICAgIHJldHVybiBcIk5hTlwiO1xuICAgICAgfVxuXG4gICAgICBkZWMgPSBkZWMgfHwgMTU7IC8vIDE1ID0gZGVjaW1hbCBwbGFjZXMgd2hlbiBubyByZXBldGF0aW9uXG5cbiAgICAgIHZhciBjeWNMZW4gPSBjeWNsZUxlbihOLCBEKTsgLy8gQ3ljbGUgbGVuZ3RoXG4gICAgICB2YXIgY3ljT2ZmID0gY3ljbGVTdGFydChOLCBELCBjeWNMZW4pOyAvLyBDeWNsZSBzdGFydFxuXG4gICAgICB2YXIgc3RyID0gdGhpc1sncyddIDwgMCA/IFwiLVwiIDogXCJcIjtcblxuICAgICAgc3RyKz0gTiAvIEQgfCAwO1xuXG4gICAgICBOJT0gRDtcbiAgICAgIE4qPSAxMDtcblxuICAgICAgaWYgKE4pXG4gICAgICAgIHN0cis9IFwiLlwiO1xuXG4gICAgICBpZiAoY3ljTGVuKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IGN5Y09mZjsgaS0tOykge1xuICAgICAgICAgIHN0cis9IE4gLyBEIHwgMDtcbiAgICAgICAgICBOJT0gRDtcbiAgICAgICAgICBOKj0gMTA7XG4gICAgICAgIH1cbiAgICAgICAgc3RyKz0gXCIoXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSBjeWNMZW47IGktLTspIHtcbiAgICAgICAgICBzdHIrPSBOIC8gRCB8IDA7XG4gICAgICAgICAgTiU9IEQ7XG4gICAgICAgICAgTio9IDEwO1xuICAgICAgICB9XG4gICAgICAgIHN0cis9IFwiKVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IGRlYzsgTiAmJiBpLS07KSB7XG4gICAgICAgICAgc3RyKz0gTiAvIEQgfCAwO1xuICAgICAgICAgIE4lPSBEO1xuICAgICAgICAgIE4qPSAxMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmVbXCJhbWRcIl0pIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEZyYWN0aW9uO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZyYWN0aW9uLCBcIl9fZXNNb2R1bGVcIiwgeyAndmFsdWUnOiB0cnVlIH0pO1xuICAgIEZyYWN0aW9uWydkZWZhdWx0J10gPSBGcmFjdGlvbjtcbiAgICBGcmFjdGlvblsnRnJhY3Rpb24nXSA9IEZyYWN0aW9uO1xuICAgIG1vZHVsZVsnZXhwb3J0cyddID0gRnJhY3Rpb247XG4gIH0gZWxzZSB7XG4gICAgcm9vdFsnRnJhY3Rpb24nXSA9IEZyYWN0aW9uO1xuICB9XG5cbn0pKHRoaXMpO1xuIiwiaW1wb3J0IEZyYWN0aW9uIGZyb20gJ2ZyYWN0aW9uLmpzJztcblxuLyoqXG4gKiBJTlRFUlZBTFNcbiAqXG4gKiBUaGUgaW50ZXJ2YWwgaXMgdGhlIGJhc2ljIGJ1aWxkaW5nIGJsb2NrIG9mIG11c2ljLlxuICogSXQgaXMgdGhlIGRpZmZlcmVuY2UgaW4gcGl0Y2ggYmV0d2VlbiB0d28gc291bmRzLlxuICpcbiAqIEl0IGNhbiBiZSByZXByZXNlbnRlZCBhczpcbiAqIC0gYSBmcmVxdWVuY3kgcmF0aW9cbiAqIC0gYSBudW1iZXIgb2YgY2VudHMgKDEvMTAwIG9mIGFuIGVxdWFsbHkgdGVtcGVyZWQgc2VtaXRvbmUpXG4gKiAtIGEgbnVtYmVyIG9mIHNhdmFydHMgKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NhdmFydClcbiAqIC0gLi4uYW5kIG1vcmVcbiAqXG4gKiBJdCBjYW4gYWxzbyBiZSBuYW1lZCwgZGVwZW5kaW5nIG9uIHRoZSBub21lbmNsYXR1cmUgYmVpbmcgdXNlZC5cbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIEludGVydmFsIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJhdGlvOiBGcmFjdGlvbikge31cbiAgZ2V0IGNlbnRzKCk6IG51bWJlciB7IHJldHVybiAxMjAwICogTWF0aC5sb2cyKHRoaXMucmF0aW8udmFsdWVPZigpKTsgfVxuICBnZXQgc2F2YXJ0cygpOiBudW1iZXIgeyByZXR1cm4gMTAwMCAqIE1hdGgubG9nMTAodGhpcy5yYXRpby52YWx1ZU9mKCkpOyB9XG4gIGRpZmZlcmVuY2UocmVmZXJlbmNlOiBJbnRlcnZhbCk6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbCh0aGlzLnJhdGlvLmRpdihyZWZlcmVuY2UucmF0aW8pKTsgfVxuICBzdGF0aWMgZnJvbVJhdGlvKHJhdGlvOiBzdHJpbmcpOiBJbnRlcnZhbCB7IHJldHVybiBuZXcgSW50ZXJ2YWwobmV3IEZyYWN0aW9uKHJhdGlvKSk7IH1cbiAgc3RhdGljIGZyb21DZW50cyhjZW50czogbnVtYmVyKTogSW50ZXJ2YWwgeyByZXR1cm4gbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbihNYXRoLnBvdygyLCBjZW50cyAvIDEyMDApKSk7IH1cbiAgc3RhdGljIGZyb21TYXZhcnRzKHNhdmFydHM6IG51bWJlcik6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oTWF0aC5wb3coMTAsIHNhdmFydHMgLyAxMDAwKSkpOyB9XG4gIHN0YXRpYyBjb21wYXJlKGE6IEludGVydmFsLCBiOiBJbnRlcnZhbCk6IG51bWJlciB7IHJldHVybiBhLnJhdGlvLmNvbXBhcmUoYi5yYXRpbyk7IH1cbiAgc3RhdGljIEpORDogSW50ZXJ2YWwgPSBJbnRlcnZhbC5mcm9tQ2VudHMoNSk7IC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0p1c3Qtbm90aWNlYWJsZV9kaWZmZXJlbmNlXG59XG4iLCJpbXBvcnQgRnJhY3Rpb24gZnJvbSAnZnJhY3Rpb24uanMnO1xuaW1wb3J0IHsgYmluYXJ5U2VhcmNoLCBmbGlwRnJhY3Rpb24sIG1vZCB9IGZyb20gJy4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uIH0gZnJvbSAnLi91dGlscy9Bbm5vdGF0aW9uJztcbmltcG9ydCB7IEludGVydmFsIH0gZnJvbSAnLi9JbnRlcnZhbCc7XG5cbi8qKlxuICogVFVOSU5HIFNZU1RFTVxuICpcbiAqIEdpdmVuIGEgcmVmZXJlbmNlIHRvbmUgYW5kIGEgdGFyZ2V0IHRvbmUsIGEgdHVuaW5nIHJldHVybnMgdGhlIHJhdGlvIGJldHdlZW4gdGhlbS5cbiAqXG4gKiBUaGUgZnVuZGFtZW50YWwgaW50ZXJ2YWwgaXMgMi8xIGJldHdlZW4gdGhlIGJhc2UgdG9uZSBhbmQgaXRzIG9jdGF2ZS5cbiAqIE90aGVyIHRvbmVzIHN1YmRpdmlkZSB0aGUgb2N0YXZlIGludGVydmFsLiBBIGZpbml0ZSBudW1iZXIgb2YgdG9uZXMgTiBtYWtlIHVwIHRoZSB0dW5pbmcuXG4gKiBUb25lcyBhcmUgaW5kZXhlZCBhY2NvcmRpbmcgdG8gdGhlaXIgcmFuayBpbiB0aGUgb3JkZXJlZCBzZXF1ZW5jZSBvZiByYXRpb3NcbiAqIHRvbmUgMCA9PiByYXRpbyAxICh1bmlzb24pXG4gKiB0b25lIDEgPT4gcmF0aW8gMS5hYmMgKGZpcnN0IGludGVydmFsKVxuICogdG9uZSAyID0+IHJhdGlvIDEuZGVmIChzZWNvbmQgaW50ZXJ2YWwpXG4gKiAuLi5cbiAqIHRvbmUgTi0yID0+IHJhdGlvIDEueHl6IChuZXh0LXRvLWxhc3QgaW50ZXJ2YWwpXG4gKiB0b25lIE4tMSA9PiByYXRpbyAyIChvY3RhdmUpXG4gKlxuICogVG9uZXMgY2FuIGV4dGVuZCBiZXlvbmQgdGhlIG9jdGF2ZVxuICogZS5nLiB0b25lIE4rMSBpcyBlcXVpdmFsZW50IHRvIHRvbmUgMSwgYnV0IG9uZSBvY3RhdmUgaGlnaGVyLlxuICogSW4gYWRkaXRpb24gdG8gcmVwcmVzZW50aW5nIGEgdG9uZSBhcyBhYm92ZSwgd2UgY2FuIHJlcHJlc2VudCBpdCBieSBpdHMgXCJnZW5lcmF0b3JcIjpcbiAqIC0gaXRzIHBpdGNoIGNsYXNzIHBjIOKIiCBbMCwgTi0xXVxuICogLSBpdHMgb2N0YXZlIG8g4oiIIOKEpFxuICogc3VjaCB0aGF0IHQgPSBwYyh0KSArIE4gKiBvKHQpXG4gKi9cbmV4cG9ydCBjbGFzcyBUdW5pbmcge1xuICAvKipcbiAgICogQ09OU1RSVUNUT1JcbiAgICpcbiAgICogQHBhcmFtIGludGVydmFsczogdHVuaW5nIGludGVydmFsc1xuICAgKiBUaGUgaW50ZXJ2YWxzIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBiZSBzb3J0ZWQuXG4gICAqIFRoZSBmaXJzdCBpbnRlcnZhbCB3aWxsIGJlIF9ndWFyYW50ZWVkXyB0byBiZSB0aGUgdW5pc29uLlxuICAgKiBUaGUgbGFzdCBpbnRlcnZhbCB3aWxsIGJlIF9hc3N1bWVkXyB0byBiZSB0aGUgcmVwZWF0ZXIgKGUuZy4gMi8xIHRoZSBvY3RhdmUpLlxuICAgKiBAcGFyYW0gYW5ub3RhdGlvbnM6IG5vdGVzIGFib3V0IHRoZSB0dW5pbmdcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbnRlcnZhbHM6IEludGVydmFsW10sIHB1YmxpYyBhbm5vdGF0aW9uczogQW5ub3RhdGlvbltdID0gW10pIHtcbiAgICB0aGlzLmludGVydmFscy5zb3J0KEludGVydmFsLmNvbXBhcmUpO1xuICAgIGlmICh0aGlzLmludGVydmFsc1swXS5yYXRpby52YWx1ZU9mKCkgIT0gMSkge1xuICAgICAgdGhpcy5pbnRlcnZhbHMgPSBbbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbigxKSksIC4uLnRoaXMuaW50ZXJ2YWxzXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgdHVuaW5nIGZyb20gcmF0aW9zIG9yIGNlbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gaW50ZXJ2YWxzOiBhbiBhcnJheSBvZiByYXRpb3MgZXhwcmVzc2VkIGFzIHN0cmluZ3MsIG9yIGNlbnRzIGV4cHJlc3NlZCBhcyBudW1iZXJzXG4gICAqIEBwYXJhbSBhbm5vdGF0aW9uczogYXMgcGVyIGNvbnN0cnVjdG9yXG4gICAqIEByZXR1cm5zIHR1bmluZyBvYmplY3RcbiAgICovXG4gIHN0YXRpYyBmcm9tSW50ZXJ2YWxzKGludGVydmFsczogKG51bWJlcnxzdHJpbmcpW10sIGFubm90YXRpb25zOiBBbm5vdGF0aW9uW10gPSBbXSk6IFR1bmluZyB7XG4gICAgcmV0dXJuIG5ldyBUdW5pbmcoaW50ZXJ2YWxzLm1hcChpbnRlcnZhbCA9PiB7XG4gICAgICBpZiAodHlwZW9mIGludGVydmFsID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50ZXJ2YWwobmV3IEZyYWN0aW9uKGludGVydmFsKSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEludGVydmFsLmZyb21DZW50cyhpbnRlcnZhbCk7XG4gICAgICB9XG4gICAgfSksIGFubm90YXRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJUyBBIFRVTklORyBUUkFOU1BPU0FCTEU/XG4gICAqXG4gICAqIEEgdHVuaW5nIGlzIGZ1bGx5IHRyYW5zcG9zYWJsZSBpZiBhbGwgb2YgaXRzIGludGVydmFsIGRpZmZlcmVuY2VzIGFyZSBlcXVhbC5cbiAgICogV2Ugd2lsbCBjb25zaWRlciBlcXVhbGl0eSB0byBiZSB3aXRoaW4gdGhlIHJhbmdlIG9mIHRoZSBcImp1c3Qgbm90aWNlYWJsZVwiIGludGVydmFsICg1IGNlbnRzKS5cbiAgICovXG4gIHByaXZhdGUgX3RyYW5zcG9zYWJsZTogYm9vbGVhbjtcbiAgZ2V0IHRyYW5zcG9zYWJsZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fdHJhbnNwb3NhYmxlICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLl90cmFuc3Bvc2FibGU7XG5cbiAgICBjb25zdCBmaXJzdDogSW50ZXJ2YWwgPSB0aGlzLmludGVydmFsc1sxXS5kaWZmZXJlbmNlKHRoaXMuaW50ZXJ2YWxzWzBdKTtcbiAgICByZXR1cm4gKHRoaXMuX3RyYW5zcG9zYWJsZSA9IHRoaXMuaW50ZXJ2YWxzLnNsaWNlKDEpLmV2ZXJ5KCh2LCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXh0OiBJbnRlcnZhbCA9IHYuZGlmZmVyZW5jZSh0aGlzLmludGVydmFsc1tpXSk7XG4gICAgICBjb25zdCBkaWZmOiBJbnRlcnZhbCA9IG5ldyBJbnRlcnZhbChmbGlwRnJhY3Rpb24obmV4dC5kaWZmZXJlbmNlKGZpcnN0KS5yYXRpbywgdHJ1ZSkpO1xuICAgICAgcmV0dXJuIGRpZmYucmF0aW8uY29tcGFyZShJbnRlcnZhbC5KTkQucmF0aW8pIDwgMDtcbiAgICB9KSk7XG4gIH1cblxuICAvKipcbiAgICogU1RFUFMgT0YgQSBUVU5JTkdcbiAgICpcbiAgICogQHJldHVybnMgY291bnQgb2YgdG9uZXMgaW4gdGhlIHR1bmluZ1xuICAgKi9cbiAgZ2V0IHN0ZXBzKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWxzLmxlbmd0aCAtIDE7XG4gIH1cblxuICAvKipcbiAgICogT0NUQVZFIE9GIEEgVFVOSU5HXG4gICAqXG4gICAqIEByZXR1cm5zIHRoZSBsYXN0IGludGVydmFsIGluIHRoZSB0dW5pbmcsIHdoaWNoIGlzIGNvbnNpZGVyZWQgdG8gYmUgdGhlIG9jdGF2ZVxuICAgKi9cbiAgZ2V0IG9jdGF2ZSgpOiBJbnRlcnZhbCB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJ2YWxzW3RoaXMuc3RlcHNdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRVTkUgQSBUT05FXG4gICAqXG4gICAqIEBwYXJhbSB0b25lOiB0b25lIHRvIGJlIHR1bmVkXG4gICAqIEByZXR1cm5zIGZyZXF1ZW5jeSByYXRpbyBvZiB0aGUgdG9uZSB3aXRoIHJlc3BlY3QgdG8gcm9vdCB0b25lXG4gICAqL1xuICB0dW5lKHRvbmU6IFR1bmluZ1RvbmUpOiBJbnRlcnZhbCB7XG4gICAgLy8gR2V0IHRoZSByYXRpbyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHRhcmdldCB0b25lIGFuZCB0aGUgcm9vdCB0b25lLCByYWlzZWQgdG8gdGhlIGRpZmZlcmVuY2UgaW4gb2N0YXZlLlxuICAgIC8vIFRoZSBvY3RhdmUgaXMgYWx3YXlzIHRoZSBsYXN0IHRvbmUgYXMgcGVyIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBgaW50ZXJ2YWxzYCBhcnJheS5cbiAgICByZXR1cm4gbmV3IEludGVydmFsKFxuICAgICAgdGhpcy5pbnRlcnZhbHNbdG9uZS5waXRjaENsYXNzXS5yYXRpby5tdWwodGhpcy5vY3RhdmUucmF0aW8ucG93KHRvbmUub2N0YXZlKSlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5FQVJFU1QgVE9ORVxuICAgKiBGaW5kIHRoZSBuZWFyZXN0IHRvbmUgZ2l2ZW4gYW4gaW50ZXJ2YWwgYW5kIHJldHVybiBkaWZmZXJlbmNlXG4gICAqXG4gICAqIEBwYXJhbSBpbnRlcnZhbDogdGFyZ2V0IGludGVydmFsXG4gICAqIEByZXR1cm5zIG5lYXJlc3QgdG9uZSwgaW50ZXJ2YWwgYW5kIGRpZmZlcmVuY2UgZnJvbSB0aGUgdGFyZ2V0XG4gICAqL1xuICBuZWFyZXN0KGludGVydmFsOiBJbnRlcnZhbCk6IHt0b25lOiBUdW5pbmdUb25lLCBpbnRlcnZhbDogSW50ZXJ2YWwsIGRpZmZlcmVuY2U6IEludGVydmFsfSB7XG4gICAgLy8gQnJpbmcgdGhlIGludGVydmFsIHRvIHRoZSBiYXNlIG9jdGF2ZS5cbiAgICBjb25zdCBvY3RhdmUgPSBNYXRoLmZsb29yKE1hdGgubG9nKGludGVydmFsLnJhdGlvLnZhbHVlT2YoKSkgLyBNYXRoLmxvZyh0aGlzLm9jdGF2ZS5yYXRpby52YWx1ZU9mKCkpKTtcbiAgICBjb25zdCBiYXNlID0gbmV3IEludGVydmFsKGludGVydmFsLnJhdGlvLmRpdih0aGlzLm9jdGF2ZS5yYXRpby5wb3cob2N0YXZlKSkpO1xuXG4gICAgLy8gU2VhcmNoIHRocm91Z2ggdGhlIGludGVydmFscyB0byBsb2NhdGUgdGhlIG5lYXJlc3QuXG4gICAgY29uc3QgbiA9IGJpbmFyeVNlYXJjaCh0aGlzLmludGVydmFscywgYmFzZSwgSW50ZXJ2YWwuY29tcGFyZSk7XG4gICAgaWYgKG4gPj0gMCkge1xuICAgICAgLy8gRXhhY3QgbWF0Y2g6IHJldHVybiB0aGUgcGl0Y2ggYXQgdGhlIHJpZ2h0IG9jdGF2ZS5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRvbmU6IG5ldyBUdW5pbmdUb25lKHRoaXMsIG4sIG9jdGF2ZSksXG4gICAgICAgIGludGVydmFsLFxuICAgICAgICBkaWZmZXJlbmNlOiBuZXcgSW50ZXJ2YWwobmV3IEZyYWN0aW9uKDEpKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQYXJ0aWFsIG1hdGNoOiBmaW5kIHJlYWwgbmVhcmVzdCBiZXR3ZWVuIGluc2VydGlvbiBwb2ludCBhbmQgcHJldmlvdXMuXG4gICAgICAvLyBXZSdyZSBndWFyYW50ZWVkIHRvIGZpbmQgYSBwcmV2aW91cyB2YWx1ZSBiZWNhdXNlIHRoZSBmaXJzdCB2YWx1ZSBpcyBhbHdheXMgdW5pc29uLlxuICAgICAgY29uc3QgbSA9IH5uO1xuICAgICAgY29uc3QgbG93ZXIgPSBNYXRoLmFicyh0aGlzLmludGVydmFsc1ttLTFdLmRpZmZlcmVuY2UoYmFzZSkuY2VudHMpO1xuICAgICAgY29uc3QgdXBwZXIgPSBNYXRoLmFicyh0aGlzLmludGVydmFsc1ttXS5kaWZmZXJlbmNlKGJhc2UpLmNlbnRzKTtcbiAgICAgIGNvbnN0IG5lYXJlc3QgPSBsb3dlciA8IHVwcGVyID8gbS0xIDogbTtcbiAgICAgIGNvbnN0IG5lYXJlc3RUb25lID0gbmV3IFR1bmluZ1RvbmUodGhpcywgbmVhcmVzdCwgb2N0YXZlKTtcbiAgICAgIGNvbnN0IG5lYXJlc3RJbnRlcnZhbCA9IHRoaXMudHVuZShuZWFyZXN0VG9uZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b25lOiBuZWFyZXN0VG9uZSxcbiAgICAgICAgaW50ZXJ2YWw6IG5lYXJlc3RJbnRlcnZhbCxcbiAgICAgICAgZGlmZmVyZW5jZTogbmVhcmVzdEludGVydmFsLmRpZmZlcmVuY2UoaW50ZXJ2YWwpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVRVUFMIERJVklTSU9OUyBPRiBUSEUgT0NUQVZFLlxuICAgKlxuICAgKiBHZW5lcmF0ZSBhbiBpbnRlcnZhbHMgYXJyYXkgYmFzZWQgb24gZXF1YWwgZGl2aXNpb25zIG9mIHRoZSBvY3RhdmUuXG4gICAqIFRoZSBpbnRlcnZhbHMgYXJlIGNhbGN1bGF0ZWQgaW4gY2VudHMsIGJlY2F1c2UgdGhleSB3aWxsIGJlIGNvbnZlcnRlZCB0byByYXRpb3NcbiAgICogaW5zaWRlIHRoZSBUdW5pbmcgY29uc3RydWN0b3IuXG4gICAqL1xuICBzdGF0aWMgaW50ZXJ2YWxzRWRvKGRpdmlzaW9uczogbnVtYmVyKTogSW50ZXJ2YWxbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oQXJyYXkoZGl2aXNpb25zICsgMSkpLm1hcCgoXywgaSkgPT4ge1xuICAgICAgcmV0dXJuIEludGVydmFsLmZyb21DZW50cygxMjAwIC8gZGl2aXNpb25zICogaSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUb25lIGluIGEgdHVuaW5nLlxuICovXG5leHBvcnQgY2xhc3MgVHVuaW5nVG9uZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0dW5pbmc6IFR1bmluZywgcHVibGljIHBpdGNoQ2xhc3M6IG51bWJlciwgcHVibGljIG9jdGF2ZTogbnVtYmVyKSB7fVxuXG4gIGdldCBwaXRjaCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBpdGNoQ2xhc3MgKyB0aGlzLm9jdGF2ZSAqIHRoaXMudHVuaW5nLnN0ZXBzO1xuICB9XG5cbiAgc3RhdGljIGZyb21QaXRjaCh0dW5pbmc6IFR1bmluZywgcGl0Y2g6IG51bWJlcik6IFR1bmluZ1RvbmUge1xuICAgIHJldHVybiBuZXcgVHVuaW5nVG9uZSh0dW5pbmcsIG1vZChwaXRjaCwgdHVuaW5nLnN0ZXBzKSwgTWF0aC5mbG9vcihwaXRjaCAvIHR1bmluZy5zdGVwcykpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBUdW5pbmcsIFR1bmluZ1RvbmUgfSBmcm9tICcuL1R1bmluZyc7XG5pbXBvcnQgeyBlc2NhcGVSZWdFeHAsIG1vZCB9IGZyb20gJy4vdXRpbHMvaGVscGVycyc7XG5pbXBvcnQgeyBNdWx0aW1hcCB9IGZyb20gJy4vdXRpbHMvQmltYXAnO1xuXG4vKipcbiAqIE5PTUVOQ0xBVFVSRSBTWVNURU1cbiAqXG4gKiBUbyBuYW1lIG5vdGVzLCB3ZSB1c2UgYSBjb21tb24gcmVwcmVzZW50YXRpb24gYmFzZWQgb24gU2NpZW50aWZpYyBQaXRjaCBOb3RhdGlvbiAoU1BOKTpcbiAqIC0gU3RhbmRhcmQgbm90ZSBsZXR0ZXJzIEMsIEQsIEUsIEYsIEcsIEEsIEJcbiAqIC0gQW4gZXh0ZW5zaWJsZSBzZXQgb2YgYWNjaWRlbnRhbHNcbiAqIC0gVGhlIG9jdGF2ZSBzcGVjaWZpY2F0aW9uXG4gKlxuICogV2UgZGVmaW5lIGEgdHVuaW5nIG5vdGF0aW9uIG1hcCB0aGF0IGRlZmluZXMgaG93IG5vdGVzIGFuZCBhY2NpZGVudGFscyBtYXAgdG8gdHVuaW5nIHRvbmVzL3BpdGNoZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUdW5pbmdOb3RhdGlvbiB7XG4gIHJlZ2V4OiBSZWdFeHA7XG5cbiAgLyoqXG4gICAqIENPTlNUUlVDVE9SXG4gICAqXG4gICAqIEBwYXJhbSB0dW5pbmc6IHRoZSB0dW5pbmcgYmVpbmcgbm90YXRlZFxuICAgKiBAcGFyYW0gbWFwOiB0aGUgbm90YXRpb24gbWFwIHRoYXQgbWFwcyBldmVyeSBub3RlIGxldHRlciArIGFjY2lkZW50YWwgY29tYmluYXRpb24gdG8gdGhlIHR1bmluZyB0b25lXG4gICAqICAgICAgICAtIGRpZmZlcmVudCBub3RlIG5hbWVzIHRoYXQgbWFwIHRvIHRoZSBzYW1lIGluZGV4IChlLmcuIEMjID0gRGIgPT4gMSkgc2hvdWxkIGhhdmUgc2VwYXJhdGUgZW50cmllc1xuICAgKiAgICAgICAgLSBkb24ndCBpbmNsdWRlIG9jdGF2ZSBudW1iZXJzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHVuaW5nOiBUdW5pbmcsIHB1YmxpYyBtYXA6IE11bHRpbWFwPHN0cmluZywgbnVtYmVyPikge1xuICAgIHRoaXMucmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICAgJ14oJyArIEFycmF5LmZyb20odGhpcy5tYXAua2V5cygpKS5tYXAoZXNjYXBlUmVnRXhwKS5qb2luKCd8JykgKyAnKScgK1xuICAgICAgJygtP1xcXFxkKSQnLFxuICAgICAgJ2knXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCVUlMRCBBIE1BUCBCWSBDT01CSU5JTkcgTk9URVMgQU5EIEFDQ0lERU5UQUxTXG4gICAqXG4gICAqIEBwYXJhbSB0dW5pbmc6IGFzIHBlciBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0gbm90ZXM6IG1hcCBvZiBub3RlIGxldHRlcnMgdG8gdG9uZSBpbmRleGVzOlxuICAgKiBgYGBcbiAgICoge1xuICAgKiAgICdDJzogMCxcbiAgICogICAnRCc6IDIsXG4gICAqICAgJ0UnOiA0LFxuICAgKiAgICdGJzogNSxcbiAgICogICAnRyc6IDcsXG4gICAqICAgJ0EnOiA5LFxuICAgKiAgICdCJzogMTEsXG4gICAqIH1cbiAgICogQHBhcmFtIGFjY2lkZW50YWxzOiBtYXAgb2Ygbm90ZSBhY2NpZGVudGFscyB0byB0b25lIGluY3JlbWVudHM6XG4gICAqIGBgYFxuICAgKiB7XG4gICAqICAgJyMnOiArMSxcbiAgICogICAnYic6IC0xLFxuICAgKiAgICduJzogIDAsXG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgZnJvbU5vdGVzQWNjaWRlbnRhbHNDb21iaW5hdGlvbihcbiAgICB0dW5pbmc6IFR1bmluZyxcbiAgICBub3Rlczoge1tub3RlOiBzdHJpbmddOiBudW1iZXJ9LFxuICAgIGFjY2lkZW50YWxzOiB7W2FjY2lkZW50YWw6IHN0cmluZ106IG51bWJlcn1cbiAgKTogVHVuaW5nTm90YXRpb24ge1xuICAgIGNvbnN0IG1hcCA9IG5ldyBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChub3RlID0+IHtcbiAgICAgIG1hcC5zZXQoYCR7bm90ZX1gLCBub3Rlc1tub3RlXSk7XG4gICAgICBPYmplY3Qua2V5cyhhY2NpZGVudGFscykuZm9yRWFjaChhY2NpZGVudGFsID0+IHtcbiAgICAgICAgbWFwLnNldChgJHtub3RlfSR7YWNjaWRlbnRhbH1gLCBtb2Qobm90ZXNbbm90ZV0gKyBhY2NpZGVudGFsc1thY2NpZGVudGFsXSwgdHVuaW5nLnN0ZXBzKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFR1bmluZ05vdGF0aW9uKHR1bmluZywgbWFwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOQU1FIEEgVE9ORVxuICAgKlxuICAgKiBAcGFyYW0gdG9uZTogdG9uZSB0byBiZSBuYW1lZFxuICAgKiBAcmV0dXJucyBhcnJheSBvZiBzdHJpbmdzIHJlcHJlc2VudGluZyB0aGUgZW5oYXJtb25pYyBuYW1pbmdzIG9mIHRoZSB0b25lXG4gICAqL1xuICBuYW1lKHRvbmU6IFR1bmluZ1RvbmUpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLm1hcC5nZXRLZXkodG9uZS5waXRjaENsYXNzKV0ubWFwKG4gPT4gYCR7bn0ke3RvbmUub2N0YXZlfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBBUlNFIEEgTk9URVxuICAgKlxuICAgKiBAcGFyYW0gbm90ZTogdGFyZ2V0IG5vdGUgaW4gc2NpZW50aWZpYyBwaXRjaCBub3RhdGlvblxuICAgKiBAcmV0dXJucyB0b25lIGdlbmVyYXRvclxuICAgKi9cbiAgcGFyc2Uobm90ZTogc3RyaW5nKTogVHVuaW5nVG9uZSB7XG4gICAgY29uc3QgbWF0Y2ggPSB0aGlzLnJlZ2V4LmV4ZWMobm90ZSk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBbVHVuaW5nTm90YXRpb24ucGFyc2VdIENvdWxkIG5vdCBwYXJzZSBub3RlICR7bm90ZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUdW5pbmdUb25lKHRoaXMudHVuaW5nLCB0aGlzLm1hcC5nZXQobWF0Y2hbMV0pLCBwYXJzZUludChtYXRjaFsyXSwgMTApKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9UdW5pbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9UdW5pbmdOb3RhdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL0ludGVydmFsJztcbiIsIi8qKlxuICogQklESVJFQ1RJT05BTCBNQVBcbiAqXG4gKiBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL1Rob21hc1Jvb25leS90eXBlZC1iaS1kaXJlY3Rpb25hbC1tYXBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJQmltYXA8SywgVj4gZXh0ZW5kcyBNYXA8SywgVj4ge1xuICByZWFkb25seSBzaXplOiBudW1iZXI7IC8vIHJldHVybnMgdGhlIHRvdGFsIG51bWJlciBvZiBlbGVtZW50c1xuICBnZXQ6IChrZXk6IEspID0+IFYgfCB1bmRlZmluZWQ7IC8vIHJldHVybnMgYSBzcGVjaWZpZWQgZWxlbWVudFxuICBnZXRLZXk6ICh2YWx1ZTogVikgPT4gSyB8IEtbXSB8IHVuZGVmaW5lZDsgLy8gcmV0dXJucyBhIHNwZWNpZmllZCBlbGVtZW50XG4gIGdldFZhbHVlOiAoa2V5OiBLKSA9PiBWIHwgdW5kZWZpbmVkOyAvLyByZXR1cm5zIGEgc3BlY2lmaWVkIGVsZW1lbnRcbiAgc2V0OiAoa2V5OiBLLCB2YWx1ZTogVikgPT4gdGhpczsgLy8gYWRkcyBvciB1cGRhdGVzIHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGxvb2tlZCB1cCB2aWEgdGhlIHNwZWNpZmllZCBrZXlcbiAgc2V0VmFsdWU6IChrZXk6IEssIHZhbHVlOiBWKSA9PiB0aGlzOyAvLyBhZGRzIG9yIHVwZGF0ZXMgdGhlIGtleSBvZiBhbiBlbGVtZW50IGxvb2tlZCB1cCB2aWEgdGhlIHNwZWNpZmllZCB2YWx1ZVxuICBzZXRLZXk6ICh2YWx1ZTogViwga2V5OiBLKSA9PiB0aGlzOyAvLyBhZGRzIG9yIHVwZGF0ZXMgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgbG9va2VkIHVwIHZpYSB0aGUgc3BlY2lmaWVkIGtleVxuICBjbGVhcjogKCkgPT4gdm9pZDsgLy8gcmVtb3ZlcyBhbGwgZWxlbWVudHNcbiAgZGVsZXRlOiAoa2V5OiBLKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCBleGlzdGVkIGFuZCBoYXMgYmVlbiByZW1vdmVkLCBvciBmYWxzZSBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdC5cbiAgZGVsZXRlS2V5OiAoa2V5OiBLKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCBleGlzdGVkIGFuZCBoYXMgYmVlbiByZW1vdmVkLCBvciBmYWxzZSBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBleGlzdC5cbiAgZGVsZXRlVmFsdWU6ICh2YWx1ZTogVikgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgZXhpc3RlZCBhbmQgaGFzIGJlZW4gcmVtb3ZlZCwgb3IgZmFsc2UgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QuXG4gIGZvckVhY2g6IChcbiAgICBjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBJQmltYXA8SywgVj4pID0+IHZvaWQsXG4gICAgdGhpc0FyZz86IGFueVxuICApID0+IHZvaWQ7IC8vIGV4ZWN1dGVzIHRoZSBwcm92aWRlZCBjYWxsYmFjayBvbmNlIGZvciBlYWNoIGtleSBvZiB0aGUgbWFwXG4gIGhhczogKGtleTogSykgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBleGlzdHM7IG90aGVyd2lzZSBmYWxzZS5cbiAgaGFzS2V5OiAoa2V5OiBLKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGV4aXN0czsgb3RoZXJ3aXNlIGZhbHNlLlxuICBoYXNWYWx1ZTogKHZhbHVlOiBWKSA9PiBib29sZWFuOyAvLyBSZXR1cm5zIHRydWUgaWYgYW4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgdmFsdWUgZXhpc3RzOyBvdGhlcndpc2UgZmFsc2UuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddOiAnTWFwJzsgLy8gQW55dGhpbmcgaW1wbGVtZW50aW5nIE1hcCBtdXN0IGFsd2F5cyBoYXZlIHRvU3RyaW5nVGFnIGRlY2xhcmVkIHRvIGJlICdNYXAnLiBJIGNvbnNpZGVyIHRoaXMgYSBsaXR0bGUgc2lsbHkuXG4gIGluc3BlY3Q6ICgpID0+IHN0cmluZzsgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIGluc3BlY3QgY3VycmVudCBjb250ZW50cyBhcyBhIHN0cmluZ1xufVxuXG4vKipcbiAqIEJpbWFwIHdpdGhvdXQgZHVwbGljYXRlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJpbWFwPEssIFY+IGltcGxlbWVudHMgSUJpbWFwPEssIFY+IHtcbiAgcHJvdGVjdGVkIGtleVZhbHVlTWFwOiBNYXA8SywgVj4gPSBuZXcgTWFwPEssIFY+KCk7XG4gIHByb3RlY3RlZCB2YWx1ZUtleU1hcDogTWFwPFYsIEs+ID0gbmV3IE1hcDxWLCBLPigpO1xuXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMua2V5VmFsdWVNYXAuc2l6ZTtcbiAgfVxuXG4gIHB1YmxpYyBbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ01hcCc7XG4gIHB1YmxpYyBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+ID0gdGhpcy5rZXlWYWx1ZU1hcFtTeW1ib2wuaXRlcmF0b3JdO1xuXG4gIHB1YmxpYyBlbnRyaWVzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiA9PiB0aGlzLmtleVZhbHVlTWFwLmVudHJpZXMoKTtcbiAgcHVibGljIGtleXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxLPiA9PiB0aGlzLmtleVZhbHVlTWFwLmtleXMoKTtcbiAgcHVibGljIHZhbHVlcyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPFY+ID0+IHRoaXMua2V5VmFsdWVNYXAudmFsdWVzKCk7XG5cbiAgcHVibGljIGdldCA9IChhOiBLKTogViB8IHVuZGVmaW5lZCA9PiB0aGlzLmtleVZhbHVlTWFwLmdldChhKTtcbiAgcHVibGljIGdldEtleSA9IChiOiBWKTogSyB8IHVuZGVmaW5lZCA9PiB0aGlzLnZhbHVlS2V5TWFwLmdldChiKTtcbiAgcHVibGljIGdldFZhbHVlID0gKGE6IEspOiBWIHwgdW5kZWZpbmVkID0+IHRoaXMuZ2V0KGEpO1xuICBwdWJsaWMgc2V0ID0gKGtleTogSywgdmFsdWU6IFYpOiB0aGlzID0+IHtcbiAgICAvLyBNYWtlIHN1cmUgbm8gZHVwbGljYXRlcy4gT3VyIGNvbmZsaWN0IHNjZW5hcmlvIGlzIGhhbmRsZWQgYnkgZGVsZXRpbmcgcG90ZW50aWFsIGR1cGxpY2F0ZXMsIGluIGZhdm91ciBvZiB0aGUgY3VycmVudCBhcmd1bWVudHNcbiAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgIHRoaXMuZGVsZXRlVmFsdWUodmFsdWUpO1xuXG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgdGhpcy52YWx1ZUtleU1hcC5zZXQodmFsdWUsIGtleSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcHVibGljIHNldEtleSA9ICh2YWx1ZTogViwga2V5OiBLKTogdGhpcyA9PiB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgcHVibGljIHNldFZhbHVlID0gKGtleTogSywgdmFsdWU6IFYpOiB0aGlzID0+IHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICBwdWJsaWMgY2xlYXIgPSAoKTogdm9pZCA9PiB7XG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5jbGVhcigpO1xuICAgIHRoaXMudmFsdWVLZXlNYXAuY2xlYXIoKTtcbiAgfTtcbiAgcHVibGljIGRlbGV0ZSA9IChrZXk6IEspOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmtleVZhbHVlTWFwLmdldChrZXkpIGFzIFY7XG4gICAgICB0aGlzLmtleVZhbHVlTWFwLmRlbGV0ZShrZXkpO1xuICAgICAgdGhpcy52YWx1ZUtleU1hcC5kZWxldGUodmFsdWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgcHVibGljIGRlbGV0ZUtleSA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMuZGVsZXRlKGtleSk7XG4gIHB1YmxpYyBkZWxldGVWYWx1ZSA9ICh2YWx1ZTogVik6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLmhhc1ZhbHVlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKHRoaXMudmFsdWVLZXlNYXAuZ2V0KHZhbHVlKSBhcyBLKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBwdWJsaWMgZm9yRWFjaCA9IChcbiAgICBjYWxsYmFja2ZuOiAodmFsdWU6IFYsIGtleTogSywgbWFwOiBJQmltYXA8SywgVj4pID0+IHZvaWQsXG4gICAgdGhpc0FyZz86IGFueVxuICApOiB2b2lkID0+IHtcbiAgICB0aGlzLmtleVZhbHVlTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNhbGxiYWNrZm4uYXBwbHkodGhpc0FyZywgW3ZhbHVlLCBrZXksIHRoaXNdKTtcbiAgICB9KTtcbiAgfTtcbiAgcHVibGljIGhhcyA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMua2V5VmFsdWVNYXAuaGFzKGtleSk7XG4gIHB1YmxpYyBoYXNLZXkgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmhhcyhrZXkpO1xuICBwdWJsaWMgaGFzVmFsdWUgPSAodmFsdWU6IFYpOiBib29sZWFuID0+IHRoaXMudmFsdWVLZXlNYXAuaGFzKHZhbHVlKTtcbiAgcHVibGljIGluc3BlY3QgPSAoKTogc3RyaW5nID0+IHtcbiAgICBsZXQgc3RyID0gJ0JpbWFwIHsnO1xuICAgIGxldCBlbnRyeSA9IDA7XG4gICAgdGhpcy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBlbnRyeSsrO1xuICAgICAgc3RyICs9ICcnICsga2V5LnRvU3RyaW5nKCkgKyAnID0+ICcgKyB2YWx1ZS50b1N0cmluZygpICsgJyc7XG4gICAgICBpZiAoZW50cnkgPCB0aGlzLnNpemUpIHtcbiAgICAgICAgc3RyICs9ICcsICc7XG4gICAgICB9XG4gICAgfSk7XG4gICAgc3RyICs9ICd9JztcbiAgICByZXR1cm4gc3RyO1xuICB9O1xufVxuXG4vKipcbiAqIEJpbWFwIHdpdGggbXVsdGlwbGUgdmFsdWVzIHBlciBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBNdWx0aW1hcDxLLCBWPiBpbXBsZW1lbnRzIElCaW1hcDxLLCBWPiB7XG4gIHByb3RlY3RlZCBrZXlWYWx1ZU1hcDogTWFwPEssIFY+ID0gbmV3IE1hcDxLLCBWPigpO1xuICBwcm90ZWN0ZWQgdmFsdWVLZXlNYXA6IE1hcDxWLCBLW10+ID0gbmV3IE1hcDxWLCBLW10+KCk7XG5cbiAgZ2V0IHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5rZXlWYWx1ZU1hcC5zaXplO1xuICB9XG5cbiAgcHVibGljIFtTeW1ib2wudG9TdHJpbmdUYWddOiAnTWFwJztcbiAgcHVibGljIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4gPSB0aGlzLmtleVZhbHVlTWFwW1N5bWJvbC5pdGVyYXRvcl07XG5cbiAgcHVibGljIGVudHJpZXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+ID0+IHRoaXMua2V5VmFsdWVNYXAuZW50cmllcygpO1xuICBwdWJsaWMga2V5cyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPEs+ID0+IHRoaXMua2V5VmFsdWVNYXAua2V5cygpO1xuICBwdWJsaWMgdmFsdWVzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Vj4gPT4gdGhpcy5rZXlWYWx1ZU1hcC52YWx1ZXMoKTtcblxuICBwdWJsaWMgZ2V0ID0gKGE6IEspOiBWIHwgdW5kZWZpbmVkID0+IHRoaXMua2V5VmFsdWVNYXAuZ2V0KGEpO1xuICBwdWJsaWMgZ2V0S2V5ID0gKGI6IFYpOiBLW10gfCB1bmRlZmluZWQgPT4gdGhpcy52YWx1ZUtleU1hcC5nZXQoYik7XG4gIHB1YmxpYyBnZXRWYWx1ZSA9IChhOiBLKTogViB8IHVuZGVmaW5lZCA9PiB0aGlzLmdldChhKTtcbiAgcHVibGljIHNldCA9IChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyA9PiB7XG4gICAgdGhpcy5kZWxldGUoa2V5KTtcbiAgICB0aGlzLmtleVZhbHVlTWFwLnNldChrZXksIHZhbHVlKTtcblxuICAgIGNvbnN0IGtleXMgPSB0aGlzLnZhbHVlS2V5TWFwLmdldCh2YWx1ZSkgfHwgW107XG4gICAgdGhpcy52YWx1ZUtleU1hcC5zZXQodmFsdWUsIFsuLi5rZXlzLCBrZXldKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwdWJsaWMgc2V0S2V5ID0gKHZhbHVlOiBWLCBrZXk6IEspOiB0aGlzID0+IHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICBwdWJsaWMgc2V0VmFsdWUgPSAoa2V5OiBLLCB2YWx1ZTogVik6IHRoaXMgPT4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIHB1YmxpYyBjbGVhciA9ICgpOiB2b2lkID0+IHtcbiAgICB0aGlzLmtleVZhbHVlTWFwLmNsZWFyKCk7XG4gICAgdGhpcy52YWx1ZUtleU1hcC5jbGVhcigpO1xuICB9O1xuICBwdWJsaWMgZGVsZXRlID0gKGtleTogSyk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLmhhcyhrZXkpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMua2V5VmFsdWVNYXAuZ2V0KGtleSkgYXMgVjtcbiAgICAgIHRoaXMua2V5VmFsdWVNYXAuZGVsZXRlKGtleSk7XG4gICAgICBjb25zdCBrZXlzID0gdGhpcy52YWx1ZUtleU1hcC5nZXQodmFsdWUpLmZpbHRlcihrID0+IGsgIT09IGtleSk7XG4gICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMudmFsdWVLZXlNYXAuc2V0KHZhbHVlLCBrZXlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWVLZXlNYXAuZGVsZXRlKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIHB1YmxpYyBkZWxldGVLZXkgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmRlbGV0ZShrZXkpO1xuICBwdWJsaWMgZGVsZXRlVmFsdWUgPSAodmFsdWU6IFYpOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5oYXNWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHRoaXMudmFsdWVLZXlNYXAuZ2V0KHZhbHVlKS5mb3JFYWNoKGtleSA9PiB7IHRoaXMuZGVsZXRlKGtleSk7IH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgcHVibGljIGZvckVhY2ggPSAoXG4gICAgY2FsbGJhY2tmbjogKHZhbHVlOiBWLCBrZXk6IEssIG1hcDogSUJpbWFwPEssIFY+KSA9PiB2b2lkLFxuICAgIHRoaXNBcmc/OiBhbnlcbiAgKTogdm9pZCA9PiB7XG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBjYWxsYmFja2ZuLmFwcGx5KHRoaXNBcmcsIFt2YWx1ZSwga2V5LCB0aGlzXSk7XG4gICAgfSk7XG4gIH07XG4gIHB1YmxpYyBoYXMgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmtleVZhbHVlTWFwLmhhcyhrZXkpO1xuICBwdWJsaWMgaGFzS2V5ID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5oYXMoa2V5KTtcbiAgcHVibGljIGhhc1ZhbHVlID0gKHZhbHVlOiBWKTogYm9vbGVhbiA9PiB0aGlzLnZhbHVlS2V5TWFwLmhhcyh2YWx1ZSk7XG4gIHB1YmxpYyBpbnNwZWN0ID0gKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHN0ciA9ICdNdWx0aW1hcCB7JztcbiAgICBsZXQgZW50cnkgPSAwO1xuICAgIHRoaXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgZW50cnkrKztcbiAgICAgIHN0ciArPSAnJyArIGtleS50b1N0cmluZygpICsgJyA9PiAnICsgdmFsdWUudG9TdHJpbmcoKSArICcnO1xuICAgICAgaWYgKGVudHJ5IDwgdGhpcy5zaXplKSB7XG4gICAgICAgIHN0ciArPSAnLCAnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHN0ciArPSAnfSc7XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcbn1cbiIsImltcG9ydCBGcmFjdGlvbiBmcm9tICdmcmFjdGlvbi5qcyc7XG5cbi8qKlxuICogRXNjYXBlIGEgc3RyaW5nIHRvIGJlIHVzZWQgaW4gcmVndWxhciBleHByZXNzaW9uLlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9SZWd1bGFyX0V4cHJlc3Npb25zXG4gKlxuICogQHBhcmFtIHN0cjogc3RyaW5nIHRvIGVzY2FwZVxuICogQHJldHVybnMgZXNjYXBlZCwgUmVnRXhwLXJlYWR5IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpOyAvLyAkJiBtZWFucyB0aGUgd2hvbGUgbWF0Y2hlZCBzdHJpbmdcbn1cblxuLyoqXG4gKiBHZXQgcHJpbWVzIHVwIHRvIGEgZ2l2ZW4gaW50ZWdlci5cbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMjI4NzU5OS8yMDkxODRcbiAqIFVzZXMgdGhlIFNpZXZlIG9mIEVyYXRvc3RoZW5lcyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TaWV2ZV9vZl9FcmF0b3N0aGVuZXNcbiAqXG4gKiBAcGFyYW0gbWF4OiBudW1iZXIgdG8gcmVhY2hcbiAqIEByZXR1cm5zIGFsbCBwcmltZXMgdXAgdG8gbWF4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmltZXMobWF4OiBudW1iZXIpOiBudW1iZXJbXSB7XG4gIGNvbnN0IHNpZXZlOiBib29sZWFuW10gPSBbXSwgcHJpbWVzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMjsgaSA8PSBtYXg7ICsraSkge1xuICAgIGlmICghc2lldmVbaV0pIHtcbiAgICAgIC8vIGkgaGFzIG5vdCBiZWVuIG1hcmtlZCAtLSBpdCBpcyBwcmltZVxuICAgICAgcHJpbWVzLnB1c2goaSk7XG4gICAgICBmb3IgKGxldCBqID0gaSA8PCAxOyBqIDw9IG1heDsgaiArPSBpKSB7XG4gICAgICAgICAgc2lldmVbal0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcHJpbWVzO1xufVxuXG4vKipcbiAqIEVuc3VyZSBhIHxmcmFjdGlvbnwgPCAxIG9yID4gMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsaXBGcmFjdGlvbihmOiBGcmFjdGlvbiwgZ3JlYXRlclRoYW5PbmUgPSBmYWxzZSk6IEZyYWN0aW9uIHtcbiAgcmV0dXJuIGdyZWF0ZXJUaGFuT25lID9cbiAgICAoZi5hYnMoKS5jb21wYXJlKDEpIDwgMCA/IGYuaW52ZXJzZSgpIDogZikgOlxuICAgIChmLmFicygpLmNvbXBhcmUoMSkgPiAwID8gZi5pbnZlcnNlKCkgOiBmKSA7XG59XG5cbi8qKlxuICogQmluYXJ5IHNlYXJjaCBpbiBhbiBhcnJheS5cbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yOTAxODc0NS8yMDkxODRcbiAqXG4gKiBAcGFyYW0gYXI6IGVsZW1lbnRzIGFycmF5IHRoYXQgaXMgc29ydGVkXG4gKiBAcGFyYW0gZWw6IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0gY29tcDogY29tcGFyaXNvbiBmdW5jdGlvbiAoYSxiKSA9PiBuIHdpdGhcbiAqICAgICAgICBuID4gMCBpZiBhID4gYlxuICogICAgICAgIG4gPCAwIGlmIGEgPCBiXG4gKiAgICAgICAgbiA9IDAgaWYgYSA9IGJcbiAqIEByZXR1cm5zIGluZGV4IG0gPj0gMCBpZiBtYXRjaCBpcyBmb3VuZCwgbSA8IDAgaWYgbm90IGZvdW5kIHdpdGggaW5zZXJ0aW9uIHBvaW50ID0gLW0tMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmFyeVNlYXJjaDxUPihhcjogUmVhZG9ubHlBcnJheTxUPiwgZWw6IFQsIGNvbXA6IChhOiBULCBiOiBUKSA9PiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgbSA9IDA7XG4gIGxldCBuID0gYXIubGVuZ3RoIC0gMTtcbiAgd2hpbGUgKG0gPD0gbikge1xuICAgIGNvbnN0IGsgPSAobiArIG0pID4+IDE7XG4gICAgY29uc3QgY21wID0gY29tcChlbCwgYXJba10pO1xuICAgIGlmIChjbXAgPiAwKSB7XG4gICAgICBtID0gayArIDE7XG4gICAgfSBlbHNlIGlmIChjbXAgPCAwKSB7XG4gICAgICBuID0gayAtIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gfm07XG59XG5cbi8qKlxuICogQ2hlY2sgYXJyYXkgZXF1YWxpdHkuXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3EvNzgzNzQ1Ni8yMDkxODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RXF1YWw8VD4oYXIxOiBSZWFkb25seUFycmF5PFQ+LCBhcjI6IFJlYWRvbmx5QXJyYXk8VD4sIGNvbXA6IChhOiBULCBiOiBUKSA9PiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBhcjEubGVuZ3RoID09PSBhcjIubGVuZ3RoICYmXG4gICAgYXIxLmV2ZXJ5KCh2YWx1ZSwgaW5kZXgpID0+IGNvbXAodmFsdWUsIGFyMltpbmRleF0pID09PSAwKVxuICApO1xufVxuXG4vKipcbiAqIFJldHVybiBhcnJheSB3aXRoIHVuaXF1ZSB2YWx1ZXMuXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTc5MDMwMTgvMjA5MTg0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheVVuaXF1ZTxUPihhcjogUmVhZG9ubHlBcnJheTxUPik6IFJlYWRvbmx5QXJyYXk8VD4ge1xuICByZXR1cm4gWy4uLm5ldyBTZXQoYXIpXTtcbn1cblxuLyoqXG4gKiBBbHdheXMtcG9zaXRpdmUgTW9kdWxvIGZ1bmN0aW9uLiBUaGUgYnVpbHQtaW4gJSBvcGVyYXRvciBjb21wdXRlcyB0aGUgUmVtYWluZGVyLlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvT3BlcmF0b3JzL1JlbWFpbmRlclxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE3MzIzNjA4LzIwOTE4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gbW9kKG46IG51bWJlciwgbTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuICgobiAlIG0pICsgbSkgJSBtO1xufVxuXG4vKipcbiAqIEFycmF5IHJhbmdlLlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEwMDUwODMxLzIwOTE4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlSYW5nZShzaXplOiBudW1iZXIsIHN0YXJ0QXQgPSAwKTogUmVhZG9ubHlBcnJheTxudW1iZXI+IHtcbiAgcmV0dXJuIFsuLi5BcnJheShzaXplKS5rZXlzKCldLm1hcChpID0+IGkgKyBzdGFydEF0KTtcbn1cbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NyZWF0ZUJpbmRpbmcobywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgcmVzdWx0W2tdID0gbW9kW2tdO1xyXG4gICAgcmVzdWx0LmRlZmF1bHQgPSBtb2Q7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHByaXZhdGVNYXApIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJpdmF0ZU1hcC5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgcHJpdmF0ZU1hcCwgdmFsdWUpIHtcclxuICAgIGlmICghcHJpdmF0ZU1hcC5oYXMocmVjZWl2ZXIpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImF0dGVtcHRlZCB0byBzZXQgcHJpdmF0ZSBmaWVsZCBvbiBub24taW5zdGFuY2VcIik7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlTWFwLnNldChyZWNlaXZlciwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=