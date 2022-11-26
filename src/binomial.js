const $C = [];

function modBinomial(n, p, modulo) {
  if (p === 0n) {
    return 1;
  } else if (p === 1n) {
    return Number(n % modulo);
  }

  if (n < modulo && p < modulo) {
    let top = 1n;
    let bottom = 1n;
    for (let i = 2n; i <= n; i++) {
      top = (top * i) % modulo;
    }
    for (let i = 2n; i <= p; i++) {
      bottom = (bottom * i) % modulo;
    }
    for (let i = 2n; i <= n - p; i++) {
      bottom = (bottom * i) % modulo;
    }
    return Number(top.modDiv(bottom, modulo));
  } else {
    const n2 = n / modulo;
    const p2 = p / modulo;

    return modBinomial(n2, p2, modulo).modMul(
      modBinomial(n % modulo, p % modulo, modulo),
      Number(modulo)
    );
  }
}

function binomial(n, p, modulo) {
  if (modulo !== undefined) {
    return modBinomial(BigInt(n), BigInt(p), BigInt(modulo));
  }
  const bigint = typeof n === "bigint";

  const ZERO = bigint ? 0n : 0;
  const ONE = bigint ? 1n : 1;
  const TWO = bigint ? 2n : 2;

  if (n < p) {
    return ZERO;
  }

  if (p === ZERO || p === n) {
    return ONE;
  }
  if (p === ONE || p === n) {
    return n;
  }

  if (p > n / TWO) {
    p = n - p;
  }

  if ($C[n] && $C[n][p]) {
    return $C[n][p];
  }

  let result = n;

  for (let p2 = ONE; p2 < p; p2++) {
    result *= n - p2;
    result /= p2 + ONE;
  }

  if (!$C[n]) {
    $C[n] = [];
  }

  $C[n][p] = result;

  return result;
}

module.exports = binomial;
