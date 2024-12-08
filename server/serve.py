import os
import json
import socket
from waitress import serve
from flask import Flask, send_file, request

import globals
import helpers


app = Flask(__name__)


@app.route('/')
def serve_index():
    return send_file(os.path.join(globals.STATIC_DIR, 'index.html'))


@app.route('/<path:path>')
def serve_static(path):
    return send_file(os.path.join(globals.STATIC_DIR, path))


@app.route('/grid/load')
def grid_load():
    try:
        return send_file(globals.PATH_TO_GRID)
    except Exception as e:
        msg = f'Failed to load grid: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/grid/save', methods=['POST'])
def grid_save():
    try:
        with open(globals.PATH_TO_GRID, 'w') as f:
            json.dump(request.json, f, indent=2)

        msg = f'Saved {globals.PATH_TO_GRID}!'
        app.logger.info(msg)
        return msg, 200
    except Exception as e:
        msg = f'Failed to save grid: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/dictionary/load')
def dictionary_load():
    try:
        return send_file(globals.PATH_TO_DICT, mimetype='application/json')
    except Exception as e:
        msg = f'Error loading dictionary file: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/dictionary/save', methods=['POST'])
def dictionary_save():
    try:
        with open(globals.PATH_TO_DICT, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Dictionary saved!', 200
    except Exception as e:
        msg = f'Error saving dictionary file: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/help/<language>/<word>')
def help(language: str, word: str):
    try:
        app.logger.info(f'Fetching word: {word} ({language})')
        return helpers.askWord(language=language, word=word), 200
    except Exception as e:
        msg = f'Failed to fetch word: {e}'
        app.logger.warning(msg)
        return msg, 500


def update_grid_path(path: str, create_if_missing: bool = True):

    # Allow the user to specify either a directory or a file
    updated_path = path if path.endswith('.json') else os.path.join(path, 'grid.json')

    if globals.PATH_TO_GRID != updated_path:
        globals.PATH_TO_GRID = updated_path
        app.logger.info(f'Updated grid path: {globals.PATH_TO_GRID}')

    if not create_if_missing:
        return

    # Create the grid file if it doesn't exist
    if not os.path.isfile(globals.PATH_TO_GRID):
        app.logger.info(f'Creating default grid at {globals.PATH_TO_GRID}')
        rows = 10
        cols = 15
        grid = [[{'type': 'empty', 'data': ''} for _ in range(cols)] for _ in range(rows)]
        with open(globals.PATH_TO_GRID, 'w') as f:
            json.dump(grid, f, indent=2)


def update_dict_path(path: str, create_if_missing: bool = True) -> str:

    # Allow the user to specify either a directory or a file
    updated_path = path if path.endswith('.json') else os.path.join(path, 'dict.json')

    if globals.PATH_TO_DICT != updated_path:
        globals.PATH_TO_DICT = updated_path
        app.logger.info(f'Updated dict path: {globals.PATH_TO_DICT}')

    if not create_if_missing:
        return

    # Create the dictionary file if it doesn't exist
    if not os.path.isfile(globals.PATH_TO_DICT):
        app.logger.info(f'Creating default dictionary at {globals.PATH_TO_DICT}')
        with open(globals.PATH_TO_DICT, 'w') as f:
            json.dump([], f, indent=2)


def update_port() -> int:
    # Check if the default port is already in use
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex((globals.HOST, globals.PORT)) != 0:
            return globals.PORT

    app.logger.warning(f'Port {globals.PORT} was already in use! Maybe you have another server running?')

    # Bind to any available port and retrieve the port number
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((globals.HOST, 0))
        globals.PORT = s.getsockname()[1]

    app.logger.warning(f'Found available port on {globals.PORT}')

    return globals.PORT


def serve_flask_app(debug: bool = False):
    app.logger.info(f'Starting server at http://{globals.HOST}:{globals.PORT}')
    if debug:
        # Run the app in debug mode
        app.run(host=globals.HOST, port=globals.PORT, debug=True, use_reloader=False)
    else:
        # Use Waitress to serve the app
        serve(app, host=globals.HOST, port=globals.PORT, _quiet=True)


if __name__ == '__main__':
    import logging

    # Create a StreamHandler for console output
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "[%(asctime)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))

    # Replace Flask's default logger handlers
    app.logger.handlers = []  # Clear existing handlers
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.DEBUG)

    # Suppress Flask's default HTTP request logs
    logging.getLogger('werkzeug').setLevel(logging.WARNING)

    # Update the global variables
    update_grid_path(os.path.join(os.getcwd(), 'examples'))
    update_dict_path(os.path.join(os.getcwd(), 'examples'))

    try:
        serve_flask_app(debug=True)
    except KeyboardInterrupt:
        pass
