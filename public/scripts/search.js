
export class Search {
    constructor(grid) {
        this.grid = grid;
    }

    highlightWordLocations(word) {
        this.clearHighlights();

        if (!word) return
        
        const possibleLocations = this.findPossibleLocations(word);
        possibleLocations.forEach(location => this.highlightWord(word, location));
    }

    findPossibleLocations(word) {
        let possibleLocations = [];

        if (!word) return possibleLocations;

        const cols = this.grid.width();
        const rows = this.grid.height();
        const wordLength = word.length;
        
        // Check for horizontal placements
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - wordLength; c++) {
                const location = { row: r, col: c, dir: 'horizontal' };
                if (this.checkWord(word, location)) {
                    possibleLocations.push(location);
                }
            }
        }

        // Check for vertical placements
        for (let r = 0; r <= rows - wordLength; r++) {
            for (let c = 0; c < cols; c++) {
                const location = { row: r, col: c, dir: 'vertical' };
                if (this.checkWord(word, location)) {
                    possibleLocations.push(location);
                }
            }
        }

        return possibleLocations;
    }

    checkWord(word, location) {
        const { row, col, dir } = location;
        if (dir === 'horizontal') {
            if (col + word.length > this.grid.width()) {
                return false;
            }
            for (let i = 0; i < word.length; i++) {
                const value = this.grid.data[row][col + i];
                if (value.length === 1 && value.toUpperCase() !== word[i].toUpperCase()) {
                    return false;
                }
            }
        } else {
            if (row + word.length > this.grid.height()) {
                return false;
            }
            for (let i = 0; i < word.length; i++) {
                const value = this.grid.data[row + i][col];
                if (value.length === 1 && value.toUpperCase() !== word[i].toUpperCase()) {
                    return false;
                }
            }
        }
        return true;
    }

    clearHighlights() {
        console.log('Clearing highlights');
        this.grid.cells().forEach(cell => {
            cell.classList.remove('highlight-horizontal', 'highlight-vertical');
        });
    }

    highlightWord(word, location) {
        const { row, col, dir } = location;
        if (dir === 'horizontal') {
            for (let i = 0; i < word.length; i++) {
                this.grid.cellAt(row, col + i).classList.add('highlight-horizontal');
            }
        } else {
            for (let i = 0; i < word.length; i++) {
                this.grid.cellAt(row + i, col).classList.add('highlight-vertical');
            }
        }
    }
};
