const isNumberPrime = require('is-number-prime');

module.exports = function isPrime(value)
{
    if ([2, 3, 5, 7, 11, 13, 17, 19].includes(value)) {
        return true;
    } else if (value <= 20) {
        return false;
    } else {
        return isNumberPrime(value);
    }
}
