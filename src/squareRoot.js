module.exports = function (S) {
  return digits(S);

  function* digits() {
    let N = Math.sqrt(S);
    let A = Math.floor(N);

    if (A === N) {
      return;
    }

    let m0 = 0;
    let d0 = 1;
    let a0 = A;

    while (true) {
      let m1 = d0 * a0 - m0;
      let d1 = (S - m1 * m1) / d0;
      let a1 = Math.floor((A + m1) / d1);

      m0 = m1;
      d0 = d1;
      a0 = a1;

      yield a1;
    }
  }
};
