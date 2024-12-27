import os
import logging
from flask import Flask, send_file
import helpers

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

app = Flask(__name__)

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


@app.route('/')
def serve_index():
    return send_file(os.path.join(STATIC_DIR, 'index.html'))


@app.route('/<path:path>')
def serve_static(path):
    return send_file(os.path.join(STATIC_DIR, path))


@app.route('/help/<language>/<word>')
def help(language: str, word: str):
    try:
        app.logger.info(f'Fetching word: {word} ({language})')
        return helpers.askWord(language=language, word=word), 200
    except Exception as e:
        msg = f'Failed to fetch word: {e}'
        app.logger.warning(msg)
        return msg, 500
