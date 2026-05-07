// Ticker registry — all per-frame side-effects register here.
const tickers = [];

export function registerTicker(fn) {
  tickers.push(fn);
}

export function runTickers(delta, elapsed) {
  for (const fn of tickers) fn(delta, elapsed);
}
