# Canvas Setup Guide

This guide explains how to set up the canvas package for the modernized audiogram project.

## Quick Start

### Using the provided scripts (Recommended)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Install with canvas support
./scripts/install.sh

# Test canvas installation
npm run test:canvas
```

### Manual setup
```bash
# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install dependencies
npm install

# Test installation
npm run test:canvas
```

## Docker Setup

The Dockerfile has been updated to handle canvas compilation automatically:

```dockerfile
FROM node:18.19.0-slim

# Install build tools for canvas
RUN apt-get install -y python3 make pkg-config build-essential

# Set Python for node-gyp
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set environment variables for canvas compilation
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
ENV npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

## Troubleshooting

### Common Issues

1. **"node-gyp rebuild" fails**
   - Solution: Install build tools and Python3
   - Solution: Use prebuilt binaries

2. **"Canvas is not a constructor"**
   - Solution: Check Node.js version compatibility
   - Solution: Reinstall canvas with proper environment variables

3. **"make: command not found"**
   - Solution: Install make: `apt-get install make`

### Testing Canvas

```bash
# Run the canvas test
npm run test:canvas

# Or test manually
node -e "const { createCanvas } = require('canvas'); console.log('Canvas works!');"
```

### Alternative Solutions

If canvas continues to cause issues:

1. **Use Node.js 16 LTS** (better compatibility)
2. **Use alternative packages** (skia-canvas, fabric.js)
3. **Use prebuilt binaries** (current approach)

## Files Modified

- `Dockerfile` - Added build tools and Python setup
- `package.json` - Updated canvas version and added test script
- `.npmrc` - Added canvas-specific configuration
- `scripts/install.sh` - Added canvas configuration
- `scripts/install-canvas.sh` - Canvas-specific installation
- `scripts/test-canvas.js` - Canvas testing script

## Environment Variables

Set these for canvas compilation:

```bash
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

## Platform Requirements

### Ubuntu/Debian
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev python3 make pkg-config
```

### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg python3
```

### Windows
- Install Visual Studio Build Tools
- Install Python 3.x
- Use prebuilt binaries when possible

## Success Indicators

When canvas is properly installed, you should see:

```bash
$ npm run test:canvas
🧪 Testing canvas installation...
✅ Canvas installation successful!
✅ Canvas size: 200 x 200
✅ Canvas context available: true
```

## Next Steps

After successful canvas installation:

1. Run the full test suite: `npm test`
2. Start the application: `npm start`
3. Build the project: `npm run postinstall`

For more detailed troubleshooting, see `CANVAS-TROUBLESHOOTING.md`.
