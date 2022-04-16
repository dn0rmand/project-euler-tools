const $C = [];

function binomial(n, p) {
    const bigint = typeof (n) === 'bigint';

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