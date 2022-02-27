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
const PRODUCT = {
  id: 1,
  name: 'product 1',
  description: 'product 1 description',
  price: 42.4,
  quantity: 100,
};

describe('productRouter POST /api/v1/products tests', () => {
  test('Given an authenticated as admin request with valid body When post and productService return created product Then should return created response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.create.mockResolvedValue(new ProductResponseDto(
      PRODUCT.id,
      PRODUCT.name.toUpperCase(),
      PRODUCT.description.toUpperCase(),
      PRODUCT.price,
      PRODUCT.quantity,
    ));

    return request
      .post(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .send({
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.headers['Location'.toLowerCase()]).toBe(`${response.request.url}/${PRODUCT.id}`);
        expect(response.body.id).toBe(PRODUCT.id);
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
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
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
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
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
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
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
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
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
        name: PRODUCT.name,
        description: PRODUCT.description,
        price: PRODUCT.price,
        quantity: PRODUCT.quantity,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe(errorMessage);
      });
  });
});

describe('productRouter GET /api/v1/products tests', () => {
  const SECOND_PRODUCT = {
    id: 2,
    name: 'product 2',
    description: 'product 2 description',
    price: 33.87,
    quantity: 23,
  };

  test('Given an authenticated as admin request When get all and productService return an array of products Then should return ok response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.getAll.mockResolvedValue([
      new ProductResponseDto(
        PRODUCT.id,
        PRODUCT.name.toUpperCase(),
        PRODUCT.description.toUpperCase(),
        PRODUCT.price,
        PRODUCT.quantity,
      ),
      new ProductResponseDto(
        SECOND_PRODUCT.id,
        SECOND_PRODUCT.name.toUpperCase(),
        SECOND_PRODUCT.description.toUpperCase(),
        SECOND_PRODUCT.price,
        SECOND_PRODUCT.quantity,
      ),
    ]);

    return request
      .get(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(2);

        expect(response.body[0].id).toBe(PRODUCT.id);
        expect(response.body[0].name).toBe(PRODUCT.name.toUpperCase());
        expect(response.body[0].description).toBe(PRODUCT.description.toUpperCase());
        expect(response.body[0].price).toBe(PRODUCT.price);
        expect(response.body[0].quantity).toBe(PRODUCT.quantity);

        expect(response.body[1].id).toBe(SECOND_PRODUCT.id);
        expect(response.body[1].name).toBe(SECOND_PRODUCT.name.toUpperCase());
        expect(response.body[1].description).toBe(SECOND_PRODUCT.description.toUpperCase());
        expect(response.body[1].price).toBe(SECOND_PRODUCT.price);
        expect(response.body[1].quantity).toBe(SECOND_PRODUCT.quantity);
      });
  });

  test('Given an authenticated as user request When get all and productService return an array of products Then should return ok response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'USER_ROLE';
      return next();
    });

    productService.getAll.mockResolvedValue([
      new ProductResponseDto(
        PRODUCT.id,
        PRODUCT.name.toUpperCase(),
        PRODUCT.description.toUpperCase(),
        PRODUCT.price,
        PRODUCT.quantity,
      ),
      new ProductResponseDto(
        SECOND_PRODUCT.id,
        SECOND_PRODUCT.name.toUpperCase(),
        SECOND_PRODUCT.description.toUpperCase(),
        SECOND_PRODUCT.price,
        SECOND_PRODUCT.quantity,
      ),
    ]);

    return request
      .get(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBe(2);

        expect(response.body[0].id).toBe(PRODUCT.id);
        expect(response.body[0].name).toBe(PRODUCT.name.toUpperCase());
        expect(response.body[0].description).toBe(PRODUCT.description.toUpperCase());
        expect(response.body[0].price).toBe(PRODUCT.price);
        expect(response.body[0].quantity).toBe(PRODUCT.quantity);

        expect(response.body[1].id).toBe(SECOND_PRODUCT.id);
        expect(response.body[1].name).toBe(SECOND_PRODUCT.name.toUpperCase());
        expect(response.body[1].description).toBe(SECOND_PRODUCT.description.toUpperCase());
        expect(response.body[1].price).toBe(SECOND_PRODUCT.price);
        expect(response.body[1].quantity).toBe(SECOND_PRODUCT.quantity);
      });
  });

  test('Given an unauthenticated request When get all Then should return unathorized response', () => {
    verifyToken.mockImplementation((req, res) => res.status(401).send({ error: 'No token provided.' }));

    return request
      .get(BASE_URL)
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.error).toBe('No token provided.');
      });
  });

  test('Given a request with invalid token When get all Then should return not allowed response', () => {
    verifyToken.mockImplementation((req, res) => res.status(403).send({ error: 'Invalid or expired token.' }));

    return request
      .get(BASE_URL)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(403)
      .then((response) => {
        expect(response.body.error).toBe('Invalid or expired token.');
      });
  });

  test('Given an authenticated as admin request When get all and productService throws error Then should return internal server error response', () => {
    const errorMessage = 'Database connection lost.';

    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.getAll.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    return request
      .get(BASE_URL)
      .expect('Content-Type', /json/)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe(errorMessage);
      });
  });
});

