/**********************************************************************/
/*   S(N) = N(N+1)/2                                                  */
/*          - sum[2,sqrt(N)]{S(floor(N/m))}                           */
/*          - sum[d=1,sqrt(N)] { (floor(N/d) - floor(N/(d+1))) S(d) } */
/**********************************************************************/

const $sumPHI = [0, 1];
const floor = Math.floor;

function sumPHI(n, modulo) {
  let total = $sumPHI[n];
  if (total !== undefined) {
    return total;
  }

  if (n & 1) {
    total = ((n + 1) / 2).modMul(n, modulo);
  } else {
    total = (n / 2).modMul(n + 1, modulo);
  }

  const root = floor(Math.sqrt(n));
  if (root) {
    total = (total + modulo - (n - floor(n / 2))) % modulo;
  }

  for (let d = 2; d <= root; d++) {
    let minus = sumPHI(floor(n / d), modulo);
    const nd = floor(n / d);
    if (nd !== d) {
      const k = nd - floor(n / (d + 1));
      if (k) {
        minus = (minus + k.modMul(sumPHI(d, modulo), modulo)) % modulo;
      }
    }
    total = (total + modulo - minus) % modulo;
  }

  $sumPHI[n] = total;
  return total;
}

function totientSum(n, modulo) {
  if (!modulo) {
    throw "Argument modulo missing";
  }

  if (!n || n < 1) {
    throw "Error";
  }

  return sumPHI(n, modulo);
}

module.exports = totientSum;
