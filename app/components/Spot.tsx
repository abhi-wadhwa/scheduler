"use client";

function formatName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

interface SpotProps {
  available: boolean;
  name?: string;
  isBooking: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function Spot({
  available,
  name,
  isBooking,
  disabled,
  onClick,
}: SpotProps) {
  if (isBooking) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-violet-400 bg-violet-50 px-4 py-3 animate-pulse">
        <svg
          className="h-5 w-5 animate-spin text-violet-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="ml-2 text-sm text-violet-600">Booking...</span>
      </div>
    );
  }

  if (!available && name) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 opacity-70 cursor-not-allowed">
        <span className="text-sm text-gray-500">{formatName(name)}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Book
    </button>
  );
}
