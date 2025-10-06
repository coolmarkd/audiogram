# Modern Installation Guide

## Prerequisites
- Node.js 18.19.0 or higher
- npm 8.0.0 or higher

## Installation with Audit Suppression

### Option 1: Using the install script
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Option 2: Manual installation
```bash
# Suppress npm audit warnings
npm config set audit-level moderate
npm config set fund false
npm config set update-notifier false

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
