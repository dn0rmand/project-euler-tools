module.exports = function fibonacci(n, modulo) {
  const needBigTest = (modulo - 1) * (modulo - 1) > Number.MAX_SAFE_INTEGER;

  const mulFast = (p1, p2) => (p1 * p2) % modulo;
  const mulSlow = (p1, p2) => {
    let p = p1 * p2;
    if (p > Number.MAX_SAFE_INTEGER)
      return Number((BigInt(p1) * BigInt(p2)) % BigInt(modulo));
    else return p % modulo;
  };

  const mul = needBigTest ? mulSlow : mulFast;

  const modMultiply = (m1, m2) => [
    (mul(m1[0], m2[0]) + mul(m1[1], m2[2])) % modulo,
    (mul(m1[0], m2[1]) + mul(m1[1], m2[3])) % modulo,
    (mul(m1[2], m2[0]) + mul(m1[3], m2[2])) % modulo,
    (mul(m1[2], m2[1]) + mul(m1[3], m2[3])) % modulo,
  ];

  const plainMultiply = (m1, m2) => [
    m1[0] * m2[0] + m1[1] * m2[2],
    m1[0] * m2[1] + m1[1] * m2[3],
    m1[2] * m2[0] + m1[3] * m2[2],
    m1[2] * m2[1] + m1[3] * m2[3],
  ];

  const multiply = modulo ? modMultiply : plainMultiply;

  const power = (m, pow) => {
    let mm = undefined;

    if (pow === 1) return m;

    while (pow > 1) {
      if ((pow & 1) !== 0) {
        if (mm === undefined) mm = m;
        else mm = multiply(mm, m);

        pow--;
      }

      while (pow > 1 && (pow & 1) === 0) {
        pow /= 2;
        m = multiply(m, m);
      }
    }

    if (mm !== undefined) {
      m = multiply(m, mm);
    }

    return m;
  };

  const matrix = [1, 1, 1, 0];
  const m = power(matrix, n);

  if (!modulo) {
    if (m[0] > Number.MAX_SAFE_INTEGER || m[1] > Number.MAX_SAFE_INTEGER)
      throw "OVERFLOW";
  }

  return { f0: m[1], f1: m[0] };
};
