const BitArray = require('./bitArray');
const BigSet = require('./BigSet');
const { resetDB, getPrimeGroups, getPrimeCount, savePrimeCounts } = require('./primeDatabase');

let _primeMap = new BigSet();
let _primes = [];
let _extraPrimes = [];
let _maxPrime = 0;

function reset() {
  _primeMap = new BigSet();
  _primes = [];
  _maxPrime = 0;
  resetDB();
}

function sumPrimes(num) {
  let root = Math.floor(Math.sqrt(num)) + 1;
  let v = [];

  for (let i = 1; i <= root; i++) {
    v.push(Math.floor(num / i));
  }

  for (let i = v[v.length - 1] - 1; i >= 0; i--) {
    v.push(i);
  }

  let s = {};
  for (let i = 0; i < v.length; i++) {
    const vi = v[i];
    const VI = BigInt(vi);

    s[vi] = (VI * (VI + 1n)) / 2n - 1n;
  }

  for (let p = 2; p <= root; p++) {
    if (s[p] > s[p - 1]) {
      const sp = s[p - 1];
      const p2 = p * p;

      for (let i = 0; i < v.length; i++) {
        const vi = v[i];
        if (vi < p2) {
          break;
        }
        s[vi] -= BigInt(p) * (s[Math.floor(vi / p)] - sp);
      }
    }
  }
  return s[num];
}

function countPrimes(num, trace) {
  let count = getPrimeCount(num);
  if (count !== undefined) {
    return count;
  }

  console.log('\r\nNeed to calcule prime count :(');

  let r = Math.floor(Math.sqrt(num));
  let v = [];

  for (let i = 1; i <= r + 1; i++) {
    v.push(Math.floor(num / i));
  }

  for (let i = v[v.length - 1] - 1; i >= 0; i--) {
    v.push(i);
  }

  let s = {};

  for (let i = 0; i < v.length; i++) {
    let idx = v[i];
    s[idx] = idx - 1;
  }

  for (let p = 2; p <= r + 1; p++) {
    if (trace) {
      process.stdout.write(`\r${r + 1 - p}  `);
    }

    let sp = s[p - 1];
    if (s[p] > sp) {
      let p2 = p * p;
      for (let i = 0; i < v.length; i++) {
        let idx = v[i];
        if (idx < p2) {
          break;
        }
        s[idx] = s[idx] - (s[Math.floor(idx / p)] - sp);
      }
    }
  }

  return savePrimeCounts(s, num, trace);
}

function isKnownPrime(p) {
  if (_primeMap !== undefined && p <= _maxPrime) {
    return _primeMap.has(p);
  }

  return false;
}

function likelyPrime(n) {
  if (isKnownPrime(n)) {
    return true;
  }

  if (
    n % 2 === 0 ||
    n % 3 === 0 ||
    n % 5 === 0 ||
    n % 7 === 0 ||
    n % 11 === 0 ||
    n % 13 === 0 ||
    n % 17 === 0 ||
    n % 19 === 0 ||
    n % 23 === 0 ||
    n % 29 === 0 ||
    n % 31 === 0 ||
    n % 37 === 0 ||
    n % 41 === 0 ||
    n % 43 === 0
  ) {
    return false;
  }

  const picked = [];

  while (picked.length < 5) {
    const a = Math.floor(Math.random() * (n - 4)) + 2;
    if (picked.includes(a)) {
      continue;
    }

    picked.push(a);

    const v = a.modPow(n - 1, n);

    if (v !== 1) {
      return false;
    }
  }

  return true;
}

function isPrime(p) {
  if (_primeMap !== undefined) {
    if (_primeMap.has(p)) {
      return true;
    }
    if (p <= _maxPrime) {
      return false;
    }
  }
  if (p === 2 || p === 3 || p === 5 || p === 7 || p === 11) {
    return true;
  }

  if ((p & 1) === 0 || p % 3 === 0 || p % 5 === 0 || p % 7 === 0 || p % 11 === 0) {
    return false;
  }

  let root = Math.floor(Math.sqrt(p));

  for (let i of _primes) {
    if (i > root) {
      return true;
    }
    if (p % i === 0) {
      return false;
    }
  }

  for (let i of _extraPrimes) {
    if (i > root) {
      return true;
    }
    if (p % i === 0) {
      return false;
    }
  }

  if (root > _maxPrime) {
    let start = Math.floor((_maxPrime - 5) / 6);
    start = 5 + start * 6;

    for (let i = start; i <= root; i += 6) {
      if (p % i === 0 || p % (i + 2) === 0) {
        return false;
      }
    }
  }

  return true;
}

function factorize(n, callback) {
  if (n === 1) {
    return;
  }

  if (isKnownPrime(n)) {
    callback(n, 1);
    return;
  }

  let max = Math.floor(Math.sqrt(n)) + 1;

  for (let p of _primes) {
    if (p > n) {
      break;
    }
    if (p > max) {
      break;
    }

    if (n % p === 0) {
      let factor = 0;
      while (n % p === 0) {
        factor++;
        n /= p;
      }
      if (callback(p, factor) === false) {
        return; // Caller says to stop
      }
      if (n === 1 || isKnownPrime(n)) {
        break;
      }
    }
  }

  if (n !== 1) {
    callback(n, 1);
  }
}

