const bigIntHelper = function()
{
    BigInt.ONE  = BigInt(1);
    BigInt.ZERO = BigInt(0);

    BigInt.prototype.toExponential = function(maxDigits)
    {
        let value = this;
        maxDigits = maxDigits || 12;
        
        let sign = value < 0n ? '-' : '';
        value = value < 0n ? -value : value;

        const digits = [];
        let power  = 0;

        while (value > 10n)
        {
            let d = value % 10n;
            digits.unshift(d);
            value = (value - d) / 10n;
            power++;
            if (digits.length > maxDigits+1)
            {
                digits.length = maxDigits+1;
            }
        }
        
        if (digits.length > maxDigits)
        {
            let l = maxDigits;
            if (digits[l--] >= 5n)
            {            
                digits[l+1] = 10n;
                while (l >= 0 && digits[l+1] > 9n)
                {
                    digits[l+1] = 0n;
                    digits[l--]++;
                }
                if (digits[0] > 9n)
                {
                    digits[0] = 0n;
                    value++;
                    if (value > 9n)
                    {
                        digits.unshift(0n);
                        value /= 10n;
                        power++;
                    }
                }
            }
            digits.length = maxDigits;
        }

        s = `${sign}${value}.${digits.join('')}e${power}`;

        return s;
    }

    BigInt.prototype.sqrt = function() 
    {
        const value = this.valueOf();

        let s = BigInt(Math.floor(Math.sqrt(Number(value))));
        
        if (value > Number.MAX_SAFE_INTEGER) {
            s++;
            while (s*s <= value) {
                s++;
            }
    
            return s - 1n;
        } else {
            return s;
        }
    }

    BigInt.prototype.gcd = function(b)
    {
        let a = this;
        if (a < b)
            [a, b] = [b, a];
                    
        while (b != BigInt.ZERO)
        {
            let c = a % b;
            a = b;
            b = c;
        }
        return a;
    }

    const firstPrimes = [3n, 5n, 7n, 11n, 13n];
    
    Number.prototype.isCoPrime = function(b)
    {
        let a = this.valueOf();
        if ((a & 1n) === 0n && (b & 1n) === 0n) { return false; }
        
        if (a >= 13n && b >= 13n) {
            for (const prime of firstPrimes) {
                if (a % prime === 0n && b % prime === 0n) { 
                    return false; 
                }
            }
        }

        return this.gcd(b) === 1n;
    }

    BigInt.prototype.lcm = function(b)
    {
        let a = this;
        if (a < 0)
            a = -a;
        if (b < 0)
            b = -b;

        let g = a.gcd(b);
        let l = (a / g) * b;

        return l;
    }

    BigInt.prototype.divise = function(divisor, precision)
    {
        const g = this.gcd(divisor);
        
        let value = this / g;

        divisor /= g;
    
        const coef = 10 ** precision;
        const p1   = value % divisor;
        const a    = (value - p1) / divisor;
        const p2   = (p1 * BigInt(coef));
        const b    = (p2 - (p2 % divisor)) / divisor;
    
        return Number(a) + (Number(b) / coef);
    }

    BigInt.prototype.modMul = function(value, mod)
    {
        return (this * BigInt(value)) % BigInt(mod);
    }

    BigInt.prototype.modPow = function(exp, mod)
    {
        if (mod == 0)
            throw new Error("Cannot take modPow with modulus 0");

        let value = this;

        exp = BigInt(exp);
        mod = BigInt(mod);

        let r     = BigInt.ONE;
        let base  = value % mod;

        if (base == BigInt.ZERO)
            return BigInt.ZERO;

        while (exp > BigInt.ZERO)
        {
            if ((exp & BigInt.ONE) == BigInt.ONE)
                r = (r * base) % mod;
            exp  = exp >> BigInt.ONE;
            if (exp) {
                base = (base * base) % mod;
            }
        }

        return r;
    };

    BigInt.prototype.modInv = function(n)
    {
        if (typeof(n) !== 'bigint')
            n = BigInt(n);

        let t    = BigInt.ZERO;
        let newT = BigInt.ONE;
        let r    = n;
        let newR = this;
        let q, lastT, lastR;

        if (newR < BigInt.ZERO)
            newR = -newR;

        while (newR != BigInt.ZERO)
        {
            q = r / newR;
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT - q * newT;
            newR = lastR - q * newR;
        }
        if (r != BigInt.ONE)
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");

        if (t < BigInt.ZERO)
            t += n;

        if (n < BigInt.ZERO)
            return -t;
        return t;
    };

    BigInt.prototype.modDiv = function(divisor, mod)
    {
        if (divisor == 0)
            throw "Cannot divide by zero";
        if (mod == 0)
            throw "Cannot take modDiv with modulus zero";

        if (typeof(divisor) !== 'bigint')
            divisor = BigInt(divisor);

        if (typeof(mod) !== 'bigint')
            mod = BigInt(mod);

        divisor = divisor.modInv(mod);

        let result = (this * divisor) % mod;

        return result;
    };

    return BigInt;
}

module.exports = bigIntHelper();