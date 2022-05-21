const config = require('../config/config');
const consumerService = require('./services/consumerService');
const { getConsumer } = require('./kafka');

let consumer;

const validateItemsTopic = config['kafka.topics.validateItems'];
const restoreStockTopic = config['kafka.topics.restoreStock'];

const listen = async () => {
  if (!config['kafka.enabled']) {
    return;
  }
  try {
    console.log('Connecting to broker.');
    consumer = getConsumer();
    await consumer.connect();
    await consumer.subscribe({ topic: validateItemsTopic });
    await consumer.subscribe({ topic: restoreStockTopic });
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (topic === validateItemsTopic) {
          consumerService.consumeValidateItemsEvent(message);
        } else if (topic === restoreStockTopic) {
          consumerService.consumeRestoreStockEvent(message);
        }
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const disconnect = async () => {
  if (!config['kafka.enabled']) {
    return;
  }
  console.log('Disconnecting from broker');
  if (consumer) {
    await consumer.disconnect();
  }
};

module.exports = {
  listen,
  disconnect,
};
