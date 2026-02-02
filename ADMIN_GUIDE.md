# Admin Guide: Managing Bookings

## How to access the database

1. Go to https://vercel.com and sign in
2. Click on the **scheduler** project
3. Click **Storage** in the top navigation
4. Click on your Postgres database
5. Click the **Query** tab — this is where you'll paste and run commands

---

## View all bookings

Paste this and click **Run**:

```sql
SELECT t.date, t.time_label, b.spot_index, b.full_name, b.created_at
FROM bookings b
JOIN time_slots t ON t.id = b.slot_id
ORDER BY t.display_order, b.spot_index;
```

This shows every booking: the date, time, which spot (0, 1, or 2), the person's name, and when they booked.

---

## Remove a specific booking

If you need to remove one person's booking, paste this and replace `Jane Doe` with their name:

```sql
DELETE FROM bookings WHERE full_name = 'Jane Doe';
```

If two people have the same name and you need to be more specific, you can target by time slot and spot number:

```sql
DELETE FROM bookings WHERE slot_id = 'day1-1600' AND spot_index = 0;
```

The slot IDs are:

| Slot ID      | Day         | Time     |
|-------------|-------------|----------|
| day1-1600   | Tue, Feb 3  | 4:00 PM  |
| day1-1640   | Tue, Feb 3  | 4:40 PM  |
| day1-1720   | Tue, Feb 3  | 5:20 PM  |
| day1-1800   | Tue, Feb 3  | 6:00 PM  |
| day1-1840   | Tue, Feb 3  | 6:40 PM  |
| day1-1920   | Tue, Feb 3  | 7:20 PM  |
| day2-1600   | Wed, Feb 4  | 4:00 PM  |
| day2-1640   | Wed, Feb 4  | 4:40 PM  |
| day2-1720   | Wed, Feb 4  | 5:20 PM  |
| day2-1800   | Wed, Feb 4  | 6:00 PM  |
| day2-1840   | Wed, Feb 4  | 6:40 PM  |

Spot numbers are **0**, **1**, or **2** (the three boxes shown left to right).

---

## Change someone's name on a booking

If someone's name was entered wrong:

```sql
UPDATE bookings SET full_name = 'Correct Name' WHERE full_name = 'Wrong Name';
```

---

## Clear all bookings (reset everything)

This removes every booking and reopens all spots:

```sql
DELETE FROM bookings;
```

---

## After making changes

The website updates automatically — just refresh the page. No restart or redeployment needed.
