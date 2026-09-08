// lib/format.js
const PERIOD_LABELS = {
  per_session: "/session",
  per_year: "/year",
  per_semester: "/semester",
  per_month: "/month",
};

const PROPERTY_TYPE_LABELS = {
  self_contain: "Self-contain",
  room_and_parlour: "Room & parlour",
  shared_room: "Shared room",
  flat: "Flat",
  hostel: "Hostel",
  duplex: "Duplex",
};

export function formatNaira(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function periodLabel(period) {
  return PERIOD_LABELS[period] || "";
}

export function propertyTypeLabel(type) {
  return PROPERTY_TYPE_LABELS[type] || type;
}

export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  const n = Number(km);
  if (Number.isNaN(n)) return null;
  return `${n.toFixed(1)} km from campus`;
}

export function relativeTime(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const ranges = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secondsInUnit] of ranges) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
