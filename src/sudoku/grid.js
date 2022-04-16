
module.exports = function(grid)
{
    const Cell = require("./cell.js");

    let cells = [];
 
    let generatePossibilites = function(grid)
    {
        grid.isValid = true;

        grid.forEach((main) => 
        {
            if (main.value > 0)
            {
                main.possibilities = [];
                return;
            }

            main.possibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            
            main.forRow((cell) => {
                if (cell.value > 0)
                    main.remove(cell.value);
            });
            main.forColumn((cell) => {
                if (cell.value > 0)
                    main.remove(cell.value);
            });
            main.forSquare((cell) => {
                if (cell.value > 0)
                    main.remove(cell.value);
            });

            if (main.possibilities.length === 0)
                grid.isValid = false;
        });
    };

    let g = {
        isValid: true,
        get: function(x, y) 
        {
            return cells[y][x]; 
        },

        forEach: function(fn)
        {
            for(let y = 0; y < 9; y++)
            for(let x = 0; x < 9; x++)
            {
                let cell = cells[y][x];
                if (fn(cell) === false)
                    return; 
            }
        },

        forRow: function(y, fn)
        {
            for(let x = 0; x < 9; x++)
            {
                let cell = cells[y][x];
                if (fn(cell) === false)
                    return;
            }
        },

        forColumn: function(x, fn)
        {
            for(let y = 0; y < 9; y++)
            {
                let cell = cells[y][x];
                if (fn(cell) === false)
                    return;
            }
        },
        
        forSquare: function(x, y, fn)
        {
            let xx = (x - (x % 3));
            let yy = (y - (y % 3));

            // Find n cells with a same set of possible values

            for(let y2 = yy; y2 < yy+3; y2++)
            for(let x2 = xx; x2 < xx+3; x2++)
            {
                let cell = cells[y2][x2];
                if (fn(cell) === false)
                    return;
            }
        },

        forOtherSquaresV: function(x, y, fn)
        {
            let xx = (x - (x % 3));
            let yy = (y - (y % 3));
            let id = yy + xx/3;

            // Find n cells with a same set of possible values

            for(let y2 = 0; y2 < 9; y2++)
            for(let x2 = xx; x2 < xx+3; x2++)
            {
                let cell = cells[y2][x2];
                if (cell.square !== id)
                    if (fn(cell) === false)
                        return;
            }
        },

        forOtherSquaresH: function(x, y, fn)
        {
            let xx = (x - (x % 3));
            let yy = (y - (y % 3));
            let id = yy + xx/3;

            // Find n cells with a same set of possible values

            for(let x2 = 0; x2 < 9; x2++)
            for(let y2 = yy; y2 < yy+3; y2++)
            {
                let cell = cells[y2][x2];
                if (cell.square !== id)
                    if (fn(cell) === false)
                        return;
            }
        },

        dump: function()
        {
            let line = '+' + '-'.repeat(7) + '+' + '-'.repeat(7) + '+' + '-'.repeat(7) + '+';
            for(let y = 0; y < 9; y++)
            {        
                let s = '';
                if ((y % 3) === 0)
                    console.log(line);
        
                for (let x = 0; x < 9 ; x++)
                {
                    if ((x % 3) === 0)
                        s += '| ';
                    s += cells[y][x].value + ' ' ;
                }
                s += '| ';
                for (let x = 0; x < 9 ; x++)
                {
                    if (cells[y][x].value === 0)
                        s += '[' + cells[y][x].possibilities.toString() + '] ';
                }
                console.log(s);
            }
        
            console.log(line);
        },

        saveState: function()
        {
            let state = [];
            
            this.forEach((cell) => {
                if (cell.value === 0)
                    state.push(cell);
            });

            return state;
        },

        restoreState: function(state)
        {
            for(let i = 0; i < state.length ; i++)
                state[i].value = 0;

            generatePossibilites(this);
        }
    }

    for (let y = 0; y < 9; y++)
    {
        let row = [];
        
        cells[y] = row;

        for (let x = 0; x < 9; x++)
        {
            row[x] = Cell(g, x, y, grid[y][x]);
        }
    }

    generatePossibilites(g);
    return g;
}