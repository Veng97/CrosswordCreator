FROM python:3.11 AS builder

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set working directory
WORKDIR /

# Install Poetry
RUN pip install poetry
RUN poetry config virtualenvs.in-project true

# Copy and install dependencies
COPY pyproject.toml poetry.lock /
RUN poetry install

# Create production image
FROM python:3.11-slim

# Copy virtual environment
COPY --from=builder /.venv /.venv

# Set working directory
WORKDIR /app
COPY app ./

# Use Gunicorn to serve the app
CMD ["/.venv/bin/gunicorn", "--bind", "0.0.0.0:8080", "serve:app"]