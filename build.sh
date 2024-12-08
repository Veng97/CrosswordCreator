#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Configuration
ENTRYPOINT="server/serve_with_gui.py"        # Flask app's entry file (with .py extension)
EXECUTABLE_NAME="CrosswordCreator"   # Name of the output executable

# Create a virtual environment
echo "Creating a virtual environment..."
python3 -m venv .venv

# Activate the virtual environment
echo "Activating the virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Find customtkiner module
location=$(pip show customtkinter | grep Location | awk '{print $2}')

# Run PyInstaller to create the executable
echo "Packaging app..."
pyinstaller --name "$EXECUTABLE_NAME" \
    --noconfirm \
    --windowed \
    --onefile \
    --optimize 2 \
    --icon "server/static/assets/favicon.icns" \
    --add-data "server/static:static" \
    --add-data "$location/customtkinter:customtkinter/" \
    "$ENTRYPOINT"

# Clean up temporary files created by PyInstaller
echo "Cleaning up temporary files..."
rm -rf build __pycache__ *.spec

echo "Build completed successfully!"
