const productRepository = require('../repositories/productRepository');
const ProductResponseDto = require('../dtos/productResponseDto');

async function create(product) {
  return productRepository.findByName(product.name)
    .then((foundProducts) => {
      if (foundProducts && foundProducts.length > 0) {
        console.log(`Product with name ${product.name} already exists`);
        return null;
      }

      return productRepository.create({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
      }).then((savedProduct) => {
        console.log('Created product', savedProduct);
        return new ProductResponseDto(
          savedProduct.id,
          savedProduct.name,
          savedProduct.description,
          savedProduct.price,
          savedProduct.quantity,
        );
      });
    })
    .catch((error) => {
      throw error;
    });
}

async function getAll() {
  return productRepository.findAll()
    .then((foundProducts) => foundProducts.map((product) => new ProductResponseDto(
      product.id,
      product.name,
      product.description,
      product.price,
      product.quantity,
    )))
    .catch((error) => {
      throw error;
    });
}

async function getById(productId) {
  return productRepository.findById(productId)
    .then((foundProducts) => {
      if (foundProducts && foundProducts.length === 1) {
        return foundProducts[0];
      }
      return null;
    })
    .catch((error) => {
      throw error;
    });
}

async function update(product) {
  return productRepository.findByName(product.name)
    .then((foundProducts) => {
      if (foundProducts && foundProducts.length === 1 && foundProducts[0].id !== product.id) {
        console.log(`Product with name ${product.name} already exists`);
        return null;
      }

      return productRepository.update(product).then((updatedProduct) => {
        console.log('Updated product', updatedProduct);
        return new ProductResponseDto(
          updatedProduct.id,
          updatedProduct.name,
          updatedProduct.description,
          updatedProduct.price,
          updatedProduct.quantity,
        );
      });
    })
    .catch((error) => {
      throw error;
    });
}

module.exports = {
  create,
  getAll,
  getById,
  update,
};
