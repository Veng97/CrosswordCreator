
const WORD_PATTERN_URL = '/help/pattern';
const WORD_SYNONYM_URL = '/help/synonym';

export class Helper {
    constructor(list_id, msg_id, grid, search) {
        this.list = document.getElementById(list_id);
        this.msg = document.getElementById(msg_id);
        this.grid = grid;
        this.search = search;
        this.data = [];
    }

    async askWord(word) {
        // If pattern contains '_' search for synonyms
        if (word.includes('_')) {
            this.searchPattern(word);
        } else {
            this.searchSynonyms(word);
        }
    }

    async searchPattern(word) {
        this.msg.textContent = `Searching pattern: ${word}`;
        console.log('Searching pattern:', word);
        try {
            const response = await fetch(WORD_PATTERN_URL + '/' + word);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.draw();
        } catch (error) {
            console.error('Error searching pattern:', error);
        }
    }

    async searchSynonyms(word) {
        this.msg.textContent = `Searching synonyms: ${word}`;
        console.log('Searching synonyms:', word);
        try {
            const response = await fetch(WORD_SYNONYM_URL + '/' + word);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.draw();
        } catch (error) {
            console.error('Error searching synonyms:', error);
        }
    }

    draw() {
        this.msg.textContent = `${this.data.length} words found`;
        this.list.innerHTML = '';
        this.data.forEach(word => this.drawEntry(word));
    }

    drawEntry(word) {
        const li = document.createElement('li');

        // Create the span to display the location count
        const wordLength = document.createElement('span');
        wordLength.className = 'count';
        wordLength.textContent = word.length;

        // Add the word as the text content of the li
        const wordText = document.createElement('span');
        wordText.className = 'word';
        wordText.textContent = word;

        // Add click event listener to the li element
        li.addEventListener('click', () => this.search.highlightWordLocations(word));

        li.appendChild(wordText);
        li.appendChild(wordLength);

        this.list.appendChild(li);
    }

};