const AWS = require('aws-sdk');
const config = require('../config/config');

const SEQUENCES_TABLE = 'AtomicCounters';
const PRODUCTS_TABLE = 'products';

async function createTable(dynamoDB, params) {
  return dynamoDB.createTable(params).promise()
    .catch((reason) => {
      if (reason.message !== 'Cannot create preexisting table') {
        throw reason;
      }
    });
}

// Init DB: Create tables if not exist
const initDatabase = async () => {
  // CONFIGURE AWS TO USE LOCAL REGION AND DEFAULT ENDPOINT (LOCALHOST) FOR DYNAMODB
  AWS.config.update({
    region: config['dynamo.region'],
    endpoint: config['dynamo.endpoint'],
    accessKeyId: config['dynamo.accessKeyId'],
    secretAccessKey: config['dynamo.secretAccessKey'],
  });

  // Create client at function level to have right config
  const dynamoDB = new AWS.DynamoDB();

  return createTable(dynamoDB, {
    TableName: SEQUENCES_TABLE,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
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
  })
    .then(createTable(dynamoDB, {
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
    }))
    .catch((reason) => {
      console.error(reason.message);
    });
};

module.exports = initDatabase;
