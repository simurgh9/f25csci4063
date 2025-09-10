#!/bin/sh
set -e

echo "Waiting for Ollama to start..."

until [ "$(curl -s http://ollama:11434/)" = "Ollama is running" ]; do
  sleep 2
done

echo "Ollama is up! Pulling model..."
ollama pull llama3

echo "✅ Model bootstrap complete"
