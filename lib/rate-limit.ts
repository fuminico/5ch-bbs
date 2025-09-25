type Bucket = {
  timestamps: number[];
};

const WINDOW_DEFAULT = 30_000;
const LIMIT_DEFAULT = 3;

declare global {
  // eslint-disable-next-line no-var
  var rateLimiterStore: Map<string, Bucket> | undefined;
}

const store = (global.rateLimiterStore = global.rateLimiterStore ?? new Map<string, Bucket>());

export function isRateLimited(key: string, limit = LIMIT_DEFAULT, windowMs = WINDOW_DEFAULT) {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };
  const filtered = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (filtered.length >= limit) {
    store.set(key, { timestamps: filtered });
    return true;
  }

  filtered.push(now);
  store.set(key, { timestamps: filtered });
  return false;
}
