import logging
import webbrowser
import threading
import tkinter as tk
from tkinter import ttk
from tkinter import scrolledtext

from serve import app, serve_flask_app


PRIMARY_COLOR = "#333333"
FONT_NORMAL = ("Helvetica", 14)
FONT_BOLD = ("Helvetica", 14, "bold")


class FlaskGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Crossword Helper (Backend)")
        self.geometry("600x400")

        self.configureUI()
        self.configureLogger()

        self.serve()

    def configureUI(self):
        # Set dark background and light text color for the window
        self.configure(bg=PRIMARY_COLOR)

        # Create a ttk style object for dark mode
        style = ttk.Style(self)
        style.configure('TFrame', background=PRIMARY_COLOR)
        style.configure('TLabel', background=PRIMARY_COLOR, foreground='white', font=FONT_NORMAL)
        style.configure('TButton', background='#4C4C4C', foreground='white', font=FONT_NORMAL)
        style.configure('TScrolledText', background=PRIMARY_COLOR, foreground='white', font=FONT_NORMAL)

        # Create a ScrolledText widget inside the frame with the custom dark style
        self.logger = scrolledtext.ScrolledText(self, state="disabled", wrap="word", height=20, bg=PRIMARY_COLOR, fg="white", font=FONT_NORMAL)
        self.logger.pack(fill="both", padx=10, pady=10, expand=True)

        # Configure tags for different log levels with color
        self.logger.tag_configure("DEBUG", foreground="cyan")
        self.logger.tag_configure("INFO", foreground="green")
        self.logger.tag_configure("WARNING", foreground="yellow")
        self.logger.tag_configure("ERROR", foreground="red")
        self.logger.tag_configure("CRITICAL", foreground="red", font=FONT_BOLD)

    def configureLogger(self):
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
