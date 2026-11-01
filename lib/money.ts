export function toPriceCents(price: number | null): number | null {
  if (price === null || !Number.isFinite(price)) return null;
  return Math.round(price * 100);
}

export function formatMoney(cents: number | null, currency: string): string {
  if (cents === null) return "Цена за потвърждение";
  const amount = (cents / 100).toFixed(2);
  return currency === "EUR" ? `${amount} €` : `${amount} ${currency}`;
}
