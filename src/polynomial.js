const assert = require("assert");

require("./bigIntHelper");

function gcd(v1, v2) {
  if (v1 < 0) {
    v1 = -v1;
  }
  if (v2 < 0) {
    v2 = -v2;
  }
  return v1.gcd(v2);
}

function factorial(value) {
  let f = 1n;

  for (let n = 2n; n <= value; n++) {
    f *= n;
  }

  return f;
}

function differences(values) {
  const result = [];
  for (let i = 1; i < values.length; i++) {
    let v = values[i] - values[i - 1];
    result.push(v);
  }
  return result;
}

function isConstant(values) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1]) {
      return false;
    }
  }

  return true;
}

function reduce(values, thresold) {
  let power = 0n;

  while (!isConstant(values)) {
    power++;
    values = differences(values);
  }

  if (values.length < thresold) {
    throw "No solution or not enough data";
  }

  return { power, constant: values[0] };
}

function* solve(values, divisor) {
  if (divisor === undefined) {
    divisor = 1n;
  }

  let { power, constant } = reduce(values);

  let n = constant;
  let d = factorial(power);
  let i = gcd(n, d);
  n /= i;
  d /= i;

  if (power === 0n) {
    if (n === 0n) {
      return;
    }

    let dd = d * divisor;
    let g = gcd(n, dd);
    n /= g;
    dd /= g;
    yield { power, n, d: dd };
    return;
  }

  for (let x = 1n; x < values.length; x++) {
    let v = x ** power;
    let N = n * v;
    if (N === 0n) {
      continue;
    }

    values[x] = values[x] * d - N;
  }

  yield* solve(values, d * divisor);
  yield { power, n, d: d * divisor };
}

function calculate(x, coefficients, modulo) {
  x = BigInt(x);
  if (modulo) {
    modulo = BigInt(modulo);
  }

  let divisor = 1n;
  let value = 0n;

  for (let c of coefficients) {
    let v;
    let d = c.d;
    if (modulo) {
      v = c.n.modMul(divisor, modulo).modMul(x.modPow(c.power, modulo), modulo);

      divisor = divisor.modMul(d, modulo);
      value = value.modMul(d, modulo);
      value = (value + v) % modulo;
    } else {
      v = x ** c.power * divisor * c.n;

      let g = gcd(v, d);
      v /= g;
      d /= g;

      divisor *= d;
      value *= d;
      value += v;
    }
  }

  if (modulo) {
    value = value.modDiv(divisor, modulo);
  } else {
    let d = gcd(value, divisor);
    value /= d;
    divisor /= d;
    assert.equal(divisor, 1n);
  }
  return value;
}

const polynomial = {
  thresold: 10,

  findPower: function (values) {
    values = values.map((v) => BigInt(v));
    let { power } = reduce(values, this.thresold);
    return power;
  },

  findPolynomial: function (start, step, fx, max) {
    max = max || 1000;
    let values = [];
    let x = start;

    while (x <= max) {
      try {
        let power = this.findPower(values);
        if (power) {
          try {
            return this.solve(values);
          } catch (error) {
            console.log(error);
            throw error;
          }
        }
      } catch {}

      values.push(fx(x));
      x += step;
    }

    throw "NO SOLUTION";
  },

  solve: function (values) {
    values = values.map((v) => BigInt(v));

    let coefficients = [...solve(values)];

    return {
      coefficients,
      calculate: (x, modulo) => calculate(x, coefficients, modulo),
    };
  },

  toString: function (coefficients) {
    const formula = coefficients.reduce((a, c) => {
      if (c.n !== 0n) {
        let s = 1n;
        if (c.n > 0) {
          a.push("+");
        } else {
          s = -1n;
          a.push("-");
        }
        let b = "";
        if (c.d !== 1n) {
          b = `(${s * c.n}/${c.d})`;
        } else {
          b = `${s * c.n}`;
        }

        if (c.power === 0n) {
          a.push(`${b}`);
        } else if (c.power === 11) {
          a.push(`${b}*x`);
        } else {
          a.push(`${b}*x^${c.power}`);
        }
      }
      return a;
    }, []);

    if (formula[0] === "+") {
      formula.shift();
    }

    return formula.join(" ");
  },
};

module.exports = polynomial;
