require("./bigintHelper");

// Miller-Rabin-test
module.exports = function (p) {
  // IMPORTANT: requires mulmod(a, b, modulo) and powmod(base, exponent, modulo)

  // some code from             https://ronzii.wordpress.com/2012/03/04/miller-rabin-primality-test/
  // with optimizations from    http://ceur-ws.org/Vol-1326/020-Forisek.pdf
  // good bases can be found at http://miller-rabin.appspot.com/

  // trivial cases
  const bitmaskPrimes2to31 =
    (1 << 2) |
    (1 << 3) |
    (1 << 5) |
    (1 << 7) |
    (1 << 11) |
    (1 << 13) |
    (1 << 17) |
    (1 << 19) |
    (1 << 23) |
    (1 << 29); // = 0x208A28Ac
  if (p < 31) return (bitmaskPrimes2to31 & (1 << p)) != 0;

  if (
    p % 2 == 0 ||
    p % 3 == 0 ||
    p % 5 == 0 ||
    p % 7 == 0 || // divisible by a small prime
    p % 11 == 0 ||
    p % 13 == 0 ||
    p % 17 == 0
  )
    return false;

  if (p < 17 * 19)
    // we filtered all composite numbers < 17*19, all others below 17*19 must be prime
    return true;

  p = BigInt(p);

  // test p against those numbers ("witnesses")
  // good bases can be found at http://miller-rabin.appspot.com/
  const STOP = 0n;
  const TestAgainst1 = [377687n, STOP];
  const TestAgainst2 = [31n, 73n, STOP];
  const TestAgainst3 = [2n, 7n, 61n, STOP];
  // first three sequences are good up to 2^32
  const TestAgainst4 = [2n, 13n, 23n, 1662803n, STOP];
  const TestAgainst7 = [
    2n,
    325n,
    9375n,
    28178n,
    450775n,
    9780504n,
    1795265022n,
    STOP,
  ];

  // good up to 2^64
  let testAgainst = TestAgainst7;
  // use less tests if feasible
  if (p < 5329n) testAgainst = TestAgainst1;
  else if (p < 9080191n) testAgainst = TestAgainst2;
  else if (p < 4759123141n) testAgainst = TestAgainst3;
  else if (p < 1122004669633n) testAgainst = TestAgainst4;
  else testAgainst = TestAgainst7;

  // find p - 1 = d * 2^j
  let p1 = p - 1n;

  let d = p1 >> 1n;
  let shift = 0;

  while ((d & 1n) === 0n) {
    shift++;
    d >>= 1n;
  }

  // test p against all bases
  let index = 0;
  while (true) {
    let x = testAgainst[index++];
    if (x === STOP) break;

    x = x.modPow(d, p);
    // is test^d % p == 1 or -1 ?
    if (x === 1n || x === p1) continue;

    // now either prime or a strong pseudo-prime
    // check test^(d*2^r) for 0 <= r < shift
    let maybePrime = false;
    for (let r = 0; r < shift; r++) {
      // x = x^2 % p
      // (initial x was test^d)
      x = x.modPow(2, p);
      // x % p == 1 => not prime
      if (x === 1n) return false;

      // x % p == -1 => prime or an even stronger pseudo-prime
      if (x === p1) {
        // next iteration
        maybePrime = true;
        break;
      }
    }

    // not prime
    if (!maybePrime) return false;
  }

  // prime
  return true;
};
