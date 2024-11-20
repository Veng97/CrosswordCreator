from flask import Flask, request, send_file, send_from_directory, jsonify
import os
import json
import requests
from bs4 import BeautifulSoup
import regex

app = Flask(__name__)

# Define the path to the puzzles directory
PUZZLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'puzzles')
DICTIONARY_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dict.json')

@app.route('/')
def serve_index():
    return send_from_directory('public', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/puzzle-options')
def puzzle_options():
    try:
        files = [f for f in os.listdir(PUZZLES_DIR) if f.endswith('.json')]
        return jsonify(files)
    except Exception as e:
        print(f'Error listing puzzle files: {e}')
        return 'Error listing puzzle files', 500

@app.route('/puzzles/load/<filename>')
def puzzle_load(filename):
    try:
        return send_from_directory(PUZZLES_DIR, filename)
    except Exception as e:
        print(f'Error loading puzzle file: {e}')
        return 'Error loading puzzle file', 500

@app.route('/puzzles/save/<filename>', methods=['POST'])
def puzzle_save(filename):
    try:
        with open(os.path.join(PUZZLES_DIR, filename), 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Puzzle saved to {filename}!', 200
    except Exception as e:
        print(f'Error saving puzzle file: {e}')
        return 'Error saving puzzle file', 500

@app.route('/dictionary/load')
def dictionary_load():
    try:
        return send_file(DICTIONARY_PATH, mimetype='application/json')
    except Exception as e:
        print(f'Error loading dictionary file: {e}')
        return 'Error loading dictionary file', 500

@app.route('/dictionary/save', methods=['POST'])
def dictionary_save():
    try:
        with open(DICTIONARY_PATH, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Dictionary saved!', 200
    except Exception as e:
        print(f'Error saving dictionary file: {e}')
        return 'Error saving dictionary file', 500

@app.route('/suggestion/<word>/<pattern>')
def suggestion(word, pattern):
    # Make a request to the krydsordexperten.dk website
    # https://krydsordexperten.dk/krydsord/<word>
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

    words: list[str] = []

    try:
        response = requests.get(f"https://krydsordexperten.dk/krydsord/{word}/{pattern}?", headers=headers)
        # print(response.text)

        # Parse the HTML
        soup = BeautifulSoup(response.text, "html.parser")

        # Find specific divs by class name or ID
        solution_items = soup.find_all("div", class_="solution-item")
        for item in solution_items:
            characters = item.find_all("div", class_="character")
            word_with_numbers = ''.join([character.text for character in characters])
            words.append(regex.sub(r'\d+', '', word_with_numbers))

        return words, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(port=8000)