export let dictionaryData = [];

export async function loadDictionary(dictionaryEntries) {
    try {
        const response = await fetch('/dictionary/load');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        dictionaryData = await response.json();
        drawDictionary(dictionaryEntries);
    } catch (error) {
        console.error('Error loading dictionary:', error);
    }
}

export async function drawDictionary(dictionaryEntries, redraw = true) {
    if (redraw) {
        dictionaryEntries.innerHTML = '';
        dictionaryData.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => {
                deleteFromDictionary(dictionaryEntries, entry);
            });
            li.appendChild(removeButton);

            dictionaryEntries.appendChild(li);
        });
    } else {

    }
}

export async function saveDictionary() {
    try {
        const response = await fetch(url, {
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
        alert(result);
    } catch (error) {
        console.error('Error saving dictionary:', error);
    }
}

export async function addToDictionary(dictionaryEntries, entry) {
    dictionaryData.push(entry.value);
    drawDictionary(dictionaryEntries);
    entry.value = '';
    saveDictionary();
}

export async function deleteFromDictionary(dictionaryEntries, entry) {
    dictionaryData = dictionaryData.filter(word => word !== entry);
    drawDictionary(dictionaryEntries);
    saveDictionary();
}