module.exports = function(value)
{
    const isNumberPrime = require('is-number-prime');

    let count = 2;

    if (isNumberPrime(value))
        return count;

    let max   =  Math.floor(Math.sqrt(value));
    let start = 2;
    let steps = 1;
    if (value & 1 !== 0)
    {
        start = 3;
        steps = 2;
    }
    for(let i = start; i <= max; i += steps)
    {
        if ((value % i) == 0)
        {
            count++;
            let res = value / i;
            if (res != i)
                count++;
        }
    }
    return count;
}
