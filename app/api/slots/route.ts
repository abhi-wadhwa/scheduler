import { NextResponse } from "next/server";
import { getAllSlotsWithBookings } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const slots = await getAllSlotsWithBookings();
    return NextResponse.json({ slots, fetchedAt: Date.now() });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}
