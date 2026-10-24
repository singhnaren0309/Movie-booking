const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const aiRoutes = require("./routes/ai.routes");

dotenv.config();

const app = express();

// Enable CORS for direct microservice access
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-access-token");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(bodyParser.json());

// Initialize routes
aiRoutes(app);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`AIService running on port ${PORT}`);
});
