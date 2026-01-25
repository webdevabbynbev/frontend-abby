const SESSION_KEY = "auth_session";

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getToken() {
  return null;
}

export function hasSession() {
  if (!hasStorage()) return false;
  return window.localStorage.getItem(SESSION_KEY) === "true";
}

export function setToken(token) {
  void token;
  if (!hasStorage()) return;
  window.localStorage.setItem(SESSION_KEY, "true");
}

export function refreshTokenTtl() {
}

export function clearToken() {
  if (!hasStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
}