describe('productRouter GET /api/v1/products/:id tests', () => {
  test('Given an authenticated as admin request When get by id and productService return a product Then should return ok response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.getById.mockResolvedValue(
      new ProductResponseDto(
        PRODUCT.id,
        PRODUCT.name.toUpperCase(),
        PRODUCT.description.toUpperCase(),
        PRODUCT.price,
        PRODUCT.quantity,
      ),
    );

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(PRODUCT.id);
        expect(response.body.name).toBe(PRODUCT.name.toUpperCase());
        expect(response.body.description).toBe(PRODUCT.description.toUpperCase());
        expect(response.body.price).toBe(PRODUCT.price);
        expect(response.body.quantity).toBe(PRODUCT.quantity);
      });
  });

  test('Given an authenticated as user request When get by id and productService return an product Then should return ok response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'USER_ROLE';
      return next();
    });

    productService.getById.mockResolvedValue(
      new ProductResponseDto(
        PRODUCT.id,
        PRODUCT.name.toUpperCase(),
        PRODUCT.description.toUpperCase(),
        PRODUCT.price,
        PRODUCT.quantity,
      ),
    );

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(PRODUCT.id);
        expect(response.body.name).toBe(PRODUCT.name.toUpperCase());
        expect(response.body.description).toBe(PRODUCT.description.toUpperCase());
        expect(response.body.price).toBe(PRODUCT.price);
        expect(response.body.quantity).toBe(PRODUCT.quantity);
      });
  });

  test('Given an unauthenticated request When get by id Then should return unathorized response', () => {
    verifyToken.mockImplementation((req, res) => res.status(401).send({ error: 'No token provided.' }));

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.error).toBe('No token provided.');
      });
  });

  test('Given a request with invalid token When get by id Then should return not allowed response', () => {
    verifyToken.mockImplementation((req, res) => res.status(403).send({ error: 'Invalid or expired token.' }));

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(403)
      .then((response) => {
        expect(response.body.error).toBe('Invalid or expired token.');
      });
  });

  test('Given an authenticated as user request When get by id and productService return null product Then should return not found response', () => {
    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'USER_ROLE';
      return next();
    });

    productService.getById.mockResolvedValue(null);

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .set('Authorization', BEARER_TOKEN)
      .expect('Content-Type', /json/)
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe('Product not found');
      });
  });

  test('Given an authenticated as admin request When get by id and productService throws error Then should return internal server error response', () => {
    const errorMessage = 'Database connection lost.';

    verifyToken.mockImplementation((req, res, next) => {
      req.role = 'ADMIN_ROLE';
      return next();
    });

    productService.getById.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    return request
      .get(`${BASE_URL}/${PRODUCT.id}`)
      .expect('Content-Type', /json/)
      .expect(500)
      .then((response) => {
        expect(response.body.error).toBe(errorMessage);
      });
  });
});
