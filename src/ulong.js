// Only 2*31 bits because 32 bits has issues and we only need 60 bits
class ULong {
  static BITS = 31;
  static MODULO_N = 2n ** BigInt(ULong.BITS);
  static MASK_N = ULong.MODULO_N - 1n;

  static MODULO = 2 ** ULong.BITS;
  static MASK = ULong.MODULO - 1;

  static ONE = new ULong(1);
  static ZERO = new ULong(0);

  //#region Static methods

  static fromNumber(number) {
    if (typeof number !== "number") {
      throw "ERROR. Invalid input";
    }

    const lo = number & ULong.MASK;
    const hi = ((number - lo) / ULong.MODULO) & ULong.MASK;
    return new ULong(lo, hi);
  }

  static fromBigInt(number) {
    if (typeof number !== "bigint") {
      throw "ERROR. Invalid input";
    }

    const lo = number & ULong.MASK_N;
    const hi = ((number - lo) / ULong.MODULO_N) & ULong.MASK_N;
    return new ULong(Number(lo), Number(hi));
  }

  static fromString(value) {
    if (typeof number !== "string") {
      throw "ERROR. Invalid input";
    }

    return ULong.fromBigInt(BigInt(value));
  }

  //#endregion

  constructor(lo, hi) {
    this.type = "U64";
    this.lo = (lo || 0) & ULong.MASK;
    this.hi = (hi || 0) & ULong.MASK;
  }

  //#region Converters

  toBigInt() {
    return BigInt(this.lo) + BigInt(this.hi) * ULong.MODULO_N;
  }

  toString() {
    return this.toBigInt().toString();
  }

  //#endregion

  add(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    let lo = this.lo + value.lo;
    let hi = this.hi + value.hi;

    if (lo > ULong.MASK) {
      hi += (lo - (lo & ULong.MASK)) / ULong.MODULO;
    }
    lo &= ULong.MASK;

    return new ULong(lo, hi);
  }

  sub(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    let hi = ~value.hi;
    let lo = ~value.lo;
    if (lo === -1) {
      lo = 0;
      hi += 1;
      hi |= 0;
    } else {
      lo += 1;
    }

    return this.add(new ULong(lo, hi));
  }

  and(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    const lo = this.lo & value.lo;
    const hi = this.hi & value.hi;

    return new ULong(lo, hi);
  }

  mul(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    console.warn("THIS WASN'T TESTED YET");

    if (value.eq(ULong.ZERO)) {
      return ULong.ZERO;
    }

    let result = this;
    let previous = ULong.ZERO;

    while (value.gt(ULong.ONE)) {
      if (value.lo & 1) {
        // ODD ?
        result = result.add(previous);
        previous = result;
        value = value.sub(ULong.ONE);
      } else {
        value = value.shr(1);
        result.shl(1);
      }
    }
    return result.add(previous);
  }

  shl(value) {
    if (typeof value !== "number") {
      throw "ERROR. Invalid input";
    }
    if (value < 0) {
      throw "Invalid value";
    }

    let result = this;

    if (value >= ULong.BITS) {
      result = new ULong(0, this.lo);
      value -= ULong.BITS;
      if (value >= ULong.BITS) {
        return ULong.ZERO;
      }
    }

    if (!value) {
      return result;
    }

    let offset = result.lo >>> (ULong.BITS - value);
    let lo = (result.lo << value) & ULong.MASK;
    let hi = ((result.hi << value) & ULong.MASK) | offset;

    return new ULong(lo, hi);
  }

  shr(value) {
    if (typeof value !== "number") {
      throw "ERROR. Invalid input";
    }
    if (value < 0) {
      throw "Invalid value";
    }

    console.warn("THIS WASN'T TESTED YET");

    let result = this;

    if (value >= ULong.BITS) {
      result = new ULong(this.hi, 0);
      value -= ULong.BITS;
      if (value >= ULong.BITS) {
        return ULong.ZERO;
      }
    }

    if (!value) {
      return this;
    }

    let offset = (((1 << value) - 1) & result.hi) << (ULong.BITS - value);
    let hi = (this.hi >>> value) & ULong.MASK;
    let lo = ((this.lo >>> value) | offset) & ULong.MASK;

    return new ULong(lo, hi);
  }

  eq(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    return value.lo == this.lo && value.hi == this.hi;
  }

  gt(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }
    if (this.hi > value.hi) {
      return true;
    }
    if (this.hi < value.hi) {
      return false;
    }
    return this.lo > value.lo;
  }

  gte(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }
    if (this.hi > value.hi) {
      return true;
    }
    if (this.hi < value.hi) {
      return false;
    }
    return this.lo >= value.lo;
  }

  lt(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    if (this.hi < value.hi) {
      return true;
    }
    if (this.hi > value.hi) {
      return false;
    }
    return this.lo < value.lo;
  }

  lte(value) {
    if (value.lo === undefined || value.hi === undefined) {
      throw "ERROR. Invalid input";
    }

    if (this.hi < value.hi) {
      return true;
    }
    if (this.hi > value.hi) {
      return false;
    }
    return this.lo <= value.lo;
  }
}

module.exports = ULong;
