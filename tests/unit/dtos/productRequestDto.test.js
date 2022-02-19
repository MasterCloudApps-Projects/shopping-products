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

  test('Given min length  name When call constructor Then should throw an error', async () => {
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

  test('Given min length  description When call constructor Then should throw an error', async () => {
    const productRequestDto = new ProductRequestDto({
      name: NAME, description: 'des', price: PRICE, quantity: QUANTITY,
    });

    expect(productRequestDto.name).toBe(NAME);
    expect(productRequestDto.description).toBe('des');
    expect(productRequestDto.price).toBe(PRICE);
    expect(productRequestDto.quantity).toBe(QUANTITY);
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
