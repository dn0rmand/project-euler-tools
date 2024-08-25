const Tracer = require('./tracer');

//`https://bonetblai.github.io/reports/AAAI08-ws10-ranking.pdf `;

function rank(values, MODULO, trace) {
    const n = values.length;
    const k = Math.ceil(Math.log2(n));
    const T = new Uint32Array(2 ** (k + 1));

    if (MODULO) {
        MODULO = BigInt(MODULO);
    }

    const k2 = 2 ** k;

    let rank = 0n;

    const tracer = new Tracer(trace);
    for (let i = 0; i < n; i++) {
        tracer.print(() => n - i);

        let digit = values[i] - 1;
        let node = k2 + digit;
        for (let j = 1; j <= k; j++) {
            if (node & 1) {
                digit -= T[node - 1];
            }

            T[node]++;
            node >>= 1;
        }

        T[node]++;

        rank = rank * BigInt(n - i) + BigInt(digit);
        if (MODULO) {
            rank %= MODULO;
        }
    }
    tracer.clear();
    return rank;
}

function unrank(rankValue, n) {
    const k = Math.ceil(Math.log2(n));

    // build factorial digits
    const d = new Uint32Array(n);

    d[n - 1] = 0;
    for (let i_n = 2n, i = 2; i <= n; i++, i_n++) {
        let v = rankValue % i_n;
        rankValue = (rankValue - v) / i_n;

        d[n - i] = Number(v);
    }

    // initialize T

    const T = new Uint32Array(2 ** (k + 1));

    for (let i = 0; i <= k; i++) {
        const v = 2 ** (k - i);
        const i2 = 2 ** i;
        for (let j = 1; j <= i2; j++) {
            T[i2 + j - 1] = v;
        }
    }

    // do the work

    const k2 = 2 ** k;
    const values = new Uint32Array(n);

    for (let i = 0; i < n; i++) {
        let digit = d[i];
        let node = 1;
        for (j = 1; j <= k; j++) {
            T[node]--;
            node <<= 1;
            if (digit >= T[node]) {
                digit -= T[node];
                node++;
            }
        }
        T[node] = 0;
        values[i] = node - k2 + 1;
    }

    return values;
}

module.exports = { rank, unrank };
