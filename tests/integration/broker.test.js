const { KafkaContainer, GenericContainer } = require('testcontainers');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { getProducer, getKafkaClient } = require('../../src/kafka');
const broker = require('../../src/broker');
const app = require('../../src/app');
const initDatabase = require('../../src/database');

let kafkaContainer;
let dynamoContainer;
let producer;
let spy;

const validateItemsTopic = config['kafka.topics.validateItems'];
const restoreStockTopic = config['kafka.topics.restoreStock'];
const changeStateTopic = config['kafka.topics.changeState'];

const request = supertest(app);

const BASE_URL = '/api/v1/products';
let adminToken;

jest.setTimeout(240000);

const WAIT_TIME = 10;

beforeAll(async () => {
  kafkaContainer = await new KafkaContainer().withExposedPorts(9093).start();

  dynamoContainer = await new GenericContainer('amazon/dynamodb-local', '1.18.0')
    .withExposedPorts(8000)
    .start();

  config['dynamo.region'] = process.env.AWS_REGION || 'local';
  config['dynamo.endpoint'] = process.env.AWS_DYNAMO_ENDPOINT || `http://localhost:${dynamoContainer.getMappedPort(8000)}`;
  config['dynamo.accessKeyId'] = 'xxxx';
  config['dynamo.secretAccessKey'] = 'xxxxx';
  config['kafka.enabled'] = process.env.KAFKA_ENABLED || true;
  config['kafka.host'] = process.env.KAFKA_HOST || kafkaContainer.getHost();
  config['kafka.port'] = process.env.KAFKA_PORT || kafkaContainer.getMappedPort(9093);

  initDatabase();

  const admin = getKafkaClient().admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [
      { topic: validateItemsTopic, numPartitions: 1, replicationFactor: 1 },
      { topic: changeStateTopic, numPartitions: 1, replicationFactor: 1 },
      { topic: restoreStockTopic, numPartitions: 1, replicationFactor: 1 },
    ],
  });

  producer = getProducer();
  await producer.connect();

  spy = jest.spyOn(producer, 'send');

  await broker.listen();

  adminToken = `Bearer ${jwt.sign({ id: 1, role: 'ADMIN_ROLE' }, config.secret, {
    expiresIn: 300,
  })}`;
});

afterAll(async () => {
  spy.mockRestore();
  await producer.disconnect();
  await broker.disconnect();
  await kafkaContainer.stop();
  await dynamoContainer.stop();
});

const sleep = async (seconds) => new Promise((resolve) => {
  setTimeout(resolve, (seconds * 1000));
});

async function sendEvent(topic, message) {
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) },
    ],
  });
}

const products = [
  {
    name: 'product 1',
    description: 'product 1 description',
    price: 42.4,
    quantity: 100,
  },
  {
    name: 'product 2',
    description: 'product 2 description',
    price: 24.55,
    quantity: 12,
  },
  {
    name: 'product 3',
    description: 'product 3 description',
    price: 9.99,
    quantity: 20,
  },
  {
    name: 'product 4',
    description: 'product 4 description',
    price: 4.85,
    quantity: 2,
  },
  {
    name: 'product 5',
    description: 'product 5 description',
    price: 8.32,
    quantity: 27,
  },
];

