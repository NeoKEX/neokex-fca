#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 NeoKEX-FCA Structure Validation Test\n');
console.log('========================================\n');

const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'example.js',
  'lib/index.js',
  'lib/types/index.d.ts',
  'src/core/client.js',
  'src/core/orchestrator/buildAPI.js',
  'src/core/orchestrator/loginHelper.js',
  'src/core/orchestrator/setOptions.js',
  'src/helpers/index.js',
  'src/helpers/constants.js',
  'src/helpers/network.js',
  'src/helpers/clients.js'
];

const requiredDirs = [
  'src/engine/functions/messaging',
  'src/engine/functions/conversations',
  'src/engine/functions/accounts',
  'src/engine/functions/social',
  'src/engine/functions/auth',
  'src/engine/functions/network',
  'src/engine/functions/realtime',
  'src/engine/functions/utilities'
];

let passed = 0;
let failed = 0;

console.log('📁 Checking required files...\n');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    passed++;
  } else {
    console.log(`❌ ${file} - MISSING`);
    failed++;
  }
});

console.log('\n📂 Checking required directories...\n');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
    console.log(`✅ ${dir} (${files.length} files)`);
    passed++;
  } else {
    console.log(`❌ ${dir} - MISSING`);
    failed++;
  }
});

console.log('\n🔍 Testing module loading...\n');
try {
  const { login } = require('./lib/index.js');
  if (typeof login === 'function') {
    console.log('✅ Main module loads correctly');
    console.log('✅ login function is exported');
    passed += 2;
  } else {
    console.log('❌ login function not found');
    failed++;
  }
} catch (error) {
  console.log(`❌ Failed to load module: ${error.message}`);
  failed++;
}

console.log('\n📊 Test Summary\n');
console.log('========================================');
console.log(`Total Tests: ${passed + failed}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All structure validation tests passed!');
  console.log('\n✨ NeoKEX-FCA v3.0.0 is ready for npm publication!');
  console.log('\n📦 To publish to npm:');
  console.log('   1. cd neokex-fca');
  console.log('   2. npm login');
  console.log('   3. npm publish');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
  process.exit(1);
}
