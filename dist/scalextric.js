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

/***/ "./node_modules/jstoxml/dist/jstoxml.js":
/*!**********************************************!*\
  !*** ./node_modules/jstoxml/dist/jstoxml.js ***!
  \**********************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.toXML = _exports.default = void 0;
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  var DATA_TYPES = {
    ARRAY: 'array',
    BOOLEAN: 'boolean',
    DATE: 'date',
    FUNCTION: 'function',
    JSTOXML_OBJECT: 'jstoxml-object',
    NULL: 'null',
    NUMBER: 'number',
    OBJECT: 'object',
    STRING: 'string'
  };
  var PRIMITIVE_TYPES = [DATA_TYPES.STRING, DATA_TYPES.NUMBER, DATA_TYPES.BOOLEAN];
  var DEFAULT_XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
  var PRIVATE_VARS = ['_selfCloseTag', '_attrs'];

  /**
   * Determines the indent string based on current tree depth.
   */
  var getIndentStr = function getIndentStr() {
    var indent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return indent.repeat(depth);
  };

  /**
   * Sugar function supplementing JS's quirky typeof operator, plus some extra help to detect
   * "special objects" expected by jstoxml.
   * @example
   * getType(new Date());
   * // -> 'date'
   */
  var getType = function getType(val) {
    return Array.isArray(val) && DATA_TYPES.ARRAY || _typeof(val) === DATA_TYPES.OBJECT && val !== null && val._name && DATA_TYPES.JSTOXML_OBJECT || val instanceof Date && DATA_TYPES.DATE || val === null && DATA_TYPES.NULL || _typeof(val);
  };

  /**
   * Determines if a string is CDATA and shouldn't be touched.
   * @example
   * isCDATA('<![CDATA[<b>test</b>]]>');
   * // -> true
   */
  var isCDATA = function isCDATA(str) {
    return str.startsWith('<![CDATA[');
  };

  /**
   * Replaces matching values in a string with a new value.
   * @example
   * mapStr('foo&bar', { '&': '&amp;' });
   * // -> 'foo&amp;bar'
   */
  var mapStr = function mapStr() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var replacements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var contentMap = arguments.length > 2 ? arguments[2] : undefined;
    var output = input;
    if (_typeof(input) === DATA_TYPES.STRING) {
      if (isCDATA(input)) {
        return input;
      }
      var regexp = new RegExp("(".concat(Object.keys(replacements).join('|'), ")(?!(\\w|#)*;)"), 'g');
      output = String(input).replace(regexp, function (str, entity) {
        return replacements[entity] || '';
      });
    }
    return typeof contentMap === 'function' ? contentMap(output) : output;
  };

  /**
   * Maps an object or array of arribute keyval pairs to a string.
   * @example
   * getAttributeKeyVals({ foo: 'bar', baz: 'g' });
   * // -> 'foo="bar" baz="g"'
   * getAttributeKeyVals([ { ⚡: true }, { foo: 'bar' } ]);
   * // -> '⚡ foo="bar"'
   */
  var getAttributeKeyVals = function getAttributeKeyVals() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var replacements = arguments.length > 1 ? arguments[1] : undefined;
    var filter = arguments.length > 2 ? arguments[2] : undefined;
    var outputExplicitTrue = arguments.length > 3 ? arguments[3] : undefined;
    // Normalizes between attributes as object and as array.
    var attributesArr = Array.isArray(attributes) ? attributes : Object.entries(attributes).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        val = _ref2[1];
      return _defineProperty({}, key, val);
    });
    return attributesArr.reduce(function (allAttributes, attr) {
      var key = Object.keys(attr)[0];
      var val = attr[key];
      if (_typeof(filter) === DATA_TYPES.FUNCTION) {
        var shouldFilterOut = filter(key, val);
        if (shouldFilterOut) {
          return allAttributes;
        }
      }
      var replacedVal = replacements ? mapStr(val, replacements) : val;
      var valStr = !outputExplicitTrue && replacedVal === true ? '' : "=\"".concat(replacedVal, "\"");
      allAttributes.push("".concat(key).concat(valStr));
      return allAttributes;
    }, []);
  };

  /**
   * Converts an attributes object/array to a string of keyval pairs.
   * @example
   * formatAttributes({ a: 1, b: 2 })
   * // -> 'a="1" b="2"'
   */
  var formatAttributes = function formatAttributes() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var replacements = arguments.length > 1 ? arguments[1] : undefined;
    var filter = arguments.length > 2 ? arguments[2] : undefined;
    var outputExplicitTrue = arguments.length > 3 ? arguments[3] : undefined;
    var keyVals = getAttributeKeyVals(attributes, replacements, filter, outputExplicitTrue);
    if (keyVals.length === 0) return '';
    var keysValsJoined = keyVals.join(' ');
    return " ".concat(keysValsJoined);
  };

  /**
   * Converts an object into an array of jstoxml-object.
   * @example
   * objToArray({ foo: 'bar', baz: 2 });
   * ->
   * [
   *   {
   *     _name: 'foo',
   *     _content: 'bar'
   *   },
   *   {
   *     _name: 'baz',
   *     _content: 2
   *   }
   * ]
   */
  var objToArray = function objToArray() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Object.keys(obj).map(function (key) {
      return {
        _name: key,
        _content: obj[key]
      };
    });
  };

  /**
   * Determines if a value is a primitive JavaScript value (not including Symbol).
   * @example
   * isPrimitive(4);
   * // -> true
   */
  var isPrimitive = function isPrimitive(val) {
    return PRIMITIVE_TYPES.includes(getType(val));
  };

  /**
   * Determines if an XML string is simple (doesn't contain nested XML data).
   * @example
   * isSimpleXML('<foo />');
   * // -> false
   */
  var isSimpleXML = function isSimpleXML(xmlStr) {
    return !xmlStr.match('<');
  };

  /**
   * Assembles an XML header as defined by the config.
   */
  var getHeaderString = function getHeaderString(_ref4) {
    var header = _ref4.header,
      isOutputStart = _ref4.isOutputStart;
    var shouldOutputHeader = header && isOutputStart;
    if (!shouldOutputHeader) return '';
    var shouldUseDefaultHeader = _typeof(header) === DATA_TYPES.BOOLEAN;
    return shouldUseDefaultHeader ? DEFAULT_XML_HEADER : header;
  };

  /**
   * Recursively traverses an object tree and converts the output to an XML string.
   * @example
   * toXML({ foo: 'bar' });
   * // -> <foo>bar</foo>
   */
  var defaultEntityReplacements = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;'
  };
  var toXML = function toXML() {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _config$depth = config.depth,
      depth = _config$depth === void 0 ? 0 : _config$depth,
      indent = config.indent,
      _isFirstItem = config._isFirstItem,
      _config$_isOutputStar = config._isOutputStart,
      _isOutputStart = _config$_isOutputStar === void 0 ? true : _config$_isOutputStar,
      header = config.header,
      _config$attributeRepl = config.attributeReplacements,
      rawAttributeReplacements = _config$attributeRepl === void 0 ? {} : _config$attributeRepl,
      attributeFilter = config.attributeFilter,
      _config$attributeExpl = config.attributeExplicitTrue,
      attributeExplicitTrue = _config$attributeExpl === void 0 ? false : _config$attributeExpl,
      _config$contentReplac = config.contentReplacements,
      rawContentReplacements = _config$contentReplac === void 0 ? {} : _config$contentReplac,
      contentMap = config.contentMap,
      _config$selfCloseTags = config.selfCloseTags,
      selfCloseTags = _config$selfCloseTags === void 0 ? true : _config$selfCloseTags;
    var shouldTurnOffAttributeReplacements = typeof rawAttributeReplacements === 'boolean' && !rawAttributeReplacements;
    var attributeReplacements = shouldTurnOffAttributeReplacements ? {} : _objectSpread(_objectSpread({}, defaultEntityReplacements), rawAttributeReplacements);
    var shouldTurnOffContentReplacements = typeof rawContentReplacements === 'boolean' && !rawContentReplacements;
    var contentReplacements = shouldTurnOffContentReplacements ? {} : _objectSpread(_objectSpread({}, defaultEntityReplacements), rawContentReplacements);

    // Determines indent based on depth.
    var indentStr = getIndentStr(indent, depth);

    // For branching based on value type.
    var valType = getType(obj);
    var headerStr = getHeaderString({
      header: header,
      indent: indent,
      depth: depth,
      isOutputStart: _isOutputStart
    });
    var isOutputStart = _isOutputStart && !headerStr && _isFirstItem && depth === 0;
    var preIndentStr = indent && !isOutputStart ? '\n' : '';
    var outputStr = '';
    switch (valType) {
      case DATA_TYPES.JSTOXML_OBJECT:
        {
          // Processes a specially-formatted object used by jstoxml.

          var _name = obj._name,
            _content = obj._content;

          // Output text content without a tag wrapper.
          if (_content === null && typeof contentMap !== 'function') {
            outputStr = "".concat(preIndentStr).concat(indentStr).concat(_name);
            break;
          }

          // Handles arrays of primitive values. (#33)
          var isArrayOfPrimitives = Array.isArray(_content) && _content.every(isPrimitive);
          if (isArrayOfPrimitives) {
            var primitives = _content.map(function (a) {
              return toXML({
                _name: _name,
                _content: a
              }, _objectSpread(_objectSpread({}, config), {}, {
                depth: depth,
                _isOutputStart: false
              }));
            });
            return primitives.join('');
          }

          // Don't output private vars (such as _attrs).
          if (PRIVATE_VARS.includes(_name)) break;

          // Process the nested new value and create new config.
          var newVal = toXML(_content, _objectSpread(_objectSpread({}, config), {}, {
            depth: depth + 1,
            _isOutputStart: isOutputStart
          }));
          var newValType = getType(newVal);
          var isNewValSimple = isSimpleXML(newVal);
          var isNewValCDATA = isCDATA(newVal);

          // Pre-tag output (indent and line breaks).
          var preTag = "".concat(preIndentStr).concat(indentStr);

          // Special handling for comments, preserving preceding line breaks/indents.
          if (_name === '_comment') {
            outputStr += "".concat(preTag, "<!-- ").concat(_content, " -->");
            break;
          }

          // Tag output.
          var valIsEmpty = newValType === 'undefined' || newVal === '';
          var globalSelfClose = selfCloseTags;
          var localSelfClose = obj._selfCloseTag;
          var shouldSelfClose = _typeof(localSelfClose) === DATA_TYPES.BOOLEAN ? valIsEmpty && localSelfClose : valIsEmpty && globalSelfClose;
          var selfCloseStr = shouldSelfClose ? '/' : '';
          var attributesString = formatAttributes(obj._attrs, attributeReplacements, attributeFilter, attributeExplicitTrue);
          var tag = "<".concat(_name).concat(attributesString).concat(selfCloseStr, ">");

          // Post-tag output (closing tag, indent, line breaks).
          var preTagCloseStr = indent && !isNewValSimple && !isNewValCDATA ? "\n".concat(indentStr) : '';
          var postTag = !shouldSelfClose ? "".concat(newVal).concat(preTagCloseStr, "</").concat(_name, ">") : '';
          outputStr += "".concat(preTag).concat(tag).concat(postTag);
          break;
        }
      case DATA_TYPES.OBJECT:
        {
          // Iterates over keyval pairs in an object, converting each item to a special-object.

          var keys = Object.keys(obj);
          var outputArr = keys.map(function (key, index) {
            var newConfig = _objectSpread(_objectSpread({}, config), {}, {
              _isFirstItem: index === 0,
              _isLastItem: index + 1 === keys.length,
              _isOutputStart: isOutputStart
            });
            var outputObj = {
              _name: key
            };
            if (getType(obj[key]) === DATA_TYPES.OBJECT) {
              // Sub-object contains an object.

              // Move private vars up as needed.  Needed to support certain types of objects
              // E.g. { foo: { _attrs: { a: 1 } } } -> <foo a="1"/>
              PRIVATE_VARS.forEach(function (privateVar) {
                var val = obj[key][privateVar];
                if (typeof val !== 'undefined') {
                  outputObj[privateVar] = val;
                  delete obj[key][privateVar];
                }
              });
              var hasContent = typeof obj[key]._content !== 'undefined';
              if (hasContent) {
                // _content has sibling keys, so pass as an array (edge case).
                // E.g. { foo: 'bar', _content: { baz: 2 } } -> <foo>bar</foo><baz>2</baz>
                if (Object.keys(obj[key]).length > 1) {
                  var newContentObj = Object.assign({}, obj[key]);
                  delete newContentObj._content;
                  outputObj._content = [].concat(_toConsumableArray(objToArray(newContentObj)), [obj[key]._content]);
                }
              }
            }

            // Fallthrough: just pass the key as the content for the new special-object.
            if (typeof outputObj._content === 'undefined') outputObj._content = obj[key];
            var xml = toXML(outputObj, newConfig);
            return xml;
          }, config);
          outputStr = outputArr.join('');
          break;
        }
      case DATA_TYPES.FUNCTION:
        {
          // Executes a user-defined function and returns output.

          var fnResult = obj(config);
          outputStr = toXML(fnResult, config);
          break;
        }
      case DATA_TYPES.ARRAY:
        {
          // Iterates and converts each value in an array.
          var _outputArr = obj.map(function (singleVal, index) {
            var newConfig = _objectSpread(_objectSpread({}, config), {}, {
              _isFirstItem: index === 0,
              _isLastItem: index + 1 === obj.length,
              _isOutputStart: isOutputStart
            });
            return toXML(singleVal, newConfig);
          });
          outputStr = _outputArr.join('');
          break;
        }

      // fallthrough types (number, string, boolean, date, null, etc)
      default:
        {
          outputStr = mapStr(obj, contentReplacements, contentMap);
          break;
        }
    }
    return "".concat(headerStr).concat(outputStr);
  };
  _exports.toXML = toXML;
  var _default = {
    toXML: toXML
  };
  _exports.default = _default;
});


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

/***/ "./src/MusicXML.ts":
/*!*************************!*\
  !*** ./src/MusicXML.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MusicXML = void 0;
const jstoxml_1 = __webpack_require__(/*! jstoxml */ "./node_modules/jstoxml/dist/jstoxml.js");
const Tuning_1 = __webpack_require__(/*! ./Tuning */ "./src/Tuning.ts");
const TuningNotation_1 = __webpack_require__(/*! ./TuningNotation */ "./src/TuningNotation.ts");
const Annotation_1 = __webpack_require__(/*! ./utils/Annotation */ "./src/utils/Annotation.ts");
/**
 * Export various Scalextric objects to as a MusicXML document.
 */
class MusicXML {
    constructor(title, objects, options = {}) {
        this.title = title;
        this.objects = objects;
        this.options = Object.assign({}, MusicXML.defaultOptions, options);
        this.tuning = new Tuning_1.Tuning(Tuning_1.Tuning.intervalsEdo(12));
        this.tuningNotation = TuningNotation_1.TuningNotation.fromNotesAccidentalsCombination(this.tuning, MusicXML.notes, MusicXML.accidentalValues);
    }
    convert() {
        return (0, jstoxml_1.toXML)(this.convertDocument(), {
            header: `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      `.trim(),
            indent: '  '
        });
    }
    convertDocument() {
        return {
            'score-partwise': [{
                    'work': {
                        'work-title': this.title
                    }
                }, {
                    'identification': [{
                            'encoding': [{
                                    'software': '@infojunkie/scalextric'
                                }, {
                                    'encoding-date': MusicXML.convertDate(new Date())
                                }, {
                                    _name: 'supports',
                                    _attrs: { 'element': 'accidental', 'type': 'no' }
                                }, {
                                    _name: 'supports',
                                    _attrs: { 'element': 'transpose', 'type': 'no' }
                                }, {
                                    _name: 'supports',
                                    _attrs: { 'attribute': 'new-page', 'element': 'print', 'type': 'yes', 'value': 'yes' }
                                }, {
                                    _name: 'supports',
                                    _attrs: { 'attribute': 'new-system', 'element': 'print', 'type': 'yes', 'value': 'yes' }
                                }]
                        }]
                }, {
                    'defaults': {
                        'scaling': {
                            'millimeters': 7,
                            'tenths': 40
                        }
                    }
                }, {
                    'part-list': {
                        _name: 'score-part',
                        _attrs: { 'id': 'P1' },
                        _content: {
                            _name: 'part-name',
                            _attrs: { 'print-object': 'no' },
                            _content: this.title
                        }
                    }
                }, {
                    _name: 'part',
                    _attrs: { 'id': 'P1' },
                    _content: this.convertObjects()
                }]
        };
    }
    /**
     * Convert tone rows to MusicXML measures.
     *
     * - Each tone row starts a new measure
     * - Convert each tone in the tone row to a quarter-tone
     * - Open a new measure as needed
     * - When the tone row is complete:
     *   - Fill the current measure with rests
     *   - Close with a section barline
     *   - Start a new system
     *
     * @returns array of measures.
     */
    convertObjects() {
        return this.objects.reduce((measures, object, objectIndex) => {
            // Start new measure.
            let measure = this.convertMeasure(measures.length + 1);
            measures.push(measure);
            // New system if needed.
            if (objectIndex > 0) {
                measure['_content'].push({
                    _name: 'print',
                    _attrs: { 'new-system': 'yes' }
                });
            }
            // First measure attributes.
            if (objectIndex === 0) {
                measure['_content'].push({
                    'attributes': [{
                            'divisions': this.options['divisions']
                        }, {
                            'key': [{
                                    'fifths': 0
                                }, {
                                    'mode': 'major'
                                }]
                        }, {
                            'time': [{
                                    'beats': this.options['time']['beats']
                                }, {
                                    'beat-type': this.options['time']['beatType']
                                }]
                        }, {
                            'clef': [{
                                    'sign': 'G'
                                }, {
                                    'line': 2
                                }]
                        }]
                });
            }
            // Add object label if any.
            const labels = Annotation_1.Annotation.findByLabel('label', object.annotations);
            if (labels) {
                measure['_content'].push({
                    _name: 'direction',
                    _attrs: { 'placement': 'above' },
                    _content: [{
                            'direction-type': [{
                                    'words': labels[0]
                                }]
                        }],
                });
            }
            // Loop on tones.
            let beat = 0;
            object.tones.forEach((tone, toneIndex) => {
                measure['_content'].push(this.convertNote(tone));
                // Add new measure if needed.
                beat = (beat + 1) % this.options['time']['beats'];
                if (beat === 0 && toneIndex < object.tones.length - 1) {
                    measure = this.convertMeasure(measures.length + 1);
                    measures.push(measure);
                }
            });
            // // Add remaining rests to the last measure.
            // if (beat > 0) while (beat++ < this.options['time']['beats']) {
            //   measure['_content'].push({
            //     _name: 'note',
            //     _content: [{
            //       _name: 'rest',
            //     }, {
            //       'duration': this.options['divisions'],
            //     }, {
            //       'type': MusicXML.noteTypes[this.options['time']['beatType']],
            //     }]
            //   })
            // }
            // Close the bar with a section barline.
            measure['_content'].push(this.convertBar('right', 'light-light'));
            return measures;
        }, []);
    }
    convertBar(location, style) {
        return {
            _name: 'barline',
            _attrs: { 'location': location },
            _content: [{
                    'bar-style': style
                }]
        };
    }
    convertMeasure(number) {
        return {
            _name: 'measure',
            _attrs: { 'number': number },
            _content: [],
        };
    }
    convertNote(tone) {
        const target = this.tuning.nearest(tone.tune);
        const name = this.tuningNotation.name(target.tone)[0];
        const step = name[0];
        const { accidental, alter } = (name[1] in MusicXML.accidentalValues) ? {
            accidental: MusicXML.accidentalNames[name[1]],
            alter: MusicXML.accidentalValues[name[1]],
        } : {
            accidental: null,
            alter: 0,
        };
        const octave = name[name.length - 1];
        const cents = target.difference.cents;
        return {
            _name: 'note',
            _content: [{
                    _name: 'pitch',
                    _content: [{
                            'step': step
                        }, {
                            'alter': alter + (Math.round(cents * 10) / 1000)
                        }, {
                            'octave': octave
                        }]
                }, {
                    'duration': this.options['divisions'],
                }, {
                    'type': MusicXML.noteTypes[this.options['time']['beatType']],
                }, Object.assign({}, (accidental && { 'accidental': accidental }))],
        };
    }
    // Date in yyyy-mm-dd
    // https://stackoverflow.com/a/50130338/209184
    static convertDate(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0];
    }
}
exports.MusicXML = MusicXML;
MusicXML.defaultOptions = {
    'divisions': 768,
    'time': {
        'beats': 4,
        'beatType': 4
    },
};
MusicXML.notes = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
};
MusicXML.accidentalValues = {
    '#': 1,
    'b': -1,
};
MusicXML.accidentalNames = {
    '#': 'sharp',
    'b': 'flat',
};
MusicXML.noteTypes = {
    8: 'eighth',
    4: 'quarter',
    2: 'half',
    1: 'whole',
};


/***/ }),

/***/ "./src/ToneRow.ts":
/*!************************!*\
  !*** ./src/ToneRow.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ToneRow = void 0;
const Tuning_1 = __webpack_require__(/*! ./Tuning */ "./src/Tuning.ts");
/**
 * TONE ROW
 *
 * We define a tone row as an ordered sequence of tones. It is the basic collection of tones
 * that make up many other musical objects such as scales, chords, etc.
 *
 * This definition extends the usual definition of "tone row" used in serial composition
 * https://en.wikipedia.org/wiki/Tone_row
 *
 * It allows us to reuse the standard tone row operations (invert, reverse, transpose, rotate)
 * on other musical objects.
 */
