# Canvas Build Solution

## Problem
The canvas package compilation fails with Node.js 18.19.0 due to V8 API changes and deprecated methods.

## Solutions Implemented

### Solution 1: Separate Canvas Installation (Primary)
- **File**: `Dockerfile` (main)
- **Canvas Version**: `3.2.0` (exact version, installed separately)
- **Node.js Version**: `18.19.0`
- **Status**: Canvas installed separately to avoid dependency conflicts

### Solution 2: Node.js 16 Fallback (Alternative)
- **File**: `Dockerfile.node16`
- **Canvas Version**: `2.11.2` (exact version, installed separately)
- **Node.js Version**: `16.20.2`
- **Status**: Guaranteed compatibility

## Usage

### Try Solution 1 First (Node.js 18 + Canvas 3.2.0)
```bash
docker build -t audiogram .
```

### If Solution 1 Fails, Use Solution 2 (Node.js 16 + Canvas 2.11.2)
```bash
docker build -f Dockerfile.node16 -t audiogram .
```

## Key Changes Made

### 1. Updated package.json
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    // Canvas removed from dependencies - installed separately
  }
}
```

### 2. Updated Dockerfile (Node.js 18)
- Uses Node.js 18.19.0
- Canvas 3.2.0 installed separately
- Proper build tools and environment variables

### 3. Created Dockerfile.node16 (Fallback)
- Uses Node.js 16.20.2
- Canvas 2.11.2 installed separately
- Same build configuration

### 4. Updated Scripts
- `scripts/install-canvas.sh` - Installs canvas 3.2.0 separately
- `scripts/install-canvas-node16.sh` - Installs canvas 2.11.2 separately
- All environment variables properly set

## Environment Variables
```bash
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
ENV npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
```

## Build Tools Required
```dockerfile
RUN apt-get install -y \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpng-dev \
    python3 \
    make \
    pkg-config
```

## Testing
```bash
# Test canvas installation
npm run test:canvas

# Test Docker build
docker build -t audiogram .
```

## Troubleshooting

### If Canvas 3.2.0 Still Fails
1. Use the Node.js 16 fallback: `docker build -f Dockerfile.node16 -t audiogram .`
2. Check canvas compatibility: `npm view canvas versions`
3. Consider alternative packages: `skia-canvas`, `fabric.js`

### Common Issues
- **Missing build tools**: Ensure all dependencies are installed
- **Python version**: Must be Python 3.x
- **Node.js version**: Canvas 3.2.0 requires Node.js 18+

## Files Modified
- `package.json` - Updated canvas version
- `Dockerfile` - Node.js 18 + Canvas 3.2.0
- `Dockerfile.node16` - Node.js 16 + Canvas 2.11.2 (fallback)
- `scripts/install-canvas.sh` - Updated canvas version
- `.nvmrc` - Node.js version
- Documentation files - Updated version references

## Next Steps
1. Test the primary solution (Node.js 18 + Canvas 3.2.0)
2. If it fails, use the fallback (Node.js 16 + Canvas 2.11.2)
3. Update documentation based on which solution works
4. Consider long-term migration strategy
