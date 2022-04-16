"use strict"

module.exports = function(value, base)
{
    let digits = [];

    if (value == 0)
        return [0];

    if (typeof(value) == "bigint")
    {
        if (base === undefined)
            base = 10n;
        else
            base = BigInt(base);
    
        while (value > 0)
        {
            let d = value % base;
            value = (value-d) / base;
            digits.push(Number(d));
        }
    }
    else
    {
        if (value == 0)
            return [0];

        if (base === undefined)
            base = 10;

        while (value > 0)
        {
            let d = value % base;
            value = (value-d) / base;
            digits.push(d);
        }
    }

    digits = digits.reverse();
    return digits;
}
