#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Updating dependencies with audit suppression...');

// Set npm config to suppress warnings
try {
  execSync('npm config set audit-level moderate', { stdio: 'inherit' });
  execSync('npm config set fund false', { stdio: 'inherit' });
  execSync('npm config set update-notifier false', { stdio: 'inherit' });
  // Set environment variables for canvas compilation
  process.env.PYTHON = '/usr/bin/python3';
  process.env.npm_config_python = '/usr/bin/python3';
  process.env.npm_config_canvas_binary_host_mirror = 'https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/';
  
  console.log('✅ NPM configuration updated');
} catch (error) {
  console.warn('⚠️  Warning: Could not set npm config:', error.message);
}

// Update package-lock.json
try {
  execSync('npm install --package-lock-only --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ Package-lock.json updated');
} catch (error) {
  console.warn('⚠️  Warning: Could not update package-lock.json:', error.message);
}

// Install canvas separately first
try {
  console.log('Installing canvas separately...');
  execSync('npm install canvas@3.2.0 --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ Canvas installed');
} catch (error) {
  console.warn('⚠️  Warning: Could not install canvas:', error.message);
}

// Install remaining dependencies
try {
  console.log('Installing remaining dependencies...');
  execSync('npm install --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.warn('⚠️  Warning: Could not install dependencies:', error.message);
}

console.log('🎉 Update complete!');
