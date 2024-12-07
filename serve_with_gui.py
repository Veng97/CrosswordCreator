import logging
import webbrowser
import threading
import tkinter as tk
from tkinter import scrolledtext

from serve import app, serve_flask_app


class FlaskGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Crossword Helper (Backend)")
        self.geometry("600x400")

        self.createLoggingWidget()

        self.serve()

    def createLoggingWidget(self):
        # Create a Text widget to display logs
        self.logger = scrolledtext.ScrolledText(self, state="disabled", wrap="word", height=20)
        self.logger.pack(fill="both", padx=10, pady=10, expand=True)
        self.logger.tag_configure("DEBUG", foreground="cyan")
        self.logger.tag_configure("INFO", foreground="green")
        self.logger.tag_configure("WARNING", foreground="yellow")
        self.logger.tag_configure("ERROR", foreground="red")
        self.logger.tag_configure("CRITICAL", foreground="red", font=("TkDefaultFont", 10, "bold"))

        # Redirect logs to the Text widget
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            "[%(asctime)s] %(levelname)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        ))

        # Custom handler to redirect logs to the Text widget
        def logText(record: logging.LogRecord):
            self.logger.configure(state="normal")
            self.logger.insert("end", handler.format(record) + "\n", record.levelname)
            self.logger.configure(state="disabled")
            self.logger.yview("end")

        handler.emit = logText

        # Clear existing handlers
        app.logger.handlers = []
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.DEBUG)

    def serve(self):
        self.flask_thread = threading.Thread(target=serve_flask_app, daemon=True)
        self.flask_thread.start()

    def terminate(self):
        self.destroy()


if __name__ == "__main__":
    #     webbrowser.open(f"http://{HOST}:{PORT}", new=args.browser)

    try:
        gui = FlaskGUI()
        gui.mainloop()
    except KeyboardInterrupt:
        gui.terminate()
