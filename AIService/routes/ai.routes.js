const express = require("express");
const aiController = require("../controllers/ai.controller");

module.exports = (app) => {
    const router = express.Router();
    
    // POST /api/v1/chat
    router.post("/api/v1/chat", aiController.handleChat);
    
    app.use(router);
};
