from flask import Flask, request, send_file, send_from_directory, jsonify
import os
import json
import requests

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
        return f'Puzzle saved to {filename}', 200
    except Exception as e:
        print(f'Error saving puzzle file: {e}')
        return 'Error saving puzzle file', 500

@app.route('/dictionary/load')
def dictionary_load(filename):
    try:
        return send_file(DICTIONARY_PATH, mimetype='application/json')
    except Exception as e:
        print(f'Error loading dictionary file: {e}')
        return 'Error loading dictionary file', 500

@app.route('/dictionary/save', methods=['POST'])
def dictionary_save(filename):
    try:
        with open(DICTIONARY_PATH, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Dictionary saved to {filename}', 200
    except Exception as e:
        print(f'Error saving dictionary file: {e}')
        return 'Error saving dictionary file', 500
    

# @app.route('suggestion/help/<word>')
# def suggestion_help(word):
    # Make a request to the krydsordexperten.dk website
    # https://krydsordexperten.dk/krydsord/<word>
    # try:
    #     response = requests.get(f"https://krydsordexperten.dk/krydsord/{word}")
    #     return response.text, response.status_code
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(port=8000)