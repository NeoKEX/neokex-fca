const fs = require('fs');
const { login } = require('neokex-fca');

const commandPlugin = {
  name: 'command-handler',
  commands: new Map(),
  
  init() {
    console.log('🔌 Command plugin initialized');
  },
  
  register(name, handler, description = '') {
    this.commands.set(name, { handler, description });
    console.log(`✅ Registered command: ${name}`);
  },
  
  async execute(message, api) {
    const [cmd, ...args] = message.body.trim().split(/\s+/);
    
    if (!cmd.startsWith('/')) return;
    
    const command = this.commands.get(cmd);
    
    if (command) {
      try {
        await command.handler(api, message, args);
      } catch (error) {
        api.sendMessage(`❌ Error: ${error.message}`, message.threadID);
      }
    }
  },
  
  getHelp() {
    const commands = Array.from(this.commands.entries())
      .map(([name, { description }]) => `${name} - ${description}`)
      .join('\n');
    return `📋 Available Commands:\n${commands}`;
  }
};

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({ appState }, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err.message);
    return;
  }

  console.log('✅ Bot online with plugin system!');

  api.plugins.register('commands', commandPlugin);

  commandPlugin.register('/ping', (api, msg) => {
    api.sendMessage('🏓 Pong!', msg.threadID);
  }, 'Test bot responsiveness');

  commandPlugin.register('/time', (api, msg) => {
    const now = new Date().toLocaleString();
    api.sendMessage(`⏰ ${now}`, msg.threadID);
  }, 'Get current time');

  commandPlugin.register('/help', (api, msg) => {
    const help = commandPlugin.getHelp();
    api.sendMessage(help, msg.threadID);
  }, 'Show available commands');

  commandPlugin.register('/info', async (api, msg, args) => {
    const userId = args[0] || msg.senderID;
    api.getUserInfo(userId, (err, user) => {
      if (err) return api.sendMessage('❌ User not found', msg.threadID);
      api.sendMessage(`👤 ${user.name}\n🔗 ${user.profileUrl}`, msg.threadID);
    });
  }, 'Get user information');

  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    
    if (event.type === 'message' && event.body) {
      commandPlugin.execute(event, api);
    }
  });
});
