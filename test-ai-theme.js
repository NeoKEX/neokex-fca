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

async function testAITheme(api) {
  console.log('\n🤖 Testing AI Theme Generation\n');
  console.log('═'.repeat(70));
  
  try {
    // Test different prompts
    const prompts = [
      "a beautiful sunset over the ocean with purple and orange colors",
      "space theme with stars and galaxies",
      "neon cyberpunk theme with pink and blue"
    ];
    
    console.log('🎨 Generating AI themes from custom prompts...\n');
    
    for (const prompt of prompts) {
      console.log(`📝 Prompt: "${prompt}"`);
      console.log('   Generating...');
      
      try {
        const themes = await api.createAITheme(prompt);
        
        if (themes && themes.length > 0) {
          console.log(`   ✅ Generated ${themes.length} theme(s):\n`);
          
          themes.forEach((theme, index) => {
            console.log(`   Theme ${index + 1}:`);
            console.log(`      ID: ${theme.id}`);
            console.log(`      Accessibility Label: ${theme.accessibility_label || 'N/A'}`);
            
            if (theme.gradient_colors && theme.gradient_colors.length > 0) {
              console.log(`      Gradient Colors: ${theme.gradient_colors.join(', ')}`);
            }
            
            if (theme.background_gradient_colors && theme.background_gradient_colors.length > 0) {
              console.log(`      Background: ${theme.background_gradient_colors.join(', ')}`);
            }
            
            if (theme.fallback_color) {
              console.log(`      Fallback Color: ${theme.fallback_color}`);
            }
            
            console.log('');
          });
          
          // Try to apply the first generated theme
          if (themes[0].id) {
            console.log('   🎯 Attempting to apply the generated theme...');
            
            // Wait for MQTT connection
            if (!api.ctx.mqttClient) {
              console.log('   ⏳ Starting MQTT listener...');
              api.listenMqtt((err, event) => {
                if (err) console.error('   Listen error:', err);
              });
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            if (api.ctx.mqttClient) {
              try {
                await api.setThreadThemeMqtt(TEST_THREAD_ID, themes[0].id);
                console.log('   ✅ AI-generated theme applied successfully!');
              } catch (applyErr) {
                console.log('   ⚠️  Could not apply theme:', applyErr.message);
              }
            } else {
              console.log('   ⚠️  MQTT not connected, cannot apply theme automatically');
              console.log(`   💡 You can manually apply using theme ID: ${themes[0].id}`);
            }
          }
          
        } else {
          console.log('   ⚠️  No themes generated\n');
        }
        
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        
        if (err.message && err.message.includes('premium')) {
          console.log('   ℹ️  Note: AI theme generation may require Facebook Premium/Meta Verified');
        }
      }
      
      console.log('   ' + '─'.repeat(65) + '\n');
    }
    
  } catch (err) {
    console.error('\n❌ Test error:', err.message);
  }
  
  console.log('═'.repeat(70));
  console.log('\n💡 How to use AI themes:\n');
  console.log('   1. Call: api.createAITheme("your custom prompt")');
  console.log('   2. Get the generated theme ID from the response');
  console.log('   3. Apply it: api.setThreadThemeMqtt(threadID, themeID)');
  console.log('   OR use: api.theme(themeID, threadID)\n');
  
  console.log('📝 Example prompts to try:');
  console.log('   - "dark mode with green accents"');
  console.log('   - "pastel rainbow colors"');
  console.log('   - "halloween theme with orange and black"');
  console.log('   - "minimalist white and gold"');
  console.log('   - "retro 80s neon"');
  console.log('   - "nature theme with forest greens"\n');
  
  console.log('✨ AI theme testing complete!\n');
  
  setTimeout(() => process.exit(0), 2000);
}

login({ appState: cookiesJSON }, options, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }

  console.log('✅ Logged in successfully!');
  console.log('User ID:', api.getCurrentUserID());
  
  testAITheme(api);
});
