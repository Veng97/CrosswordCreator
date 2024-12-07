from logging import StreamHandler
from colorlog import ColoredFormatter


def coloredFormatter():
    # Create a ColoredFormatter
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
    handler = StreamHandler()
    handler.setFormatter(formatter)

    return handler
