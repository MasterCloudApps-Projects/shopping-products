const supertest = require('supertest');
const app = require('../../../src/app');
const productService = require('../../../src/services/productService');
const ProductResponseDto = require('../../../src/dtos/productResponseDto');
const verifyToken = require('../../../src/middlewares/authMiddleware');

const request = supertest(app);

jest.mock('../../../src/services/productService.js');
jest.mock('../../../src/middlewares/authMiddleware');

const BASE_URL = '/api/v1/products';
const BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVJfUk9MRSIsImlhdCI6MTYzNzM0NTg5OSwiZXhwIjoxNjM3MzQ2MTk5fQ.qnkOMsfHA2YDni_WlgV7yPbEySomqKCkLK8G4t4IeUI';

describe('productRouter POST /api/v1/products tests', () => {
  test('Given an authenticated as admin request with valid body When post and productService return created product Then should return created response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    const product = {
      id: 1,
      name: 'product 1',
      description: 'product 1 description',
      price: 42.4,
      quantity: 100,
    };

    productService.create.mockResolvedValue(new ProductResponseDto(
      product.id,
      product.name.toUpperCase(),
      product.description.toUpperCase(),
      product.price,
      product.quantity,
    ));

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.headers['Location'.toLowerCase()]).toBe(`${response.request.url}/${product.id}`);
        expect(response.body.id).toBe(product.id);
      });
  });

  test('Given an authenticated as admin request with invalid body When post Then should return bad request response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: '',
        description: 'product 1 description',
        price: 42.4,
        quantity: 100,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe('Name is mandatory and must have a minimum lenght of 3');
      });
  });

  test('Given an unauthenticated request with valid body When post Then should return unathorized response', () => {
    verifyToken.mockImplementation((req, res) => res.status(401).send({ error: 'No token provided.' }));

    return request
      .post(BASE_URL)
      .send({
        name: 'product 1',
        description: 'product 1 description',
        price: 42.4,
        quantity: 100,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.error).toBe('No token provided.');
      });
  });

  test('Given an authenticated as user request with valid body When post Then should return not allowed response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'USER_ROLE';
      return next();
    });

    productService.create.mockResolvedValue(null);

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: 'product 1',
        description: 'product 1 description',
        price: 42.4,
        quantity: 100,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403)
      .then((response) => {
        expect(response.body.error).toBe('You don\'t have permission to access the resource');
      });
  });

  test('Given an authenticated as admin request with valid body When post and productService return null created product Then should return conflict response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.create.mockResolvedValue(null);

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: 'product 1',
        description: 'product 1 description',
        price: 42.4,
        quantity: 100,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)
      .then((response) => {
        expect(response.body.error).toBe('Already exists a product with that name');
      });
  });

  test('Given an authenticated as admin request with valid body When post and productService throws error Then should return internal server error response', () => {
    const errorMessage = 'Database connection lost.';

    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.create.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: 'product 1',
        description: 'product 1 description',
        price: 42.4,
        quantity: 100,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe(errorMessage);
      });
  });
});
