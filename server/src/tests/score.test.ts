/**
 * @file 针对评分算法的单元测试，确保编辑距离、WER 与星级映射符合预期。
 */

import { describe, expect, it } from 'vitest';

import { levenshtein, wer, starsFromWer, scoreUtterance } from '../lib/score.js';

describe('score utilities', () => {
  it('computes levenshtein distance for varying inputs', () => {
    expect(levenshtein('kana', 'kana')).toBe(0);
    expect(levenshtein('kana', 'kana ')).toBe(1);
    expect(levenshtein('かな', 'かなー')).toBe(1);
  });

  it('computes WER with expected bounds', () => {
    expect(wer('これは ペン です', 'これは ペン です')).toBe(0);
    expect(wer('これは ペン です', 'これは ペン')).toBeGreaterThan(0);
    expect(wer('これは ペン です', 'これは ペン')).toBeLessThanOrEqual(1);
  });

  it('maps wer to stars with defined thresholds', () => {
    expect(starsFromWer(0.1)).toBe(5);
    expect(starsFromWer(0.3)).toBe(4);
    expect(starsFromWer(0.55)).toBe(2);
    expect(starsFromWer(0.9)).toBe(0);
  });

  it('produces consistent scoreUtterance summary', () => {
    const result = scoreUtterance('おはよう ございます', 'おはよう ございます~');
    expect(result.wer).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeCloseTo(1 - result.wer);
    expect(result.stars).toBeGreaterThanOrEqual(0);
  });
});
