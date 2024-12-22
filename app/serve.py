import os
from socket import socket, AF_INET, SOCK_STREAM
from waitress import serve
from flask import Flask, send_file

import globals
import helpers

app = Flask(__name__)


@app.route('/')
def serve_index():
    return send_file(os.path.join(globals.STATIC_DIR, 'index.html'))


@app.route('/<path:path>')
def serve_static(path):
    return send_file(os.path.join(globals.STATIC_DIR, path))


@app.route('/help/<language>/<word>')
def help(language: str, word: str):
    try:
        app.logger.info(f'Fetching word: {word} ({language})')
        return helpers.askWord(language=language, word=word), 200
    except Exception as e:
        msg = f'Failed to fetch word: {e}'
        app.logger.warning(msg)
        return msg, 500


def find_available_port() -> int:
    # Check if the default port is already in use
    with socket(AF_INET, SOCK_STREAM) as s:
        if s.connect_ex((globals.HOST, globals.PORT)) != 0:
            return globals.PORT

    app.logger.warning(f'Port {globals.PORT} was already in use! Maybe you have another server running?')

    # Bind to any available port and retrieve the port number
    with socket(AF_INET, SOCK_STREAM) as s:
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

    try:
        serve_flask_app(debug=True)
    except KeyboardInterrupt:
        pass