describe('Broker tests', () => {
  it('Given a validate items event When consume it and items are valid Then should update items quantity and send change order state event with success state', async () => {
    let firstProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[0])
      .expect(201)
      .then((response) => {
        firstProductId = response.body.id;
      });

    let secondProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[1])
      .expect(201)
      .then((response) => {
        secondProductId = response.body.id;
      });

    const validateItemsMsg = {
      id: 1652692351138,
      shoppingCart: {
        id: 1652692327498,
        userId: 1,
        completed: true,
        items: [
          {
            productId: firstProductId,
            unitPrice: products[0].price,
            quantity: products[0].quantity,
            totalPrice: products[0].price * products[0].quantity,
          },
          {
            productId: secondProductId,
            unitPrice: products[1].price,
            quantity: 2,
            totalPrice: products[1].price * 2,
          },
        ],
        totalPrice: (products[0].price * products[0].quantity) + (products[1].price * 2),
      },
      successState: 'VALIDATING_BALANCE',
      failureState: 'REJECTED',
    };

    await sendEvent(validateItemsTopic, validateItemsMsg);

    await sleep(WAIT_TIME);

    await expect(spy).toHaveBeenLastCalledWith(
      {
        topic: changeStateTopic,
        messages: [
          {
            value: JSON.stringify({
              id: validateItemsMsg.id,
              state: validateItemsMsg.successState,
            }),
          },
        ],
      },
    );

    await request.get(`${BASE_URL}/${firstProductId}`)
      .set('Authorization', adminToken)
      .expect(200)
      .then((response) => {
        expect(response.body.quantity).toBe(0);
      });

    return request.get(`${BASE_URL}/${secondProductId}`)
      .set('Authorization', adminToken)
      .expect(200)
      .then((response) => {
        expect(response.body.quantity).toBe(products[1].quantity - 2);
      });
  });

  it('Given a validate items event When consume it and items are invalid Then should not update items quantity and send change order state event with failure state', async () => {
    let firstProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[2])
      .expect(201)
      .then((response) => {
        firstProductId = response.body.id;
      });

    let secondProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[3])
      .expect(201)
      .then((response) => {
        secondProductId = response.body.id;
      });

    const validateItemsMsg = {
      id: 1652692351138,
      shoppingCart: {
        id: 1652692327498,
        userId: 1,
        completed: true,
        items: [
          {
            productId: firstProductId,
            unitPrice: products[2].price,
            quantity: products[2].quantity + 1,
            totalPrice: products[2].price * products[2].quantity,
          },
          {
            productId: secondProductId,
            unitPrice: products[3].price,
            quantity: 1,
            totalPrice: products[3].price,
          },
        ],
        totalPrice: (products[2].price * (products[2].quantity + 1)) + products[3].price,
      },
      successState: 'VALIDATING_BALANCE',
      failureState: 'REJECTED',
    };

    await sendEvent(validateItemsTopic, validateItemsMsg);

    await sleep(WAIT_TIME);

    await expect(spy).toHaveBeenLastCalledWith(
      {
        topic: changeStateTopic,
        messages: [
          {
            value: JSON.stringify({
              id: validateItemsMsg.id,
              state: validateItemsMsg.failureState,
              errors: [`Required ${products[2].quantity + 1} units of product ${firstProductId}, but only ${products[2].quantity} available`],
            }),
          },
        ],
      },
    );

    await request.get(`${BASE_URL}/${firstProductId}`)
      .set('Authorization', adminToken)
      .expect(200)
      .then((response) => {
        expect(response.body.quantity).toBe(products[2].quantity);
      });

    return request.get(`${BASE_URL}/${secondProductId}`)
      .set('Authorization', adminToken)
      .expect(200)
      .then((response) => {
        expect(response.body.quantity).toBe(products[3].quantity);
      });
  });

  it('Given a validate items event with non existing items When consume it Then should change order state event with failure state', async () => {
    const validateItemsMsg = {
      id: 1652692351138,
      shoppingCart: {
        id: 1652692327498,
        userId: 1,
        completed: true,
        items: [
          {
            productId: 9999998,
            unitPrice: products[2].price,
            quantity: products[2].quantity + 1,
            totalPrice: products[2].price * products[2].quantity,
          },
          {
            productId: 9999999,
            unitPrice: products[3].price,
            quantity: 1,
            totalPrice: products[3].price,
          },
        ],
        totalPrice: (products[2].price * (products[2].quantity + 1)) + products[3].price,
      },
      successState: 'VALIDATING_BALANCE',
      failureState: 'REJECTED',
    };

    await sendEvent(validateItemsTopic, validateItemsMsg);

    await sleep(WAIT_TIME);

    await expect(spy).toHaveBeenLastCalledWith(
      {
        topic: changeStateTopic,
        messages: [
          {
            value: JSON.stringify({
              id: validateItemsMsg.id,
              state: validateItemsMsg.failureState,
              errors: ['Product with id 9999998 not found', 'Product with id 9999999 not found'],
            }),
          },
        ],
      },
    );
  });

  it('Given a restore stock event When consume it Then should update items quantity', async () => {
    let firstProductId;
    await request.post(BASE_URL)
      .set('Authorization', adminToken)
      .set('Accept', 'application/json')
      .send(products[4])
      .expect(201)
      .then((response) => {
        firstProductId = response.body.id;
      });

    const restoreStockMsg = {
      id: 1652692351138,
      shoppingCart: {
        id: 1652692327498,
        userId: 1,
        completed: true,
        items: [
          {
            productId: firstProductId,
            unitPrice: products[4].price,
            quantity: 1,
            totalPrice: products[4].price,
          },
        ],
        totalPrice: products[4].price,
      },
      errors: ['User has not enough balance'],
    };

    await sendEvent(restoreStockTopic, restoreStockMsg);

    await sleep(WAIT_TIME);

    return request.get(`${BASE_URL}/${firstProductId}`)
      .set('Authorization', adminToken)
      .expect(200)
      .then((response) => {
        expect(response.body.quantity).toBe(products[4].quantity + 1);
      });
  });
});
