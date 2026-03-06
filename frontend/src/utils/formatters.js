/**
 * Currency formatter
 */
export const fmtZAR = (v) =>
  `R${Number(v).toFixed(2)}`;

/**
 * Price formatter
 */
export const fmtP = (p) =>
  Number(p).toFixed(2);

/**
 * Time formatter
 */
export const fmtTime = (t) =>
  new Date(t).toLocaleTimeString();