const express = require('express');

const app = express();

// Convert json bodies to JavaScript object
app.use(express.json());

module.exports = app;
