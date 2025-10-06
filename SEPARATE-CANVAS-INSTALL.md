# Separate Canvas Installation Guide

## Overview
Canvas is now installed separately from other dependencies to avoid compilation conflicts and ensure we get the exact version needed.

## Why Separate Installation?

1. **Avoid Dependency Conflicts**: Canvas has complex native dependencies that can conflict with other packages
2. **Exact Version Control**: We can specify the exact canvas version needed
3. **Better Error Isolation**: If canvas fails, other dependencies can still install
4. **Cleaner Build Process**: Canvas compilation happens first, then other dependencies

## Installation Methods

### Method 1: Using Scripts (Recommended)

#### For Node.js 18 (Primary)
```bash
chmod +x scripts/install-canvas.sh
./scripts/install-canvas.sh
```

#### For Node.js 16 (Fallback)
```bash
chmod +x scripts/install-canvas-node16.sh
./scripts/install-canvas-node16.sh
```

### Method 2: Manual Installation

#### Node.js 18
```bash
# Set environment variables
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately
npm install canvas@3.2.0 --audit-level=moderate --fund=false

# Install remaining dependencies
npm install --audit-level=moderate --fund=false
```

#### Node.js 16
```bash
# Set environment variables
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately
npm install canvas@2.11.2 --audit-level=moderate --fund=false

# Install remaining dependencies
npm install --audit-level=moderate --fund=false
```

### Method 3: Docker

#### Primary (Node.js 18)
```bash
docker build -t audiogram .
```

#### Fallback (Node.js 16)
```bash
docker build -f Dockerfile.node16 -t audiogram .
```

**Note**: Both Dockerfiles use local files instead of cloning from GitHub, so your current changes will be included in the build.

## Canvas Versions

| Node.js Version | Canvas Version | Status |
|----------------|----------------|---------|
| 18.19.0 | 3.2.0 | Primary (latest) |
| 16.20.2 | 2.11.2 | Fallback (stable) |

## Environment Variables

These environment variables are required for canvas compilation:

```bash
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

## Build Dependencies

Required system packages for canvas compilation:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev python3 make pkg-config

# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg python3
```

## Testing

After installation, test canvas:

```bash
# Run the canvas test
npm run test:canvas

# Or test manually
node -e "const { createCanvas } = require('canvas'); console.log('Canvas works!');"
```

## Troubleshooting

### Canvas Installation Fails
1. Check Node.js version compatibility
2. Ensure all build dependencies are installed
3. Try the Node.js 16 fallback
4. Check environment variables

### Canvas Not Found
1. Verify canvas was installed: `npm list canvas`
2. Check if it's in node_modules: `ls node_modules/canvas`
3. Reinstall canvas separately

### Build Errors
1. Check Python version (must be 3.x)
2. Verify build tools are installed
3. Try using prebuilt binaries
4. Check npm cache: `npm cache clean --force`

## Files Modified

- `package.json` - Removed canvas from dependencies
- `Dockerfile` - Canvas installed separately
- `Dockerfile.node16` - Canvas installed separately
- `scripts/install-canvas.sh` - Separate canvas installation
- `scripts/install-canvas-node16.sh` - Node.js 16 version
- `scripts/install.sh` - Updated for separate installation
- `scripts/update-deps.js` - Separate canvas installation

## Benefits

1. **Cleaner Dependencies**: package.json doesn't include problematic canvas
2. **Better Control**: Exact canvas version specified
3. **Easier Debugging**: Canvas issues isolated from other dependencies
4. **Flexible Installation**: Can use different canvas versions for different Node.js versions
5. **Faster Builds**: Canvas compilation happens first, other deps can install in parallel

## Next Steps

1. Test the separate installation approach
2. Verify canvas functionality
3. Update CI/CD pipelines if needed
4. Document any issues or improvements
