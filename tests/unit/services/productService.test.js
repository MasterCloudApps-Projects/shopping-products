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
const secondProduct = {
  id: 2,
  name: 'SWATER',
  description: 'NICE SWEATER',
  price: 12.5,
  quantity: 10,
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
    const findAll = productRepository.findAll.mockResolvedValue([
      product,
      secondProduct,
    ]);

    return productService.getAll()
      .then((products) => {
        expect(findAll).toHaveBeenCalled();
        expect(products).toEqual([
          new ProductResponseDto(
            product.id,
            product.name,
            product.description,
            product.price,
            product.quantity,
          ),
          new ProductResponseDto(
            secondProduct.id,
            secondProduct.name,
            secondProduct.description,
            secondProduct.price,
            secondProduct.quantity,
          ),
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

describe('productService get by id function tests', () => {
  test('Given non existing product with passed id When call getById Then should return null', () => {
    productRepository.findById.mockResolvedValue([]);

    return productService.getById(999)
      .then((foundProduct) => {
        expect(foundProduct).toBeNull();
      });
  });

  test('Given existing product with passed id When call getById Then should return the product', () => {
    productRepository.findById.mockResolvedValue([product]);

    return productService.getById(11)
      .then((foundProduct) => {
        expect(foundProduct).toEqual(new ProductResponseDto(
          product.id,
          product.name,
          product.description,
          product.price,
          product.quantity,
        ));
      });
  });

  test('Given existing product with passed id When call getById and repository throws error Then should throw error', async () => {
    productRepository.findById.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const error = await getError(async () => productService.getById(22));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', errorMessage);
  });
});

describe('productService update function tests', () => {
  test('Given product to update with already existing product with that name When call update Then should return null', async () => {
    productRepository.findByName.mockResolvedValue([
      {
        id: secondProduct.id,
        name: product.name,
        description: product.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      },
    ]);

    return productService.update(product)
      .then((updatedProduct) => {
        expect(updatedProduct).toBeNull();
      });
  });

  test('Given product to update with same previous name When call update Then should return updated product', async () => {
    productRepository.findByName.mockResolvedValue([product]);

    const productToUpdate = {
      id: product.id,
      name: product.name,
      description: 'Updated description',
      price: 77.66,
      quantity: 54,
    };

    const productResponseDto = new ProductResponseDto(
      productToUpdate.id,
      productToUpdate.name.toUpperCase(),
      productToUpdate.description.toUpperCase(),
      productToUpdate.price,
      productToUpdate.quantity,
    );

    productRepository.update.mockResolvedValue({
      id: productToUpdate.id,
      name: productToUpdate.name.toUpperCase(),
      description: productToUpdate.description.toUpperCase(),
      price: productToUpdate.price,
      quantity: productToUpdate.quantity,
    });

    return productService.update(productToUpdate)
      .then((updatedProduct) => {
        expect(updatedProduct).toEqual(productResponseDto);
      });
  });

  test('Given product to update with different name When call update Then should return updated product', async () => {
    productRepository.findByName.mockResolvedValue([]);

    const productToUpdate = {
      id: product.id,
      name: 'Updated name',
      description: 'Updated description',
      price: 77.66,
      quantity: 54,
    };

    const productResponseDto = new ProductResponseDto(
      productToUpdate.id,
      productToUpdate.name.toUpperCase(),
      productToUpdate.description.toUpperCase(),
      productToUpdate.price,
      productToUpdate.quantity,
    );

    productRepository.update.mockResolvedValue({
      id: productToUpdate.id,
      name: productToUpdate.name.toUpperCase(),
      description: productToUpdate.description.toUpperCase(),
      price: productToUpdate.price,
      quantity: productToUpdate.quantity,
    });

    return productService.update(productToUpdate)
      .then((updatedProduct) => {
        expect(updatedProduct).toEqual(productResponseDto);
      });
  });

  test('Given product to update When call update and repository throws error Then should throw error', async () => {
    productRepository.findByName.mockResolvedValue([product]);

    productRepository.update.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const error = await getError(async () => productService.update(product));

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toHaveProperty('message', errorMessage);
  });
});
