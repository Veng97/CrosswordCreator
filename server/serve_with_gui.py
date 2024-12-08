import logging
import threading
import time
import queue
import customtkinter as ctk
from tkinter import PhotoImage
from webbrowser import open as open_browser

import globals
from serve import app, serve_flask_app, update_dict_path, update_grid_path, update_port


class FlaskGUI(ctk.CTk):
    FONT_TYPE = "consolas"
    FONT_SIZE = 15
    BUTTON_COLOR = "#0d1b3a"
    BUTTON_HOVER_COLOR = "#293a5e"

    def __init__(self):
        super().__init__()
        ctk.set_appearance_mode("dark")
        self.title("Crossword Creator (Backend)")
        self.iconphoto(True, PhotoImage(file=globals.PATH_TO_ICON))
        self.geometry("800x500")

        # Configure things to close the window properly
        self.drawing = True
        self.protocol("WM_DELETE_WINDOW", self.terminate)

        # Configure grid layout (2x1)
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure((0), weight=0)
        self.grid_rowconfigure((1), weight=1)
        self.grid_rowconfigure((2), weight=0)

        self.header = ctk.CTkFrame(self)
        self.header.grid(row=0, column=0, rowspan=1, sticky="we")
        self.header.grid_columnconfigure((0, 1), weight=1)
        self.header.grid_rowconfigure(0, weight=0)

        self.scrollable = ctk.CTkFrame(self)
        self.scrollable.grid(row=1, column=0, rowspan=1, columnspan=1, sticky="nsew")
        self.scrollable.grid_columnconfigure(0, weight=1)
        self.scrollable.grid_rowconfigure(0, weight=1)

        self.footer = ctk.CTkFrame(self)
        self.footer.grid(row=2, column=0, rowspan=1, sticky="nsew")
        self.footer.grid_columnconfigure((0), weight=1)
        self.footer.grid_columnconfigure((1, 2), weight=0)
        self.footer.grid_rowconfigure(0, weight=0)

        self.configureHeader(self.header)
        self.configureFooter(self.footer)
        self.configureLogger(self.scrollable)

    def configureHeader(self, frame: ctk.CTkFrame):
        self.filepath_label = ctk.CTkLabel(frame,
                                           text=f"Dict: {globals.PATH_TO_DICT}\nGrid: {globals.PATH_TO_GRID}",
                                           font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE),
                                           )
        self.filepath_label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

        # Function to update the path to the grid/dictionary
        def onChangeFolder():
            selected_directory: str = ctk.filedialog.askdirectory()
            if not selected_directory:
                return

            # Ensure that the grid and dictionary files exist
            update_grid_path(selected_directory, create_if_missing=True)
            update_dict_path(selected_directory, create_if_missing=True)

            self.filepath_label.configure(text=f"Dict: {globals.PATH_TO_DICT}\nGrid: {globals.PATH_TO_GRID}")

        self.change_folder_btn = ctk.CTkButton(frame,
                                               text="Change Folder",
                                               font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE, weight="bold"),
                                               height=40,
                                               fg_color=self.BUTTON_COLOR,
                                               hover_color=self.BUTTON_HOVER_COLOR,
                                               command=onChangeFolder,
                                               )
        self.change_folder_btn.grid(row=0, column=1, padx=20, pady=10, sticky="e")

    def configureFooter(self, frame: ctk.CTkFrame):
        # Display the URL
        self.url_label = ctk.CTkLabel(frame,
                                      text=f"Idle",
                                      font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE),
                                      )
        self.url_label.grid(row=0, column=0, padx=20, pady=10, sticky="w")

        # Open URL in browser
        self.open_url_btn = ctk.CTkButton(frame,
                                          text="Open Browser",
                                          font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE, weight="bold"),
                                          height=40,
                                          fg_color=self.BUTTON_COLOR,
                                          hover_color=self.BUTTON_HOVER_COLOR,
                                          command=self.onOpenBrowser,
                                          )
        self.open_url_btn.grid(row=0, column=2, padx=20, pady=10, sticky="e")

        # Start the Flask server
        self.serve_btn = ctk.CTkButton(frame,
                                       text="Serve",
                                       font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE, weight="bold"),
                                       height=40,
                                       fg_color=self.BUTTON_COLOR,
                                       hover_color=self.BUTTON_HOVER_COLOR,
                                       command=self.onStartServer,
                                       )
        self.serve_btn.grid(row=0, column=1, padx=20, pady=10, sticky="e")

    def configureLogger(self, frame: ctk.CTkFrame):
        # Add a Text widget to display logs
        self.logger = ctk.CTkTextbox(frame,
                                     font=ctk.CTkFont(self.FONT_TYPE, self.FONT_SIZE),
                                     wrap=ctk.WORD,
                                     )
        self.logger.grid(row=0, column=0, sticky="nsew")

        # Configure tags for different log levels with color
        self.logger.tag_config("DEBUG", foreground="cyan")
        self.logger.tag_config("INFO", foreground="white")
        self.logger.tag_config("WARNING", foreground="yellow")
        self.logger.tag_config("ERROR", foreground="red")
        self.logger.tag_config("CRITICAL", foreground="red", underline=True)

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

    def onStartServer(self):
        """
        Callback function to start the Flask server
        """

        # Start the server
        self.serve()

        # Update the URL label and disable the button
        self.url_label.configure(text=f"Serving: {globals.HOST}:{globals.PORT}", state="disabled")
        self.serve_btn.configure(text="Running", state="disabled")

    def onOpenBrowser(self):
        open_browser(f"http://{globals.HOST}:{globals.PORT}")

    def serve(self):
        # Check if thread member exists; if so, the server is already running
        if hasattr(self, "flask_thread"):
            return

        # Ensure that the grid and dictionary files exist
        update_grid_path(globals.PATH_TO_GRID, create_if_missing=True)
        update_dict_path(globals.PATH_TO_DICT, create_if_missing=True)

        # Ensure that the port is available
        update_port()

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
