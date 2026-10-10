# 🎬 AI-Powered Movie Booking Microservices

An intelligent, highly scalable movie ticketing platform built with a microservices architecture. This project features a core backend system supported by a dedicated Agentic AI service and an asynchronous Notification worker, allowing users to discover movies, check showtimes, and book tickets entirely through natural language conversations while receiving background confirmations.

## ✨ Key Features

- **Agentic AI Orchestrator**: A conversational booking assistant powered by the Groq SDK. The AI dynamically translates user intent (e.g., *"Book 2 seats for a space movie at 7 PM"*) into strict JSON payloads to autonomously execute backend API tools.
- **Semantic RAG Pipeline**: Bypasses heavy frameworks (like LangChain) by utilizing native **MongoDB Atlas Vector Search**. Extracts movie embeddings to enable fast, highly accurate discovery based on plot descriptions or genres.
- **Zero Double-Booking Guarantee**: Implements **Redis Distributed Locking (`SET NX`)** to achieve ACID-level consistency, preventing race conditions when multiple users attempt to book the same seats simultaneously.
- **Microservices Architecture**: Cleanly decouples the Core Booking API (Port 3000), the AI Service (Port 3002), and the Notification Service (Port 3001). Inter-service communication is secured via JWT-based Role-Based Access Control (RBAC).
- **Event-Driven Notification Worker**: Leverages a continuous Redis Message Queue listener (`brPop`) in a dedicated Notification Service to handle asynchronous tasks, such as sending ticket confirmation emails, without blocking the main event loop.
- **High-Performance Caching**: Employs Redis caching middleware to drastically reduce MongoDB read overhead for high-traffic movie and theatre queries.

## 🛠️ Tech Stack

- **Runtime & Frameworks**: Node.js, Express.js
- **Database & Search**: MongoDB, Mongoose, MongoDB Atlas Vector Search
- **Caching & Queues**: Redis
- **AI & Machine Learning**: Groq SDK (Llama 3 / GPT-OSS models), HuggingFace Transformers (for vector embeddings)
- **Security & Mail**: JWT (JSON Web Tokens), bcrypt, Nodemailer

## 📂 Project Structure

```text
Movie-booking/
├── Movie_Booking/           # Core Backend Microservice (Port 3000)
│   ├── models/              # Mongoose Schemas (Movie, Show, Theatre, Booking)
│   ├── controllers/         # API Business Logic
│   ├── services/            # DB operations, Redis locking, and event producers
│   ├── middlewares/         # JWT Auth and Redis Cache validation
│   └── index.js             
│
├── AIService/               # AI Orchestration Microservice (Port 3002)
│   ├── controllers/         # AI routing and tool-execution loop
│   ├── prompts/             # System prompts and behavior guardrails
│   ├── tools/               # JSON Schemas defining backend API tools for the LLM
│   └── server.js            
│
└── NotificationService/     # Event-Driven Worker Microservice (Port 3001)
    ├── crons/               # Continuous Redis Queue Consumer (brPop listener)
    ├── services/            # Email formatting and Nodemailer logic
    └── server.js            
