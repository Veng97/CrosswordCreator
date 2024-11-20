import { highlightWordLocations, countWordLocations } from './highlight.js';

export let dictionaryData = [];

const DICTIONARY_LOAD_URL = '/dictionary/load';
const DICTIONARY_SAVE_URL = '/dictionary/save';

export async function loadDictionary(dictionaryEntries) {
    try {
        const response = await fetch(DICTIONARY_LOAD_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dictionaryData = await response.json();
        drawDictionary(dictionaryEntries);
    } catch (error) {
        console.error('Error loading dictionary:', error);
    }
}

export async function saveDictionary() {
    try {
        const response = await fetch(DICTIONARY_SAVE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dictionaryData)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error('Error saving dictionary:', error);
    }
}

export async function addDictionaryEntry(dictionaryEntries, word) {
    if (!word) return; // Don't add empty strings
    if (dictionaryData.includes(word)) return; // Don't add duplicates
    dictionaryData.push(word);
    drawDictionaryEntry(dictionaryEntries, word); // Draw only the new entry
    saveDictionary();
}

export async function deleteDictionaryEntry(dictionaryEntries, word) {
    dictionaryData = dictionaryData.filter(data => data !== word);
    drawDictionary(dictionaryEntries);
    saveDictionary();
}

export async function drawDictionary(dictionaryEntries) {
    dictionaryEntries.innerHTML = '';
    dictionaryData.forEach(word => drawDictionaryEntry(dictionaryEntries, word));
}

export async function refreshDictionaryLocations(gridContainer, dictionaryEntries) {    
    dictionaryEntries.querySelectorAll('li').forEach((element) => {
        // Update the location count
        const wordElement = element.querySelector('.word');
        const countElement = element.querySelector('.count');
        countElement.textContent = countWordLocations(gridContainer, wordElement.textContent);
    });
}

function drawDictionaryEntry(dictionaryEntries, word) {
    const li = document.createElement('li');

    // Create the remove button and position it to the left
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', () => deleteDictionaryEntry(dictionaryEntries, word));
    
    // Create the span to display the location count
    const locationCount = document.createElement('span');
    locationCount.className = 'count';
    locationCount.textContent = '0';

    // Add the word as the text content of the li
    const wordText = document.createElement('span');
    wordText.className = 'word';
    wordText.textContent = word;

    li.appendChild(removeButton);
    li.appendChild(wordText);
    li.appendChild(locationCount);

    dictionaryEntries.appendChild(li);
}