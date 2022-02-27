const supertest = require('supertest');
const { GenericContainer } = require('testcontainers');
const jwt = require('jsonwebtoken');
const app = require('../../../src/app');
const initDatabase = require('../../../src/database');
const config = require('../../../config/config');

const BASE_URL = '/api/v1/products';
let adminToken;
let userToken;

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
  userToken = `Bearer ${jwt.sign({ id: 2, role: 'USER_ROLE' }, config.secret, {
    expiresIn: 300,
  })}`;
});

afterAll(async () => {
  await dynamoContainer.stop();
});

const products = [
  {
    name: 'product 1',
    description: 'product 1 description',
    price: 42.4,
    quantity: 100,
  },
  {
    name: 'product 2',
    description: 'product 2 description',
    price: 24.55,
    quantity: 12,
  },
  {
    name: 'product 3',
    description: 'product 3 description',
    price: 9.99,
    quantity: 20,
  },
  {
    name: 'product 4',
    description: 'product 4 description',
    price: 4.85,
    quantity: 2,
  },
  {
    name: 'product 5',
    description: 'product 5 description',
    price: 8.32,
    quantity: 27,
  },
  {
    name: 'product 6',
    description: 'product 6 description',
    price: 108.05,
    quantity: 4,
  },
];

describe('productRouter POST /api/v1/poducts tests', () => {
  it('Given 2 products with same name When post products Then should create first and return an error for the second', async () => {
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .send(products[0])
      .set('Accept', 'application/json')
      .expect(201);
    return request.post(BASE_URL)
      .set('Authorization', adminToken)
      .send(products[0])
      .expect(409)
      .then((response) => {
        expect(response.body.error).toBe('Already exists a product with that name');
      });
  });

  test('Given n products initially When add a new product Then get all returns n+1 elements', async () => {
    let getResponse = await request.get(BASE_URL)
      .set('Authorization', userToken);
    const initialElements = getResponse.body.length;

    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[1])
      .expect(201)
      .then((response) => {
        expect(response.body.id).not.toBeNull();
        expect(response.body.id).toBeDefined();
      });

    getResponse = await request.get(BASE_URL)
      .set('Authorization', userToken);
    expect(getResponse.body.length).toBe(initialElements + 1);
  });
});

describe('productRouter GET /api/v1/poducts tests', () => {
  test('Given adding 2 products When get all products Then should return at least that 2 elements', async () => {
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[2])
      .expect(201);
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[3])
      .expect(201);

    return request.get(BASE_URL)
      .set('Authorization', userToken)
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBeGreaterThanOrEqual(2);

        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: products[2].name.toUpperCase(),
              description: products[2].description.toUpperCase(),
              price: products[2].price,
              quantity: products[2].quantity,
            }),
            expect.objectContaining({
              name: products[3].name.toUpperCase(),
              description: products[3].description.toUpperCase(),
              price: products[3].price,
              quantity: products[3].quantity,
            }),
          ]),
        );
      });
  });
});

describe('productRouter GET /api/v1/poducts/:id tests', () => {
  test('Given adding a product When get product by id Then should return added product info', async () => {
    let createdProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[4])
      .expect(201)
      .then((response) => {
        createdProductId = response.body.id;
      });

    return request.get(`${BASE_URL}/${createdProductId}`)
      .set('Authorization', userToken)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(createdProductId);
        expect(response.body.name).toBe(products[4].name.toUpperCase());
        expect(response.body.description).toBe(products[4].description.toUpperCase());
        expect(response.body.price).toBe(products[4].price);
        expect(response.body.quantity).toBe(products[4].quantity);
      });
  });
});

describe('productRouter PUT /api/v1/poducts/:id tests', () => {
  test('Given adding a product When update product Then should return updated product info', async () => {
    let createdProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[5])
      .expect(201)
      .then((response) => {
        createdProductId = response.body.id;
      });

    const updateProductRequest = {
      name: 'Updated name',
      description: 'Updated description',
      price: 1.2,
      quantity: 1,
    };

    return request.put(`${BASE_URL}/${createdProductId}`)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(updateProductRequest)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(createdProductId);
        expect(response.body.name).toBe(updateProductRequest.name.toUpperCase());
        expect(response.body.description).toBe(updateProductRequest.description.toUpperCase());
        expect(response.body.price).toBe(updateProductRequest.price);
        expect(response.body.quantity).toBe(updateProductRequest.quantity);
      });
  });
});
