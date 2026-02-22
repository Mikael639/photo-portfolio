const GLOBAL_RATE_LIMIT_KEY = "__photo_portfolio_rate_limit__";

function getRateLimitStore() {
  if (!globalThis[GLOBAL_RATE_LIMIT_KEY]) {
    globalThis[GLOBAL_RATE_LIMIT_KEY] = new Map();
  }

  return globalThis[GLOBAL_RATE_LIMIT_KEY];
}

export function consumeRateLimit(key, { limit, windowMs }) {
  const store = getRateLimitStore();
  const now = Date.now();
  const value = store.get(key);

  if (!value || now >= value.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (value.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, value.resetAt - now),
    };
  }

  value.count += 1;
  store.set(key, value);

  return {
    allowed: true,
    remaining: Math.max(0, limit - value.count),
    retryAfterMs: 0,
  };
}
