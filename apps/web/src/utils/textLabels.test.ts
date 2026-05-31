import { describe, expect, it } from 'vitest';
import { cleanDecorativeLabel } from './textLabels';

describe('cleanDecorativeLabel', () => {
  it('removes leading emoji and decorative symbols from labels', () => {
    expect(cleanDecorativeLabel('🏆 Top Scorers')).toBe('Top Scorers');
    expect(cleanDecorativeLabel(' ✈️ Away Team')).toBe('Away Team');
    expect(cleanDecorativeLabel('⚽ Match Results')).toBe('Match Results');
  });

  it('keeps plain labels unchanged', () => {
    expect(cleanDecorativeLabel('Season Management')).toBe('Season Management');
  });
});
