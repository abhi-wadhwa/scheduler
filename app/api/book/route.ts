import { NextResponse } from "next/server";
import { bookSpot } from "@/lib/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, spotIndex, fullName, email } = body;

    if (
      !slotId ||
      spotIndex === undefined ||
      !fullName ||
      typeof fullName !== "string" ||
      fullName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: "Invalid request. Provide slotId, spotIndex, and fullName (min 2 chars)." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (spotIndex < 0 || spotIndex > 2) {
      return NextResponse.json(
        { error: "spotIndex must be 0, 1, or 2" },
        { status: 400 }
      );
    }

    const result = await bookSpot(slotId, spotIndex, fullName.trim(), email.trim());

    if (result.conflict) {
      return NextResponse.json(
        { error: "This spot was just taken. Please try another spot.", retry: true },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        fullName: fullName.trim(),
        email: email.trim(),
        date: result.date,
        timeLabel: result.timeLabel,
        location: result.location,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
