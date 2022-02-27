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

module.exports = router;
