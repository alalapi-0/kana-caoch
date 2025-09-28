export function starsFromAccuracy(score: number): number {
  if (score >= 0.85) return 5;
  if (score >= 0.7) return 4;
  if (score >= 0.5) return 3;
  if (score >= 0.3) return 2;
  if (score > 0) return 1;
  return 0;
}

export function normalizeInput(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}
