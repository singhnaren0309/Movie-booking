const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const emailNotificationWorker = require("./crons/cron");

const app = express();
app.use(express.json());

// Start the continuous Redis listener
emailNotificationWorker();

app.listen(process.env.PORT, () => {
    console.log(`Notification Worker Service is running on port ${process.env.PORT}`);
});
