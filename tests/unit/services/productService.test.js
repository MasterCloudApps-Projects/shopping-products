const productService = require('../../../src/services/productService');
const ProductRequestDto = require('../../../src/dtos/productRequestDto');
const productRepository = require('../../../src/repositories/productRepository');
const ProductResponseDto = require('../../../src/dtos/productResponseDto');
const { NoErrorThrownError, getError } = require('../errors/noErrorThrownError');

jest.mock('../../../src/repositories/productRepository.js');

const product = {
  id: 1,
  name: 'SHOES',
  description: 'COMFORTABLE SHOES',
  price: 19.99,
  quantity: 5,
};
const errorMessage = 'Database connection lost.';

describe('productService create function tests', () => {
  const productRequestDto = new ProductRequestDto({
    name: product.name.toLowerCase(),
    description: product.description.toLowerCase(),
    price: product.price,
    quantity: product.quantity,
  });

  test('Given an existing product with that name When call create Then should not create product and return null', () => {
    productRepository.findByName.mockResolvedValue([product]);

    return productService.create(productRequestDto)
      .then((createdProduct) => {
        expect(productRepository.findByName.mock.calls[0][0]).toBe(productRequestDto.name);
        expect(createdProduct).toBeNull();
      });
  });

  test('Given an non existing product with that name When call create Then should save product and return it', () => {
    productRepository.findByName.mockResolvedValue([]);
    productRepository.create.mockResolvedValue(product);

    return productService.create(productRequestDto)
      .then((createdProduct) => {
        expect(productRepository.findByName.mock.calls[0][0]).toBe(productRequestDto.name);
        expect(createdProduct).toEqual(new ProductResponseDto(
          product.id,
          product.name,
          product.description,
          product.price,
          product.quantity,
        ));
      });
  });

  test('Given an non existing product with that name When call create and repository throws error Then should throw error', async () => {
    productRepository.findByName.mockResolvedValue(null);

    productRepository.create.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const error = await getError(async () => productService.create(productRequestDto));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', errorMessage);
  });
});

describe('productService get all function tests', () => {
  test('Given non existing products When call getAll Then should return empty array', () => {
    const findAll = productRepository.findAll.mockResolvedValue([]);

    return productService.getAll()
      .then((products) => {
        expect(findAll).toHaveBeenCalled();
        expect(products).toEqual([]);
      });
  });

  test('Given existing products When call getAll Then should return array with products', () => {
    const secondProduct = {
      id: 2,
      name: 'SWATER',
      description: 'NICE SWEATER',
      price: 12.5,
      quantity: 10,
    };
    const findAll = productRepository.findAll.mockResolvedValue([
      product,
      secondProduct,
    ]);

    return productService.getAll()
      .then((products) => {
        expect(findAll).toHaveBeenCalled();
        expect(products).toEqual([
          product,
          secondProduct,
        ]);
      });
  });

  test('Given existing products When call getAll and repository throws error Then should throw error', async () => {
    productRepository.findAll.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const error = await getError(async () => productService.getAll());

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', errorMessage);
  });
});
