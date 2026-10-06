const { sendMail } = require("../services/email.service");
const redisClient = require('../utils/redisClient');

const emailNotificationWorker = async () => {
    console.log("[WORKER] Started Redis Email Queue Consumer...");
    while (true) {
        try {
            // Block until a new message is pushed to the 'email_queue'
            const result = await redisClient.brPop('email_queue', 0);
            
            if (result && result.element) {
                const data = JSON.parse(result.element);
                
                try {
                    await sendMail(data.receipientEmails, data.subject, data.content);
                    console.log(`[WORKER] Email sent successfully to ${data.receipientEmails}`);
                } catch (mailError) {
                    console.error(`[WORKER] Error sending email to ${data.receipientEmails}:`, mailError.message);
                }
            }
        } catch (err) {
            console.error("[WORKER] Error processing Redis queue:", err.message);
            // Brief pause before retrying on failure
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

module.exports = emailNotificationWorker;
