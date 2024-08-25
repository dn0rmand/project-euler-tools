// Same as PreciseNumber, but just a wrapper to regular numbers.

class FakePreciseNumber {
    static allowSimplification = true;
    static setUseBigInt() {}

    static Zero = FakePreciseNumber.create(0, 1);
    static One = FakePreciseNumber.create(1, 1);
    static Infinity = FakePreciseNumber.create(Number.Infinity, 1);

    constructor(value) {
        this.value = value;
    }

    static create(numerator, divisor) {
        return new FakePreciseNumber(numerator / divisor);
    }

    plus(other) {
        return new FakePreciseNumber(this.value + other.valueOf());
    }

    minus(other) {
        return new FakePreciseNumber(this.value - other.valueOf());
    }

    times(other) {
        return new FakePreciseNumber(this.value * other.valueOf());
    }

    divide(other) {
        return new FakePreciseNumber(this.value / other.valueOf());
    }

    reverse() {
        return new FakePreciseNumber(1 / this.value);
    }

    equals(other) {
        return this.value === other.valueOf();
    }

    less(other) {
        return this.value < other.valueOf();
    }

    greater(other) {
        return this.value > other.valueOf();
    }

    pow(value) {
        return new FakePreciseNumber(Math.pow(this.value, other.valueOf()));
    }

    get isInfinity() {
        return Number.isInfinity(this.value);
    }

    valueOf() {
        return this.value;
    }
}
