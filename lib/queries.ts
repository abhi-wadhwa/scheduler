import { sql } from "./db";

export interface SlotWithBookings {
  id: string;
  date: string;
  time_label: string;
  display_order: number;
  location: string | null;
  bookings: { spot_index: number; full_name: string }[];
}

export async function getAllSlotsWithBookings(): Promise<SlotWithBookings[]> {
  const slotsResult = await sql`
    SELECT id, TO_CHAR(date, 'YYYY-MM-DD') as date, time_label, display_order, location
    FROM time_slots
    ORDER BY display_order
  `;

  const bookingsResult = await sql`
    SELECT slot_id, spot_index
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
    location: slot.location ?? null,
    bookings: bookingsBySlot.get(slot.id) || [],
  }));
}

export async function bookSpot(
  slotId: string,
  spotIndex: number,
  fullName: string,
  email: string
): Promise<{ success: boolean; conflict: boolean; date?: string; timeLabel?: string; location?: string }> {
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
      "INSERT INTO bookings (slot_id, spot_index, full_name, email) VALUES ($1, $2, $3, $4)",
      [slotId, spotIndex, fullName, email]
    );

    const slotInfo = await client.query(
      "SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, time_label, location FROM time_slots WHERE id = $1",
      [slotId]
    );

    await client.query("COMMIT");

    const slot = slotInfo.rows[0];
    return {
      success: true,
      conflict: false,
      date: slot?.date,
      timeLabel: slot?.time_label,
      location: slot?.location,
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
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
