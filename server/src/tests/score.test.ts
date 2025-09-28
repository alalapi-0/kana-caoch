import { describe, expect, it } from 'vitest';

import { levenshtein, wer, starsFromWer, scoreUtterance } from '../lib/score.js';

describe('score utilities', () => {
  it('computes levenshtein distance for simple strings', () => {
    expect(levenshtein('kana', 'kana')).toBe(0);
    expect(levenshtein('kana', 'kana ')).toBe(1);
    expect(levenshtein('kana', 'kana-ko')).toBe(3);
  });

  it('computes WER with expected bounds', () => {
    expect(wer('これは ペン です', 'これは ペン です')).toBe(0);
    expect(wer('これは ペン です', 'これは ペン')).toBeGreaterThan(0);
    expect(wer('これは ペン です', 'これは ペン')).toBeLessThanOrEqual(1);
  });

  it('maps wer to stars and score consistently', () => {
    const { stars, score } = scoreUtterance('おはよう', 'おはよう');
    expect(stars).toBe(5);
    expect(score).toBe(1);
    expect(starsFromWer(0.5)).toBe(2);
  });
});
