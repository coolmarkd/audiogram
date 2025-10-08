#!/bin/bash

# Build script for Docker with git commit hash
# Usage: ./scripts/build-docker.sh [image-name] [tag]

set -e

# Get current git commit hash
GIT_COMMIT_HASH=$(git rev-parse HEAD)
echo "Current git commit hash: $GIT_COMMIT_HASH"

# Set default values
IMAGE_NAME=${1:-audiogram}
TAG=${2:-latest}

# Build the Docker image with git commit hash as build argument
echo "Building Docker image: $IMAGE_NAME:$TAG"
docker build \
  --build-arg GIT_COMMIT_HASH="$GIT_COMMIT_HASH" \
  --build-arg CACHEBUST="$(date +%s)" \
  -t "$IMAGE_NAME:$TAG" \
  .

echo "Build complete!"
echo "Image: $IMAGE_NAME:$TAG"
echo "Git commit: $GIT_COMMIT_HASH"