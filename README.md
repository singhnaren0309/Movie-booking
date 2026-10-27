# 🎬 CinePass — Distributed AI-Powered Movie Ticketing Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.2-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose%209-brightgreen.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Apache Kafka](https://img.shields.io/badge/Streaming-Apache%20Kafka%20%2F%20KafkaJS-231F20.svg?style=flat-square&logo=apachekafka)](https://kafka.apache.org/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20Locks-Redis-red.svg?style=flat-square&logo=redis)](https://redis.io/)
[![HuggingFace](https://img.shields.io/badge/Embeddings-HuggingFace%20Transformers-yellow.svg?style=flat-square&logo=huggingface)](https://huggingface.co/)
[![Groq AI](https://img.shields.io/badge/Agentic%20AI-Groq%20SDK%20%2F%20Llama%203-blue.svg?style=flat-square)](https://groq.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-purple.svg?style=flat-square)](https://microservices.io/)

A distributed, enterprise-grade movie reservation and booking system built with microservices architecture. It combines high-concurrency ticket reservation with **Redis Distributed Locking**, **Apache Kafka** event-driven email delivery, in-process **Hugging Face Semantic Vector Search**, and an autonomous **Groq Agentic AI Assistant** capable of discovering films and executing bookings via natural language conversations.

---

## 🏛️ System Architecture

```text
                                  ┌────────────────────────┐
                                  │   Client / Frontend    │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     API GATEWAY                                        │
└──────┬──────────────────────────────────────┬───────────────────────────────────┬──────┘
       │ :3000                                │ :3002                             │
       ▼                                      ▼                                   │
┌──────────────────────────────┐       ┌──────────────────────────────┐           │
│   Movie_Booking Service      │       │      AIService (Agent)       │           │
│  - REST API Engine           │◄──────┤  - Groq LLM (Llama 3.3)      │           │
│  - JWT Auth & RBAC           │ Tools │  - Autonomous Function Calls │           │
│  - Redis Distributed Lock    │       │  - Conversational Interface  │           │
│  - HF Vector Semantic Search │       └──────────────────────────────┘           │
└──────┬───────────────┬───────┘                                                  │
       │               │                                                          │
       │ Redis Locks   │ Kafka Producer                                           │
       ▼               ▼                                                          │
┌──────────────┐ ┌───────────────────────────────────────────┐                    │
│ Redis Cache  │ │          Apache Kafka Event Bus           │                    │
│  & Seat TTL  │ │ Topic: notification-events                │                    │
└──────────────┘ └─────────────────────┬─────────────────────┘                    │
                                       │                                          │
                                       │ Consumer (notification-group)            │
                                       ▼                                          │
                        ┌──────────────────────────────┐                          │
                        │    NotificationService       │                          │
                        │  - Kafka Background Worker   │                          │
                        │  - Poison-Pill Resilience    │                          │
                        │  - Exponential Backoff Retry │                          │
                        │  - Dead-Letter Queue (DLQ)   │                          │
                        │  - Rich HTML Ticket Stubs    │                          │
                        └──────────────┬───────────────┘                          │
                                       │ SMTP (Nodemailer)                        │
                                       ▼                                          │
                        ┌──────────────────────────────┐                          │
                        │    User Email / Inbox ✉️     │◄─────────────────────────┘
                        └──────────────────────────────┘
```

---

## ⚡ Core Engineering Highlights

### 1. Zero Double-Booking Guarantee (Redis Distributed Locking)
- When a user selects seats during checkout, the server claims temporary reservation keys in Redis:
  ```text
  Key: hold:seats:<theatreId>:<timing>:<seatNumber>
  TTL: 600 seconds (10 minutes)
  ```
- If another concurrent user attempts to claim the same seat, Redis atomically rejects the operation (`SET NX`), preventing race conditions and double-bookings before the MongoDB transaction commits.

### 2. Event-Driven Asynchronous Notifications (Apache Kafka)
- Payment confirmations publish decoupled events to Kafka topic `notification-events` partitioned by user email.
- The `NotificationService` worker consumes events asynchronously, ensuring that slow SMTP handshakes never degrade core checkout response times.
- **Fault-Tolerant Retries**:
  - Unparseable poison-pill messages are safely discarded to protect consumer groups from getting stuck.
  - Temporary network/SMTP glitches trigger exponential backoff retries ($2^n$ seconds) up to 3 attempts.
  - Permanently failing messages are routed to `notification-events-dlq` for dead-letter auditing.

### 3. In-Process AI Semantic Search (Hugging Face Transformers)
- Employs `@huggingface/transformers` (`Xenova/all-MiniLM-L6-v2`) in Node.js to extract 384-dimensional dense vector embeddings.
- Enables queries by theme or synopsis (e.g., *"dream infiltration heist within an architectural subconscious"* matches **Inception**).
- Computes cosine similarity scores in memory or natively via MongoDB Atlas Vector Search.

### 4. Autonomous Agentic AI Assistant (Groq SDK)
- Powered by `llama-3.3-70b-versatile` through Groq.
- Automatically understands natural language intent, invokes backend function tools (`search_movies`, `get_movie_details`, `get_theatres_and_shows`, `book_movie_tickets`), and validates booking steps autonomously.

### 5. Role-Based Access Control (RBAC)
- Strict access layers enforced via JWT Bearer authentication:
  - **`CUSTOMER`**: Browse catalog, query semantic search, reserve seats, make payments, inspect booking history.
  - **`CLIENT`**: Theatre owners manage shows, format configurations (2D, 3D, IMAX), and pricing.
  - **`ADMIN`**: Global platform administration, movie approvals, user status management.

---

## 📂 Project Structure

```text
Movie-booking-main/
├── Movie_Booking/                   # Core Booking API Microservice (Port 3000)
│   ├── controllers/                 # REST controllers (auth, movie, theatre, show, booking, payment)
│   ├── middlewares/                 # JWT Auth validation, RBAC policies, Redis query caching
│   ├── models/                      # Mongoose models (User, Movie, Theatre, Show, Booking, Payment)
│   ├── routes/                      # API endpoint definitions
│   ├── services/                    # Business logic, Redis locking, and Kafka producer
│   ├── utils/
│   │   ├── constants.js             # User roles, status codes, booking states
│   │   ├── emailTemplates.js        # Responsive inline-CSS cinema ticket HTML generator
│   │   ├── kafkaClient.js           # KafkaJS producer configuration
│   │   ├── redisClient.js           # Redis client instance
│   │   └── responsebody.js          # Standardized JSON response envelope
│   ├── seed_real.js                 # Seeding script with real movies, theatres, and personas
│   └── index.js                     # Express 5 server bootstrap
│
├── NotificationService/             # Asynchronous Email Worker Service (Port 3001)
│   ├── services/                    # Nodemailer transport configuration
│   ├── utils/                       # KafkaJS consumer & retry producer
│   ├── worker/
│   │   └── worker.js                # Kafka consumer loop, exponential backoff, DLQ router
│   └── server.js                    # Worker health endpoint & startup
│
├── AIService/                       # Agentic AI Microservice (Port 3002)
│   ├── controllers/                 # Conversational chat handler
│   ├── prompts/                     # System prompts & behavioral constraints
│   ├── routes/                      # AI chat endpoints
│   ├── services/                    # Groq SDK completion engine
│   ├── tools/                       # Tool schemas exposed to LLM function calling
│   └── server.js                    # Express bootstrap
│
└── README.md                        # Master documentation
```

---

## 🛠️ Tech Stack & Dependencies

| Component | Technologies |
| :--- | :--- |
| **Runtimes & Frameworks** | Node.js (v18+), Express.js (v5.2) |
| **Databases** | MongoDB (Local / Atlas), Mongoose v9 |
| **Caching & Locking** | Redis (Distributed `SET NX`, query caching) |
| **Message Broker** | Apache Kafka, KafkaJS v2 |
| **Embeddings & Search** | Hugging Face Transformers (`Xenova/all-MiniLM-L6-v2`) |
| **Agentic AI** | Groq SDK (`llama-3.3-70b-versatile`) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| **Email Engine** | Nodemailer (Gmail SMTP / Custom SMTP) |

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed and running locally:
- **Node.js**: v18.x or later
- **MongoDB**: Running at `mongodb://127.0.0.1:27017`
- **Redis**: Running at `redis://127.0.0.1:6379`
- **Apache Kafka & Zookeeper**: Running at `localhost:9092`

> **Quick Kafka & Redis via Docker (Optional):**
> ```bash
> # Run Redis
> docker run -d --name redis -p 6379:6379 redis:alpine
>
> # Run Kafka with Zookeeper
> docker run -d --name zookeeper -p 2181:2181 wurstmeister/zookeeper
> docker run -d --name kafka -p 9092:9092 --link zookeeper:zookeeper \
>   -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
>   -e KAFKA_ADVERTISED_HOST_NAME=localhost \
>   -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
>   wurstmeister/kafka
> ```

---

### 2. Environment Variables Setup

#### `Movie_Booking/.env`
```env
PORT=3000
NODE_ENV=development
DB_NAME=mba_db
DB_URI=mongodb://127.0.0.1:27017/mba_db
AUTH_KEY=secret_jwt_passphrase_key
NOTIFICATION_SERVICE=http://localhost:3001
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKER=localhost:9092
```

#### `NotificationService/.env`
```env
PORT=3001
NODE_ENV=development
DB_NAME=mba_db
DB_URI=mongodb://127.0.0.1:27017/mba_db
AUTH_KEY=secret_jwt_passphrase_key
REDIS_URL=redis://127.0.0.1:6379
KAFKA_BROKER=localhost:9092
EMAIL=your-email@gmail.com
EMAIL_PASS=your-16-char-gmail-app-password
```

#### `AIService/.env`
```env
PORT=3002
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

### 3. Installation & Database Seeding

Install dependencies for all microservices:
```bash
# Core Booking API
cd Movie_Booking && npm install

# Notification Worker
cd ../NotificationService && npm install

# AI Service
cd ../AIService && npm install
```

Seed initial movies (*Inception, Interstellar, The Dark Knight, Oppenheimer*), theatres, shows, and pre-configured accounts:
```bash
cd Movie_Booking
node seed_real.js
```

---

### 4. Running the Microservices

Open three terminal windows to run each service concurrently:

```bash
# Terminal 1: Core Movie Booking Service (:3000)
cd Movie_Booking
npm run dev

# Terminal 2: Notification Kafka Consumer Worker (:3001)
cd NotificationService
npm run dev

# Terminal 3: AI Assistant Service (:3002)
cd AIService
node server.js
```

---

## 📡 Key API Endpoints

### Authentication & Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/mba/api/v1/auth/signup` | Register new user account | Public |
| `POST` | `/mba/api/v1/auth/signin` | Sign in & receive JWT token | Public |
| `PATCH`| `/mba/api/v1/users/:id` | Update user status / role | Admin |

### Movies & Vector Search
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET`  | `/mba/api/v1/movies` | Fetch all movies (Redis cached) | Public |
| `GET`  | `/mba/api/v1/movies/:id` | Get movie details by ID | Public |
| `POST` | `/mba/api/v1/movies` | Create a movie with auto-generated embeddings | Admin |
| `POST` | `/mba/api/v1/movies/semantic-search` | Natural language semantic vector search | Public |

### Theatres & Shows
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET`  | `/mba/api/v1/theatres` | List all theatres (Redis cached) | Public |
| `POST` | `/mba/api/v1/theatres` | Create new cinema theatre | Admin / Client |
| `GET`  | `/mba/api/v1/shows` | Get showtimes filtered by `movieId` or `theatreId` | Public |
| `POST` | `/mba/api/v1/shows` | Schedule a show with format & pricing | Client / Admin |

### Bookings & Payments (Transactional Pipeline)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/mba/api/v1/bookings` | **Hold Seats**: Validates availability, sets Redis TTL locks, creates pending booking | Customer |
| `GET`  | `/mba/api/v1/bookings` | Fetch authenticated user's bookings | Customer |
| `POST` | `/mba/api/v1/payments` | **Commit Booking**: Validates payment, updates show `occupiedSeats`, publishes Kafka event | Customer |

### AI Conversational Assistant
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/chat` | Send conversational prompt; LLM executes backend booking tools autonomously | Public / Customer |

---

## 🧪 Testing the Transaction Pipeline

1. **Sign In**:
   ```bash
   curl -X POST http://localhost:3000/mba/api/v1/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"sarthaksuryawanshi8788@gmail.com","password":"mba@123"}'
   ```
   Save the returned `data.token`.

2. **Hold Seats (Redis Lock)**:
   ```bash
   curl -X POST http://localhost:3000/mba/api/v1/bookings \
     -H "Content-Type: application/json" \
     -H "x-access-token: <YOUR_TOKEN>" \
     -d '{
       "movieId": "<MOVIE_ID>",
       "theatreId": "<THEATRE_ID>",
       "timing": "18:00",
       "seats": ["A1", "A2"]
     }'
   ```
   Redis will lock `hold:seats:<THEATRE_ID>:18:00:A1` and `A2` for 600 seconds.

3. **Complete Payment & Dispatch Kafka Event**:
   ```bash
   curl -X POST http://localhost:3000/mba/api/v1/payments \
     -H "Content-Type: application/json" \
     -H "x-access-token: <YOUR_TOKEN>" \
     -d '{
       "bookingId": "<BOOKING_ID_FROM_STEP_2>",
       "amount": 500
     }'
   ```
4. **Inspect Output**:
   - `Movie_Booking` confirms the payment and emits a Kafka event to topic `notification-events`.
   - `NotificationService` picks up the event, generates the responsive HTML cinema ticket, and dispatches it via Gmail SMTP to the user's inbox.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
