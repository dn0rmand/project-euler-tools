const primeHelper = require('./primeHelper');

module.exports = function (value, _obsolete, fn) {
  const minPrime = Math.floor(Math.sqrt(value) + 1);

  if (primeHelper.maxPrime() < minPrime) {
    primeHelper.reset();
    if (value < 5e7) {
      primeHelper.initialize(value);
    } else {
      primeHelper.initialize(minPrime);
    }
  }

  function forEachDivisors(callback) {
    const primes = [];
    primeHelper.factorize(value, (p, f) => {
      primes.push({ prime: p, power: f });
    });

    function inner(val, index) {
      if (val <= value) {
        callback(val);
      }

      for (let i = index; i < primes.length; i++) {
        const { prime, power } = primes[i];
        let v = val;
        for (let p = 1; p <= power; p++) {
          v *= prime;
          inner(v, i + 1);
        }
      }
    }

    inner(1, 0);
  }

  function getDivisors() {
    const divisors = [];
    forEachDivisors((val) => divisors.push(val));
    return divisors;
  }

  if (typeof fn === 'function') {
    forEachDivisors(fn);
  } else {
    return getDivisors();
  }
};
