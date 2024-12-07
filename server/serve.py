import os
import json
import requests
import argparse
import webbrowser

from flask import Flask, request, send_file, send_from_directory, jsonify

from .help import askWord

HOST = '127.0.0.1'
PORT = 5000
STATIC_DIR = os.path.join(os.path.dirname(__file__), '../static')

PATH_TO_GRID = 'grid.json'
PATH_TO_DICT = 'dict.json'


app = Flask(__name__)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(STATIC_DIR, 'favicon.ico', mimetype='image/vnd.microsoft.icon')


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
        print(f'Failed to save grid: {e}')
        return 'Failed to save grid', 500


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


@ app.route('/help/pattern/<pattern>')
def helpPattern(pattern: str):
    try:
        return askWord(pattern, language="danish"), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@ app.route('/help/synonym/<synonym>')
def helpSynonym(synonym: str):
    try:
        return askWord(synonym, language="danish"), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host', type=str, default=HOST, help=f'Host to serve the app on. Default: {HOST}')
    parser.add_argument('--port', type=int, default=PORT, help=f'Port to serve the app on. Default: {PORT}')
    parser.add_argument('--dir', type=str, default=os.getcwd(), help='Directory to store the grid and dictionary files. Default: current directory')
    parser.add_argument('--browser', type=int, default=1, help='Open the browser automatically. Default: True')

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
        grid = [[{'type': 'empty', 'data': ''} for _ in range(cols)] for _ in range(rows)]
        with open(PATH_TO_GRID, 'w') as f:
            json.dump(grid, f, indent=2)

    # Create the dictionary file if it doesn't exist
    if not os.path.isfile(PATH_TO_DICT):
        with open(PATH_TO_DICT, 'w') as f:
            json.dump([], f, indent=2)

    if args.browser > 0:
        webbrowser.open(f"http://{HOST}:{PORT}", new=args.browser)

    # Start Flask in a separate thread
    print(f'Serving "Crossword Helper" at http://{HOST}:{PORT}')
    try:
        # Serve with Flask
        app.run(host=HOST, port=PORT, debug=True)
    except KeyboardInterrupt:
        pass
