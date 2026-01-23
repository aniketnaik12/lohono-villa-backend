# Lohono – Backend (Villa Availability & Pricing)

This repository contains the backend service for the Lohono villa availability and pricing assignment.
The backend exposes APIs to fetch available villas for a date range and to generate detailed price quotes.

The focus of this implementation is **correctness, clarity, and clean structure**, rather than exhaustive feature coverage.

---

## 🛠 Tech Stack

* Node.js
* TypeScript
* Express
* PostgreSQL (Docker)
* TypeORM

---

## 📌 Features

* Villa availability check for a given date range
* Per-night pricing aggregation
* Detailed quote generation with tax calculation
* PostgreSQL-backed per-day availability model
* Seed script for generating realistic sample data

---

## 🗄 Database Design

The database uses a **per-day availability model**, where each villa has calendar entries per date with:

* Availability status
* Nightly price

This approach guarantees correctness for date-range queries and pricing.

Additional attributes such as rating, review count, and tags are stored directly on the villa entity to support UI requirements without unnecessary complexity.

---

## 🚀 Setup Instructions

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start PostgreSQL (Docker)

```bash
docker compose up -d
```

### 3️⃣ Configure environment variables

Create a `.env` file:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=lohono
```

### 4️⃣ Seed the database

```bash
npm run seed
```

This generates:

* 50 villas
* A full-year availability calendar
* Randomized pricing, ratings, and tags

> The seed year defaults to **2025** as referenced in the assignment.

### 5️⃣ Run the server

```bash
npm run dev
```

The server runs at:

```
http://localhost:3000
```

---

## 📡 API Endpoints

### 🔹 Get Available Villas

```
GET /v1/villas/availability
```

**Query Params**

* `check_in` (YYYY-MM-DD)
* `check_out` (YYYY-MM-DD)

**Description**
Returns villas that are available for **all nights** in the requested date range, along with average per-night pricing and metadata.

---

### 🔹 Get Villa Quote

```
GET /v1/villas/:villa_id/quote
```

**Query Params**

* `check_in` (YYYY-MM-DD)
* `check_out` (YYYY-MM-DD)

**Description**
Returns a detailed quote including:

* Availability status
* Per-night price breakdown
* Subtotal
* GST (18%)
* Total amount

---

## 🧠 Notes & Assumptions

* Dates are treated as `YYYY-MM-DD` strings throughout to avoid timezone issues.
* Missing calendar entries are treated as unavailable.
* Booking and reservation flows are intentionally out of scope.

---

## 🤖 AI Usage

Details about AI-assisted development, including prompts used and decisions made, are documented in `AI_USAGE.md`.

---

## ✅ Status

The backend is complete and ready for integration with the Flutter frontend.
