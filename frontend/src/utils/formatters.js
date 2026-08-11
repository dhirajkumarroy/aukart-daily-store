/**
 * Formats a raw discount string or number into standard badge format (e.g. "54% off")
 * Handles: "54" -> "54% off", "5" -> "5% off", "50%" -> "50% off", "50% off" -> "50% off"
 */
export function formatDiscount(discount) {
  if (!discount) return '';
  const str = String(discount).trim();
  if (!str) return '';

  // If pure digits like "54" or "5"
  if (/^\d+$/.test(str)) {
    return `${str}% off`;
  }
  // If digits with percent like "54%"
  if (/^\d+\s*%$/i.test(str)) {
    return `${str.replace(/\s*%/g, '')}% off`;
  }
  return str;
}
