require('./src/bigintHelper');
require('./src/numberHelper');

const tools = {
    announce: require("./src/announce"),
    BerlekampMassey: require('./src/Berlekamp-Massey'),
    BigMap: require('./src/BigMap'),
    BigSet: require('./src/BigSet'),
    binomial: require('./src/binomial'),
    BitArray: require('./src/bitArray'),
    digits: require('./src/digits'),
    DistinctCollection: require('./src/distinctCollection'),
    divisors: require("./src/divisors"),
    divisorsCount: require("./src/divisorsCount"),
    fibonacci: require('./src/fibonacci'),        
    fractions: require("./src/fractions"),
    isPrime: require("./src/isPrime"),
    linearRecurrence: require('./src/linearRecurrence'),
    millerRabin: require('./src/millerRabin'),
    noThreading: require('./src/noThreading'),
    permutationRanking: require('./src/permutationRanking'),
    polynomial: require('./src/polynomial'),
    PreciseNumber: require('./src/preciseNumber'),
    primeHelper: require("./src/primeHelper"),
    primes: require("./src/primes"),
    FactorizationSieve: require('./src/sieve_n2_plus_one'),
    sieveOffset: require('./src/sieve-offset'),
    squareRoot: require("./src/squareRoot"),
    threading: require('./src/threading'),
    TimeLogger: require('./src/timeLogger'),
    totient: require("./src/totient"),
    Tracer: require('./src/tracer'),
    ULong: require('./src/ulong'),
    sudoku: {
        cell: require("./src/sudoku/cell"),
        grid: require("./src/sudoku/grid"),
        solver: require("./src/sudoku/solver")
    }
};

module.exports = tools;

const v = 123456781234n;
console.log(v.toExponential(5));