module.exports = function (grid, x, y, value) {
  let c = {
    square: y - (y % 3) + (x - (x % 3)) / 3,
    x: x,
    y: y,
    value: +value,
    possibilities: [],

    remove: function (value) {
      if (this.value !== 0) return;

      let i = this.possibilities.indexOf(value);
      if (i >= 0) {
        this.possibilities.splice(i, 1);

        if (this.possibilities.length === 0) this.isValid = false;

        return true;
      }
    },

    forColumn: function (fn) {
      grid.forColumn(this.x, fn);
    },

    forRow: function (fn) {
      grid.forRow(this.y, fn);
    },

    forSquare: function (fn) {
      grid.forSquare(this.x, this.y, fn);
    },

    forOtherSquaresV: function (fn) {
      grid.forOtherSquaresV(this.x, this.y, fn);
    },

    forOtherSquaresH: function (fn) {
      grid.forOtherSquaresH(this.x, this.y, fn);
    },

    setValue: function (value) {
      let main = this;

      main.value = value;
      main.possibilities = [];

      this.forColumn((cell) => {
        if (cell.value === 0) cell.remove(value);
      });

      this.forRow((cell) => {
        if (cell.value === 0) cell.remove(value);
      });

      this.forSquare((cell) => {
        if (cell.value === 0) cell.remove(value);
      });
    },
  };

  return c;
};
