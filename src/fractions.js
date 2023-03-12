module.exports = function (n) {
  const isNumberPrime = require("./isPrime");

  function* getFractions(value) {
    if (isNumberPrime(value)) {
      yield value;
      return;
    }

    let i = 2;

    while (value > 0) {
      const mod = value % i;
      if (mod === 0) {
        yield i;

        value /= i;

        if (isNumberPrime(value)) {
          yield value;
          break;
        }
      } else {
        i++;
      }
    }
  }

  return getFractions(n);
};
