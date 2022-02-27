const express = require('express');

const router = express.Router();
const ProductRequestDto = require('../dtos/productRequestDto');
const productService = require('../services/productService');
const verifyToken = require('../middlewares/authMiddleware');
const verifyRoleOfAuthenticatedUser = require('../middlewares/userAllowedResource');

router.post('/', verifyToken, verifyRoleOfAuthenticatedUser, async (req, res) => {
  let productRequestDto;
  try {
    productRequestDto = new ProductRequestDto(req.body);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.message });
  }

  try {
    const createdProduct = await productService.create(productRequestDto);
    if (!createdProduct) {
      return res.status(409).send({ error: 'Already exists a product with that name' });
    }
    return res.header('Location', `${req.protocol}://${req.get('host')}${req.originalUrl}/${createdProduct.id}`)
      .status(201)
      .json({ id: createdProduct.id });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const products = await productService.getAll();
    return res.status(200).send(products);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    return res.status(400).send({ error: 'Id must be an integer' });
  }

  try {
    const product = await productService.getById(productId);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    return res.status(200).send(product);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

router.put('/:id', verifyToken, verifyRoleOfAuthenticatedUser, async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (Number.isNaN(productId)) {
    return res.status(400).send({ error: 'Id must be an integer' });
  }

  let productRequestDto;
  try {
    productRequestDto = new ProductRequestDto(req.body);
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.message });
  }

  try {
    const productToUpdate = await productService.getById(productId);
    if (!productToUpdate) {
      return res.status(404).send({ error: 'Product not found' });
    }

    productToUpdate.name = productRequestDto.name;
    productToUpdate.description = productRequestDto.description;
    productToUpdate.price = productRequestDto.price;
    productToUpdate.quantity = productRequestDto.quantity;

    const updatedProduct = await productService.update(productToUpdate);
    if (!updatedProduct) {
      return res.status(409).send({ error: 'Already exists a product with that name' });
    }
    return res.status(200).send(updatedProduct);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.message });
  }
});

module.exports = router;
