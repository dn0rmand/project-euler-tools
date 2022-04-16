const assert = require('assert');
const Tracer = require('./tracer');

require('./bigintHelper');

module.exports = function(data, minSize, trace, modulo) 
{
    modulo = modulo ? BigInt(modulo) : modulo;

    const ABS      = a => a > 0 ? a : -a;
    const MAX      = (a, b) => a > b ? a : b;

    function solveRecurrence(data, size)
    {
        function validate(factors, divisor)
        {
            const c = factors.length;
            
            let values = data.slice(0, c);
            for(let i = values.length; i < data.length; i++)
            {
                try
                {
                    values = calculateNext(values, factors, divisor);
                    if (modulo) {
                        if (values[c-1] % modulo !== data[i] % modulo) {
                            return false;
                        }
                    } else if (values[c-1] !== data[i]) {
                        return false;
                    }
                }
                catch(e)
                {
                    return false;
                }
            }    
            return true;
        }

        function simplify(values)
        {
            assert.equal(values.length > 1, true);

            let first = 0;

            for(let i = 0; i < values.length; i++)
            {
                if (values[i] != 0n)
                {
                    first = i;
                    if (values[i] < 0n)
                    {
                        for(let j = i; j < values.length; j++)
                            values[j] = values[j] * -1n;
                    }
                    break;
                }
            }
            
            if (first === values.length-1)
                return values;

            let g = ABS(values[first]).gcd(ABS(values[first+1])); 
            if (g == 1n)
                return values;

            if (g == 0n)
                g = MAX(ABS(values[first]), ABS(values[first+1]));

            for(let i = first+2; i < values.length; i++)
            {
                let g2 = g.gcd(ABS(values[i]));
                if (g2 == 1n)
                    return values;

                if (g2 == 0n)
                    g = MAX(g, ABS(values[i]));
                else
                    g = g2;
            }

            if (g > 1n)
            {
                for(let i = first; i < values.length; i++)
                {
                    values[i] /= g;
                    if (values[i] == 0)
                        values[i] = 0n;
                }
            }

            return values;
        }

        function buildMatrix()
        {
            const matrix = [];

            for(let offset = 0; offset < size; offset++)
            {
                const row = [];

                for(let r = 0; r <= size; r++)
                {
                    const i = offset+r;
                    if (i >= data.length)
                        throw "Not enough data";

                    row.push(data[i]);
                }

                matrix.push(simplify(row));
            }

            return matrix;
        }

        const matrix = buildMatrix();

        // Going down

        for(let y = 1; y < size; y++)
        {
            let s = matrix[y-1];
            let k = s[y-1];

            for(let r = y; r < size; r++)
            {
                let d = matrix[r];
                let w = d[y-1];

                for(let x = 0; x <= size; x++)
                {
                    let a = w * s[x];
                    d[x] = (d[x] * k) - a;
                }
                matrix[r] = simplify(d);
            }
        }

        // going up

        for(let y = size-1; y > 0; y--)
        {
            let s = matrix[y];
            let k = s[y];

            for(let r = y-1; r >= 0; r--)
            {
                let d = matrix[r];
                let w = d[y];

                for(let x = 0; x <= size; x++)
                {
                    let a = w * s[x];
                    d[x] = (d[x] * k) - a;
                }
                matrix[r] = simplify(d);
            }
        }

        let l = matrix[0][0];
        if (l == 0)
            return { factors: undefined, divisor: undefined };
            
        for(let i = 1; i < size; i++)
        {
            let v = matrix[i][i];

            if (v === 0n)
                return { factors: undefined, divisor: undefined };

            l = l.lcm(v);
        }

        let values = [];
        let divisor = l;

        for(let i = 0; i < size; i++)
        {
            if (matrix[i][i] !== divisor)
            {
                assert.equal(divisor % matrix[i][i], 0n);
                let k = divisor / matrix[i][i];

                for(let j = 0; j < matrix[i].length; j++)
                    matrix[i][j] *= k;
            }
            
            if (matrix[i][i] !== divisor)
                return { factors: undefined, divisor: undefined };

            values.push(matrix[i][size]);
        }

        if (divisor === undefined)
            divisor = 1n;

        // verify

        if (validate(values, divisor))
            return { factors: values, divisor };
        else
            return { factors: undefined, divisor: undefined };
    }

    function findSize(a)
    {
        let a1 = new Array(a.length + 2).fill(1n);
        let a2 = a;
        for (let depth = 1; a2.length >= 3; depth++) {
          const a3 = [];
          for (let i = 1; i < a2.length - 1; i++) {
            a3.push((a2[i] * a2[i] - a2[i + 1] * a2[i - 1]) / a1[i + 1]);
          }
          [a1, a2] = [a2, a3];
          let zeros = true;
          for (let i = 0; i < a2.length; i++) {
            if (a2[i]) {
              zeros = false;
              break;
            }
          }
          if (zeros) return depth;
        }
        return 0;
    }

    function findRecurrence(data, minSize, trace)
    {
        const tracer = new Tracer(1, trace);
        if (minSize === true) {
            try {
                minSize = findSize(data);
                if (minSize === 0) {
                    throw "No recurrence";
                }
            } catch {
                minSize = 2;
            }
        } else if (!minSize || minSize < 2) {
            minSize = 2;
        }

        // Math.min(minSize || 2);
        try {
            for(let size = minSize; ; size++)
            {
                tracer.print(_ => size);
                let { factors, divisor } = solveRecurrence(data, size);
                if (factors) {
                    return { factors, divisor };
                }
            }
        } finally {
            tracer.clear();
        }
    }

    function calculateNext(values, factors, divisor, modulo)
    {
        assert.equal(values.length >= factors.length, true);
        
        let value = 0n;
        let res   = [];
        let modDiv;

        if (modulo && divisor !== 1n)
            modDiv = divisor.modInv(modulo);

        for(let i = 0; i < factors.length; i++)
        {
            let v = values[i];
            if (i > 0)
                res.push(v);

            if (modulo)
                value += v.modMul(factors[i], modulo);
            else
                value += v * factors[i];
        }

        if (modulo)
        {
            if (modDiv)
                value = value.modMul(modDiv, modulo);

            while (value < 0)
                value += modulo;

            res.push(value % modulo);
        }
        else
        {
            assert.equal(value % divisor, 0);

            res.push(value / divisor);
        }
        return res;
    }

    function get(n, values, factors, divisor, modulo)
    {    
        assert.equal(values.length >= factors.length, true);

        for(let y = factors.length; y < n; y++)
        {
            values = calculateNext(values, factors, divisor, modulo);
        }

        return values[factors.length-1];
    }

    const toBigInt = data => data.map(a => BigInt(a));
    const MODULO   = modulo => modulo ? BigInt(modulo) : undefined;

    function makeRecurrence(factors, divisor)
    {
        if (factors)
        {
            return {
                factors,
                divisor,
                next: (values, modulo) => calculateNext(toBigInt(values), factors, divisor, MODULO(modulo)),
                get: (n, values, modulo) => get(n, toBigInt(values), factors, divisor, MODULO(modulo)),
                create: (f, d) => makeRecurrence(f, d)
            }
        }
    }

    if (data && data.factors && data.divisor)
        return makeRecurrence(data.factors, data.divisor);
        
    const {factors, divisor}  = findRecurrence(toBigInt(data), minSize, trace);

    return makeRecurrence(factors, divisor);
}