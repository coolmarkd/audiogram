# Audiogram Modernization

This document outlines the modernization changes made to the Audiogram repository.

## Changes Made

### 1. Node.js Version Update
- Updated from legacy Node.js to **Node.js 18.19.0 LTS**
- Added `.nvmrc` file for consistent Node.js version management
- Updated `package.json` engines field to require Node.js 18+

### 2. Dependency Updates
All npm packages have been updated to their latest compatible versions:

#### Major Updates:
- **aws-sdk**: `^2.2.39` → `^2.1691.0`
- **browserify**: `^13.0.0` → `^17.0.0`
- **canvas**: Custom git → `^2.11.2` (official package)
- **d3**: `4.10.0` → `^7.8.5`
- **express**: `^4.13.3` → `^4.18.2`
- **jquery**: `^2.2.1` → `^3.7.1`
- **redis**: `^2.4.2` → `^4.6.10`
- **winston**: `^2.2.0` → `^3.11.0`

#### Other Updates:
- compression: `^1.6.1` → `^1.7.4`
- dotenv: `^2.0.0` → `^16.3.1`
- mkdirp: `^0.5.1` → `^3.0.1`
- morgan: `^1.7.0` → `^1.10.0`
- multer: `^1.1.0` → `^1.4.5-lts.1`
- rimraf: `^2.5.0` → `^5.0.5`
- smartquotes: `^1.0.0` → `^2.0.1`
- underscore: `^1.8.3` → `^1.13.6`
- uuid: `^3.0.1` → `^9.0.1`

### 3. Audit Warning Suppression
- Created `.npmrc` file with audit suppression settings
- Added npm scripts for audit management
- Updated Dockerfile to use audit suppression during installation

### 4. Docker Modernization
- Updated base image from `ubuntu:16.04` to `node:18.19.0-slim`
- Streamlined package installation
- Added audit suppression to Docker build process

### 5. Scripts and Automation
- Added `scripts/install.sh` for automated installation
- Added `scripts/update-deps.js` for dependency updates
- Added npm scripts for audit management

## Installation

### Quick Start
```bash
# Using nvm (recommended)
nvm install 18.19.0
nvm use 18.19.0

# Install dependencies
npm install

# Start the application
npm start
```

### Using the Install Script
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

## Benefits

1. **Security**: Updated dependencies with latest security patches
2. **Performance**: Modern Node.js with improved performance
3. **Maintainability**: Latest package versions with better support
4. **Developer Experience**: Suppressed audit warnings for cleaner output
5. **Compatibility**: Modern APIs and features available

## Breaking Changes

⚠️ **Important**: Some dependencies have breaking changes:

1. **D3.js v7**: API changes from v4, may require code updates
2. **Winston v3**: Logging API changes
3. **Redis v4**: Client API changes
4. **Canvas**: Updated to v3.2.0 with Node.js 18 compatibility fixes

## Canvas Compilation Fixes

The canvas package has been updated to work with Node.js 18.19.0:

- **Updated to canvas v3.2.0** with Node.js 18 compatibility
- **Added Python3 support** for native module compilation
- **Configured prebuilt binaries** to avoid compilation issues
- **Updated Docker setup** with proper build tools
- **Created troubleshooting guide** for canvas-related issues

### Canvas Installation
```bash
# Use the provided scripts
chmod +x scripts/install-canvas.sh
./scripts/install-canvas.sh

# Or install manually with proper environment variables
export PYTHON=/usr/bin/python3
export npm_config_python=/usr/bin/python3
export npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/
npm install
```

## Testing

After installation, run the test suite to ensure everything works:

```bash
npm test
```

## Rollback

If issues occur, you can rollback by:
1. Reverting `package.json` to original versions
2. Running `npm install` to restore original dependencies
3. Using Node.js version specified in original setup

## Support

For issues related to modernization:
1. Check the updated documentation
2. Review breaking changes in dependency changelogs
3. Test with the provided scripts
