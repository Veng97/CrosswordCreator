
export class Grid {
    constructor(id, width = 10, height = 10) {
        this.container = document.getElementById(id);
        this.data = Array.from({ length: height }, () => Array(width).fill(''));
        this.draw();
    }

    width = () => this.data[0].length;
    height = () => this.data.length;

    cellAt = (row, col) => this.container.children[row * this.width() + col];

    entryAt(row, col) {
        const entry = this.data[row][col];
        if (entry.length !== 1 || entry === '#') {
            return "_";
        } else {
            return entry;
        }
    }

    updateEntryAt(row, col, value) {
        const cell = this.cellAt(row, col);

        // Update 'empty' class based on the new value
        cell.classList.toggle('empty', value === '#');

        // Format input to uppercase if it's a letter
        if (value.length === 1) {
            value = value.toUpperCase();
            cell.firstChild.value = value;
        }

        // Mark as hint
        cell.classList.toggle('hint', value.length > 1);

        // Update the data array with the new value
        this.data[row][col] = value;
    }

    draw() {
        this.container.innerHTML = '';

        this.container.style.gridTemplateColumns = `repeat(${this.width()}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.height()}, 1fr)`;

        this.data.forEach((elements, row) => {
            elements.forEach((value, col) => {
                this.container.appendChild(this.drawCell(row, col));
                this.updateEntryAt(row, col, value);
            });
        });

        this.notifyChanges();
    }

    drawCell(row, col) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.type = 'text';

        // Format input on change 
        input.addEventListener('input', () => {
            this.updateEntryAt(row, col, input.value);
            this.clearHighlights();
            this.notifyChanges();
        });

        // Double click to toggle empty cell
        input.addEventListener('dblclick', () => {
            this.updateEntryAt(row, col, '#');
            this.clearHighlights();
            this.notifyChanges();
        });

        // Arrow key navigation
        input.addEventListener('keydown', (event) => {
            // Go to the next cell based on the arrow key pressed
            let nextIndex;
            switch (event.key) {
                case 'ArrowUp':
                    nextIndex = (row - 1) * this.width() + col;
                    break;
                case 'ArrowDown':
                    nextIndex = (row + 1) * this.width() + col;
                    break;
                case 'ArrowLeft':
                    nextIndex = row * this.width() + col - 1;
                    break;
                case 'ArrowRight':
                    nextIndex = row * this.width() + col + 1;
                    break;
                default:
                    return;
            }

            // Limit the next index to the grid boundaries
            if (nextIndex < 0 || nextIndex >= this.container.children.length) {
                return;
            }

            // Focus on the next cell
            this.container.children[nextIndex].firstChild.focus();

            // Check if shift key is pressed to start cell selection
            if (event.shiftKey) {
                if (!this.isSelecting) {
                    this.selectionStart(row, col);
                }
                const nextRow = Math.floor(nextIndex / this.width());
                const nextCol = nextIndex % this.width();
                this.selectionUpdate(nextRow, nextCol);
            }
        });

        input.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.selectionStop(row, col);
            }
        });

        // Start cell selection on left mouse down
        input.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.selectionStart(row, col);
            }
        });

        // End cell selection on left mouse up
        input.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.selectionStop(row, col);
            }
        });

        // Update cell selection on mouse enter
        input.addEventListener('mouseenter', () => {
            if (this.isSelecting) {
                this.selectionUpdate(row, col);
            }
        });

        // Disable default selection behavior to allow cell selection
        input.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });

        cell.appendChild(input);

        return cell;
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

    clearHighlights() {
        console.log('Clearing grid highlights');
        for (let i = 0; i < this.container.children.length; i++) {
            this.container.children[i].classList.remove('highlight-selected');
        }
    }

    onChanges(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!this.callbacks) this.callbacks = [];
        this.callbacks.push(callback);
    }

    notifyChanges() {
        if (!this.callbacks) return;
        for (let i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i]();
        }
    }

    onSelected(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!this.selectedCallbacks) this.selectedCallbacks = [];
        this.selectedCallbacks.push(callback);
    }

    notifySelected(selectedWord) {
        if (!this.selectedCallbacks) return;
        for (let i = 0; i < this.selectedCallbacks.length; i++) {
            this.selectedCallbacks[i](selectedWord);
        }
    }

    selectionStart(row, col) {
        console.log('Starting cell selection (row:', row, 'col:', col, ')');
        this.isSelecting = true;
        this.selectingFromCell = { row, col };
        this.selectingToCell = { row, col };
        this.selectedCells = [];
    }

    selectionUpdate(row, col) {
        // Remove previous selection highlights
        for (let i = 0; i < this.container.children.length; i++) {
            this.container.children[i].classList.remove('highlight-selected');
        }
        
        // Return if not selecting
        if (!this.isSelecting) return;

        this.selectingToCell = { row, col };

        // Update selected cells (either horizontally or vertically)
        this.selectedCells = [];
        if (Math.abs(this.selectingFromCell.row - this.selectingToCell.row) > Math.abs(this.selectingFromCell.col - this.selectingToCell.col)) {
            const fromRow = Math.min(this.selectingFromCell.row, this.selectingToCell.row);
            const toRow = Math.max(this.selectingFromCell.row, this.selectingToCell.row);
            for (let i = fromRow; i <= toRow; i++) {
                this.selectedCells.push({ row: i, col: this.selectingFromCell.col });
            }
        } else {
            const fromCol = Math.min(this.selectingFromCell.col, this.selectingToCell.col);
            const toCol = Math.max(this.selectingFromCell.col, this.selectingToCell.col);
            for (let i = fromCol; i <= toCol; i++) {
                this.selectedCells.push({ row: this.selectingFromCell.row, col: i });
            }
        }

        if (this.selectedCells.length > 1) {
            // Highlight selected cells
            for (let i = 0; i < this.selectedCells.length; i++) {
                this.cellAt(this.selectedCells[i].row, this.selectedCells[i].col).classList.add('highlight-selected');
            }
        }
    }

    selectionStop(row, col) {
        console.log('Stopping cell selection (row:', row, 'col:', col, ')');

        // Update selected cells
        this.selectionUpdate(row, col);

        // Notify selected cells
        if (this.selectedCells.length > 1) {
            let selectedWord = "";
            for (let i = 0; i < this.selectedCells.length; i++) {
                selectedWord += this.entryAt(this.selectedCells[i].row, this.selectedCells[i].col);
            }
            this.notifySelected(selectedWord);
        }

        // Reset dragging state
        this.isSelecting = false;
        this.selectingFromCell = null;
        this.selectingToCell = null;
        this.selectedCells = [];
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