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

async function findAll() {
  const params = {
    TableName: PRODUCTS_TABLE,
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  return docClient.scan(params).promise()
    .then((foundProducts) => {
      console.log('Found products:', JSON.stringify(foundProducts, null, 2));
      return foundProducts.Items;
    })
    .catch((err) => {
      console.error('Error finding products ', JSON.stringify(err, null, 2));
      throw err;
    });
}

async function findById(productId) {
  const params = {
    TableName: PRODUCTS_TABLE,
    KeyConditionExpression: '#id = :productId',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':productId': productId,
    },
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  return docClient.query(params).promise()
    .then((foundProduct) => {
      console.log('Found product:', JSON.stringify(foundProduct, null, 2));
      return foundProduct.Items;
    })
    .catch((err) => {
      console.error('Error finding by id ', productId, JSON.stringify(err, null, 2));
      throw err;
    });
}

async function update(product) {
  const params = {
    TableName: PRODUCTS_TABLE,
    Key: {
      id: product.id,
    },
    UpdateExpression: 'set #name = :n, description=:d, price=:p, quantity=:q',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':n': product.name.toUpperCase(),
      ':d': product.description.toUpperCase(),
      ':p': product.price,
      ':q': product.quantity,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const docClient = new AWS.DynamoDB.DocumentClient();
  return docClient.update(params).promise()
    .then((updatedProduct) => {
      console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));
      const updatedProductWithId = updatedProduct.Attributes;
      updatedProductWithId.id = product.id;
      return updatedProductWithId;
    })
    .catch((err) => {
      console.error('Error updating product', product, JSON.stringify(err, null, 2));
      throw err;
    });
}

module.exports = {
  findByName,
  create,
  findAll,
  findById,
  update,
};
