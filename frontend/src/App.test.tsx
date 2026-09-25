import { describe, it, expect } from 'vitest';
import { colors } from './theme/tokens';

describe('IQ English Corporate Identity & Brand Tokens', () => {
  it('has correct Pantone 294 C primary color', () => {
    expect(colors.primary).toBe('#002e6d');
  });

  it('has correct Pantone 2915 C secondary color', () => {
    expect(colors.secondary).toBe('#5eb3e4');
  });

  it('has correct Pantone 7544 C neutral color', () => {
    expect(colors.neutralCaption).toBe('#758592');
  });

  it('has correct Gold Accent color', () => {
    expect(colors.accentMain).toBe('#dca41a');
  });
});
