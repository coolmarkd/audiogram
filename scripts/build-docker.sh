#!/bin/bash

echo "🐳 Building Audiogram Docker images..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build primary image (Node.js 18 + Canvas 3.2.0)
echo "Building primary image (Node.js 18 + Canvas 3.2.0)..."
docker build -t audiogram:latest .

if [ $? -eq 0 ]; then
    echo "✅ Primary image built successfully!"
    echo "   Image: audiogram:latest"
    echo "   Node.js: 18.19.0"
    echo "   Canvas: 3.2.0"
else
    echo "❌ Primary image build failed. Trying fallback..."
    
    # Build fallback image (Node.js 16 + Canvas 2.11.2)
    echo "Building fallback image (Node.js 16 + Canvas 2.11.2)..."
    docker build -f Dockerfile.node16 -t audiogram:node16 .
    
    if [ $? -eq 0 ]; then
        echo "✅ Fallback image built successfully!"
        echo "   Image: audiogram:node16"
        echo "   Node.js: 16.20.2"
        echo "   Canvas: 2.11.2"
    else
        echo "❌ Both builds failed. Check the error messages above."
        exit 1
    fi
fi

echo ""
echo "🎉 Docker build complete!"
echo ""
echo "To run the container:"
echo "  docker run -p 3000:3000 audiogram:latest"
echo "  # or"
echo "  docker run -p 3000:3000 audiogram:node16"
