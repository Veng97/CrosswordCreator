import { Cell, HighlightType } from './cell.js';

const GRID_SAVE_URL = 'grid/save';
const GRID_LOAD_URL = 'grid/load';

// Controls the pixel scale of the exported image (higher values result in higher resolution images)
const IMAGE_EXPORT_SCALE = 4;


export class Grid {
    constructor(id, width = 10, height = 10) {
        this.container = document.getElementById(id);

        // Save the grid when pressing Ctrl+S
        this.container.addEventListener('keydown', (event) => {
            if (event.key === 's' && event.ctrlKey) {
                event.preventDefault();
                this.saveFile();
            }
        });

        // Load the grid when pressing Ctrl+O
        this.container.addEventListener('keydown', (event) => {
            if (event.key === 'o' && event.ctrlKey) {
                event.preventDefault();
                this.loadFile();
            }
        });

        // Clear highlights on any key press (except while selecting)
        this.container.addEventListener('keydown', (_) => {
            if (!this.isSelecting) {
                this.clearHighlights();
            }
        });

        // Initialize grid with default cells
        this.cells = Array.from({ length: height }, () => Array.from({ length: width }, () => new Cell()));
        this.draw();
    }

    width = () => this.cells[0].length;
    height = () => this.cells.length;

    charAt = (row, col) => this.cells[row][col].getChar();
    cellAt = (row, col) => this.cells[row][col];

    draw() {
        this.container.innerHTML = '';

        this.container.style.gridTemplateColumns = `repeat(${this.width()}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.height()}, 1fr)`;

        for (let row = 0; row < this.height(); row++) {
            for (let col = 0; col < this.width(); col++) {
                const cell = this.cells[row][col];

                // Notify changes when the cell changes
                cell.onChanges(() => this.notifyChanges());

                // Add cell to the grid
                this.container.appendChild(cell.element);

                // Start cell selection on left mouse down
                cell.element.addEventListener('mousedown', (event) => {
                    if (event.button === 0) {
                        this.selectionStart(row, col);
                    }
                });

                // End cell selection on left mouse up
                cell.element.addEventListener('mouseup', (event) => {
                    if (event.button === 0) {
                        this.selectionStop(row, col);
                    }
                });

                // Update cell selection on mouse enter
                cell.element.addEventListener('mouseenter', () => {
                    if (this.isSelecting) {
                        this.selectionUpdate(row, col);
                    }
                });

                // Disable default selection behavior to allow cell selection
                cell.element.addEventListener('dragstart', (event) => {
                    event.preventDefault();
                });

                // Arrow key navigation
                cell.element.addEventListener('keydown', (event) => {

                    // Go to the next cell based on the arrow key pressed
                    let nextRow = row;
                    let nextCol = col;
                    switch (event.key) {
                        case 'ArrowUp':
                            nextRow = row - 1;
                            break;
                        case 'ArrowDown':
                            nextRow = row + 1;
                            break;
                        case 'ArrowLeft':
                            nextCol = col - 1;
                            break;
                        case 'ArrowRight':
                            nextCol = col + 1;
                            break;
                        default:
                            return;
                    }

                    // This prevents the cursor from moving around ilogically when using arrow keys
                    event.preventDefault();

                    // Wrap to grid
                    nextRow = nextRow < 0 ? this.height() - 1 : nextRow % this.height();
                    nextCol = nextCol < 0 ? this.width() - 1 : nextCol % this.width();

                    const nextCell = this.cells[nextRow][nextCol];

                    if (cell.element.children.length > 0) {
                        const activeChild = document.activeElement;

                        // Check if we should move within the split cells 
                        if (event.key === 'ArrowUp' && activeChild === cell.element.lastChild) {
                            console.log('ArrowUp');
                            cell.element.firstChild.focus();
                            return;
                        }
                        if (event.key === 'ArrowDown' && activeChild === cell.element.firstChild) {
                            cell.element.lastChild.focus();
                            return;
                        }

                        // Check if we can move to a split cell in the next cell
                        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                            if (nextCell.element.children.length > 0) {
                                if (activeChild === cell.element.firstChild) {
                                    nextCell.element.firstChild.focus();
                                    return;
                                }
                                if (activeChild === cell.element.lastChild) {
                                    nextCell.element.lastChild.focus();
                                    return;
                                }
                            }
                        }
                    }

                    if (nextCell.element.children.length === 0) {
                        // Focus on the next cell
                        nextCell.element.focus();
                    } else {
                        // Focus on the last child (when entering from: ArrowUp)
                        if (event.key === 'ArrowUp') {
                            nextCell.element.lastChild.focus();
                        }
                        // Focus on the first child (when entering from: ArrowDown, ArrowLeft, ArrowRight)
                        else {
                            nextCell.element.firstChild.focus();
                        }
                    }

                    // Holding shift key while moving with arrow keys will start selection
                    if (event.shiftKey) {
                        if (!this.isSelecting) {
                            this.selectionStart(row, col);
                        }
                        this.selectionUpdate(nextRow, nextCol);
                    }
                });

                // End cell selection on shift up
                cell.element.addEventListener('keyup', (event) => {
                    if (event.key === 'Shift') {
                        this.selectionStop(row, col);
                    }
                });
            }
        }

