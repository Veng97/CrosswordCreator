export const CellType = {
    CHAR: 'char',
    STAR: 'star',
    HINT: 'hint',
    EMPTY: 'empty',
    BLOCKED: 'blocked',
    ARROW: 'arrow',
};

export const HighlightType = {
    SELECTED: 'highlight-selected',
    VERTICAL: 'highlight-vertical',
    HORIZONTAL: 'highlight-horizontal',
    SECRET: 'highlight-secret',
};

export const ArrowType = {
    LEFT: 'arrow-left',
    RIGHT: 'arrow-right',
    UP: 'arrow-up',
    DOWN: 'arrow-down',
    UP_RIGHT: 'arrow-up-right',
    UP_LEFT: 'arrow-up-left',
    DOWN_RIGHT: 'arrow-down-right',
    DOWN_LEFT: 'arrow-down-left',
    RIGHT_UP: 'arrow-right-up',
    RIGHT_DOWN: 'arrow-right-down',
    LEFT_UP: 'arrow-left-up',
    LEFT_DOWN: 'arrow-left-down',
};


export class Cell {
    // Private fields
    #type = CellType.EMPTY
    #data = '';
    #callbacks = [];

    constructor({ data, type } = { data: '', type: CellType.EMPTY }) {
        // Create the cell element
        this.element = document.createElement('div');
        this.element.classList.add('cell');
        this.element.contentEditable = true;

        // Set the data and type
        this.setData(data);
        this.setType(type);

        // Add event listeners
        this.element.addEventListener('input', this.onInput.bind(this));
        this.element.addEventListener('keydown', this.onKeydown.bind(this));
    }

    onKeydown(event) {
        // Enable deleting cell content with delete or backspace keys
        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (this.element.children.length === 0) {
                // If the cell contains a single character; delete the character.
                // Note: Erasing the cell content changes the cell to an empty cell, so we need to notify changes.
                if (this.element.textContent.length === 1) {
                    event.preventDefault(); // Prevents the default behavior of the Delete/Backspace key which would otherwise delete another character.
                    this.setData('', true);
                    this.setType(CellType.EMPTY);
                    return;
                }
            }
            else if (this.element.children.length >= 1) {
                // If the cell contains upper/lower cells; delete the selected cell and focus on the remaining one. 
                // Note: The remaining cell should still be a hint, so we don't need to notify changes.
                const activeChild = document.activeElement;
                if (activeChild.textContent === '') {
                    event.preventDefault(); // Prevents the default behavior of the Delete/Backspace key which would potentially delete another character or an entire div.
                    activeChild.remove();
                    this.setData(this.element.textContent, true);
                    return;
                }
            }
        }

