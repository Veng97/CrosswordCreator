import os

HOST = '127.0.0.1'
PORT = 5000

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

PATH_TO_ICON = os.path.join(STATIC_DIR, 'assets', 'favicon.png')
PATH_TO_GRID = os.path.join(os.getcwd(), 'grid.json')
PATH_TO_DICT = os.path.join(os.getcwd(), 'dict.json')
