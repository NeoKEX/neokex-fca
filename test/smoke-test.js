const neoKex = require('../index.js');

console.log('✓ Testing library import...');

if (!neoKex.login || typeof neoKex.login !== 'function') {
  console.error('✗ Failed: login function not exported');
  process.exit(1);
}

if (!neoKex.Logger) {
  console.error('✗ Failed: Logger not exported');
  process.exit(1);
}

if (!neoKex.WebhookManager) {
  console.error('✗ Failed: WebhookManager not exported');
  process.exit(1);
}

if (!neoKex.PluginManager) {
  console.error('✗ Failed: PluginManager not exported');
  process.exit(1);
}

console.log('✓ All exports validated successfully');
console.log('✓ Library smoke test passed!');
process.exit(0);
