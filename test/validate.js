#!/usr/bin/env node

/**
 * NeoKEX-FCA Library Validation Test
 * This script validates the library structure and exports
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 NeoKEX-FCA Library Validation\n');
console.log('='.repeat(50));

let hasErrors = false;

console.log('\n1. Checking main entry point...');
try {
    const mainExport = require('../index.js');
    if (typeof mainExport.login === 'function') {
        console.log('✅ Main export (login function) found');
    } else {
        console.error('❌ Main export missing login function');
        hasErrors = true;
    }
} catch (e) {
    console.error('❌ Error loading main entry:', e.message);
    hasErrors = true;
}

console.log('\n2. Checking API modules...');
const apisPath = path.join(__dirname, '..', 'src', 'apis');
if (fs.existsSync(apisPath)) {
    const apiFiles = fs.readdirSync(apisPath).filter(f => f.endsWith('.js'));
    console.log(`✅ Found ${apiFiles.length} API modules`);
    
    const criticalApis = [
        'sendMessage.js',
        'sendMessageMqtt.js', 
        'listenMqtt.js',
        'getThreadInfo.js',
        'getUserInfo.js',
        'setMessageReaction.js',
        'theme.js',
        'createAITheme.js'
    ];
    
    criticalApis.forEach(api => {
        if (apiFiles.includes(api)) {
            console.log(`   ✓ ${api}`);
        } else {
            console.error(`   ✗ Missing: ${api}`);
            hasErrors = true;
        }
    });
} else {
    console.error('❌ APIs directory not found');
    hasErrors = true;
}

console.log('\n3. Checking utilities...');
try {
    const utils = require('../src/utils');
    const requiredUtils = ['getHeaders', 'randomUserAgent', 'getJar'];
    requiredUtils.forEach(util => {
        if (typeof utils[util] === 'function') {
            console.log(`   ✓ ${util}`);
        } else {
            console.error(`   ✗ Missing: ${util}`);
            hasErrors = true;
        }
    });
} catch (e) {
    console.error('❌ Error loading utilities:', e.message);
    hasErrors = true;
}

console.log('\n4. Checking engine models...');
const modelsPath = path.join(__dirname, '..', 'src', 'engine', 'models');
if (fs.existsSync(modelsPath)) {
    const models = ['loginHelper.js', 'buildAPI.js', 'setOptions.js'];
    models.forEach(model => {
        const modelPath = path.join(modelsPath, model);
        if (fs.existsSync(modelPath)) {
            console.log(`   ✓ ${model}`);
        } else {
            console.error(`   ✗ Missing: ${model}`);
            hasErrors = true;
        }
    });
} else {
    console.error('❌ Models directory not found');
    hasErrors = true;
}

console.log('\n5. Checking TypeScript definitions...');
const tsDefsPath = path.join(__dirname, '..', 'src', 'types', 'index.d.ts');
if (fs.existsSync(tsDefsPath)) {
    console.log('✅ TypeScript definitions found');
} else {
    console.error('❌ TypeScript definitions missing');
    hasErrors = true;
}

console.log('\n6. Checking documentation files...');
const docs = ['README.md', 'API_REFERENCE.md', 'CHANGELOG.md', 'CONTRIBUTING.md'];
docs.forEach(doc => {
    const docPath = path.join(__dirname, '..', doc);
    if (fs.existsSync(docPath)) {
        console.log(`   ✓ ${doc}`);
    } else {
        console.error(`   ✗ Missing: ${doc}`);
        hasErrors = true;
    }
});

console.log('\n7. Package structure validation...');
try {
    const pkg = require('../package.json');
    if (pkg.name === 'neokex-fca') {
        console.log(`✅ Package name: ${pkg.name}`);
        console.log(`✅ Version: ${pkg.version}`);
        console.log(`✅ Main entry: ${pkg.main}`);
    } else {
        console.error('❌ Invalid package name');
        hasErrors = true;
    }
} catch (e) {
    console.error('❌ Error reading package.json:', e.message);
    hasErrors = true;
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ VALIDATION FAILED - Library has errors\n');
    process.exit(1);
} else {
    console.log('✅ VALIDATION PASSED - Library structure is valid\n');
    console.log('📦 NeoKEX-FCA is ready to use!');
    console.log('   Install: npm install neokex-fca');
    console.log('   Usage: const { login } = require("neokex-fca");\n');
    process.exit(0);
}
