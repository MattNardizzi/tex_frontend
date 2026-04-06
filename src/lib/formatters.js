export function clampScore(value, min = 0, max = 1) {
  if (Number.isNaN(Number(value))) return min;
  return Math.min(max, Math.max(min, Number(value)));
}

export function formatScore(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return clampScore(value).toFixed(digits);
}

export function formatPercent(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${(clampScore(value) * 100).toFixed(digits)}%`;
}

export function titleCaseFromSnake(value) {
  if (!value || typeof value !== "string") return "—";

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function uppercaseLabel(value) {
  if (!value || typeof value !== "string") return "—";
  return value.replaceAll("_", " ").toUpperCase();
}

export function truncateMiddle(value, start = 10, end = 8) {
  if (!value || typeof value !== "string") return "—";
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

export function formatConfidenceBand(value) {
  const score = clampScore(value);

  if (score >= 0.8) return "High";
  if (score >= 0.62) return "Moderate";
  if (score >= 0.45) return "Low";
  return "Fragile";
}

export function formatSeverityLabel(value) {
  if (!value || typeof value !== "string") return "INFO";
  return value.toUpperCase();
}

export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}