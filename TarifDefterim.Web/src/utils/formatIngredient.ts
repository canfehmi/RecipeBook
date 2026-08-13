export function formatIngredientDisplay(
  name: string,
  amount: number | null | undefined,
  unit: string,
): string {
  const trimmedUnit = unit.trim();
  const hasAmount = amount != null && Number.isFinite(amount) && amount > 0;
  const parts = [hasAmount ? String(amount) : null, trimmedUnit || null, name].filter(
    Boolean,
  ) as string[];
  return parts.join(' ');
}

export function formatIngredientLabel(
  name: string,
  amount: number | null | undefined,
  unit: string,
): string {
  const trimmedUnit = unit.trim();
  const hasAmount = amount != null && Number.isFinite(amount) && amount > 0;
  const hasUnit = trimmedUnit.length > 0;

  if (!hasAmount && !hasUnit) {
    return name;
  }

  const amountPart = hasAmount ? String(amount) : '';
  const detail = [amountPart, trimmedUnit].filter(Boolean).join(' ');
  return `${name} — ${detail}`;
}

export function parseDraftAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeIngredientAmount(amount: number | null | undefined): number | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}
