#!/bin/bash

# Configuration
ENTRYPOINT="serve.py"                    # Flask app's entry file (without .py extension)
EXECUTABLE_NAME="CrossWordHelper"   # Name of the output executable

# Ensure PyInstaller is installed
echo "Checking for PyInstaller..."
if ! command -v pyinstaller &> /dev/null; then
    echo "PyInstaller not found. Installing..."
    pip install pyinstaller
else
    echo "PyInstaller is already installed."
fi

# Run PyInstaller to create the executable
echo "Building the Flask app..."
pyinstaller --name "$EXECUTABLE_NAME" --onefile --noconsole "$ENTRYPOINT"

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
else
    echo "Build failed. Check the logs for errors."
    exit 1
fi

# Move the executable to the root directory
mv "dist/$EXECUTABLE_NAME" "$EXECUTABLE_NAME"

# Optional: Clean up temporary files created by PyInstaller
echo "Cleaning up temporary files..."
rm -rf build dist __pycache__ *.spec