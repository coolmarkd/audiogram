#!/bin/bash

echo "🖼️  Installing canvas separately with Node.js compatibility..."

# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately first (exact version)
echo "Installing canvas package (exact version)..."
npm install canvas@3.2.0 --audit-level=moderate --fund=false

# Install remaining dependencies (without canvas)
echo "Installing remaining dependencies..."
npm install --audit-level=moderate --fund=false

echo "✅ Canvas installation complete!"
