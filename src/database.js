const AWS = require('aws-sdk');
const config = require('../config/config');

const COUNTER_TABLE = 'counter';
const PRODUCTS_TABLE = 'products';

// CONFIGURE AWS TO USE LOCAL REGION AND DEFAULT ENDPOINT (LOCALHOST) FOR DYNAMODB
AWS.config.update({
  region: config['dynamo.region'],
  endpoint: config['dynamo.endpoint'],
  accessKeyId: config['dynamo.accessKeyId'],
  secretAccessKey: config['dynamo.secretAccessKey'],
});

async function createTable(dynamoDB, tableName) {
  const params = {
    TableName: tableName,
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
  };

  return dynamoDB.createTable(params).promise()
    .catch((reason) => {
      if (reason.message !== 'Cannot create preexisting table') {
        throw reason;
      }
    });
}

// Init DB: Create table if not exist
const initDatabase = async () => {
  // Create client at function level to have right config
  const dynamoDB = new AWS.DynamoDB();

  return createTable(dynamoDB, COUNTER_TABLE)
    .then(createTable(dynamoDB, PRODUCTS_TABLE))
    .catch((reason) => {
      console.error(reason.message);
    });
};

module.exports = initDatabase;
