const isNumberPrime = require("is-number-prime");
const knownPrimes = [2, 3, 5, 7, 11, 13, 17, 19];

module.exports = function isPrime(value) {
  if (value <= 20) {
    return knownPrimes.includes(value);
  } else {
    return isNumberPrime(value);
  }
};
