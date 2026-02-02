"use client";

import { useState } from "react";

interface BookingModalProps {
  timeLabel: string;
  spotIndex: number;
  onConfirm: (fullName: string) => void;
  onCancel: () => void;
}

export default function BookingModal({
  timeLabel,
  spotIndex,
  onConfirm,
  onCancel,
}: BookingModalProps) {
  const [name, setName] = useState("");

  const valid = name.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Book Spot {spotIndex + 1}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{timeLabel}</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && valid && onConfirm(name.trim())}
          placeholder="Jane Doe"
          autoFocus
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name.trim())}
            disabled={!valid}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