        this.notifyChanges();
    }

    addRow() {
        this.cells.push(Array.from({ length: this.width() }, () => new Cell()));
        this.draw();
    }

    addColumn() {
        this.cells.forEach(row => row.push(new Cell()));
        this.draw();
    }

    removeRow() {
        if (this.height() > 1) {
            this.cells.pop();
            this.draw();
        }
    }

    removeColumn() {
        if (this.width() > 1) {
            this.cells.forEach(row => row.pop());
            this.draw();
        }
    }

    shiftLeft() {
        this.cells.forEach(row => row.push(row.shift()));
        this.draw();
    }

    shiftRight() {
        this.cells.forEach(row => row.unshift(row.pop()));
        this.draw();
    }

    shiftUp() {
        this.cells.push(this.cells.shift());
        this.draw();
    }

    shiftDown() {
        this.cells.unshift(this.cells.pop());
        this.draw();
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
        console.log('Notifying changes!');
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

    clearHighlights() {
        this.cells.forEach(row => row.forEach(cell => cell.clearHighlights()));
    }

    selectionStart(row, col) {

        // Initialize selection states
        this.isSelecting = true;
        this.selectingFromCell = { row, col };
        this.selectingToCell = { row, col };
        this.selectedCells = [];

        this.clearHighlights();
    }

    selectionUpdate(row, col) {
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

        // Update which cells are highlighted
        this.clearHighlights();
        if (this.selectedCells.length > 1) {
            for (let i = 0; i < this.selectedCells.length; i++) {
                this.cells[this.selectedCells[i].row][this.selectedCells[i].col].addHighlight(HighlightType.SELECTED);
            }
        }
    }

    selectionStop(row, col) {

        this.selectionUpdate(row, col);

        // Notify selected cells
        if (this.selectedCells.length > 1) {
            let selectedWord = "";
            for (let i = 0; i < this.selectedCells.length; i++) {
                selectedWord += this.cells[this.selectedCells[i].row][this.selectedCells[i].col].getChar(true);
            }
            this.notifySelected(selectedWord);
        }

        // Reset selection states
        this.isSelecting = false;
        this.selectingFromCell = null;
        this.selectingToCell = null;
        this.selectedCells = [];
    }

    toStruct() {
        return this.cells.map(row => row.map(cell => cell.toStruct()));
    }

    fromStruct(struct) {
        this.cells = struct.map(row => row.map(cell => new Cell(cell)));
        this.draw();
    }

    reset() {
        console.log('Resetting grid!');
        this.cells = Array.from({ length: this.height() }, () => Array.from({ length: this.width() }, () => new Cell()));
        this.draw();
    }

    async loadFile() {
        console.log('Loading grid!');
        try {
            const response = await fetch(GRID_LOAD_URL);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            this.fromStruct(await response.json());
        } catch (error) {
            console.error('Error loading grid:', error);
        }
    }

    async saveFile() {
        console.log('Saving grid!');
        try {
            const response = await fetch(GRID_SAVE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.toStruct())
            });
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            alert(await response.text());
        } catch (error) {
            console.error('Error saving grid:', error);
        }
    }

    async exportGridContainer() {
        html2canvas(this.container, {
            scale: IMAGE_EXPORT_SCALE,
            onclone: (cloneDoc) => {
                const clonedContainer = cloneDoc.getElementById('grid-container');

                // Style the container to fully display the grid
                clonedContainer.style.overflow = 'visible';
                clonedContainer.style.width = 'auto';
                clonedContainer.style.height = 'auto';
                clonedContainer.style.maxWidth = 'none';
                clonedContainer.style.maxHeight = 'none';

                // Post-process the cloned container
                for (let i = 0; i < clonedContainer.children.length; i++) {
                    if (clonedContainer.children[i].classList.contains('char')) {
                        clonedContainer.children[i].classList.add('hidden');
                    }
                }
            }
        }).then(canvas => {
            const newTab = window.open();

            // Write an empty HTML document to the new tab
            newTab.document.open();
            newTab.document.write(`<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Exported Puzzle</title>
                </head>
                <body style="margin:0"></body>
            </html>`);

            // Append the canvas to the new tab's body
            newTab.document.body.append(canvas);

            newTab.document.close();
        });
    }
}