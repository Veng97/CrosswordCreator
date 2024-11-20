// Clear all highlights from the grid container
export function clearHighlights(gridContainer) {
    const highlightedCells = gridContainer.querySelectorAll('.cell.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight-horizontal highlight-vertical'));
}

// Find all possible locations for a word in the grid
export function findPossibleLocations(cellArray, word) {
    const cols = cellArray[0].length;
    const rows = cellArray.length;
    const wordLength = word.length;

    let possibleLocations = [];

    // Check for horizontal placements
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - wordLength; c++) {
            const location = { row: r, col: c, dir: 'horizontal' };
            if (canPlaceWord(cellArray, word, location)) {
                possibleLocations.push(location);
            }
        }
    }

    // Check for vertical placements
    for (let r = 0; r <= rows - wordLength; r++) {
        for (let c = 0; c < cols; c++) {
            const location = { row: r, col: c, dir: 'vertical' };
            if (canPlaceWord(cellArray, word, location)) {
                possibleLocations.push(location);
            }
        }
    }

    return possibleLocations;
}

// Highlight all possible locations of a word in the grid
export function highlightWords(gridContainer, word) {
    clearHighlights(gridContainer);

    if (!word) return
    
    const cellArray = toCellArray(gridContainer);
    const possibleLocations = findPossibleLocations(cellArray, word)
    possibleLocations.forEach(location => highlightWord(cellArray, word, location));
}

// Helper to check if a word can be placed at a specific location
function canPlaceWord(cellArray, word, location) {
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
function highlightWord(cellArray, word, location) {
    const { row, col, dir } = location;
    for (let i = 0; i < word.length; i++) {
        const cell = dir === 'horizontal' ? cellArray[row][col + i] : cellArray[row + i][col];
        cell.parentElement.classList.add('highlight-' + dir);
    }
}

// Convert the grid container into a 2D array of cells
function toCellArray(gridContainer) {
    const rows = parseInt(gridContainer.getAttribute('width'));
    const cols = parseInt(gridContainer.getAttribute('height'));
    const grid = Array.from(gridContainer.querySelectorAll('.cell input'));

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
