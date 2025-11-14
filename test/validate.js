const { login } = require('../index');

console.log('✅ neokex-fca package validation');
console.log('✅ Login function imported successfully');
console.log(`✅ Login function type: ${typeof login}`);

if (typeof login !== 'function') {
    console.error('❌ Login is not a function!');
    process.exit(1);
}

console.log('✅ All validation checks passed!');
console.log('\n📦 Package is ready for use');
console.log('💡 To use: const { login } = require("neokex-fca");');
