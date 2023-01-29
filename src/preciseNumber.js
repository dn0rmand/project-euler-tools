require("./numberHelper");
require("./bigintHelper");

let useBigInt = true;

function BIG(v, convertToNumber) {
  if (v === Infinity) {
    return v;
  }
  if (useBigInt) {
    return BigInt(v);
  } else if (convertToNumber) {
    return Number(v);
  }
  return v;
}

class PreciseNumber {
  static allowSimplification = true;

  static setUseBigInt(value) {
    useBigInt = value;

    PreciseNumber.Infinity = PreciseNumber.create(Infinity, BIG(1));
    PreciseNumber.Zero = PreciseNumber.create(BIG(0), BIG(1));
    PreciseNumber.One = PreciseNumber.create(BIG(1), BIG(1));
  }

  static Infinity = PreciseNumber.create(Infinity, BIG(1));
  static Zero = PreciseNumber.create(BIG(0), BIG(1));
  static One = PreciseNumber.create(BIG(1), BIG(1));

  static create(numerator, divisor) {
    const p = new PreciseNumber();
    if (numerator !== Infinity) {
      p.numerator = BIG(numerator, true);
      p.divisor = BIG(divisor, true);
      p.simplify();
    } else {
      p.numerator = BIG(numerator, true);
      p.divisor = BIG(1);
    }
    return p;
  }

  constructor(value) {
    if (value === undefined) {
      this.numerator = BIG(0);
      this.divisor = BIG(1);
    } else if (value === Infinity) {
      this.numerator = Infinity;
      this.divisor = BIG(1);
    } else if (value instanceof PreciseNumber) {
      this.numerator = value.numerator;
      this.divisor = value.divisor;
    } else if (typeof value === "bigint") {
      this.divisor = BIG(1);
      this.numerator = BIG(value, true);
    } else {
      value = +value;
      if (isNaN(value)) {
        throw "Not a valid number";
      }
      this.divisor = BIG(1);
      const TEN = BIG(10);
      while (Math.floor(value) !== value) {
        this.divisor *= TEN;
        value *= 10;
      }
      this.numerator = value;
      this.simplify();
    }
  }

  simplify() {
    if (!PreciseNumber.allowSimplification) {
      return;
    }

    if (!this.divisor) {
      this.numerator = BIG(0);
      this.divisor = BIG(1);
      return;
    }
    if (!this.numerator) {
      this.divisor = BIG(1);
      this.numerator = BIG(0);
      return;
    }
    if (this.divisor < 0) {
      // It's better is the negative value is the numerator
      this.numerator = -this.numerator;
      this.divisor = -this.divisor;
    }

    let g = this.numerator.gcd(this.divisor);
    if (g < 0) g = -g;
    if (g != 1) {
      this.numerator /= g;
      this.divisor /= g;
    }
  }

  plus(other) {
    if (!(other instanceof PreciseNumber)) {
      other = new PreciseNumber(other);
    }

    const state = new PreciseNumber();

    state.numerator =
      this.numerator * other.divisor + this.divisor * other.numerator;
    state.divisor = this.divisor * other.divisor;

    state.simplify();
    return state;
  }

  minus(other) {
    if (!(other instanceof PreciseNumber)) {
      other = new PreciseNumber(other);
    }
    const state = new PreciseNumber();

    state.numerator =
      this.numerator * other.divisor - this.divisor * other.numerator;
    state.divisor = this.divisor * other.divisor;

    state.simplify();
    return state;
  }

  times(other) {
    if (!(other instanceof PreciseNumber)) {
      other = new PreciseNumber(other);
    }
    const state = new PreciseNumber();

    state.divisor = this.divisor * other.divisor;
    state.numerator = this.numerator * other.numerator;

    state.simplify();
    return state;
  }

  divide(other) {
    if (!(other instanceof PreciseNumber)) {
      other = new PreciseNumber(other);
    }
    const state = new PreciseNumber();

    state.divisor = this.divisor * other.numerator;
    state.numerator = this.numerator * other.divisor;

    state.simplify();
    return state;
  }

  get valid() {
    return this.divisor;
  }

  reverse() {
    const r = new PreciseNumber();
    r.divisor = this.numerator;
    r.numerator = this.divisor;
    return r;
  }

  equals(other) {
    if (!(other instanceof PreciseNumber)) {
      other = new PreciseNumber(other);
    }
    return other.numerator === this.numerator && other.divisor === this.divisor;
  }

  pow(value) {
    let v = PreciseNumber.One;

    for (let p = 1; p <= value; p++) {
      v = v.times(this);
    }

    return v;
  }

  less(other) {
    if (this.equals(other)) {
      return false;
    }

    const diff = this.minus(other);
    return diff.numerator < 0;
  }

  greater(other) {
    if (this.equals(other)) {
      return false;
    }
    return new PreciseNumber(other).less(this);
  }

  toString() {
    if (this.divisor == 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.divisor}`;
  }

  get isInfinity() {
    return this.numerator === Infinity;
  }

  valueOf(precision) {
    if (this.isInfinity && this.divisor == 0) {
      return Infinity;
    }

    if (useBigInt) {
      return this.numerator.divise(this.divisor, precision || 10);
    } else {
      return this.numerator / this.divisor;
    }
  }
}

module.exports = PreciseNumber;
