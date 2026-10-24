const { consumer, producer } = require('../utils/kafkaClient');
const { sendMail } = require('../services/email.service');
const { generateBookingEmailHtml } = require('../utils/emailTemplates');

const MAX_RETRIES = 3;

const runNotificationConsumer = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ 
    topics: ['booking-lifecycle-events', 'booking-lifecycle-retry'], 
    fromBeginning: false 
  });

  console.log('[KAFKA] Notification consumer subscribed to topics');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let event;
      try {
        event = JSON.parse(message.value.toString());
      } catch (parseErr) {
        console.error('[KAFKA] Poison pill message. Discarding:', parseErr.message);
        return;
      }

      const currentRetries = event.retryCount || 0;

      try {
        // Handle different event types:
        if (event.eventType === 'BOOKING_CONFIRMED' || event.eventType === 'BOOKING_PAYMENT_SUCCESS') {
          const recipientEmail = event.userEmail || event.email;
          const htmlContent = generateBookingEmailHtml({
            customerName: event.customerName,
            movieName: event.movieName,
            theatreName: event.theatreName,
            timing: event.timing,
            seats: event.seats,
            amount: event.amount,
            bookingId: event.bookingId
          });

          await sendMail(
            recipientEmail,
            `🎟️ Your Movie Tickets: ${event.movieName}`,
            `Hi ${event.customerName}, your tickets for ${event.movieName} at ${event.theatreName} are confirmed!`,
            htmlContent
          );
          console.log(`[WORKER] Ticket email sent to ${recipientEmail}`);
        } else if (event.eventType === 'BOOKING_CANCELLED') {
          const recipientEmail = event.userEmail || event.email;
          await sendMail(
            recipientEmail,
            `Booking Cancelled - ${event.movieName}`,
            `Hi ${event.customerName}, your booking has been cancelled and refund initiated.`
          );
          console.log(`[WORKER] Cancellation email sent to ${recipientEmail}`);
        }
      } catch (err) {
        console.error(`[WORKER] Error sending email (Attempt ${currentRetries + 1}/${MAX_RETRIES}):`, err.message);

        if (currentRetries < MAX_RETRIES) {
          event.retryCount = currentRetries + 1;

          // Non-blocking forward to retry topic (does NOT freeze the partition!)
          await producer.send({
            topic: 'booking-lifecycle-retry',
            messages: [{
              key: event.userId ? event.userId.toString() : 'retry',
              value: JSON.stringify(event)
            }]
          });
          console.log(`[KAFKA] Message forwarded to retry topic (Attempt ${event.retryCount})`);
        } else {
          // Dead-Letter Queue (DLQ)
          event.failedAt = new Date().toISOString();
          event.failureReason = err.message;
          await producer.send({
            topic: 'booking-lifecycle-dlq',
            messages: [{
              key: event.userId ? event.userId.toString() : 'dlq',
              value: JSON.stringify(event)
            }]
          });
          console.error(`[KAFKA] Max retries exceeded. Moved to DLQ:`, event.bookingId);
        }
      }
    }
  });
};

module.exports = { runNotificationConsumer };
