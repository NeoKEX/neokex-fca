const { login } = require('./lib/index');
const fs = require('fs');

const cookiesJSON = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
const TEST_THREAD_ID = '24102757045983863';

const options = {
  selfListen: false,
  listenEvents: true,
  autoMarkRead: false,
  online: true,
  logging: true
};

async function testThemeChange(api) {
  console.log('\n🎨 Testing Theme Functions on Thread:', TEST_THREAD_ID);
  console.log('═'.repeat(70));
  
  try {
    // Wait for MQTT connection
    console.log('\n⏳ Waiting for MQTT connection...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (!api.ctx.mqttClient) {
      console.log('❌ MQTT not connected. Starting listener...');
      
      // Start MQTT listener
      api.listenMqtt((err, event) => {
        if (err) {
          console.error('Listen error:', err);
          return;
        }
        if (event) {
          console.log('📨 Event:', event.type);
        }
      });
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    if (api.ctx.mqttClient) {
      console.log('✅ MQTT connected!\n');
    } else {
      console.log('⚠️  MQTT still not connected, theme changes may not work\n');
    }
    
    // Test 1: List available themes
    console.log('📋 Step 1: Listing all available themes...\n');
    try {
      const themes = await api.theme('list', TEST_THREAD_ID);
      console.log(`✅ Found ${themes.length} themes:\n`);
      
      themes.slice(0, 10).forEach((theme, index) => {
        console.log(`   ${index + 1}. ${theme.name} (ID: ${theme.id})`);
      });
      
      if (themes.length > 10) {
        console.log(`   ... and ${themes.length - 10} more themes`);
      }
      
      // Test 2: Get current theme info
      console.log('\n📊 Step 2: Getting current theme info...\n');
      const currentTheme = await api.getThemeInfo(TEST_THREAD_ID);
      console.log('   Current theme:', JSON.stringify(currentTheme, null, 2));
      
      // Test 3: Change to a specific theme
      console.log('\n🎨 Step 3: Attempting to change theme...\n');
      
      // Try to change to "Love" theme (common theme)
      const loveTheme = themes.find(t => t.name.toLowerCase().includes('love'));
      if (loveTheme) {
        console.log(`   Changing to: ${loveTheme.name} (${loveTheme.id})`);
        
        if (api.ctx.mqttClient) {
          try {
            const result = await api.theme(loveTheme.name, TEST_THREAD_ID);
            console.log('   ✅ Theme change successful!');
            console.log('   Result:', JSON.stringify(result, null, 2));
          } catch (themeErr) {
            console.log('   ❌ Theme change failed:', themeErr.message);
          }
        } else {
          console.log('   ⚠️  Cannot change theme - MQTT not connected');
          console.log('   Try using: api.setThreadThemeMqtt(threadID, themeID)');
        }
      } else {
        console.log('   ⚠️  Love theme not found, trying first theme...');
        if (themes.length > 0 && api.ctx.mqttClient) {
          try {
            const result = await api.theme(themes[0].name, TEST_THREAD_ID);
            console.log('   ✅ Theme change successful!');
            console.log('   Result:', JSON.stringify(result, null, 2));
          } catch (themeErr) {
            console.log('   ❌ Theme change failed:', themeErr.message);
          }
        }
      }
      
      // Test 4: Test alternative theme change method (MQTT direct)
      console.log('\n🔧 Step 4: Testing direct MQTT theme change...\n');
      if (api.ctx.mqttClient && themes.length > 0) {
        try {
          const testTheme = themes[0];
          console.log(`   Using setThreadThemeMqtt with theme: ${testTheme.name}`);
          await api.setThreadThemeMqtt(TEST_THREAD_ID, testTheme.id);
          console.log('   ✅ MQTT theme change successful!');
        } catch (mqttErr) {
          console.log('   ❌ MQTT theme change failed:', mqttErr.message);
        }
      } else {
        console.log('   ⚠️  Skipped - MQTT not available');
      }
      
      // Test 5: Test threadColors helper
      console.log('\n🌈 Step 5: Available thread colors:\n');
      const colors = api.threadColors();
      Object.entries(colors).forEach(([name, id]) => {
        console.log(`   ${name}: ${id}`);
      });
      
    } catch (err) {
      console.error('❌ Error during theme operations:', err.message);
      console.error('Stack:', err.stack);
    }
    
  } catch (err) {
    console.error('\n❌ Test error:', err);
  }
  
  console.log('\n═'.repeat(70));
  console.log('\n✨ Theme testing complete!\n');
  
  // Keep alive for a moment to see results
  setTimeout(() => {
    console.log('Exiting...');
    process.exit(0);
  }, 2000);
}

login({ appState: cookiesJSON }, options, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }

  console.log('✅ Logged in successfully!');
  console.log('User ID:', api.getCurrentUserID());
  
  testThemeChange(api);
});
