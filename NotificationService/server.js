const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const {runNotificationConsumer} = require("./worker/worker.js");

const app = express();
app.use(express.json());

runNotificationConsumer().catch((err) => {
    console.error("[KAFKA] Failed to start notification consumer:", err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Notification Worker Service is running on port ${PORT}`);
});
