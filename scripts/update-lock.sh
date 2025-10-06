#!/bin/bash

echo "🔄 Updating package-lock.json with audit suppression..."

# Set npm config
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false

# Remove old lock file
rm -f package-lock.json

# Install with new lock file
npm install

echo "✅ Package-lock.json updated successfully!"
