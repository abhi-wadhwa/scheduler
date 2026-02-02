"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TimeSlot from "./components/TimeSlot";
import BookingModal from "./components/BookingModal";

interface Booking {
  spot_index: number;
  full_name: string;
}

interface Slot {
  id: string;
  date: string;
  time_label: string;
  display_order: number;
  bookings: Booking[];
}

interface ModalState {
  slotId: string;
  spotIndex: number;
  timeLabel: string;
}

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<number>(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState<{
    slotId: string;
    spotIndex: number;
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const fetchRef = useRef(false);

  const fetchSlots = useCallback(async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    try {
      const res = await fetch("/api/slots");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSlots(data.slots);
      setFetchedAt(data.fetchedAt);
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Poll every 10 seconds
  useEffect(() => {
    const id = setInterval(fetchSlots, 10000);
    return () => clearInterval(id);
  }, [fetchSlots]);

  // Update "seconds ago" counter
  useEffect(() => {
    const id = setInterval(() => {
      if (fetchedAt) setSecondsAgo(Math.floor((Date.now() - fetchedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleSpotClick = async (slotId: string, spotIndex: number) => {
    // Stale data check - refresh if data is >30s old
    if (Date.now() - fetchedAt > 30000) {
      await fetchSlots();
      // Check if spot is still available after refresh
      const slot = slots.find((s) => s.id === slotId);
      if (slot?.bookings.some((b) => b.spot_index === spotIndex)) {
        setToast({
          message: "This spot was just taken. Please try another.",
          type: "error",
        });
        return;
      }
    }

    const slot = slots.find((s) => s.id === slotId);
    setModal({
      slotId,
      spotIndex,
      timeLabel: `${slot?.date ? new Date(slot.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : ""} - ${slot?.time_label}`,
    });
  };

  const handleConfirm = async (fullName: string) => {
    if (!modal) return;

    const { slotId, spotIndex } = modal;
    setModal(null);
    setBookingInProgress({ slotId, spotIndex });

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, spotIndex, fullName }),
      });

      if (res.status === 409) {
        setToast({
          message: "Sorry, this spot was just taken. Please try another.",
          type: "error",
        });
      } else if (!res.ok) {
        setToast({ message: "Something went wrong. Please try again.", type: "error" });
      } else {
        setToast({ message: "Booking confirmed!", type: "success" });
      }
    } catch {
      setToast({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setBookingInProgress(null);
      await fetchSlots();
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      const key = slot.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(slot);
      return acc;
    },
    {} as Record<string, Slot[]>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Interview Scheduler
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select an available spot to book your interview time.
        </p>
      </div>

      {/* Last updated bar */}
      {!loading && (
        <div className="flex items-center gap-2 mb-6 text-xs text-gray-400">
          <span>Updated {secondsAgo}s ago</span>
          <button
            onClick={fetchSlots}
            className="underline hover:text-gray-600"
          >
            Refresh
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        Object.entries(slotsByDate).map(([date, daySlots]) => (
          <div key={date} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 px-4">
              {daySlots.map((slot) => (
                <TimeSlot
                  key={slot.id}
                  slotId={slot.id}
                  timeLabel={slot.time_label}
                  bookings={slot.bookings}
                  bookingInProgress={bookingInProgress}
                  disabled={!!bookingInProgress}
                  onBook={handleSpotClick}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modal && (
        <BookingModal
          timeLabel={modal.timeLabel}
          spotIndex={modal.spotIndex}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg text-sm text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
