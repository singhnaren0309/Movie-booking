const redisClient = require('../utils/redisClient');
const sendEmail = async (subject, email, content) => {
    try {
        const recepients = Array.isArray(email) ? email : [email];
        const notificationData = {
            subject: subject,
            receipientEmails: recepients,
            content: content
        };
        
        await redisClient.lPush('email_queue', JSON.stringify(notificationData));
        console.log("Pushed email notification to Redis queue.");
        return { success: true };
    } catch (error) {
        console.error("Failed to push notification email to Redis:", error.message);
    }
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
