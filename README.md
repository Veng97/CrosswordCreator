# Crossword Creator
This repository contains the code for the Crossword Creator web app: https://crosswordcreator.fly.dev/

## Setup
The application is shipped in a Docker container with Python 3.11 and is not tested with earlier versions. Although, it is fairly simple and should work with earlier versions of Python 3!
The Python dependencies are managed with Poetry.

If you do not have Poetry already, install it with:

```bash 
# Installs Poetry
curl -sSL https://install.python-poetry.org | python3 -
pip install poetry
```

The Docker build process for this setup requires the virtual environment to be in the project directory. This can be configured with:

```bash
# Ensures Poetry creates the virtual environment in the project directory
poetry config virtualenvs.in-project true
```

Finally, install the dependencies with:

```bash
# Installs dependencies to the virtual environment
poetry install
```

## Deployment
The application is deployed to Fly.io. It requires a personal account setup and the Fly CLI installed.

```bash
fly deploy
```

## Development (Local)

Build the Docker image with:

```bash
docker build . -t crossword-creator
```

Run the Docker container with:

```bash
docker run --rm -v $(pwd)/app:/app crossword-creator
```

<b>Note</b>: The `-v` flag mounts the `app` directory to the container. Thus, you do not need a docker build before running with changes.