/**
 * Formats a raw price string or number into clean Indian Rupee notation (e.g. "₹4,799" or "₹189")
 * Cleans any CSV encoding corruptions (like â¹), missing symbols, or raw numbers
 */
export function formatPrice(priceStr) {
  if (!priceStr && priceStr !== 0) return '';
  const str = String(priceStr).trim();
  if (!str) return '';

  // Extract pure numerical values
  const numericPart = str.replace(/[^\d.]/g, '');
  if (!numericPart) return str;

  const num = parseFloat(numericPart);
  if (isNaN(num)) return str;

  // Format with standard Indian Rupee notation
  return `₹${num.toLocaleString('en-IN')}`;
}

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
