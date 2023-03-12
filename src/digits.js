"use strict";

module.exports = function (value, base) {
  const digits = [];

  if (!value) {
    return [0];
  }
  if (value < 0) {
    value = -value;
  }
  if (typeof value === "bigint") {
    base = base ? BigInt(base) : 10n;
    while (value > 0) {
      const d = value % base;
      value = (value - d) / base;
      digits.push(Number(d));
    }
  } else {
    base = base ? Number(base) : 10;

    while (value > 0) {
      const d = value % base;
      value = (value - d) / base;
      digits.push(d);
    }
  }

  digits = digits.reverse();
  return digits;
};
