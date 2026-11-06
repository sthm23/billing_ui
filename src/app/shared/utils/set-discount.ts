/**
 * Distribution of a discount on a whole set (rental booking) over its lines.
 * The algorithm is fixed in docs/features/rental.md#set-discount-distribution
 * and must stay identical in billing-mobile — do not change one without the other.
 */
export interface DiscountLine {
  /** Unit price (item: rentPricePerDay × days; service: its price), whole sums */
  unitPrice: number;
  /** Service: 1 */
  quantity: number;
}

const STEP = 1000;
const floorStep = (x: number) => Math.floor(x / STEP) * STEP;

/**
 * Per-unit discount for each line (for a service: the discount of the service).
 * Lines in cart order: items first, then services. Throws if the target is
 * above the base total or below zero.
 */
export function distributeSetDiscount(lines: DiscountLine[], target: number): number[] {
  const base = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const discount = base - target;
  if (discount < 0 || discount > base) throw new Error('Invalid total');
  const sale = lines.map(() => 0);
  if (lines.length === 0 || discount === 0) return sale;

  // 3. A remainder goes round the lines from the first one, whole sums
  const place = (amount: number) => {
    for (let i = 0, idle = 0; amount > 0 && idle < lines.length; i = (i + 1) % lines.length) {
      const { unitPrice, quantity } = lines[i];
      const add = Math.min(unitPrice - sale[i], Math.floor(amount / quantity));
      if (add > 0) {
        sale[i] += add;
        amount -= add * quantity;
        idle = 0;
      } else {
        idle++;
      }
    }
  };

  const units = lines.reduce((s, l) => s + l.quantity, 0);
  const perUnit = floorStep(discount / units);
  if (lines.every((l) => l.unitPrice >= perUnit)) {
    // 1. Evenly per unit
    sale.fill(perUnit);
    place(discount - perUnit * units);
  } else {
    // 2. Evenly per position; a line cheaper than its share becomes free, the rest moves on
    const perLine = floorStep(discount / lines.length);
    let carry = 0;
    lines.forEach(({ unitPrice, quantity }, i) => {
      const want = perLine + carry;
      sale[i] = Math.min(unitPrice, floorStep(want / quantity));
      carry = want - sale[i] * quantity;
    });
    place(carry + discount - perLine * lines.length);
  }
  return sale;
}
