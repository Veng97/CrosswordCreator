function debounce(callback, delay) {
    // Debounce function to limit the rate at which a function is called. Delay is in milliseconds.
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback.apply(this, args), delay);
    };
}

export class Grid {
    constructor(id, width = 10, height = 10) {
        this.container = document.getElementById(id);
        this.data = Array.from({ length: height }, () => Array(width).fill(''));
        this.draw();
    }

    width = () => this.data[0].length;
    height = () => this.data.length;

    cells = () => this.container.querySelectorAll('.cell');
    cellAt = (row, col) => this.container.children[row * this.width() + col];

    symbolAt(row, col) {
        const entry = this.data[row][col];
        if (entry.length !== 1 | entry === '#') {
            return "_";
        } else {
            return entry;
        }
    }

    draw() {
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.width()}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.height()}, 1fr)`;

        this.data.forEach((elements, row) => {
            elements.forEach((value, col) => {
                this.container.appendChild(this.drawCell(value, row, col));
            });
        });

        this.notifyChanges();
    }

    drawCell(value, row, col) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.value = value;
        if (input.value === '#') {
            cell.classList.add('empty');
        }

        // Format input on change 
        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase();
            this.data[row][col] = input.value;
            if (input.value === '#') {
                cell.classList.add('empty');
            } else if (input.value !== '#') {
                cell.classList.remove('empty');
            }
            this.clearHighlights();
            this.notifyChanges();
        });

        // Double click to toggle empty cell
        input.addEventListener('dblclick', () => {
            cell.classList.toggle('empty');
            input.value = cell.classList.contains('empty') ? '#' : '';
            this.data[row][col] = input.value;

            this.notifyChanges();
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

        // Mouse events for dragging
        cell.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isDragging = true;
                this.dragStartCell = { row, col };
                this.dragStopCell = { row, col };
                this.selectedCells = [];
            }
        });

        cell.addEventListener('mousemove', debounce((event) => {
            if (!this.isDragging) {
                return;
            }

            // Get element that matches the current mouse position
            const draggedInput = document.elementFromPoint(event.clientX, event.clientY);
            if (!draggedInput || draggedInput.tagName !== 'INPUT') {
                return;
            }

            // Get the index of the dragged cell
            let draggedIndex = -1;
            for (let i = 0; i < this.container.children.length; i++) {
                if (this.container.children[i].contains(draggedInput.parentElement)) {
                    draggedIndex = i;
                    break;
                }
            }
            if (draggedIndex === -1) {
                return;
            }

            // Remove previous highlights
            for (let i = 0; i < this.container.children.length; i++) {
                this.container.children[i].classList.remove('highlight-selected');
            }

            // Update the stop cell
            this.dragStopCell.row = Math.floor(draggedIndex / this.width());
            this.dragStopCell.col = draggedIndex % this.width();

            // Update selected cells (either horizontally or vertically)
            this.selectedCells = [];
            if (Math.abs(this.dragStartCell.row - this.dragStopCell.row) > Math.abs(this.dragStartCell.col - this.dragStopCell.col)) {
                const fromRow = Math.min(this.dragStartCell.row, this.dragStopCell.row);
                const toRow = Math.max(this.dragStartCell.row, this.dragStopCell.row);
                for (let i = fromRow; i <= toRow; i++) {
                    this.selectedCells.push({ row: i, col: this.dragStartCell.col });
                }
            } else {
                const fromCol = Math.min(this.dragStartCell.col, this.dragStopCell.col);
                const toCol = Math.max(this.dragStartCell.col, this.dragStopCell.col);
                for (let i = fromCol; i <= toCol; i++) {
                    this.selectedCells.push({ row: this.dragStartCell.row, col: i });
                }
            }

            // Highlight selected cells
            for (let i = 0; i < this.selectedCells.length; i++) {
                this.cellAt(this.selectedCells[i].row, this.selectedCells[i].col).classList.add('highlight-selected');
            }
        }, 20)); // Debounce 20ms to limit the rate of mousemove events

        cell.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                // Notify selected cells
                let selectedWord = "";
                for (let i = 0; i < this.selectedCells.length; i++) {
                    selectedWord += this.symbolAt(this.selectedCells[i].row, this.selectedCells[i].col);
                }
                this.notifySelected(selectedWord);

                // Reset dragging state
                this.isDragging = false;
                this.dragStartCell = null;
                this.dragStopCell = null;
                this.selectedCells = [];
            }
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