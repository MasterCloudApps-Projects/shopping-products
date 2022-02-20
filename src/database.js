const AWS = require('aws-sdk');
const config = require('../config/config');

const PRODUCTS_TABLE = 'products';

// CONFIGURE AWS TO USE LOCAL REGION AND DEFAULT ENDPOINT (LOCALHOST) FOR DYNAMODB
AWS.config.update({
  region: config['dynamo.region'],
  endpoint: config['dynamo.endpoint'],
  accessKeyId: config['dynamo.accessKeyId'],
  secretAccessKey: config['dynamo.secretAccessKey'],
});

// Init DB: Create table if not exist

const initDatabase = async () => {
  // Create client at function level to have right config
  const dynamobDB = new AWS.DynamoDB();

  return dynamobDB.createTable({
    TableName: PRODUCTS_TABLE,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  }).promise().catch((reason) => {
    if (reason.message !== 'Cannot create preexisting table') {
      console.error(reason.message);
    }
  });
};

module.exports = initDatabase;
