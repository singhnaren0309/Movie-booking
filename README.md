# 🎬 AI-Powered Movie Booking Microservices

An intelligent, highly scalable movie ticketing platform built with a microservices architecture. This project features a core backend system supported by a dedicated Agentic AI service, allowing users to discover movies, check showtimes, and book tickets entirely through natural language conversations.

## ✨ Key Features

- **Agentic AI Orchestrator**: A conversational booking assistant powered by the Groq SDK. The AI dynamically translates user intent (e.g., *"Book 2 seats for a space movie at 7 PM"*) into strict JSON payloads to autonomously execute backend API tools.
- **Semantic RAG Pipeline**: Bypasses heavy frameworks (like LangChain) by utilizing native **MongoDB Atlas Vector Search**. Extracts movie embeddings to enable fast, highly accurate discovery based on plot descriptions or genres.
- **Zero Double-Booking Guarantee**: Implements **Redis Distributed Locking (`SET NX`)** to achieve ACID-level consistency, preventing race conditions when multiple users attempt to book the same seats simultaneously.
- **Microservices Architecture**: Cleanly decouples the Core Booking API (Port 3000) from the AI Service (Port 3002). Inter-service communication is secured via JWT-based Role-Based Access Control (RBAC).
- **Event-Driven Processing**: Leverages Redis Message Queues (`LPUSH` / `BRPOP`) for asynchronous, non-blocking tasks, such as triggering background sentiment analysis and sending email notifications.
- **High-Performance Caching**: Employs Redis caching middleware to drastically reduce MongoDB read overhead for high-traffic movie and theatre queries.

## 🛠️ Tech Stack

- **Runtime & Frameworks**: Node.js, Express.js
- **Database & Search**: MongoDB, Mongoose, MongoDB Atlas Vector Search
- **Caching & Queues**: Redis
- **AI & Machine Learning**: Groq SDK (Llama 3 / GPT-OSS models), HuggingFace Transformers (for vector embeddings)
- **Security**: JWT (JSON Web Tokens), bcrypt

## 📂 Project Structure

```text
Movie-booking/
├── Movie_Booking/       # Core Backend Microservice (Database, Auth, Logic)
│   ├── models/          # Mongoose Schemas (Movie, Show, Theatre, Booking)
│   ├── controllers/     # API Business Logic
│   ├── services/        # DB operations, Redis locking, and event queues
│   ├── middlewares/     # JWT Auth and Redis Cache validation
│   └── index.js         # Entry point (Port 3000)
│
└── AIService/           # AI Orchestration Microservice
    ├── controllers/     # AI routing and tool-execution loop
    ├── prompts/         # System prompts and behavior guardrails
    ├── services/        # Groq API integration
    ├── tools/           # JSON Schemas defining backend API tools for the LLM
    └── server.js        # Entry point (Port 3002)
