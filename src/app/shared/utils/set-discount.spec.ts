import { DiscountLine, distributeSetDiscount } from './set-discount';

// Examples of docs/features/rental.md#set-discount-distribution:
// dress, suit, 2 shoes, 3 jewelry, makeup; base 8 700 000
const lines = (jewelry: number, makeup: number): DiscountLine[] => [
  { unitPrice: 4_000_000, quantity: 1 },
  { unitPrice: 3_000_000, quantity: 1 },
  { unitPrice: 300_000, quantity: 2 },
  { unitPrice: jewelry, quantity: 3 },
  { unitPrice: makeup, quantity: 1 },
];
const total = (l: DiscountLine[], sale: number[]) =>
  l.reduce((s, x, i) => s + (x.unitPrice - sale[i]) * x.quantity, 0);

describe('distributeSetDiscount', () => {
  it('spreads the discount evenly per unit', () => {
    const l = lines(100_000, 800_000);
    const sale = distributeSetDiscount(l, 8_500_000);
    expect(sale).toEqual([25_000, 25_000, 25_000, 25_000, 25_000]);
    expect(total(l, sale)).toBe(8_500_000);
  });

  it('rounds down to 1 000 and puts the remainder on the first line', () => {
    const l = lines(100_000, 800_000);
    const sale = distributeSetDiscount(l, 8_494_500);
    expect(sale).toEqual([30_500, 25_000, 25_000, 25_000, 25_000]);
    expect(total(l, sale)).toBe(8_494_500);
  });

  it('switches to positions and carries what a cheap line cannot take', () => {
    const l = lines(10_000, 1_070_000);
    const sale = distributeSetDiscount(l, 8_500_000);
    // 40 000 per position; jewelry is free (3 × 10 000), its 10 000 go to makeup
    expect(sale).toEqual([40_000, 40_000, 20_000, 10_000, 50_000]);
    expect(total(l, sale)).toBe(8_500_000);
  });

  it('carries the rest of the last line round to the first one', () => {
    const l: DiscountLine[] = [
      { unitPrice: 500_000, quantity: 1 },
      { unitPrice: 5_000, quantity: 1 },
    ];
    // 2 units, 50 000 each > 5 000 → positions: 50 000 each, the second takes 5 000
    const sale = distributeSetDiscount(l, 405_000);
    expect(sale).toEqual([95_000, 5_000]);
    expect(total(l, sale)).toBe(405_000);
  });

  it('returns zeros without a discount and rejects a total above the base', () => {
    expect(distributeSetDiscount(lines(100_000, 800_000), 8_700_000)).toEqual([0, 0, 0, 0, 0]);
    expect(() => distributeSetDiscount(lines(100_000, 800_000), 8_700_001)).toThrow();
  });
});
