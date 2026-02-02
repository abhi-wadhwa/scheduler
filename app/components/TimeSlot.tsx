"use client";

import Spot from "./Spot";

interface Booking {
  spot_index: number;
}

interface TimeSlotProps {
  slotId: string;
  timeLabel: string;
  bookings: Booking[];
  bookingInProgress: { slotId: string; spotIndex: number } | null;
  disabled: boolean;
  onBook: (slotId: string, spotIndex: number) => void;
}

export default function TimeSlot({
  slotId,
  timeLabel,
  bookings,
  bookingInProgress,
  disabled,
  onBook,
}: TimeSlotProps) {
  const bookedSet = new Set(bookings.map((b) => b.spot_index));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-24 shrink-0 font-medium text-gray-700 text-sm">
        {timeLabel}
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1 w-full">
        {[0, 1, 2].map((spotIndex) => {
          const isThisBooking =
            bookingInProgress?.slotId === slotId &&
            bookingInProgress?.spotIndex === spotIndex;
          const taken = bookedSet.has(spotIndex);
          return (
            <Spot
              key={spotIndex}
              available={!taken}
              isBooking={isThisBooking}
              disabled={disabled || taken}
              onClick={() => onBook(slotId, spotIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
