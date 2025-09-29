/**
 * @file 评分相关算法，包括编辑距离、词错误率（WER）与星级映射。
 */

/**
 * 计算两个字符串的 Levenshtein 编辑距离。
 * @param a 源字符串。
 * @param b 目标字符串。
 * @returns number 编辑距离，表示从 a 转换到 b 需要的最少操作数。
 * @example
 * ```ts
 * const distance = levenshtein('kana', 'kana'); // 0
 * ```
 * @description 算法采用经典动态规划，时间复杂度 O(m*n)，空间复杂度 O(m*n)。对于短字符串性能充足，若需进一步优化可改用滚动数组。
 */
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
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }

  return matrix[a.length][b.length];
}

/**
 * 计算词错误率（Word Error Rate, WER）。
 * @param reference 标准文本（通常是老师或标准答案）。
 * @param hypothesis 待评测的识别文本。
 * @returns number 范围 0~1 的错误率，0 代表完全匹配。
 * @example
 * ```ts
 * const value = wer('これは ペン です', 'これは ペン です'); // 0
 * ```
 * @description 在日语场景建议预先处理全角空格、顿号等标点，并按空格或假名切分；若语料未分词，可考虑引入形态学分析以提升准确度。
 */
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
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }

  return Math.min(1, matrix[refWords.length][hypWords.length] / refWords.length);
}

/**
 * 根据 WER 计算星级评分。
 * @param value 词错误率。
 * @returns 0|1|2|3|4|5 星级整数。
 * @example
 * ```ts
 * const stars = starsFromWer(0.2); // 4
 * ```
 * @description 阈值来源于内部体验：0.15 以下视为完美，依次向下递减，>0.85 直接给出 0 星提醒重新练习。
 */
export function starsFromWer(value: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (value <= 0.15) return 5;
  if (value <= 0.3) return 4;
  if (value <= 0.45) return 3;
  if (value <= 0.6) return 2;
  if (value <= 0.85) return 1;
  return 0;
}

export interface ScoreResult {
  /** WER 数值 */
  wer: number;
  /** 星级结果 */
  stars: 0 | 1 | 2 | 3 | 4 | 5;
  /** 归一化得分（1-wer） */
  score: number;
}

/**
 * 综合计算评分结果。
 * @param reference 参考文本。
 * @param hypothesis 实际识别文本。
 * @returns ScoreResult 包含 WER、星级与归一化得分。
 * @description 归一化得分用于前端展示百分比，可直接乘以 100 转换为百分制。
 */
export function scoreUtterance(reference: string, hypothesis: string): ScoreResult {
  const value = wer(reference, hypothesis);
  const stars = starsFromWer(value);
  return {
    wer: value,
    stars,
    score: Math.max(0, 1 - value),
  };
}
