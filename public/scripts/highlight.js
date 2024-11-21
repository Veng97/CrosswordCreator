import { Grid } from './grid.js';



export class Highlight {
    constructor(grid) {
        this.grid = grid;
    }

    // Highlight all possible locations of a word in the grid
    highlightWordLocations(word) {
        this.clearHighlights();

        if (!word) return
        
        const cellArray = this.toCellArray();
        console.log(cellArray);
        const possibleLocations = this.findPossibleLocations(cellArray, word)
        possibleLocations.forEach(location => this.highlightWord(cellArray, word, location));
    }

    // Find all possible locations for a word in the grid
    findPossibleLocations(cellArray, word) {
        const cols = cellArray[0].length;
        const rows = cellArray.length;
        const wordLength = word.length;

        let possibleLocations = [];

        // Check for horizontal placements
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - wordLength; c++) {
                const location = { row: r, col: c, dir: 'horizontal' };
                if (this.canPlaceWord(cellArray, word, location)) {
                    possibleLocations.push(location);
                }
            }
        }

        // Check for vertical placements
        for (let r = 0; r <= rows - wordLength; r++) {
            for (let c = 0; c < cols; c++) {
                const location = { row: r, col: c, dir: 'vertical' };
                if (this.canPlaceWord(cellArray, word, location)) {
                    possibleLocations.push(location);
                }
            }
        }

        return possibleLocations;
    }



    // // Count all possible locations of a word in the grid
    // countWordLocations(gridContainer, word) {
    //     if (!word) return 0
        
    //     const cellArray = toCellArray(gridContainer);
    //     const possibleLocations = findPossibleLocations(cellArray, word)
        
    //     return possibleLocations.length;
    // }

    // Clear all highlights from the grid container
    clearHighlights() {
        this.grid.cells().forEach(cell => {
            cell.classList.remove('highlight-horizontal', 'highlight-vertical');
        });
    }

    // Helper to check if a word can be placed at a specific location
    canPlaceWord(cellArray, word, location) {
        const { row, col, dir } = location;
        for (let i = 0; i < word.length; i++) {
            const cell = dir === 'horizontal' ? cellArray[row][col + i] : cellArray[row + i][col];
            if (cell.value && cell.value.toUpperCase() !== word[i].toUpperCase()) {
                return false;
            }
        }
        return true;
    }

    // Helper to highlight a word at a specific location
    highlightWord(cellArray, word, location) {
        const { row, col, dir } = location;
        for (let i = 0; i < word.length; i++) {
            const cell = dir === 'horizontal' ? cellArray[row][col + i] : cellArray[row + i][col];
            cell.parentElement.classList.add('highlight-' + dir);
        }
    }

    // Convert the grid container into a 2D array of cells
    toCellArray() {
        const rows = parseInt(this.grid.container.getAttribute('width'));
        const cols = parseInt(this.grid.container.getAttribute('height'));
        const grid = Array.from(this.grid.container.querySelectorAll('.cell input'));

        if (grid.length !== rows * cols) {
            throw new Error('Grid size mismatch: Ensure rows and cols match the number of cells in the grid.');
        }

        let cellArray = [];
        for (let r = 0; r < rows; r++) {
            const row = grid.slice(r * cols, r * cols + cols);
            cellArray.push(row);
        }

        return cellArray;
    }
};
