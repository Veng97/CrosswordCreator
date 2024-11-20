import { loadGridData, saveGridData, generateEmptyGrid, addToGrid, removeFromGrid, selectGridData } from './grid.js';
import { highlightWordLocations, countWordLocations, clearHighlights } from './highlight.js';

import { loadDictionary, addDictionaryEntry, refreshDictionaryLocations } from './dictionary.js';

const gridContainer = document.getElementById('grid-container');

// Load empty grid
generateEmptyGrid(gridContainer, 10, 10);

// Grid controls
document.getElementById('add-row').addEventListener('click', () => addToGrid(gridContainer, 'row'));
document.getElementById('add-column').addEventListener('click', () => addToGrid(gridContainer, 'column'));
document.getElementById('remove-row').addEventListener('click', () => removeFromGrid(gridContainer, 'row'));
document.getElementById('remove-column').addEventListener('click', () => removeFromGrid(gridContainer, 'column'));

// File controls
const gridSelector = document.getElementById('select-grid-file');
const loadGridBtn = document.getElementById('load-grid-file');
const saveGridBtn = document.getElementById('save-grid-file');
loadGridBtn.addEventListener('click', () => loadGridData(gridContainer, `/puzzles/load/${gridSelector.value}`));
saveGridBtn.addEventListener('click', async () => saveGridData(gridContainer, `/puzzles/save/${gridSelector.value}`)); 
selectGridData(gridSelector); // Populates dropdown with JSON files (on page load)

// Word controls
const wordSearch = document.getElementById('word-search');
document.getElementById('word-search-btn').addEventListener('click', () => highlightWordLocations(gridContainer, wordSearch.value));
wordSearch.addEventListener('input', () => clearHighlights(gridContainer));

// Dictionary controls
const dictionaryEntry = document.getElementById('dictionary-entry');
const dictionaryEntries = document.getElementById('dictionary-entries');
document.getElementById('dictionary-entry-btn').addEventListener('click', () => addDictionaryEntry(gridContainer, dictionaryEntries, dictionaryEntry.value));
loadDictionary(gridContainer, dictionaryEntries); // Load dictionary entries (on page load)

const intervalId = setInterval(() => refreshDictionaryLocations(gridContainer, dictionaryEntries), 1000);