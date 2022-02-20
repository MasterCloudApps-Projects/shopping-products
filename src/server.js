const fs = require('fs');
const https = require('https');
const app = require('./app');
const initDatabase = require('./database');
const config = require('../config/config');

initDatabase()
  .then(() => {
    https.createServer({
      key: fs.readFileSync(config['server.key.path']),
      cert: fs.readFileSync(config['server.cert.path']),
    }, app).listen(config['server.port'], () => {
      console.log('Https server started in port', config['server.port']);
    });
  })
  .catch((error) => {
    console.error('Error starting app:', error);
  });

process.on('SIGINT', () => {
  console.log('Process terminated');
  process.exit(0);
});
