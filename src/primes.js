module.exports = function (start) {
  const isNumberPrime = require("is-number-prime");

  function* primes(start) {
    if (start === undefined) start = 0;

    if (start < 2) {
      start = 3;
      yield 2;
      yield 3;
    } else if (start < 3) {
      start = 3;
      yield 3;
    }

    let v = start;
    while (true) {
      v += 2;
      if (isNumberPrime(v)) yield v;
    }
  }

  return primes(start);
};
