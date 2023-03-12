module.exports = function (value, isNumberPrime, fn) {
  const $isNumberPrime = require("is-number-prime");

  function forEachDivisors(callback) {
    if (callback(1) === false) {
      return; // early stop
    }

    if (value > 1 && callback(value) === false) {
      return; // early stop
    }

    if (value <= 2 || isNumberPrime(value)) {
      return;
    }

    let max = Math.floor(Math.sqrt(value)) + 1;
    let start = 2;
    let steps = 1;
    if (value & (1 !== 0)) {
      start = 3;
      steps = 2;
    }
    for (let i = start; i < max; i += steps) {
      if (value % i == 0) {
        if (callback(i) === false) {
          return; // early stop
        }
        const res = value / i;
        if (res > i) {
          if (callback(res) === false) {
            return; // early stop
          }
        }
        if (res < max) {
          max = res;
        }
      }
    }
  }

  function* getDivisors() {
    yield 1;
    if (value > 1) {
      yield value;
    }

    if (value <= 2 || isNumberPrime(value)) {
      return;
    }

    let max = Math.floor(Math.sqrt(value)) + 1;
    let start = 2;
    let steps = 1;
    if (value & (1 !== 0)) {
      start = 3;
      steps = 2;
    }
    for (let i = start; i < max; i += steps) {
      if (value % i == 0) {
        yield i;

        let res = value / i;
        if (res > i) {
          yield res;
        }

        if (res < max) {
          max = res;
        }
      }
    }
  }

  if (isNumberPrime === undefined) {
    isNumberPrime = $isNumberPrime;
  }

  if (typeof fn === "function") {
    forEachDivisors(fn);
  } else {
    return getDivisors();
  }
};
