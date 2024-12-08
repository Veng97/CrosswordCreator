import { HighlightType } from './cell.js';

export class Search {
    constructor(grid) {
        this.grid = grid;
    }

    highlightWordLocations(word) {
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

    checkWord(word, location, force = false) {
        const { row, col, dir } = location;
        if (dir === 'horizontal') {
            if (col + word.length > this.grid.width()) {
                return false;
            }
            for (let i = 0; i < word.length; i++) {
                const cell = this.grid.cellAt(row, col + i);
                if (!cell.isChar()) {
                    return false;
                }
                const value = cell.getChar();
                if ((force || value !== '') && value.toUpperCase() !== word[i].toUpperCase()) {
                    return false;
                }
            }
        } else {
            if (row + word.length > this.grid.height()) {
                return false;
            }
            for (let i = 0; i < word.length; i++) {
                const cell = this.grid.cellAt(row + i, col);
                if (!cell.isChar()) {
                    return false;
                }
                const value = cell.getChar();
                if ((force || value !== '') && value.toUpperCase() !== word[i].toUpperCase()) {
                    return false;
                }
            }
        }
        return true;
    }

    highlightWord(word, location) {
        const { row, col, dir } = location;
        if (dir === 'horizontal') {
            for (let i = 0; i < word.length; i++) {
                this.grid.cellAt(row, col + i).addHighlight(HighlightType.HORIZONTAL);
            }
        } else {
            for (let i = 0; i < word.length; i++) {
                this.grid.cellAt(row + i, col).addHighlight(HighlightType.VERTICAL);
            }
        }
    }

    findExistingLocation(word) {
        if (!word) return null;

        const cols = this.grid.width();
        const rows = this.grid.height();
        const wordLength = word.length;

        // Check for horizontal placements
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - wordLength; c++) {
                const location = { row: r, col: c, dir: 'horizontal' };
                if (this.checkWord(word, location, true)) {
                    return location;
                }
            }
        }

        // Check for vertical placements
        for (let r = 0; r <= rows - wordLength; r++) {
            for (let c = 0; c < cols; c++) {
                const location = { row: r, col: c, dir: 'vertical' };
                if (this.checkWord(word, location, true)) {
                    return location;
                }
            }
        }

        return null;
    }
};
