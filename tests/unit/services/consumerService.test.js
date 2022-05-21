const productService = require('../../../src/services/productService');
const kafka = require('../../../src/kafka');
const consumerService = require('../../../src/services/consumerService');
const config = require('../../../config/config');

jest.mock('../../../src/services/productService.js');
jest.mock('../../../src/kafka');

const producer = {};
producer.connect = jest.fn();
producer.send = jest.fn();
kafka.getProducer.mockReturnValue(producer);

const product = {
  id: 1,
  name: 'SHOES',
  description: 'COMFORTABLE SHOES',
  price: 19.99,
  quantity: 5,
};

const secondProduct = {
  id: 2,
  name: 'SWEATER',
  description: 'NICE SWEATER',
  price: 12.5,
  quantity: 10,
};

beforeEach(() => {
  productService.getById.mockClear();
  producer.send.mockClear();
  productService.update.mockClear();
});

describe('consumerService consumeValidateItemsEvent function tests', () => {
  const message = {
    id: 1652692351138,
    shoppingCart: {
      id: 1652692327498,
      userId: 1,
      completed: true,
      items: [
        {
          productId: product.id,
          unitPrice: product.price,
          quantity: 1,
          totalPrice: product.price,
        },
        {
          productId: secondProduct.id,
          unitPrice: secondProduct.price,
          quantity: 2,
          totalPrice: 2 * secondProduct.price,
        },
      ],
      totalPrice: product.price + 2 * secondProduct.price,
    },
    successState: 'VALIDATING_BALANCE',
    failureState: 'REJECTED',
  };

  test('Given an event with non existing product When consume validate items event Then should not update items stock and send event with failure state', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return null;
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      };
    });

    const orderUpdateRequestedEvent = {
      id: message.id,
      state: message.failureState,
      errors: ['Product with id 1 not found'],
    };

    return consumerService.consumeValidateItemsEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(kafka.getProducer().send.mock.calls[0][0].topic).toBe(config['kafka.topics.changeState']);
        expect(kafka.getProducer().send.mock.calls[0][0].messages.length).toBe(1);
        expect(kafka.getProducer().send.mock.calls[0][0].messages[0].value)
          .toBe(JSON.stringify(orderUpdateRequestedEvent));
        expect(productService.update.mock.calls.length).toBe(0);
      });
  });

  test('Given an event with non available quantity product When consume validate items event Then should not update items stock and send event with failure state', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: 0,
        };
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      };
    });

    const orderUpdateRequestedEvent = {
      id: message.id,
      state: message.failureState,
      errors: ['Required 1 units of product 1, but only 0 available'],
    };

    return consumerService.consumeValidateItemsEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(kafka.getProducer().send.mock.calls[0][0].topic).toBe(config['kafka.topics.changeState']);
        expect(kafka.getProducer().send.mock.calls[0][0].messages.length).toBe(1);
        expect(kafka.getProducer().send.mock.calls[0][0].messages[0].value)
          .toBe(JSON.stringify(orderUpdateRequestedEvent));
        expect(productService.update.mock.calls.length).toBe(0);
      });
  });

  test('Given an event with product with different price When consume validate items event Then should not update items stock and send event with failure state', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: 9.99,
          quantity: product.quantity,
        };
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      };
    });

    const orderUpdateRequestedEvent = {
      id: message.id,
      state: message.failureState,
      errors: [`Product price is 9.99 but ${product.price} was received`],
    };

    return consumerService.consumeValidateItemsEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(kafka.getProducer().send.mock.calls[0][0].topic).toBe(config['kafka.topics.changeState']);
        expect(kafka.getProducer().send.mock.calls[0][0].messages.length).toBe(1);
        expect(kafka.getProducer().send.mock.calls[0][0].messages[0].value)
          .toBe(JSON.stringify(orderUpdateRequestedEvent));
        expect(productService.update.mock.calls.length).toBe(0);
      });
  });

  test('Given an event with two invalid products When consume validate items event Then should not update items stock and send event with failure state', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: 9.99,
          quantity: product.quantity,
        };
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: 1,
      };
    });

    const orderUpdateRequestedEvent = {
      id: message.id,
      state: message.failureState,
      errors: [
        `Product price is 9.99 but ${product.price} was received`,
        'Required 2 units of product 2, but only 1 available',
      ],
    };

    return consumerService.consumeValidateItemsEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(kafka.getProducer().send.mock.calls[0][0].topic).toBe(config['kafka.topics.changeState']);
        expect(kafka.getProducer().send.mock.calls[0][0].messages.length).toBe(1);
        expect(kafka.getProducer().send.mock.calls[0][0].messages[0].value)
          .toBe(JSON.stringify(orderUpdateRequestedEvent));
        expect(productService.update.mock.calls.length).toBe(0);
      });
  });

  test('Given an event with two valid products When consume validate items event Then should update items stock and send event with success state', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
        };
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      };
    });

    const orderUpdateRequestedEvent = {
      id: message.id,
      state: message.successState,
    };

    return consumerService.consumeValidateItemsEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(kafka.getProducer().send.mock.calls[0][0].topic).toBe(config['kafka.topics.changeState']);
        expect(kafka.getProducer().send.mock.calls[0][0].messages.length).toBe(1);
        expect(kafka.getProducer().send.mock.calls[0][0].messages[0].value)
          .toBe(JSON.stringify(orderUpdateRequestedEvent));
        expect(productService.update.mock.calls.length).toBe(2);
        expect(productService.update.mock.calls[0][0].quantity)
          .toBe(product.quantity - message.shoppingCart.items[0].quantity);
        expect(productService.update.mock.calls[1][0].quantity)
          .toBe(secondProduct.quantity - message.shoppingCart.items[1].quantity);
      });
  });
});

describe('consumerService consumeRestoreStockEvent function tests', () => {
  const message = {
    id: 1652692351138,
    shoppingCart: {
      id: 1652692327498,
      userId: product.id,
      completed: true,
      items: [
        {
          productId: product.id,
          unitPrice: product.price,
          quantity: 1,
          totalPrice: product.price,
        },
        {
          productId: secondProduct.id,
          unitPrice: secondProduct.price,
          quantity: 2,
          totalPrice: 2 * secondProduct.price,
        },
      ],
      totalPrice: product.price + 2 * secondProduct.price,
    },
    errors: ['User hasn\'t got enough balance'],
  };

  test('Given an event with an existing and a non existing product When consume restore items event Then should only update items stock for existing item', () => {
    productService.getById = jest.fn((id) => {
      if (id === product.id) {
        return null;
      }
      return {
        id: secondProduct.id,
        name: secondProduct.name,
        description: secondProduct.description,
        price: secondProduct.price,
        quantity: secondProduct.quantity,
      };
    });

    return consumerService.consumeRestoreStockEvent({ value: JSON.stringify(message) })
      .then(() => {
        expect(productService.getById.mock.calls[0][0]).toBe(product.id);
        expect(productService.getById.mock.calls[1][0]).toBe(secondProduct.id);
        expect(productService.update.mock.calls.length).toBe(1);
        expect(productService.update.mock.calls[0][0].quantity)
          .toBe(secondProduct.quantity + message.shoppingCart.items[1].quantity);
      });
  });
});
