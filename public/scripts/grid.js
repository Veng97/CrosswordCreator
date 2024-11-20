export let gridData = [];

export function drawGrid(gridContainer) {
    const gridWidth = gridData[0].length;
    const gridHeight = gridData.length;

    // Set styling to wrap table
    gridContainer.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridHeight}, 1fr)`;
    
    // Set width and height attributes on the grid container
    gridContainer.setAttribute('width', gridWidth);
    gridContainer.setAttribute('height', gridHeight);
    
    gridContainer.innerHTML = '';
    gridData.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.value = cellValue;
            if (input.value === '#') {
                cell.classList.add('empty');
            }

            // Format input on change 
            input.addEventListener('input', () => {
                input.value = input.value.toUpperCase();
                gridData[rowIndex][colIndex] = input.value;
                if (input.value === '#') {
                    cell.classList.add('empty');
                } else if (input.value !== '#') {
                    cell.classList.remove('empty');
                }
            });

            // Double click to toggle empty cell
            cell.addEventListener('dblclick', () => {
                cell.classList.toggle('empty');
                input.value = cell.classList.contains('empty') ? '#' : '';
                gridData[rowIndex][colIndex] = input.value;
            });

            // Arrow key navigation
            input.addEventListener('keydown', (event) => {
                const cells = Array.from(gridContainer.querySelectorAll('.cell input'));
                const currentIndex = cells.indexOf(event.target);

                let Index;
                switch (event.key) {
                    case 'ArrowUp':
                        Index = currentIndex - gridWidth;
                        break;
                    case 'ArrowDown':
                        Index = currentIndex + gridWidth;
                        break;
                    case 'ArrowLeft':
                        Index = currentIndex - 1;
                        break;
                    case 'ArrowRight':
                        Index = currentIndex + 1;
                        break;
                    default:
                        return;
                }

                if (Index >= 0 && Index < cells.length) {
                    cells[Index].focus();
                    event.preventDefault();
                }
            });

            cell.appendChild(input);
            gridContainer.appendChild(cell);
        });
    });
}

export function generateEmptyGrid(gridContainer, width, height) {
    gridData = Array.from({ length: height }, () => Array(width).fill(''));
    drawGrid(gridContainer);
}

export function addToGrid(gridContainer, type) {
    const gridWidth = gridData[0].length;

    if (type === 'row') {
        gridData.push(Array(gridWidth).fill(''));
        drawGrid(gridContainer);
    } else if (type === 'column') {
        gridData.forEach(row => row.push(''));
        drawGrid(gridContainer);
    }
}

export function removeFromGrid(gridContainer, type) {
    const gridWidth = gridData[0].length;
    const gridHeight = gridData.length;

    if (type === 'row' && gridHeight > 1) {
        gridData.pop();
        drawGrid(gridContainer);
    } else if (type === 'column' && gridWidth > 1) {
        gridData.forEach(row => row.pop());
        drawGrid(gridContainer);
    }
}

export async function loadGridData(gridContainer, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        gridData = await response.json();
        drawGrid(gridContainer);
    } catch (error) {
        console.error('Error loading grid data:', error);
    }
}

export async function saveGridData(gridContainer, url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gridData)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const result = await response.text();
        alert(result);
    } catch (error) {
        console.error('Error saving grid:', error);
    }
}

export async function selectGridData(gridSelector) {
    try {
        const response = await fetch('/puzzle-options');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const files = await response.json();
        files.forEach(file => {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            gridSelector.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading JSON file list:', error);
    }
}