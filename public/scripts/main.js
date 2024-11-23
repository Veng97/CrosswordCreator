// import { loadGridData, saveGridData, generateEmptyGrid, addToGrid, removeFromGrid, selectGridData } from './grid.js';
import { Grid } from './grid.js';
import { Search } from './search.js';
import { Dictionary } from './dictionary.js';
import { Helper } from './helper.js';

// Initialize objects
const grid = new Grid('grid-container');
const search = new Search(grid);
const dictionary = new Dictionary('dictionary-list', grid, search);
const helper = new Helper('helper-list', grid, search);

// Register callbacks
grid.onChanges(() => search.clearHighlights());
grid.onChanges(() => dictionary.updateWordCounts());
grid.onSelected((selectedWord) => helper.askWord(selectedWord));

// Grid controls
document.getElementById('add-row').addEventListener('click', () => grid.addRow());
document.getElementById('add-column').addEventListener('click', () => grid.addColumn());
document.getElementById('remove-row').addEventListener('click', () => grid.removeRow());
document.getElementById('remove-column').addEventListener('click', () => grid.removeColumn());

// File controls
const fileSelector = document.getElementById('select-grid-file');
const loadFileBtn = document.getElementById('load-grid-file');
const saveFileBtn = document.getElementById('save-grid-file');
loadFileBtn.addEventListener('click', async () => grid.loadFile(`/puzzles/load/${fileSelector.value}`));
saveFileBtn.addEventListener('click', async () => grid.saveFile(`/puzzles/save/${fileSelector.value}`));
grid.populateFileSelector(fileSelector); // Populates dropdown with JSON files (on page load)

// Word controls
const wordSearch = document.getElementById('word-search');
wordSearch.addEventListener('input', () => search.clearHighlights());
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
dictionary.loadFile(); // Load dictionary entries (on page load)
