#!/bin/bash

# Suppress npm audit warnings and install dependencies
echo "Installing dependencies with audit warnings suppressed..."

# Set npm configuration to suppress warnings
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false

# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately first (exact version)
echo "Installing canvas separately..."
npm install canvas@3.2.0 --audit-level=moderate --fund=false

# Install remaining dependencies
echo "Installing remaining dependencies..."
npm install

# Run postinstall script
npm run postinstall

echo "Installation complete!"
