const fs = require('fs');
const path = require('path');

function convertCookiesToAppState(browserCookies) {
    const appState = [];
    
    const domains = ['.facebook.com', '.messenger.com', '.m.facebook.com'];
    
    browserCookies.forEach(cookie => {
        domains.forEach(domain => {
            appState.push({
                key: cookie.name,
                value: cookie.value,
                domain: domain,
                path: cookie.path || '/',
                hostOnly: false,
                creation: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                expires: cookie.expirationDate 
                    ? new Date(cookie.expirationDate * 1000).toISOString()
                    : null
            });
        });
    });
    
    return appState;
}

const cookiesPath = path.join(__dirname, '..', 'attached_assets', 'Pasted--name-ps-l-value-1-domain-facebook-com-ho-1763214643366_1763214643388.txt');
const browserCookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));

const appState = convertCookiesToAppState(browserCookies);

const outputPath = path.join(__dirname, 'appstate.json');
fs.writeFileSync(outputPath, JSON.stringify(appState, null, 2));

console.log('✅ Cookie conversion complete!');
console.log(`✅ AppState saved to: ${outputPath}`);
console.log(`✅ Total cookies: ${appState.length}`);

const c_user = browserCookies.find(c => c.name === 'c_user');
const xs = browserCookies.find(c => c.name === 'xs');
const datr = browserCookies.find(c => c.name === 'datr');

console.log('\n📊 Session Info:');
console.log(`   User ID: ${c_user?.value || 'NOT FOUND'}`);
console.log(`   Session: ${xs ? 'PRESENT' : 'MISSING'}`);
console.log(`   Device: ${datr ? 'PRESENT' : 'MISSING'}`);

module.exports = { convertCookiesToAppState };
