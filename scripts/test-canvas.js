#!/usr/bin/env node

// Test script to verify canvas installation
console.log('🧪 Testing canvas installation...');

try {
  const { createCanvas } = require('canvas');
  
  // Create a test canvas
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Draw a simple test
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 200, 200);
  
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Canvas Works!', 50, 100);
  
  console.log('✅ Canvas installation successful!');
  console.log('✅ Canvas size:', canvas.width, 'x', canvas.height);
  console.log('✅ Canvas context available:', !!ctx);
  
} catch (error) {
  console.error('❌ Canvas installation failed:');
  console.error(error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check if all build dependencies are installed');
  console.error('2. Try running: npm config set python python3');
  console.error('3. Try running: npm config set canvas_binary_host_mirror https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/');
  console.error('4. Reinstall canvas: npm install canvas@^2.11.2');
  console.error('5. See CANVAS-TROUBLESHOOTING.md for more help');
  process.exit(1);
}
