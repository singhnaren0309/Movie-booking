const { producer } = require('../utils/kafkaClient');

/**
 * Publishes domain events to Kafka topic 'booking-lifecycle-events'
 * Partitioned by userId to guarantee ordered delivery per user.
 */
const publishBookingEvent = async (eventType, eventData) => {
  try {
    const payload = {
      eventType,
      timestamp: new Date().toISOString(),
      ...eventData
    };

    await producer.send({
      topic: 'booking-lifecycle-events',
      messages: [
        {
          key: eventData.userId ? eventData.userId.toString() : 'general', // Ensures ordering per user
          value: JSON.stringify(payload)
        }
      ]
    });
    console.log(`[KAFKA] Event '${eventType}' published for booking ${eventData.bookingId}`);
  } catch (error) {
    console.error(`[KAFKA] Failed to publish event '${eventType}':`, error.message);
  }
};

module.exports = publishBookingEvent;
module.exports.publishBookingEvent = publishBookingEvent;
