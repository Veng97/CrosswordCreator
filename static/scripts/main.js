import { Dictionary } from './dictionary.js';
import { Grid } from './grid.js';
import { Helper } from './helper.js';
import { Search } from './search.js';
import { Secret } from './secret.js';

// Initialize objects
const grid = new Grid('grid-container');
const secret = new Secret(grid, 'secret-container');
const search = new Search(grid);
const dictionary = new Dictionary('dictionary-list', 'dictionary-msg', search);
const helper = new Helper('helper-list', 'helper-msg', search);

// Load dictionary entries (on page load)
dictionary.loadFile();

// Load grid data (on page load)
grid.loadFile();

// Register callbacks
grid.onChanges(() => dictionary.updateWordCounts());
grid.onChanges(() => secret.update());
grid.onSelected((selectedWord) => helper.askWord(selectedWord));

// Save the grid when pressing Ctrl+S
document.addEventListener('keydown', (event) => {
    if (event.key === 's' && event.ctrlKey) {
        event.preventDefault();
        grid.saveFile();
    }
});

// Load the grid when pressing Ctrl+O
document.addEventListener('keydown', (event) => {
    if (event.key === 'o' && event.ctrlKey) {
        event.preventDefault();
        grid.loadFile();
    }
});

// Grid controls
document.getElementById('add-row').addEventListener('click', () => grid.addRow());
document.getElementById('add-col').addEventListener('click', () => grid.addColumn());
document.getElementById('remove-row').addEventListener('click', () => grid.removeRow());
document.getElementById('remove-col').addEventListener('click', () => grid.removeColumn());
document.getElementById('shift-up').addEventListener('click', () => grid.shiftUp());
document.getElementById('shift-down').addEventListener('click', () => grid.shiftDown());
document.getElementById('shift-left').addEventListener('click', () => grid.shiftLeft());
document.getElementById('shift-right').addEventListener('click', () => grid.shiftRight());
document.getElementById('export').addEventListener('click', () => grid.exportGridContainer());

// File controls
const loadFileBtn = document.getElementById('load-grid-file');
const saveFileBtn = document.getElementById('save-grid-file');
loadFileBtn.addEventListener('click', async () => grid.loadFile());
saveFileBtn.addEventListener('click', async () => grid.saveFile());

// Word controls
const wordSearch = document.getElementById('word-search');
wordSearch.addEventListener('input', () => grid.clearHighlights());
wordSearch.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        search.highlightWordLocations(wordSearch.value);
    }
});

// Helper controls
const wordAsk = document.getElementById('word-ask');
wordAsk.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        helper.askWord(wordAsk.value);
    }
});

// Dictionary controls
const wordAdd = document.getElementById('word-add');
wordAdd.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        dictionary.addWord(wordAdd.value)
        wordAdd.value = ''; // Clear input field
    }
});