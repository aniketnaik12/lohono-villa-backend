# AI_USAGE.md

This document outlines how AI-assisted tools were used during the development of this assignment, including the prompts used, what was accepted or rejected, and what was modified with reasoning.

---

## 1️⃣ Backend – Architecture & Setup

### Prompt Used
Design a backend service using Node.js and PostgreSQL to manage villa availability and pricing, with clean APIs and a simple schema.


### Accepted
- High-level service separation (controllers, services, entities)
- Basic REST API structure
- Use of TypeORM with PostgreSQL

### Rejected
- Overly complex schemas (e.g., reviews, bookings, promotions)

### Modified
- Simplified the data model to focus only on availability and pricing
- Chose PostgreSQL array fields for tags instead of relational tables to reduce scope

---

## 2️⃣ Database Schema & Seeding

### Prompt Used
Generate a seed script that creates multiple villas with per-day availability and pricing.


### Accepted
- Loop-based generation of villas
- Per-day availability model
- Randomized pricing and availability

### Rejected
- Hardcoded static data
- Partial date ranges

### Modified
- Ensured full-year coverage (2025) as specified in the assignment
- Made the seed year configurable via an environment variable
- Added ratings, review counts, and tags as simple attributes to support the UI

---

## 3️⃣ Availability API

### Prompt Used
Create an API that returns villas available for a given date range with aggregated pricing.


### Accepted
- SQL-based aggregation for pricing
- Validation of date ranges
- Server-side availability checks

### Rejected
- Client-side availability calculation
- Over-fetching unrelated villa data

### Modified
- Ensured villas are returned only if available for all nights in the requested range
- Added support for pagination and sorting
- Included rating, review count, and tags in the response for UI consumption

---

## 4️⃣ Quote API

### Prompt Used
Design an endpoint that returns a detailed price quote for a villa, including nightly breakdown and taxes.


### Accepted
- Per-night pricing breakdown
- GST calculation on the backend
- Clear availability determination

### Rejected
- Implicit availability assumptions
- Relying on frontend calculations for totals

### Modified
- Treated missing calendar rows as unavailable
- Returned dates as strings to avoid timezone-related issues between PostgreSQL and JavaScript
- Explicitly exposed villa metadata (rating, tags) required by the detail screen

---

## 5️⃣ Frontend – Flutter UI

### Prompt Used
Design a mobile-first Flutter UI to list villas, show pricing, and fetch quote details from backend APIs.


### Accepted
- Component-based UI structure
- Clear separation of screens and widgets
- API-driven data flow

### Rejected
- Complex state management libraries
- Fully implemented filter logic and backend coupling

### Modified
- Implemented filter and sort as UI-only bottom sheets to demonstrate UX patterns
- Used default images instead of media handling
- Focused on layout, hierarchy, and interaction rather than feature completeness

---

## 6️⃣ Filters & Sort

### Prompt Used
Implement filters and sorting for a villa listing screen.


### Accepted
- Bottom sheet interaction patterns for filters and sorting
- Query-driven filtering and sorting via backend APIs

### Rejected
- Client-side-only filtering
- Hardcoded or mock filter behavior

### Modified
- Implemented functional filtering for:
   - Location (via search query)
   - Tags (via PostgreSQL array overlap)
   - Price range (per-night filtering)
- Sorting handled via backend-safe SQL columns
- Ensured frontend and backend remain fully synchronized
