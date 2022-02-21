const jwt = require('jsonwebtoken');
const authMiddleware = require('../../../src/middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('Authorization middleware tests', () => {
  const mockRequest = () => {
    const req = {};
    return req;
  };

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockedReq = mockRequest();
  const mockedRes = mockResponse();
  const mockedNext = jest.fn();

  test('Given a request without headers When verify Then should return unauthorized response', async () => {
    const expectedResponse = { error: 'No token provided.' };

    authMiddleware(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toBeCalledWith(401);
    expect(mockedRes.send).toBeCalledWith(expectedResponse);
  });

  test('Given a request without authorization header When verify Then should return unauthorized response', async () => {
    mockedReq.headers = {};
    const expectedResponse = { error: 'No token provided.' };

    authMiddleware(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toBeCalledWith(401);
    expect(mockedRes.send).toBeCalledWith(expectedResponse);
  });

  test('Given a request with authorization header without token When verify Then should return unauthorized response', async () => {
    mockedReq.headers = {};
    const expectedResponse = { error: 'No token provided.' };

    authMiddleware(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toBeCalledWith(401);
    expect(mockedRes.send).toBeCalledWith(expectedResponse);
  });

  test('Given a request with invalid token When verify Then should return forbidden response', async () => {
    mockedReq.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVJfUk9MRSIsImlhdCI6MTYzNzM0NTg5OSwiZXhwIjoxNjM3MzQ2MTk5fQ.qnkOMsfHA2YDni_WlgV7yPbEySomqKCkLK8G4t4IeUI' };
    const expectedResponse = { error: 'Invalid or expired token.' };

    jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('jwt expired'), null));

    authMiddleware(mockedReq, mockedRes, mockedNext);

    expect(mockedRes.status).toBeCalledWith(403);
    expect(mockedRes.send).toBeCalledWith(expectedResponse);
  });

  test('Given a request with valid token When verify Then should set userId in request and call next', async () => {
    mockedReq.headers = { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVJfUk9MRSIsImlhdCI6MTYzNzM0NTg5OSwiZXhwIjoxNjM3MzQ2MTk5fQ.qnkOMsfHA2YDni_WlgV7yPbEySomqKCkLK8G4t4IeUI' };
    const USER_ROLE = 'USER_ROLE';

    jwt.verify.mockImplementation((token, secret, callback) => callback(
      null, { id: 1, role: USER_ROLE },
    ));

    authMiddleware(mockedReq, mockedRes, mockedNext);

    expect(mockedReq.userId).toBe(1);
    expect(mockedReq.role).toBe(USER_ROLE);
    expect(mockedNext).toBeCalledTimes(1);
  });
});
