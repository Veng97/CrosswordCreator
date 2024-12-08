from requests import Response, get
from bs4 import BeautifulSoup
from regex import sub


#########################
# Base Helper Class
#########################
class Helper:
    """
    Helper class to get synonyms and patterns from external API's.
    The following methods should be implemented:

    askSynonym(synonym: str) -> list[str]: Should return a list of synonyms for the given synonym.
    askPattern(pattern: str) -> list[str]: Should return a list of words that matches the given pattern

    The class implements a cache for the results to avoid making the same request multiple times.
    """

    def __init__(self):
        self.patterns: dict[str, list[str]] = {}
        self.synonyms: dict[str, list[str]] = {}
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'http://google.com',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'DNT': '1',
        }

    def request(self, url: str) -> Response:
        return get(url, headers=self.headers)

    def askWord(self, word: str) -> list[str]:
        if "_" in word:
            if word in self.patterns:
                return self.patterns[word]
            self.patterns[word] = self.askPattern(word)
            return self.patterns[word]
        else:
            if word in self.synonyms:
                return self.synonyms[word]
            self.synonyms[word] = self.askSynonym(word)
            return self.synonyms[word]

    def askSynonym(self, synonym: str):
        raise NotImplementedError

    def askPattern(self, pattern: str):
        raise NotImplementedError


#########################
# Derived Helper Classes
#########################
class DanishHelper(Helper):
    def askSynonym(self, synonym: str) -> list[str]:
        # Replace Danish characters (only necessary for synonyms)
        synonym = synonym.replace("æ", "ae").replace("ø", "oe").replace("å", "aa")

        response = self.request(f"https://krydsordexperten.dk/krydsord/{synonym}")
        return self.__parseResponse(response)

    def askPattern(self, pattern: str) -> list[str]:
        response = self.request(f"https://krydsordexperten.dk/ord/{pattern}")
        return self.__parseResponse(response)

    def __parseResponse(self, response: Response) -> list[str]:
        # Helper function to grab words from the HTML from krydsordexperten.dk
        if not response.ok:
            return []

        words: list[str] = []

        soup = BeautifulSoup(response.text, "html.parser")
        solution_items = soup.find_all("div", class_="solution-item")
        for item in solution_items:
            characters = item.find_all("div", class_="character")
            word_with_numbers = ''.join([character.text for character in characters])
            words.append(sub(r'\d+', '', word_with_numbers))

        return words


#########################
# Factory Function
#########################
HELPERS = {
    "danish": DanishHelper()
}


def askWord(language: str, word: str) -> list[str]:
    if language not in HELPERS:
        raise ValueError(f"Language '{language}' is not supported.")
    return HELPERS[language].askWord(word)
