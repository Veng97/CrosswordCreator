import logging
import webbrowser
import threading
import customtkinter as ctk
import time
import queue

import globals
from serve import app, serve_flask_app, update_dict_path, update_grid_path


class FlaskGUI(ctk.CTk):
    def __init__(self):
        super().__init__()

        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("green")

        self.drawing = True
        self.protocol("WM_DELETE_WINDOW", self.terminate)

        self.title("Crossword Helper (Backend)")
        self.geometry("800x500")

        # Configure grid layout (2x1)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure((0), weight=0)
        self.grid_rowconfigure((1), weight=1)
        self.grid_rowconfigure((2), weight=0)

        self.header = ctk.CTkFrame(self)
        self.header.grid(row=0, column=0, rowspan=1, sticky="we")
        self.header.grid_columnconfigure((0, 1), weight=1)
        self.header.grid_rowconfigure(0, weight=0)

        self.frame = ctk.CTkFrame(self)
        self.frame.grid(row=1, column=0, rowspan=1, columnspan=1, sticky="nsew")
        self.frame.grid_columnconfigure(0, weight=1)
        self.frame.grid_rowconfigure(0, weight=1)

        self.footer = ctk.CTkFrame(self)
        self.footer.grid(row=2, column=0, rowspan=1, sticky="nsew")
        self.footer.grid_columnconfigure((0), weight=1)
        self.footer.grid_columnconfigure((1, 2), weight=0)
        self.footer.grid_rowconfigure(0, weight=0)

        self.configureHeader()
        self.configureFooter()
        self.configureLogger()

    def configureHeader(self):
        self.filepath_label = ctk.CTkLabel(self.header,
                                           text=f"Dict: {globals.PATH_TO_DICT}\nGrid: {globals.PATH_TO_GRID}",
                                           font=ctk.CTkFont("consolas", 14, weight="bold"),
                                           )
        self.filepath_label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

        # Function to update the path to the grid/dictionary
        def chooseFile():
            selected_directory: str = ctk.filedialog.askdirectory()
            if not selected_directory:
                return
            update_grid_path(selected_directory)
            update_dict_path(selected_directory)
            self.filepath_label.configure(text=f"Dict: {globals.PATH_TO_DICT}\nGrid: {globals.PATH_TO_GRID}")

        self.choose_dir_btn = ctk.CTkButton(self.header,
                                            text="Select",
                                            font=ctk.CTkFont("consolas", 14, weight="bold"),
                                            command=chooseFile,
                                            )
        self.choose_dir_btn.grid(row=0, column=1, padx=20, pady=10, sticky="e")

    def configureFooter(self):
        # Display the URL
        self.url_label = ctk.CTkLabel(self.footer,
                                      text=f"Idle",
                                      font=ctk.CTkFont("consolas", 14, weight="bold"),
                                      )
        self.url_label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

        # Open URL in browser
        self.open_url_btn = ctk.CTkButton(self.footer,
                                          text="Open",
                                          font=ctk.CTkFont("consolas", 14, weight="bold"),
                                          command=lambda: webbrowser.open(f"http://{globals.HOST}:{globals.PORT}"),
                                          )
        self.open_url_btn.grid(row=0, column=1, padx=20, pady=10, sticky="e")

        # Start the Flask server
        def onStart():
            self.serve()
            self.url_label.configure(text=f"Serving: {globals.HOST}:{globals.PORT}")
            self.serve_btn.configure(state="disabled")

        self.serve_btn = ctk.CTkButton(self.footer,
                                       text="Start",
                                       font=ctk.CTkFont("consolas", 14, weight="bold"),
                                       command=onStart,
                                       )
        self.serve_btn.grid(row=0, column=2, padx=20, pady=10, sticky="e")

    def configureLogger(self):
        # Add a Text widget to display logs
        self.logger = ctk.CTkTextbox(self.frame,
                                     font=ctk.CTkFont("consolas", 14),
                                     wrap=ctk.WORD,
                                     fg_color=("#000000"),
                                     )
        self.logger.grid(row=0, column=0, sticky="nsew")

        # Configure tags for different log levels with color
        self.logger.tag_config("DEBUG", foreground="cyan")
        self.logger.tag_config("INFO", foreground="green")
        self.logger.tag_config("WARNING", foreground="yellow")
        self.logger.tag_config("ERROR", foreground="red")
        self.logger.tag_config("CRITICAL", foreground="red", underline=1)

        # Configure logging format
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(
            "[%(asctime)s] %(levelname)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        ))

        # Custom handler to redirect logs to the Text widget
        self.log_queue = queue.Queue()
        handler.emit = lambda record: self.log_queue.put((handler.format(record), record.levelname))

        # Periodically poll logs from the queue and update the Text widget
        def handleQueue():
            while not self.log_queue.empty():
                log_message, log_level = self.log_queue.get()
                self.logger.configure(state="normal")
                self.logger.insert("end", log_message + "\n", log_level)
                self.logger.configure(state="disabled")
                self.logger.yview("end")

            self.after(100, handleQueue)

        handleQueue()

        # Replace Flask's default logger handlers with the custom handler
        app.logger.handlers = []
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.DEBUG)

    def serve(self):
        # When launched with 'daemon=True', the thread will be terminated when the main thread exits
        self.flask_thread = threading.Thread(target=serve_flask_app, daemon=True)
        self.flask_thread.start()

    def draw(self):
        if self.drawing:
            self.update()
            self.update_idletasks()
        return self.drawing

    def terminate(self):
        self.drawing = False


if __name__ == "__main__":
    gui = FlaskGUI()
    try:
        while gui.draw():
            time.sleep(1/20)
    except KeyboardInterrupt:
        gui.destroy()