class ToneRow {
    /**
     * CONSTRUCTOR
     *
     * @param tuning: the reference tuning
     * @param tones: the tones making up the row
     * @param annotations: notes about the row
     */
    constructor(tuning, tones, annotations = []) {
        this.tuning = tuning;
        this.tones = tones;
        this.annotations = annotations;
        // TODO verify that tones are valid.
    }
    /**
     * Transpose a row to a target tone.
     */
    transpose(target) {
        return new ToneRow(this.tuning, this.tones.map(tone => Tuning_1.TuningTone.fromPitch(this.tuning, target.pitch + tone.pitch)));
    }
    /**
     * Invert a row around an axis tone.
     */
    invert(axis) {
        return new ToneRow(this.tuning, this.tones.map(tone => Tuning_1.TuningTone.fromPitch(this.tuning, axis.pitch - tone.pitch)));
    }
    /**
     * Reverse a row.
     */
    reverse() {
        return new ToneRow(this.tuning, [...this.tones].reverse());
    }
    /**
     * Rotate a row by cycling it a number of times.
     */
    rotate(cycles) {
        const c = cycles % this.tones.length;
        return new ToneRow(this.tuning, [...this.tones.slice(c), ...this.tones.slice(0, c)]);
    }
    /**
     * Monotonize a row, ensuring it is stricly ascending or descending, by raising or dropping pitch octaves.
     *
     * rotate.monotonize => chord inversion
     */
    monotonize(descending = false) {
        return new ToneRow(this.tuning, this.tones.reduce((current, next) => {
            const last = current.length > 0 ? current[current.length - 1] : next;
            if (!descending && next.pitch < last.pitch) {
                current.push(new Tuning_1.TuningTone(this.tuning, next.pitchClass, last.octave + (next.pitchClass < last.pitchClass ? 1 : 0)));
            }
            else if (descending && next.pitch > last.pitch) {
                current.push(new Tuning_1.TuningTone(this.tuning, next.pitchClass, last.octave + (next.pitchClass > last.pitchClass ? -1 : 0)));
            }
            else {
                current.push(next);
            }
            return current;
        }, new Array()));
    }
    /**
     * Get the pitches of the tone row.
     */
    get pitches() {
        return this.tones.map(tone => tone.pitch);
    }
    /**
     * Create a tone row from given pitches.
     */
    static fromPitches(tuning, pitches, annotations = []) {
        return new ToneRow(tuning, pitches.map(pitch => Tuning_1.TuningTone.fromPitch(tuning, pitch)), annotations);
    }
    /**
     * Create a tone row from given pitches.
     */
    static fromPitchClasses(tuning, pitchClasses, octave, annotations = []) {
        return new ToneRow(tuning, pitchClasses.map(pitchClass => new Tuning_1.TuningTone(tuning, pitchClass, octave)), annotations);
    }
}
exports.ToneRow = ToneRow;


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
    get tune() {
        return this.tuning.tune(this);
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
        const names = [...this.map.getKey(tone.pitchClass)];
        return names.sort((a, b) => a.length - b.length).map(name => `${name}${tone.octave}`);
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
tslib_1.__exportStar(__webpack_require__(/*! ./ToneRow */ "./src/ToneRow.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./MusicXML */ "./src/MusicXML.ts"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./utils/Annotation */ "./src/utils/Annotation.ts"), exports);


/***/ }),

/***/ "./src/utils/Annotation.ts":
/*!*********************************!*\
  !*** ./src/utils/Annotation.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Annotation = void 0;
/**
 * ANNOTATION
 *
 * An annotation is a generic container for metadata that can be attached to any object.
 */
class Annotation {
    static findByLabel(label, annotations) {
        return annotations.filter(annotation => annotation.label = label).map(annotation => annotation.value);
    }
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }
}
exports.Annotation = Annotation;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CLGFBQWEsU0FBUztBQUN0QjtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLFdBQVc7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsV0FBVztBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxFQUFFOztBQUVWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkVBQTZFO0FBQzdFLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsc0JBQXNCLGlCQUFpQjs7QUFFdkM7QUFDQSw0QkFBNEIsUUFBUTtBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FB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QkFBdUIsOEJBQThCLGdEQUFnRCx3REFBd0Q7QUFDN0osNkNBQTZDLHNDQUFzQyxVQUFVLG1CQUFtQixJQUFJO0FBQ3BIO0FBQ0E7QUFDTztBQUNQLGlDQUFpQyx1Q0FBdUMsWUFBWSxLQUFLLE9BQU87QUFDaEc7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDek5BO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL25vZGVfbW9kdWxlcy9mcmFjdGlvbi5qcy9mcmFjdGlvbi5qcyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vbm9kZV9tb2R1bGVzL2pzdG94bWwvZGlzdC9qc3RveG1sLmpzIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9zcmMvSW50ZXJ2YWwudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy9NdXNpY1hNTC50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL1RvbmVSb3cudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy9UdW5pbmcudHMiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy8uL3NyYy9UdW5pbmdOb3RhdGlvbi50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9zcmMvdXRpbHMvQW5ub3RhdGlvbi50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vc3JjL3V0aWxzL0JpbWFwLnRzIiwid2VicGFjazovL1NjYWxleHRyaWMvLi9zcmMvdXRpbHMvaGVscGVycy50cyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljLy4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9TY2FsZXh0cmljL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vU2NhbGV4dHJpYy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL1NjYWxleHRyaWMvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIlNjYWxleHRyaWNcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiU2NhbGV4dHJpY1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsICgpID0+IHtcbnJldHVybiAiLCIvKipcbiAqIEBsaWNlbnNlIEZyYWN0aW9uLmpzIHY0LjIuMCAwNS8wMy8yMDIyXG4gKiBodHRwczovL3d3dy54YXJnLm9yZy8yMDE0LzAzL3JhdGlvbmFsLW51bWJlcnMtaW4tamF2YXNjcmlwdC9cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjEsIFJvYmVydCBFaXNlbGUgKHJvYmVydEB4YXJnLm9yZylcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxuICoqL1xuXG5cbi8qKlxuICpcbiAqIFRoaXMgY2xhc3Mgb2ZmZXJzIHRoZSBwb3NzaWJpbGl0eSB0byBjYWxjdWxhdGUgZnJhY3Rpb25zLlxuICogWW91IGNhbiBwYXNzIGEgZnJhY3Rpb24gaW4gZGlmZmVyZW50IGZvcm1hdHMuIEVpdGhlciBhcyBhcnJheSwgYXMgZG91YmxlLCBhcyBzdHJpbmcgb3IgYXMgYW4gaW50ZWdlci5cbiAqXG4gKiBBcnJheS9PYmplY3QgZm9ybVxuICogWyAwID0+IDxub21pbmF0b3I+LCAxID0+IDxkZW5vbWluYXRvcj4gXVxuICogWyBuID0+IDxub21pbmF0b3I+LCBkID0+IDxkZW5vbWluYXRvcj4gXVxuICpcbiAqIEludGVnZXIgZm9ybVxuICogLSBTaW5nbGUgaW50ZWdlciB2YWx1ZVxuICpcbiAqIERvdWJsZSBmb3JtXG4gKiAtIFNpbmdsZSBkb3VibGUgdmFsdWVcbiAqXG4gKiBTdHJpbmcgZm9ybVxuICogMTIzLjQ1NiAtIGEgc2ltcGxlIGRvdWJsZVxuICogMTIzLzQ1NiAtIGEgc3RyaW5nIGZyYWN0aW9uXG4gKiAxMjMuJzQ1NicgLSBhIGRvdWJsZSB3aXRoIHJlcGVhdGluZyBkZWNpbWFsIHBsYWNlc1xuICogMTIzLig0NTYpIC0gc3lub255bVxuICogMTIzLjQ1JzYnIC0gYSBkb3VibGUgd2l0aCByZXBlYXRpbmcgbGFzdCBwbGFjZVxuICogMTIzLjQ1KDYpIC0gc3lub255bVxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogdmFyIGYgPSBuZXcgRnJhY3Rpb24oXCI5LjQnMzEnXCIpO1xuICogZi5tdWwoWy00LCAzXSkuZGl2KDQuOSk7XG4gKlxuICovXG5cbihmdW5jdGlvbihyb290KSB7XG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gTWF4aW11bSBzZWFyY2ggZGVwdGggZm9yIGN5Y2xpYyByYXRpb25hbCBudW1iZXJzLiAyMDAwIHNob3VsZCBiZSBtb3JlIHRoYW4gZW5vdWdoLlxuICAvLyBFeGFtcGxlOiAxLzcgPSAwLigxNDI4NTcpIGhhcyA2IHJlcGVhdGluZyBkZWNpbWFsIHBsYWNlcy5cbiAgLy8gSWYgTUFYX0NZQ0xFX0xFTiBnZXRzIHJlZHVjZWQsIGxvbmcgY3ljbGVzIHdpbGwgbm90IGJlIGRldGVjdGVkIGFuZCB0b1N0cmluZygpIG9ubHkgZ2V0cyB0aGUgZmlyc3QgMTAgZGlnaXRzXG4gIHZhciBNQVhfQ1lDTEVfTEVOID0gMjAwMDtcblxuICAvLyBQYXJzZWQgZGF0YSB0byBhdm9pZCBjYWxsaW5nIFwibmV3XCIgYWxsIHRoZSB0aW1lXG4gIHZhciBQID0ge1xuICAgIFwic1wiOiAxLFxuICAgIFwiblwiOiAwLFxuICAgIFwiZFwiOiAxXG4gIH07XG5cbiAgZnVuY3Rpb24gYXNzaWduKG4sIHMpIHtcblxuICAgIGlmIChpc05hTihuID0gcGFyc2VJbnQobiwgMTApKSkge1xuICAgICAgdGhyb3cgRnJhY3Rpb25bJ0ludmFsaWRQYXJhbWV0ZXInXTtcbiAgICB9XG4gICAgcmV0dXJuIG4gKiBzO1xuICB9XG5cbiAgLy8gQ3JlYXRlcyBhIG5ldyBGcmFjdGlvbiBpbnRlcm5hbGx5IHdpdGhvdXQgdGhlIG5lZWQgb2YgdGhlIGJ1bGt5IGNvbnN0cnVjdG9yXG4gIGZ1bmN0aW9uIG5ld0ZyYWN0aW9uKG4sIGQpIHtcblxuICAgIGlmIChkID09PSAwKSB7XG4gICAgICB0aHJvdyBGcmFjdGlvblsnRGl2aXNpb25CeVplcm8nXTtcbiAgICB9XG5cbiAgICB2YXIgZiA9IE9iamVjdC5jcmVhdGUoRnJhY3Rpb24ucHJvdG90eXBlKTtcbiAgICBmW1wic1wiXSA9IG4gPCAwID8gLTEgOiAxO1xuXG4gICAgbiA9IG4gPCAwID8gLW4gOiBuO1xuXG4gICAgdmFyIGEgPSBnY2QobiwgZCk7XG5cbiAgICBmW1wiblwiXSA9IG4gLyBhO1xuICAgIGZbXCJkXCJdID0gZCAvIGE7XG4gICAgcmV0dXJuIGY7XG4gIH1cblxuICBmdW5jdGlvbiBmYWN0b3JpemUobnVtKSB7XG5cbiAgICB2YXIgZmFjdG9ycyA9IHt9O1xuXG4gICAgdmFyIG4gPSBudW07XG4gICAgdmFyIGkgPSAyO1xuICAgIHZhciBzID0gNDtcblxuICAgIHdoaWxlIChzIDw9IG4pIHtcblxuICAgICAgd2hpbGUgKG4gJSBpID09PSAwKSB7XG4gICAgICAgIG4vPSBpO1xuICAgICAgICBmYWN0b3JzW2ldID0gKGZhY3RvcnNbaV0gfHwgMCkgKyAxO1xuICAgICAgfVxuICAgICAgcys9IDEgKyAyICogaSsrO1xuICAgIH1cblxuICAgIGlmIChuICE9PSBudW0pIHtcbiAgICAgIGlmIChuID4gMSlcbiAgICAgICAgZmFjdG9yc1tuXSA9IChmYWN0b3JzW25dIHx8IDApICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmFjdG9yc1tudW1dID0gKGZhY3RvcnNbbnVtXSB8fCAwKSArIDE7XG4gICAgfVxuICAgIHJldHVybiBmYWN0b3JzO1xuICB9XG5cbiAgdmFyIHBhcnNlID0gZnVuY3Rpb24ocDEsIHAyKSB7XG5cbiAgICB2YXIgbiA9IDAsIGQgPSAxLCBzID0gMTtcbiAgICB2YXIgdiA9IDAsIHcgPSAwLCB4ID0gMCwgeSA9IDEsIHogPSAxO1xuXG4gICAgdmFyIEEgPSAwLCBCID0gMTtcbiAgICB2YXIgQyA9IDEsIEQgPSAxO1xuXG4gICAgdmFyIE4gPSAxMDAwMDAwMDtcbiAgICB2YXIgTTtcblxuICAgIGlmIChwMSA9PT0gdW5kZWZpbmVkIHx8IHAxID09PSBudWxsKSB7XG4gICAgICAvKiB2b2lkICovXG4gICAgfSBlbHNlIGlmIChwMiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBuID0gcDE7XG4gICAgICBkID0gcDI7XG4gICAgICBzID0gbiAqIGQ7XG5cbiAgICAgIGlmIChuICUgMSAhPT0gMCB8fCBkICUgMSAhPT0gMCkge1xuICAgICAgICB0aHJvdyBGcmFjdGlvblsnTm9uSW50ZWdlclBhcmFtZXRlciddO1xuICAgICAgfVxuXG4gICAgfSBlbHNlXG4gICAgICBzd2l0Y2ggKHR5cGVvZiBwMSkge1xuXG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZiAoXCJkXCIgaW4gcDEgJiYgXCJuXCIgaW4gcDEpIHtcbiAgICAgICAgICAgICAgbiA9IHAxW1wiblwiXTtcbiAgICAgICAgICAgICAgZCA9IHAxW1wiZFwiXTtcbiAgICAgICAgICAgICAgaWYgKFwic1wiIGluIHAxKVxuICAgICAgICAgICAgICAgIG4qPSBwMVtcInNcIl07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKDAgaW4gcDEpIHtcbiAgICAgICAgICAgICAgbiA9IHAxWzBdO1xuICAgICAgICAgICAgICBpZiAoMSBpbiBwMSlcbiAgICAgICAgICAgICAgICBkID0gcDFbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBGcmFjdGlvblsnSW52YWxpZFBhcmFtZXRlciddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcyA9IG4gKiBkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgaWYgKHAxIDwgMCkge1xuICAgICAgICAgICAgICBzID0gcDE7XG4gICAgICAgICAgICAgIHAxID0gLXAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocDEgJSAxID09PSAwKSB7XG4gICAgICAgICAgICAgIG4gPSBwMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocDEgPiAwKSB7IC8vIGNoZWNrIGZvciAhPSAwLCBzY2FsZSB3b3VsZCBiZWNvbWUgTmFOIChsb2coMCkpLCB3aGljaCBjb252ZXJnZXMgcmVhbGx5IHNsb3dcblxuICAgICAgICAgICAgICBpZiAocDEgPj0gMSkge1xuICAgICAgICAgICAgICAgIHogPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcigxICsgTWF0aC5sb2cocDEpIC8gTWF0aC5MTjEwKSk7XG4gICAgICAgICAgICAgICAgcDEvPSB6O1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gVXNpbmcgRmFyZXkgU2VxdWVuY2VzXG4gICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuam9obmRjb29rLmNvbS9ibG9nLzIwMTAvMTAvMjAvYmVzdC1yYXRpb25hbC1hcHByb3hpbWF0aW9uL1xuXG4gICAgICAgICAgICAgIHdoaWxlIChCIDw9IE4gJiYgRCA8PSBOKSB7XG4gICAgICAgICAgICAgICAgTSA9IChBICsgQykgLyAoQiArIEQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHAxID09PSBNKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoQiArIEQgPD0gTikge1xuICAgICAgICAgICAgICAgICAgICBuID0gQSArIEM7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBCICsgRDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRCA+IEIpIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IEM7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBEO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbiA9IEE7XG4gICAgICAgICAgICAgICAgICAgIGQgPSBCO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICBpZiAocDEgPiBNKSB7XG4gICAgICAgICAgICAgICAgICAgIEErPSBDO1xuICAgICAgICAgICAgICAgICAgICBCKz0gRDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEMrPSBBO1xuICAgICAgICAgICAgICAgICAgICBEKz0gQjtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgaWYgKEIgPiBOKSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBDO1xuICAgICAgICAgICAgICAgICAgICBkID0gRDtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG4gPSBBO1xuICAgICAgICAgICAgICAgICAgICBkID0gQjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbio9IHo7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKHAxKSB8fCBpc05hTihwMikpIHtcbiAgICAgICAgICAgICAgZCA9IG4gPSBOYU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICBCID0gcDEubWF0Y2goL1xcZCt8Li9nKTtcblxuICAgICAgICAgICAgaWYgKEIgPT09IG51bGwpXG4gICAgICAgICAgICAgIHRocm93IEZyYWN0aW9uWydJbnZhbGlkUGFyYW1ldGVyJ107XG5cbiAgICAgICAgICAgIGlmIChCW0FdID09PSAnLScpIHsvLyBDaGVjayBmb3IgbWludXMgc2lnbiBhdCB0aGUgYmVnaW5uaW5nXG4gICAgICAgICAgICAgIHMgPSAtMTtcbiAgICAgICAgICAgICAgQSsrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChCW0FdID09PSAnKycpIHsvLyBDaGVjayBmb3IgcGx1cyBzaWduIGF0IHRoZSBiZWdpbm5pbmdcbiAgICAgICAgICAgICAgQSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoQi5sZW5ndGggPT09IEEgKyAxKSB7IC8vIENoZWNrIGlmIGl0J3MganVzdCBhIHNpbXBsZSBudW1iZXIgXCIxMjM0XCJcbiAgICAgICAgICAgICAgdyA9IGFzc2lnbihCW0ErK10sIHMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChCW0EgKyAxXSA9PT0gJy4nIHx8IEJbQV0gPT09ICcuJykgeyAvLyBDaGVjayBpZiBpdCdzIGEgZGVjaW1hbCBudW1iZXJcblxuICAgICAgICAgICAgICBpZiAoQltBXSAhPT0gJy4nKSB7IC8vIEhhbmRsZSAwLjUgYW5kIC41XG4gICAgICAgICAgICAgICAgdiA9IGFzc2lnbihCW0ErK10sIHMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIEErKztcblxuICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgZGVjaW1hbCBwbGFjZXNcbiAgICAgICAgICAgICAgaWYgKEEgKyAxID09PSBCLmxlbmd0aCB8fCBCW0EgKyAxXSA9PT0gJygnICYmIEJbQSArIDNdID09PSAnKScgfHwgQltBICsgMV0gPT09IFwiJ1wiICYmIEJbQSArIDNdID09PSBcIidcIikge1xuICAgICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBXSwgcyk7XG4gICAgICAgICAgICAgICAgeSA9IE1hdGgucG93KDEwLCBCW0FdLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgQSsrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHJlcGVhdGluZyBwbGFjZXNcbiAgICAgICAgICAgICAgaWYgKEJbQV0gPT09ICcoJyAmJiBCW0EgKyAyXSA9PT0gJyknIHx8IEJbQV0gPT09IFwiJ1wiICYmIEJbQSArIDJdID09PSBcIidcIikge1xuICAgICAgICAgICAgICAgIHggPSBhc3NpZ24oQltBICsgMV0sIHMpO1xuICAgICAgICAgICAgICAgIHogPSBNYXRoLnBvdygxMCwgQltBICsgMV0ubGVuZ3RoKSAtIDE7XG4gICAgICAgICAgICAgICAgQSs9IDM7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChCW0EgKyAxXSA9PT0gJy8nIHx8IEJbQSArIDFdID09PSAnOicpIHsgLy8gQ2hlY2sgZm9yIGEgc2ltcGxlIGZyYWN0aW9uIFwiMTIzLzQ1NlwiIG9yIFwiMTIzOjQ1NlwiXG4gICAgICAgICAgICAgIHcgPSBhc3NpZ24oQltBXSwgcyk7XG4gICAgICAgICAgICAgIHkgPSBhc3NpZ24oQltBICsgMl0sIDEpO1xuICAgICAgICAgICAgICBBKz0gMztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQltBICsgM10gPT09ICcvJyAmJiBCW0EgKyAxXSA9PT0gJyAnKSB7IC8vIENoZWNrIGZvciBhIGNvbXBsZXggZnJhY3Rpb24gXCIxMjMgMS8yXCJcbiAgICAgICAgICAgICAgdiA9IGFzc2lnbihCW0FdLCBzKTtcbiAgICAgICAgICAgICAgdyA9IGFzc2lnbihCW0EgKyAyXSwgcyk7XG4gICAgICAgICAgICAgIHkgPSBhc3NpZ24oQltBICsgNF0sIDEpO1xuICAgICAgICAgICAgICBBKz0gNTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKEIubGVuZ3RoIDw9IEEpIHsgLy8gQ2hlY2sgZm9yIG1vcmUgdG9rZW5zIG9uIHRoZSBzdGFja1xuICAgICAgICAgICAgICBkID0geSAqIHo7XG4gICAgICAgICAgICAgIHMgPSAvKiB2b2lkICovXG4gICAgICAgICAgICAgIG4gPSB4ICsgZCAqIHYgKyB6ICogdztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEZhbGwgdGhyb3VnaCBvbiBlcnJvciAqL1xuICAgICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBGcmFjdGlvblsnSW52YWxpZFBhcmFtZXRlciddO1xuICAgICAgfVxuXG4gICAgaWYgKGQgPT09IDApIHtcbiAgICAgIHRocm93IEZyYWN0aW9uWydEaXZpc2lvbkJ5WmVybyddO1xuICAgIH1cblxuICAgIFBbXCJzXCJdID0gcyA8IDAgPyAtMSA6IDE7XG4gICAgUFtcIm5cIl0gPSBNYXRoLmFicyhuKTtcbiAgICBQW1wiZFwiXSA9IE1hdGguYWJzKGQpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1vZHBvdyhiLCBlLCBtKSB7XG5cbiAgICB2YXIgciA9IDE7XG4gICAgZm9yICg7IGUgPiAwOyBiID0gKGIgKiBiKSAlIG0sIGUgPj49IDEpIHtcblxuICAgICAgaWYgKGUgJiAxKSB7XG4gICAgICAgIHIgPSAociAqIGIpICUgbTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGN5Y2xlTGVuKG4sIGQpIHtcblxuICAgIGZvciAoOyBkICUgMiA9PT0gMDtcbiAgICAgIGQvPSAyKSB7XG4gICAgfVxuXG4gICAgZm9yICg7IGQgJSA1ID09PSAwO1xuICAgICAgZC89IDUpIHtcbiAgICB9XG5cbiAgICBpZiAoZCA9PT0gMSkgLy8gQ2F0Y2ggbm9uLWN5Y2xpYyBudW1iZXJzXG4gICAgICByZXR1cm4gMDtcblxuICAgIC8vIElmIHdlIHdvdWxkIGxpa2UgdG8gY29tcHV0ZSByZWFsbHkgbGFyZ2UgbnVtYmVycyBxdWlja2VyLCB3ZSBjb3VsZCBtYWtlIHVzZSBvZiBGZXJtYXQncyBsaXR0bGUgdGhlb3JlbTpcbiAgICAvLyAxMF4oZC0xKSAlIGQgPT0gMVxuICAgIC8vIEhvd2V2ZXIsIHdlIGRvbid0IG5lZWQgc3VjaCBsYXJnZSBudW1iZXJzIGFuZCBNQVhfQ1lDTEVfTEVOIHNob3VsZCBiZSB0aGUgY2Fwc3RvbmUsXG4gICAgLy8gYXMgd2Ugd2FudCB0byB0cmFuc2xhdGUgdGhlIG51bWJlcnMgdG8gc3RyaW5ncy5cblxuICAgIHZhciByZW0gPSAxMCAlIGQ7XG4gICAgdmFyIHQgPSAxO1xuXG4gICAgZm9yICg7IHJlbSAhPT0gMTsgdCsrKSB7XG4gICAgICByZW0gPSByZW0gKiAxMCAlIGQ7XG5cbiAgICAgIGlmICh0ID4gTUFYX0NZQ0xFX0xFTilcbiAgICAgICAgcmV0dXJuIDA7IC8vIFJldHVybmluZyAwIGhlcmUgbWVhbnMgdGhhdCB3ZSBkb24ndCBwcmludCBpdCBhcyBhIGN5Y2xpYyBudW1iZXIuIEl0J3MgbGlrZWx5IHRoYXQgdGhlIGFuc3dlciBpcyBgZC0xYFxuICAgIH1cbiAgICByZXR1cm4gdDtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gY3ljbGVTdGFydChuLCBkLCBsZW4pIHtcblxuICAgIHZhciByZW0xID0gMTtcbiAgICB2YXIgcmVtMiA9IG1vZHBvdygxMCwgbGVuLCBkKTtcblxuICAgIGZvciAodmFyIHQgPSAwOyB0IDwgMzAwOyB0KyspIHsgLy8gcyA8IH5sb2cxMChOdW1iZXIuTUFYX1ZBTFVFKVxuICAgICAgLy8gU29sdmUgMTBecyA9PSAxMF4ocyt0KSAobW9kIGQpXG5cbiAgICAgIGlmIChyZW0xID09PSByZW0yKVxuICAgICAgICByZXR1cm4gdDtcblxuICAgICAgcmVtMSA9IHJlbTEgKiAxMCAlIGQ7XG4gICAgICByZW0yID0gcmVtMiAqIDEwICUgZDtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBmdW5jdGlvbiBnY2QoYSwgYikge1xuXG4gICAgaWYgKCFhKVxuICAgICAgcmV0dXJuIGI7XG4gICAgaWYgKCFiKVxuICAgICAgcmV0dXJuIGE7XG5cbiAgICB3aGlsZSAoMSkge1xuICAgICAgYSU9IGI7XG4gICAgICBpZiAoIWEpXG4gICAgICAgIHJldHVybiBiO1xuICAgICAgYiU9IGE7XG4gICAgICBpZiAoIWIpXG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogTW9kdWxlIGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge251bWJlcnxGcmFjdGlvbj19IGFcbiAgICogQHBhcmFtIHtudW1iZXI9fSBiXG4gICAqL1xuICBmdW5jdGlvbiBGcmFjdGlvbihhLCBiKSB7XG5cbiAgICBwYXJzZShhLCBiKTtcblxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgRnJhY3Rpb24pIHtcbiAgICAgIGEgPSBnY2QoUFtcImRcIl0sIFBbXCJuXCJdKTsgLy8gQWJ1c2UgdmFyaWFibGUgYVxuICAgICAgdGhpc1tcInNcIl0gPSBQW1wic1wiXTtcbiAgICAgIHRoaXNbXCJuXCJdID0gUFtcIm5cIl0gLyBhO1xuICAgICAgdGhpc1tcImRcIl0gPSBQW1wiZFwiXSAvIGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihQWydzJ10gKiBQWyduJ10sIFBbJ2QnXSk7XG4gICAgfVxuICB9XG5cbiAgRnJhY3Rpb25bJ0RpdmlzaW9uQnlaZXJvJ10gPSBuZXcgRXJyb3IoXCJEaXZpc2lvbiBieSBaZXJvXCIpO1xuICBGcmFjdGlvblsnSW52YWxpZFBhcmFtZXRlciddID0gbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudFwiKTtcbiAgRnJhY3Rpb25bJ05vbkludGVnZXJQYXJhbWV0ZXInXSA9IG5ldyBFcnJvcihcIlBhcmFtZXRlcnMgbXVzdCBiZSBpbnRlZ2VyXCIpO1xuXG4gIEZyYWN0aW9uLnByb3RvdHlwZSA9IHtcblxuICAgIFwic1wiOiAxLFxuICAgIFwiblwiOiAwLFxuICAgIFwiZFwiOiAxLFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgYWJzb2x1dGUgdmFsdWVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oLTQpLmFicygpID0+IDRcbiAgICAgKiovXG4gICAgXCJhYnNcIjogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbih0aGlzW1wiblwiXSwgdGhpc1tcImRcIl0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbnZlcnRzIHRoZSBzaWduIG9mIHRoZSBjdXJyZW50IGZyYWN0aW9uXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKC00KS5uZWcoKSA9PiA0XG4gICAgICoqL1xuICAgIFwibmVnXCI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oLXRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0sIHRoaXNbXCJkXCJdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0d28gcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbih7bjogMiwgZDogM30pLmFkZChcIjE0LjlcIikgPT4gNDY3IC8gMzBcbiAgICAgKiovXG4gICAgXCJhZGRcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihcbiAgICAgICAgdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAqIFBbXCJkXCJdICsgUFtcInNcIl0gKiB0aGlzW1wiZFwiXSAqIFBbXCJuXCJdLFxuICAgICAgICB0aGlzW1wiZFwiXSAqIFBbXCJkXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWJ0cmFjdHMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oe246IDIsIGQ6IDN9KS5hZGQoXCIxNC45XCIpID0+IC00MjcgLyAzMFxuICAgICAqKi9cbiAgICBcInN1YlwiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcImRcIl0gLSBQW1wic1wiXSAqIHRoaXNbXCJkXCJdICogUFtcIm5cIl0sXG4gICAgICAgIHRoaXNbXCJkXCJdICogUFtcImRcIl1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE11bHRpcGxpZXMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCItMTcuKDM0NSlcIikubXVsKDMpID0+IDU3NzYgLyAxMTFcbiAgICAgKiovXG4gICAgXCJtdWxcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbihcbiAgICAgICAgdGhpc1tcInNcIl0gKiBQW1wic1wiXSAqIHRoaXNbXCJuXCJdICogUFtcIm5cIl0sXG4gICAgICAgIHRoaXNbXCJkXCJdICogUFtcImRcIl1cbiAgICAgICk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpdmlkZXMgdHdvIHJhdGlvbmFsIG51bWJlcnNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCItMTcuKDM0NSlcIikuaW52ZXJzZSgpLmRpdigzKVxuICAgICAqKi9cbiAgICBcImRpdlwiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKFxuICAgICAgICB0aGlzW1wic1wiXSAqIFBbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSxcbiAgICAgICAgdGhpc1tcImRcIl0gKiBQW1wiblwiXVxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIHRoZSBhY3R1YWwgb2JqZWN0XG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiLTE3LigzNDUpXCIpLmNsb25lKClcbiAgICAgKiovXG4gICAgXCJjbG9uZVwiOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXdGcmFjdGlvbih0aGlzWydzJ10gKiB0aGlzWyduJ10sIHRoaXNbJ2QnXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIG1vZHVsbyBvZiB0d28gcmF0aW9uYWwgbnVtYmVycyAtIGEgbW9yZSBwcmVjaXNlIGZtb2RcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oJzQuKDMpJykubW9kKFs3LCA4XSkgPT4gKDEzLzMpICUgKDcvOCkgPSAoNS82KVxuICAgICAqKi9cbiAgICBcIm1vZFwiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIGlmIChpc05hTih0aGlzWyduJ10pIHx8IGlzTmFOKHRoaXNbJ2QnXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihOYU4pO1xuICAgICAgfVxuXG4gICAgICBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBuZXdGcmFjdGlvbih0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdICUgdGhpc1tcImRcIl0sIDEpO1xuICAgICAgfVxuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIGlmICgwID09PSBQW1wiblwiXSAmJiAwID09PSB0aGlzW1wiZFwiXSkge1xuICAgICAgICB0aHJvdyBGcmFjdGlvblsnRGl2aXNpb25CeVplcm8nXTtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICAqIEZpcnN0IHNpbGx5IGF0dGVtcHQsIGtpbmRhIHNsb3dcbiAgICAgICAqXG4gICAgICAgcmV0dXJuIHRoYXRbXCJzdWJcIl0oe1xuICAgICAgIFwiblwiOiBudW1bXCJuXCJdICogTWF0aC5mbG9vcigodGhpcy5uIC8gdGhpcy5kKSAvIChudW0ubiAvIG51bS5kKSksXG4gICAgICAgXCJkXCI6IG51bVtcImRcIl0sXG4gICAgICAgXCJzXCI6IHRoaXNbXCJzXCJdXG4gICAgICAgfSk7Ki9cblxuICAgICAgLypcbiAgICAgICAqIE5ldyBhdHRlbXB0OiBhMSAvIGIxID0gYTIgLyBiMiAqIHEgKyByXG4gICAgICAgKiA9PiBiMiAqIGExID0gYTIgKiBiMSAqIHEgKyBiMSAqIGIyICogclxuICAgICAgICogPT4gKGIyICogYTEgJSBhMiAqIGIxKSAvIChiMSAqIGIyKVxuICAgICAgICovXG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oXG4gICAgICAgIHRoaXNbXCJzXCJdICogKFBbXCJkXCJdICogdGhpc1tcIm5cIl0pICUgKFBbXCJuXCJdICogdGhpc1tcImRcIl0pLFxuICAgICAgICBQW1wiZFwiXSAqIHRoaXNbXCJkXCJdXG4gICAgICApO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBmcmFjdGlvbmFsIGdjZCBvZiB0d28gcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbig1LDgpLmdjZCgzLDcpID0+IDEvNTZcbiAgICAgKi9cbiAgICBcImdjZFwiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuXG4gICAgICAvLyBnY2QoYSAvIGIsIGMgLyBkKSA9IGdjZChhLCBjKSAvIGxjbShiLCBkKVxuXG4gICAgICByZXR1cm4gbmV3RnJhY3Rpb24oZ2NkKFBbXCJuXCJdLCB0aGlzW1wiblwiXSkgKiBnY2QoUFtcImRcIl0sIHRoaXNbXCJkXCJdKSwgUFtcImRcIl0gKiB0aGlzW1wiZFwiXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGZyYWN0aW9uYWwgbGNtIG9mIHR3byByYXRpb25hbCBudW1iZXJzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKDUsOCkubGNtKDMsNykgPT4gMTVcbiAgICAgKi9cbiAgICBcImxjbVwiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuXG4gICAgICAvLyBsY20oYSAvIGIsIGMgLyBkKSA9IGxjbShhLCBjKSAvIGdjZChiLCBkKVxuXG4gICAgICBpZiAoUFtcIm5cIl0gPT09IDAgJiYgdGhpc1tcIm5cIl0gPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKDAsIDEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKFBbXCJuXCJdICogdGhpc1tcIm5cIl0sIGdjZChQW1wiblwiXSwgdGhpc1tcIm5cIl0pICogZ2NkKFBbXCJkXCJdLCB0aGlzW1wiZFwiXSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBjZWlsIG9mIGEgcmF0aW9uYWwgbnVtYmVyXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKCc0LigzKScpLmNlaWwoKSA9PiAoNSAvIDEpXG4gICAgICoqL1xuICAgIFwiY2VpbFwiOiBmdW5jdGlvbihwbGFjZXMpIHtcblxuICAgICAgcGxhY2VzID0gTWF0aC5wb3coMTAsIHBsYWNlcyB8fCAwKTtcblxuICAgICAgaWYgKGlzTmFOKHRoaXNbXCJuXCJdKSB8fCBpc05hTih0aGlzW1wiZFwiXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihOYU4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKE1hdGguY2VpbChwbGFjZXMgKiB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdIC8gdGhpc1tcImRcIl0pLCBwbGFjZXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBmbG9vciBvZiBhIHJhdGlvbmFsIG51bWJlclxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5mbG9vcigpID0+ICg0IC8gMSlcbiAgICAgKiovXG4gICAgXCJmbG9vclwiOiBmdW5jdGlvbihwbGFjZXMpIHtcblxuICAgICAgcGxhY2VzID0gTWF0aC5wb3coMTAsIHBsYWNlcyB8fCAwKTtcblxuICAgICAgaWYgKGlzTmFOKHRoaXNbXCJuXCJdKSB8fCBpc05hTih0aGlzW1wiZFwiXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihOYU4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKE1hdGguZmxvb3IocGxhY2VzICogdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdKSwgcGxhY2VzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm91bmRzIGEgcmF0aW9uYWwgbnVtYmVyc1xuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbignNC4oMyknKS5yb3VuZCgpID0+ICg0IC8gMSlcbiAgICAgKiovXG4gICAgXCJyb3VuZFwiOiBmdW5jdGlvbihwbGFjZXMpIHtcblxuICAgICAgcGxhY2VzID0gTWF0aC5wb3coMTAsIHBsYWNlcyB8fCAwKTtcblxuICAgICAgaWYgKGlzTmFOKHRoaXNbXCJuXCJdKSB8fCBpc05hTih0aGlzW1wiZFwiXSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihOYU4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKE1hdGgucm91bmQocGxhY2VzICogdGhpc1tcInNcIl0gKiB0aGlzW1wiblwiXSAvIHRoaXNbXCJkXCJdKSwgcGxhY2VzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW52ZXJzZSBvZiB0aGUgZnJhY3Rpb24sIG1lYW5zIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IgYXJlIGV4Y2hhbmdlZFxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbihbLTMsIDRdKS5pbnZlcnNlKCkgPT4gLTQgLyAzXG4gICAgICoqL1xuICAgIFwiaW52ZXJzZVwiOiBmdW5jdGlvbigpIHtcblxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKHRoaXNbXCJzXCJdICogdGhpc1tcImRcIl0sIHRoaXNbXCJuXCJdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgZnJhY3Rpb24gdG8gc29tZSByYXRpb25hbCBleHBvbmVudCwgaWYgcG9zc2libGVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oLTEsMikucG93KC0zKSA9PiAtOFxuICAgICAqL1xuICAgIFwicG93XCI6IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgICAgcGFyc2UoYSwgYik7XG5cbiAgICAgIC8vIFRyaXZpYWwgY2FzZSB3aGVuIGV4cCBpcyBhbiBpbnRlZ2VyXG5cbiAgICAgIGlmIChQWydkJ10gPT09IDEpIHtcblxuICAgICAgICBpZiAoUFsncyddIDwgMCkge1xuICAgICAgICAgIHJldHVybiBuZXdGcmFjdGlvbihNYXRoLnBvdyh0aGlzWydzJ10gKiB0aGlzW1wiZFwiXSwgUFsnbiddKSwgTWF0aC5wb3codGhpc1tcIm5cIl0sIFBbJ24nXSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXdGcmFjdGlvbihNYXRoLnBvdyh0aGlzWydzJ10gKiB0aGlzW1wiblwiXSwgUFsnbiddKSwgTWF0aC5wb3codGhpc1tcImRcIl0sIFBbJ24nXSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE5lZ2F0aXZlIHJvb3RzIGJlY29tZSBjb21wbGV4XG4gICAgICAvLyAgICAgKC1hL2IpXihjL2QpID0geFxuICAgICAgLy8gPD0+ICgtMSleKGMvZCkgKiAoYS9iKV4oYy9kKSA9IHhcbiAgICAgIC8vIDw9PiAoY29zKHBpKSArIGkqc2luKHBpKSleKGMvZCkgKiAoYS9iKV4oYy9kKSA9IHggICAgICAgICAjIHJvdGF0ZSAxIGJ5IDE4MMKwXG4gICAgICAvLyA8PT4gKGNvcyhjKnBpL2QpICsgaSpzaW4oYypwaS9kKSkgKiAoYS9iKV4oYy9kKSA9IHggICAgICAgIyBEZU1vaXZyZSdzIGZvcm11bGEgaW4gUSAoIGh0dHBzOi8vcHJvb2Z3aWtpLm9yZy93aWtpL0RlX01vaXZyZSUyN3NfRm9ybXVsYS9SYXRpb25hbF9JbmRleCApXG4gICAgICAvLyBGcm9tIHdoaWNoIGZvbGxvd3MgdGhhdCBvbmx5IGZvciBjPTAgdGhlIHJvb3QgaXMgbm9uLWNvbXBsZXguIGMvZCBpcyBhIHJlZHVjZWQgZnJhY3Rpb24sIHNvIHRoYXQgc2luKGMvZHBpKT0wIG9jY3VycyBmb3IgZD0xLCB3aGljaCBpcyBoYW5kbGVkIGJ5IG91ciB0cml2aWFsIGNhc2UuXG4gICAgICBpZiAodGhpc1sncyddIDwgMCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIC8vIE5vdyBwcmltZSBmYWN0b3IgbiBhbmQgZFxuICAgICAgdmFyIE4gPSBmYWN0b3JpemUodGhpc1snbiddKTtcbiAgICAgIHZhciBEID0gZmFjdG9yaXplKHRoaXNbJ2QnXSk7XG5cbiAgICAgIC8vIEV4cG9uZW50aWF0ZSBhbmQgdGFrZSByb290IGZvciBuIGFuZCBkIGluZGl2aWR1YWxseVxuICAgICAgdmFyIG4gPSAxO1xuICAgICAgdmFyIGQgPSAxO1xuICAgICAgZm9yICh2YXIgayBpbiBOKSB7XG4gICAgICAgIGlmIChrID09PSAnMScpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoayA9PT0gJzAnKSB7XG4gICAgICAgICAgbiA9IDA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgTltrXSo9IFBbJ24nXTtcblxuICAgICAgICBpZiAoTltrXSAlIFBbJ2QnXSA9PT0gMCkge1xuICAgICAgICAgIE5ba10vPSBQWydkJ107XG4gICAgICAgIH0gZWxzZSByZXR1cm4gbnVsbDtcbiAgICAgICAgbio9IE1hdGgucG93KGssIE5ba10pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBrIGluIEQpIHtcbiAgICAgICAgaWYgKGsgPT09ICcxJykgY29udGludWU7XG4gICAgICAgIERba10qPSBQWyduJ107XG5cbiAgICAgICAgaWYgKERba10gJSBQWydkJ10gPT09IDApIHtcbiAgICAgICAgICBEW2tdLz0gUFsnZCddO1xuICAgICAgICB9IGVsc2UgcmV0dXJuIG51bGw7XG4gICAgICAgIGQqPSBNYXRoLnBvdyhrLCBEW2tdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKFBbJ3MnXSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKGQsIG4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ld0ZyYWN0aW9uKG4sIGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oMTkuNikuZXF1YWxzKFs5OCwgNV0pO1xuICAgICAqKi9cbiAgICBcImVxdWFsc1wiOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgIHBhcnNlKGEsIGIpO1xuICAgICAgcmV0dXJuIHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSA9PT0gUFtcInNcIl0gKiBQW1wiblwiXSAqIHRoaXNbXCJkXCJdOyAvLyBTYW1lIGFzIGNvbXBhcmUoKSA9PT0gMFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gcmF0aW9uYWwgbnVtYmVycyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oMTkuNikuZXF1YWxzKFs5OCwgNV0pO1xuICAgICAqKi9cbiAgICBcImNvbXBhcmVcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHZhciB0ID0gKHRoaXNbXCJzXCJdICogdGhpc1tcIm5cIl0gKiBQW1wiZFwiXSAtIFBbXCJzXCJdICogUFtcIm5cIl0gKiB0aGlzW1wiZFwiXSk7XG4gICAgICByZXR1cm4gKDAgPCB0KSAtICh0IDwgMCk7XG4gICAgfSxcblxuICAgIFwic2ltcGxpZnlcIjogZnVuY3Rpb24oZXBzKSB7XG5cbiAgICAgIGlmIChpc05hTih0aGlzWyduJ10pIHx8IGlzTmFOKHRoaXNbJ2QnXSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGVwcyA9IGVwcyB8fCAwLjAwMTtcblxuICAgICAgdmFyIHRoaXNBQlMgPSB0aGlzWydhYnMnXSgpO1xuICAgICAgdmFyIGNvbnQgPSB0aGlzQUJTWyd0b0NvbnRpbnVlZCddKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgY29udC5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBzID0gbmV3RnJhY3Rpb24oY29udFtpIC0gMV0sIDEpO1xuICAgICAgICBmb3IgKHZhciBrID0gaSAtIDI7IGsgPj0gMDsgay0tKSB7XG4gICAgICAgICAgcyA9IHNbJ2ludmVyc2UnXSgpWydhZGQnXShjb250W2tdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzWydzdWInXSh0aGlzQUJTKVsnYWJzJ10oKS52YWx1ZU9mKCkgPCBlcHMpIHtcbiAgICAgICAgICByZXR1cm4gc1snbXVsJ10odGhpc1sncyddKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHR3byByYXRpb25hbCBudW1iZXJzIGFyZSBkaXZpc2libGVcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oMTkuNikuZGl2aXNpYmxlKDEuNSk7XG4gICAgICovXG4gICAgXCJkaXZpc2libGVcIjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgICBwYXJzZShhLCBiKTtcbiAgICAgIHJldHVybiAhKCEoUFtcIm5cIl0gKiB0aGlzW1wiZFwiXSkgfHwgKCh0aGlzW1wiblwiXSAqIFBbXCJkXCJdKSAlIChQW1wiblwiXSAqIHRoaXNbXCJkXCJdKSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZGVjaW1hbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZnJhY3Rpb25cbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCIxMDAuJzkxODIzJ1wiKS52YWx1ZU9mKCkgPT4gMTAwLjkxODIzOTE4MjM5MTgzXG4gICAgICoqL1xuICAgICd2YWx1ZU9mJzogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHJldHVybiB0aGlzW1wic1wiXSAqIHRoaXNbXCJuXCJdIC8gdGhpc1tcImRcIl07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmctZnJhY3Rpb24gcmVwcmVzZW50YXRpb24gb2YgYSBGcmFjdGlvbiBvYmplY3RcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCIxLiczJ1wiKS50b0ZyYWN0aW9uKHRydWUpID0+IFwiNCAxLzNcIlxuICAgICAqKi9cbiAgICAndG9GcmFjdGlvbic6IGZ1bmN0aW9uKGV4Y2x1ZGVXaG9sZSkge1xuXG4gICAgICB2YXIgd2hvbGUsIHN0ciA9IFwiXCI7XG4gICAgICB2YXIgbiA9IHRoaXNbXCJuXCJdO1xuICAgICAgdmFyIGQgPSB0aGlzW1wiZFwiXTtcbiAgICAgIGlmICh0aGlzW1wic1wiXSA8IDApIHtcbiAgICAgICAgc3RyKz0gJy0nO1xuICAgICAgfVxuXG4gICAgICBpZiAoZCA9PT0gMSkge1xuICAgICAgICBzdHIrPSBuO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICBpZiAoZXhjbHVkZVdob2xlICYmICh3aG9sZSA9IE1hdGguZmxvb3IobiAvIGQpKSA+IDApIHtcbiAgICAgICAgICBzdHIrPSB3aG9sZTtcbiAgICAgICAgICBzdHIrPSBcIiBcIjtcbiAgICAgICAgICBuJT0gZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0cis9IG47XG4gICAgICAgIHN0cis9ICcvJztcbiAgICAgICAgc3RyKz0gZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsYXRleCByZXByZXNlbnRhdGlvbiBvZiBhIEZyYWN0aW9uIG9iamVjdFxuICAgICAqXG4gICAgICogRXg6IG5ldyBGcmFjdGlvbihcIjEuJzMnXCIpLnRvTGF0ZXgoKSA9PiBcIlxcZnJhY3s0fXszfVwiXG4gICAgICoqL1xuICAgICd0b0xhdGV4JzogZnVuY3Rpb24oZXhjbHVkZVdob2xlKSB7XG5cbiAgICAgIHZhciB3aG9sZSwgc3RyID0gXCJcIjtcbiAgICAgIHZhciBuID0gdGhpc1tcIm5cIl07XG4gICAgICB2YXIgZCA9IHRoaXNbXCJkXCJdO1xuICAgICAgaWYgKHRoaXNbXCJzXCJdIDwgMCkge1xuICAgICAgICBzdHIrPSAnLSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChkID09PSAxKSB7XG4gICAgICAgIHN0cis9IG47XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIGlmIChleGNsdWRlV2hvbGUgJiYgKHdob2xlID0gTWF0aC5mbG9vcihuIC8gZCkpID4gMCkge1xuICAgICAgICAgIHN0cis9IHdob2xlO1xuICAgICAgICAgIG4lPSBkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyKz0gXCJcXFxcZnJhY3tcIjtcbiAgICAgICAgc3RyKz0gbjtcbiAgICAgICAgc3RyKz0gJ317JztcbiAgICAgICAgc3RyKz0gZDtcbiAgICAgICAgc3RyKz0gJ30nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBjb250aW51ZWQgZnJhY3Rpb24gZWxlbWVudHNcbiAgICAgKlxuICAgICAqIEV4OiBuZXcgRnJhY3Rpb24oXCI3LzhcIikudG9Db250aW51ZWQoKSA9PiBbMCwxLDddXG4gICAgICovXG4gICAgJ3RvQ29udGludWVkJzogZnVuY3Rpb24oKSB7XG5cbiAgICAgIHZhciB0O1xuICAgICAgdmFyIGEgPSB0aGlzWyduJ107XG4gICAgICB2YXIgYiA9IHRoaXNbJ2QnXTtcbiAgICAgIHZhciByZXMgPSBbXTtcblxuICAgICAgaWYgKGlzTmFOKGEpIHx8IGlzTmFOKGIpKSB7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG5cbiAgICAgIGRvIHtcbiAgICAgICAgcmVzLnB1c2goTWF0aC5mbG9vcihhIC8gYikpO1xuICAgICAgICB0ID0gYSAlIGI7XG4gICAgICAgIGEgPSBiO1xuICAgICAgICBiID0gdDtcbiAgICAgIH0gd2hpbGUgKGEgIT09IDEpO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgZnJhY3Rpb24gd2l0aCBhbGwgZGlnaXRzXG4gICAgICpcbiAgICAgKiBFeDogbmV3IEZyYWN0aW9uKFwiMTAwLic5MTgyMydcIikudG9TdHJpbmcoKSA9PiBcIjEwMC4oOTE4MjMpXCJcbiAgICAgKiovXG4gICAgJ3RvU3RyaW5nJzogZnVuY3Rpb24oZGVjKSB7XG5cbiAgICAgIHZhciBOID0gdGhpc1tcIm5cIl07XG4gICAgICB2YXIgRCA9IHRoaXNbXCJkXCJdO1xuXG4gICAgICBpZiAoaXNOYU4oTikgfHwgaXNOYU4oRCkpIHtcbiAgICAgICAgcmV0dXJuIFwiTmFOXCI7XG4gICAgICB9XG5cbiAgICAgIGRlYyA9IGRlYyB8fCAxNTsgLy8gMTUgPSBkZWNpbWFsIHBsYWNlcyB3aGVuIG5vIHJlcGV0YXRpb25cblxuICAgICAgdmFyIGN5Y0xlbiA9IGN5Y2xlTGVuKE4sIEQpOyAvLyBDeWNsZSBsZW5ndGhcbiAgICAgIHZhciBjeWNPZmYgPSBjeWNsZVN0YXJ0KE4sIEQsIGN5Y0xlbik7IC8vIEN5Y2xlIHN0YXJ0XG5cbiAgICAgIHZhciBzdHIgPSB0aGlzWydzJ10gPCAwID8gXCItXCIgOiBcIlwiO1xuXG4gICAgICBzdHIrPSBOIC8gRCB8IDA7XG5cbiAgICAgIE4lPSBEO1xuICAgICAgTio9IDEwO1xuXG4gICAgICBpZiAoTilcbiAgICAgICAgc3RyKz0gXCIuXCI7XG5cbiAgICAgIGlmIChjeWNMZW4pIHtcblxuICAgICAgICBmb3IgKHZhciBpID0gY3ljT2ZmOyBpLS07KSB7XG4gICAgICAgICAgc3RyKz0gTiAvIEQgfCAwO1xuICAgICAgICAgIE4lPSBEO1xuICAgICAgICAgIE4qPSAxMDtcbiAgICAgICAgfVxuICAgICAgICBzdHIrPSBcIihcIjtcbiAgICAgICAgZm9yICh2YXIgaSA9IGN5Y0xlbjsgaS0tOykge1xuICAgICAgICAgIHN0cis9IE4gLyBEIHwgMDtcbiAgICAgICAgICBOJT0gRDtcbiAgICAgICAgICBOKj0gMTA7XG4gICAgICAgIH1cbiAgICAgICAgc3RyKz0gXCIpXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gZGVjOyBOICYmIGktLTspIHtcbiAgICAgICAgICBzdHIrPSBOIC8gRCB8IDA7XG4gICAgICAgICAgTiU9IEQ7XG4gICAgICAgICAgTio9IDEwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZVtcImFtZFwiXSkge1xuICAgIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRnJhY3Rpb247XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRnJhY3Rpb24sIFwiX19lc01vZHVsZVwiLCB7ICd2YWx1ZSc6IHRydWUgfSk7XG4gICAgRnJhY3Rpb25bJ2RlZmF1bHQnXSA9IEZyYWN0aW9uO1xuICAgIEZyYWN0aW9uWydGcmFjdGlvbiddID0gRnJhY3Rpb247XG4gICAgbW9kdWxlWydleHBvcnRzJ10gPSBGcmFjdGlvbjtcbiAgfSBlbHNlIHtcbiAgICByb290WydGcmFjdGlvbiddID0gRnJhY3Rpb247XG4gIH1cblxufSkodGhpcyk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW1wiZXhwb3J0c1wiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KGV4cG9ydHMpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtb2QgPSB7XG4gICAgICBleHBvcnRzOiB7fVxuICAgIH07XG4gICAgZmFjdG9yeShtb2QuZXhwb3J0cyk7XG4gICAgZ2xvYmFsLmpzdG94bWwgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24gKF9leHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgX2V4cG9ydHMudG9YTUwgPSBfZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuICBmdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7IH1cbiAgZnVuY3Rpb24gX25vbkl0ZXJhYmxlU3ByZWFkKCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIHNwcmVhZCBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfVxuICBmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5KGl0ZXIpIHsgaWYgKHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgaXRlcltTeW1ib2wuaXRlcmF0b3JdICE9IG51bGwgfHwgaXRlcltcIkBAaXRlcmF0b3JcIl0gIT0gbnVsbCkgcmV0dXJuIEFycmF5LmZyb20oaXRlcik7IH1cbiAgZnVuY3Rpb24gX2FycmF5V2l0aG91dEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkoYXJyKTsgfVxuICBmdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgZW51bWVyYWJsZU9ubHkgJiYgKHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KSksIGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuICBmdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gbnVsbCAhPSBhcmd1bWVudHNbaV0gPyBhcmd1bWVudHNbaV0gOiB7fTsgaSAlIDIgPyBvd25LZXlzKE9iamVjdChzb3VyY2UpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKSA6IG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gcmV0dXJuIHRhcmdldDsgfVxuICBmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuICBmdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHsgcmV0dXJuIF9hcnJheVdpdGhIb2xlcyhhcnIpIHx8IF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IF9ub25JdGVyYWJsZVJlc3QoKTsgfVxuICBmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9XG4gIGZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuICBmdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH1cbiAgZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgeyB2YXIgX2kgPSBhcnIgPT0gbnVsbCA/IG51bGwgOiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGFycltTeW1ib2wuaXRlcmF0b3JdIHx8IGFycltcIkBAaXRlcmF0b3JcIl07IGlmIChfaSA9PSBudWxsKSByZXR1cm47IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX3MsIF9lOyB0cnkgeyBmb3IgKF9pID0gX2kuY2FsbChhcnIpOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH1cbiAgZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyOyB9XG4gIGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgcmV0dXJuIF90eXBlb2YgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBcInN5bWJvbFwiID09IHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9LCBfdHlwZW9mKG9iaik7IH1cbiAgdmFyIERBVEFfVFlQRVMgPSB7XG4gICAgQVJSQVk6ICdhcnJheScsXG4gICAgQk9PTEVBTjogJ2Jvb2xlYW4nLFxuICAgIERBVEU6ICdkYXRlJyxcbiAgICBGVU5DVElPTjogJ2Z1bmN0aW9uJyxcbiAgICBKU1RPWE1MX09CSkVDVDogJ2pzdG94bWwtb2JqZWN0JyxcbiAgICBOVUxMOiAnbnVsbCcsXG4gICAgTlVNQkVSOiAnbnVtYmVyJyxcbiAgICBPQkpFQ1Q6ICdvYmplY3QnLFxuICAgIFNUUklORzogJ3N0cmluZydcbiAgfTtcbiAgdmFyIFBSSU1JVElWRV9UWVBFUyA9IFtEQVRBX1RZUEVTLlNUUklORywgREFUQV9UWVBFUy5OVU1CRVIsIERBVEFfVFlQRVMuQk9PTEVBTl07XG4gIHZhciBERUZBVUxUX1hNTF9IRUFERVIgPSAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+JztcbiAgdmFyIFBSSVZBVEVfVkFSUyA9IFsnX3NlbGZDbG9zZVRhZycsICdfYXR0cnMnXTtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB0aGUgaW5kZW50IHN0cmluZyBiYXNlZCBvbiBjdXJyZW50IHRyZWUgZGVwdGguXG4gICAqL1xuICB2YXIgZ2V0SW5kZW50U3RyID0gZnVuY3Rpb24gZ2V0SW5kZW50U3RyKCkge1xuICAgIHZhciBpbmRlbnQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgIHZhciBkZXB0aCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogMDtcbiAgICByZXR1cm4gaW5kZW50LnJlcGVhdChkZXB0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN1Z2FyIGZ1bmN0aW9uIHN1cHBsZW1lbnRpbmcgSlMncyBxdWlya3kgdHlwZW9mIG9wZXJhdG9yLCBwbHVzIHNvbWUgZXh0cmEgaGVscCB0byBkZXRlY3RcbiAgICogXCJzcGVjaWFsIG9iamVjdHNcIiBleHBlY3RlZCBieSBqc3RveG1sLlxuICAgKiBAZXhhbXBsZVxuICAgKiBnZXRUeXBlKG5ldyBEYXRlKCkpO1xuICAgKiAvLyAtPiAnZGF0ZSdcbiAgICovXG4gIHZhciBnZXRUeXBlID0gZnVuY3Rpb24gZ2V0VHlwZSh2YWwpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpICYmIERBVEFfVFlQRVMuQVJSQVkgfHwgX3R5cGVvZih2YWwpID09PSBEQVRBX1RZUEVTLk9CSkVDVCAmJiB2YWwgIT09IG51bGwgJiYgdmFsLl9uYW1lICYmIERBVEFfVFlQRVMuSlNUT1hNTF9PQkpFQ1QgfHwgdmFsIGluc3RhbmNlb2YgRGF0ZSAmJiBEQVRBX1RZUEVTLkRBVEUgfHwgdmFsID09PSBudWxsICYmIERBVEFfVFlQRVMuTlVMTCB8fCBfdHlwZW9mKHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSBzdHJpbmcgaXMgQ0RBVEEgYW5kIHNob3VsZG4ndCBiZSB0b3VjaGVkLlxuICAgKiBAZXhhbXBsZVxuICAgKiBpc0NEQVRBKCc8IVtDREFUQVs8Yj50ZXN0PC9iPl1dPicpO1xuICAgKiAvLyAtPiB0cnVlXG4gICAqL1xuICB2YXIgaXNDREFUQSA9IGZ1bmN0aW9uIGlzQ0RBVEEoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5zdGFydHNXaXRoKCc8IVtDREFUQVsnKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZXMgbWF0Y2hpbmcgdmFsdWVzIGluIGEgc3RyaW5nIHdpdGggYSBuZXcgdmFsdWUuXG4gICAqIEBleGFtcGxlXG4gICAqIG1hcFN0cignZm9vJmJhcicsIHsgJyYnOiAnJmFtcDsnIH0pO1xuICAgKiAvLyAtPiAnZm9vJmFtcDtiYXInXG4gICAqL1xuICB2YXIgbWFwU3RyID0gZnVuY3Rpb24gbWFwU3RyKCkge1xuICAgIHZhciBpbnB1dCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gICAgdmFyIHJlcGxhY2VtZW50cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdmFyIGNvbnRlbnRNYXAgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IGFyZ3VtZW50c1syXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgb3V0cHV0ID0gaW5wdXQ7XG4gICAgaWYgKF90eXBlb2YoaW5wdXQpID09PSBEQVRBX1RZUEVTLlNUUklORykge1xuICAgICAgaWYgKGlzQ0RBVEEoaW5wdXQpKSB7XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgIH1cbiAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKFwiKFwiLmNvbmNhdChPYmplY3Qua2V5cyhyZXBsYWNlbWVudHMpLmpvaW4oJ3wnKSwgXCIpKD8hKFxcXFx3fCMpKjspXCIpLCAnZycpO1xuICAgICAgb3V0cHV0ID0gU3RyaW5nKGlucHV0KS5yZXBsYWNlKHJlZ2V4cCwgZnVuY3Rpb24gKHN0ciwgZW50aXR5KSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlbWVudHNbZW50aXR5XSB8fCAnJztcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGNvbnRlbnRNYXAgPT09ICdmdW5jdGlvbicgPyBjb250ZW50TWFwKG91dHB1dCkgOiBvdXRwdXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcHMgYW4gb2JqZWN0IG9yIGFycmF5IG9mIGFycmlidXRlIGtleXZhbCBwYWlycyB0byBhIHN0cmluZy5cbiAgICogQGV4YW1wbGVcbiAgICogZ2V0QXR0cmlidXRlS2V5VmFscyh7IGZvbzogJ2JhcicsIGJhejogJ2cnIH0pO1xuICAgKiAvLyAtPiAnZm9vPVwiYmFyXCIgYmF6PVwiZ1wiJ1xuICAgKiBnZXRBdHRyaWJ1dGVLZXlWYWxzKFsgeyDimqE6IHRydWUgfSwgeyBmb286ICdiYXInIH0gXSk7XG4gICAqIC8vIC0+ICfimqEgZm9vPVwiYmFyXCInXG4gICAqL1xuICB2YXIgZ2V0QXR0cmlidXRlS2V5VmFscyA9IGZ1bmN0aW9uIGdldEF0dHJpYnV0ZUtleVZhbHMoKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciByZXBsYWNlbWVudHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIG91dHB1dEV4cGxpY2l0VHJ1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzID8gYXJndW1lbnRzWzNdIDogdW5kZWZpbmVkO1xuICAgIC8vIE5vcm1hbGl6ZXMgYmV0d2VlbiBhdHRyaWJ1dGVzIGFzIG9iamVjdCBhbmQgYXMgYXJyYXkuXG4gICAgdmFyIGF0dHJpYnV0ZXNBcnIgPSBBcnJheS5pc0FycmF5KGF0dHJpYnV0ZXMpID8gYXR0cmlidXRlcyA6IE9iamVjdC5lbnRyaWVzKGF0dHJpYnV0ZXMpLm1hcChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgdmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMiksXG4gICAgICAgIGtleSA9IF9yZWYyWzBdLFxuICAgICAgICB2YWwgPSBfcmVmMlsxXTtcbiAgICAgIHJldHVybiBfZGVmaW5lUHJvcGVydHkoe30sIGtleSwgdmFsKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXR0cmlidXRlc0Fyci5yZWR1Y2UoZnVuY3Rpb24gKGFsbEF0dHJpYnV0ZXMsIGF0dHIpIHtcbiAgICAgIHZhciBrZXkgPSBPYmplY3Qua2V5cyhhdHRyKVswXTtcbiAgICAgIHZhciB2YWwgPSBhdHRyW2tleV07XG4gICAgICBpZiAoX3R5cGVvZihmaWx0ZXIpID09PSBEQVRBX1RZUEVTLkZVTkNUSU9OKSB7XG4gICAgICAgIHZhciBzaG91bGRGaWx0ZXJPdXQgPSBmaWx0ZXIoa2V5LCB2YWwpO1xuICAgICAgICBpZiAoc2hvdWxkRmlsdGVyT3V0KSB7XG4gICAgICAgICAgcmV0dXJuIGFsbEF0dHJpYnV0ZXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByZXBsYWNlZFZhbCA9IHJlcGxhY2VtZW50cyA/IG1hcFN0cih2YWwsIHJlcGxhY2VtZW50cykgOiB2YWw7XG4gICAgICB2YXIgdmFsU3RyID0gIW91dHB1dEV4cGxpY2l0VHJ1ZSAmJiByZXBsYWNlZFZhbCA9PT0gdHJ1ZSA/ICcnIDogXCI9XFxcIlwiLmNvbmNhdChyZXBsYWNlZFZhbCwgXCJcXFwiXCIpO1xuICAgICAgYWxsQXR0cmlidXRlcy5wdXNoKFwiXCIuY29uY2F0KGtleSkuY29uY2F0KHZhbFN0cikpO1xuICAgICAgcmV0dXJuIGFsbEF0dHJpYnV0ZXM7XG4gICAgfSwgW10pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBhdHRyaWJ1dGVzIG9iamVjdC9hcnJheSB0byBhIHN0cmluZyBvZiBrZXl2YWwgcGFpcnMuXG4gICAqIEBleGFtcGxlXG4gICAqIGZvcm1hdEF0dHJpYnV0ZXMoeyBhOiAxLCBiOiAyIH0pXG4gICAqIC8vIC0+ICdhPVwiMVwiIGI9XCIyXCInXG4gICAqL1xuICB2YXIgZm9ybWF0QXR0cmlidXRlcyA9IGZ1bmN0aW9uIGZvcm1hdEF0dHJpYnV0ZXMoKSB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgIHZhciByZXBsYWNlbWVudHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgZmlsdGVyID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQ7XG4gICAgdmFyIG91dHB1dEV4cGxpY2l0VHJ1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzID8gYXJndW1lbnRzWzNdIDogdW5kZWZpbmVkO1xuICAgIHZhciBrZXlWYWxzID0gZ2V0QXR0cmlidXRlS2V5VmFscyhhdHRyaWJ1dGVzLCByZXBsYWNlbWVudHMsIGZpbHRlciwgb3V0cHV0RXhwbGljaXRUcnVlKTtcbiAgICBpZiAoa2V5VmFscy5sZW5ndGggPT09IDApIHJldHVybiAnJztcbiAgICB2YXIga2V5c1ZhbHNKb2luZWQgPSBrZXlWYWxzLmpvaW4oJyAnKTtcbiAgICByZXR1cm4gXCIgXCIuY29uY2F0KGtleXNWYWxzSm9pbmVkKTtcbiAgfTtcblxuICAvKipcbiAgICogQ29udmVydHMgYW4gb2JqZWN0IGludG8gYW4gYXJyYXkgb2YganN0b3htbC1vYmplY3QuXG4gICAqIEBleGFtcGxlXG4gICAqIG9ialRvQXJyYXkoeyBmb286ICdiYXInLCBiYXo6IDIgfSk7XG4gICAqIC0+XG4gICAqIFtcbiAgICogICB7XG4gICAqICAgICBfbmFtZTogJ2ZvbycsXG4gICAqICAgICBfY29udGVudDogJ2JhcidcbiAgICogICB9LFxuICAgKiAgIHtcbiAgICogICAgIF9uYW1lOiAnYmF6JyxcbiAgICogICAgIF9jb250ZW50OiAyXG4gICAqICAgfVxuICAgKiBdXG4gICAqL1xuICB2YXIgb2JqVG9BcnJheSA9IGZ1bmN0aW9uIG9ialRvQXJyYXkoKSB7XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIF9uYW1lOiBrZXksXG4gICAgICAgIF9jb250ZW50OiBvYmpba2V5XVxuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBhIHZhbHVlIGlzIGEgcHJpbWl0aXZlIEphdmFTY3JpcHQgdmFsdWUgKG5vdCBpbmNsdWRpbmcgU3ltYm9sKS5cbiAgICogQGV4YW1wbGVcbiAgICogaXNQcmltaXRpdmUoNCk7XG4gICAqIC8vIC0+IHRydWVcbiAgICovXG4gIHZhciBpc1ByaW1pdGl2ZSA9IGZ1bmN0aW9uIGlzUHJpbWl0aXZlKHZhbCkge1xuICAgIHJldHVybiBQUklNSVRJVkVfVFlQRVMuaW5jbHVkZXMoZ2V0VHlwZSh2YWwpKTtcbiAgfTtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBhbiBYTUwgc3RyaW5nIGlzIHNpbXBsZSAoZG9lc24ndCBjb250YWluIG5lc3RlZCBYTUwgZGF0YSkuXG4gICAqIEBleGFtcGxlXG4gICAqIGlzU2ltcGxlWE1MKCc8Zm9vIC8+Jyk7XG4gICAqIC8vIC0+IGZhbHNlXG4gICAqL1xuICB2YXIgaXNTaW1wbGVYTUwgPSBmdW5jdGlvbiBpc1NpbXBsZVhNTCh4bWxTdHIpIHtcbiAgICByZXR1cm4gIXhtbFN0ci5tYXRjaCgnPCcpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlbWJsZXMgYW4gWE1MIGhlYWRlciBhcyBkZWZpbmVkIGJ5IHRoZSBjb25maWcuXG4gICAqL1xuICB2YXIgZ2V0SGVhZGVyU3RyaW5nID0gZnVuY3Rpb24gZ2V0SGVhZGVyU3RyaW5nKF9yZWY0KSB7XG4gICAgdmFyIGhlYWRlciA9IF9yZWY0LmhlYWRlcixcbiAgICAgIGlzT3V0cHV0U3RhcnQgPSBfcmVmNC5pc091dHB1dFN0YXJ0O1xuICAgIHZhciBzaG91bGRPdXRwdXRIZWFkZXIgPSBoZWFkZXIgJiYgaXNPdXRwdXRTdGFydDtcbiAgICBpZiAoIXNob3VsZE91dHB1dEhlYWRlcikgcmV0dXJuICcnO1xuICAgIHZhciBzaG91bGRVc2VEZWZhdWx0SGVhZGVyID0gX3R5cGVvZihoZWFkZXIpID09PSBEQVRBX1RZUEVTLkJPT0xFQU47XG4gICAgcmV0dXJuIHNob3VsZFVzZURlZmF1bHRIZWFkZXIgPyBERUZBVUxUX1hNTF9IRUFERVIgOiBoZWFkZXI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IHRyYXZlcnNlcyBhbiBvYmplY3QgdHJlZSBhbmQgY29udmVydHMgdGhlIG91dHB1dCB0byBhbiBYTUwgc3RyaW5nLlxuICAgKiBAZXhhbXBsZVxuICAgKiB0b1hNTCh7IGZvbzogJ2JhcicgfSk7XG4gICAqIC8vIC0+IDxmb28+YmFyPC9mb28+XG4gICAqL1xuICB2YXIgZGVmYXVsdEVudGl0eVJlcGxhY2VtZW50cyA9IHtcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJ1wiJzogJyZxdW90OydcbiAgfTtcbiAgdmFyIHRvWE1MID0gZnVuY3Rpb24gdG9YTUwoKSB7XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgdmFyIGNvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gICAgdmFyIF9jb25maWckZGVwdGggPSBjb25maWcuZGVwdGgsXG4gICAgICBkZXB0aCA9IF9jb25maWckZGVwdGggPT09IHZvaWQgMCA/IDAgOiBfY29uZmlnJGRlcHRoLFxuICAgICAgaW5kZW50ID0gY29uZmlnLmluZGVudCxcbiAgICAgIF9pc0ZpcnN0SXRlbSA9IGNvbmZpZy5faXNGaXJzdEl0ZW0sXG4gICAgICBfY29uZmlnJF9pc091dHB1dFN0YXIgPSBjb25maWcuX2lzT3V0cHV0U3RhcnQsXG4gICAgICBfaXNPdXRwdXRTdGFydCA9IF9jb25maWckX2lzT3V0cHV0U3RhciA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9jb25maWckX2lzT3V0cHV0U3RhcixcbiAgICAgIGhlYWRlciA9IGNvbmZpZy5oZWFkZXIsXG4gICAgICBfY29uZmlnJGF0dHJpYnV0ZVJlcGwgPSBjb25maWcuYXR0cmlidXRlUmVwbGFjZW1lbnRzLFxuICAgICAgcmF3QXR0cmlidXRlUmVwbGFjZW1lbnRzID0gX2NvbmZpZyRhdHRyaWJ1dGVSZXBsID09PSB2b2lkIDAgPyB7fSA6IF9jb25maWckYXR0cmlidXRlUmVwbCxcbiAgICAgIGF0dHJpYnV0ZUZpbHRlciA9IGNvbmZpZy5hdHRyaWJ1dGVGaWx0ZXIsXG4gICAgICBfY29uZmlnJGF0dHJpYnV0ZUV4cGwgPSBjb25maWcuYXR0cmlidXRlRXhwbGljaXRUcnVlLFxuICAgICAgYXR0cmlidXRlRXhwbGljaXRUcnVlID0gX2NvbmZpZyRhdHRyaWJ1dGVFeHBsID09PSB2b2lkIDAgPyBmYWxzZSA6IF9jb25maWckYXR0cmlidXRlRXhwbCxcbiAgICAgIF9jb25maWckY29udGVudFJlcGxhYyA9IGNvbmZpZy5jb250ZW50UmVwbGFjZW1lbnRzLFxuICAgICAgcmF3Q29udGVudFJlcGxhY2VtZW50cyA9IF9jb25maWckY29udGVudFJlcGxhYyA9PT0gdm9pZCAwID8ge30gOiBfY29uZmlnJGNvbnRlbnRSZXBsYWMsXG4gICAgICBjb250ZW50TWFwID0gY29uZmlnLmNvbnRlbnRNYXAsXG4gICAgICBfY29uZmlnJHNlbGZDbG9zZVRhZ3MgPSBjb25maWcuc2VsZkNsb3NlVGFncyxcbiAgICAgIHNlbGZDbG9zZVRhZ3MgPSBfY29uZmlnJHNlbGZDbG9zZVRhZ3MgPT09IHZvaWQgMCA/IHRydWUgOiBfY29uZmlnJHNlbGZDbG9zZVRhZ3M7XG4gICAgdmFyIHNob3VsZFR1cm5PZmZBdHRyaWJ1dGVSZXBsYWNlbWVudHMgPSB0eXBlb2YgcmF3QXR0cmlidXRlUmVwbGFjZW1lbnRzID09PSAnYm9vbGVhbicgJiYgIXJhd0F0dHJpYnV0ZVJlcGxhY2VtZW50cztcbiAgICB2YXIgYXR0cmlidXRlUmVwbGFjZW1lbnRzID0gc2hvdWxkVHVybk9mZkF0dHJpYnV0ZVJlcGxhY2VtZW50cyA/IHt9IDogX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBkZWZhdWx0RW50aXR5UmVwbGFjZW1lbnRzKSwgcmF3QXR0cmlidXRlUmVwbGFjZW1lbnRzKTtcbiAgICB2YXIgc2hvdWxkVHVybk9mZkNvbnRlbnRSZXBsYWNlbWVudHMgPSB0eXBlb2YgcmF3Q29udGVudFJlcGxhY2VtZW50cyA9PT0gJ2Jvb2xlYW4nICYmICFyYXdDb250ZW50UmVwbGFjZW1lbnRzO1xuICAgIHZhciBjb250ZW50UmVwbGFjZW1lbnRzID0gc2hvdWxkVHVybk9mZkNvbnRlbnRSZXBsYWNlbWVudHMgPyB7fSA6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZGVmYXVsdEVudGl0eVJlcGxhY2VtZW50cyksIHJhd0NvbnRlbnRSZXBsYWNlbWVudHMpO1xuXG4gICAgLy8gRGV0ZXJtaW5lcyBpbmRlbnQgYmFzZWQgb24gZGVwdGguXG4gICAgdmFyIGluZGVudFN0ciA9IGdldEluZGVudFN0cihpbmRlbnQsIGRlcHRoKTtcblxuICAgIC8vIEZvciBicmFuY2hpbmcgYmFzZWQgb24gdmFsdWUgdHlwZS5cbiAgICB2YXIgdmFsVHlwZSA9IGdldFR5cGUob2JqKTtcbiAgICB2YXIgaGVhZGVyU3RyID0gZ2V0SGVhZGVyU3RyaW5nKHtcbiAgICAgIGhlYWRlcjogaGVhZGVyLFxuICAgICAgaW5kZW50OiBpbmRlbnQsXG4gICAgICBkZXB0aDogZGVwdGgsXG4gICAgICBpc091dHB1dFN0YXJ0OiBfaXNPdXRwdXRTdGFydFxuICAgIH0pO1xuICAgIHZhciBpc091dHB1dFN0YXJ0ID0gX2lzT3V0cHV0U3RhcnQgJiYgIWhlYWRlclN0ciAmJiBfaXNGaXJzdEl0ZW0gJiYgZGVwdGggPT09IDA7XG4gICAgdmFyIHByZUluZGVudFN0ciA9IGluZGVudCAmJiAhaXNPdXRwdXRTdGFydCA/ICdcXG4nIDogJyc7XG4gICAgdmFyIG91dHB1dFN0ciA9ICcnO1xuICAgIHN3aXRjaCAodmFsVHlwZSkge1xuICAgICAgY2FzZSBEQVRBX1RZUEVTLkpTVE9YTUxfT0JKRUNUOlxuICAgICAgICB7XG4gICAgICAgICAgLy8gUHJvY2Vzc2VzIGEgc3BlY2lhbGx5LWZvcm1hdHRlZCBvYmplY3QgdXNlZCBieSBqc3RveG1sLlxuXG4gICAgICAgICAgdmFyIF9uYW1lID0gb2JqLl9uYW1lLFxuICAgICAgICAgICAgX2NvbnRlbnQgPSBvYmouX2NvbnRlbnQ7XG5cbiAgICAgICAgICAvLyBPdXRwdXQgdGV4dCBjb250ZW50IHdpdGhvdXQgYSB0YWcgd3JhcHBlci5cbiAgICAgICAgICBpZiAoX2NvbnRlbnQgPT09IG51bGwgJiYgdHlwZW9mIGNvbnRlbnRNYXAgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIG91dHB1dFN0ciA9IFwiXCIuY29uY2F0KHByZUluZGVudFN0cikuY29uY2F0KGluZGVudFN0cikuY29uY2F0KF9uYW1lKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEhhbmRsZXMgYXJyYXlzIG9mIHByaW1pdGl2ZSB2YWx1ZXMuICgjMzMpXG4gICAgICAgICAgdmFyIGlzQXJyYXlPZlByaW1pdGl2ZXMgPSBBcnJheS5pc0FycmF5KF9jb250ZW50KSAmJiBfY29udGVudC5ldmVyeShpc1ByaW1pdGl2ZSk7XG4gICAgICAgICAgaWYgKGlzQXJyYXlPZlByaW1pdGl2ZXMpIHtcbiAgICAgICAgICAgIHZhciBwcmltaXRpdmVzID0gX2NvbnRlbnQubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0b1hNTCh7XG4gICAgICAgICAgICAgICAgX25hbWU6IF9uYW1lLFxuICAgICAgICAgICAgICAgIF9jb250ZW50OiBhXG4gICAgICAgICAgICAgIH0sIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgY29uZmlnKSwge30sIHtcbiAgICAgICAgICAgICAgICBkZXB0aDogZGVwdGgsXG4gICAgICAgICAgICAgICAgX2lzT3V0cHV0U3RhcnQ6IGZhbHNlXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHByaW1pdGl2ZXMuam9pbignJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRG9uJ3Qgb3V0cHV0IHByaXZhdGUgdmFycyAoc3VjaCBhcyBfYXR0cnMpLlxuICAgICAgICAgIGlmIChQUklWQVRFX1ZBUlMuaW5jbHVkZXMoX25hbWUpKSBicmVhaztcblxuICAgICAgICAgIC8vIFByb2Nlc3MgdGhlIG5lc3RlZCBuZXcgdmFsdWUgYW5kIGNyZWF0ZSBuZXcgY29uZmlnLlxuICAgICAgICAgIHZhciBuZXdWYWwgPSB0b1hNTChfY29udGVudCwgX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBjb25maWcpLCB7fSwge1xuICAgICAgICAgICAgZGVwdGg6IGRlcHRoICsgMSxcbiAgICAgICAgICAgIF9pc091dHB1dFN0YXJ0OiBpc091dHB1dFN0YXJ0XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHZhciBuZXdWYWxUeXBlID0gZ2V0VHlwZShuZXdWYWwpO1xuICAgICAgICAgIHZhciBpc05ld1ZhbFNpbXBsZSA9IGlzU2ltcGxlWE1MKG5ld1ZhbCk7XG4gICAgICAgICAgdmFyIGlzTmV3VmFsQ0RBVEEgPSBpc0NEQVRBKG5ld1ZhbCk7XG5cbiAgICAgICAgICAvLyBQcmUtdGFnIG91dHB1dCAoaW5kZW50IGFuZCBsaW5lIGJyZWFrcykuXG4gICAgICAgICAgdmFyIHByZVRhZyA9IFwiXCIuY29uY2F0KHByZUluZGVudFN0cikuY29uY2F0KGluZGVudFN0cik7XG5cbiAgICAgICAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciBjb21tZW50cywgcHJlc2VydmluZyBwcmVjZWRpbmcgbGluZSBicmVha3MvaW5kZW50cy5cbiAgICAgICAgICBpZiAoX25hbWUgPT09ICdfY29tbWVudCcpIHtcbiAgICAgICAgICAgIG91dHB1dFN0ciArPSBcIlwiLmNvbmNhdChwcmVUYWcsIFwiPCEtLSBcIikuY29uY2F0KF9jb250ZW50LCBcIiAtLT5cIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUYWcgb3V0cHV0LlxuICAgICAgICAgIHZhciB2YWxJc0VtcHR5ID0gbmV3VmFsVHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmV3VmFsID09PSAnJztcbiAgICAgICAgICB2YXIgZ2xvYmFsU2VsZkNsb3NlID0gc2VsZkNsb3NlVGFncztcbiAgICAgICAgICB2YXIgbG9jYWxTZWxmQ2xvc2UgPSBvYmouX3NlbGZDbG9zZVRhZztcbiAgICAgICAgICB2YXIgc2hvdWxkU2VsZkNsb3NlID0gX3R5cGVvZihsb2NhbFNlbGZDbG9zZSkgPT09IERBVEFfVFlQRVMuQk9PTEVBTiA/IHZhbElzRW1wdHkgJiYgbG9jYWxTZWxmQ2xvc2UgOiB2YWxJc0VtcHR5ICYmIGdsb2JhbFNlbGZDbG9zZTtcbiAgICAgICAgICB2YXIgc2VsZkNsb3NlU3RyID0gc2hvdWxkU2VsZkNsb3NlID8gJy8nIDogJyc7XG4gICAgICAgICAgdmFyIGF0dHJpYnV0ZXNTdHJpbmcgPSBmb3JtYXRBdHRyaWJ1dGVzKG9iai5fYXR0cnMsIGF0dHJpYnV0ZVJlcGxhY2VtZW50cywgYXR0cmlidXRlRmlsdGVyLCBhdHRyaWJ1dGVFeHBsaWNpdFRydWUpO1xuICAgICAgICAgIHZhciB0YWcgPSBcIjxcIi5jb25jYXQoX25hbWUpLmNvbmNhdChhdHRyaWJ1dGVzU3RyaW5nKS5jb25jYXQoc2VsZkNsb3NlU3RyLCBcIj5cIik7XG5cbiAgICAgICAgICAvLyBQb3N0LXRhZyBvdXRwdXQgKGNsb3NpbmcgdGFnLCBpbmRlbnQsIGxpbmUgYnJlYWtzKS5cbiAgICAgICAgICB2YXIgcHJlVGFnQ2xvc2VTdHIgPSBpbmRlbnQgJiYgIWlzTmV3VmFsU2ltcGxlICYmICFpc05ld1ZhbENEQVRBID8gXCJcXG5cIi5jb25jYXQoaW5kZW50U3RyKSA6ICcnO1xuICAgICAgICAgIHZhciBwb3N0VGFnID0gIXNob3VsZFNlbGZDbG9zZSA/IFwiXCIuY29uY2F0KG5ld1ZhbCkuY29uY2F0KHByZVRhZ0Nsb3NlU3RyLCBcIjwvXCIpLmNvbmNhdChfbmFtZSwgXCI+XCIpIDogJyc7XG4gICAgICAgICAgb3V0cHV0U3RyICs9IFwiXCIuY29uY2F0KHByZVRhZykuY29uY2F0KHRhZykuY29uY2F0KHBvc3RUYWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICBjYXNlIERBVEFfVFlQRVMuT0JKRUNUOlxuICAgICAgICB7XG4gICAgICAgICAgLy8gSXRlcmF0ZXMgb3ZlciBrZXl2YWwgcGFpcnMgaW4gYW4gb2JqZWN0LCBjb252ZXJ0aW5nIGVhY2ggaXRlbSB0byBhIHNwZWNpYWwtb2JqZWN0LlxuXG4gICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgICAgICAgIHZhciBvdXRwdXRBcnIgPSBrZXlzLm1hcChmdW5jdGlvbiAoa2V5LCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgY29uZmlnKSwge30sIHtcbiAgICAgICAgICAgICAgX2lzRmlyc3RJdGVtOiBpbmRleCA9PT0gMCxcbiAgICAgICAgICAgICAgX2lzTGFzdEl0ZW06IGluZGV4ICsgMSA9PT0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgICAgIF9pc091dHB1dFN0YXJ0OiBpc091dHB1dFN0YXJ0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBvdXRwdXRPYmogPSB7XG4gICAgICAgICAgICAgIF9uYW1lOiBrZXlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoZ2V0VHlwZShvYmpba2V5XSkgPT09IERBVEFfVFlQRVMuT0JKRUNUKSB7XG4gICAgICAgICAgICAgIC8vIFN1Yi1vYmplY3QgY29udGFpbnMgYW4gb2JqZWN0LlxuXG4gICAgICAgICAgICAgIC8vIE1vdmUgcHJpdmF0ZSB2YXJzIHVwIGFzIG5lZWRlZC4gIE5lZWRlZCB0byBzdXBwb3J0IGNlcnRhaW4gdHlwZXMgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgICAvLyBFLmcuIHsgZm9vOiB7IF9hdHRyczogeyBhOiAxIH0gfSB9IC0+IDxmb28gYT1cIjFcIi8+XG4gICAgICAgICAgICAgIFBSSVZBVEVfVkFSUy5mb3JFYWNoKGZ1bmN0aW9uIChwcml2YXRlVmFyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IG9ialtrZXldW3ByaXZhdGVWYXJdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgb3V0cHV0T2JqW3ByaXZhdGVWYXJdID0gdmFsO1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIG9ialtrZXldW3ByaXZhdGVWYXJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHZhciBoYXNDb250ZW50ID0gdHlwZW9mIG9ialtrZXldLl9jb250ZW50ICE9PSAndW5kZWZpbmVkJztcbiAgICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBfY29udGVudCBoYXMgc2libGluZyBrZXlzLCBzbyBwYXNzIGFzIGFuIGFycmF5IChlZGdlIGNhc2UpLlxuICAgICAgICAgICAgICAgIC8vIEUuZy4geyBmb286ICdiYXInLCBfY29udGVudDogeyBiYXo6IDIgfSB9IC0+IDxmb28+YmFyPC9mb28+PGJhej4yPC9iYXo+XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKG9ialtrZXldKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgbmV3Q29udGVudE9iaiA9IE9iamVjdC5hc3NpZ24oe30sIG9ialtrZXldKTtcbiAgICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdDb250ZW50T2JqLl9jb250ZW50O1xuICAgICAgICAgICAgICAgICAgb3V0cHV0T2JqLl9jb250ZW50ID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShvYmpUb0FycmF5KG5ld0NvbnRlbnRPYmopKSwgW29ialtrZXldLl9jb250ZW50XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZhbGx0aHJvdWdoOiBqdXN0IHBhc3MgdGhlIGtleSBhcyB0aGUgY29udGVudCBmb3IgdGhlIG5ldyBzcGVjaWFsLW9iamVjdC5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3V0cHV0T2JqLl9jb250ZW50ID09PSAndW5kZWZpbmVkJykgb3V0cHV0T2JqLl9jb250ZW50ID0gb2JqW2tleV07XG4gICAgICAgICAgICB2YXIgeG1sID0gdG9YTUwob3V0cHV0T2JqLCBuZXdDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIHhtbDtcbiAgICAgICAgICB9LCBjb25maWcpO1xuICAgICAgICAgIG91dHB1dFN0ciA9IG91dHB1dEFyci5qb2luKCcnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgY2FzZSBEQVRBX1RZUEVTLkZVTkNUSU9OOlxuICAgICAgICB7XG4gICAgICAgICAgLy8gRXhlY3V0ZXMgYSB1c2VyLWRlZmluZWQgZnVuY3Rpb24gYW5kIHJldHVybnMgb3V0cHV0LlxuXG4gICAgICAgICAgdmFyIGZuUmVzdWx0ID0gb2JqKGNvbmZpZyk7XG4gICAgICAgICAgb3V0cHV0U3RyID0gdG9YTUwoZm5SZXN1bHQsIGNvbmZpZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgREFUQV9UWVBFUy5BUlJBWTpcbiAgICAgICAge1xuICAgICAgICAgIC8vIEl0ZXJhdGVzIGFuZCBjb252ZXJ0cyBlYWNoIHZhbHVlIGluIGFuIGFycmF5LlxuICAgICAgICAgIHZhciBfb3V0cHV0QXJyID0gb2JqLm1hcChmdW5jdGlvbiAoc2luZ2xlVmFsLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgY29uZmlnKSwge30sIHtcbiAgICAgICAgICAgICAgX2lzRmlyc3RJdGVtOiBpbmRleCA9PT0gMCxcbiAgICAgICAgICAgICAgX2lzTGFzdEl0ZW06IGluZGV4ICsgMSA9PT0gb2JqLmxlbmd0aCxcbiAgICAgICAgICAgICAgX2lzT3V0cHV0U3RhcnQ6IGlzT3V0cHV0U3RhcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRvWE1MKHNpbmdsZVZhbCwgbmV3Q29uZmlnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBvdXRwdXRTdHIgPSBfb3V0cHV0QXJyLmpvaW4oJycpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgIC8vIGZhbGx0aHJvdWdoIHR5cGVzIChudW1iZXIsIHN0cmluZywgYm9vbGVhbiwgZGF0ZSwgbnVsbCwgZXRjKVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAge1xuICAgICAgICAgIG91dHB1dFN0ciA9IG1hcFN0cihvYmosIGNvbnRlbnRSZXBsYWNlbWVudHMsIGNvbnRlbnRNYXApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBcIlwiLmNvbmNhdChoZWFkZXJTdHIpLmNvbmNhdChvdXRwdXRTdHIpO1xuICB9O1xuICBfZXhwb3J0cy50b1hNTCA9IHRvWE1MO1xuICB2YXIgX2RlZmF1bHQgPSB7XG4gICAgdG9YTUw6IHRvWE1MXG4gIH07XG4gIF9leHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDtcbn0pO1xuIiwiaW1wb3J0IEZyYWN0aW9uIGZyb20gJ2ZyYWN0aW9uLmpzJztcblxuLyoqXG4gKiBJTlRFUlZBTFNcbiAqXG4gKiBUaGUgaW50ZXJ2YWwgaXMgdGhlIGJhc2ljIGJ1aWxkaW5nIGJsb2NrIG9mIG11c2ljLlxuICogSXQgaXMgdGhlIGRpZmZlcmVuY2UgaW4gcGl0Y2ggYmV0d2VlbiB0d28gc291bmRzLlxuICpcbiAqIEl0IGNhbiBiZSByZXByZXNlbnRlZCBhczpcbiAqIC0gYSBmcmVxdWVuY3kgcmF0aW9cbiAqIC0gYSBudW1iZXIgb2YgY2VudHMgKDEvMTAwIG9mIGFuIGVxdWFsbHkgdGVtcGVyZWQgc2VtaXRvbmUpXG4gKiAtIGEgbnVtYmVyIG9mIHNhdmFydHMgKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NhdmFydClcbiAqIC0gLi4uYW5kIG1vcmVcbiAqXG4gKiBJdCBjYW4gYWxzbyBiZSBuYW1lZCwgZGVwZW5kaW5nIG9uIHRoZSBub21lbmNsYXR1cmUgYmVpbmcgdXNlZC5cbiAqXG4gKi9cblxuZXhwb3J0IGNsYXNzIEludGVydmFsIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJhdGlvOiBGcmFjdGlvbikge31cbiAgZ2V0IGNlbnRzKCk6IG51bWJlciB7IHJldHVybiAxMjAwICogTWF0aC5sb2cyKHRoaXMucmF0aW8udmFsdWVPZigpKTsgfVxuICBnZXQgc2F2YXJ0cygpOiBudW1iZXIgeyByZXR1cm4gMTAwMCAqIE1hdGgubG9nMTAodGhpcy5yYXRpby52YWx1ZU9mKCkpOyB9XG4gIGRpZmZlcmVuY2UocmVmZXJlbmNlOiBJbnRlcnZhbCk6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbCh0aGlzLnJhdGlvLmRpdihyZWZlcmVuY2UucmF0aW8pKTsgfVxuICBzdGF0aWMgZnJvbVJhdGlvKHJhdGlvOiBzdHJpbmcpOiBJbnRlcnZhbCB7IHJldHVybiBuZXcgSW50ZXJ2YWwobmV3IEZyYWN0aW9uKHJhdGlvKSk7IH1cbiAgc3RhdGljIGZyb21DZW50cyhjZW50czogbnVtYmVyKTogSW50ZXJ2YWwgeyByZXR1cm4gbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbihNYXRoLnBvdygyLCBjZW50cyAvIDEyMDApKSk7IH1cbiAgc3RhdGljIGZyb21TYXZhcnRzKHNhdmFydHM6IG51bWJlcik6IEludGVydmFsIHsgcmV0dXJuIG5ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oTWF0aC5wb3coMTAsIHNhdmFydHMgLyAxMDAwKSkpOyB9XG4gIHN0YXRpYyBjb21wYXJlKGE6IEludGVydmFsLCBiOiBJbnRlcnZhbCk6IG51bWJlciB7IHJldHVybiBhLnJhdGlvLmNvbXBhcmUoYi5yYXRpbyk7IH1cbiAgc3RhdGljIEpORDogSW50ZXJ2YWwgPSBJbnRlcnZhbC5mcm9tQ2VudHMoNSk7IC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0p1c3Qtbm90aWNlYWJsZV9kaWZmZXJlbmNlXG59XG4iLCJpbXBvcnQgeyB0b1hNTCB9IGZyb20gJ2pzdG94bWwnO1xuaW1wb3J0IHsgVG9uZVJvdyB9IGZyb20gJy4vVG9uZVJvdyc7XG5pbXBvcnQgeyBUdW5pbmcsIFR1bmluZ1RvbmUgfSBmcm9tICcuL1R1bmluZyc7XG5pbXBvcnQgeyBUdW5pbmdOb3RhdGlvbiB9IGZyb20gJy4vVHVuaW5nTm90YXRpb24nO1xuaW1wb3J0IHsgQW5ub3RhdGlvbiB9IGZyb20gJy4vdXRpbHMvQW5ub3RhdGlvbic7XG5cbi8qKlxuICogRXhwb3J0IHZhcmlvdXMgU2NhbGV4dHJpYyBvYmplY3RzIHRvIGFzIGEgTXVzaWNYTUwgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBNdXNpY1hNTCB7XG4gIHN0YXRpYyBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAnZGl2aXNpb25zJzogNzY4LFxuICAgICd0aW1lJzoge1xuICAgICAgJ2JlYXRzJzogNCxcbiAgICAgICdiZWF0VHlwZSc6IDRcbiAgICB9LFxuICB9XG5cbiAgc3RhdGljIG5vdGVzID0ge1xuICAgICdDJzogMCxcbiAgICAnRCc6IDIsXG4gICAgJ0UnOiA0LFxuICAgICdGJzogNSxcbiAgICAnRyc6IDcsXG4gICAgJ0EnOiA5LFxuICAgICdCJzogMTFcbiAgfVxuXG4gIHN0YXRpYyBhY2NpZGVudGFsVmFsdWVzID0ge1xuICAgICcjJzogMSxcbiAgICAnYic6IC0xLFxuICB9XG5cbiAgc3RhdGljIGFjY2lkZW50YWxOYW1lcyA9IHtcbiAgICAnIyc6ICdzaGFycCcsXG4gICAgJ2InOiAnZmxhdCcsXG4gIH1cblxuICBzdGF0aWMgbm90ZVR5cGVzID0ge1xuICAgIDg6ICdlaWdodGgnLFxuICAgIDQ6ICdxdWFydGVyJyxcbiAgICAyOiAnaGFsZicsXG4gICAgMTogJ3dob2xlJyxcbiAgfVxuXG4gIHByaXZhdGUgb3B0aW9uczogb2JqZWN0O1xuICBwcml2YXRlIHR1bmluZzogVHVuaW5nO1xuICBwcml2YXRlIHR1bmluZ05vdGF0aW9uOiBUdW5pbmdOb3RhdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRpdGxlOiBzdHJpbmcsIHByaXZhdGUgb2JqZWN0czogVG9uZVJvd1tdLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBNdXNpY1hNTC5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG4gICAgdGhpcy50dW5pbmcgPSBuZXcgVHVuaW5nKFR1bmluZy5pbnRlcnZhbHNFZG8oMTIpKTtcbiAgICB0aGlzLnR1bmluZ05vdGF0aW9uID0gVHVuaW5nTm90YXRpb24uZnJvbU5vdGVzQWNjaWRlbnRhbHNDb21iaW5hdGlvbihcbiAgICAgIHRoaXMudHVuaW5nLFxuICAgICAgTXVzaWNYTUwubm90ZXMsXG4gICAgICBNdXNpY1hNTC5hY2NpZGVudGFsVmFsdWVzXG4gICAgKTtcbiAgfVxuXG4gIGNvbnZlcnQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9YTUwodGhpcy5jb252ZXJ0RG9jdW1lbnQoKSwge1xuICAgICAgaGVhZGVyOiBgXG48P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz5cbjwhRE9DVFlQRSBzY29yZS1wYXJ0d2lzZSBQVUJMSUMgXCItLy9SZWNvcmRhcmUvL0RURCBNdXNpY1hNTCA0LjAgUGFydHdpc2UvL0VOXCIgXCJodHRwOi8vd3d3Lm11c2ljeG1sLm9yZy9kdGRzL3BhcnR3aXNlLmR0ZFwiPlxuICAgICAgYC50cmltKCksXG4gICAgICBpbmRlbnQ6ICcgICdcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydERvY3VtZW50KCk6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgICdzY29yZS1wYXJ0d2lzZSc6IFt7XG4gICAgICAgICd3b3JrJzoge1xuICAgICAgICAgICd3b3JrLXRpdGxlJzogdGhpcy50aXRsZVxuICAgICAgICB9XG4gICAgICB9LCB7XG4gICAgICAgICdpZGVudGlmaWNhdGlvbic6IFt7XG4gICAgICAgICAgJ2VuY29kaW5nJzogW3tcbiAgICAgICAgICAgICdzb2Z0d2FyZSc6ICdAaW5mb2p1bmtpZS9zY2FsZXh0cmljJ1xuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICdlbmNvZGluZy1kYXRlJzogTXVzaWNYTUwuY29udmVydERhdGUobmV3IERhdGUoKSlcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBfbmFtZTogJ3N1cHBvcnRzJyxcbiAgICAgICAgICAgIF9hdHRyczogeyAnZWxlbWVudCc6ICdhY2NpZGVudGFsJywgJ3R5cGUnOiAnbm8nIH1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBfbmFtZTogJ3N1cHBvcnRzJyxcbiAgICAgICAgICAgIF9hdHRyczogeyAnZWxlbWVudCc6ICd0cmFuc3Bvc2UnLCAndHlwZSc6ICdubycgfVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIF9uYW1lOiAnc3VwcG9ydHMnLFxuICAgICAgICAgICAgX2F0dHJzOiB7ICdhdHRyaWJ1dGUnOiAnbmV3LXBhZ2UnLCAnZWxlbWVudCc6ICdwcmludCcsICd0eXBlJzogJ3llcycsICd2YWx1ZSc6ICd5ZXMnIH1cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBfbmFtZTogJ3N1cHBvcnRzJyxcbiAgICAgICAgICAgIF9hdHRyczogeyAnYXR0cmlidXRlJzogJ25ldy1zeXN0ZW0nLCAnZWxlbWVudCc6ICdwcmludCcsICd0eXBlJzogJ3llcycsICd2YWx1ZSc6ICd5ZXMnIH1cbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfSwge1xuICAgICAgICAnZGVmYXVsdHMnOiB7XG4gICAgICAgICAgJ3NjYWxpbmcnOiB7XG4gICAgICAgICAgICAnbWlsbGltZXRlcnMnOiA3LFxuICAgICAgICAgICAgJ3RlbnRocyc6IDQwXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB7XG4gICAgICAgICdwYXJ0LWxpc3QnOiB7XG4gICAgICAgICAgX25hbWU6ICdzY29yZS1wYXJ0JyxcbiAgICAgICAgICBfYXR0cnM6IHsgJ2lkJzogJ1AxJyB9LFxuICAgICAgICAgIF9jb250ZW50OiB7XG4gICAgICAgICAgICBfbmFtZTogJ3BhcnQtbmFtZScsXG4gICAgICAgICAgICBfYXR0cnM6IHsgJ3ByaW50LW9iamVjdCc6ICdubycgfSxcbiAgICAgICAgICAgIF9jb250ZW50OiB0aGlzLnRpdGxlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCB7XG4gICAgICAgIF9uYW1lOiAncGFydCcsXG4gICAgICAgIF9hdHRyczogeyAnaWQnOiAnUDEnIH0sXG4gICAgICAgIF9jb250ZW50OiB0aGlzLmNvbnZlcnRPYmplY3RzKClcbiAgICAgIH1dXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdG9uZSByb3dzIHRvIE11c2ljWE1MIG1lYXN1cmVzLlxuICAgKlxuICAgKiAtIEVhY2ggdG9uZSByb3cgc3RhcnRzIGEgbmV3IG1lYXN1cmVcbiAgICogLSBDb252ZXJ0IGVhY2ggdG9uZSBpbiB0aGUgdG9uZSByb3cgdG8gYSBxdWFydGVyLXRvbmVcbiAgICogLSBPcGVuIGEgbmV3IG1lYXN1cmUgYXMgbmVlZGVkXG4gICAqIC0gV2hlbiB0aGUgdG9uZSByb3cgaXMgY29tcGxldGU6XG4gICAqICAgLSBGaWxsIHRoZSBjdXJyZW50IG1lYXN1cmUgd2l0aCByZXN0c1xuICAgKiAgIC0gQ2xvc2Ugd2l0aCBhIHNlY3Rpb24gYmFybGluZVxuICAgKiAgIC0gU3RhcnQgYSBuZXcgc3lzdGVtXG4gICAqXG4gICAqIEByZXR1cm5zIGFycmF5IG9mIG1lYXN1cmVzLlxuICAgKi9cbiAgcHJpdmF0ZSBjb252ZXJ0T2JqZWN0cygpOiBvYmplY3RbXSB7XG4gICAgcmV0dXJuIHRoaXMub2JqZWN0cy5yZWR1Y2UoKG1lYXN1cmVzLCBvYmplY3QsIG9iamVjdEluZGV4KSA9PiB7XG4gICAgICAvLyBTdGFydCBuZXcgbWVhc3VyZS5cbiAgICAgIGxldCBtZWFzdXJlID0gdGhpcy5jb252ZXJ0TWVhc3VyZShtZWFzdXJlcy5sZW5ndGggKyAxKTtcbiAgICAgIG1lYXN1cmVzLnB1c2gobWVhc3VyZSk7XG5cbiAgICAgIC8vIE5ldyBzeXN0ZW0gaWYgbmVlZGVkLlxuICAgICAgaWYgKG9iamVjdEluZGV4ID4gMCkge1xuICAgICAgICBtZWFzdXJlWydfY29udGVudCddLnB1c2goe1xuICAgICAgICAgIF9uYW1lOiAncHJpbnQnLFxuICAgICAgICAgIF9hdHRyczogeyAnbmV3LXN5c3RlbSc6ICd5ZXMnIH1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLy8gRmlyc3QgbWVhc3VyZSBhdHRyaWJ1dGVzLlxuICAgICAgaWYgKG9iamVjdEluZGV4ID09PSAwKSB7XG4gICAgICAgIG1lYXN1cmVbJ19jb250ZW50J10ucHVzaCh7XG4gICAgICAgICAgJ2F0dHJpYnV0ZXMnOiBbe1xuICAgICAgICAgICAgJ2RpdmlzaW9ucyc6IHRoaXMub3B0aW9uc1snZGl2aXNpb25zJ11cbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAna2V5JzogW3tcbiAgICAgICAgICAgICAgJ2ZpZnRocyc6IDBcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgJ21vZGUnOiAnbWFqb3InXG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICd0aW1lJzogW3tcbiAgICAgICAgICAgICAgJ2JlYXRzJzogdGhpcy5vcHRpb25zWyd0aW1lJ11bJ2JlYXRzJ11cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgJ2JlYXQtdHlwZSc6IHRoaXMub3B0aW9uc1sndGltZSddWydiZWF0VHlwZSddXG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICdjbGVmJzogW3tcbiAgICAgICAgICAgICAgJ3NpZ24nOiAnRydcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgJ2xpbmUnOiAyXG4gICAgICAgICAgICB9XVxuICAgICAgICAgIH1dXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgb2JqZWN0IGxhYmVsIGlmIGFueS5cbiAgICAgIGNvbnN0IGxhYmVscyA9IEFubm90YXRpb24uZmluZEJ5TGFiZWwoJ2xhYmVsJywgb2JqZWN0LmFubm90YXRpb25zKTtcbiAgICAgIGlmIChsYWJlbHMpIHtcbiAgICAgICAgbWVhc3VyZVsnX2NvbnRlbnQnXS5wdXNoKHtcbiAgICAgICAgICBfbmFtZTogJ2RpcmVjdGlvbicsXG4gICAgICAgICAgX2F0dHJzOiB7ICdwbGFjZW1lbnQnOiAnYWJvdmUnIH0sXG4gICAgICAgICAgX2NvbnRlbnQ6IFt7XG4gICAgICAgICAgICAnZGlyZWN0aW9uLXR5cGUnOiBbe1xuICAgICAgICAgICAgICAnd29yZHMnOiBsYWJlbHNbMF1cbiAgICAgICAgICAgIH1dXG4gICAgICAgICAgfV0sXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29wIG9uIHRvbmVzLlxuICAgICAgbGV0IGJlYXQgPSAwO1xuICAgICAgb2JqZWN0LnRvbmVzLmZvckVhY2goKHRvbmUsIHRvbmVJbmRleCkgPT4ge1xuICAgICAgICBtZWFzdXJlWydfY29udGVudCddLnB1c2godGhpcy5jb252ZXJ0Tm90ZSh0b25lKSk7XG5cbiAgICAgICAgLy8gQWRkIG5ldyBtZWFzdXJlIGlmIG5lZWRlZC5cbiAgICAgICAgYmVhdCA9IChiZWF0ICsgMSkgJSB0aGlzLm9wdGlvbnNbJ3RpbWUnXVsnYmVhdHMnXTtcbiAgICAgICAgaWYgKGJlYXQgPT09IDAgJiYgdG9uZUluZGV4IDwgb2JqZWN0LnRvbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBtZWFzdXJlID0gdGhpcy5jb252ZXJ0TWVhc3VyZShtZWFzdXJlcy5sZW5ndGggKyAxKTtcbiAgICAgICAgICBtZWFzdXJlcy5wdXNoKG1lYXN1cmUpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gLy8gQWRkIHJlbWFpbmluZyByZXN0cyB0byB0aGUgbGFzdCBtZWFzdXJlLlxuICAgICAgLy8gaWYgKGJlYXQgPiAwKSB3aGlsZSAoYmVhdCsrIDwgdGhpcy5vcHRpb25zWyd0aW1lJ11bJ2JlYXRzJ10pIHtcbiAgICAgIC8vICAgbWVhc3VyZVsnX2NvbnRlbnQnXS5wdXNoKHtcbiAgICAgIC8vICAgICBfbmFtZTogJ25vdGUnLFxuICAgICAgLy8gICAgIF9jb250ZW50OiBbe1xuICAgICAgLy8gICAgICAgX25hbWU6ICdyZXN0JyxcbiAgICAgIC8vICAgICB9LCB7XG4gICAgICAvLyAgICAgICAnZHVyYXRpb24nOiB0aGlzLm9wdGlvbnNbJ2RpdmlzaW9ucyddLFxuICAgICAgLy8gICAgIH0sIHtcbiAgICAgIC8vICAgICAgICd0eXBlJzogTXVzaWNYTUwubm90ZVR5cGVzW3RoaXMub3B0aW9uc1sndGltZSddWydiZWF0VHlwZSddXSxcbiAgICAgIC8vICAgICB9XVxuICAgICAgLy8gICB9KVxuICAgICAgLy8gfVxuXG4gICAgICAvLyBDbG9zZSB0aGUgYmFyIHdpdGggYSBzZWN0aW9uIGJhcmxpbmUuXG4gICAgICBtZWFzdXJlWydfY29udGVudCddLnB1c2godGhpcy5jb252ZXJ0QmFyKCdyaWdodCcsICdsaWdodC1saWdodCcpKTtcblxuICAgICAgcmV0dXJuIG1lYXN1cmVzO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydEJhcihsb2NhdGlvbjogc3RyaW5nLCBzdHlsZTogc3RyaW5nKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgX25hbWU6ICdiYXJsaW5lJyxcbiAgICAgIF9hdHRyczogeyAnbG9jYXRpb24nOiBsb2NhdGlvbiB9LFxuICAgICAgX2NvbnRlbnQ6IFt7XG4gICAgICAgICdiYXItc3R5bGUnOiBzdHlsZVxuICAgICAgfV1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRNZWFzdXJlKG51bWJlcjogbnVtYmVyKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgX25hbWU6ICdtZWFzdXJlJyxcbiAgICAgIF9hdHRyczogeyAnbnVtYmVyJzogbnVtYmVyIH0sXG4gICAgICBfY29udGVudDogW10sXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0Tm90ZSh0b25lOiBUdW5pbmdUb25lKTogb2JqZWN0IHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLnR1bmluZy5uZWFyZXN0KHRvbmUudHVuZSk7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMudHVuaW5nTm90YXRpb24ubmFtZSh0YXJnZXQudG9uZSlbMF07XG4gICAgY29uc3Qgc3RlcCA9IG5hbWVbMF07XG4gICAgY29uc3QgeyBhY2NpZGVudGFsLCBhbHRlciB9ID0gKG5hbWVbMV0gaW4gTXVzaWNYTUwuYWNjaWRlbnRhbFZhbHVlcykgPyB7XG4gICAgICBhY2NpZGVudGFsOiBNdXNpY1hNTC5hY2NpZGVudGFsTmFtZXNbbmFtZVsxXV0sXG4gICAgICBhbHRlcjogTXVzaWNYTUwuYWNjaWRlbnRhbFZhbHVlc1tuYW1lWzFdXSxcbiAgICB9IDoge1xuICAgICAgYWNjaWRlbnRhbDogbnVsbCxcbiAgICAgIGFsdGVyOiAwLFxuICAgIH07XG4gICAgY29uc3Qgb2N0YXZlID0gbmFtZVtuYW1lLmxlbmd0aC0xXTtcbiAgICBjb25zdCBjZW50cyA9IHRhcmdldC5kaWZmZXJlbmNlLmNlbnRzO1xuICAgIHJldHVybiB7XG4gICAgICBfbmFtZTogJ25vdGUnLFxuICAgICAgX2NvbnRlbnQ6IFt7XG4gICAgICAgIF9uYW1lOiAncGl0Y2gnLFxuICAgICAgICBfY29udGVudDogW3tcbiAgICAgICAgICAnc3RlcCc6IHN0ZXBcbiAgICAgICAgfSwge1xuICAgICAgICAgICdhbHRlcic6IGFsdGVyICsgKE1hdGgucm91bmQoY2VudHMgKiAxMCkgLyAxMDAwKVxuICAgICAgICB9LCB7XG4gICAgICAgICAgJ29jdGF2ZSc6IG9jdGF2ZVxuICAgICAgICB9XVxuICAgICAgfSwge1xuICAgICAgICAnZHVyYXRpb24nOiB0aGlzLm9wdGlvbnNbJ2RpdmlzaW9ucyddLFxuICAgICAgfSwge1xuICAgICAgICAndHlwZSc6IE11c2ljWE1MLm5vdGVUeXBlc1t0aGlzLm9wdGlvbnNbJ3RpbWUnXVsnYmVhdFR5cGUnXV0sXG4gICAgICB9LCB7XG4gICAgICAgIC4uLihhY2NpZGVudGFsICYmIHsgJ2FjY2lkZW50YWwnOiBhY2NpZGVudGFsIH0pXG4gICAgICB9XSxcbiAgICB9XG4gIH1cblxuICAvLyBEYXRlIGluIHl5eXktbW0tZGRcbiAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzUwMTMwMzM4LzIwOTE4NFxuICBwcml2YXRlIHN0YXRpYyBjb252ZXJ0RGF0ZShkYXRlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkgLSAoZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpICogNjAwMDApKVxuICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgIC5zcGxpdCgnVCcpWzBdO1xuICB9XG59XG4iLCJpbXBvcnQgeyBUdW5pbmcsIFR1bmluZ1RvbmUgfSBmcm9tICcuL1R1bmluZyc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uIH0gZnJvbSAnLi91dGlscy9Bbm5vdGF0aW9uJztcblxuLyoqXG4gKiBUT05FIFJPV1xuICpcbiAqIFdlIGRlZmluZSBhIHRvbmUgcm93IGFzIGFuIG9yZGVyZWQgc2VxdWVuY2Ugb2YgdG9uZXMuIEl0IGlzIHRoZSBiYXNpYyBjb2xsZWN0aW9uIG9mIHRvbmVzXG4gKiB0aGF0IG1ha2UgdXAgbWFueSBvdGhlciBtdXNpY2FsIG9iamVjdHMgc3VjaCBhcyBzY2FsZXMsIGNob3JkcywgZXRjLlxuICpcbiAqIFRoaXMgZGVmaW5pdGlvbiBleHRlbmRzIHRoZSB1c3VhbCBkZWZpbml0aW9uIG9mIFwidG9uZSByb3dcIiB1c2VkIGluIHNlcmlhbCBjb21wb3NpdGlvblxuICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVG9uZV9yb3dcbiAqXG4gKiBJdCBhbGxvd3MgdXMgdG8gcmV1c2UgdGhlIHN0YW5kYXJkIHRvbmUgcm93IG9wZXJhdGlvbnMgKGludmVydCwgcmV2ZXJzZSwgdHJhbnNwb3NlLCByb3RhdGUpXG4gKiBvbiBvdGhlciBtdXNpY2FsIG9iamVjdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUb25lUm93IHtcbiAgLyoqXG4gICAqIENPTlNUUlVDVE9SXG4gICAqXG4gICAqIEBwYXJhbSB0dW5pbmc6IHRoZSByZWZlcmVuY2UgdHVuaW5nXG4gICAqIEBwYXJhbSB0b25lczogdGhlIHRvbmVzIG1ha2luZyB1cCB0aGUgcm93XG4gICAqIEBwYXJhbSBhbm5vdGF0aW9uczogbm90ZXMgYWJvdXQgdGhlIHJvd1xuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHR1bmluZzogVHVuaW5nLCBwdWJsaWMgdG9uZXM6IFR1bmluZ1RvbmVbXSwgcHVibGljIGFubm90YXRpb25zOiBBbm5vdGF0aW9uW10gPSBbXSkge1xuICAgIC8vIFRPRE8gdmVyaWZ5IHRoYXQgdG9uZXMgYXJlIHZhbGlkLlxuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9zZSBhIHJvdyB0byBhIHRhcmdldCB0b25lLlxuICAgKi9cbiAgdHJhbnNwb3NlKHRhcmdldDogVHVuaW5nVG9uZSk6IFRvbmVSb3cge1xuICAgIHJldHVybiBuZXcgVG9uZVJvdyh0aGlzLnR1bmluZywgdGhpcy50b25lcy5tYXAodG9uZSA9PlxuICAgICAgVHVuaW5nVG9uZS5mcm9tUGl0Y2godGhpcy50dW5pbmcsIHRhcmdldC5waXRjaCArIHRvbmUucGl0Y2gpXG4gICAgKSk7XG4gIH1cblxuICAvKipcbiAgICogSW52ZXJ0IGEgcm93IGFyb3VuZCBhbiBheGlzIHRvbmUuXG4gICAqL1xuICBpbnZlcnQoYXhpczogVHVuaW5nVG9uZSk6IFRvbmVSb3cge1xuICAgIHJldHVybiBuZXcgVG9uZVJvdyh0aGlzLnR1bmluZywgdGhpcy50b25lcy5tYXAodG9uZSA9PlxuICAgICAgVHVuaW5nVG9uZS5mcm9tUGl0Y2godGhpcy50dW5pbmcsIGF4aXMucGl0Y2ggLSB0b25lLnBpdGNoKVxuICAgICkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVyc2UgYSByb3cuXG4gICAqL1xuICByZXZlcnNlKCk6IFRvbmVSb3cge1xuICAgIHJldHVybiBuZXcgVG9uZVJvdyh0aGlzLnR1bmluZywgWy4uLnRoaXMudG9uZXNdLnJldmVyc2UoKSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlIGEgcm93IGJ5IGN5Y2xpbmcgaXQgYSBudW1iZXIgb2YgdGltZXMuXG4gICAqL1xuICByb3RhdGUoY3ljbGVzOiBudW1iZXIpOiBUb25lUm93IHtcbiAgICBjb25zdCBjID0gY3ljbGVzICUgdGhpcy50b25lcy5sZW5ndGg7XG4gICAgcmV0dXJuIG5ldyBUb25lUm93KHRoaXMudHVuaW5nLCBbLi4udGhpcy50b25lcy5zbGljZShjKSwgLi4udGhpcy50b25lcy5zbGljZSgwLCBjKV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vbm90b25pemUgYSByb3csIGVuc3VyaW5nIGl0IGlzIHN0cmljbHkgYXNjZW5kaW5nIG9yIGRlc2NlbmRpbmcsIGJ5IHJhaXNpbmcgb3IgZHJvcHBpbmcgcGl0Y2ggb2N0YXZlcy5cbiAgICpcbiAgICogcm90YXRlLm1vbm90b25pemUgPT4gY2hvcmQgaW52ZXJzaW9uXG4gICAqL1xuICBtb25vdG9uaXplKGRlc2NlbmRpbmcgPSBmYWxzZSk6IFRvbmVSb3cge1xuICAgIHJldHVybiBuZXcgVG9uZVJvdyh0aGlzLnR1bmluZywgdGhpcy50b25lcy5yZWR1Y2UoKGN1cnJlbnQsIG5leHQpID0+IHtcbiAgICAgIGNvbnN0IGxhc3Q6IFR1bmluZ1RvbmUgPSBjdXJyZW50Lmxlbmd0aCA+IDAgPyBjdXJyZW50W2N1cnJlbnQubGVuZ3RoLTFdIDogbmV4dDtcbiAgICAgIGlmICghZGVzY2VuZGluZyAmJiBuZXh0LnBpdGNoIDwgbGFzdC5waXRjaCkge1xuICAgICAgICBjdXJyZW50LnB1c2gobmV3IFR1bmluZ1RvbmUodGhpcy50dW5pbmcsIG5leHQucGl0Y2hDbGFzcywgbGFzdC5vY3RhdmUgKyAobmV4dC5waXRjaENsYXNzIDwgbGFzdC5waXRjaENsYXNzID8gMSA6IDApKSk7XG4gICAgICB9IGVsc2UgaWYgKGRlc2NlbmRpbmcgJiYgbmV4dC5waXRjaCA+IGxhc3QucGl0Y2gpIHtcbiAgICAgICAgY3VycmVudC5wdXNoKG5ldyBUdW5pbmdUb25lKHRoaXMudHVuaW5nLCBuZXh0LnBpdGNoQ2xhc3MsIGxhc3Qub2N0YXZlICsgKG5leHQucGl0Y2hDbGFzcyA+IGxhc3QucGl0Y2hDbGFzcyA/IC0xIDogMCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQucHVzaChuZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdXJyZW50O1xuICAgIH0sIG5ldyBBcnJheTxUdW5pbmdUb25lPigpKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwaXRjaGVzIG9mIHRoZSB0b25lIHJvdy5cbiAgICovXG4gIGdldCBwaXRjaGVzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy50b25lcy5tYXAodG9uZSA9PiB0b25lLnBpdGNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSB0b25lIHJvdyBmcm9tIGdpdmVuIHBpdGNoZXMuXG4gICAqL1xuICBzdGF0aWMgZnJvbVBpdGNoZXModHVuaW5nOiBUdW5pbmcsIHBpdGNoZXM6IG51bWJlcltdLCBhbm5vdGF0aW9uczogQW5ub3RhdGlvbltdID0gW10pOiBUb25lUm93IHtcbiAgICByZXR1cm4gbmV3IFRvbmVSb3codHVuaW5nLCBwaXRjaGVzLm1hcChwaXRjaCA9PlxuICAgICAgVHVuaW5nVG9uZS5mcm9tUGl0Y2godHVuaW5nLCBwaXRjaClcbiAgICApLCBhbm5vdGF0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgdG9uZSByb3cgZnJvbSBnaXZlbiBwaXRjaGVzLlxuICAgKi9cbiAgc3RhdGljIGZyb21QaXRjaENsYXNzZXModHVuaW5nOiBUdW5pbmcsIHBpdGNoQ2xhc3NlczogbnVtYmVyW10sIG9jdGF2ZTogbnVtYmVyLCBhbm5vdGF0aW9uczogQW5ub3RhdGlvbltdID0gW10pOiBUb25lUm93IHtcbiAgICByZXR1cm4gbmV3IFRvbmVSb3codHVuaW5nLCBwaXRjaENsYXNzZXMubWFwKHBpdGNoQ2xhc3MgPT5cbiAgICAgIG5ldyBUdW5pbmdUb25lKHR1bmluZywgcGl0Y2hDbGFzcywgb2N0YXZlKVxuICAgICksIGFubm90YXRpb25zKTtcbiAgfVxufVxuIiwiaW1wb3J0IEZyYWN0aW9uIGZyb20gJ2ZyYWN0aW9uLmpzJztcbmltcG9ydCB7IGJpbmFyeVNlYXJjaCwgZmxpcEZyYWN0aW9uLCBtb2QgfSBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQW5ub3RhdGlvbiB9IGZyb20gJy4vdXRpbHMvQW5ub3RhdGlvbic7XG5pbXBvcnQgeyBJbnRlcnZhbCB9IGZyb20gJy4vSW50ZXJ2YWwnO1xuXG4vKipcbiAqIFRVTklORyBTWVNURU1cbiAqXG4gKiBHaXZlbiBhIHJlZmVyZW5jZSB0b25lIGFuZCBhIHRhcmdldCB0b25lLCBhIHR1bmluZyByZXR1cm5zIHRoZSByYXRpbyBiZXR3ZWVuIHRoZW0uXG4gKlxuICogVGhlIGZ1bmRhbWVudGFsIGludGVydmFsIGlzIDIvMSBiZXR3ZWVuIHRoZSBiYXNlIHRvbmUgYW5kIGl0cyBvY3RhdmUuXG4gKiBPdGhlciB0b25lcyBzdWJkaXZpZGUgdGhlIG9jdGF2ZSBpbnRlcnZhbC4gQSBmaW5pdGUgbnVtYmVyIG9mIHRvbmVzIE4gbWFrZSB1cCB0aGUgdHVuaW5nLlxuICogVG9uZXMgYXJlIGluZGV4ZWQgYWNjb3JkaW5nIHRvIHRoZWlyIHJhbmsgaW4gdGhlIG9yZGVyZWQgc2VxdWVuY2Ugb2YgcmF0aW9zXG4gKiB0b25lIDAgPT4gcmF0aW8gMSAodW5pc29uKVxuICogdG9uZSAxID0+IHJhdGlvIDEuYWJjIChmaXJzdCBpbnRlcnZhbClcbiAqIHRvbmUgMiA9PiByYXRpbyAxLmRlZiAoc2Vjb25kIGludGVydmFsKVxuICogLi4uXG4gKiB0b25lIE4tMiA9PiByYXRpbyAxLnh5eiAobmV4dC10by1sYXN0IGludGVydmFsKVxuICogdG9uZSBOLTEgPT4gcmF0aW8gMiAob2N0YXZlKVxuICpcbiAqIFRvbmVzIGNhbiBleHRlbmQgYmV5b25kIHRoZSBvY3RhdmVcbiAqIGUuZy4gdG9uZSBOKzEgaXMgZXF1aXZhbGVudCB0byB0b25lIDEsIGJ1dCBvbmUgb2N0YXZlIGhpZ2hlci5cbiAqIEluIGFkZGl0aW9uIHRvIHJlcHJlc2VudGluZyBhIHRvbmUgYXMgYWJvdmUsIHdlIGNhbiByZXByZXNlbnQgaXQgYnkgaXRzIFwiZ2VuZXJhdG9yXCI6XG4gKiAtIGl0cyBwaXRjaCBjbGFzcyBwYyDiiIggWzAsIE4tMV1cbiAqIC0gaXRzIG9jdGF2ZSBvIOKIiCDihKRcbiAqIHN1Y2ggdGhhdCB0ID0gcGModCkgKyBOICogbyh0KVxuICovXG5leHBvcnQgY2xhc3MgVHVuaW5nIHtcbiAgLyoqXG4gICAqIENPTlNUUlVDVE9SXG4gICAqXG4gICAqIEBwYXJhbSBpbnRlcnZhbHM6IHR1bmluZyBpbnRlcnZhbHNcbiAgICogVGhlIGludGVydmFscyB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gYmUgc29ydGVkLlxuICAgKiBUaGUgZmlyc3QgaW50ZXJ2YWwgd2lsbCBiZSBfZ3VhcmFudGVlZF8gdG8gYmUgdGhlIHVuaXNvbi5cbiAgICogVGhlIGxhc3QgaW50ZXJ2YWwgd2lsbCBiZSBfYXNzdW1lZF8gdG8gYmUgdGhlIHJlcGVhdGVyIChlLmcuIDIvMSB0aGUgb2N0YXZlKS5cbiAgICogQHBhcmFtIGFubm90YXRpb25zOiBub3RlcyBhYm91dCB0aGUgdHVuaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW50ZXJ2YWxzOiBJbnRlcnZhbFtdLCBwdWJsaWMgYW5ub3RhdGlvbnM6IEFubm90YXRpb25bXSA9IFtdKSB7XG4gICAgdGhpcy5pbnRlcnZhbHMuc29ydChJbnRlcnZhbC5jb21wYXJlKTtcbiAgICBpZiAodGhpcy5pbnRlcnZhbHNbMF0ucmF0aW8udmFsdWVPZigpICE9IDEpIHtcbiAgICAgIHRoaXMuaW50ZXJ2YWxzID0gW25ldyBJbnRlcnZhbChuZXcgRnJhY3Rpb24oMSkpLCAuLi50aGlzLmludGVydmFsc107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHR1bmluZyBmcm9tIHJhdGlvcyBvciBjZW50cy5cbiAgICpcbiAgICogQHBhcmFtIGludGVydmFsczogYW4gYXJyYXkgb2YgcmF0aW9zIGV4cHJlc3NlZCBhcyBzdHJpbmdzLCBvciBjZW50cyBleHByZXNzZWQgYXMgbnVtYmVyc1xuICAgKiBAcGFyYW0gYW5ub3RhdGlvbnM6IGFzIHBlciBjb25zdHJ1Y3RvclxuICAgKiBAcmV0dXJucyB0dW5pbmcgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgZnJvbUludGVydmFscyhpbnRlcnZhbHM6IChudW1iZXJ8c3RyaW5nKVtdLCBhbm5vdGF0aW9uczogQW5ub3RhdGlvbltdID0gW10pOiBUdW5pbmcge1xuICAgIHJldHVybiBuZXcgVHVuaW5nKGludGVydmFscy5tYXAoaW50ZXJ2YWwgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnZhbCA9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbihpbnRlcnZhbCkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBJbnRlcnZhbC5mcm9tQ2VudHMoaW50ZXJ2YWwpO1xuICAgICAgfVxuICAgIH0pLCBhbm5vdGF0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogSVMgQSBUVU5JTkcgVFJBTlNQT1NBQkxFP1xuICAgKlxuICAgKiBBIHR1bmluZyBpcyBmdWxseSB0cmFuc3Bvc2FibGUgaWYgYWxsIG9mIGl0cyBpbnRlcnZhbCBkaWZmZXJlbmNlcyBhcmUgZXF1YWwuXG4gICAqIFdlIHdpbGwgY29uc2lkZXIgZXF1YWxpdHkgdG8gYmUgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgXCJqdXN0IG5vdGljZWFibGVcIiBpbnRlcnZhbCAoNSBjZW50cykuXG4gICAqL1xuICBwcml2YXRlIF90cmFuc3Bvc2FibGU6IGJvb2xlYW47XG4gIGdldCB0cmFuc3Bvc2FibGUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3RyYW5zcG9zYWJsZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5fdHJhbnNwb3NhYmxlO1xuXG4gICAgY29uc3QgZmlyc3Q6IEludGVydmFsID0gdGhpcy5pbnRlcnZhbHNbMV0uZGlmZmVyZW5jZSh0aGlzLmludGVydmFsc1swXSk7XG4gICAgcmV0dXJuICh0aGlzLl90cmFuc3Bvc2FibGUgPSB0aGlzLmludGVydmFscy5zbGljZSgxKS5ldmVyeSgodiwgaSkgPT4ge1xuICAgICAgY29uc3QgbmV4dDogSW50ZXJ2YWwgPSB2LmRpZmZlcmVuY2UodGhpcy5pbnRlcnZhbHNbaV0pO1xuICAgICAgY29uc3QgZGlmZjogSW50ZXJ2YWwgPSBuZXcgSW50ZXJ2YWwoZmxpcEZyYWN0aW9uKG5leHQuZGlmZmVyZW5jZShmaXJzdCkucmF0aW8sIHRydWUpKTtcbiAgICAgIHJldHVybiBkaWZmLnJhdGlvLmNvbXBhcmUoSW50ZXJ2YWwuSk5ELnJhdGlvKSA8IDA7XG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNURVBTIE9GIEEgVFVOSU5HXG4gICAqXG4gICAqIEByZXR1cm5zIGNvdW50IG9mIHRvbmVzIGluIHRoZSB0dW5pbmdcbiAgICovXG4gIGdldCBzdGVwcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludGVydmFscy5sZW5ndGggLSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIE9DVEFWRSBPRiBBIFRVTklOR1xuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgbGFzdCBpbnRlcnZhbCBpbiB0aGUgdHVuaW5nLCB3aGljaCBpcyBjb25zaWRlcmVkIHRvIGJlIHRoZSBvY3RhdmVcbiAgICovXG4gIGdldCBvY3RhdmUoKTogSW50ZXJ2YWwge1xuICAgIHJldHVybiB0aGlzLmludGVydmFsc1t0aGlzLnN0ZXBzXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUVU5FIEEgVE9ORVxuICAgKlxuICAgKiBAcGFyYW0gdG9uZTogdG9uZSB0byBiZSB0dW5lZFxuICAgKiBAcmV0dXJucyBmcmVxdWVuY3kgcmF0aW8gb2YgdGhlIHRvbmUgd2l0aCByZXNwZWN0IHRvIHJvb3QgdG9uZVxuICAgKi9cbiAgdHVuZSh0b25lOiBUdW5pbmdUb25lKTogSW50ZXJ2YWwge1xuICAgIC8vIEdldCB0aGUgcmF0aW8gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSB0YXJnZXQgdG9uZSBhbmQgdGhlIHJvb3QgdG9uZSwgcmFpc2VkIHRvIHRoZSBkaWZmZXJlbmNlIGluIG9jdGF2ZS5cbiAgICAvLyBUaGUgb2N0YXZlIGlzIGFsd2F5cyB0aGUgbGFzdCB0b25lIGFzIHBlciB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgYGludGVydmFsc2AgYXJyYXkuXG4gICAgcmV0dXJuIG5ldyBJbnRlcnZhbChcbiAgICAgIHRoaXMuaW50ZXJ2YWxzW3RvbmUucGl0Y2hDbGFzc10ucmF0aW8ubXVsKHRoaXMub2N0YXZlLnJhdGlvLnBvdyh0b25lLm9jdGF2ZSkpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBORUFSRVNUIFRPTkVcbiAgICogRmluZCB0aGUgbmVhcmVzdCB0b25lIGdpdmVuIGFuIGludGVydmFsIGFuZCByZXR1cm4gZGlmZmVyZW5jZVxuICAgKlxuICAgKiBAcGFyYW0gaW50ZXJ2YWw6IHRhcmdldCBpbnRlcnZhbFxuICAgKiBAcmV0dXJucyBuZWFyZXN0IHRvbmUsIGludGVydmFsIGFuZCBkaWZmZXJlbmNlIGZyb20gdGhlIHRhcmdldFxuICAgKi9cbiAgbmVhcmVzdChpbnRlcnZhbDogSW50ZXJ2YWwpOiB7dG9uZTogVHVuaW5nVG9uZSwgaW50ZXJ2YWw6IEludGVydmFsLCBkaWZmZXJlbmNlOiBJbnRlcnZhbH0ge1xuICAgIC8vIEJyaW5nIHRoZSBpbnRlcnZhbCB0byB0aGUgYmFzZSBvY3RhdmUuXG4gICAgY29uc3Qgb2N0YXZlID0gTWF0aC5mbG9vcihNYXRoLmxvZyhpbnRlcnZhbC5yYXRpby52YWx1ZU9mKCkpIC8gTWF0aC5sb2codGhpcy5vY3RhdmUucmF0aW8udmFsdWVPZigpKSk7XG4gICAgY29uc3QgYmFzZSA9IG5ldyBJbnRlcnZhbChpbnRlcnZhbC5yYXRpby5kaXYodGhpcy5vY3RhdmUucmF0aW8ucG93KG9jdGF2ZSkpKTtcblxuICAgIC8vIFNlYXJjaCB0aHJvdWdoIHRoZSBpbnRlcnZhbHMgdG8gbG9jYXRlIHRoZSBuZWFyZXN0LlxuICAgIGNvbnN0IG4gPSBiaW5hcnlTZWFyY2godGhpcy5pbnRlcnZhbHMsIGJhc2UsIEludGVydmFsLmNvbXBhcmUpO1xuICAgIGlmIChuID49IDApIHtcbiAgICAgIC8vIEV4YWN0IG1hdGNoOiByZXR1cm4gdGhlIHBpdGNoIGF0IHRoZSByaWdodCBvY3RhdmUuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b25lOiBuZXcgVHVuaW5nVG9uZSh0aGlzLCBuLCBvY3RhdmUpLFxuICAgICAgICBpbnRlcnZhbCxcbiAgICAgICAgZGlmZmVyZW5jZTogbmV3IEludGVydmFsKG5ldyBGcmFjdGlvbigxKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUGFydGlhbCBtYXRjaDogZmluZCByZWFsIG5lYXJlc3QgYmV0d2VlbiBpbnNlcnRpb24gcG9pbnQgYW5kIHByZXZpb3VzLlxuICAgICAgLy8gV2UncmUgZ3VhcmFudGVlZCB0byBmaW5kIGEgcHJldmlvdXMgdmFsdWUgYmVjYXVzZSB0aGUgZmlyc3QgdmFsdWUgaXMgYWx3YXlzIHVuaXNvbi5cbiAgICAgIGNvbnN0IG0gPSB+bjtcbiAgICAgIGNvbnN0IGxvd2VyID0gTWF0aC5hYnModGhpcy5pbnRlcnZhbHNbbS0xXS5kaWZmZXJlbmNlKGJhc2UpLmNlbnRzKTtcbiAgICAgIGNvbnN0IHVwcGVyID0gTWF0aC5hYnModGhpcy5pbnRlcnZhbHNbbV0uZGlmZmVyZW5jZShiYXNlKS5jZW50cyk7XG4gICAgICBjb25zdCBuZWFyZXN0ID0gbG93ZXIgPCB1cHBlciA/IG0tMSA6IG07XG4gICAgICBjb25zdCBuZWFyZXN0VG9uZSA9IG5ldyBUdW5pbmdUb25lKHRoaXMsIG5lYXJlc3QsIG9jdGF2ZSk7XG4gICAgICBjb25zdCBuZWFyZXN0SW50ZXJ2YWwgPSB0aGlzLnR1bmUobmVhcmVzdFRvbmUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9uZTogbmVhcmVzdFRvbmUsXG4gICAgICAgIGludGVydmFsOiBuZWFyZXN0SW50ZXJ2YWwsXG4gICAgICAgIGRpZmZlcmVuY2U6IG5lYXJlc3RJbnRlcnZhbC5kaWZmZXJlbmNlKGludGVydmFsKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFUVVBTCBESVZJU0lPTlMgT0YgVEhFIE9DVEFWRS5cbiAgICpcbiAgICogR2VuZXJhdGUgYW4gaW50ZXJ2YWxzIGFycmF5IGJhc2VkIG9uIGVxdWFsIGRpdmlzaW9ucyBvZiB0aGUgb2N0YXZlLlxuICAgKiBUaGUgaW50ZXJ2YWxzIGFyZSBjYWxjdWxhdGVkIGluIGNlbnRzLCBiZWNhdXNlIHRoZXkgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gcmF0aW9zXG4gICAqIGluc2lkZSB0aGUgVHVuaW5nIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgc3RhdGljIGludGVydmFsc0VkbyhkaXZpc2lvbnM6IG51bWJlcik6IEludGVydmFsW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKEFycmF5KGRpdmlzaW9ucyArIDEpKS5tYXAoKF8sIGkpID0+IHtcbiAgICAgIHJldHVybiBJbnRlcnZhbC5mcm9tQ2VudHMoMTIwMCAvIGRpdmlzaW9ucyAqIGkpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogVG9uZSBpbiBhIHR1bmluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIFR1bmluZ1RvbmUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHVuaW5nOiBUdW5pbmcsIHB1YmxpYyBwaXRjaENsYXNzOiBudW1iZXIsIHB1YmxpYyBvY3RhdmU6IG51bWJlcikge31cblxuICBnZXQgcGl0Y2goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5waXRjaENsYXNzICsgdGhpcy5vY3RhdmUgKiB0aGlzLnR1bmluZy5zdGVwcztcbiAgfVxuXG4gIGdldCB0dW5lKCk6IEludGVydmFsIHtcbiAgICByZXR1cm4gdGhpcy50dW5pbmcudHVuZSh0aGlzKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUGl0Y2godHVuaW5nOiBUdW5pbmcsIHBpdGNoOiBudW1iZXIpOiBUdW5pbmdUb25lIHtcbiAgICByZXR1cm4gbmV3IFR1bmluZ1RvbmUodHVuaW5nLCBtb2QocGl0Y2gsIHR1bmluZy5zdGVwcyksIE1hdGguZmxvb3IocGl0Y2ggLyB0dW5pbmcuc3RlcHMpKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVHVuaW5nLCBUdW5pbmdUb25lIH0gZnJvbSAnLi9UdW5pbmcnO1xuaW1wb3J0IHsgZXNjYXBlUmVnRXhwLCBtb2QgfSBmcm9tICcuL3V0aWxzL2hlbHBlcnMnO1xuaW1wb3J0IHsgTXVsdGltYXAgfSBmcm9tICcuL3V0aWxzL0JpbWFwJztcblxuLyoqXG4gKiBOT01FTkNMQVRVUkUgU1lTVEVNXG4gKlxuICogVG8gbmFtZSBub3Rlcywgd2UgdXNlIGEgY29tbW9uIHJlcHJlc2VudGF0aW9uIGJhc2VkIG9uIFNjaWVudGlmaWMgUGl0Y2ggTm90YXRpb24gKFNQTik6XG4gKiAtIFN0YW5kYXJkIG5vdGUgbGV0dGVycyBDLCBELCBFLCBGLCBHLCBBLCBCXG4gKiAtIEFuIGV4dGVuc2libGUgc2V0IG9mIGFjY2lkZW50YWxzXG4gKiAtIFRoZSBvY3RhdmUgc3BlY2lmaWNhdGlvblxuICpcbiAqIFdlIGRlZmluZSBhIHR1bmluZyBub3RhdGlvbiBtYXAgdGhhdCBkZWZpbmVzIGhvdyBub3RlcyBhbmQgYWNjaWRlbnRhbHMgbWFwIHRvIHR1bmluZyB0b25lcy9waXRjaGVzLlxuICovXG5leHBvcnQgY2xhc3MgVHVuaW5nTm90YXRpb24ge1xuICByZWdleDogUmVnRXhwO1xuXG4gIC8qKlxuICAgKiBDT05TVFJVQ1RPUlxuICAgKlxuICAgKiBAcGFyYW0gdHVuaW5nOiB0aGUgdHVuaW5nIGJlaW5nIG5vdGF0ZWRcbiAgICogQHBhcmFtIG1hcDogdGhlIG5vdGF0aW9uIG1hcCB0aGF0IG1hcHMgZXZlcnkgbm90ZSBsZXR0ZXIgKyBhY2NpZGVudGFsIGNvbWJpbmF0aW9uIHRvIHRoZSB0dW5pbmcgdG9uZVxuICAgKiAgICAgICAgLSBkaWZmZXJlbnQgbm90ZSBuYW1lcyB0aGF0IG1hcCB0byB0aGUgc2FtZSBpbmRleCAoZS5nLiBDIyA9IERiID0+IDEpIHNob3VsZCBoYXZlIHNlcGFyYXRlIGVudHJpZXNcbiAgICogICAgICAgIC0gZG9uJ3QgaW5jbHVkZSBvY3RhdmUgbnVtYmVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIHR1bmluZzogVHVuaW5nLCBwdWJsaWMgbWFwOiBNdWx0aW1hcDxzdHJpbmcsIG51bWJlcj4pIHtcbiAgICB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICdeKCcgKyBBcnJheS5mcm9tKHRoaXMubWFwLmtleXMoKSkubWFwKGVzY2FwZVJlZ0V4cCkuam9pbignfCcpICsgJyknICtcbiAgICAgICcoLT9cXFxcZCkkJyxcbiAgICAgICdpJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQlVJTEQgQSBNQVAgQlkgQ09NQklOSU5HIE5PVEVTIEFORCBBQ0NJREVOVEFMU1xuICAgKlxuICAgKiBAcGFyYW0gdHVuaW5nOiBhcyBwZXIgY29uc3RydWN0b3JcbiAgICogQHBhcmFtIG5vdGVzOiBtYXAgb2Ygbm90ZSBsZXR0ZXJzIHRvIHRvbmUgaW5kZXhlczpcbiAgICogYGBgXG4gICAqIHtcbiAgICogICAnQyc6IDAsXG4gICAqICAgJ0QnOiAyLFxuICAgKiAgICdFJzogNCxcbiAgICogICAnRic6IDUsXG4gICAqICAgJ0cnOiA3LFxuICAgKiAgICdBJzogOSxcbiAgICogICAnQic6IDExLFxuICAgKiB9XG4gICAqIEBwYXJhbSBhY2NpZGVudGFsczogbWFwIG9mIG5vdGUgYWNjaWRlbnRhbHMgdG8gdG9uZSBpbmNyZW1lbnRzOlxuICAgKiBgYGBcbiAgICoge1xuICAgKiAgICcjJzogKzEsXG4gICAqICAgJ2InOiAtMSxcbiAgICogICAnbic6ICAwLFxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgc3RhdGljIGZyb21Ob3Rlc0FjY2lkZW50YWxzQ29tYmluYXRpb24oXG4gICAgdHVuaW5nOiBUdW5pbmcsXG4gICAgbm90ZXM6IHtbbm90ZTogc3RyaW5nXTogbnVtYmVyfSxcbiAgICBhY2NpZGVudGFsczoge1thY2NpZGVudGFsOiBzdHJpbmddOiBudW1iZXJ9XG4gICk6IFR1bmluZ05vdGF0aW9uIHtcbiAgICBjb25zdCBtYXAgPSBuZXcgTXVsdGltYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gICAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2gobm90ZSA9PiB7XG4gICAgICBtYXAuc2V0KGAke25vdGV9YCwgbm90ZXNbbm90ZV0pO1xuICAgICAgT2JqZWN0LmtleXMoYWNjaWRlbnRhbHMpLmZvckVhY2goYWNjaWRlbnRhbCA9PiB7XG4gICAgICAgIG1hcC5zZXQoYCR7bm90ZX0ke2FjY2lkZW50YWx9YCwgbW9kKG5vdGVzW25vdGVdICsgYWNjaWRlbnRhbHNbYWNjaWRlbnRhbF0sIHR1bmluZy5zdGVwcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBUdW5pbmdOb3RhdGlvbih0dW5pbmcsIG1hcCk7XG4gIH1cblxuICAvKipcbiAgICogTkFNRSBBIFRPTkVcbiAgICpcbiAgICogQHBhcmFtIHRvbmU6IHRvbmUgdG8gYmUgbmFtZWRcbiAgICogQHJldHVybnMgYXJyYXkgb2Ygc3RyaW5ncyByZXByZXNlbnRpbmcgdGhlIGVuaGFybW9uaWMgbmFtaW5ncyBvZiB0aGUgdG9uZVxuICAgKi9cbiAgbmFtZSh0b25lOiBUdW5pbmdUb25lKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IG5hbWVzID0gWy4uLnRoaXMubWFwLmdldEtleSh0b25lLnBpdGNoQ2xhc3MpXTtcbiAgICByZXR1cm4gbmFtZXMuc29ydCgoYSwgYikgPT4gYS5sZW5ndGggLSBiLmxlbmd0aCkubWFwKG5hbWUgPT4gYCR7bmFtZX0ke3RvbmUub2N0YXZlfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBBUlNFIEEgTk9URVxuICAgKlxuICAgKiBAcGFyYW0gbm90ZTogdGFyZ2V0IG5vdGUgaW4gc2NpZW50aWZpYyBwaXRjaCBub3RhdGlvblxuICAgKiBAcmV0dXJucyB0b25lIGdlbmVyYXRvclxuICAgKi9cbiAgcGFyc2Uobm90ZTogc3RyaW5nKTogVHVuaW5nVG9uZSB7XG4gICAgY29uc3QgbWF0Y2ggPSB0aGlzLnJlZ2V4LmV4ZWMobm90ZSk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBbVHVuaW5nTm90YXRpb24ucGFyc2VdIENvdWxkIG5vdCBwYXJzZSBub3RlICR7bm90ZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUdW5pbmdUb25lKHRoaXMudHVuaW5nLCB0aGlzLm1hcC5nZXQobWF0Y2hbMV0pLCBwYXJzZUludChtYXRjaFsyXSwgMTApKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9UdW5pbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9UdW5pbmdOb3RhdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL0ludGVydmFsJztcbmV4cG9ydCAqIGZyb20gJy4vVG9uZVJvdyc7XG5leHBvcnQgKiBmcm9tICcuL011c2ljWE1MJztcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvQW5ub3RhdGlvbic7XG4iLCIvKipcbiAqIEFOTk9UQVRJT05cbiAqXG4gKiBBbiBhbm5vdGF0aW9uIGlzIGEgZ2VuZXJpYyBjb250YWluZXIgZm9yIG1ldGFkYXRhIHRoYXQgY2FuIGJlIGF0dGFjaGVkIHRvIGFueSBvYmplY3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbm5vdGF0aW9uIHtcbiAgc3RhdGljIGZpbmRCeUxhYmVsKGxhYmVsOiBzdHJpbmcsIGFubm90YXRpb25zOiBBbm5vdGF0aW9uW10pOiBhbnlbXSB7XG4gICAgcmV0dXJuIGFubm90YXRpb25zLmZpbHRlcihhbm5vdGF0aW9uID0+IGFubm90YXRpb24ubGFiZWwgPSBsYWJlbCkubWFwKGFubm90YXRpb24gPT4gYW5ub3RhdGlvbi52YWx1ZSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbGFiZWw6IHN0cmluZywgcHVibGljIHZhbHVlOiBhbnkpIHt9XG59XG4iLCIvKipcbiAqIEJJRElSRUNUSU9OQUwgTUFQXG4gKlxuICogQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9UaG9tYXNSb29uZXkvdHlwZWQtYmktZGlyZWN0aW9uYWwtbWFwXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUJpbWFwPEssIFY+IGV4dGVuZHMgTWFwPEssIFY+IHtcbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyOyAvLyByZXR1cm5zIHRoZSB0b3RhbCBudW1iZXIgb2YgZWxlbWVudHNcbiAgZ2V0OiAoa2V5OiBLKSA9PiBWIHwgdW5kZWZpbmVkOyAvLyByZXR1cm5zIGEgc3BlY2lmaWVkIGVsZW1lbnRcbiAgZ2V0S2V5OiAodmFsdWU6IFYpID0+IEsgfCBLW10gfCB1bmRlZmluZWQ7IC8vIHJldHVybnMgYSBzcGVjaWZpZWQgZWxlbWVudFxuICBnZXRWYWx1ZTogKGtleTogSykgPT4gViB8IHVuZGVmaW5lZDsgLy8gcmV0dXJucyBhIHNwZWNpZmllZCBlbGVtZW50XG4gIHNldDogKGtleTogSywgdmFsdWU6IFYpID0+IHRoaXM7IC8vIGFkZHMgb3IgdXBkYXRlcyB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBsb29rZWQgdXAgdmlhIHRoZSBzcGVjaWZpZWQga2V5XG4gIHNldFZhbHVlOiAoa2V5OiBLLCB2YWx1ZTogVikgPT4gdGhpczsgLy8gYWRkcyBvciB1cGRhdGVzIHRoZSBrZXkgb2YgYW4gZWxlbWVudCBsb29rZWQgdXAgdmlhIHRoZSBzcGVjaWZpZWQgdmFsdWVcbiAgc2V0S2V5OiAodmFsdWU6IFYsIGtleTogSykgPT4gdGhpczsgLy8gYWRkcyBvciB1cGRhdGVzIHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGxvb2tlZCB1cCB2aWEgdGhlIHNwZWNpZmllZCBrZXlcbiAgY2xlYXI6ICgpID0+IHZvaWQ7IC8vIHJlbW92ZXMgYWxsIGVsZW1lbnRzXG4gIGRlbGV0ZTogKGtleTogSykgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgZXhpc3RlZCBhbmQgaGFzIGJlZW4gcmVtb3ZlZCwgb3IgZmFsc2UgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QuXG4gIGRlbGV0ZUtleTogKGtleTogSykgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgZXhpc3RlZCBhbmQgaGFzIGJlZW4gcmVtb3ZlZCwgb3IgZmFsc2UgaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QuXG4gIGRlbGV0ZVZhbHVlOiAodmFsdWU6IFYpID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IGV4aXN0ZWQgYW5kIGhhcyBiZWVuIHJlbW92ZWQsIG9yIGZhbHNlIGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IGV4aXN0LlxuICBmb3JFYWNoOiAoXG4gICAgY2FsbGJhY2tmbjogKHZhbHVlOiBWLCBrZXk6IEssIG1hcDogSUJpbWFwPEssIFY+KSA9PiB2b2lkLFxuICAgIHRoaXNBcmc/OiBhbnlcbiAgKSA9PiB2b2lkOyAvLyBleGVjdXRlcyB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgb25jZSBmb3IgZWFjaCBrZXkgb2YgdGhlIG1hcFxuICBoYXM6IChrZXk6IEspID0+IGJvb2xlYW47IC8vIFJldHVybnMgdHJ1ZSBpZiBhbiBlbGVtZW50IHdpdGggdGhlIHNwZWNpZmllZCBrZXkgZXhpc3RzOyBvdGhlcndpc2UgZmFsc2UuXG4gIGhhc0tleTogKGtleTogSykgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBleGlzdHM7IG90aGVyd2lzZSBmYWxzZS5cbiAgaGFzVmFsdWU6ICh2YWx1ZTogVikgPT4gYm9vbGVhbjsgLy8gUmV0dXJucyB0cnVlIGlmIGFuIGVsZW1lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIHZhbHVlIGV4aXN0czsgb3RoZXJ3aXNlIGZhbHNlLlxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ01hcCc7IC8vIEFueXRoaW5nIGltcGxlbWVudGluZyBNYXAgbXVzdCBhbHdheXMgaGF2ZSB0b1N0cmluZ1RhZyBkZWNsYXJlZCB0byBiZSAnTWFwJy4gSSBjb25zaWRlciB0aGlzIGEgbGl0dGxlIHNpbGx5LlxuICBpbnNwZWN0OiAoKSA9PiBzdHJpbmc7IC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byBpbnNwZWN0IGN1cnJlbnQgY29udGVudHMgYXMgYSBzdHJpbmdcbn1cblxuLyoqXG4gKiBCaW1hcCB3aXRob3V0IGR1cGxpY2F0ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW1hcDxLLCBWPiBpbXBsZW1lbnRzIElCaW1hcDxLLCBWPiB7XG4gIHByb3RlY3RlZCBrZXlWYWx1ZU1hcDogTWFwPEssIFY+ID0gbmV3IE1hcDxLLCBWPigpO1xuICBwcm90ZWN0ZWQgdmFsdWVLZXlNYXA6IE1hcDxWLCBLPiA9IG5ldyBNYXA8ViwgSz4oKTtcblxuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmtleVZhbHVlTWFwLnNpemU7XG4gIH1cblxuICBwdWJsaWMgW1N5bWJvbC50b1N0cmluZ1RhZ106ICdNYXAnO1xuICBwdWJsaWMgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiA9IHRoaXMua2V5VmFsdWVNYXBbU3ltYm9sLml0ZXJhdG9yXTtcblxuICBwdWJsaWMgZW50cmllcyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPFtLLCBWXT4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5lbnRyaWVzKCk7XG4gIHB1YmxpYyBrZXlzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8Sz4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5rZXlzKCk7XG4gIHB1YmxpYyB2YWx1ZXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxWPiA9PiB0aGlzLmtleVZhbHVlTWFwLnZhbHVlcygpO1xuXG4gIHB1YmxpYyBnZXQgPSAoYTogSyk6IFYgfCB1bmRlZmluZWQgPT4gdGhpcy5rZXlWYWx1ZU1hcC5nZXQoYSk7XG4gIHB1YmxpYyBnZXRLZXkgPSAoYjogVik6IEsgfCB1bmRlZmluZWQgPT4gdGhpcy52YWx1ZUtleU1hcC5nZXQoYik7XG4gIHB1YmxpYyBnZXRWYWx1ZSA9IChhOiBLKTogViB8IHVuZGVmaW5lZCA9PiB0aGlzLmdldChhKTtcbiAgcHVibGljIHNldCA9IChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyA9PiB7XG4gICAgLy8gTWFrZSBzdXJlIG5vIGR1cGxpY2F0ZXMuIE91ciBjb25mbGljdCBzY2VuYXJpbyBpcyBoYW5kbGVkIGJ5IGRlbGV0aW5nIHBvdGVudGlhbCBkdXBsaWNhdGVzLCBpbiBmYXZvdXIgb2YgdGhlIGN1cnJlbnQgYXJndW1lbnRzXG4gICAgdGhpcy5kZWxldGUoa2V5KTtcbiAgICB0aGlzLmRlbGV0ZVZhbHVlKHZhbHVlKTtcblxuICAgIHRoaXMua2V5VmFsdWVNYXAuc2V0KGtleSwgdmFsdWUpO1xuICAgIHRoaXMudmFsdWVLZXlNYXAuc2V0KHZhbHVlLCBrZXkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHB1YmxpYyBzZXRLZXkgPSAodmFsdWU6IFYsIGtleTogSyk6IHRoaXMgPT4gdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIHB1YmxpYyBzZXRWYWx1ZSA9IChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyA9PiB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgcHVibGljIGNsZWFyID0gKCk6IHZvaWQgPT4ge1xuICAgIHRoaXMua2V5VmFsdWVNYXAuY2xlYXIoKTtcbiAgICB0aGlzLnZhbHVlS2V5TWFwLmNsZWFyKCk7XG4gIH07XG4gIHB1YmxpYyBkZWxldGUgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHRoaXMuaGFzKGtleSkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5rZXlWYWx1ZU1hcC5nZXQoa2V5KSBhcyBWO1xuICAgICAgdGhpcy5rZXlWYWx1ZU1hcC5kZWxldGUoa2V5KTtcbiAgICAgIHRoaXMudmFsdWVLZXlNYXAuZGVsZXRlKHZhbHVlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIHB1YmxpYyBkZWxldGVLZXkgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmRlbGV0ZShrZXkpO1xuICBwdWJsaWMgZGVsZXRlVmFsdWUgPSAodmFsdWU6IFYpOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5oYXNWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZSh0aGlzLnZhbHVlS2V5TWFwLmdldCh2YWx1ZSkgYXMgSyk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgcHVibGljIGZvckVhY2ggPSAoXG4gICAgY2FsbGJhY2tmbjogKHZhbHVlOiBWLCBrZXk6IEssIG1hcDogSUJpbWFwPEssIFY+KSA9PiB2b2lkLFxuICAgIHRoaXNBcmc/OiBhbnlcbiAgKTogdm9pZCA9PiB7XG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBjYWxsYmFja2ZuLmFwcGx5KHRoaXNBcmcsIFt2YWx1ZSwga2V5LCB0aGlzXSk7XG4gICAgfSk7XG4gIH07XG4gIHB1YmxpYyBoYXMgPSAoa2V5OiBLKTogYm9vbGVhbiA9PiB0aGlzLmtleVZhbHVlTWFwLmhhcyhrZXkpO1xuICBwdWJsaWMgaGFzS2V5ID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5oYXMoa2V5KTtcbiAgcHVibGljIGhhc1ZhbHVlID0gKHZhbHVlOiBWKTogYm9vbGVhbiA9PiB0aGlzLnZhbHVlS2V5TWFwLmhhcyh2YWx1ZSk7XG4gIHB1YmxpYyBpbnNwZWN0ID0gKCk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHN0ciA9ICdCaW1hcCB7JztcbiAgICBsZXQgZW50cnkgPSAwO1xuICAgIHRoaXMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgZW50cnkrKztcbiAgICAgIHN0ciArPSAnJyArIGtleS50b1N0cmluZygpICsgJyA9PiAnICsgdmFsdWUudG9TdHJpbmcoKSArICcnO1xuICAgICAgaWYgKGVudHJ5IDwgdGhpcy5zaXplKSB7XG4gICAgICAgIHN0ciArPSAnLCAnO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHN0ciArPSAnfSc7XG4gICAgcmV0dXJuIHN0cjtcbiAgfTtcbn1cblxuLyoqXG4gKiBCaW1hcCB3aXRoIG11bHRpcGxlIHZhbHVlcyBwZXIga2V5LlxuICovXG5leHBvcnQgY2xhc3MgTXVsdGltYXA8SywgVj4gaW1wbGVtZW50cyBJQmltYXA8SywgVj4ge1xuICBwcm90ZWN0ZWQga2V5VmFsdWVNYXA6IE1hcDxLLCBWPiA9IG5ldyBNYXA8SywgVj4oKTtcbiAgcHJvdGVjdGVkIHZhbHVlS2V5TWFwOiBNYXA8ViwgS1tdPiA9IG5ldyBNYXA8ViwgS1tdPigpO1xuXG4gIGdldCBzaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMua2V5VmFsdWVNYXAuc2l6ZTtcbiAgfVxuXG4gIHB1YmxpYyBbU3ltYm9sLnRvU3RyaW5nVGFnXTogJ01hcCc7XG4gIHB1YmxpYyBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gSXRlcmFibGVJdGVyYXRvcjxbSywgVl0+ID0gdGhpcy5rZXlWYWx1ZU1hcFtTeW1ib2wuaXRlcmF0b3JdO1xuXG4gIHB1YmxpYyBlbnRyaWVzID0gKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPiA9PiB0aGlzLmtleVZhbHVlTWFwLmVudHJpZXMoKTtcbiAgcHVibGljIGtleXMgPSAoKTogSXRlcmFibGVJdGVyYXRvcjxLPiA9PiB0aGlzLmtleVZhbHVlTWFwLmtleXMoKTtcbiAgcHVibGljIHZhbHVlcyA9ICgpOiBJdGVyYWJsZUl0ZXJhdG9yPFY+ID0+IHRoaXMua2V5VmFsdWVNYXAudmFsdWVzKCk7XG5cbiAgcHVibGljIGdldCA9IChhOiBLKTogViB8IHVuZGVmaW5lZCA9PiB0aGlzLmtleVZhbHVlTWFwLmdldChhKTtcbiAgcHVibGljIGdldEtleSA9IChiOiBWKTogS1tdIHwgdW5kZWZpbmVkID0+IHRoaXMudmFsdWVLZXlNYXAuZ2V0KGIpO1xuICBwdWJsaWMgZ2V0VmFsdWUgPSAoYTogSyk6IFYgfCB1bmRlZmluZWQgPT4gdGhpcy5nZXQoYSk7XG4gIHB1YmxpYyBzZXQgPSAoa2V5OiBLLCB2YWx1ZTogVik6IHRoaXMgPT4ge1xuICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5zZXQoa2V5LCB2YWx1ZSk7XG5cbiAgICBjb25zdCBrZXlzID0gdGhpcy52YWx1ZUtleU1hcC5nZXQodmFsdWUpIHx8IFtdO1xuICAgIHRoaXMudmFsdWVLZXlNYXAuc2V0KHZhbHVlLCBbLi4ua2V5cywga2V5XSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcHVibGljIHNldEtleSA9ICh2YWx1ZTogViwga2V5OiBLKTogdGhpcyA9PiB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgcHVibGljIHNldFZhbHVlID0gKGtleTogSywgdmFsdWU6IFYpOiB0aGlzID0+IHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICBwdWJsaWMgY2xlYXIgPSAoKTogdm9pZCA9PiB7XG4gICAgdGhpcy5rZXlWYWx1ZU1hcC5jbGVhcigpO1xuICAgIHRoaXMudmFsdWVLZXlNYXAuY2xlYXIoKTtcbiAgfTtcbiAgcHVibGljIGRlbGV0ZSA9IChrZXk6IEspOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5oYXMoa2V5KSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmtleVZhbHVlTWFwLmdldChrZXkpIGFzIFY7XG4gICAgICB0aGlzLmtleVZhbHVlTWFwLmRlbGV0ZShrZXkpO1xuICAgICAgY29uc3Qga2V5cyA9IHRoaXMudmFsdWVLZXlNYXAuZ2V0KHZhbHVlKS5maWx0ZXIoayA9PiBrICE9PSBrZXkpO1xuICAgICAgaWYgKGtleXMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnZhbHVlS2V5TWFwLnNldCh2YWx1ZSwga2V5cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZhbHVlS2V5TWFwLmRlbGV0ZSh2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBwdWJsaWMgZGVsZXRlS2V5ID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5kZWxldGUoa2V5KTtcbiAgcHVibGljIGRlbGV0ZVZhbHVlID0gKHZhbHVlOiBWKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKHRoaXMuaGFzVmFsdWUodmFsdWUpKSB7XG4gICAgICB0aGlzLnZhbHVlS2V5TWFwLmdldCh2YWx1ZSkuZm9yRWFjaChrZXkgPT4geyB0aGlzLmRlbGV0ZShrZXkpOyB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIHB1YmxpYyBmb3JFYWNoID0gKFxuICAgIGNhbGxiYWNrZm46ICh2YWx1ZTogViwga2V5OiBLLCBtYXA6IElCaW1hcDxLLCBWPikgPT4gdm9pZCxcbiAgICB0aGlzQXJnPzogYW55XG4gICk6IHZvaWQgPT4ge1xuICAgIHRoaXMua2V5VmFsdWVNYXAuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY2FsbGJhY2tmbi5hcHBseSh0aGlzQXJnLCBbdmFsdWUsIGtleSwgdGhpc10pO1xuICAgIH0pO1xuICB9O1xuICBwdWJsaWMgaGFzID0gKGtleTogSyk6IGJvb2xlYW4gPT4gdGhpcy5rZXlWYWx1ZU1hcC5oYXMoa2V5KTtcbiAgcHVibGljIGhhc0tleSA9IChrZXk6IEspOiBib29sZWFuID0+IHRoaXMuaGFzKGtleSk7XG4gIHB1YmxpYyBoYXNWYWx1ZSA9ICh2YWx1ZTogVik6IGJvb2xlYW4gPT4gdGhpcy52YWx1ZUtleU1hcC5oYXModmFsdWUpO1xuICBwdWJsaWMgaW5zcGVjdCA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBzdHIgPSAnTXVsdGltYXAgeyc7XG4gICAgbGV0IGVudHJ5ID0gMDtcbiAgICB0aGlzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGVudHJ5Kys7XG4gICAgICBzdHIgKz0gJycgKyBrZXkudG9TdHJpbmcoKSArICcgPT4gJyArIHZhbHVlLnRvU3RyaW5nKCkgKyAnJztcbiAgICAgIGlmIChlbnRyeSA8IHRoaXMuc2l6ZSkge1xuICAgICAgICBzdHIgKz0gJywgJztcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzdHIgKz0gJ30nO1xuICAgIHJldHVybiBzdHI7XG4gIH07XG59XG4iLCJpbXBvcnQgRnJhY3Rpb24gZnJvbSAnZnJhY3Rpb24uanMnO1xuXG4vKipcbiAqIEVzY2FwZSBhIHN0cmluZyB0byBiZSB1c2VkIGluIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9uc1xuICpcbiAqIEBwYXJhbSBzdHI6IHN0cmluZyB0byBlc2NhcGVcbiAqIEByZXR1cm5zIGVzY2FwZWQsIFJlZ0V4cC1yZWFkeSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKTsgLy8gJCYgbWVhbnMgdGhlIHdob2xlIG1hdGNoZWQgc3RyaW5nXG59XG5cbi8qKlxuICogR2V0IHByaW1lcyB1cCB0byBhIGdpdmVuIGludGVnZXIuXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTIyODc1OTkvMjA5MTg0XG4gKiBVc2VzIHRoZSBTaWV2ZSBvZiBFcmF0b3N0aGVuZXMgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2lldmVfb2ZfRXJhdG9zdGhlbmVzXG4gKlxuICogQHBhcmFtIG1heDogbnVtYmVyIHRvIHJlYWNoXG4gKiBAcmV0dXJucyBhbGwgcHJpbWVzIHVwIHRvIG1heFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpbWVzKG1heDogbnVtYmVyKTogbnVtYmVyW10ge1xuICBjb25zdCBzaWV2ZTogYm9vbGVhbltdID0gW10sIHByaW1lczogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDI7IGkgPD0gbWF4OyArK2kpIHtcbiAgICBpZiAoIXNpZXZlW2ldKSB7XG4gICAgICAvLyBpIGhhcyBub3QgYmVlbiBtYXJrZWQgLS0gaXQgaXMgcHJpbWVcbiAgICAgIHByaW1lcy5wdXNoKGkpO1xuICAgICAgZm9yIChsZXQgaiA9IGkgPDwgMTsgaiA8PSBtYXg7IGogKz0gaSkge1xuICAgICAgICAgIHNpZXZlW2pdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHByaW1lcztcbn1cblxuLyoqXG4gKiBFbnN1cmUgYSB8ZnJhY3Rpb258IDwgMSBvciA+IDEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGlwRnJhY3Rpb24oZjogRnJhY3Rpb24sIGdyZWF0ZXJUaGFuT25lID0gZmFsc2UpOiBGcmFjdGlvbiB7XG4gIHJldHVybiBncmVhdGVyVGhhbk9uZSA/XG4gICAgKGYuYWJzKCkuY29tcGFyZSgxKSA8IDAgPyBmLmludmVyc2UoKSA6IGYpIDpcbiAgICAoZi5hYnMoKS5jb21wYXJlKDEpID4gMCA/IGYuaW52ZXJzZSgpIDogZikgO1xufVxuXG4vKipcbiAqIEJpbmFyeSBzZWFyY2ggaW4gYW4gYXJyYXkuXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjkwMTg3NDUvMjA5MTg0XG4gKlxuICogQHBhcmFtIGFyOiBlbGVtZW50cyBhcnJheSB0aGF0IGlzIHNvcnRlZFxuICogQHBhcmFtIGVsOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIGNvbXA6IGNvbXBhcmlzb24gZnVuY3Rpb24gKGEsYikgPT4gbiB3aXRoXG4gKiAgICAgICAgbiA+IDAgaWYgYSA+IGJcbiAqICAgICAgICBuIDwgMCBpZiBhIDwgYlxuICogICAgICAgIG4gPSAwIGlmIGEgPSBiXG4gKiBAcmV0dXJucyBpbmRleCBtID49IDAgaWYgbWF0Y2ggaXMgZm91bmQsIG0gPCAwIGlmIG5vdCBmb3VuZCB3aXRoIGluc2VydGlvbiBwb2ludCA9IC1tLTEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2g8VD4oYXI6IFJlYWRvbmx5QXJyYXk8VD4sIGVsOiBULCBjb21wOiAoYTogVCwgYjogVCkgPT4gbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IG0gPSAwO1xuICBsZXQgbiA9IGFyLmxlbmd0aCAtIDE7XG4gIHdoaWxlIChtIDw9IG4pIHtcbiAgICBjb25zdCBrID0gKG4gKyBtKSA+PiAxO1xuICAgIGNvbnN0IGNtcCA9IGNvbXAoZWwsIGFyW2tdKTtcbiAgICBpZiAoY21wID4gMCkge1xuICAgICAgbSA9IGsgKyAxO1xuICAgIH0gZWxzZSBpZiAoY21wIDwgMCkge1xuICAgICAgbiA9IGsgLSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIH5tO1xufVxuXG4vKipcbiAqIENoZWNrIGFycmF5IGVxdWFsaXR5LlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xLzc4Mzc0NTYvMjA5MTg0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUVxdWFsPFQ+KGFyMTogUmVhZG9ubHlBcnJheTxUPiwgYXIyOiBSZWFkb25seUFycmF5PFQ+LCBjb21wOiAoYTogVCwgYjogVCkgPT4gbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgYXIxLmxlbmd0aCA9PT0gYXIyLmxlbmd0aCAmJlxuICAgIGFyMS5ldmVyeSgodmFsdWUsIGluZGV4KSA9PiBjb21wKHZhbHVlLCBhcjJbaW5kZXhdKSA9PT0gMClcbiAgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgd2l0aCB1bmlxdWUgdmFsdWVzLlxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE3OTAzMDE4LzIwOTE4NFxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlVbmlxdWU8VD4oYXI6IFJlYWRvbmx5QXJyYXk8VD4pOiBSZWFkb25seUFycmF5PFQ+IHtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KGFyKV07XG59XG5cbi8qKlxuICogQWx3YXlzLXBvc2l0aXZlIE1vZHVsbyBmdW5jdGlvbi4gVGhlIGJ1aWx0LWluICUgb3BlcmF0b3IgY29tcHV0ZXMgdGhlIFJlbWFpbmRlci5cbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL09wZXJhdG9ycy9SZW1haW5kZXJcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNzMyMzYwOC8yMDkxODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vZChuOiBudW1iZXIsIG06IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiAoKG4gJSBtKSArIG0pICUgbTtcbn1cblxuLyoqXG4gKiBBcnJheSByYW5nZS5cbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDA1MDgzMS8yMDkxODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5UmFuZ2Uoc2l6ZTogbnVtYmVyLCBzdGFydEF0ID0gMCk6IFJlYWRvbmx5QXJyYXk8bnVtYmVyPiB7XG4gIHJldHVybiBbLi4uQXJyYXkoc2l6ZSkua2V5cygpXS5tYXAoaSA9PiBpICsgc3RhcnRBdCk7XG59XG4iLCIvKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jcmVhdGVCaW5kaW5nKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIHJlc3VsdFtrXSA9IG1vZFtrXTtcclxuICAgIHJlc3VsdC5kZWZhdWx0ID0gbW9kO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByaXZhdGVNYXAuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHByaXZhdGVNYXAsIHZhbHVlKSB7XHJcbiAgICBpZiAoIXByaXZhdGVNYXAuaGFzKHJlY2VpdmVyKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhdHRlbXB0ZWQgdG8gc2V0IHByaXZhdGUgZmllbGQgb24gbm9uLWluc3RhbmNlXCIpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZU1hcC5zZXQocmVjZWl2ZXIsIHZhbHVlKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2luZGV4LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9