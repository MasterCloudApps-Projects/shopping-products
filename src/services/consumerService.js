const productService = require('./productService');
const config = require('../../config/config');

const { getProducer } = require('../kafka');

async function sendEvent(message) {
  const producer = getProducer();
  await producer.connect();
  await producer.send({
    topic: config['kafka.topics.changeState'],
    messages: [
      { value: JSON.stringify(message) },
    ],
  });
  console.log(`Sent message ${JSON.stringify(message)} to topic ${config['kafka.topics.changeState']}`);
}

async function consumeValidateItemsEvent(message) {
  try {
    console.log(`Received message ${message.value}`);
    const orderValidationRequestedEvent = JSON.parse(message.value);
    console.log(`orderValidationRequestedEvent ${orderValidationRequestedEvent}`);
    let validItems = 0;
    const products = [];
    const validationErrors = [];
    /* eslint-disable no-restricted-syntax */
    for await (const item of orderValidationRequestedEvent.shoppingCart.items) {
      let errorMessage = null;
      const product = await productService.getById(item.productId);
      if (!product) {
        errorMessage = `Product with id ${item.productId} not found`;
        console.error(errorMessage);
        validationErrors.push(errorMessage);
      } else if (product.quantity < item.quantity) {
        errorMessage = `Required ${item.quantity} units of product ${item.productId}, but only ${product.quantity} available`;
        console.error(errorMessage);
        validationErrors.push(errorMessage);
      } else if (product.price !== item.unitPrice) {
        errorMessage = `Product price is ${product.price} but ${item.unitPrice} was received`;
        console.error(errorMessage);
        validationErrors.push(errorMessage);
      } else {
        validItems += 1;
        product.quantity -= item.quantity;
        products.push(product);
      }
    }
    /* eslint-enable no-restricted-syntax */
    const orderUpdateRequestedEvent = {
      id: orderValidationRequestedEvent.id,
    };
    if (validItems === orderValidationRequestedEvent.shoppingCart.items.length) {
      console.log(`Valid items for order ${orderValidationRequestedEvent.id}`);
      /* eslint-disable no-restricted-syntax */
      for await (const product of products) {
        await productService.update(product);
        console.log(`Updated product with id ${product.id} to quantity ${product.quantity}`);
      }
      /* eslint-enable no-restricted-syntax */
      orderUpdateRequestedEvent.state = orderValidationRequestedEvent.successState;
    } else {
      console.error(`Order ${orderValidationRequestedEvent.id} must be rejected`);
      orderUpdateRequestedEvent.state = orderValidationRequestedEvent.failureState;
      orderUpdateRequestedEvent.errors = validationErrors;
    }
    await sendEvent(orderUpdateRequestedEvent);
  } catch (error) {
    console.error(`Error processing message ${message.value}`, error);
  }
}

async function consumeRestoreStockEvent(message) {
  try {
    console.log(`Received message ${message.value}`);
    const resetStockEvent = JSON.parse(message.value);
    /* eslint-disable no-restricted-syntax */
    for await (const item of resetStockEvent.shoppingCart.items) {
      const product = await productService.getById(item.productId);
      if (!product) {
        console.error(`Product with id ${item.productId} not found`);
      } else {
        product.quantity += item.quantity;
        await productService.update(product);
        console.log(`Updated product with id ${product.id} to quantity ${product.quantity}`);
      }
    }
    /* eslint-enable no-restricted-syntax */
  } catch (error) {
    console.error(`Error processing message ${message.value}`, error);
  }
}

module.exports = {
  consumeValidateItemsEvent,
  consumeRestoreStockEvent,
};
