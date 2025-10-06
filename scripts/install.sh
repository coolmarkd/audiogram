#!/bin/bash

# Suppress npm audit warnings and install dependencies
echo "Installing dependencies with audit warnings suppressed..."

# Set npm configuration to suppress warnings
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false

# Install dependencies
npm install

# Run postinstall script
npm run postinstall

echo "Installation complete!"
