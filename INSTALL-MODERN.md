# Modern Installation Guide

## Prerequisites
- Node.js 18.19.0 or higher
- npm 8.0.0 or higher

## Installation with Audit Suppression

### Option 1: Using the install script (Recommended)
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Option 2: Canvas-specific installation
```bash
chmod +x scripts/install-canvas.sh
./scripts/install-canvas.sh
```

### Option 3: Manual installation
```bash
# Suppress npm audit warnings
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false

# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install dependencies
npm install

# Build the project
npm run postinstall
```

### Option 3: Using nvm (recommended)
```bash
# Install Node.js 18.19.0
nvm install 18.19.0
nvm use 18.19.0

# Install dependencies
npm install
```

## Running the Application
```bash
npm start
```

## Updating Dependencies
```bash
npm run update:deps
```

## Notes
- Audit warnings are suppressed by default
- All dependencies are updated to their latest compatible versions
- The application uses modern Node.js features and APIs
