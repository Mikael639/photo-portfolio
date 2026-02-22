const GLOBAL_STORE_KEY = "__photo_portfolio_contact_store__";

function getStore() {
  if (!globalThis[GLOBAL_STORE_KEY]) {
    globalThis[GLOBAL_STORE_KEY] = [];
  }

  return globalThis[GLOBAL_STORE_KEY];
}

export function addContactMessage(payload) {
  const store = getStore();
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };

  store.unshift(message);
  return message;
}

export function listContactMessages() {
  return getStore();
}
