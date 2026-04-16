export function formatLkr(value) {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return value || "-";
  }

  return `LKR ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
