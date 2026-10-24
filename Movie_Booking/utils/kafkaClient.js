const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "movie-booking",
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer({
    idempotent:true,
    maxInFlightRequests:1
});

const connectProducer=async()=>{
    await producer.connect();
    console.log("Producer connected");
}

module.exports ={kafka,producer,connectProducer};