        // Prevents the default behavior of the Enter key. In some cases this would otherwise create nested <div> elements.
        if (event.key === 'Enter') {
            event.preventDefault();
            return;
        }
    }

    onInput(event) {
        // Check for blocked cell
        if (event.data === '#') {
            event.preventDefault();
            this.setType(CellType.BLOCKED);
            this.setData('#');
            return;
        }

        // Convert to/from star cell
        if (event.data === '*') {
            // From char to star
            if (this.#type === CellType.CHAR) {
                event.preventDefault();
                this.setType(CellType.STAR);
                this.setData(this.element.innerHTML.replace('*', ''));
                return;

            }
            // From star to char 
            else if (this.#type === CellType.STAR) {
                event.preventDefault();
                this.setType(CellType.CHAR);
                this.setData(this.element.innerHTML.replace('*', ''));
                return;
            }
        }

        // Convert to arrow cell
        if (Object.values(ArrowType).includes(this.element.innerHTML)) {
            event.preventDefault();
            this.setType(CellType.ARROW);
            this.setData(this.element.innerHTML);
            return;
        }

        // Check for empty cell
        if (this.element.children.length === 0 && this.element.textContent.length === 0) {
            this.setType(CellType.EMPTY);
        }
        // Check for char cell
        else if (this.element.children.length === 0 && this.element.textContent.length === 1) {
            this.setType(CellType.CHAR);
        }
        // Check for hint cell
        else if (this.element.children.length > 0 || this.element.textContent.length > 1) {
            this.setType(CellType.HINT);
        }

        // Split the cell into two cells if it contains a pipe or slash character
        if (this.element.children.length === 0 && (event.data === '|' || event.data === '/')) {

            // Replace any '/' characters with '|' characters for consistency
            const innerHTML = this.element.innerHTML.replace('/', '|');

            // Replace the cell with the upper/lower cells
            this.element.innerHTML = '';
            this.element.contentEditable = false;
            this.element.appendChild(document.createElement('div'));
            this.element.appendChild(document.createElement('div'));

            // Extract the text for the first and second elements
            const index_of_split = innerHTML.indexOf('|');
            const upperText = innerHTML.substring(0, index_of_split);
            const lowerText = innerHTML.substring(index_of_split + 1, innerHTML.length);

            // Fill the upper and lower cells with the extracted text
            if (upperText) {
                this.element.firstChild.textContent = upperText;
            }
            if (lowerText) {
                this.element.lastChild.textContent = lowerText;
            }
            this.element.firstChild.contentEditable = true;
            this.element.lastChild.contentEditable = true;
            this.element.lastChild.focus();

            this.setType(CellType.HINT);
        }

        if (this.element.children.length === 1) {
            this.setData(this.element.textContent, true);
        }

        // Update the data of the cell
        this.setData(this.element.innerHTML);
    }

    setData(data, refocus = false) {
        // This is a utility method to set the data of the cell and update the innerHTML at the same time.
        // Since the innerHTML might be already up-to-date, we only update it if the data has changed to avoid
        // unnecessary re-rendering and potential loss of cursor focus.
        if (this.element.innerHTML !== data) {
            this.element.innerHTML = data;
        }

        // Disable contentEditable if the cell is split into upper/lower cells
        this.element.contentEditable = (this.element.children.length < 2);

        // Refocus the cell if requested
        if (refocus) {
            this.element.focus();
        }

        // Notify changes
        this.#data = data;
        this.notifyChanges();
    }

    setType(type) {
        // Note: If changing the type/data of the cell, this function should be called before 'setData' to
        // ensure the 'notifyChanges' function is called with the correct type.
        if (!Object.values(CellType).includes(type)) {
            throw new Error('Invalid cell type: ' + type);
        }

        this.element.classList.toggle('char', (type === CellType.CHAR || type === CellType.STAR || type === CellType.EMPTY));
        this.element.classList.toggle('star', type === CellType.STAR);
        this.element.classList.toggle('hint', type === CellType.HINT);
        this.element.classList.toggle('blocked', type === CellType.BLOCKED);

        if (type === CellType.ARROW) {
            this.element.classList.add('arrow');
            this.element.setAttribute('direction', this.#data);
        } else {
            this.element.classList.remove('arrow');
            this.element.removeAttribute('direction');
        }

        this.#type = type;
    }

    getType() {
        return this.#type;
    }

    getChar(show_non_char = false) {
        if (!this.isChar()) {
            return show_non_char ? '_' : '';
        }
        return this.#data.toUpperCase();
    }

    isChar() {
        return this.#type === CellType.CHAR || this.#type === CellType.STAR || this.#type === CellType.EMPTY;
    }

    addHighlight(type = HighlightType.SELECTED) {
        if (!Object.values(HighlightType).includes(type)) {
            throw new Error('Invalid highlight type: ' + type);
        }
        this.element.classList.add(type);
    }

    clearHighlights() {
        for (const type of Object.values(HighlightType)) {
            this.element.classList.remove(type);
        }
    }

    // Change observer
    onChanges(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!this.#callbacks) this.#callbacks = [];
        this.#callbacks.push(callback);
    }

    notifyChanges() {
        if (!this.#callbacks) return;
        for (let i = 0; i < this.#callbacks.length; i++) {
            this.#callbacks[i]();
        }
    }

    // Serialization and Deserialization Methods
    toStruct() {
        return {
            type: this.#type,
            data: this.#data
        };
    }

    fromStruct(struct) {
        this.#type = struct.type;
        this.#data = struct.data;
    }
}