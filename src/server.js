const fs = require('fs');
const https = require('https');
const app = require('./app');
const initDatabase = require('./database');
const broker = require('./broker');
const config = require('../config/config');

async function init() {
  try {
    await initDatabase();
    await broker.listen();
    https.createServer({
      key: fs.readFileSync(config['server.key.path']),
      cert: fs.readFileSync(config['server.cert.path']),
    }, app).listen(config['server.port'], () => {
      console.log('Https server started in port', config['server.port']);
    });
  } catch (error) {
    console.error('Error starting app:', error);
  }
}

init();

const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.forEach((type) => {
  process.on(type, async (e) => {
    try {
      console.log('Process terminated');
      console.log(`process.on ${type}`);
      console.error(e);
      await broker.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach((type) => {
  process.once(type, async () => {
    try {
      await broker.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
