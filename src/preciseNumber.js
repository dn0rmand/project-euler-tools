require('./bigintHelper');

class PreciseNumber
{
    static Infinity = PreciseNumber.create(Infinity, 1n);
    static Zero     = PreciseNumber.create(0n, 1n);
    static One      = PreciseNumber.create(1n, 1n);

    static allowSimplification = true;

    static create(numerator, divisor) 
    {
        const p = new PreciseNumber();
        if (numerator !== Infinity) {
            p.numerator = BigInt(numerator);
            p.divisor   = BigInt(divisor);
            p.simplify();
        } else {
            p.numerator = numerator;
            p.divisor   = 1n;
        }
        return p;
    }

    constructor(value)
    {
        if (value === undefined) {
            this.numerator = 0n;
            this.divisor = 1n;
        } else if (value === Infinity) {
            this.numerator = Infinity;
            this.divisor   = 1n;
        } else if (value instanceof PreciseNumber) {
            this.numerator = value.numerator;
            this.divisor   = value.divisor;
        } else if (typeof(value) === 'bigint') {
            this.divisor = 1n;
            this.numerator = value;
        } else {
            value = +value;
            if (isNaN(value)) {
                throw "Not a valid number";
            }
            this.divisor   = 1n;
            while (Math.floor(value) !== value) {
                this.divisor *= 10n;
                value *= 10;
            }
            this.numerator = BigInt(value);
            this.simplify();
        }
    }

    simplify()
    {
        if (!PreciseNumber.allowSimplification) {
            return;
        }

        if (this.divisor === 0n) {
            this.numerator = 0n;
            this.divisor   = 0n;
            return; 
        }
        if (this.numerator === 0n) {
            this.divisor   = 1n;
            this.numerator = 0n;
            return;
        } 
        if (this.divisor < 0n) {
            // It's better is the negative value is the numerator
            this.numerator = -this.numerator;
            this.divisor   = -this.divisor;
        }

        let g = this.numerator.gcd(this.divisor);
        if (g < 0) g = -g;
        if (g !== 1n) {
            this.numerator /= g;
            this.divisor   /= g;
        }
    }

    plus(other) 
    {
        if (! (other instanceof PreciseNumber)) {
            other = new PreciseNumber(other);
        }

        const state = new PreciseNumber();

        state.numerator = this.numerator * other.divisor + this.divisor * other.numerator;
        state.divisor   = this.divisor * other.divisor;
        
        state.simplify();
        return state;
    }

    minus(other) 
    {
        if (! (other instanceof PreciseNumber)) {
            other = new PreciseNumber(other);
        }
        const state = new PreciseNumber();

        state.numerator = this.numerator * other.divisor - this.divisor * other.numerator;
        state.divisor   = this.divisor * other.divisor;
        
        state.simplify();
        return state;
    }

    times(other)
    {
        if (! (other instanceof PreciseNumber)) {
            other = new PreciseNumber(other);
        }
        const state = new PreciseNumber();

        state.divisor   = this.divisor * other.divisor;
        state.numerator = this.numerator * other.numerator;

        state.simplify();
        return state;
    }

    divide(other)
    {
        if (! (other instanceof PreciseNumber)) {
            other = new PreciseNumber(other);
        }
        const state = new PreciseNumber();

        state.divisor   = this.divisor * other.numerator;
        state.numerator = this.numerator * other.divisor;

        state.simplify();
        return state;
    }

    get valid() 
    {
        return this.divisor !== 0n;
    }

    reverse() 
    {
        const r = new PreciseNumber();
        r.divisor = this.numerator;
        r.numerator = this.divisor;
        return r;    
    }

    equals(other) 
    {
        if (! (other instanceof PreciseNumber)) {
            other = new PreciseNumber(other);
        }
        return other.numerator === this.numerator && other.divisor === this.divisor;
    }

    pow(value) 
    {
        let v = PreciseNumber.One;

        for(let p = 1; p <= value; p++) {
            v = v.times(this);
        }

        return v;
    }

    less(other)
    {
        if (this.equals(other)) { return false; }

        const diff = this.minus(other);
        return (diff.numerator < 0);
    }

    greater(other)
    {
        if (this.equals(other)) { return false; }
        return new PreciseNumber(other).less(this);
    }

    toString() {
        return `${this.numerator}/${this.divisor}`;
    }

    get isInfinity()
    {
        return this.numerator === Infinity;
    }

    valueOf()
    {
        if (this.isInfinity && this.divisor === 0n) {
            return Infinity;
        }

        return this.numerator.divise(this.divisor, 10);
    }
}

module.exports = PreciseNumber;