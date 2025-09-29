/**
 * @file 小程序端的评分工具，与服务端保持一致的算法与阈值。
 */

/**
 * 归一化用户输入：转小写并移除空白，便于比较。
 * @param value 原始输入。
 * @returns string 归一化后的字符串。
 */
export function normalizeInput(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

/**
 * 计算 Levenshtein 编辑距离，算法同服务端实现。
 * @param a 字符串 A。
 * @param b 字符串 B。
 * @returns number 编辑距离。
 */
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

/**
 * 将 WER 映射为星级，阈值与服务端保持一致。
 * @param value 词错误率或等价的距离比值。
 * @returns number 0~5 的星级。
 */
export function starsFromWer(value: number): number {
  if (value <= 0.15) return 5;
  if (value <= 0.3) return 4;
  if (value <= 0.45) return 3;
  if (value <= 0.6) return 2;
  if (value <= 0.85) return 1;
  return 0;
}

/**
 * 根据编辑距离计算准确率与星级。
 * @param expected 正确答案（通常是罗马音）。
 * @param actual 用户输入。
 * @returns { accuracy: number; stars: number; distance: number }
 */
export function computeQuizScore(expected: string, actual: string): {
  accuracy: number;
  stars: number;
  distance: number;
} {
  const normalizedExpected = normalizeInput(expected);
  const normalizedActual = normalizeInput(actual);
  if (!normalizedExpected.length) {
    return { accuracy: normalizedActual.length === 0 ? 1 : 0, stars: normalizedActual.length === 0 ? 5 : 0, distance: 0 };
  }
  const distance = levenshtein(normalizedExpected, normalizedActual);
  const werValue = Math.min(1, distance / normalizedExpected.length);
  const accuracy = Math.max(0, 1 - werValue);
  return { accuracy, stars: starsFromWer(werValue), distance };
}
