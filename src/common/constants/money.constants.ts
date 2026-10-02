export const MONEY_PRECISION = 10;
export const MONEY_SCALE = 2;

export const DEFAULT_CURRENCY = 'AMD';

// Decimal places actually usable per currency. AMD has no subunit in
// practice, so amounts must be whole numbers; add an entry here (no DB
// migration needed, columns already allow scale 2) if a currency/service
// that needs fractional amounts shows up later.
export const CURRENCY_DECIMALS: Record<string, number> = {
  AMD: 0,
};
