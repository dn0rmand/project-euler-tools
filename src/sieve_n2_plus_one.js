class FactorizationSieve 
{
    constructor(bound)
    {
        this.emptyMap = new Map();
        this.factorization = undefined;
        this.sieve_n2_plus_one(bound);
    }

    get(n) { return this.factorization[n] || this.emptyMap; }

    set(n, p, e) 
    {
        if (e > 0) {
            this.factorization[n].set(p, e);
        }
    }

    sieve_n2_plus_one(bound)
    {
        const values = new Array(bound+1);
        this.factorization = new Array(bound+1);

        for(let n = 0; n <= bound; n++) {
            values[n] = n**2 + 1;
            this.factorization[n] = new Map();
        }

        for(let n = 0; n <= bound; n++) {
            if (values[n] === 1)
                continue;

            let p = values[n];
            for(let m = n; m <= bound; m += p) {
                let e = 0;
                while (values[m] % p === 0) {
                    values[m] = values[m] / p;
                    e++;
                }
                this.set(m, p, e);
            }

            for (let m = (p-n) % p; m <= bound; m += p) {
                let e = 0;
                while (values[m] % p === 0) {
                    values[m] = values[m] / p;
                    e++;
                }
                this.set(m, p, e);
            }
        }
    }
}

module.exports = FactorizationSieve;