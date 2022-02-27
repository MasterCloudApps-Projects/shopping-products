const supertest = require('supertest');
const { GenericContainer } = require('testcontainers');
const jwt = require('jsonwebtoken');
const app = require('../../../src/app');
const initDatabase = require('../../../src/database');
const config = require('../../../config/config');

const BASE_URL = '/api/v1/products';
let adminToken;

const request = supertest(app);

let dynamoContainer;

jest.setTimeout(60000);

beforeAll(async () => {
  dynamoContainer = await new GenericContainer('amazon/dynamodb-local', '1.18.0')
    .withExposedPorts(8000)
    .start();
  config['dynamo.region'] = process.env.AWS_REGION || 'local';
  config['dynamo.endpoint'] = process.env.AWS_DYNAMO_ENDPOINT || `http://localhost:${dynamoContainer.getMappedPort(8000)}`;
  config['dynamo.accessKeyId'] = 'xxxx';
  config['dynamo.secretAccessKey'] = 'xxxxx';

  await initDatabase();

  adminToken = `Bearer ${jwt.sign({ id: 1, role: 'ADMIN_ROLE' }, config.secret, {
    expiresIn: 300,
  })}`;
  // userToken = `Bearer ${jwt.sign({ id: 2, role: 'USER_ROLE' }, config.secret, {
  //   expiresIn: 300,
  // })}`;
});

afterAll(async () => {
  await dynamoContainer.stop();
});

describe('productRouter POST /api/v1/poducts tests', () => {
  it('Given 2 products with same name When post products Then should create first and return an error for the second', async () => {
    const productRequest = {
      name: 'product 1',
      description: 'product 1 description',
      price: 42.4,
      quantity: 100,
    };
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .send(productRequest)
      .set('Accept', 'application/json')
      .expect(201);
    return request.post(BASE_URL)
      .set('Authorization', adminToken)
      .send(productRequest)
      .expect(409)
      .then((response) => {
        expect(response.body.error).toBe('Already exists a product with that name');
      });
  });
});
