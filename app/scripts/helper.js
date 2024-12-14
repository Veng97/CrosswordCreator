const axios = require('axios');
const cheerio = require('cheerio');

// Base Helper Class
class Helper {
    /**
     * Helper class to get synonyms and patterns from external APIs.
     * This class implements a cache for the results to avoid making the same request multiple times.
     */
    constructor() {
        this.patterns = {}; // Cache for patterns
        this.synonyms = {}; // Cache for synonyms
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'http://google.com',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
        };
    }

    async request(url) {
        try {
            const response = await axios.get(url, { headers: this.headers });
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
class DanishHelper extends Helper {
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
class EnglishHelper extends Helper {
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

async function askWord(language, word) {
    if (!HELPERS[language]) {
        throw new Error(`Language '${language}' is not supported.`);
    }
    return HELPERS[language].askWord(word);
}

// Example usage
(async () => {
    try {
        const result = await askWord("english", "happy");
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
