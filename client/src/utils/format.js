// Shared formatting utilities

export const fmtCurrency = (n) =>
  `₹${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtCurrencyRound = (n) =>
  `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const fmtDate = (d, opts = {}) =>
  new Date(d).toLocaleDateString('en-IN', opts);

export const fmtTime = (d, opts = { hour: '2-digit', minute: '2-digit' }) =>
  new Date(d).toLocaleTimeString('en-IN', opts);
