// Builds query strings for optional API filters while preserving their order.
export function toQueryString(filters = {}) {
  return new URLSearchParams(
    Object.entries(filters).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null,
    ),
  ).toString();
}
