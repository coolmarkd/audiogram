#!/bin/bash

echo "🖼️  Installing canvas separately with Node.js 16 compatibility..."

# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately first (exact version for Node.js 16)
echo "Installing canvas package (Node.js 16 compatible version)..."
npm install canvas@2.11.2 --audit-level=moderate --fund=false

# Install remaining dependencies (without canvas)
echo "Installing remaining dependencies..."
npm install --audit-level=moderate --fund=false

echo "✅ Canvas installation complete!"
