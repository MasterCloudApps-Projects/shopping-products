module.exports = {
  'server.port': process.env.SERVER_PORT || 3445,
  'server.key.path': process.env.KEY_PATH || './certs/private-key.pem',
  'server.cert.path': process.env.CERT_PATH || './certs/cert.pem',

  'dynamo.region': process.env.AWS_REGION || 'local',
  'dynamo.endpoint': process.env.AWS_DYNAMO_ENDPOINT || 'http://localhost:8000',
  'dynamo.accessKeyId': process.env.AWS_ACCESS_KEY_ID || 'xxxx',
  'dynamo.secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY || 'xxxxx',
  'dynamo.maxRetries': process.env.DYNAMO_RETRIES || 11,

  'kafka.enabled': process.env.KAFKA_ENABLED || false,
  'kafka.retry.initialRetryTime': process.env.KAFKA_INIT_RETY_TIME || 10000,
  'kafka.retry.retries': process.env.KAFKA_RETRIES || 3,
  'kafka.host': process.env.KAFKA_HOST || '127.0.0.1',
  'kafka.port': process.env.KAFKA_PORT || 9092,
  'kafka.groupId': process.env.GROUP_ID || 'products-group',
  'kafka.topics.validateItems': process.env.VALIDATE_ITEMS_TOPIC || 'validate-items',
  'kafka.topics.changeState': process.env.CHANGE_ORDER_STATE || 'change-orders-state',
  'kafka.topics.restoreStock': process.env.RESET_STOCK_TOPIC || 'restore-stock',

  secret: process.env.TOKEN_SECRET || 'supersecret',
  'token.expiration': process.env.TOKEN_EXPIRATION || 300,
};
