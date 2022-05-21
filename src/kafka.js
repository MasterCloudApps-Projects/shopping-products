const { Kafka, logLevel } = require('kafkajs');
const config = require('../config/config');

let kafka;
let consumer;
let producer;

function getKafkaClient() {
  if (!kafka) {
    kafka = new Kafka({
      logLevel: logLevel.INFO,
      brokers: [`${config['kafka.host']}:${config['kafka.port']}`],
      retry: {
        initialRetryTime: config['kafka.retry.initialRetryTime'],
        retries: config['kafka.retry.retries'],
      },
      clientId: 'products-consumer',
    });
  }
  return kafka;
}

function getConsumer() {
  if (!consumer) {
    getKafkaClient();
    consumer = kafka.consumer({ groupId: config['kafka.groupId'] });
  }
  return consumer;
}

function getProducer() {
  if (!producer) {
    getKafkaClient();
    producer = kafka.producer();
  }
  return producer;
}

module.exports = {
  getKafkaClient,
  getConsumer,
  getProducer,
};
