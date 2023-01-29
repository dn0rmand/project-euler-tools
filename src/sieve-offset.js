module.exports = function (start, end) {
  const BitArray = require("./bitArray");

  function* iterator() {
    if ((start & 1) !== 0) throw "Start has to be even";

    let size = end - start;
    let root = Math.floor(Math.sqrt(end)) + 1;

    if (root >= start) throw "WHAT!";

    let sieve = BitArray(root);
    let primes = BitArray(size);

    for (let p = 3; p < root; p += 2) {
      if (!sieve.get(p)) {
        for (let i = p * 2; i < root; i += p) sieve.set(i, 1);

        let d = p - (start % p);
        if (d === p) d = 0;
        while (d < size) {
          primes.set(d, 1);
          d += p;
        }
      }
    }

    for (let p = 1; p < size; p += 2) {
      if (!primes.get(p)) {
        if (start + p === 299209) continue;
        yield start + p;
      }
    }
  }

  return iterator();
};
