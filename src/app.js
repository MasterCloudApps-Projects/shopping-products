const express = require('express');
const productsRouter = require('./routes/productRouter');

const app = express();

// Convert json bodies to JavaScript object
app.use(express.json());
app.use('/api/v1/products', productsRouter);

module.exports = app;
