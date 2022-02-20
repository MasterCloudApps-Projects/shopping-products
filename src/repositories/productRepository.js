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
      ':name': name,
    },
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error('Error finding by name ', name, JSON.stringify(err, null, 2));
      throw err;
    }
    return data;
  });
}

function create(product) {
  // eslint-disable-next-line no-param-reassign
  product.id = getNextSequence();

  const params = {
    TableName: PRODUCTS_TABLE,
    Item: product,
  };

  console.log('Adding a new product...');
  docClient.updateItem(params, (err, data) => {
    if (err) {
      console.error('Unable to add product. Error JSON:', JSON.stringify(err, null, 2));
      throw err;
    } else {
      console.log('Added product:', JSON.stringify(data, null, 2));
    }
    return data;
  });
}

module.exports = {
  findByName,
  create,
};
