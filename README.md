# Interview Scheduler

A single-use scheduling app where candidates claim available time slots. Built with Next.js, Tailwind CSS, and Vercel Postgres.

## Setup

### 1. Create a Vercel Postgres database

In your Vercel project dashboard, go to **Storage** > **Create Database** > **Postgres**. Copy the connection string.

### 2. Environment variables

Create `.env.local` with:

```
POSTGRES_URL=your_connection_string_here
```

Vercel automatically injects these in production when the database is linked.

### 3. Run migrations and seed data

```bash
npm run seed
```

This creates the `time_slots` and `bookings` tables and inserts the 11 time slots.

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy to Vercel

```bash
vercel
```

Or push to GitHub and connect the repo in Vercel dashboard.

## Testing Race Conditions

1. Open the app in two browser windows side by side
2. Click the same available spot in both windows at the same time
3. One will succeed with "Booking confirmed!" and the other will show "Sorry, this spot was just taken"
4. The unique constraint on `(slot_id, spot_index)` guarantees only one booking per spot at the database level

## Schema

- `time_slots` - 11 predefined interview slots across 2 days
- `bookings` - each booking claims one of 3 spots per time slot, with `UNIQUE(slot_id, spot_index)` preventing double-booking