function generateMorePrimes(count) {
  let newMax = _maxPrime + count;
  let n = newMax;

  let sieve = BitArray(count);
  let start;
  let maxPrime = _maxPrime;

  for (let p of _primes) {
    let start = maxPrime - (maxPrime % p);

    for (let i = start; ; i += p) {
      if (i < maxPrime) {
        continue;
      }

      if (i > n) {
        break;
      }

      sieve[i - maxPrime] = 1;
    }
  }

  start = maxPrime;
  if ((start & 1) === 0) {
    start++;
  }

  for (let i = start; i <= n; i += 2) {
    if (sieve[i - maxPrime] === 1) {
      continue;
    }

    sieve[i - maxPrime] = 1;
    _primes.push(i);
    if (_primeMap !== undefined) {
      _primeMap.add(i);
    }
    _maxPrime = i;

    for (let j = i + i; j <= n; j += i) {
      sieve[j - maxPrime] = 1;
    }
  }

  _maxPrime = newMax;
  return _maxPrime;
}

function generatePrimes(max) {
  if (_primeMap !== undefined) {
    _primeMap.add(2);
    _primeMap.add(3);
    _primeMap.add(5);
    _primeMap.add(7);
  }
  _primes.push(2);
  _primes.push(3);
  _primes.push(5);
  _primes.push(7);

  let n = max;
  let root = Math.floor(Math.sqrt(n));

  let sieve = BitArray(max + 1);

  for (let i = 2, j = 3, k = 5, l = 7; ; i += 2, j += 3, k += 5, l += 7) {
    if (i > n) {
      break;
    }
    sieve.set(i, 1);
    if (j <= n) {
      sieve.set(j, 1);
    }
    if (k <= n) {
      sieve.set(k, 1);
    }
    if (l <= n) {
      sieve.set(l, 1);
    }
  }

  for (let i = 11; i <= n; i += 2) {
    if (sieve.get(i)) {
      continue;
    }

    sieve.set(i, 1);
    _primes.push(i);
    if (_primeMap !== undefined) {
      _primeMap.add(i);
    }
    _maxPrime = i;
    if (i <= root) {
      for (let j = i + i; j <= n; j += i) {
        sieve.set(j, 1);
      }
    }
  }

  _maxPrime = max;
  return _maxPrime;
}

function next(p) {
  while (true) {
    p += 2;
    if (isPrime(p)) {
      _extraPrimes.push(p);
      return p;
    }
  }
}

function* primes(limitless) {
  let last = undefined;
  for (let p of _primes) {
    last = p;
    yield p;
  }
  if (limitless) {
    for (let p of _extraPrimes) {
      last = p;
      yield p;
    }

    if (last === undefined) {
      yield 2;
      yield 3;
      yield 5;
      yield 7;
      yield 11;
      last = 11;
    }
    while (true) {
      last += 2;
      if (isPrime(last)) {
        _extraPrimes.push(last);
        yield last;
      }
    }
  }
}

let $init = generatePrimes;

const primeHelper = {
  reset: (_) => reset(),
  maxPrime: (_) => _maxPrime,
  initialize: (max, noMap) => {
    if (noMap === true) {
      _primeMap = undefined;
    }
    let v = $init(max);
    $init = generateMorePrimes;
    return v;
  },
  lastPrime: (_) => _primes[_primes.length - 1],
  allPrimes: (_) => _primes,
  extraPrimes: (_) => _extraPrimes,
  primes: function* (limitless) {
    yield* primes(limitless);
  },
  isPrime: (value) => isPrime(value),
  likelyPrime: (value) => likelyPrime(value),
  isKnownPrime: (value) => isKnownPrime(value),
  next: (p) => next(p),
  countPrimes: (to, trace) => countPrimes(to, trace),
  sumPrimes: (to) => sumPrimes(to),
  getPrimeGroups: (start, callback) => getPrimeGroups(start, callback),
  factorize: (n, callback) => factorize(n, callback),
  mobius: (n) => {
    let result = 1;
    factorize(n, (prime, factor) => {
      if (factor > 1) {
        result = 0;
        return false; // Stop!
      }
      result = -result;
    });

    return result;
  },
  PHI: (n) => {
    if (n === 1) {
      return 1;
    }

    if (isPrime(n)) {
      return n - 1;
    }

    let pIter = primes(true);
    let p = pIter.next().value;
    let value = n;
    let phi = n;

    while (value > 1) {
      if (value % p === 0) {
        while (value % p === 0) {
          value = value / p;
        }

        phi *= (p - 1) / p;

        if (value === 1) {
          break;
        }

        if (isPrime(value)) {
          phi *= (value - 1) / value;
          break;
        }

        p = pIter.next().value;
      } else {
        p = pIter.next().value;
      }
    }

    return phi;
  },
};

module.exports = primeHelper;
