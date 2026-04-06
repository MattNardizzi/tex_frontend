// Simple UUID v4 generator (no external libraries)
// Uses crypto API when available for stronger randomness

export function generateUUIDv4() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
  }

  // Fallback (less secure, but works everywhere)
  let d = new Date().getTime();
  let d2 =
    (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0;

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;

    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }

    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}