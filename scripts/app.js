let gridData = [];

const gridContainer = document.getElementById('grid-container');
const wordInput = document.getElementById('word-input');


// Function to generate the grid based on the global grid data
function generateGrid() {
    const gridWidth = parseInt(document.getElementById('grid-width').value, 10);
    const gridHeight = parseInt(document.getElementById('grid-height').value, 10);

    // Initialize grid data
    gridData = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(''));

    // Clear the grid container before generating a new grid
    gridContainer.innerHTML = '';

    // Set grid template based on the provided width and height
    gridContainer.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;

    // Generate the grid cells and populate them with values from gridData
    gridData.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.value = cellValue;  // Set the input's value to the saved grid value

            // Add event listener for input changes
            input.addEventListener('input', () => {
                input.value = input.value.toUpperCase();
            });

            // Attach arrow key navigation to each input
            input.addEventListener('keydown', handleArrowNavigation);

            // Toggle empty cell on double-click
            cell.addEventListener('dblclick', () => {
                console.log('Double-clicked cell:', rowIndex, colIndex);
                cell.classList.toggle('empty');
                input.disabled = cell.classList.contains('empty');
                if (cell.classList.contains('empty')) {
                    gridData[rowIndex][colIndex] = '#'; // Mark cell as empty
                } else {
                    gridData[rowIndex][colIndex] = ''; // Restore the empty state
                }
            });

            cell.appendChild(input);
            gridContainer.appendChild(cell);
        });
    });
}

// Function to add a row to the grid
function addToGrid(type) {
    const gridWidth = gridData[0].length;  // Get the number of columns
    const gridHeight = gridData.length;   // Get the number of rows

    if (type === 'row') {
        // Add a new row to the gridData array
        gridData.push(Array(gridWidth).fill(''));

        // Update the grid display
        generateGrid();
    } else if (type === 'column') {
        // Add a new column to each row
        gridData.forEach(row => row.push(''));

        // Update the grid display
        generateGrid();
    }
}

// Function to handle arrow navigation in the grid
function handleArrowNavigation(event) {
    const cells = Array.from(gridContainer.querySelectorAll('.cell input'));  // All input elements
    const gridWidth = gridData[0].length;  // Number of columns
    const currentIndex = cells.indexOf(event.target);

    let newIndex;
    switch (event.key) {
        case 'ArrowUp':
            newIndex = currentIndex - gridWidth;
            break;
        case 'ArrowDown':
            newIndex = currentIndex + gridWidth;
            break;
        case 'ArrowLeft':
            newIndex = currentIndex - 1;
            break;
        case 'ArrowRight':
            newIndex = currentIndex + 1;
            break;
        default:
            return; // Ignore non-arrow keys
    }

    // Ensure the new index is within the bounds of the grid
    if (newIndex >= 0 && newIndex < cells.length) {
        cells[newIndex].focus();
        event.preventDefault(); // Prevent default browser behavior
    }
}

function exportPuzzle() {
    const rows = [];
    const cells = gridContainer.querySelectorAll('.cell');

    let currentRow = [];
    cells.forEach((cell, index) => {
        const isEmpty = cell.classList.contains('empty');
        const value = isEmpty ? '#' : cell.querySelector('input').value || '';
        currentRow.push(value);

        // Break row based on grid width
        if ((index + 1) % parseInt(gridContainer.style.gridTemplateColumns.split(' ').length) === 0) {
            rows.push(currentRow);
            currentRow = [];
        }
    });

    console.log('Exported Puzzle:', rows);
    alert('Puzzle exported! Check console.');
}

// Add event listeners to clear the highlights when the word input is empty
wordInput.addEventListener('input', () => {
  if (wordInput.value === '') {
    clearHighlights();
  }
});

// Function to find the locations of the word in the grid
function findWordLocations() {
    clearHighlights();

    const word = wordInput.value.toUpperCase();
    
    const rows = Math.sqrt(gridContainer.children.length);
    const cols = rows; // Assuming square grid
    const grid = Array.from(gridContainer.querySelectorAll('.cell input'));

    // Convert the grid into a 2D array
    const gridArray = [];
    for (let r = 0; r < rows; r++) {
        const row = grid.slice(r * cols, r * cols + cols);
        gridArray.push(row);
    }

    const wordLength = word.length;
    let possibleLocations = [];

    // Check horizontally
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - wordLength; c++) {
            if (canPlaceWord(gridArray, word, r, c, 'horizontal')) {
                possibleLocations.push({ r, c, direction: 'horizontal' });
            }
        }
    }

    // Check vertically
    for (let r = 0; r <= rows - wordLength; r++) {
        for (let c = 0; c < cols; c++) {
            if (canPlaceWord(gridArray, word, r, c, 'vertical')) {
                possibleLocations.push({ r, c, direction: 'vertical' });
            }
        }
    }

    // Highlight possible locations
    possibleLocations.forEach(location => highlightWord(gridArray, word, location));
}

function canPlaceWord(grid, word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        const cell = direction === 'horizontal' ? grid[row][col + i] : grid[row + i][col];
        if (cell.value && cell.value !== word[i]) {
            return false; // Conflicting letters
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

function clearHighlights() {
    const highlightedCells = gridContainer.querySelectorAll('.cell.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
}

// Initialize the grid with default values
generateGrid();