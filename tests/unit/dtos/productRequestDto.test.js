const ProductRequestDto = require('../../../src/dtos/productRequestDto');
const { NoErrorThrownError, getError } = require('../errors/noErrorThrownError');

const NAME = 'Product name';
const DESCRIPTION = 'Product description';
const PRICE = 29.99;
const QUANTITY = 5;

describe('productRequestDto tests', () => {
  test('Given not name When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: null, description: DESCRIPTION, price: PRICE, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Name is mandatory and must have a minimum lenght of 3');
  });

  test('Given an invalid name When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: 'pr', description: DESCRIPTION, price: PRICE, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Name is mandatory and must have a minimum lenght of 3');
  });

  test('Given min length name When call constructor Then should throw an error', async () => {
    const productRequestDto = new ProductRequestDto({
      name: 'pro', description: DESCRIPTION, price: PRICE, quantity: QUANTITY,
    });

    expect(productRequestDto.name).toBe('pro');
    expect(productRequestDto.description).toBe(DESCRIPTION);
    expect(productRequestDto.price).toBe(PRICE);
    expect(productRequestDto.quantity).toBe(QUANTITY);
  });

  test('Given not description When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: null, price: PRICE, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Description is mandatory and must have a minimum lenght of 3');
  });

  test('Given an invalid description When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: 'de', price: PRICE, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Description is mandatory and must have a minimum lenght of 3');
  });

  test('Given min length description When call constructor Then should throw an error', async () => {
    const productRequestDto = new ProductRequestDto({
      name: NAME, description: 'des', price: PRICE, quantity: QUANTITY,
    });

    expect(productRequestDto.name).toBe(NAME);
    expect(productRequestDto.description).toBe('des');
    expect(productRequestDto.price).toBe(PRICE);
    expect(productRequestDto.quantity).toBe(QUANTITY);
  });

  test('Given not price When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: null, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Price is mandatory and must to be greater than 0');
  });

  test('Given not a number price When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: 'Nan', quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Price is mandatory and must to be greater than 0');
  });

  test('Given an invalid price When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: 0.0, quantity: QUANTITY,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Price is mandatory and must to be greater than 0');
  });

  test('Given min allowed price When call constructor Then should throw an error', async () => {
    const productRequestDto = new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: 0.01, quantity: QUANTITY,
    });

    expect(productRequestDto.name).toBe(NAME);
    expect(productRequestDto.description).toBe(DESCRIPTION);
    expect(productRequestDto.price).toBe(0.01);
    expect(productRequestDto.quantity).toBe(QUANTITY);
  });

  test('Given not quantity When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: null,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Quantity is mandatory and must to be an integer greater than 0');
  });

  test('Given an string quantity When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: 'Nan',
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Quantity is mandatory and must to be an integer greater than 0');
  });

  test('Given not an integer quantity When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: 1.2,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Quantity is mandatory and must to be an integer greater than 0');
  });

  test('Given an invalid quantity When call constructor Then should throw an error', async () => {
    const error = await getError(async () => new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: 0,
    }));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', 'Quantity is mandatory and must to be an integer greater than 0');
  });

  test('Given min allowed quantity When call constructor Then should throw an error', async () => {
    const productRequestDto = new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: 1,
    });

    expect(productRequestDto.name).toBe(NAME);
    expect(productRequestDto.description).toBe(DESCRIPTION);
    expect(productRequestDto.price).toBe(PRICE);
    expect(productRequestDto.quantity).toBe(1);
  });

  test('Given valid fields When call constructor Then should return an productRequestDto', () => {
    const productRequestDto = new ProductRequestDto({
      name: NAME, description: DESCRIPTION, price: PRICE, quantity: QUANTITY,
    });

    expect(productRequestDto.name).toBe(NAME);
    expect(productRequestDto.description).toBe(DESCRIPTION);
    expect(productRequestDto.price).toBe(PRICE);
    expect(productRequestDto.quantity).toBe(QUANTITY);
  });
});
