const productRepository = require('../repositories/productRepository');
const ProductResponseDto = require('../dtos/productResponseDto');

async function create(product) {
  return productRepository.findByName(product.name)
    .then((foundProduct) => {
      if (foundProduct && foundProduct.length > 0) {
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
    .then((foundProducts) => foundProducts)
    .catch((error) => {
      throw error;
    });
}

module.exports = {
  create,
  getAll,
};
