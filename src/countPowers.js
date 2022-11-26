function countPowers(prime, max) {
  max = BigInt(max);
  prime = BigInt(prime);

  let p1 = prime;
  let total = 0n;
  while (p1 <= max) {
    total += max / p1;
    p1 *= prime;
  }

  return Number(total);
}

module.exports = countPowers;
