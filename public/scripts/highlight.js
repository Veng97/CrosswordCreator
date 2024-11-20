export function clearHighlights(gridContainer) {
    const highlightedCells = gridContainer.querySelectorAll('.cell.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
}

export function highlightWords(gridContainer, value) {
    clearHighlights(gridContainer);

    const word = value.toUpperCase();
    const rows = Math.sqrt(gridContainer.children.length);
    const cols = rows;
    const grid = Array.from(gridContainer.querySelectorAll('.cell input'));

    const gridArray = [];
    for (let r = 0; r < rows; r++) {
        const row = grid.slice(r * cols, r * cols + cols);
        gridArray.push(row);
    }

    const wordLength = word.length;
    let possibleLocations = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - wordLength; c++) {
            if (canPlaceWord(gridArray, word, r, c, 'horizontal')) {
                possibleLocations.push({ r, c, direction: 'horizontal' });
            }
        }
    }

    for (let r = 0; r <= rows - wordLength; r++) {
        for (let c = 0; c < cols; c++) {
            if (canPlaceWord(gridArray, word, r, c, 'vertical')) {
                possibleLocations.push({ r, c, direction: 'vertical' });
            }
        }
    }

    possibleLocations.forEach(location => highlightWord(gridArray, word, location));
}

function canPlaceWord(grid, word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        const cell = direction === 'horizontal' ? grid[row][col + i] : grid[row + i][col];
        if (cell.value && cell.value !== word[i]) {
            return false;
        }
    }
    return true;
}

function highlightWord(grid, word, { r, c, direction }) {
    for (let i = 0; i < word.length; i++) {
        const cell = direction === 'horizontal' ? grid[r][c + i] : grid[r + i][c];
        cell.parentElement.classList.add('highlight');
    }
}

