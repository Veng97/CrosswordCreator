
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

        // Mark as empty
        cell.classList.toggle('empty', value === '#');

        // Mark as hint
        cell.classList.toggle('hint', value.length > 1 || cell.children.length !== 0);

        // Update the cell text content if it has changed (e.g. if loaded from a file)
        if (cell.textContent !== value) {
            cell.textContent = value;
        }

        // Handle cell splitting
        if (cell.children.length === 0) {
            // Check if the cell contains a pipe character; if so, split the cell into upper/lower cells
            if (value.includes('|')) {
                
                // Replace the cell with the upper/lower cells
                cell.innerHTML = '';
                cell.contentEditable = false;
                cell.appendChild(document.createElement('div'));
                cell.appendChild(document.createElement('div'));
                
                // Extract the text for the first and second elements
                const index_of_split = value.indexOf('|');
                const upperText = value.substring(0, index_of_split);
                const lowerText = value.substring(index_of_split + 1, value.length);

                // Fill the upper and lower cells with the extracted text
                if (upperText) {
                    cell.children[0].textContent = upperText;
                }
                if (lowerText) {
                    cell.children[1].textContent = lowerText;
                }
                cell.children[0].contentEditable = true;
                cell.children[1].contentEditable = true;
                cell.children[1].focus();
            }
        } 
        else if (cell.children.length === 1) {
            // Convert cell to a single cell again
            cell.innerHTML = value;
            cell.contentEditable = true;
            cell.focus();
        } 
        else if (cell.children.length === 2) {
            // Format value as upper/lower cells
            value = cell.children[0].textContent + '|' + cell.children[1].textContent;
        }

        // Update the data array with the new value
        this.data[row][col] = value;
    }

    draw() {
        this.container.innerHTML = '';

        this.container.style.gridTemplateColumns = `repeat(${this.width()}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.height()}, 1fr)`;

        this.data.forEach((elements, row) => {
            elements.forEach((value, col) => {
                this.drawCell(row, col, value);
            });
        });

        this.notifyChanges();
    }

    drawCell(row, col, value = '') {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.contentEditable = true;

        // Update entry on change 
        cell.addEventListener('input', () => {
            this.updateEntryAt(row, col, cell.textContent);
            this.clearHighlights();
            this.notifyChanges();
        });

        // Arrow key navigation
        cell.addEventListener('keydown', (event) => {
            // Enable deleting cell content with delete or backspace keys
            if (event.key === 'Delete' || event.key === 'Backspace') {
                if (cell.children.length === 0) {
                    if (cell.textContent.length === 1) {
                        event.preventDefault();
                        this.updateEntryAt(row, col, '');
                        this.clearHighlights();
                        this.notifyChanges();
                    }
                } 
                else if (cell.children.length > 1) {
                    // If the cell contains upper/lower cells; delete the selected cell and focus on the remaining one
                    const activeChild = document.activeElement;
                    if (activeChild.textContent === '') {
                        event.preventDefault();
                        activeChild.remove();
                        this.updateEntryAt(row, col, cell.textContent);
                        return;
                    }
                }
            }

            // Prevents the default behavior of the Enter key. In some cases this would otherwise create nested <div> elements
            if (event.key === 'Enter') {
                event.preventDefault();
            }

            // Navigate through the upper/lower cells
            if (cell.children.length > 0) {
                const activeChild = document.activeElement;
                if (event.key === 'ArrowUp') {
                    for (let i = 1; i < cell.children.length; i++) {
                        if (activeChild === cell.children[i]) {
                            cell.children[i-1].focus();
                            return;
                        }
                    }
                }
                if (event.key === 'ArrowDown') {
                    for (let i = 0; i < cell.children.length - 1; i++) {
                        if (activeChild === cell.children[i]) {
                            cell.children[i+1].focus();
                            return;
                        }
                    }
                }
            }

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
            const nextCell = this.container.children[nextIndex];
            if (nextCell.children.length > 0) {
                if (event.key === 'ArrowUp') {
                    // Focus on the last child
                    console.log(nextCell.children);
                    nextCell.children[nextCell.children.length - 1].focus();
                    return;
                } else {
                    // Focus on the first child (for any other direction: ArrowDown, ArrowLeft, ArrowRight)
                    nextCell.children[0].focus(); 
                    return;
                }
            } else {
                nextCell.focus();
            }

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

        cell.addEventListener('keyup', (event) => {
            if (event.key === 'Shift') {
                this.selectionStop(row, col);
            }
        });

        // Start cell selection on left mouse down
        cell.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                this.selectionStart(row, col);
            }
        });

        // End cell selection on left mouse up
        cell.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.selectionStop(row, col);
            }
        });

        // Update cell selection on mouse enter
        cell.addEventListener('mouseenter', () => {
            if (this.isSelecting) {
                this.selectionUpdate(row, col);
            }
        });

        // Disable default selection behavior to allow cell selection
        cell.addEventListener('dragstart', (event) => {
            event.preventDefault();
        });

        // Append the cell to the grid container and trigger an update
        this.container.appendChild(cell);
        this.updateEntryAt(row, col, value);
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

    shiftLeft() {
        this.data.forEach(row => row.push(row.shift()));
        this.draw();
    }

    shiftRight() {
        this.data.forEach(row => row.unshift(row.pop()));
        this.draw();
    }

    shiftUp() {
        this.data.push(this.data.shift());
        this.draw();
    }

    shiftDown() {
        this.data.unshift(this.data.pop());
        this.draw();
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
        // console.log('Starting cell selection (row:', row, 'col:', col, ')');
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
        // console.log('Stopping cell selection (row:', row, 'col:', col, ')');

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

    async exportGrid() {

    }
}