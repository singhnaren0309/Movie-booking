# 🎬 Movie Booking Application (MBA) — Microservices Architecture

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.2-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-brightgreen.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20Queue-Redis-dc382d.svg?style=flat-square&logo=redis)](https://redis.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%26%20Bcrypt-orange.svg?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue.svg?style=flat-square)](https://microservices.io/)

A distributed, production-grade **Movie Booking Application (MBA)** engineered with a **Microservices Architecture**. The platform decouples core transactional workflows (movies, theatres, shows, dynamic seat reservation, payments, and user management) from asynchronous background processing (message-queue-based email notifications). Built for high concurrency and performance using **Node.js, MongoDB, and Redis**.

---

## 📌 Repository Summary

> **Short Description (GitHub About Box):**
> *A distributed movie ticket booking system built with Node.js, Express, MongoDB, and a decoupled asynchronous email notification microservice powered by Redis Message Queues and Nodemailer.*

---

## 📐 System Architecture

The application is structured into two autonomous, loosely coupled microservices communicating via RESTful HTTP protocols and a Redis Message Queue, with independent database persistence layers:

```mermaid
flowchart TD
    subgraph Client["Client Tier"]
        UI["Web Browser (REST Client)"]
    end

    subgraph CoreService["Movie Booking Core Service (Port: 3000)"]
        MVC["Express 5 MVC Engine"]
        Auth["Auth & RBAC (Customer / Client / Admin)"]
        Catalog["Movies, Theatres & Shows Engine"]
        BookingEngine["Seat Reservation & Booking Service"]
        PaymentEngine["Payment Processing Service"]
        EmailClient["Internal Notification Dispatcher"]

        MVC --> Auth
        MVC --> Catalog
        MVC --> BookingEngine
        MVC --> PaymentEngine
        PaymentEngine --> EmailClient
    end

    subgraph NotifService["Notification Background Worker"]
        RedisWorker["Redis Queue Worker (brPop)"]
        Mailer["SMTP Dispatcher (Nodemailer)"]

        RedisWorker -->|Pop Email Jobs| Mailer
    end

    subgraph CacheAndQueue["Redis Tier"]
        RedisCache[("Redis (Caching & Locks)")]
        RedisQueue[("Redis (email_queue List)")]
    end

    subgraph Database["Data Tier"]
        MongoDB[("MongoDB Database / MongoDB Atlas")]
    end

    subgraph External["External Services"]
        SMTP["SMTP Mail Provider (e.g. Gmail)"]
        EndUser["Recipient Email Inbox"]
    end

    UI -->|HTTP / Web Traffic| CoreService
    CoreService <--> MongoDB
    
    %% Redis Integrations
    Catalog <-->|Cache Read/Write| RedisCache
    BookingEngine <-->|Distributed Locks (NX/EX)| RedisCache
    EmailClient -->|LPUSH to email_queue| RedisQueue
    RedisQueue -->|BRPOP from email_queue| RedisWorker

    Mailer --> SMTP
    SMTP --> EndUser
```

---

## 🚀 Key Features

### 1. Movie Booking Service (`Movie_Booking`)
* **Role-Based Access Control (RBAC):** Granular permissions for `CUSTOMER`, `CLIENT` (theatre owners), and `ADMIN` roles using signed JWT tokens and password hashing via `bcrypt`.
* **Redis Caching:** Read-heavy endpoints (like fetching movies) are aggressively cached using Redis, slashing database load and accelerating response times.
* **Distributed Locking:** Employs Redis `SET NX EX` locks for dynamic seat mapping and validation, mathematically preventing race conditions and double-booking during concurrent checkouts.
* **Theatre & Show Management:** Comprehensive catalog management for movie listings, multiplexes/theatres, screens, showtimes, and ticket pricing.
* **Payment Lifecycle:** Integrated payment verification that transitions booking statuses (`IN_PROGRESS` ➔ `SUCCESSFUL` / `CANCELLED`) and triggers downstream confirmation events.

### 2. Notification Service (`NotificationService`)
* **Redis Message Queue:** Utlizes Redis Lists (`LPUSH` / `BRPOP`) to asynchronously decouple email notification dispatching from the critical path of ticket purchasing, enabling instant reactions.
* **Resilient Worker Process:** Lightweight background worker constantly blocking on the Redis queue to dispatch emails via `nodemailer` as soon as they are produced.
* **Optimized & Stateless:** Pure background worker without any heavy database dependencies for maximum throughput.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Runtime** | Node.js (CommonJS, v18+) |
| **Web Framework** | Express.js (v5.2+) |
| **Database & ODM** | MongoDB, Mongoose (v9.x) |
| **Caching & Queues**| Redis (v6.x Client) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| **Frontend / UI** | Vanilla CSS, Client-side scripts |
| **Message Broker** | Redis (`lPush`, `brPop`) |
| **Email Service** | `nodemailer` (SMTP) |
| **Dev Tools** | `nodemon`, `dotenv` |

---

## 📂 Project Directory Structure

```text
mba_microservices/
├── Movie_Booking/                 # Primary Business Logic & Booking Microservice
│   ├── controllers/               # HTTP Request Handlers (Auth, Booking, Movie, Show, etc.)
│   ├── middlewares/               # Auth, Cache validation, & Role verification
│   ├── models/                    # Mongoose Schemas (User, Movie, Theatre, Show, Booking, Payment)
│   ├── routes/                    # API & View Route definitions
│   ├── services/                  # Business logic layer (Distributed locks, Redis integrations)
│   ├── utils/                     # Redis Client config, Error handlers, constants
│   ├── index.js                   # Application entry point (Port: 3000)
│   └── package.json
│
├── NotificationService/           # Asynchronous Notification Background Worker
│   ├── crons/                     # Background Redis Queue worker
│   ├── services/                  # Email dispatching via Nodemailer
│   ├── utils/                     # Redis Client config
│   ├── server.js                  # Application entry point (Port: 3001)
│   └── package.json
│
└── README.md                      # Monorepo Documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI
* [Redis](https://redis.io/download) installed and running locally on port `6379`.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/mba_microservices.git
cd mba_microservices
```

---

### Step 2: Configure Environment Variables

#### 1. Movie Booking Service (`Movie_Booking/.env`)
Create `Movie_Booking/.env`:
```env
PORT=3000
NODE_ENV=development
DB_NAME=mba_db
DB_URI=mongodb://127.0.0.1:27017/mba_db
AUTH_KEY=your_super_secret_jwt_key
NOTIFICATION_SERVICE=http://localhost:3001
REDIS_URL=redis://127.0.0.1:6379
```

#### 2. Notification Service (`NotificationService/.env`)
Create `NotificationService/.env`:
```env
PORT=3001
NODE_ENV=development
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
REDIS_URL=redis://127.0.0.1:6379
```

---

### Step 3: Install Dependencies & Run

Open two terminal windows:

#### Terminal 1 — Notification Service
```bash
cd NotificationService
npm install
npm run dev
# Running on http://localhost:3001
```

#### Terminal 2 — Movie Booking Service
```bash
cd Movie_Booking
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 📡 API Reference Overview

### 🎟️ Movie Booking Service (`http://localhost:3000`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/mba/api/v1/auth/signup` | Register a new user | Public |
| `POST` | `/mba/api/v1/auth/signin` | Authenticate user & receive JWT | Public |
| `GET` | `/mba/api/v1/movies` | Fetch all movies (Redis Cached) | Public |
| `POST` | `/mba/api/v1/movies` | Create a movie record (Invalidates Cache) | `ADMIN` |
| `POST` | `/mba/api/v1/theatres` | Register a new theatre | `ADMIN`, `CLIENT` |
| `POST` | `/mba/api/v1/shows` | Add shows to a theatre screen | `ADMIN`, `CLIENT` |
| `POST` | `/mba/api/v1/bookings` | Initiate a movie ticket booking (Redis Locked) | `CUSTOMER` |
| `PATCH`| `/mba/api/v1/bookings/:id` | Modify booking status | `CUSTOMER`, `ADMIN` |
| `POST` | `/mba/api/v1/payments` | Process payment & enqueue notification | `CUSTOMER` |

### 🔔 Notification Service
_This service is now a pure background worker and no longer exposes HTTP endpoints._

---

## 🔒 Security Best Practices
* **Password Hashing:** Passwords securely hashed with salt rounds using `bcrypt`.
* **State Verification:** Strict validation middlewares ensuring authenticated users can only access authorized resources.
* **Environment Isolation:** Credentials, database connection strings, and secret keys managed strictly through `.env` files.
* **Race Condition Prevention:** Redis `NX` locks prevent duplicate booking anomalies on concurrent checkouts.

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the **ISC License**.
