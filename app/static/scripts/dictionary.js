
const CACHE_KEY = 'CrosswordCreatorDictionary';

export class Dictionary {
    constructor(list_id, msg_id, search) {
        this.list = document.getElementById(list_id);
        this.msg = document.getElementById(msg_id);
        this.search = search;
        this.data = [];
    }

    addWord(word) {
        if (!word) return; // Don't add empty strings
        if (this.data.includes(word)) return; // Don't add duplicates
        this.data.push(word);
        this.drawEntry(word);
        this.saveFile();
    }

    removeWord(word) {
        this.data = this.data.filter(value => value !== word);
        this.prune();
        this.saveFile();
    }

    draw() {
        this.msg.textContent = `${this.data.length} words stored`;
        this.list.innerHTML = '';
        this.data.forEach(word => this.drawEntry(word));
    }

    drawEntry(word) {
        const li = document.createElement('li');

        // Create the remove button and position it to the left
        const removeButton = document.createElement('img');
        removeButton.src = 'assets/remove-btn.svg';
        removeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the parent click event from being triggered
            this.removeWord(word);
        });

        // Create the span to display the location count
        const locationCount = document.createElement('span');
        locationCount.className = 'count';
        locationCount.textContent = this.search.findPossibleLocations(word).length;

        // Add the word as the text content of the li
        const wordText = document.createElement('span');
        wordText.className = 'word';
        wordText.textContent = word;

        // Add click event listener to the li element
        li.addEventListener('click', () => this.search.highlightWordLocations(word));

        li.appendChild(removeButton);
        li.appendChild(wordText);
        li.appendChild(locationCount);

        this.list.appendChild(li);
    }

    prune() {
        // Remove words that are no longer in the data
        for (let i = this.list.children.length - 1; i >= 0; i--) {
            const wordOfNth = this.list.children[i].children[1].textContent; // Selects the word span
            if (!this.data.includes(wordOfNth)) {
                this.list.children[i].remove();
            }
        }
    }

    update() {
        console.log('Updating word counts!');
        this.list.querySelectorAll('li').forEach((element) => {
            // Draw line through the word if it exists in the grid
            const wordElement = element.querySelector('.word');
            const wordExists = this.search.findExistingLocation(wordElement.textContent);
            wordElement.classList.toggle('exists', wordExists !== null);

            // Update the word count
            const countElement = element.querySelector('.count');
            if (wordExists) {
                countElement.textContent = '-';
            } else {
                countElement.textContent = this.search.findPossibleLocations(wordElement.textContent).length;
            }
        });
    }

    async loadCache() {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            console.log('Loading dict from cache!');
            this.data = JSON.parse(cachedData);
            this.draw();
        }
    }

    async saveFile() {
        // Save in local storage (cache)
        console.log('Saving dict to cache!');
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.data));
    }
};
