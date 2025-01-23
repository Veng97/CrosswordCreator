import './scripts/thirdparty/html2canvas.min.js';

import { Dictionary } from './scripts/dictionary.js';
import { Grid } from './scripts/grid.js';
import { Helper } from './scripts/helper.js';
import { Search } from './scripts/search.js';
import { Secret } from './scripts/secret.js';

// Initialize objects
const grid = new Grid('grid-container');
const secret = new Secret(grid, 'secret-container');
const search = new Search(grid);
const dictionary = new Dictionary('dictionary-list', 'dictionary-msg', search);
const helper = new Helper('helper-list', 'helper-msg', search);

// Page elements
const wordSearch = document.getElementById('word-search');
const wordAdd = document.getElementById('word-add');
const wordAskLanguage = document.getElementById('word-ask-language');
const wordAsk = document.getElementById('word-ask');

// Register callbacks
grid.onChanges(() => secret.update());
grid.onChanges(() => dictionary.update());
grid.onSelected((selectedWord) => helper.askWord(wordAskLanguage.value, selectedWord));

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Save the grid when pressing Ctrl+S or Command+S
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        grid.saveFile();
    }
    // Load the grid when pressing Ctrl+O or Command+O
    if (event.key === 'o' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        grid.loadFile();
    }
    // Search for word when pressing Ctrl+F or Command+F
    if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        wordSearch.focus();
    }
});

// Controls
document.getElementById('load-grid-file').addEventListener('click', async () => grid.loadFile());
document.getElementById('save-grid-file').addEventListener('click', async () => grid.saveFile());
document.getElementById('export').addEventListener('click', () => grid.exportGridContainer());
document.getElementById('clear').addEventListener('click', () => grid.reset());
document.getElementById('add-row').addEventListener('click', () => grid.addRow());
document.getElementById('add-col').addEventListener('click', () => grid.addColumn());
document.getElementById('remove-row').addEventListener('click', () => grid.removeRow());
document.getElementById('remove-col').addEventListener('click', () => grid.removeColumn());
document.getElementById('shift-up').addEventListener('click', () => grid.shiftUp());
document.getElementById('shift-down').addEventListener('click', () => grid.shiftDown());
document.getElementById('shift-left').addEventListener('click', () => grid.shiftLeft());
document.getElementById('shift-right').addEventListener('click', () => grid.shiftRight());

// Handle dark mode
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDarkMode) {
    document.body.classList.add('dark-mode');
}
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Search for word - in grid
wordSearch.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        search.highlightWordLocations(wordSearch.value);
    }
});

// Add word - to dictionary
wordAdd.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        dictionary.addWord(wordAdd.value)
        wordAdd.value = ''; // Clear input field
    }
});

// Ask for word
wordAsk.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        helper.askWord(wordAskLanguage.value, wordAsk.value);
    }
});

// Load dictionary entries (on page load)
dictionary.loadCache();

// Load grid data (on page load)
grid.loadCache();