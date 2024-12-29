const HELP_URL = '/help';

export class Helper {
    // Private fields
    #cache = new Map(); // To store the cache

    constructor(list_id, msg_id, search) {
        this.list = document.getElementById(list_id);
        this.msg = document.getElementById(msg_id);
        this.search = search;
        this.data = [];
    }

    async askWord(language, word) {
        if (!word) {
            return
        }

        this.msg.textContent = 'Looking for: ' + word;

        // Check if the data is in the cache
        const cacheKey = `${language}-${word}`;
        if (this.#cache.has(cacheKey)) {
            this.list.innerHTML = this.#cache.get(cacheKey).innerHTML;
            this.msg.textContent = `${this.list.children.length} words found`;
            return;
        }

        try {
            const response = await fetch(HELP_URL + '/' + language + '/' + word);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error:', error);
            return;
        }

        // Clear the list and draw the new entries
        this.list.innerHTML = '';
        this.data.forEach(word => this.addWordToList(word));
        this.msg.textContent = `${this.list.children.length} words found`;

        // Store the list in the cache
        this.#cache.set(cacheKey, this.list.cloneNode(true));
    }

    addWordToList(word) {
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