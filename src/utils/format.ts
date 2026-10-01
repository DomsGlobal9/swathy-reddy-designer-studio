const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

export function formatINR(value: number) {
  return inr.format(value);
}

export const easeOut = [0.23, 1, 0.32, 1] as const;