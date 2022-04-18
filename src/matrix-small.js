const Tracer = require('./tracer');

class Matrix
{
    constructor(rows, columns)
    {
        this.array  = Matrix.empty(rows, columns);
        this.rows   = rows;
        this.columns= columns;
    }

    static empty(rows, columns)
    {
        const array = new Array(rows);
        for(let i = 0; i < rows; i++)
        {
            array[i] = new Int32Array(columns);
        }
        return array;
    }

    static fromRecurrence(factors)
    {
        const matrix = new Matrix(factors.length, factors.length);

        matrix.array[0] = [...factors].reverse().map(a => Number(a)); 

        for(let i = 1; i < factors.length; i++)
            matrix.set(i, i-1, 1);
            
        return matrix;
    }

    static fromRecurrenceWithSum(factors)
    {
        const l = factors.length;
        const matrix = new Matrix(l+1, l+1);

        matrix.array[0] = new Int32Array([0, ...factors].reverse().map(a => Number(a))); 

        for(let i = 1; i < factors.length; i++) {
            matrix.set(i, i-1, 1);
        }

        matrix.array[l] = new Int32Array([1, ...factors].reverse().map(a => Number(a))); 
        return matrix;
    }

    get(row, column) 
    {
        if (row < 0 || row >= this.rows || column < 0 || column >= this.columns)
            throw "Argument out of range";

        return this.array[row][column];
    }

    set(row, column, value) 
    {
        if (row < 0 || row >= this.rows || column < 0 || column >= this.columns)
            throw "Argument out of range";

        this.array[row][column] = Number(value);
    }

    multiply(right, modulo, trace) 
    {
        const result = new Matrix(this.rows, right.columns);
        let modMul, modSum, fixSum;
        
        if (modulo)
        {
            const modulo_n = BigInt(modulo);
            
            modMul = (a, b) => {
                let v = a*b;
                if (v > Number.MAX_SAFE_INTEGER)
                    return Number((BigInt(a)*BigInt(b)) % modulo_n);
                else
                    return v % modulo;
            }

            modSum = (a, b) => (a+b) % modulo;
            fixSum = a => { 
                while (a < 0)
                    a += modulo;
                return a;
            }
        }
        else
        {
            modMul = (a, b) => a*b;
            modSum = (a, b) => a+b;
            fixSum = a => a;
        }

        const tracer = new Tracer(trace);

        for (let i = 0; i < this.rows; i++) 
        {
            tracer.print(_ => this.rows - i);

            const ar = this.array[i];
            const tr = result.array[i];

            for (let j = 0; j < right.columns; j++) 
            {
                let sum = 0;
                for (let y = 0; y < this.columns; y++) 
                {
                    sum = modSum(sum, modMul(ar[y], right.array[y][j]));
                }

                tr[j] = fixSum(sum);
            }
        }

        tracer.clear();

        return result;
    }

    pow(pow, modulo, trace)
    {        
        pow = BigInt(pow);
        if (pow === 1n)
            return this;

        let m  = this;
        let mm = undefined;

        const tracer = new Tracer(trace);

        while (pow > 1n)
        {
            tracer.print(_ => pow);

            if ((pow & 1n) !== 0n)
            {
                if (mm === undefined)
                    mm = m;
                else
                    mm = mm.multiply(m, modulo, trace);

                pow--;
            }

            while (pow > 1n && (pow & 1n) === 0n)
            {
                pow /= 2n;
                m =  m.multiply(m, modulo, trace);
            }
        }

        if (mm !== undefined)
        {
            m = m.multiply(mm, modulo, trace);
        }

        tracer.clear();
        return m;
    }
}

module.exports = Matrix;