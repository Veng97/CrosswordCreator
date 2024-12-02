import os
import sys
import json
import requests
import regex
import argparse
from waitress import serve
from flask import Flask, request, send_file, send_from_directory, jsonify
from bs4 import BeautifulSoup

HOST = '127.0.0.1'
PORT = 5000
PATH_TO_GRID = 'grid.json'
PATH_TO_DICT = 'dict.json'


# Cache for pattern/synonym queries
CACHE = {
    "patterns": {},
    "synonyms": {},
}

# Directory to serve static/public files from
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'public')

app = Flask(__name__)


@app.route('/')
def serve_index():
    return send_from_directory(STATIC_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(STATIC_DIR, path)


@app.route('/grid/load')
def grid_load():
    try:
        return send_file(PATH_TO_GRID)
    except Exception as e:
        print(f'Failed to load grid: {e}')
        return 'Failed to load grid', 500


@app.route('/grid/save', methods=['POST'])
def grid_save():
    try:
        with open(PATH_TO_GRID, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Saved {PATH_TO_GRID}!', 200
    except Exception as e:
        print(f'Faile to save grid: {e}')
        return 'Faile to save grid', 500


@ app.route('/dictionary/load')
def dictionary_load():
    try:
        return send_file(PATH_TO_DICT, mimetype='application/json')
    except Exception as e:
        print(f'Error loading dictionary file: {e}')
        return 'Error loading dictionary file', 500


@ app.route('/dictionary/save', methods=['POST'])
def dictionary_save():
    try:
        with open(PATH_TO_DICT, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Dictionary saved!', 200
    except Exception as e:
        print(f'Error saving dictionary file: {e}')
        return 'Error saving dictionary file', 500


# Helper function to grab words from the HTML from krydsordexperten.dk
def grabWords(html) -> list[str]:
    if not html:
        return []

    words: list[str] = []

    soup = BeautifulSoup(html, "html.parser")
    solution_items = soup.find_all("div", class_="solution-item")
    for item in solution_items:
        characters = item.find_all("div", class_="character")
        word_with_numbers = ''.join([character.text for character in characters])
        words.append(regex.sub(r'\d+', '', word_with_numbers))

    return words


@ app.route('/help/pattern/<pattern>')
def helpPattern(pattern: str):

    # Check if the result is cached
    if pattern in CACHE["patterns"]:
        return CACHE["patterns"][pattern], 200

    # Make a request to the krydsordexperten.dk website: https://krydsordexperten.dk/krydsord/<synonym>
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'http://google.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1',
    }

    try:
        response = requests.get(f"https://krydsordexperten.dk/ord/{pattern}", headers=headers)
        CACHE["patterns"][pattern] = grabWords(response.text)
        return CACHE["patterns"][pattern], 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ app.route('/help/synonym/<synonym>')
def helpSynonym(synonym: str):
    # Replace Danish characters (only necessary for synonyms)
    synonym = synonym.replace("æ", "ae").replace("ø", "oe").replace("å", "aa")

    # Check if the result is cached
    if synonym in CACHE["synonyms"]:
        return CACHE["synonyms"][synonym], 200

    # Make a request to the krydsordexperten.dk website: https://krydsordexperten.dk/krydsord/<synonym>
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'http://google.com',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1',
    }

    try:
        response = requests.get(f"https://krydsordexperten.dk/krydsord/{synonym}", headers=headers)
        CACHE["synonyms"][synonym] = grabWords(response.text)
        return CACHE["synonyms"][synonym], 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host', type=str, default=HOST, help='Host to serve the app on')
    parser.add_argument('--port', type=int, default=PORT, help='Port to serve the app on')
    parser.add_argument('--dir', type=str, default='.', help='Directory to store the grid and dictionary files')

    args = parser.parse_args()

    # Modify the global variables
    HOST = args.host
    PORT = args.port
    PATH_TO_DICT = os.path.join(args.dir, PATH_TO_DICT)
    PATH_TO_GRID = os.path.join(args.dir, PATH_TO_GRID)

    # Create the directory if it doesn't exist
    if not os.path.isdir(args.dir):
        os.makedirs(args.dir)

    # Create the grid file if it doesn't exist
    if not os.path.isfile(PATH_TO_GRID):
        rows = 10
        cols = 15
        grid = [["" for _ in range(cols)] for _ in range(rows)]
        with open(PATH_TO_GRID, 'w') as f:
            json.dump(grid, f, indent=2)

    # Create the dictionary file if it doesn't exist
    if not os.path.isfile(PATH_TO_DICT):
        with open(PATH_TO_DICT, 'w') as f:
            json.dump([], f, indent=2)

    print(f'Serving "Crossword Helper" at http://{HOST}:{PORT}')
    serve(app, host=HOST, port=PORT)
