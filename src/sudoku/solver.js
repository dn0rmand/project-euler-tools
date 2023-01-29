module.exports = function (grid, allowBruteForce) {
  let doingBruteForce = false;

  let solver = {
    usedBruteForce: false,

    soleCandidate: function () {
      let result = 1;

      grid.forEach((cell, x, y) => {
        if (cell.value > 0) return; // Known

        if (cell.possibilities.length == 1) {
          cell.setValue(cell.possibilities[0]);
          result = 0;
        } else if (result !== 0) {
          result = -1;
        }
      });

      return result;
    },

    uniqueCandidate: function () {
      let foundSome = false;

      grid.forEach((cell1) => {
        if (cell1.value !== 0) return;

        let foundValue = 0;

        cell1.possibilities.forEach((value) => {
          if (foundValue != 0) return;

          let unique = true;
          cell1.forSquare((cell2) => {
            if (cell1.x === cell2.x && cell1.y === cell2.y) return;
            if (cell2.value === value) {
              unique = false;
              return false;
            }
            if (cell2.possibilities.includes(value)) {
              unique = false;
              return false;
            }
          });
          if (!unique) {
            unique = true;
            cell1.forRow((cell2) => {
              if (cell1.x === cell2.x && cell1.y === cell2.y) return;
              if (cell2.value === value) {
                unique = false;
                return false;
              }
              if (cell2.possibilities.includes(value)) {
                unique = false;
                return false;
              }
            });
          }
          if (!unique) {
            unique = true;
            cell1.forColumn((cell2) => {
              if (cell1.x === cell2.x && cell1.y === cell2.y) return;
              if (cell2.value === value) {
                unique = false;
                return false;
              }
              if (cell2.possibilities.includes(value)) {
                unique = false;
                return false;
              }
            });
          }
          if (unique) {
            // no other cells of the square can have that value ... must be it
            foundValue = value;
            return;
          }
        });

        if (foundValue !== 0) {
          cell1.setValue(foundValue);
          foundSome = true;
        }
      });

      return foundSome;
    },

    nakedSubset: function (length) {
      function isOneOf(cells, x, y) {
        for (let i = 0; i < cells.length; i++) {
          if (cells[i].x === x && cells[i].y === y) return true;
        }
        return false;
      }

      function sameArray(master, other) {
        if (other.length > length) return false;
        let big = master;
        let small = other;
        if (master.length < other.length) {
          big = other;
          small = master;
        }
        for (let i = 0; i < small.length; i++) {
          if (!big.includes(small[i])) return false;
        }
        if (big !== master) {
          for (let i = 0; i < big.length; i++)
            if (!master.includes(big[i])) master.push(big[i]);
        }
        return true;
      }

      function findMatchingHorizontal(main) {
        let master = Array.from(main.possibilities);
        let found = [{ x: main.x, y: main.y }];

        main.forRow((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;

          if (cell.value === 0 && sameArray(master, cell.possibilities)) {
            found.push({ x: cell.x, y: cell.y });
            if (found.length === length) return false; // break forColumn
          }
        });

        if (found.length !== length) return false;

        let done = false;
        main.forRow((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;
          if (cell.value === 0) {
            for (let i = 0; i < master.length; i++) {
              done |= cell.remove(master[i]);
            }
          }
        });
        return done;
      }

      function findMatchingVertical(main) {
        let master = Array.from(main.possibilities);
        let found = [{ x: main.x, y: main.y }];

        main.forColumn((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;

          if (cell.value === 0 && sameArray(master, cell.possibilities)) {
            found.push({ x: cell.x, y: cell.y });
            if (found.length === length) return false; // break forColumn
          }
        });

        if (found.length !== length) return false;

        let done = false;
        main.forColumn((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;
          if (cell.value === 0) {
            for (let i = 0; i < master.length; i++) {
              done |= cell.remove(master[i]);
            }
          }
        });

        return done;
      }

      function findMatchingSquare(main) {
        let master = Array.from(main.possibilities);
        let found = [{ x: main.x, y: main.y }];

        main.forSquare((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;

          if (cell.value === 0 && sameArray(master, cell.possibilities)) {
            found.push({ x: cell.x, y: cell.y });
            if (found.length === length) return false;
          }
        });

        if (found.length !== length) return false;

        // any other cells cannot use a value from that set

        let done = false;

        main.forSquare((cell) => {
          if (isOneOf(found, cell.x, cell.y)) return;

          if (cell.value === 0) {
            for (let i = 0; i < master.length; i++) {
              done |= cell.remove(master[i]);
            }
          }
        });

        return done;
      }

      let done = false;

      grid.forEach((cell) => {
        if (cell.value > 0 || cell.possibilities.length > length) return;

        if (
          findMatchingHorizontal(cell) ||
          findMatchingVertical(cell) ||
          findMatchingSquare(cell)
        ) {
          done |= true;
        }
      });

      return done;
    },

    removeByLookupV1: function () {
      let foundSome = false;

      grid.forEach((cell1) => {
        if (foundSome)
          // Don't keep going ... Risky business
          return false;

        if (cell1.value !== 0) return;

        // if appears only in a row/column inside the square, then remove from that same row/column of the other square
        cell1.possibilities.forEach((value) => {
          if (foundSome) return false;

          let rows = 0;
          let columns = 0;

          cell1.forSquare((cell2) => {
            if (cell2.value !== 0) return;

            if (cell2.possibilities.includes(value)) {
              if (cell1.x !== cell2.x) columns++;
              if (cell1.y !== cell2.y) rows++;
            }
          });

          if (rows === 0 && columns > 0) {
            // all the values are on the same row
            cell1.forRow((cell2) => {
              if (cell1.square !== cell2.square)
                foundSome |= cell2.remove(value, true);
            });
          } else if (columns === 0 && rows > 0) {
            // all the values are on the same column
            cell1.forColumn((cell2) => {
              if (cell1.square !== cell2.square)
                foundSome |= cell2.remove(value, true);
            });
          }
        });
      });

      return foundSome;
    },

    removeByLookupV2H: function () {
      let foundSome = false;
      grid.forEach((cell1) => {
        if (foundSome) return false;

        cell1.possibilities.forEach((value) => {
          if (foundSome) return;

          let doIt = true;

          cell1.forOtherSquaresH((cell2) => {
            if (cell2.value === value || cell2.possibilities.includes(value)) {
              if (cell2.y === cell1.y) {
                doIt = false;
                return false;
              }
            }
          });
          if (doIt) {
            cell1.forSquare((cell2) => {
              if (cell2.y !== cell1.y && cell2.possibilities.includes(value))
                foundSome |= cell2.remove(value);
            });
          }
        });
      });
      return foundSome;
    },

    removeByLookupV2V: function () {
      let foundSome = false;
      grid.forEach((cell1) => {
        if (foundSome) return false;

        cell1.possibilities.forEach((value) => {
          if (foundSome) return;

          let doIt = true;

          cell1.forOtherSquaresV((cell2) => {
            if (cell2.value === value || cell2.possibilities.includes(value)) {
              if (cell2.x === cell1.x) {
                doIt = false;
                return false;
              }
            }
          });
          if (doIt) {
            cell1.forSquare((cell2) => {
              if (cell2.x !== cell1.x && cell2.possibilities.includes(value))
                foundSome |= cell2.remove(value);
            });
          }
        });
      });
      return foundSome;
    },

    xWingH: function () {
      let foundSome = false;

      grid.forEach((cell1) => {
        if (foundSome) return false;

        cell1.possibilities.forEach((value) => {
          if (foundSome) return;
          let x1 = cell1.x;
          let y1 = cell1.y;
          let x2 = -1;
          let y2 = -1;
          let ok = false;
          cell1.forRow((cell2) => {
            if (cell2.x !== x1 && cell2.possibilities.includes(value)) {
              if (x2 === -1) {
                ok = true;
                x2 = cell2.x;
              } else {
                ok = false;
                return false;
              }
            }
          });
          if (ok) {
            // only appears twice on that row ... check the other rows
            ok = false;
            for (let row = 0; row < 9; row++) {
              if (row === y1) continue;
              let c = grid.get(x1, row);
              if (c.possibilities.includes(value)) {
                c = grid.get(x2, row);
                if (c.possibilities.includes(value)) {
                  // row might be good ... check
                  ok = true;
                  c.forRow((cell2) => {
                    if (
                      cell2.x !== x1 &&
                      cell2.x !== x2 &&
                      cell2.possibilities.includes(value)
                    ) {
                      ok = false;
                      return false;
                    }
                  });
                  if (ok) {
                    y2 = row;
                    break; // Found one !!!!!
                  }
                }
              }
            }
          }
          if (ok) {
            // !!! YES !!! x-wing
            let action = (cell2) => {
              if (cell2.y !== y1 && cell2.y !== y2 && cell2.value === 0) {
                foundSome |= cell2.remove(value);
              }
            };

            cell1.forColumn(action);
            grid.get(x2, cell1.y).forColumn(action);
          }
        });
      });

      return foundSome;
    },

    xWingV: function () {
      let foundSome = false;

      grid.forEach((cell1) => {
        if (cell1.value !== 0) return;

        if (foundSome) return false;

        cell1.possibilities.forEach((value) => {
          if (foundSome) return;

          let x1 = cell1.x;
          let y1 = cell1.y;
          let x2 = -1;
          let y2 = -1;
          let ok = false;
          cell1.forColumn((cell2) => {
            if (cell2.y !== y1 && cell2.possibilities.includes(value)) {
              if (y2 === -1) {
                ok = true;
                y2 = cell2.y;
              } else {
                ok = false;
                return false;
              }
            }
          });
          if (ok) {
            // only appears twice on that row ... check the other rows
            ok = false;
            for (let col = 0; col < 9; col++) {
              if (col === x1) continue;
              let c = grid.get(col, y1);
              if (c.possibilities.includes(value)) {
                c = grid.get(col, y2);
                if (c.possibilities.includes(value)) {
                  // row might be good ... check
                  ok = true;
                  c.forColumn((cell2) => {
                    if (
                      cell2.y !== y1 &&
                      cell2.y !== y2 &&
                      cell2.possibilities.includes(value)
                    ) {
                      ok = false;
                      return false;
                    }
                  });
                  if (ok) {
                    x2 = col;
                    break; // Found one !!!!!
                  }
                }
              }
            }
          }
          if (ok) {
            // !!! YES !!! x-wing
            let action = (cell2) => {
              if (cell2.y !== y1 && cell2.y !== y2 && cell2.value === 0) {
                foundSome |= cell2.remove(value);
              }
            };

            cell1.forRow(action);
            grid.get(x2, cell1.y).forRow(action);
          }
        });
      });

      return foundSome;
    },

    bruteForce: function () {
      this.usedBruteForce = true;

      if (!grid.isValid) return false;

      let best = undefined;

      grid.forEach((cell) => {
        if (cell.value === 0) {
          if (best === undefined) best = cell;
          else if (best.possibilities.length > cell.possibilities.length)
            best = cell;
        }
      });

      let values = Array.from(best.possibilities);
      let state = grid.saveState();

      for (let i = 0; i < values.length; i++) {
        best.setValue(values[i]);
        if (grid.isValid) {
          let result = this.solve();
          if (result) return true;
        }

        grid.restoreState(state);
      }
    },

    solve: function (canStop) {
      if (typeof canStop !== "function")
        canStop = function () {
          return false;
        };

      while (true) {
        let solved = this.soleCandidate();

        if (solved === 1)
          // Fully resolved ... Done!
          return true;

        if (solved === 0) {
          // something was resolved so keep going
          if (canStop()) return true;

          continue;
        }

        if (!grid.isValid) return false;

        if (this.uniqueCandidate()) continue;
        if (this.removeByLookupV1()) continue;
        if (this.nakedSubset(2)) continue;
        if (this.nakedSubset(3)) continue;
        if (this.nakedSubset(4)) continue;
        if (this.removeByLookupV2H()) continue;
        if (this.removeByLookupV2V()) continue;
        if (this.xWingH()) continue;
        if (this.xWingV()) continue;

        if (allowBruteForce === true)
          // Stuck ... maybe something went wrong. Start again
          return this.bruteForce();
        else {
          console.log("Failed to resolved sudoku grid");
          grid.dump();
          console.log("");

          return false;
        }
      }
    },
  };

  return solver;
};
