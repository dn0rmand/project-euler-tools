const assert = require("assert");

class Matrix {
  constructor(rows, columns) {
    this.array = Matrix.empty(rows, columns);
    this.rows = rows;
    this.columns = columns;
  }

  static empty(rows, columns) {
    const array = new Array(rows);
    for (let i = 0; i < rows; i++) {
      array[i] = new Array(columns);
      array[i].fill(0n);
    }
    return array;
  }

  static fromRecurrence(factors) {
    const matrix = new Matrix(factors.length, factors.length);

    matrix.array[0] = [...factors].reverse().map((a) => BigInt(a));

    for (let i = 1; i < factors.length; i++) matrix.set(i, i - 1, 1n);

    return matrix;
  }

  static fromRecurrenceWithSum(factors) {
    const l = factors.length;
    const matrix = new Matrix(l + 1, l + 1);

    matrix.array[0] = [0, ...factors].reverse().map((a) => BigInt(a));

    for (let i = 1; i < factors.length; i++) {
      matrix.set(i, i - 1, 1n);
    }

    matrix.array[l] = [1, ...factors].reverse().map((a) => BigInt(a));
    return matrix;
  }

  get(row, column) {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns)
      throw "Argument out of range";

    return this.array[row][column];
  }

  set(row, column, value) {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns)
      throw "Argument out of range";

    this.array[row][column] = BigInt(value);
  }

  multiply(right, modulo) {
    if (modulo) modulo = BigInt(modulo);

    const result = new Matrix(this.rows, right.columns);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < right.columns; j++) {
        let sum = 0n;
        for (let y = 0; y < this.columns; y++) {
          sum += this.get(i, y) * right.get(y, j);
        }

        if (modulo) {
          sum %= modulo;
          while (sum < 0) sum += modulo;
        }

        result.set(i, j, sum);
      }
    }

    return result;
  }

  pow(pow, modulo) {
    if (pow == 1) return this;

    pow = BigInt(pow);

    let m = this;
    let mm = undefined;

    while (pow > 1n) {
      if ((pow & 1n) !== 0n) {
        if (mm === undefined) mm = m;
        else mm = mm.multiply(m, modulo);

        pow--;
      }

      while (pow > 1n && (pow & 1n) === 0n) {
        pow /= 2n;
        m = m.multiply(m, modulo);
      }
    }

    if (mm !== undefined) {
      m = m.multiply(mm, modulo);
    }

    return m;
  }
}

module.exports = Matrix;
