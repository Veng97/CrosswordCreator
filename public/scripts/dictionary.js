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

export async function addDictionaryEntry(dictionaryEntries, value) {
    if (!value) return; // Don't add empty strings
    if (dictionaryData.includes(value)) return; // Don't add duplicates
    dictionaryData.push(value);
    drawDictionaryEntry(dictionaryEntries, value); // Draw only the new entry
    saveDictionary();
}

export async function deleteDictionaryEntry(dictionaryEntries, value) {
    dictionaryData = dictionaryData.filter(word => word !== value);
    drawDictionary(dictionaryEntries);
    saveDictionary();
}

export async function drawDictionary(dictionaryEntries) {
    dictionaryEntries.innerHTML = '';
    dictionaryData.forEach(value => drawDictionaryEntry(dictionaryEntries, value));
}

function drawDictionaryEntry(dictionaryEntries, value) {
    const li = document.createElement('li');
    li.textContent = value;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.addEventListener('click', () => deleteDictionaryEntry(dictionaryEntries, value));
    li.appendChild(removeButton);

    dictionaryEntries.appendChild(li);
}