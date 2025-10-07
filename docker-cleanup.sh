#!/bin/bash

# Clean up all Docker resources

echo "Cleaning up Docker resources..."

# Kill all running containers
echo "Killing all running containers..."
docker kill $(docker ps -q) 2>/dev/null || echo "No running containers to kill"

# Delete all stopped containers
echo "Deleting all stopped containers..."
docker rm $(docker ps -a -q) 2>/dev/null || echo "No containers to remove"

# Delete all images
echo "Deleting all images..."
docker rmi $(docker images -q) 2>/dev/null || echo "No images to remove"

# Remove unused data
echo "Removing unused data..."
docker system prune -f

# Remove all unused data including volumes
echo "Removing all unused data including volumes..."
docker system prune -af

# Remove all volumes
echo "Removing all volumes..."
docker volume prune -f

# Remove all networks
echo "Removing all networks..."
docker network prune -f

echo "Docker cleanup complete!"
