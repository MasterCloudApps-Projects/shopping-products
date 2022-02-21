module.exports = {
  'server.port': process.env.SERVER_PORT || 3445,
  'server.key.path': process.env.KEY_PATH || './certs/private-key.pem',
  'server.cert.path': process.env.CERT_PATH || './certs/cert.pem',

  'dynamo.region': process.env.AWS_REGION || 'local',
  'dynamo.endpoint': process.env.AWS_DYNAMO_ENDPOINT || 'http://localhost:8000',
  'dynamo.accessKeyId': process.env.AWS_ACCESS_KEY_ID || 'xxxx',
  'dynamo.secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY || 'xxxxx',

  secret: process.env.TOKEN_SECRET || 'supersecret',
  'token.expiration': process.env.TOKEN_EXPIRATION || 300,
};
