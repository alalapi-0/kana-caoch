export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

export function wer(reference: string, hypothesis: string): number {
  const refWords = reference.trim().length ? reference.trim().split(/\s+/) : [];
  const hypWords = hypothesis.trim().length ? hypothesis.trim().split(/\s+/) : [];

  if (refWords.length === 0) {
    return hypWords.length === 0 ? 0 : 1;
  }

  const matrix: number[][] = Array.from({ length: refWords.length + 1 }, () =>
    new Array(hypWords.length + 1).fill(0)
  );

  for (let i = 0; i <= refWords.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= hypWords.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= refWords.length; i++) {
    for (let j = 1; j <= hypWords.length; j++) {
      const cost = refWords[i - 1] === hypWords[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return Math.min(1, matrix[refWords.length][hypWords.length] / refWords.length);
}

export function starsFromWer(value: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (value <= 0.15) return 5;
  if (value <= 0.3) return 4;
  if (value <= 0.45) return 3;
  if (value <= 0.6) return 2;
  if (value <= 0.85) return 1;
  return 0;
}

export function scoreUtterance(reference: string, hypothesis: string): {
  wer: number;
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  score: number;
} {
  const value = wer(reference, hypothesis);
  const stars = starsFromWer(value);
  return {
    wer: value,
    stars,
    score: Math.max(0, 1 - value),
  };
}
