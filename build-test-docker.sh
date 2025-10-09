#!/bin/bash

# Build script for test Docker image using local files
# This script builds a Docker image using the current working directory

set -e

# Get the current directory name for the image tag
DIR_NAME=$(basename "$(pwd)")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_TAG="${DIR_NAME}-test"

echo "Building test Docker image..."
echo "Image tag: $IMAGE_TAG"
echo "Using Dockerfile.test with all local files"

# Build the Docker image using the test Dockerfile
docker build -f Dockerfile.test -t "$IMAGE_TAG" .

echo ""
echo "✅ Test Docker image built successfully!"
echo "Image tag: $IMAGE_TAG"
echo ""
echo "To run the container:"
echo "docker run -p 8888:8888 -e ASSEMBLYAI_API_KEY=your-api-key-here $IMAGE_TAG"
echo ""
echo "To run with docker-compose (if you have a docker-compose.test.yml):"
echo "docker-compose -f docker-compose.test.yml up"
