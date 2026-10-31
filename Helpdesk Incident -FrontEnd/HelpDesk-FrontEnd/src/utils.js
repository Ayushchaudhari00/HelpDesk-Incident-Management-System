export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const deltaMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const isPast = deltaMinutes < 0;
  const relative = (duration) => isPast ? `${duration} ago` : `in ${duration}`;
  const duration = Math.abs(deltaMinutes);
  if (duration < 60) return relative(`${duration}m`);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  if (hours < 24) return relative(`${hours}h${minutes ? ` ${minutes}m` : ""}`);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return relative(`${days}d${remainingHours ? ` ${remainingHours}h` : ""}`);
}

export function initials(value) {
  const words = (value || "U").trim().split(/[\s._@-]+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "U";
}
