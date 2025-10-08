#!/bin/bash

# Run script for Docker with git commit hash display
# Usage: ./scripts/run-docker.sh [image-name] [tag] [assemblyai-api-key]

set -e

# Set default values
IMAGE_NAME=${1:-audiogram}
TAG=${2:-latest}
API_KEY=${3:-$ASSEMBLYAI_API_KEY}

if [ -z "$API_KEY" ]; then
  echo "Error: AssemblyAI API key is required"
  echo "Usage: $0 [image-name] [tag] [assemblyai-api-key]"
  echo "Or set ASSEMBLYAI_API_KEY environment variable"
  exit 1
fi

# Get current git commit hash for comparison
LOCAL_GIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "Not in git repository")

echo "Running Docker container..."
echo "Image: $IMAGE_NAME:$TAG"
echo "Local git commit: $LOCAL_GIT_HASH"
echo "API Key: ${API_KEY:0:8}..."

# Run the container
docker run -p 8888:8888 -e ASSEMBLYAI_API_KEY="$API_KEY" "$IMAGE_NAME:$TAG"
