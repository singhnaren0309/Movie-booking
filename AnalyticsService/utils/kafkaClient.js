const { Kafka, logLevel } = require("kafkajs");

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: brokers,
  connectionTimeout: 5000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
    factor: 1.5
  },
  logLevel: logLevel.ERROR
});

const consumer = kafka.consumer({
  groupId: 'analytics-service-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

module.exports = {
  kafka,
  consumer
};
