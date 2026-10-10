const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const aiRoutes = require("./routes/ai.routes");

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize routes
aiRoutes(app);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`AIService running on port ${PORT}`);
});
