// grid.js
export class Grid {
    constructor(id = 'grid-container', width = 10, height = 10) {
        this.container = document.getElementById(id);
        this.data = Array.from({ length: height }, () => Array(width).fill(''));
        this.draw();
    }

    width = () => this.data[0].length;
    height = () => this.data.length;
    cells = () => this.container.querySelectorAll('.cell');
    // cells2D() {
    //     const cells = Array.from(this.cells());
        
    //     let cellArray = [];
    //     for (let r = 0; r < rows; r++) {
    //         const row = cells.slice(r * cols, r * cols + cols);
    //         cellArray.push(row);
    //     }
    // }

    draw() {
        // TODO: Remove this code
        // Set width and height attributes on the grid container
        this.container.setAttribute('width', this.width());
        this.container.setAttribute('height', this.height());

        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.width()}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.height()}, 1fr)`;

        this.data.forEach((row, rowIndex) => {
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
                    this.data[rowIndex][colIndex] = input.value;
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
                    this.data[rowIndex][colIndex] = input.value;
                });

                // Arrow key navigation
                input.addEventListener('keydown', (event) => {
                    const cells = Array.from(this.container.querySelectorAll('.cell input'));
                    const currentIndex = cells.indexOf(event.target);

                    let Index;
                    switch (event.key) {
                        case 'ArrowUp':
                            Index = currentIndex - this.width();
                            break;
                        case 'ArrowDown':
                            Index = currentIndex + this.width();
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
                this.container.appendChild(cell);
            });
        });
    }

    addRow() {
        this.data.push(Array(this.width()).fill(''));
        this.draw();
    }

    addColumn() {
        this.data.forEach(row => row.push(''));
        this.draw();
    }

    removeRow() {
        if (this.height() > 1) {
            this.data.pop();
            this.draw();
        }
    }

    removeColumn() {
        if (this.width() > 1) {
            this.data.forEach(row => row.pop());
            this.draw();
        }
    }

    async loadFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.draw();
        } catch (error) {
            console.error('Error loading grid data:', error);
        }
    }

    async saveFile(url) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.data)
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

    async populateFileSelector(gridSelector) {
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
}