# Instructions for Running Popcorn Palace Backend

## 1. Prerequisites

Before running the project, ensure the following are installed:

- Node.js (v18 or above recommended)
- npm
- PostgreSQL (a local instance)
- Git (optional, for cloning the repo)

---

## 2. Database Setup

1. Open pgAdmin or your preferred PostgreSQL client.  
2. Create a new database:

```
Database Name: popcorn_palace_dor
Username: popcorn_palace_dor
Password: popcorn_palace_dor
```

3. Ensure your database is running locally on port `5432`.

> 🔐 The database connection is preconfigured in `src/app.module.ts`.

---

## 3. Install Project Dependencies

Navigate to the root of the project and run:

```bash
npm install
```

---

## 4. Run the Project

Start the development server:

```bash
npm run start:dev
```

The server will run at: [http://localhost:3000]

---

## 5. Run Tests

To run unit tests:

```bash
npm run test
```

You’ll see detailed output showing successful coverage of services and controllers.

Test coverage includes:

- 🎬 MovieService and MovieController
- 🎟️ ShowTimeService and ShowTimeController
- 🧾 BookingService and BookingController

---

## 6. API Testing

You can test the API using Postman. The following routes are available:

### 🎬 Movie Routes

- `POST /movies`
- `GET /movies/all`
- `POST /movies/update/:title`
- `DELETE /movies/:title`

### 🎟️ ShowTime Routes

- `POST /showtimes/`
- `GET /showtimes/:id`
- `POST /showtimes/update/:id`
- `DELETE /showtimes/:id`

### 🧾 Booking Routes

- `POST /bookings`

> All endpoints accept and return JSON.

---

## 7. Notes

- The project uses **NestJS** with **TypeScript**.
- Persistence is handled using **PostgreSQL** with **plain SQL** via **TypeORM's DataSource**.
- Input validation and error handling are implemented using `class-validator` and standard NestJS exceptions.
+ Bookings are created by providing:
  - Showtime ID
  - User ID (UUID)
  - Seat Number (1–100)
+ Booking creation ensures:
- The showtime exists and has a valid movie assigned.
- The seat is not already taken.
- The theater is not full.
- No duplicate bookings from the same user for the same seat.

---

## 8. Author

This project is part of the **Movie Ticket Booking System - Popcorn Palace** backend assignment.
