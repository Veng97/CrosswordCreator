import os
import json
from waitress import serve
from flask import Flask, send_file, request

from globals import HOST, PORT, PATH_TO_GRID, PATH_TO_DICT, STATIC_DIR
from helper import askWord


app = Flask(__name__)


@app.route('/')
def serve_index():
    return send_file(os.path.join(STATIC_DIR, 'index.html'))


@app.route('/favicon.ico')
def favicon():
    return send_file(os.path.join(STATIC_DIR, 'favicon.ico'), mimetype='image/vnd.microsoft.icon')


@app.route('/<path:path>')
def serve_static(path):
    return send_file(os.path.join(STATIC_DIR, path))


@app.route('/grid/load')
def grid_load():
    try:
        return send_file(PATH_TO_GRID)
    except Exception as e:
        msg = f'Failed to load grid: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/grid/save', methods=['POST'])
def grid_save():
    try:
        with open(PATH_TO_GRID, 'w') as f:
            json.dump(request.json, f, indent=2)

        msg = f'Saved {PATH_TO_GRID}!'
        app.logger.info(msg)
        return msg, 200
    except Exception as e:
        msg = f'Failed to save grid: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/dictionary/load')
def dictionary_load():
    try:
        return send_file(PATH_TO_DICT, mimetype='application/json')
    except Exception as e:
        msg = f'Error loading dictionary file: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/dictionary/save', methods=['POST'])
def dictionary_save():
    try:
        with open(PATH_TO_DICT, 'w') as f:
            json.dump(request.json, f, indent=2)
        return f'Dictionary saved!', 200
    except Exception as e:
        msg = f'Error saving dictionary file: {e}'
        app.logger.error(msg)
        return msg, 500


@app.route('/help/<language>/<word>')
def help(language: str, word: str):
    try:
        app.logger.info(f'Fetching word: {word}')
        return askWord(language=language, word=word), 200
    except Exception as e:
        msg = f'Failed to fetch word: {e}'
        app.logger.warning(msg)
        return msg, 500


def serve_flask_app(host: str = HOST, port: int = PORT, debug: bool = False):
    app.logger.info(f'Starting server at http://{host}:{port}')
    if debug:
        # Run the app in debug mode
        app.run(host=host, port=port, debug=True, use_reloader=False)
    else:
        # Use Waitress to serve the app
        serve(app, host=host, port=port, _quiet=True)


if __name__ == '__main__':
    # Set up logging
    import logging
    from colorlog import ColoredFormatter

    formatter = ColoredFormatter(
        "%(log_color)s[%(asctime)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'bold_red',
        },
    )

    # Create a StreamHandler for console output
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    # Replace Flask's default logger handlers
    app.logger.handlers = []  # Clear existing handlers
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.DEBUG)

    # Suppress Flask's default HTTP request logs
    logging.getLogger('werkzeug').setLevel(logging.WARNING)

    # Modify the global variables
    PATH_TO_DICT = os.path.join(os.getcwd(), PATH_TO_DICT)
    PATH_TO_GRID = os.path.join(os.getcwd(), PATH_TO_GRID)

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

    try:
        serve_flask_app(debug=True)
    except KeyboardInterrupt:
        pass
