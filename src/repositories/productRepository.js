const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const COUNTER_TABLE = 'counter';
const PRODUCTS_TABLE = 'products';

function getNextSequence() {
  return docClient.update({
    TableName: COUNTER_TABLE,
    Key: { Key: 'counter' },
    UpdateExpression: 'SET #val = if_not_exists(#val, :zero) + :incr',
    ExpressionAttributeNames: { '#val': 'Value' },
    ExpressionAttributeValues: { ':incr': 1, ':zero': 0 },
    ReturnValues: 'UPDATED_NEW',
  });
}

function findByName(name) {
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

  docClient.scan(params, (err, foundProduct) => {
    if (err) {
      console.error('Error finding by name ', name, JSON.stringify(err, null, 2));
      throw err;
    } else {
      console.log('Found product:', JSON.stringify(foundProduct, null, 2));
    }
    return foundProduct;
  });
}

function create(product) {
  const productToSave = {
    id: getNextSequence(),
    name: product.name.toUpperCase(),
    description: product.description.toUpperCase(),
    price: product.price,
    quantity: product.quantity,
  };

  const params = {
    TableName: PRODUCTS_TABLE,
    Item: productToSave,
  };

  console.log('Adding a new product...');
  docClient.updateItem(params, (err, savedProduct) => {
    if (err) {
      console.error('Unable to add product. Error JSON:', JSON.stringify(err, null, 2));
      throw err;
    } else {
      console.log('Added product:', JSON.stringify(savedProduct, null, 2));
    }
    return savedProduct;
  });
}

module.exports = {
  findByName,
  create,
};
