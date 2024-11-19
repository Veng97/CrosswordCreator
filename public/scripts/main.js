import { generateGrid, addToGrid, removeFromGrid, loadGridData, saveGridData } from './grid.js';
import { highlightWords, clearHighlights } from './highlight.js';

const gridContainer = document.getElementById('grid-container');
const jsonFileSelect = document.getElementById('json-file-select');
const loadJsonFileButton = document.getElementById('load-json-file');
const saveJsonFileButton = document.getElementById('save-json-file');
const wordSearch = document.getElementById('word-search');

// Load empty grid
generateGrid(gridContainer, 10, 10);

// Grid controls
document.getElementById('add-row').addEventListener('click', () => addToGrid(gridContainer, 'row'));
document.getElementById('add-column').addEventListener('click', () => addToGrid(gridContainer, 'column'));
document.getElementById('remove-row').addEventListener('click', () => removeFromGrid(gridContainer, 'row'));
document.getElementById('remove-column').addEventListener('click', () => removeFromGrid(gridContainer, 'column'));

// Function to populate the dropdown with JSON files
async function populateJsonFileSelect() {
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
            jsonFileSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading JSON file list:', error);
    }
}
populateJsonFileSelect();

// File controls
loadJsonFileButton.addEventListener('click', () => loadGridData(gridContainer, `/puzzles/load/${jsonFileSelect.value}`));
saveJsonFileButton.addEventListener('click', async () => saveGridData(gridContainer, `/puzzles/save/${jsonFileSelect.value}`)); 

// Word controls
document.getElementById('word-search-btn').addEventListener('click', () => highlightWords(gridContainer, wordSearch));
wordSearch.addEventListener('input', () => clearHighlights(gridContainer));
