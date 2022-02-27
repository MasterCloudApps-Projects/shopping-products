const AWS = require('aws-sdk');
const atomicCounter = require('dynamodb-atomic-counter');
const config = require('../../config/config');

const PRODUCTS_TABLE = 'products';

let atomicCounterConfigured = false;

function getNextSequence() {
  if (!atomicCounterConfigured) {
    atomicCounter.config.update({
      region: config['dynamo.region'],
      endpoint: config['dynamo.endpoint'],
      accessKeyId: config['dynamo.accessKeyId'],
      secretAccessKey: config['dynamo.secretAccessKey'],
    });
    atomicCounterConfigured = true;
  }

  return atomicCounter.increment(PRODUCTS_TABLE)
    .done((value) => {
      console.log('Incremented sequence value ', JSON.stringify(value, null, 2));
      return value;
    })
    .fail((error) => {
      console.log('Increment operation failed: ', JSON.stringify(error, null, 2));
      throw error;
    }).always((valueOrError) => {
      console.log('Increment operation finished', JSON.stringify(valueOrError, null, 2));
    });
}

async function findByName(name) {
  const params = {
    TableName: PRODUCTS_TABLE,
    FilterExpression: '#name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': name.toUpperCase(),
    },
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  return docClient.scan(params).promise()
    .then((foundProduct) => {
      console.log('Found product:', JSON.stringify(foundProduct, null, 2));
      return foundProduct.Items;
    })
    .catch((err) => {
      console.error('Error finding by name ', name, JSON.stringify(err, null, 2));
      throw err;
    });
}

async function create(product) {
  const productId = await getNextSequence();
  const productToSave = {
    id: productId,
    name: product.name.toUpperCase(),
    description: product.description.toUpperCase(),
    price: product.price,
    quantity: product.quantity,
  };
  const params = {
    TableName: PRODUCTS_TABLE,
    Item: productToSave,
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  console.log('Adding a new product...');
  return docClient.put(params).promise()
    .then(() => {
      console.log('Added product:', JSON.stringify(productToSave, null, 2));
      return productToSave;
    })
    .catch((err) => {
      console.error('Unable to add product. Error JSON:', JSON.stringify(err, null, 2));
      throw err;
    });
}

module.exports = {
  findByName,
  create,
};
