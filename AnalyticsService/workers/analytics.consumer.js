const { consumer } = require('../utils/kafkaClient');
const MovieMetrics = require('../models/movieMetrics.model');
const ProcessedEvent = require('../models/processedEvent.model');

const runAnalyticsConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topics: ['booking-lifecycle-events', 'ai-interaction-events'],
    fromBeginning: false
  });

  console.log('[ANALYTICS] Kafka Consumer connected & subscribed to topics.');

  await consumer.run({
    eachBatchAutoResolve: false,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
      if (!isRunning() || isStale()) return;

      const parsedEvents = [];
      const eventIds = [];

      // 1. Batch me se saare valid messages parse karo
      for (const message of batch.messages) {
        try {
          const event = JSON.parse(message.value.toString());
          const identifier = event.bookingId || event.sessionId;

          // Agar identifier ya movieName hi na ho toh poison pill ki tarah skip karo
          if (!identifier || (!event.movieName && event.eventType !== 'AI_USER_QUERY')) {
            resolveOffset(message.offset);
            continue;
          }

          const eventId = `${identifier}_${event.eventType}`;
          parsedEvents.push({ event, eventId, offset: message.offset });
          eventIds.push(eventId);
        } catch (err) {
          console.error('[ANALYTICS] Poison pill skipped:', err.message);
          resolveOffset(message.offset);
        }
      }

      if (!parsedEvents.length) return;

      // 2. Batch Idempotency Check: Already processed events dhoondo
      const alreadyProcessed = await ProcessedEvent.find({
        eventId: { $in: eventIds }
      }).select('eventId');

      const processedSet = new Set(alreadyProcessed.map(doc => doc.eventId));

      const metricOperations = [];
      const processedEventOps = [];
      const seenInThisBatch = new Set();
      const offsetsToCommit = [];

      // 3. Prepare bulk operations for only fresh/unprocessed events
      for (const item of parsedEvents) {
        const { event, eventId, offset } = item;

        if (processedSet.has(eventId) || seenInThisBatch.has(eventId)) {
          offsetsToCommit.push(offset);
          continue;
        }

        seenInThisBatch.add(eventId);
        
        // Idempotency collection ke liye upsert operation
        processedEventOps.push({
          updateOne: {
            filter: { eventId },
            update: { $setOnInsert: { eventId, processedAt: new Date() } },
            upsert: true
          }
        });

        // Metrics collection update
        if (event.eventType === 'BOOKING_PAYMENT_SUCCESS' || event.eventType === 'BOOKING_CONFIRMED') {
          const seatsCount = Array.isArray(event.seats) ? event.seats.length : 1;
          const amount = Number(event.amount) || 0;

          metricOperations.push({
            updateOne: {
              filter: { movieName: event.movieName },
              update: {
                $set: { lastUpdated: new Date() },
                $inc: {
                  totalBookings: 1,
                  totalTicketsSold: seatsCount,
                  totalRevenue: amount
                }
              },
              upsert: true
            }
          });
        }

        offsetsToCommit.push(offset);
      }

      // 4. Atomic MongoDB Execution (Offsets tabhi commit honge jab DB write pass hoga)
      try {
        if (metricOperations.length > 0) {
          await MovieMetrics.bulkWrite(metricOperations, { ordered: false });
        }
        if (processedEventOps.length > 0) {
          await ProcessedEvent.bulkWrite(processedEventOps, { ordered: false });
        }

        // DB save ho gaya, ab Kafka offsets confirm karo!
        for (const offset of offsetsToCommit) {
          resolveOffset(offset);
        }

        console.log(`[ANALYTICS] Batch processed: ${metricOperations.length} metrics updated, ${offsetsToCommit.length} offsets resolved.`);
      } catch (dbErr) {
        console.error('[ANALYTICS] DB Write Failed! Kafka offsets will NOT be committed for re-try:', dbErr.message);
        throw dbErr; // Throw karne se Kafka batch ko redeliver karega
      }

      await heartbeat();
    }
  });
};

module.exports = { runAnalyticsConsumer };
