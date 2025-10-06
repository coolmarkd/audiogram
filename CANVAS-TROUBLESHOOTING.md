# Canvas Package Troubleshooting

## Issue: Canvas compilation fails with Node.js 18+

The `canvas` package has compatibility issues with Node.js 18+ due to changes in the V8 engine and native bindings.

## Solutions

### Option 1: Use Node.js 16 LTS (Recommended for compatibility)
```bash
# Use Node.js 16.20.2
nvm install 16.20.2
nvm use 16.20.2
npm install
```

### Option 2: Use prebuilt canvas binaries (Current approach)
```bash
# Set environment variables for canvas compilation
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install with prebuilt binaries
npm install canvas@^3.2.0
```

### Option 3: Use alternative canvas package
```bash
# Use skia-canvas as alternative
npm uninstall canvas
npm install skia-canvas
```

## Docker Solutions

### For Node.js 18 with canvas fixes (Current setup)
```dockerfile
FROM node:18.19.0-slim

# Install additional build tools
RUN apt-get install -y python3 make pkg-config

# Set Python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Set environment variables for canvas compilation
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
ENV npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

### For Node.js 16 (Alternative)
```dockerfile
FROM node:16.20.2-slim
# ... rest of Dockerfile
```

## Testing Canvas Installation

```bash
# Test canvas installation
node -e "const { createCanvas } = require('canvas'); console.log('Canvas works!');"
```

## Common Errors and Solutions

### "node-gyp rebuild" fails
- **Solution**: Install build tools: `apt-get install build-essential python3 make`
- **Solution**: Set Python environment variables: `export PYTHON=/usr/bin/python3`

### "Canvas is not a constructor"
- **Solution**: Check Node.js version compatibility
- **Solution**: Try using prebuilt binaries
- **Solution**: Consider alternative packages

### "gyp ERR! build error"
- **Solution**: Ensure all build dependencies are installed
- **Solution**: Use prebuilt binaries instead of compiling from source
- **Solution**: Check Python version (should be 3.x)

### "make: command not found"
- **Solution**: Install make: `apt-get install make`

### "python: command not found"
- **Solution**: Install Python3: `apt-get install python3`
- **Solution**: Create symlink: `ln -sf /usr/bin/python3 /usr/bin/python`
- **Solution**: Set environment variable: `export PYTHON=/usr/bin/python3`

## Alternative Packages

If canvas continues to cause issues, consider these alternatives:

1. **skia-canvas** - Modern canvas implementation
   ```bash
   npm install skia-canvas
   ```

2. **fabric.js** - Canvas library with server-side support
   ```bash
   npm install fabric
   ```

3. **konva** - 2D canvas library
   ```bash
   npm install konva
   ```

## Environment Variables

Set these environment variables to help with canvas compilation:

```bash
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

## Platform-Specific Notes

### Ubuntu/Debian
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### Windows
- Install Visual Studio Build Tools
- Install Python 3.x
- Use prebuilt binaries when possible

## Debugging

### Enable verbose logging
```bash
npm install --verbose
```

### Check canvas installation
```bash
npm list canvas
```

### Test canvas functionality
```javascript
const { createCanvas } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 200, 200);
console.log('Canvas test passed!');
```

## Current Implementation

The current setup uses:
- Node.js 18.19.0
- Canvas 2.11.2 with prebuilt binaries
- Python3 for native compilation
- Proper build tools in Docker

This should resolve the compilation issues while maintaining modern Node.js compatibility.
