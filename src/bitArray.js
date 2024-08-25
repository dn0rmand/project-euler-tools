"use strict";

const MAX_SIZE = 2 ** 32;

module.exports = function (bufferSize) {
  let size = Math.ceil(bufferSize / 8);
  const buffers = [];
  while (size) {
    const bSize = Math.min(MAX_SIZE, size);
    const buffer = new Uint8Array(bSize);
    buffers.push(buffer);
    size -= bSize;
  }

  const convertIndex = (index) => {
    // if (index < 0 || index >= bufferSize) {
    //   throw "Out of Range";
    // }
    const index8 = (index - (index % 8)) / 8;
    const bIndex = index8 % MAX_SIZE;
    const buffer = buffers[(index8 - bIndex) / MAX_SIZE];
    // if (buffer === undefined) {
    //   throw "Error";
    // }
    return {
      bit: 1 << (index & 7),
      pos: bIndex,
      buffer,
    };
  };

  const result = {
    set: function (index, bool) {
      const { bit, pos, buffer } = convertIndex(index);
      if (bool) {
        buffer[pos] |= bit;
      } else {
        buffer[pos] &= ~bit;
      }
    },
    get: function (index) {
      const { bit, pos, buffer } = convertIndex(index);
      return (buffer[pos] & bit) !== 0;
    },
    toggle: function (index) {
      const { bit, pos, buffer } = convertIndex(index);
      if (buffer[pos] & bit) {
        buffer[pos] &= ~bit;
        return -1;
      } else {
        buffer[pos] |= bit;
        return 1;
      }
    },
  };

  return result;
};
