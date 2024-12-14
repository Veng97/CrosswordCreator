const axios = require('axios');
const cheerio = require('cheerio');

// Base Helper Class
class BaseHelper {
    /**
     * Helper class to get synonyms and patterns from external APIs.
     * This class implements a cache for the results to avoid making the same request multiple times.
     */
    constructor() {
        this.patterns = {}; // Cache for patterns
        this.synonyms = {}; // Cache for synonyms

    }

    async request(url) {
        try {
            const response = await axios.get(url);
            return response;
        } catch (error) {
            console.error(`Error making request to ${url}:`, error);
            return null;
        }
    }

    async askWord(word) {
        if (word.includes("_")) {
            if (this.patterns[word]) {
                return this.patterns[word];
            }
            this.patterns[word] = await this.askPattern(word);
            return this.patterns[word];
        } else {
            if (this.synonyms[word]) {
                return this.synonyms[word];
            }
            this.synonyms[word] = await this.askSynonym(word);
            return this.synonyms[word];
        }
    }

    async askSynonym(synonym) {
        throw new Error("askSynonym method must be implemented in a derived class.");
    }

    async askPattern(pattern) {
        throw new Error("askPattern method must be implemented in a derived class.");
    }
}

// DanishHelper Class
class DanishHelper extends BaseHelper {
    /**
     * Connects to https://krydsordexperten.dk/ to get synonyms and patterns for Danish words.
     */
    async askSynonym(synonym) {
        // Replace Danish characters (only necessary for synonyms)
        synonym = synonym.replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa");

        const response = await this.request(`https://krydsordexperten.dk/krydsord/${synonym}`);
        return this.parseResponse(response);
    }

    async askPattern(pattern) {
        const response = await this.request(`https://krydsordexperten.dk/ord/${pattern}`);
        return this.parseResponse(response);
    }

    parseResponse(response) {
        if (!response || response.status !== 200) {
            return [];
        }

        const words = [];
        const $ = cheerio.load(response.data);

        $(".solution-item").each((_, element) => {
            const characters = $(element).find(".character");
            let wordWithNumbers = "";
            characters.each((_, charElement) => {
                wordWithNumbers += $(charElement).text();
            });
            words.push(wordWithNumbers.replace(/\d+/g, "")); // Remove numbers
        });

        return words;
    }
}

// EnglishHelper Class
class EnglishHelper extends BaseHelper {
    /**
     * Connects to https://www.datamuse.com/api/ to get synonyms and patterns for English words.
     */
    async askSynonym(synonym) {
        const response = await this.request(`https://api.datamuse.com/words?ml=${synonym}`);
        return this.parseResponse(response);
    }

    async askPattern(pattern) {
        pattern = pattern.replace(/_/g, "?"); // Datamuse uses '?' as a wildcard

        const response = await this.request(`https://api.datamuse.com/words?sp=${pattern}`);
        return this.parseResponse(response);
    }

    parseResponse(response) {
        if (!response || response.status !== 200) {
            return [];
        }

        return response.data.map(entry => entry.word);
    }
}

// Factory Function
const HELPERS = {
    danish: new DanishHelper(),
    english: new EnglishHelper()
};

export class Helper {
    constructor(list_id, msg_id, search) {
        this.list = document.getElementById(list_id);
        this.msg = document.getElementById(msg_id);
        this.search = search;
        this.data = [];
    }

    async askWord(language, word) {
        if (!HELPERS[language]) {
            throw new Error(`Language '${language}' is not supported.`);
        }
        console.log('Requesting: ' + word + ' (' + language + ')');
        this.data = await HELPERS[language].askWord(word);
        this.draw();
    }

    draw() {
        if (!this.data) {
            this.msg.textContent = 'Hmm, something failed :(';
            return;
        }
        console.log('Drawing:', this.data);
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