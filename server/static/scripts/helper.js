const HELP_URL = '/help';

export class Helper {
    constructor(list_id, msg_id, search) {
        this.list = document.getElementById(list_id);
        this.msg = document.getElementById(msg_id);
        this.search = search;
        this.data = [];
    }

    async askWord(language, word) {
        this.msg.textContent = 'Looking for: ' + word;
        try {
            const response = await fetch(HELP_URL + '/' + language + '/' + word);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            this.data = await response.json();
            this.draw();
        } catch (error) {
            console.error('Error:', error);
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