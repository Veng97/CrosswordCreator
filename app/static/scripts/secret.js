import { CellType, HighlightType } from './cell.js';

export class Secret {
    constructor(grid, id) {
        this.grid = grid;
        this.container = document.getElementById(id);

        // Highlight cells that make up the secret
        this.container.addEventListener('click', () => {
            console.log('Highlighting secret');
            const rows = this.grid.height();
            const cols = this.grid.width();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = this.grid.cellAt(r, c);
                    if (cell.getType() === CellType.STAR) {
                        cell.addHighlight(HighlightType.SECRET);
                    }
                }
            }
        });

        // Remove highlight when leaving the secret
        this.container.addEventListener('exit', () => {
            console.log('Removing secret highlight');
            const rows = this.grid.height();
            const cols = this.grid.width();
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = this.grid.cellAt(r, c);
                    if (cell.getType() === CellType.STAR) {
                        cell.clearHighlights();
                    }
                }
            }
        });
    };

    update() {
        console.log('Updating secret');

        const rows = this.grid.height();
        const cols = this.grid.width();

        // Find all marked cells
        let secret = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.grid.cellAt(r, c);
                if (cell.getType() === CellType.STAR) {
                    secret += cell.getChar(true);
                }
            }
        }

        // Hide secret if no marked cells exist
        if (secret === '') {
            this.container.style.display = 'none';
            return;
        }

        this.container.style.display = 'block';
        this.container.innerHTML = secret;
    }
};