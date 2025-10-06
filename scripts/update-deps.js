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

// Install dependencies
try {
  execSync('npm install --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.warn('⚠️  Warning: Could not install dependencies:', error.message);
}

console.log('🎉 Update complete!');
