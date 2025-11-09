const fs = require('fs');
const express = require('express');
const { login } = require('neokex-fca');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'my-secret-key';

app.post('/webhook', (req, res) => {
  const secret = req.headers['x-webhook-secret'];
  
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, data, timestamp } = req.body;
  
  console.log(`📨 Webhook event: ${event}`, data);
  
  res.json({ success: true, received: timestamp });
});

app.listen(PORT, () => {
  console.log(`🌐 Webhook server running on port ${PORT}`);
});

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({ appState }, {
  online: true,
  webhook: {
    enabled: true,
    url: `http://localhost:${PORT}/webhook`,
    events: ['message', 'event'],
    secret: WEBHOOK_SECRET
  }
}, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    return;
  }

  console.log('✅ Bot connected with webhook integration!');

  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    
    if (event.type === 'message' && event.body === '/status') {
      api.sendMessage('✅ Bot is running with webhook support!', event.threadID);
    }
  });
});
