// import { loadGridData, saveGridData, generateEmptyGrid, addToGrid, removeFromGrid, selectGridData } from './grid.js';
import { Grid } from './grid.js';
import { Highlight } from './highlight.js';
// import { highlightWordLocations, clearHighlights } from './highlight.js';
// import { loadDictionary, addDictionaryEntry, refreshDictionaryLocations } from './dictionary.js';

// Initialize objects
const grid = new Grid('grid-container');
const highlight = new Highlight(grid);

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
wordSearch.addEventListener('input', () => highlight.clearHighlights());
wordSearch.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        highlight.highlightWordLocations(wordSearch.value);
    }
});

// // Dictionary controls
// const dictionaryEntry = document.getElementById('dictionary-entry');
// const dictionaryEntries = document.getElementById('dictionary-entries');
// document.getElementById('dictionary-entry-btn').addEventListener('click', () => addDictionaryEntry(gridContainer, dictionaryEntries, dictionaryEntry.value));
// loadDictionary(gridContainer, dictionaryEntries); // Load dictionary entries (on page load)

// const intervalId = setInterval(() => refreshDictionaryLocations(gridContainer, dictionaryEntries), 1000);