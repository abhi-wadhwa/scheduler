import { sql } from "./db";

export interface SlotWithBookings {
  id: string;
  date: string;
  time_label: string;
  display_order: number;
  bookings: { spot_index: number; full_name: string }[];
}

export async function getAllSlotsWithBookings(): Promise<SlotWithBookings[]> {
  const slotsResult = await sql`
    SELECT id, date, time_label, display_order
    FROM time_slots
    ORDER BY display_order
  `;

  const bookingsResult = await sql`
    SELECT slot_id, spot_index, full_name
    FROM bookings
    ORDER BY spot_index
  `;

  const bookingsBySlot = new Map<
    string,
    { spot_index: number; full_name: string }[]
  >();
  for (const row of bookingsResult.rows) {
    const list = bookingsBySlot.get(row.slot_id) || [];
    list.push({ spot_index: row.spot_index, full_name: row.full_name });
    bookingsBySlot.set(row.slot_id, list);
  }

  return slotsResult.rows.map((slot) => ({
    id: slot.id,
    date: slot.date,
    time_label: slot.time_label,
    display_order: slot.display_order,
    bookings: bookingsBySlot.get(slot.id) || [],
  }));
}

export async function bookSpot(
  slotId: string,
  spotIndex: number,
  fullName: string
): Promise<{ success: boolean; conflict: boolean }> {
  const client = await sql.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM bookings WHERE slot_id = $1 AND spot_index = $2 FOR UPDATE",
      [slotId, spotIndex]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      await client.query("ROLLBACK");
      return { success: false, conflict: true };
    }

    await client.query(
      "INSERT INTO bookings (slot_id, spot_index, full_name) VALUES ($1, $2, $3)",
      [slotId, spotIndex, fullName]
    );

    await client.query("COMMIT");
    return { success: true, conflict: false };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    // Unique constraint violation (PostgreSQL error code 23505)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return { success: false, conflict: true };
    }
    throw error;
  } finally {
    client.release();
  }
}
